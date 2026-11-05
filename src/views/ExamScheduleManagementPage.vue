<template>
  <div class="page stack">
    <section class="card filters filters-wrap">
      <select v-model="grade" class="select" aria-label="年级">
        <option value="">全部年级</option>
        <option v-for="item in grades" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="examType" class="select" aria-label="考试类型">
        <option value="">全部类型</option>
        <option v-for="item in examTypes" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="isPublic" class="select" aria-label="是否公开">
        <option value="">全部公开状态</option>
        <option value="true">公开</option>
        <option value="false">不公开</option>
      </select>
      <select v-model="status" class="select" aria-label="状态">
        <option value="">全部状态</option>
        <option value="NORMAL">正常</option>
        <option value="CANCELLED">已取消</option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索考试 / 科目" @keyup.enter="load" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="canWrite" class="btn btn-primary" type="button" @click="openCreate">+ 新增</button>
    </section>

    <div class="status-legend">
      <span>状态</span>
      <span class="pill pill-ok">正常</span>
      <span class="pill pill-muted">已取消</span>
    </div>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>考试</th>
              <th>科目</th>
              <th>类型</th>
              <th>年级 / 班级</th>
              <th>时间</th>
              <th>公开</th>
              <th>状态</th>
              <th v-if="canWrite" class="ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="canWrite ? 8 : 7" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td :colspan="canWrite ? 8 : 7" class="muted">没有符合条件的考试安排</td>
            </tr>
            <tr
              v-for="item in rows"
              v-else
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.subject || '—' }}</td>
              <td>{{ item.examType || '—' }}</td>
              <td>{{ item.gradeClass }}</td>
              <td class="num">{{ timeText(item) }}</td>
              <td><span class="pill" :class="item.isPublic ? 'pill-info' : 'pill-muted'">{{ item.isPublic ? '公开' : '不公开' }}</span></td>
              <td><span class="pill" :class="item.status === 'NORMAL' ? 'pill-ok' : 'pill-muted'">{{ item.status === 'NORMAL' ? '正常' : '已取消' }}</span></td>
              <td v-if="canWrite" class="ops">
                <button class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button v-if="item.status === 'NORMAL'" class="linkish" type="button" @click.stop="cancelExam(item)">取消</button>
                <button class="link-danger" type="button" @click.stop="removeExam(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>共 {{ total }} 场考试 · 显示 {{ rangeText }}</span>
        <div class="pager">
          <button type="button" :disabled="page === 1" @click="page -= 1">上一页</button>
          <template v-for="(n, index) in pageList" :key="n">
            <span v-if="index > 0 && n - pageList[index - 1] > 1">…</span>
            <button type="button" :class="{ active: n === page }" @click="page = n">{{ n }}</button>
          </template>
          <button type="button" :disabled="page === pageCount" @click="page += 1">下一页</button>
        </div>
      </div>
    </section>

    <section class="card preview-card">
      <h2>表单预览</h2>
      <div v-if="preview" class="preview-grid">
        <div><span class="k">考试</span><span class="v">{{ preview.name || '—' }}</span></div>
        <div><span class="k">科目</span><span class="v">{{ preview.subject || '—' }}</span></div>
        <div><span class="k">类型</span><span class="v">{{ preview.examType || '—' }}</span></div>
        <div><span class="k">年级</span><span class="v">{{ preview.gradeName || '—' }}</span></div>
        <div><span class="k">班级</span><span class="v">{{ preview.className || '—' }}</span></div>
        <div><span class="k">开始</span><span class="v num">{{ formatDateTime(preview.startTime) }}</span></div>
        <div><span class="k">结束</span><span class="v num">{{ formatDateTime(preview.endTime) }}</span></div>
        <div><span class="k">公开</span><span class="v">{{ preview.isPublic ? '公开' : '不公开' }}</span></div>
        <div><span class="k">状态</span><span class="v">{{ preview.status === 'CANCELLED' ? '已取消' : '正常' }}</span></div>
        <div><span class="k">备注</span><span class="v">{{ preview.remark || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一场考试，或点击新增后在这里预览。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑考试安排' : '新增考试安排' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">考试名称</label>
          <input v-model="editor.name" class="field" required />
          <div class="form-row">
            <div>
              <label class="field-label">科目</label>
              <input v-model="editor.subject" class="field" required />
            </div>
            <div>
              <label class="field-label">类型</label>
              <select v-model="editor.examType" class="select" required>
                <option v-for="item in examTypes" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div>
              <label class="field-label">年级</label>
              <select v-model="editor.gradeName" class="select">
                <option value="">不限</option>
                <option v-for="item in grades" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">班级</label>
              <input v-model="editor.className" class="field" placeholder="可选" />
            </div>
          </div>
          <div class="form-row">
            <div>
              <label class="field-label">开始</label>
              <input v-model="editor.startTime" class="field" type="datetime-local" required />
            </div>
            <div>
              <label class="field-label">结束</label>
              <input v-model="editor.endTime" class="field" type="datetime-local" required />
            </div>
          </div>
          <label class="check"><input v-model="editor.isPublic" type="checkbox" /> 向学生公开这场考试</label>
          <label class="field-label">备注</label>
          <textarea v-model="editor.remark" class="textarea"></textarea>
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
import { canWriteExam } from '../access.js'
import { createExam, deleteExam, fetchExamPage, toExamPayload, updateExam } from '../api/exam.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { formatDateTime, toInputDateTime } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const grades = ['高一', '高二', '高三']
const examTypes = ['月考', '期中', '期末']
const grade = ref('')
const examType = ref('')
const isPublic = ref('')
const status = ref('')
const keyword = ref('')
const page = ref(1)
const pageSize = 10
const total = ref(0)
const rows = ref([])
const loading = ref(false)
const loadError = ref('')
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
const canWrite = computed(() => canWriteExam(auth.user))

function netHint(message) {
  return String(message).split('；').every((part) => part === '网络不可用' || part === '服务暂不可用')
}

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const pageList = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1).filter((n) => {
  return n === 1 || n === pageCount.value || Math.abs(n - page.value) <= 1
}))
const rangeText = computed(() => {
  if (!total.value) return '0-0'
  const from = (page.value - 1) * pageSize + 1
  const to = Math.min(page.value * pageSize, total.value)
  return `${from}-${to}`
})
const preview = computed(() => {
  if (editor.value) return editor.value
  return rows.value.find((item) => item.id === selectedId.value) || rows.value[0] || null
})

