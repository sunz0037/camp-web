<template>
  <div class="page stack">
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
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('course:write')" class="btn btn-primary" type="button" @click="openSchedule()">+ 新增</button>
    </section>

    <section v-else-if="tab === 'library'" class="card filters">
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
      <button v-if="auth.can('course:write')" class="btn btn-primary" type="button" @click="openCourse()">+ 新增</button>
    </section>
    <p v-else-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>

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
            <tr v-for="item in visibleSchedules" :key="`${item.id}-${item.sessionIndex}`" class="row-pick" :class="{ picked: pickedScheduleId === scheduleKey(item) }" @click="pickedScheduleId = scheduleKey(item)">
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
                <button class="linkish" type="button" @click.stop="openSchedule(item)">编辑</button>
                <button class="link-danger" type="button" @click.stop="removeSchedule(item)">删除</button>
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
              <th v-if="auth.can('course:write')">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in courses" :key="item.id" class="row-pick" :class="{ picked: pickedCourseId === item.id }" @click="pickedCourseId = item.id">
              <td class="num">{{ item.code || item.id }}</td>
              <td>{{ item.name }}</td>
              <td class="num">{{ lessonsOf(item.id) }}</td>
              <td v-if="auth.can('course:write')">
                <button class="linkish" type="button" @click.stop="openCourse(item)">编辑</button>
                <button class="link-danger" type="button" @click.stop="removeCourse(item)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="tab !== 'week'" class="card preview-card">
      <h2>表单预览</h2>
      <div v-if="preview && preview.kind === 'course'" class="preview-grid">
        <div><span class="k">课程编号</span><span class="v num">{{ preview.code || '—' }}</span></div>
        <div><span class="k">课程名称</span><span class="v">{{ preview.name || '—' }}</span></div>
        <div><span class="k">已排课时</span><span class="v num">{{ preview.lessons ?? '—' }}</span></div>
      </div>
      <div v-else-if="preview" class="preview-grid">
        <div><span class="k">课程</span><span class="v">{{ preview.name || '—' }}</span></div>
        <div><span class="k">班级</span><span class="v">{{ preview.className || '—' }}</span></div>
        <div><span class="k">教师</span><span class="v">{{ preview.teacher || '—' }}</span></div>
        <div><span class="k">星期</span><span class="v">{{ preview.weekday ? weekdayLabel(preview.weekday) : '—' }}</span></div>
        <div><span class="k">节次</span><span class="v num">{{ preview.periodStart ? `${preview.periodStart}-${preview.periodEnd}` : '—' }}</span></div>
        <div><span class="k">教室</span><span class="v num">{{ preview.roomNo || '—' }}</span></div>
      </div>
      <p v-else class="sub">选择授课或新增课程后，在这里预览。</p>
    </section>

    <section v-else class="card block">
      <ScheduleBoard :items="weekItems" />
    </section>

    <div v-if="courseEditor" class="modal-mask" @click.self="courseEditor = null">
      <form class="modal-card" @submit.prevent="saveCourse">
        <div class="modal-head">
          <h3>{{ courseEditor.id ? '编辑课程' : '新增课程' }}</h3>
          <button class="icon-btn" type="button" aria-label="关闭" @click="courseEditor = null"><AppIcon name="X" :size="16" /></button>
        </div>
        <div class="form-grid">
          <label class="field-label">课程编号</label>
          <input v-model="courseEditor.code" class="field" placeholder="例如 CHEM-01" required />
          <label class="field-label">课程名称</label>
          <input v-model="courseEditor.name" class="field" required />
          <label class="field-label">学分</label>
          <input v-model="courseEditor.credit" class="field num" inputmode="decimal" />
          <p v-if="formError" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
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
          <select v-model="scheduleEditor.courseId" class="select" required>
            <option v-for="item in courses" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <div class="form-row">
            <div>
              <label class="field-label">班级</label>
              <select v-model="scheduleEditor.classId" class="select">
                <option v-for="item in classOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">教师</label>
              <select v-model="scheduleEditor.teacherId" class="select">
                <option value="">不指定</option>
                <option v-for="item in teachers" :key="item.id" :value="item.id">{{ item.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div>
              <label class="field-label">学年</label>
              <input v-model="scheduleEditor.academicYear" class="field" placeholder="2026-2027" />
            </div>
            <div>
              <label class="field-label">学期</label>
              <select v-model="scheduleEditor.semester" class="select">
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
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
          <p v-if="formError" :class="isLoadHint(formError) ? 'load-hint' : 'error-text'">{{ formError }}</p>
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
import { createClassCourse, createCourse, deleteClassCourse, deleteCourse, fetchClassCourses, fetchCourses, fetchMyTimetable, toClassCoursePayload, updateClassCourse, updateCourse } from '../api/course.js'
import { fetchClasses } from '../api/student.js'
import { fetchStaffOptions } from '../api/users.js'
import { courseWritePayload, validateClassCourse, validateCourse } from '../domain/writePayloads.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { isLoadHint, periodLabel, scopeLabel, weekdayLabel } from '../utils/format.js'

const auth = useAuthStore()
const ui = useUiStore()
const tab = ref('schedules')
const grade = ref('')
const className = ref('')
const keyword = ref('')
const courseEditor = ref(null)
const scheduleEditor = ref(null)
const pickedScheduleId = ref('')
const pickedCourseId = ref('')
const formError = ref('')
const loadError = ref('')

function netHint(message) {
  return isLoadHint(message)
}
const courses = ref([])
const schedules = ref([])
const classOptions = ref([])
const teachers = ref([])
const weekItems = ref([])

function scheduleKey(item) {
  return `${item.id}-${item.sessionIndex}`
}

function schoolYear() {
  const now = new Date()
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
  return `${start}-${start + 1}`
}

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

const preview = computed(() => {
  if (courseEditor.value || tab.value === 'library') {
    if (courseEditor.value) {
      return { kind: 'course', code: courseEditor.value.code, name: courseEditor.value.name, lessons: '—' }
    }
    const item = courses.value.find((row) => row.id === pickedCourseId.value) || courses.value[0]
    if (!item) return null
    return { kind: 'course', code: item.code || item.id, name: item.name, lessons: lessonsOf(item.id) }
  }
  if (scheduleEditor.value) {
    const form = scheduleEditor.value
    const linked = courses.value.find((row) => String(row.id) === String(form.courseId))
    const cls = classOptions.value.find((row) => String(row.id) === String(form.classId))
    const teacher = teachers.value.find((row) => String(row.id) === String(form.teacherId))
    return {
      kind: 'schedule',
      ...form,
      name: linked?.name || form.name || '',
      className: cls?.name || form.className || '',
      teacher: teacher?.name || form.teacher || ''
    }
  }
  const item = visibleSchedules.value.find((row) => scheduleKey(row) === pickedScheduleId.value) || visibleSchedules.value[0]
  return item ? { kind: 'schedule', ...item } : null
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
  try {
    teachers.value = await fetchStaffOptions(2)
  } catch (error) {
    teachers.value = []
    errors.push(error.message || '教师列表加载失败')
  }
  try {
    weekItems.value = await fetchMyTimetable()
  } catch (error) {
    weekItems.value = []
    errors.push(error.message || '周课表加载失败')
  }
  loadError.value = errors.join('；')
}

onMounted(load)

function openCourse(item) {
  formError.value = ''
  courseEditor.value = item
    ? { id: item.id, code: item.code, name: item.name, credit: item.credit ?? '', status: item.status ?? 1 }
    : { id: '', code: '', name: '', credit: '', status: 1 }
}

function openSchedule(item) {
  formError.value = ''
  const teacherId = item?.teacherId || (auth.user?.role === 'TEACHER' && Number(auth.user.id) ? auth.user.id : '')
  scheduleEditor.value = item
    ? {
        ...item,
        courseId: item.courseId || courses.value[0]?.id || '',
        classId: item.classId || '',
        teacherId: teacherId || '',
        academicYear: item.academicYear || schoolYear(),
        semester: item.semester ? String(item.semester) : '1'
      }
    : {
        courseId: courses.value[0]?.id || '',
        classId: classOptions.value[0]?.id || '',
        teacherId: teacherId || teachers.value[0]?.id || '',
        academicYear: schoolYear(),
        semester: '1',
        weekday: 1,
        periodStart: 1,
        periodEnd: 2,
        roomNo: ''
      }
}

async function saveCourse() {
  formError.value = ''
  const errors = validateCourse(courseEditor.value)
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  try {
    const payload = courseWritePayload(courseEditor.value)
    if (courseEditor.value.id) await updateCourse(courseEditor.value.id, payload)
    else await createCourse(payload)
    ui.toast('课程已保存', 'success')
    courseEditor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  }
}

async function removeCourse(item) {
  if (!window.confirm(`删除课程「${item.name}」？已排课的课程可能被拒绝。`)) return
  try {
    await deleteCourse(item.id)
    ui.toast('课程已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}

async function saveSchedule() {
  formError.value = ''
  const form = scheduleEditor.value
  const errors = validateClassCourse(form)
  if (errors.length) {
    formError.value = errors[0]
    return
  }
  try {
    const siblings = form.id ? schedules.value.filter((row) => row.id === form.id) : []
    const payload = toClassCoursePayload(form, siblings)
    if (form.id) await updateClassCourse(form.id, payload)
    else await createClassCourse(payload)
    ui.toast('排课已保存', 'success')
    scheduleEditor.value = null
    await load()
  } catch (error) {
    formError.value = error.message || '保存失败'
  }
}

async function removeSchedule(item) {
  if (!window.confirm(`删除「${item.className} · ${item.name}」的授课？同一授课下的全部节次会一起删除。`)) return
  try {
    await deleteClassCourse(item.id)
    ui.toast('授课已删除', 'success')
    await load()
  } catch (error) {
    ui.toast(error.message || '删除失败', 'error')
  }
}
</script>
