<template>
  <div class="page stack">
    <section class="card filters">
      <input v-model="userId" class="field num" inputmode="numeric" placeholder="用户ID" />
      <input v-model="roleId" class="field num" inputmode="numeric" placeholder="角色ID" />
      <select v-model="dataType" class="select">
        <option value="">全部</option>
        <option v-for="item in DATA_TYPES" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('user:write')" class="btn btn-primary" type="button" @click="openCreate">+ 新增权限配置</button>
    </section>

    <div class="status-legend">
        <span>状态</span>
        <button
          v-for="item in DATA_TYPES"
          :key="item.value"
          type="button"
          class="pill pill-info legend-btn"
          :class="{ 'pill-on': dataType === item.value }"
          @click="toggleType(item.value)"
        >
          {{ item.label }}
        </button>
    </div>
    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>用户ID</th>
              <th>角色ID</th>
              <th>数据类型</th>
              <th>查询范围</th>
              <th>范围值</th>
              <th>可导出</th>
              <th>可打印</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="usingPlaceholder">
              <td colspan="9" class="muted">{{ PLACEHOLDER_ROW }}</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="9" class="muted">暂无数据</td>
            </tr>
            <template v-else>
            <tr
              v-for="item in rows"
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td class="num">{{ item.userId ?? '—' }}</td>
              <td class="num">{{ item.roleId ?? '—' }}</td>
              <td>{{ typeLabel(item.dataType) }}</td>
              <td>{{ scopeLabel(item.queryScope) }}</td>
              <td>{{ item.scopeValue || '—' }}</td>
              <td>{{ item.canExport ? '是' : '否' }}</td>
              <td>{{ item.canPrint ? '是' : '否' }}</td>
              <td><span class="pill" :class="item.status === '启用' ? 'pill-on' : 'pill-ok'">{{ item.status }}</span></td>
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
        <div><span class="k">用户ID</span><span class="v num">{{ preview.userId || '—' }}</span></div>
        <div><span class="k">角色ID</span><span class="v num">{{ preview.roleId || '—' }}</span></div>
        <div><span class="k">数据类型</span><span class="v">{{ typeLabel(preview.dataType) }}</span></div>
        <div><span class="k">查询范围</span><span class="v">{{ scopeLabel(preview.queryScope) }}</span></div>
        <div><span class="k">范围值</span><span class="v">{{ preview.scopeValue || '—' }}</span></div>
        <div><span class="k">字段权限</span><span class="v">{{ preview.fieldPermissions || '—' }}</span></div>
        <div><span class="k">可导出</span><span class="v">{{ flagLabel(preview.canExport) }}</span></div>
        <div><span class="k">可打印</span><span class="v">{{ flagLabel(preview.canPrint) }}</span></div>
        <div><span class="k">状态</span><span class="v">{{ preview.status || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一行或点击新增，这里显示查询范围和数据类型。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑权限配置' : '新增权限配置' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <div class="form-row">
            <div>
              <label class="field-label">用户ID</label>
              <input v-model="editor.userId" class="field num" inputmode="numeric" placeholder="用户ID（可选）" />
            </div>
            <div>
              <label class="field-label">角色ID</label>
              <input v-model="editor.roleId" class="field num" inputmode="numeric" placeholder="角色ID（可选）" />
            </div>
          </div>
          <p class="field-help">用户ID和角色ID至少填写一个。</p>
          <label class="field-label">数据类型</label>
          <select v-model="editor.dataType" class="select" required>
            <option value="">请选择</option>
            <option v-for="item in DATA_TYPES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <label class="field-label">查询范围</label>
          <select v-model="editor.queryScope" class="select" required>
            <option value="">请选择</option>
            <option v-for="item in SCOPES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <label class="field-label">范围值</label>
          <input v-model="editor.scopeValue" class="field" placeholder="当查询范围为年级或班级时，填写对应的ID" />
          <label class="field-label">字段权限</label>
          <textarea v-model="editor.fieldPermissions" class="textarea" rows="3" placeholder="JSON格式，定义可访问的字段列表"></textarea>
          <label class="check"><input v-model="editor.canExport" type="checkbox" /> 可导出</label>
          <label class="check"><input v-model="editor.canPrint" type="checkbox" /> 可打印</label>
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
import { createDataPermission, deleteDataPermission, getDataPermissionList, updateDataPermission } from '../api/dataPermission.js'
import { PLACEHOLDER_ROW, acceptResult, actionError, readRecords, useListShell } from '../composables/useListShell.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const DATA_TYPES = [
  { value: 'STUDENT', label: '学生' },
  { value: 'CLASS', label: '班级' },
  { value: 'GRADE', label: '年级' },
  { value: 'SCORE', label: '成绩' },
  { value: 'ATTENDANCE', label: '考勤' },
  { value: 'COURSE', label: '课程' }
]
const SCOPES = [
  { value: 'ALL', label: '全部' },
  { value: 'GRADE', label: '年级' },
  { value: 'CLASS', label: '班级' },
  { value: 'SELF', label: '自己' }
]

const auth = useAuthStore()
const ui = useUiStore()
const userId = ref('')
const roleId = ref('')
const dataType = ref('')
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

const preview = computed(() => editor.value || rows.value.find((item) => item.id === selectedId.value) || null)

function typeLabel(value) {
  return DATA_TYPES.find((item) => item.value === value)?.label || value || '—'
}

function scopeLabel(value) {
  return SCOPES.find((item) => item.value === value)?.label || value || '—'
}

function flagLabel(value) {
  if (value === true || value === 1 || value === '1' || value === '是') return '是'
  if (value === false || value === 0 || value === '0' || value === '否') return '否'
  return value || '—'
}

function mapRow(raw) {
  const enabled = raw.status === 1 || raw.status === '1' || raw.status === '启用' || raw.status === undefined
  return {
    id: raw.id,
    userId: raw.userId ?? '',
    roleId: raw.roleId ?? '',
    dataType: raw.dataType || '',
    queryScope: raw.queryScope || '',
    scopeValue: raw.scopeValue || '',
    fieldPermissions: typeof raw.fieldPermissions === 'string' ? raw.fieldPermissions : (raw.fieldPermissions ? JSON.stringify(raw.fieldPermissions) : ''),
    canExport: raw.canExport === 1 || raw.canExport === true,
    canPrint: raw.canPrint === 1 || raw.canPrint === true,
    status: enabled ? '启用' : '禁用'
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = acceptResult(await getDataPermissionList({
      page: page.value,
      size: pageSize,
      userId: userId.value.trim() || undefined,
      roleId: roleId.value.trim() || undefined,
      dataType: dataType.value || undefined
    }))
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

function toggleType(value) {
  dataType.value = dataType.value === value ? '' : value
}

function blankEditor() {
  return {
    id: '',
    userId: '',
    roleId: '',
    dataType: '',
    queryScope: '',
    scopeValue: '',
    fieldPermissions: '',
    canExport: false,
    canPrint: false,
    status: '启用'
  }
}

function openCreate() {
  formError.value = ''
  editor.value = blankEditor()
}

function openEdit(item) {
  formError.value = ''
  editor.value = { ...item }
}

async function save() {
  formError.value = ''
  if (!String(editor.value.userId || '').trim() && !String(editor.value.roleId || '').trim()) {
    formError.value = '用户ID和角色ID至少填写一个'
    return
  }
  const body = {
    userId: editor.value.userId ? Number(editor.value.userId) : null,
    roleId: editor.value.roleId ? Number(editor.value.roleId) : null,
    dataType: editor.value.dataType,
    queryScope: editor.value.queryScope,
    scopeValue: editor.value.scopeValue.trim() || null,
    fieldPermissions: editor.value.fieldPermissions.trim() || null,
    canExport: editor.value.canExport ? 1 : 0,
    canPrint: editor.value.canPrint ? 1 : 0,
    status: editor.value.status === '禁用' ? 0 : 1
  }
  try {
    if (editor.value.id) await updateDataPermission(editor.value.id, body)
    else await createDataPermission(body)
    ui.toast('权限配置已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = actionError(error, '网络不可用，未写入后端')
  }
}

async function remove(item) {
  if (!window.confirm('删除这条数据查询权限？')) return
  try {
    await deleteDataPermission(item.id)
    ui.toast('已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(actionError(error, '网络不可用，未删除'), 'error')
  }
}

onMounted(load)
watch(page, load)
watch([userId, roleId, dataType], () => {
  if (page.value !== 1) page.value = 1
  else load()
})
</script>

<style scoped>
.legend-btn {
  border: 0;
  cursor: pointer;
  font-family: inherit;
}

.status-legend {
  flex-wrap: wrap;
}
</style>
