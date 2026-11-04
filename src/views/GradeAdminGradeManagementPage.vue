<template>
  <div class="page stack">
    <section class="card filters">
      <select v-model="adminId" class="select">
        <option value="">请选择年级管理员</option>
        <option v-for="item in admins" :key="item.id" :value="String(item.id)">
          {{ item.name }}{{ item.placeholder ? '（占位）' : '' }}
        </option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索年级 / 院系" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('org:write')" class="btn btn-primary" type="button" @click="openCreate">+ 新增关联</button>
    </section>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>年级</th>
              <th>院系</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="!adminId">
              <td colspan="5" class="muted">请选择年级管理员</td>
            </tr>
            <tr v-else-if="usingPlaceholder">
              <td colspan="5" class="muted">{{ PLACEHOLDER_ROW }}</td>
            </tr>
            <tr v-else-if="!filtered.length">
              <td colspan="5" class="muted">暂无数据</td>
            </tr>
            <template v-else>
            <tr
              v-for="item in filtered"
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td>{{ item.grade || '—' }}</td>
              <td>{{ item.department || '—' }}</td>
              <td>{{ item.description || '—' }}</td>
              <td class="num">{{ item.createdAt }}</td>
              <td>
                <button v-if="auth.can('org:write')" class="link-danger" type="button" @click.stop="remove(item)">删除</button>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      <TablePager :summary="summary" :page="page" :page-count="pageCount" :page-list="pageList" @update:page="page = $event" />
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <div v-if="preview" class="preview-grid">
        <div><span class="k">年级</span><span class="v">{{ preview.grade || '—' }}</span></div>
        <div><span class="k">院系</span><span class="v">{{ preview.department || '—' }}</span></div>
        <div><span class="k">描述</span><span class="v">{{ preview.description || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击新增，这里显示年级、院系和描述。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>新增年级管理员关联</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">年级</label>
          <input v-model="editor.grade" class="field" placeholder="年级（如：高中一年级）" />
          <label class="field-label">院系</label>
          <input v-model="editor.department" class="field" placeholder="院系（可选）" />
          <label class="field-label">描述</label>
          <textarea v-model="editor.description" class="textarea" rows="3" placeholder="描述（可选）"></textarea>
          <p v-if="adminPlaceholder" class="field-help">当前管理员来自本地占位名单，保存需要后端接口。</p>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="editor = null">取消</button>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import TablePager from '../components/TablePager.vue'
import { createGradeAdminGrade, deleteGradeAdminGrade, getGradeAdminGradeList } from '../api/gradeAdminGrade.js'
import { getUserList } from '../api/user.js'
import { PLACEHOLDER_ROW, acceptResult, actionError, formatDate, readRecords, useListShell } from '../composables/useListShell.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const ui = useUiStore()
const admins = ref([])
const adminId = ref('')
const keyword = ref('')
const rows = ref([])
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
const booted = ref(false)
const {
  page,
  loading,
  loadError,
  usingPlaceholder,
  pageCount,
  pageList,
  summary,
  netHint,
  markPlaceholder,
  markReady,
  pageSize
} = useListShell()

const adminPlaceholder = computed(() => admins.value.some((item) => item.placeholder && String(item.id) === adminId.value))
const filtered = computed(() => {
  const query = keyword.value.trim()
  if (!query) return rows.value
  return rows.value.filter((item) => `${item.grade}${item.department}${item.description}`.includes(query))
})
const preview = computed(() => editor.value || filtered.value.find((item) => item.id === selectedId.value) || null)

function localAdmins() {
  return auth.accounts
    .filter((item) => item.role === 'ADMIN')
    .map((item) => ({ id: item.id, name: `${item.name} · ${item.account}`, placeholder: true }))
}

async function loadAdmins() {
  try {
    const result = acceptResult(await getUserList({ page: 1, size: 200, userType: 3 }))
    const parsed = readRecords(result)
    admins.value = parsed.records.map((item) => ({
      id: item.id,
      name: item.realName || item.name || item.username || item.account || String(item.id),
      placeholder: false
    }))
  } catch {
    admins.value = localAdmins()
  }
  if (!adminId.value && admins.value[0]) adminId.value = String(admins.value[0].id)
}

function mapRow(raw) {
  return {
    id: raw.id,
    grade: raw.grade || raw.gradeName || '',
    department: raw.department || '',
    description: raw.description || '',
    createdAt: formatDate(raw.createdAt || raw.createTime)
  }
}

async function load() {
  if (!adminId.value) {
    rows.value = []
    loading.value = false
    usingPlaceholder.value = false
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const result = acceptResult(await getGradeAdminGradeList(adminId.value, { page: page.value, size: pageSize }))
    const parsed = readRecords(result)
    rows.value = parsed.records.map(mapRow)
    markReady(parsed.total)
  } catch (error) {
    rows.value = []
    markPlaceholder(error)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  formError.value = ''
  if (!adminId.value) {
    ui.toast('请先选择年级管理员', 'error')
    return
  }
  editor.value = { grade: '', department: '', description: '' }
}

async function save() {
  formError.value = ''
  try {
    await createGradeAdminGrade(adminId.value, {
      grade: editor.value.grade.trim() || null,
      department: editor.value.department.trim() || null,
      description: editor.value.description.trim() || null
    })
    ui.toast('关联已创建', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = actionError(error, '网络不可用，未写入后端')
  }
}

async function remove(item) {
  if (!window.confirm('删除这条年级管理员关联？')) return
  try {
    await deleteGradeAdminGrade(adminId.value, item.id)
    ui.toast('已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(actionError(error, '网络不可用，未删除'), 'error')
  }
}

onMounted(async () => {
  await loadAdmins()
  booted.value = true
  await load()
})
watch(page, () => {
  if (booted.value) load()
})
watch(adminId, () => {
  if (!booted.value) return
  selectedId.value = ''
  if (page.value !== 1) page.value = 1
  else load()
})
</script>
