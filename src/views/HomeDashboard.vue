<template>
  <div class="page dash-page">
    <header class="dash-head">
      <div>
        <h1>{{ greeting() }}，{{ auth.user?.name }}</h1>
        <p class="sub">{{ subtitle }}</p>
      </div>
    </header>

    <section class="bento dash-bento">
      <article class="span-3 quick-board">
        <div class="block-head">
          <h2>常用菜单</h2>
          <button class="btn btn-ghost btn-sm" type="button" @click="configOpen = !configOpen">
            {{ configOpen ? '完成' : '配置' }}
          </button>
        </div>
        <div class="quick-row">
          <router-link v-for="item in visibleShortcuts" :key="item.key" class="menu-card" :class="`nav-ico-${item.icon}`" :to="item.to">
            <span class="nav-ico">
              <AppIcon :name="item.icon" :size="18" />
            </span>
            <strong>{{ item.label }}</strong>
          </router-link>
          <p v-if="!visibleShortcuts.length" class="sub">还没有常用菜单，点右上角配置。</p>
        </div>
        <div v-if="configOpen" class="quick-config">
          <p class="sub">最多 6 个，当前已选 {{ selectedKeys.length }} 个。</p>
          <label v-for="item in menuChoices" :key="item.key" :class="{ on: selectedKeys.includes(item.key), off: atMax && !selectedKeys.includes(item.key) }">
            <input
              type="checkbox"
              :checked="selectedKeys.includes(item.key)"
              :disabled="atMax && !selectedKeys.includes(item.key)"
              @change="toggleShortcut(item.key)"
            />
            {{ item.label }}
          </label>
        </div>
      </article>

      <article v-for="card in stats" :key="card.label" class="card stat">
        <p class="label">{{ card.label }}</p>
        <p class="figure num" :class="{ warn: card.warn }">{{ card.value }}</p>
        <p class="hint">{{ card.hint }}</p>
      </article>

      <article v-if="auth.user?.role === 'TEACHER' && campus.todos.length" class="card block span-3">
        <h2>今日待办</h2>
        <div class="todo-row">
          <label v-for="todo in campus.todos" :key="todo.id" class="todo" :class="{ done: todo.done }">
            <input type="checkbox" :checked="todo.done" @change="campus.toggleTodo(todo.id)" />
            <button type="button" @click="router.push(todo.to)">{{ todo.text }}</button>
          </label>
        </div>
      </article>

      <article class="card block note-card">
        <h2>随手记</h2>
        <textarea v-model="note" class="scratch" placeholder="记一下待办、电话或临时安排，只保存在这台浏览器。" @input="saveNote"></textarea>
      </article>

      <article class="card block calendar-card">
        <div class="cal-head">
          <h2>{{ calendarTitle }}</h2>
          <div class="cal-nav">
            <button type="button" aria-label="上个月" @click="shiftMonth(-1)"><AppIcon name="ChevronLeft" :size="14" /></button>
            <button type="button" aria-label="下个月" @click="shiftMonth(1)"><AppIcon name="ChevronRight" :size="14" /></button>
          </div>
        </div>
        <div class="cal-grid">
          <span v-for="label in weekLabels" :key="label" class="dow">{{ label }}</span>
          <span v-for="(day, index) in calendarCells" :key="index" class="day" :class="{ today: isToday(day), muted: !day }">{{ day || '' }}</span>
        </div>
      </article>

      <article class="card block weather-card">
        <h2>天气</h2>
        <div v-if="weather" class="weather">
          <AppIcon name="CloudSun" :size="28" />
          <div>
            <strong class="num">{{ weather.temp }}°</strong>
            <p>{{ weather.label }}</p>
            <small>{{ weather.place }} · {{ weather.low }}° / {{ weather.high }}°</small>
          </div>
        </div>
        <p v-else class="sub">{{ weatherError || '正在获取天气…' }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { PHASE_ROUTES, inSidebar, navLabel, sidebarLinks } from '../nav.js'
import { greeting } from '../utils/format.js'

const auth = useAuthStore()
const campus = useCampusStore()
const router = useRouter()

const MENU_LIMIT = 6
const configOpen = ref(false)
const selectedKeys = ref([])
const note = ref('')
const weather = ref(null)
const weatherError = ref('')
const monthCursor = ref(new Date())
const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

const PREFERRED = ['Students', 'Attendance', 'Announcements', 'Users', 'Courses', 'MySchedule', 'ExamSchedules', 'Scores', 'OrgClasses', 'Visitors', 'Profile']

const menuChoices = computed(() => {
  const role = auth.user?.role
  return PHASE_ROUTES.filter((item) => inSidebar(item, role)).flatMap((item) => {
    return sidebarLinks(item).map((link) => ({
      key: `${item.name}-${link.key}`,
      icon: link.icon,
      label: item.name === 'Attendance' ? navLabel(item, role) : link.title,
      to: { path: `/home/${item.path}`, query: link.query }
    }))
  })
})

const storageKey = computed(() => `camp.shortcuts.${auth.user?.id || 'guest'}`)
const noteKey = computed(() => `camp.scratch.${auth.user?.id || 'guest'}`)
const atMax = computed(() => selectedKeys.value.length >= MENU_LIMIT)
const visibleShortcuts = computed(() => {
  const byKey = new Map(menuChoices.value.map((item) => [item.key, item]))
  return selectedKeys.value.map((key) => byKey.get(key)).filter(Boolean).slice(0, MENU_LIMIT)
})

const unread = computed(() => campus.unreadAnnouncements(auth.user?.id))
const today = computed(() => campus.todaySchedules(auth.user))
const pinnedUnread = computed(() => unread.value.filter((item) => item.pinned).length)
const classCount = computed(() => campus.classesFor(auth.user).length)
const pending = computed(() => campus.pendingClassNames(auth.user).length)

const subtitle = computed(() => {
  const role = auth.user?.role
  if (role === 'TEACHER') return `教学工作台 · 所辖班级与待办概览 · 数据范围 ${classCount.value} 个班级`
  if (role === 'ACADEMIC') return '教务工作台 · 全校学籍、课程与考勤'
  if (role === 'ADMIN') return '管理工作台 · 全校组织与账号'
  if (auth.user?.actor === 'PARENT') return `家长入口 · 与 ${auth.user.linkedStudentName || '学生'} 同一工作台`
  return '学习工作台 · 公告、课表与随手记'
})

const stats = computed(() => {
  const role = auth.user?.role
  if (role === 'STUDENT') {
    const self = campus.studentsFor(auth.user)[0]
    const ownMarks = campus.sessions.flatMap((session) => session.marks.filter((mark) => mark.studentId === self?.id && mark.status !== 'present'))
    return [
      { label: '今日课程', value: today.value.length, hint: '按开始节次与结束节次' },
      { label: '未读公告', value: unread.value.length, hint: pinnedUnread.value ? `含 ${pinnedUnread.value} 条置顶` : '没有置顶未读' },
      { label: '异常考勤', value: ownMarks.length, hint: '请假、迟到、旷课', warn: ownMarks.length > 0 }
    ]
  }
  return [
    {
      label: role === 'TEACHER' ? '所辖班级人数' : '在籍学生',
      value: campus.headcount(auth.user),
      hint: `${classCount.value} 个班级`
    },
    {
      label: '待登记考勤',
      value: pending.value,
      hint: '今日尚未提交日报的班级',
      warn: pending.value > 0
    },
    {
      label: '未读公告',
      value: unread.value.length,
      hint: pinnedUnread.value ? `含 ${pinnedUnread.value} 条置顶` : '没有置顶未读'
    }
  ]
})

function loadShortcuts() {
  const saved = localStorage.getItem(storageKey.value)
  if (saved) {
    try {
      const keys = JSON.parse(saved)
      if (Array.isArray(keys)) {
        selectedKeys.value = keys.filter((key) => menuChoices.value.some((item) => item.key === key)).slice(0, MENU_LIMIT)
        return
      }
    } catch {
      /* 使用默认菜单 */
    }
  }
  const available = new Set(menuChoices.value.map((item) => item.key))
  const preferred = PREFERRED.map((name) => menuChoices.value.find((item) => item.key.startsWith(name))).filter(Boolean)
  selectedKeys.value = preferred.filter((item) => available.has(item.key)).slice(0, MENU_LIMIT).map((item) => item.key)
}

function persistShortcuts() {
  localStorage.setItem(storageKey.value, JSON.stringify(selectedKeys.value))
}

function toggleShortcut(key) {
  if (selectedKeys.value.includes(key)) {
    selectedKeys.value = selectedKeys.value.filter((item) => item !== key)
  } else if (!atMax.value) {
    selectedKeys.value = [...selectedKeys.value, key]
  }
  persistShortcuts()
}

const calendarTitle = computed(() => `${monthCursor.value.getFullYear()}年${monthCursor.value.getMonth() + 1}月`)
const calendarCells = computed(() => {
  const year = monthCursor.value.getFullYear()
  const month = monthCursor.value.getMonth()
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)]
})

