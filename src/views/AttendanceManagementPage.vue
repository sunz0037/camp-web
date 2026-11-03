<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>{{ isMobile || auth.user?.role === 'STUDENT' ? '我的考勤' : '考勤管理' }}</h1>
        <p>{{ isMobile || auth.user?.role === 'STUDENT' ? '只读查看。登记日报请用电脑办理。' : '班级日报汇总与异常明细。课程可以不关联。' }}</p>
        <p class="scope-line">数据范围 · {{ scopeText }}</p>
        <p v-if="loadError" class="error-text">{{ loadError }}</p>
      </div>
      <button v-if="canRecord" class="btn btn-primary" type="button" @click="openRecord()">登记今日考勤</button>
    </header>

    <template v-if="personal">
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
              <tr v-for="item in summaryRows" :key="item.id" @click="className = item.className">
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in anomalies" :key="item.key">
                <td class="num">{{ item.date }}</td>
                <td class="num">{{ item.studentNo }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.className }}</td>
                <td>{{ item.courseName }}</td>
                <td><span class="pill" :class="pillOf(item.status)">{{ ATTENDANCE_LABEL[item.status] }}</span></td>
              </tr>
              <tr v-if="!anomalies.length">
                <td colspan="6" class="muted">没有异常记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <section v-if="!personal" class="card preview-card">
      <h2>表单预览</h2>
      <dl v-if="preview" class="dl">
        <dt>日期</dt><dd class="num">{{ preview.date || '—' }}</dd>
        <dt>班级</dt><dd>{{ preview.className || '—' }}</dd>
        <dt>课程</dt><dd>{{ preview.courseName || '—' }}</dd>
        <dt>应到 / 实到</dt><dd class="num">{{ preview.expected ?? '—' }} / {{ preview.actual ?? '—' }}</dd>
      </dl>
      <p v-else class="sub">选择一条日报，或登记后在这里预览。</p>
    </section>

    <div v-if="recorder" class="modal-mask" @click.self="recorder = null">
      <form class="modal-card" style="width: min(720px, 100%)" @submit.prevent="saveRecord">
        <div class="modal-head">
          <h3>登记今日考勤</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="recorder = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-row">
          <div>
            <label class="field-label">班级</label>
            <select v-model="recorder.className" class="select" @change="fillRoster">
              <option v-for="item in classOptions" :key="item.id" :value="item.name">{{ item.name }}</option>
            </select>
          </div>
          <div>
            <label class="field-label">日期</label>
            <input v-model="recorder.date" class="field" type="date" />
          </div>
        </div>
        <label class="field-label" style="margin-top: 12px">课程</label>
        <select v-model="recorder.courseKey" class="select">
          <option value="">不关联课程</option>
          <option v-for="item in courseChoices" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
        <div class="table-scroll" style="margin-top: 12px; max-height: 360px">
          <table class="data">
            <thead>
              <tr>
                <th>学号</th>
                <th>姓名</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in recorder.rows" :key="row.studentId">
                <td class="num">{{ row.studentNo }}</td>
                <td>{{ row.name }}</td>
                <td>
                  <select v-model="row.status" class="select">
                    <option value="present">出勤</option>
                    <option value="leave">请假</option>
                    <option value="late">迟到</option>
                    <option value="absent">旷课</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" type="button" @click="recorder = null">取消</button>
          <button class="btn btn-primary" type="submit">提交日报</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { createSummary, fetchRecords, fetchSummaries } from '../api/attendance.js'
import { fetchCourses } from '../api/course.js'
import { fetchClasses, fetchStudentPage } from '../api/student.js'
import { useViewport } from '../composables/useViewport.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { ATTENDANCE_LABEL, scopeLabel, todayISO } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const { isMobile } = useViewport()
const tab = ref('summary')
const className = ref('')
const date = ref(todayISO())
const recorder = ref(null)
const loadError = ref('')
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
  if (recorder.value) {
    const counts = { present: 0, leave: 0, late: 0, absent: 0 }
    recorder.value.rows.forEach((row) => {
      if (counts[row.status] !== undefined) counts[row.status] += 1
    })
    return {
      date: recorder.value.date,
      className: recorder.value.className,
      courseName: courseChoices.value.find((item) => String(item.id) === String(recorder.value.courseKey))?.name || '班级日报',
      expected: recorder.value.rows.length,
      actual: counts.present
    }
  }
  const row = summaryRows.value[0]
  if (!row) return null
  return { date: row.date, className: row.className, courseName: row.courseName, expected: row.summary.expected, actual: row.summary.actual }
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

async function rosterOf(name) {
  const result = await fetchStudentPage({ page: 1, size: 200, className: name, keyword: undefined })
  return result.records
    .filter((item) => item.status === '在读' || item.status === '—')
    .map((item) => ({ studentId: item.id, studentNo: item.studentNo, name: item.name, status: 'present' }))
}

async function fillRoster() {
  if (!recorder.value) return
  try {
    recorder.value.rows = await rosterOf(recorder.value.className)
  } catch (error) {
    ui.toast(error.message || '学生名册加载失败', 'error')
  }
}

async function openRecord() {
  const name = classOptions.value[0]?.name || ''
  recorder.value = {
    className: name,
    date: todayISO(),
    courseKey: '',
    rows: []
  }
  if (name) await fillRoster()
}

async function saveRecord() {
  const course = courseChoices.value.find((item) => String(item.id) === String(recorder.value.courseKey))
  const counts = { present: 0, leave: 0, late: 0, absent: 0 }
  recorder.value.rows.forEach((row) => {
    if (counts[row.status] !== undefined) counts[row.status] += 1
  })
  try {
    await createSummary({
      attendanceDate: recorder.value.date,
      className: recorder.value.className,
      courseId: course?.id || null,
      courseName: course?.name || '班级日报',
      expectedCount: recorder.value.rows.length,
      presentCount: counts.present,
      leaveCount: counts.leave,
      lateCount: counts.late,
      absentCount: counts.absent
    })
    className.value = recorder.value.className
    date.value = recorder.value.date
    recorder.value = null
    ui.toast('考勤日报已提交', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '提交失败', 'error')
  }
}

watch(() => route.query.record, (value) => {
  if (value && canRecord.value) openRecord()
  if (value && isMobile.value) ui.toast('请用电脑办理', 'info')
}, { immediate: true })
</script>
