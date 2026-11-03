<template>
  <div class="page stack">
    <section class="card filters">
      <select v-model="teacherId" class="select">
        <option value="">请选择教师</option>
        <option v-for="item in teachers" :key="item.id" :value="String(item.id)">
          {{ item.name }}{{ item.placeholder ? '（占位）' : '' }}
        </option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索年级 / 班级 / 科目" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('org:write')" class="btn btn-primary" type="button" @click="openCreate">+ 新增关联</button>
    </section>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>年级</th>
              <th>班级</th>
              <th>科目</th>
              <th>是否班主任</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="!teacherId">
              <td colspan="6" class="muted">请选择教师</td>
            </tr>
            <tr v-else-if="usingPlaceholder">
              <td colspan="6" class="muted">{{ PLACEHOLDER_ROW }}</td>
            </tr>
            <tr v-else-if="!filtered.length">
              <td colspan="6" class="muted">暂无数据</td>
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
              <td>{{ item.className || '—' }}</td>
              <td>{{ item.subject || '—' }}</td>
              <td>{{ item.isClassTeacher ? '是' : '否' }}</td>
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
        <div><span class="k">班级</span><span class="v">{{ preview.className || '—' }}</span></div>
        <div><span class="k">科目</span><span class="v">{{ preview.subject || '—' }}</span></div>
        <div><span class="k">是否班主任</span><span class="v">{{ preview.isClassTeacher ? '是' : '否' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击新增，这里显示年级、班级、科目和是否班主任。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>新增教师班级关联</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">年级</label>
          <input v-model="editor.grade" class="field" placeholder="年级（如：高中一年级）" />
          <label class="field-label">班级</label>
          <input v-model="editor.className" class="field" placeholder="班级（如：高中一年级1班）" />
          <label class="field-label">科目</label>
          <input v-model="editor.subject" class="field" placeholder="科目（如：数学）" />
          <label class="field-label">是否班主任</label>
          <select v-model="editor.isClassTeacher" class="select">
            <option value="0">否</option>
            <option value="1">是</option>
          </select>
          <p v-if="teacherPlaceholder" class="field-help">当前教师来自本地占位名单，保存需要后端接口。</p>
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
import { createTeacherClass, deleteTeacherClass, getTeacherClassList } from '../api/teacherClass.js'
import { getUserList } from '../api/user.js'
import { PLACEHOLDER_ROW, acceptResult, actionError, formatDate, readRecords, useListShell } from '../composables/useListShell.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const ui = useUiStore()
const teachers = ref([])
const teacherId = ref('')
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

const teacherPlaceholder = computed(() => teachers.value.some((item) => item.placeholder && String(item.id) === teacherId.value))
const filtered = computed(() => {
  const query = keyword.value.trim()
  if (!query) return rows.value
  return rows.value.filter((item) => `${item.grade}${item.className}${item.subject}`.includes(query))
})
const preview = computed(() => {
  if (editor.value) {
    return { ...editor.value, isClassTeacher: editor.value.isClassTeacher === '1' }
  }
  return filtered.value.find((item) => item.id === selectedId.value) || null
})

function localTeachers() {
  return auth.accounts
    .filter((item) => item.role === 'TEACHER')
    .map((item) => ({ id: item.id, name: `${item.name} · ${item.account}`, placeholder: true }))
}

async function loadTeachers() {
  try {
    const result = acceptResult(await getUserList({ page: 1, size: 200, userType: 2 }))
    const parsed = readRecords(result)
    teachers.value = parsed.records.map((item) => ({
      id: item.id,
      name: item.realName || item.name || item.username || String(item.id),
      placeholder: false
    }))
  } catch {
    teachers.value = localTeachers()
  }
  if (auth.user?.role === 'TEACHER') {
    const self = teachers.value.find((item) => String(item.id) === String(auth.user.id) || item.name.includes(auth.user.name))
    if (self) teacherId.value = String(self.id)
  }
  if (!teacherId.value && teachers.value[0]) teacherId.value = String(teachers.value[0].id)
}

function mapRow(raw) {
  return {
    id: raw.id,
    grade: raw.grade || raw.gradeName || '',
    className: raw.className || raw.classNameFull || '',
    subject: raw.subject || raw.courseName || '',
    isClassTeacher: raw.isClassTeacher === 1 || raw.isClassTeacher === true || raw.headTeacher === 1,
    createdAt: formatDate(raw.createdAt || raw.createTime)
  }
}

async function load() {
  if (!teacherId.value) {
    rows.value = []
    loading.value = false
    usingPlaceholder.value = false
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const result = acceptResult(await getTeacherClassList(teacherId.value, { page: page.value, size: pageSize }))
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
  if (!teacherId.value) {
    ui.toast('请先选择教师', 'error')
    return
  }
  editor.value = { grade: '', className: '', subject: '', isClassTeacher: '0' }
}

async function save() {
  formError.value = ''
  try {
    await createTeacherClass(teacherId.value, {
      grade: editor.value.grade.trim() || null,
      className: editor.value.className.trim() || null,
      subject: editor.value.subject.trim() || null,
      isClassTeacher: editor.value.isClassTeacher === '1' ? 1 : 0
    })
    ui.toast('关联已创建', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = actionError(error, '网络不可用，未写入后端')
  }
}

async function remove(item) {
  if (!window.confirm('删除这条教师班级关联？')) return
  try {
    await deleteTeacherClass(teacherId.value, item.id)
    ui.toast('已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(actionError(error, '网络不可用，未删除'), 'error')
  }
}

onMounted(async () => {
  await loadTeachers()
  booted.value = true
  await load()
})
watch(page, () => {
  if (booted.value) load()
})
watch(teacherId, () => {
  if (!booted.value) return
  selectedId.value = ''
  if (page.value !== 1) page.value = 1
  else load()
})
</script>
