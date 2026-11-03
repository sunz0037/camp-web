<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>课程与排课</h1>
        <p>课程库与班级授课。节次记为开始节次至结束节次。</p>
        <p class="scope-line">数据范围 · {{ scopeText }}</p>
        <p v-if="loadError" class="error-text">{{ loadError }}</p>
      </div>
      <div class="head-actions">
        <button v-if="auth.can('course:write') && tab === 'library'" class="btn btn-primary" type="button" @click="openCourse()">新增课程</button>
        <button v-if="auth.can('course:write') && tab === 'schedules'" class="btn btn-primary" type="button" @click="openSchedule()">新增排课</button>
      </div>
    </header>

    <div class="seg">
      <button type="button" :class="{ active: tab === 'schedules' }" @click="tab = 'schedules'">班级授课</button>
      <button type="button" :class="{ active: tab === 'library' }" @click="tab = 'library'">课程库</button>
      <button type="button" :class="{ active: tab === 'week' }" @click="tab = 'week'">周课表</button>
    </div>

    <section v-if="tab === 'schedules'" class="card filters">
      <select v-model="grade" class="select">
        <option value="">全部年级</option>
        <option v-for="item in gradeOptions" :key="item">{{ item }}</option>
      </select>
      <select v-model="className" class="select">
        <option value="">全部班级</option>
        <option v-for="item in classOptions" :key="item.id" :value="item.name">{{ item.name }}</option>
      </select>
      <input v-model="keyword" class="field" placeholder="搜索课程 / 教师 / 教室" />
    </section>

    <section v-if="tab === 'schedules'" class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>课程</th>
              <th>班级</th>
              <th>教师</th>
              <th>星期</th>
              <th>节次</th>
              <th>教室</th>
              <th v-if="auth.can('course:write')">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleSchedules" :key="item.id">
              <td>
                {{ item.name }}
                <small v-if="!item.courseId" class="muted"> · 未关联课程</small>
              </td>
              <td>{{ item.className }}</td>
              <td>{{ item.teacher }}</td>
              <td>{{ weekdayLabel(item.weekday) }}</td>
              <td class="num">{{ periodLabel(item.periodStart, item.periodEnd) }}</td>
              <td class="num">{{ item.roomNo }}</td>
              <td v-if="auth.can('course:write')">
                <button class="linkish" type="button" @click="openSchedule(item)">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else-if="tab === 'library'" class="card table-card">
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>课程编号</th>
              <th>课程名称</th>
              <th>已排课时</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in courses" :key="item.id">
              <td class="num">{{ item.code || item.id }}</td>
              <td>{{ item.name }}</td>
              <td class="num">{{ lessonsOf(item.id) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="card block">
      <h2 style="margin-bottom: 12px">我的课表</h2>
      <ScheduleBoard :items="mine" />
    </section>

    <div v-if="courseEditor" class="modal-mask" @click.self="courseEditor = null">
      <form class="modal-card" @submit.prevent="saveCourse">
        <div class="modal-head">
          <h3>新增课程</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="courseEditor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">课程编号</label>
          <input v-model="courseEditor.code" class="field" placeholder="例如 CHEM-01" required />
          <label class="field-label">课程名称</label>
          <input v-model="courseEditor.name" class="field" required />
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="scheduleEditor" class="modal-mask" @click.self="scheduleEditor = null">
      <form class="modal-card" @submit.prevent="saveSchedule">
        <div class="modal-head">
          <h3>{{ scheduleEditor.id ? '编辑排课' : '新增排课' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="scheduleEditor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">课程</label>
          <select v-model="scheduleEditor.courseId" class="select">
            <option value="">不关联课程</option>
            <option v-for="item in courses" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <label v-if="!scheduleEditor.courseId" class="field-label">名称</label>
          <input v-if="!scheduleEditor.courseId" v-model="scheduleEditor.name" class="field" placeholder="例如班会" />
          <div class="form-row">
            <div>
              <label class="field-label">班级</label>
              <select v-model="scheduleEditor.className" class="select">
                <option v-for="item in classOptions" :key="item.id" :value="item.name">{{ item.name }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">教师</label>
              <input v-model="scheduleEditor.teacher" class="field" :readonly="auth.user?.role === 'TEACHER'" />
            </div>
          </div>
          <div class="form-row">
            <div>
              <label class="field-label">星期</label>
              <select v-model="scheduleEditor.weekday" class="select">
                <option v-for="day in 7" :key="day" :value="day">{{ weekdayLabel(day) }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">教室</label>
              <input v-model="scheduleEditor.roomNo" class="field" required />
            </div>
          </div>
          <div class="form-row">
            <div>
              <label class="field-label">开始节次</label>
              <input v-model.number="scheduleEditor.periodStart" class="field num" type="number" min="1" max="8" required />
            </div>
            <div>
              <label class="field-label">结束节次</label>
              <input v-model.number="scheduleEditor.periodEnd" class="field num" type="number" min="1" max="8" required />
            </div>
          </div>
          <p v-if="formError" class="error-text">{{ formError }}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" type="button" @click="scheduleEditor = null">取消</button>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import ScheduleBoard from '../components/ScheduleBoard.vue'
import { createClassCourse, createCourse, fetchClassCourses, fetchCourses, toClassCoursePayload, updateClassCourse } from '../api/course.js'
import { fetchClasses } from '../api/student.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { periodLabel, scopeLabel, weekdayLabel } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const tab = ref('schedules')
const grade = ref('')
const className = ref('')
const keyword = ref('')
const courseEditor = ref(null)
const scheduleEditor = ref(null)
const formError = ref('')
const loadError = ref('')
const courses = ref([])
const schedules = ref([])
const classOptions = ref([])

const gradeOptions = computed(() => [...new Set(classOptions.value.map((item) => item.grade).filter(Boolean))])
const scopeText = computed(() => scopeLabel(auth.user, classOptions.value.map((item) => item.name)))

const visibleSchedules = computed(() => {
  const query = keyword.value.trim()
  return schedules.value.filter((item) => {
    if (grade.value && item.grade && item.grade !== grade.value && !String(item.className).startsWith(grade.value)) return false
    if (className.value && item.className !== className.value) return false
    const text = `${item.name}${item.teacher}${item.roomNo}`
    return !query || text.includes(query)
  })
})

const mine = computed(() => {
  if (auth.user?.role === 'TEACHER') return schedules.value.filter((item) => item.teacher === auth.user.name)
  if (auth.user?.className) return schedules.value.filter((item) => item.className === auth.user.className)
  return schedules.value
})

function lessonsOf(courseId) {
  return schedules.value
    .filter((item) => String(item.courseId) === String(courseId))
    .reduce((sum, item) => sum + Math.max(0, item.periodEnd - item.periodStart + 1), 0)
}

async function load() {
  loadError.value = ''
  const errors = []
  try {
    courses.value = await fetchCourses()
  } catch (error) {
    courses.value = []
    errors.push(error.message || '课程加载失败')
  }
  try {
    schedules.value = await fetchClassCourses()
  } catch (error) {
    schedules.value = []
    errors.push(error.message || '班级授课加载失败')
  }
  try {
    classOptions.value = await fetchClasses()
  } catch {
    classOptions.value = []
  }
  loadError.value = errors.join('；')
}

onMounted(load)

function openCourse() {
  formError.value = ''
  courseEditor.value = { code: '', name: '' }
}

function openSchedule(item) {
  formError.value = ''
  scheduleEditor.value = item
    ? { ...item, courseId: item.courseId || '' }
    : {
        courseId: courses.value[0]?.id || '',
        name: '',
        className: classOptions.value[0]?.name || '',
        teacher: auth.user?.name || '',
        weekday: 1,
        periodStart: 1,
        periodEnd: 2,
        roomNo: ''
      }
}

async function saveCourse() {
  formError.value = ''
  try {
    await createCourse({
      courseCode: courseEditor.value.code.trim(),
      courseName: courseEditor.value.name.trim(),
      status: 1
    })
    ui.toast('课程已保存', 'success')
    courseEditor.value = null
    await load()
  } catch (error) {
    formError.value = error.message
  }
}

async function saveSchedule() {
  formError.value = ''
  const periodStart = Number(scheduleEditor.value.periodStart)
  const periodEnd = Number(scheduleEditor.value.periodEnd)
  if (!periodStart || !periodEnd || periodEnd < periodStart) {
    formError.value = '结束节次不能早于开始节次'
    return
  }
  try {
    const form = scheduleEditor.value
    const cls = classOptions.value.find((item) => item.name === form.className)
    form.classId = cls?.id || form.classId
    const siblings = form.id ? schedules.value.filter((row) => row.id === form.id) : []
    const payload = toClassCoursePayload(form, siblings)
    if (form.id) await updateClassCourse(form.id, payload)
    else await createClassCourse(payload)
    ui.toast('排课已保存', 'success')
    scheduleEditor.value = null
    await load()
  } catch (error) {
    formError.value = error.message
  }
}
</script>
