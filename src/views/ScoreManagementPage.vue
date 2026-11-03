<template>
  <div class="page stack">
    <section class="card filters filters-wrap">
      <select v-model="examId" class="select" aria-label="考试">
        <option value="">全部考试</option>
        <option v-for="item in exams" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
      </select>
      <select v-model="classId" class="select" aria-label="班级">
        <option value="">全部班级</option>
        <option v-for="item in classes" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
      </select>
      <select v-if="canWrite" v-model="studentId" class="select" aria-label="学生">
        <option value="">全部学生</option>
        <option v-for="item in students" :key="item.id" :value="String(item.id)">{{ item.studentNo }} {{ item.name }}</option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索学号 / 姓名" @keyup.enter="load" />
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="canWrite" class="btn btn-primary" type="button" @click="openCreate">+ 录入</button>
    </section>

    <section class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>考试</th>
              <th>科目</th>
              <th>学号</th>
              <th>姓名</th>
              <th>班级</th>
              <th>分数</th>
              <th>等级</th>
              <th>录入人</th>
              <th>时间</th>
              <th v-if="canWrite" class="ops">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="canWrite ? 10 : 9" class="muted">加载中…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td :colspan="canWrite ? 10 : 9" class="muted">{{ canWrite ? '没有符合条件的成绩' : '还没有对你公开的成绩' }}</td>
            </tr>
            <tr
              v-for="item in rows"
              v-else
              :key="item.id"
              class="row-pick"
              :class="{ picked: selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <td>{{ item.examName || '—' }}</td>
              <td>{{ item.subject || '—' }}</td>
              <td class="num">{{ item.studentNo || '—' }}</td>
              <td>{{ item.studentName || '—' }}</td>
              <td>{{ item.className || '—' }}</td>
              <td class="num">{{ item.score === null ? '—' : item.score }}</td>
              <td>{{ item.gradeLevel || '—' }}</td>
              <td>{{ item.recordedByName || '—' }}</td>
              <td class="num">{{ formatDateTime(item.recordedAt) }}</td>
              <td v-if="canWrite" class="ops">
                <button class="linkish" type="button" @click.stop="openEdit(item)">编辑</button>
                <button class="link-danger" type="button" @click.stop="removeScore(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-foot">
        <span>共 {{ total }} 条成绩 · 显示 {{ rangeText }}</span>
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
        <div><span class="k">考试</span><span class="v">{{ previewExam }}</span></div>
        <div><span class="k">学生</span><span class="v">{{ previewStudent }}</span></div>
        <div><span class="k">分数</span><span class="v num">{{ preview.score === null || preview.score === '' ? '—' : preview.score }}</span></div>
        <div><span class="k">等级</span><span class="v">{{ preview.gradeLevel || '—' }}</span></div>
        <div><span class="k">班级</span><span class="v">{{ preview.className || '—' }}</span></div>
        <div><span class="k">录入人</span><span class="v">{{ preview.recordedByName || auth.user?.name || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一条成绩，或点击录入后在这里预览。</p>
    </section>

    <div v-if="editor" class="modal-mask" @click.self="editor = null">
      <form class="modal-card" @submit.prevent="save">
        <div class="modal-head">
          <h3>{{ editor.id ? '编辑成绩' : '录入成绩' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="editor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">考试</label>
          <select v-model="editor.examId" class="select" required>
            <option value="">请选择考试</option>
            <option v-for="item in exams" :key="item.id" :value="String(item.id)">{{ item.name }} · {{ item.subject }}</option>
          </select>
          <label class="field-label">学生</label>
          <select v-model="editor.studentId" class="select" required>
            <option value="">请选择学生</option>
            <option v-for="item in students" :key="item.id" :value="String(item.id)">{{ item.studentNo }} {{ item.name }}</option>
          </select>
          <div class="form-row">
            <div>
              <label class="field-label">分数</label>
              <input v-model="editor.score" class="field num" type="number" min="0" max="100" step="0.5" required />
            </div>
            <div>
              <label class="field-label">等级</label>
              <select v-model="editor.gradeLevel" class="select">
                <option value="">不填</option>
                <option v-for="item in levels" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>
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
import { canWriteScore } from '../access.js'
import { fetchExamPage } from '../api/exam.js'
import { createExamScore, deleteExamScore, fetchScorePage, toScorePayload, updateExamScore } from '../api/examScore.js'
import { fetchClasses, fetchStudentPage } from '../api/student.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { formatDateTime } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const levels = ['A', 'B', 'C', 'D', 'E']
const examId = ref('')
const classId = ref('')
const studentId = ref('')
const keyword = ref('')
const page = ref(1)
const pageSize = 10
const total = ref(0)
const rows = ref([])
const exams = ref([])
const classes = ref([])
const students = ref([])
const loading = ref(false)
const loadError = ref('')
const selectedId = ref('')
const editor = ref(null)
const formError = ref('')
const canWrite = computed(() => canWriteScore(auth.user))

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
const previewExam = computed(() => {
  if (!preview.value) return '—'
  if (preview.value.examName) return preview.value.examName
  const found = exams.value.find((item) => String(item.id) === String(preview.value.examId))
  return found?.name || '—'
})
const previewStudent = computed(() => {
  if (!preview.value) return '—'
  if (preview.value.studentName || preview.value.studentNo) {
    return `${preview.value.studentNo || ''} ${preview.value.studentName || ''}`.trim()
  }
  const found = students.value.find((item) => String(item.id) === String(preview.value.studentId))
  return found ? `${found.studentNo} ${found.name}` : '—'
})

async function loadOptions() {
  try {
    const result = await fetchExamPage({ page: 1, pageSize: 100 })
    exams.value = result.records
  } catch {
    exams.value = []
  }
  try {
    classes.value = await fetchClasses()
  } catch {
    classes.value = []
  }
  if (!canWrite.value) return
  try {
    const result = await fetchStudentPage({ page: 1, size: 100 })
    students.value = result.records
  } catch {
    students.value = []
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const result = await fetchScorePage({
      page: page.value,
      pageSize,
      examId: examId.value || undefined,
      classId: classId.value || undefined,
      studentId: canWrite.value ? (studentId.value || undefined) : undefined,
      keyword: keyword.value.trim() || undefined
    })
    rows.value = result.records
    total.value = result.total
    if (!rows.value.some((item) => item.id === selectedId.value)) selectedId.value = rows.value[0]?.id || ''
  } catch (error) {
    rows.value = []
    total.value = 0
    loadError.value = error.message || '成绩加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  await load()
})
watch(page, load)
watch([examId, classId, studentId, keyword], () => {
  if (page.value !== 1) page.value = 1
  else load()
})

function openCreate() {
  formError.value = ''
  editor.value = {
    id: '',
    examId: examId.value || (exams.value[0] ? String(exams.value[0].id) : ''),
    studentId: '',
    score: '',
    gradeLevel: ''
  }
}

function openEdit(item) {
  formError.value = ''
  editor.value = {
    id: item.id,
    examId: item.examId ? String(item.examId) : '',
    studentId: item.studentId ? String(item.studentId) : '',
    score: item.score ?? '',
    gradeLevel: item.gradeLevel || '',
    examName: item.examName,
    studentNo: item.studentNo,
    studentName: item.studentName,
    className: item.className,
    recordedByName: item.recordedByName
  }
}

async function save() {
  formError.value = ''
  const score = Number(editor.value.score)
  if (Number.isNaN(score) || score < 0 || score > 100) {
    formError.value = '分数需在 0 到 100 之间'
    return
  }
  const payload = toScorePayload(editor.value)
  try {
    if (editor.value.id) await updateExamScore(editor.value.id, payload)
    else await createExamScore(payload)
    ui.toast('成绩已保存', 'success')
    editor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  }
}

async function removeScore(item) {
  const who = item.studentName || item.studentNo || '该学生'
  if (!window.confirm(`删除${who}的这条成绩？`)) return
  try {
    await deleteExamScore(item.id)
    ui.toast('成绩已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}
</script>
