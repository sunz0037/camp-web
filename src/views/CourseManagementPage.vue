<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>课程与排课</h1>
        <p>课程库与班级授课。节次记为开始节次至结束节次。</p>
        <p class="scope-line">数据范围 · {{ scopeText }}</p>
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
        <option v-for="item in campus.grades" :key="item">{{ item }}</option>
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
            <tr v-for="item in campus.courses" :key="item.id">
              <td class="num">{{ item.id }}</td>
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
            <option v-for="item in campus.courses" :key="item.id" :value="item.id">{{ item.name }}</option>
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
import { computed, ref } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import ScheduleBoard from '../components/ScheduleBoard.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { useUiStore } from '../stores/ui.js'
import { periodLabel, scopeLabel, weekdayLabel } from '../utils/format.js'

const auth = useAuthStore()
const campus = useCampusStore()
const ui = useUiStore()
const tab = ref('schedules')
const grade = ref('')
const className = ref('')
const keyword = ref('')
const courseEditor = ref(null)
const scheduleEditor = ref(null)
const formError = ref('')

const classOptions = computed(() => {
  if (auth.user?.role === 'TEACHER') return campus.classesFor(auth.user)
  return campus.classes
})
const scopeText = computed(() => scopeLabel(auth.user, classOptions.value.map((item) => item.name)))

const visibleSchedules = computed(() => {
  const query = keyword.value.trim()
  const scope = new Set(classOptions.value.map((item) => item.name))
  return campus.schedules.filter((item) => {
    if (auth.user?.role === 'TEACHER' && item.teacher !== auth.user.name && !scope.has(item.className)) return false
    const cls = campus.classes.find((row) => row.name === item.className)
    if (grade.value && cls?.grade !== grade.value) return false
    if (className.value && item.className !== className.value) return false
    const text = `${item.name}${item.teacher}${item.roomNo}`
    return !query || text.includes(query)
  })
})

const mine = computed(() => campus.schedulesFor(auth.user))

function lessonsOf(courseId) {
  return campus.schedules
    .filter((item) => item.courseId === courseId)
    .reduce((sum, item) => sum + (item.periodEnd - item.periodStart + 1), 0)
}

function openCourse() {
  formError.value = ''
  courseEditor.value = { code: '', name: '' }
}

function openSchedule(item) {
  formError.value = ''
  scheduleEditor.value = item
    ? { ...item, courseId: item.courseId || '' }
    : {
        courseId: campus.courses[0]?.id || '',
        name: '',
        className: classOptions.value[0]?.name || '',
        teacher: auth.user?.name || '',
        weekday: 1,
        periodStart: 1,
        periodEnd: 2,
        roomNo: ''
      }
}

function saveCourse() {
  try {
    campus.saveCourse(courseEditor.value)
    ui.toast('课程已保存', 'success')
    courseEditor.value = null
  } catch (error) {
    formError.value = error.message
  }
}

function saveSchedule() {
  try {
    campus.saveSchedule(scheduleEditor.value)
    ui.toast('排课已保存', 'success')
    scheduleEditor.value = null
  } catch (error) {
    formError.value = error.message
  }
}
</script>