function shiftMonth(step) {
  const next = new Date(monthCursor.value)
  next.setDate(1)
  next.setMonth(next.getMonth() + step)
  monthCursor.value = next
}

function isToday(day) {
  if (!day) return false
  const now = new Date()
  return day === now.getDate() && monthCursor.value.getMonth() === now.getMonth() && monthCursor.value.getFullYear() === now.getFullYear()
}

function saveNote() {
  localStorage.setItem(noteKey.value, note.value)
}

function weatherLabel(code) {
  if (code === 0) return '晴'
  if (code <= 3) return '多云'
  if (code === 45 || code === 48) return '雾'
  if (code <= 67) return '雨'
  if (code <= 77) return '雪'
  if (code <= 82) return '阵雨'
  if (code >= 95) return '雷雨'
  return '多云'
}

async function loadWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=30.59&longitude=114.31&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=1'
    const response = await fetch(url)
    if (!response.ok) throw new Error('weather')
    const data = await response.json()
    weather.value = {
      temp: Math.round(data.current.temperature_2m),
      label: weatherLabel(data.current.weather_code),
      high: Math.round(data.daily.temperature_2m_max[0]),
      low: Math.round(data.daily.temperature_2m_min[0]),
      place: '武汉'
    }
  } catch {
    weatherError.value = '天气暂时获取不到'
  }
}

watch(storageKey, () => {
  loadShortcuts()
  note.value = localStorage.getItem(noteKey.value) || ''
}, { immediate: true })

onMounted(() => {
  note.value = localStorage.getItem(noteKey.value) || ''
  loadWeather()
})
</script>
