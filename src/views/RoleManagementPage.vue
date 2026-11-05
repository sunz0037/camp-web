<template>
  <div class="page stack">
    <section class="card filters">
      <input v-model="keyword" class="field" placeholder="搜索角色名称 / 代码" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('user:write')" class="btn btn-primary" type="button" @click="openCreate">+ 新增角色</button>
    </section>

    <div class="status-legend">
      <span>状态</span>
      <span class="pill pill-on">启用</span>
      <span class="pill pill-ok">禁用</span>
    </div>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>角色代码</th>
              <th>描述</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="muted">加载中…</td>
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
              <td>{{ item.roleName }}</td>
              <td class="num">{{ item.roleCode }}</td>
              <td>{{ item.description || '—' }}</td>
              <td><span class="pill" :class="item.status === '启用' ? 'pill-on' : 'pill-ok'">{{ item.status }}</span></td>
              <td class="num">{{ item.createdAt }}</td>
              <td>
                <button v-if="auth.can('user:write')" class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button v-if="auth.can('user:write')" class="link-danger" type="button" @click.stop="remove(item)">删除</button>
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
        <div><span class="k">角色名称</span><span class="v">{{ preview.roleName || '—' }}</span></div>
        <div><span class="k">角色代码</span><span class="v num">{{ preview.roleCode || '—' }}</span></div>
        <div><span class="k">描述</span><span class="v">{{ preview.description || '—' }}</span></div>
        <div><span class="k">状态</span><span class="v">{{ preview.status || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击新增，这里显示角色名称、角色代码和描述。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑角色' : '新增角色' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">角色名称</label>
          <input v-model="editor.roleName" class="field" required placeholder="如：系统管理员" />
          <label class="field-label">角色代码</label>
          <input v-model="editor.roleCode" class="field num" required placeholder="如：ADMIN" :readonly="Boolean(editor.id)" />
          <label class="field-label">角色描述</label>
          <textarea v-model="editor.description" class="textarea" rows="3" placeholder="请输入"></textarea>
          <label class="field-label">状态</label>
          <select v-model="editor.status" class="select">
            <option>启用</option>
            <option>禁用</option>
          </select>
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
import { createRole, deleteRole, getRoleList, updateRole } from '../api/role.js'
import { PLACEHOLDER_ROW, acceptResult, actionError, formatDate, readRecords, useListShell } from '../composables/useListShell.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const auth = useAuthStore()
const ui = useUiStore()
const keyword = ref('')
const rows = ref([])
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
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

const filtered = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return rows.value
  return rows.value.filter((item) => `${item.roleName}${item.roleCode}${item.description}`.toLowerCase().includes(query))
})

const preview = computed(() => {
  if (editor.value) return editor.value
  return filtered.value.find((item) => item.id === selectedId.value) || null
})

function mapRole(raw) {
  const enabled = raw.status === 1 || raw.status === '1' || raw.status === '启用'
  return {
    id: raw.id,
    roleName: raw.roleName || raw.name || '',
    roleCode: raw.roleCode || raw.code || '',
    description: raw.description || '',
    status: enabled || raw.status === undefined ? '启用' : '禁用',
    createdAt: formatDate(raw.createdAt || raw.createTime)
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = acceptResult(await getRoleList({ page: page.value, size: pageSize }))
    const parsed = readRecords(result)
    rows.value = parsed.records.map(mapRole)
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
  editor.value = { id: '', roleName: '', roleCode: '', description: '', status: '启用' }
}

function openEdit(item) {
  formError.value = ''
  editor.value = { ...item }
}

function payloadOf(form) {
  return {
    roleName: form.roleName.trim(),
    roleCode: form.roleCode.trim(),
    description: form.description.trim(),
    status: form.status === '禁用' ? 0 : 1
  }
}

async function save() {
  formError.value = ''
  try {
    const body = payloadOf(editor.value)
    if (editor.value.id) await updateRole(editor.value.id, body)
    else await createRole(body)
    ui.toast('角色已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = actionError(error, '网络不可用，未写入后端')
  }
}

async function remove(item) {
  if (!window.confirm(`删除角色「${item.roleName}」？`)) return
  try {
    await deleteRole(item.id)
    ui.toast('角色已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(actionError(error, '网络不可用，未删除'), 'error')
  }
}

onMounted(load)
watch(page, load)
watch(keyword, () => {
  if (page.value !== 1) page.value = 1
})
</script>