function timeText(item) {
  const start = formatDateTime(item.startTime)
  const end = formatDateTime(item.endTime)
  if (start === '—' && end === '—') return '—'
  if (end === '—') return start
  return `${start} – ${end.slice(11)}`
}

function publicParam() {
  if (isPublic.value === 'true') return true
  if (isPublic.value === 'false') return false
  return undefined
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await fetchExamPage({
      page: page.value,
      pageSize,
      grade: grade.value || undefined,
      examType: examType.value || undefined,
      isPublic: publicParam(),
      status: status.value || undefined,
      keyword: keyword.value.trim() || undefined
    })
    rows.value = result.records
    total.value = result.total
    if (!rows.value.some((item) => item.id === selectedId.value)) selectedId.value = rows.value[0]?.id || ''
  } catch (error) {
    rows.value = []
    total.value = 0
    loadError.value = error.message || '考试安排加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(page, load)
watch([grade, examType, isPublic, status, keyword], () => {
  if (page.value !== 1) page.value = 1
  else load()
})

function blankForm() {
  return {
    id: '',
    name: '',
    subject: '',
    examType: '月考',
    gradeName: '',
    className: '',
    startTime: '',
    endTime: '',
    isPublic: true,
    status: 'NORMAL',
    remark: ''
  }
}

function openCreate() {
  formError.value = ''
  editor.value = blankForm()
}

function openEdit(item) {
  formError.value = ''
  editor.value = {
    ...item,
    startTime: toInputDateTime(item.startTime),
    endTime: toInputDateTime(item.endTime)
  }
}

async function save() {
  formError.value = ''
  if (editor.value.endTime && editor.value.startTime && editor.value.endTime < editor.value.startTime) {
    formError.value = '结束时间不能早于开始时间'
    return
  }
  const payload = toExamPayload(editor.value)
  try {
    if (editor.value.id) await updateExam(editor.value.id, payload)
    else await createExam(payload)
    ui.toast('考试安排已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  }
}

async function cancelExam(item) {
  if (!window.confirm(`取消「${item.name}」？取消后学生将不再看到这场考试。`)) return
  try {
    await updateExam(item.id, toExamPayload({ ...item, status: 'CANCELLED' }))
    ui.toast('考试已取消', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '取消失败', 'error')
  }
}

async function removeExam(item) {
  if (!window.confirm(`删除「${item.name}」？`)) return
  try {
    await deleteExam(item.id)
    ui.toast('考试安排已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}
</script>
