<template>
  <div class="page stack">
    <template v-if="personal">
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <section class="card table-card">
        <div class="table-scroll">
          <table class="data">
            <thead>
              <tr>
                <th>日期</th>
                <th>课程</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in personalRows" :key="item.key">
                <td class="num">{{ item.date }}</td>
                <td>
                  {{ item.courseName }}
                  <small v-if="!item.courseId" class="muted"> · 未关联课程</small>
                </td>
                <td><span class="pill" :class="pillOf(item.status)">{{ ATTENDANCE_LABEL[item.status] }}</span></td>
              </tr>
              <tr v-if="!personalRows.length">
                <td colspan="3" class="muted">还没有考勤记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template v-else>
      <div class="seg">
        <button type="button" :class="{ active: tab === 'summary' }" @click="tab = 'summary'">班级日报汇总</button>
        <button type="button" :class="{ active: tab === 'anomaly' }" @click="tab = 'anomaly'">异常明细</button>
      </div>

      <section v-if="activeSummary" class="stats-4">
        <article class="card stat"><p class="label">应到</p><p class="figure num">{{ activeSummary.expected }}</p></article>
        <article class="card stat"><p class="label">实到</p><p class="figure num">{{ activeSummary.actual }}</p></article>
        <article class="card stat"><p class="label">请假 / 迟到</p><p class="figure num">{{ activeSummary.leaveOrLate }}</p></article>
        <article class="card stat"><p class="label">旷课</p><p class="figure num" :class="{ warn: activeSummary.absent }">{{ activeSummary.absent }}</p></article>
      </section>

      <section class="card filters">
        <select v-model="className" class="select">
          <option value="">全部班级</option>
          <option v-for="item in classOptions" :key="item.id" :value="item.name">{{ item.name }}</option>
        </select>
        <input v-model="date" class="field" type="date" />
        <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
        <button v-if="canRecord && tab === 'anomaly'" class="btn btn-primary" type="button" @click="openRecord()">补录</button>
      </section>

      <section class="card table-card">
        <div class="table-scroll">
          <table v-if="tab === 'summary'" class="data">
            <thead>
              <tr>
                <th>日期</th>
                <th>班级</th>
                <th>课程</th>
                <th>应到</th>
                <th>实到</th>
                <th>请假 / 迟到</th>
                <th>旷课</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in summaryRows" :key="item.id" class="row-pick" :class="{ picked: pickedKey === item.id }" @click="pickedKey = item.id; className = item.className">
                <td class="num">{{ item.date }}</td>
                <td>{{ item.className }}</td>
                <td>
                  {{ item.courseName }}
                  <small v-if="!item.courseId" class="muted"> · 未关联课程</small>
                </td>
                <td class="num">{{ item.summary.expected }}</td>
                <td class="num">{{ item.summary.actual }}</td>
                <td class="num">{{ item.summary.leaveOrLate }}</td>
                <td class="num">{{ item.summary.absent }}</td>
              </tr>
              <tr v-if="!summaryRows.length">
                <td colspan="7" class="muted">这一天还没有日报</td>
              </tr>
            </tbody>
          </table>
          <table v-else class="data">
            <thead>
              <tr>
                <th>日期</th>
                <th>学号</th>
                <th>姓名</th>
                <th>班级</th>
                <th>课程</th>
                <th>类型</th>
                <th v-if="canRecord">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in anomalies" :key="item.key" class="row-pick" :class="{ picked: pickedKey === item.key }" @click="pickedKey = item.key">
                <td class="num">{{ item.date }}</td>
                <td class="num">{{ item.studentNo }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.className }}</td>
                <td>{{ item.courseName }}</td>
                <td><span class="pill" :class="pillOf(item.status)">{{ exceptionLabel(item) }}</span></td>
                <td v-if="canRecord">
                  <button class="linkish" type="button" @click.stop="openRecord(item)">编辑</button>
                </td>
              </tr>
              <tr v-if="!anomalies.length">
                <td :colspan="canRecord ? 7 : 6" class="muted">没有异常记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <section v-if="!personal" class="card preview-card">
      <h2>表单预览</h2>
      <form v-if="recorder" class="form-grid form-band" @submit.prevent="saveRecord">
        <p class="sub span-all" style="margin: 0">{{ recorder.id ? '编辑异常' : '补录异常' }}。班级日报汇总只读。</p>
        <div>
          <label class="field-label">班级</label>
          <select v-model="recorder.classId" class="select" @change="fillRoster">
            <option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">日期</label>
          <input v-model="recorder.date" class="field" type="date" />
        </div>
        <div>
          <label class="field-label">学生</label>
          <select v-model="recorder.studentId" class="select">
            <option v-for="item in recorder.students" :key="item.id" :value="item.id">{{ item.studentNo }} {{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">类型</label>
          <select v-model="recorder.exceptionType" class="select">
            <option v-for="item in EXCEPTION_TYPES" :key="item" :value="item">{{ EXCEPTION_LABEL[item] }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">课程</label>
          <select v-model="recorder.courseId" class="select">
            <option value="">不关联课程</option>
            <option v-for="item in courseChoices" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div>
          <label class="field-label">说明</label>
          <input v-model="recorder.reason" class="field" />
        </div>
        <p v-if="formError" class="span-all" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
        <div class="form-actions span-all">
          <button class="btn btn-ghost" type="button" @click="recorder = null">取消</button>
          <button class="btn btn-primary" type="submit" :disabled="saving">保存</button>
        </div>
      </form>
      <div v-else-if="preview && preview.kind === 'anomaly'" class="preview-grid">
        <div><span class="k">日期</span><span class="v num">{{ preview.date || '—' }}</span></div>
        <div><span class="k">学号</span><span class="v num">{{ preview.studentNo || '—' }}</span></div>
        <div><span class="k">姓名</span><span class="v">{{ preview.name || '—' }}</span></div>
        <div><span class="k">班级</span><span class="v">{{ preview.className || '—' }}</span></div>
        <div><span class="k">课程</span><span class="v">{{ preview.courseName || '—' }}</span></div>
        <div><span class="k">类型</span><span class="v">{{ exceptionLabel(preview) }}</span></div>
      </div>
      <div v-else-if="preview" class="preview-grid">
        <div><span class="k">日期</span><span class="v num">{{ preview.date || '—' }}</span></div>
        <div><span class="k">班级</span><span class="v">{{ preview.className || '—' }}</span></div>
        <div><span class="k">课程</span><span class="v">{{ preview.courseName || '—' }}</span></div>
        <div><span class="k">应到</span><span class="v num">{{ preview.expected ?? '—' }}</span></div>
        <div><span class="k">实到</span><span class="v num">{{ preview.actual ?? '—' }}</span></div>
        <div><span class="k">请假 / 迟到</span><span class="v num">{{ preview.leaveOrLate ?? '—' }}</span></div>
        <div><span class="k">旷课</span><span class="v num">{{ preview.absent ?? '—' }}</span></div>
      </div>
      <p v-else class="sub">选择一条日报。异常补录会显示在这里。</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createAttendanceRecord, fetchRecords, fetchSummaries, updateAttendanceRecord } from '../api/attendance.js'
import { fetchCourses } from '../api/course.js'
import { fetchClasses, fetchStudentPage } from '../api/student.js'
import { EXCEPTION_LABEL, EXCEPTION_TYPES, attendanceRecordPayload, validateAttendanceRecord } from '../domain/writePayloads.js'
import { useViewport } from '../composables/useViewport.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { ATTENDANCE_LABEL, isLoadHint, scopeLabel, todayISO } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const { isMobile } = useViewport()
const tab = ref('summary')
const pickedKey = ref('')
const className = ref('')
const date = ref(todayISO())
const recorder = ref(null)
const loadError = ref('')
const formError = ref('')
const saving = ref(false)

function netHint(message) {
  return isLoadHint(message)
}

function exceptionLabel(item) {
  return EXCEPTION_LABEL[item.exceptionType] || ATTENDANCE_LABEL[item.status] || item.status || '—'
}
const summaries = ref([])
const records = ref([])
const classOptions = ref([])
const courses = ref([])

const personal = computed(() => auth.user?.role === 'STUDENT')
const canRecord = computed(() => !isMobile.value && !personal.value && auth.can('attendance:record'))
const scopeText = computed(() => scopeLabel(auth.user, classOptions.value.map((item) => item.name)))
const summaryRows = computed(() => summaries.value.filter((item) => {
  const classOk = !className.value || item.className === className.value
  const dateOk = !date.value || String(item.date).slice(0, 10) === date.value
  return classOk && dateOk
}))
const activeSummary = computed(() => summaryRows.value[0]?.summary || null)
const courseChoices = computed(() => courses.value.map((item) => ({ id: item.id, name: item.name })))
const anomalies = computed(() => records.value.filter((item) => {
  const classOk = !className.value || item.className === className.value
  const dateOk = !date.value || String(item.date).slice(0, 10) === date.value
  return classOk && dateOk && item.status !== 'present'
}))
const personalRows = computed(() => records.value)
const preview = computed(() => {
  if (tab.value === 'anomaly') {
    const row = anomalies.value.find((item) => item.key === pickedKey.value) || anomalies.value[0]
    return row ? { kind: 'anomaly', ...row } : null
  }
  const row = summaryRows.value.find((item) => item.id === pickedKey.value) || summaryRows.value[0]
  if (!row) return null
  return {
    kind: 'summary',
    date: row.date,
    className: row.className,
    courseName: row.courseName,
    expected: row.summary.expected,
    actual: row.summary.actual,
    leaveOrLate: row.summary.leaveOrLate,
    absent: row.summary.absent
  }
})

function pillOf(status) {
  if (status === 'present') return 'pill-ok'
  if (status === 'absent') return 'pill-warn'
  return 'pill-info'
}

async function load() {
  loadError.value = ''
  const errors = []
  const params = {
    className: className.value || undefined,
    attendanceDate: date.value || undefined
  }
  try {
    summaries.value = await fetchSummaries(params)
  } catch (error) {
    summaries.value = []
    errors.push(error.message || '考勤汇总加载失败')
  }
  try {
    records.value = await fetchRecords({
      ...params,
      studentNo: personal.value ? auth.user?.studentNo || auth.user?.account : undefined
    })
  } catch (error) {
    records.value = []
    errors.push(error.message || '考勤明细加载失败')
  }
  loadError.value = errors.join('；')
}

onMounted(async () => {
  try {
    classOptions.value = await fetchClasses()
  } catch {
    classOptions.value = []
  }
  try {
    courses.value = await fetchCourses()
  } catch {
    courses.value = []
  }
  await load()
})

watch([className, date], () => {
  load()
})

async function rosterOf(classId) {
  const cls = classOptions.value.find((item) => String(item.id) === String(classId))
  const result = await fetchStudentPage({ page: 1, size: 200, className: cls?.name, keyword: undefined })
  return result.records.filter((item) => !cls?.name || item.className === cls.name || item.classId === cls.id)
}

async function fillRoster() {
  if (!recorder.value) return
  try {
    const students = await rosterOf(recorder.value.classId)
    recorder.value.students = students
    if (!students.some((item) => String(item.id) === String(recorder.value.studentId))) {
      recorder.value.studentId = students[0]?.id || ''
    }
  } catch (error) {
    recorder.value.students = []
    formError.value = error.message || '学生名册加载失败'
  }
}

async function openRecord(item) {
  formError.value = ''
  const cls = classOptions.value.find((row) => row.name === item?.className) || classOptions.value[0]
  recorder.value = {
    id: item?.id || '',
    classId: item?.classId || cls?.id || '',
    date: item?.date ? String(item.date).slice(0, 10) : date.value || todayISO(),
    studentId: item?.studentId || '',
    courseId: item?.courseId || '',
    exceptionType: EXCEPTION_TYPES.includes(item?.exceptionType) ? item.exceptionType : 'ABSENT',
    reason: item?.reason || '',
    students: []
  }
  tab.value = 'anomaly'
  await fillRoster()
}

async function saveRecord() {
  formError.value = ''
  const cls = classOptions.value.find((item) => String(item.id) === String(recorder.value.classId))
  const form = {
    ...recorder.value,
    className: cls?.name || '',
    grade: cls?.grade || ''
  }
  const errors = validateAttendanceRecord(form)
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  saving.value = true
  try {
    const payload = attendanceRecordPayload(form)
    if (form.id) await updateAttendanceRecord(form.id, payload)
    else await createAttendanceRecord(payload)
    className.value = form.className
    date.value = form.date
    recorder.value = null
    ui.toast(form.id ? '异常记录已更新' : '异常已补录', 'success')
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

watch(() => route.query.record, (value) => {
  if (value && canRecord.value) openRecord()
  if (value && isMobile.value) ui.toast('请用电脑办理', 'info')
}, { immediate: true })
</script>
