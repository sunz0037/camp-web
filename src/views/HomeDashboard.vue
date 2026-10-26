<template>
  <div class="home-dashboard">
    <div v-if="!userInfo" class="loading-container">
      <p>正在加载用户信息，请稍候...</p>
      <p class="loading-hint">如果长时间未显示，请检查是否已登录</p>
    </div>
    <template v-else>
      <div class="bento">
        <article class="tile tile-feature span-2">
          <div class="tile-top">
            <span class="tile-icon icon-orange">
              <iconify-icon icon="lucide:users-round"></iconify-icon>
            </span>
          </div>
          <div>
            <h3 class="tile-value">2,482</h3>
            <p class="tile-label">学生总数</p>
          </div>
        </article>

        <article class="tile tile-stat">
          <div class="tile-top">
            <span class="tile-icon icon-blue">
              <iconify-icon icon="lucide:book-open"></iconify-icon>
            </span>
          </div>
          <div>
            <h3 class="tile-value">142</h3>
            <p class="tile-label">进行中课程</p>
          </div>
        </article>

        <article class="tile tile-stat">
          <div class="tile-top">
            <span class="tile-icon icon-amber">
              <iconify-icon icon="lucide:megaphone"></iconify-icon>
            </span>
          </div>
          <div>
            <h3 class="tile-value">08</h3>
            <p class="tile-label">最新公告</p>
          </div>
        </article>

        <article class="tile tile-panel span-2">
          <div class="tile-head">
            <span class="tile-heading">
              <span class="tile-icon icon-orange">
                <iconify-icon icon="lucide:list-checks"></iconify-icon>
              </span>
              <h2 class="tile-title">个人待办</h2>
            </span>
            <span class="tile-kicker">{{ todoList.filter(t => !t.done).length }} 项未完成</span>
          </div>
          <ul class="todo-list">
            <li
              v-for="item in todoList"
              :key="item.id"
              class="todo-item"
              :class="{ done: item.done }"
              @click="toggleTodo(item)"
            >
              <span class="todo-check">
                <iconify-icon v-if="item.done" icon="lucide:circle-check" class="icon-done"></iconify-icon>
                <iconify-icon v-else icon="lucide:circle" class="icon-pending"></iconify-icon>
              </span>
              <span class="todo-text">{{ item.title }}</span>
              <span class="todo-meta">{{ item.due }}</span>
            </li>
          </ul>
        </article>

        <article class="tile tile-panel span-2">
          <div class="tile-head">
            <span class="tile-heading">
              <span class="tile-icon icon-blue">
                <iconify-icon icon="lucide:calendar"></iconify-icon>
              </span>
              <h2 class="tile-title">日历</h2>
            </span>
          </div>
          <div class="calendar-header">
            <button type="button" class="nav-btn" @click="prevMonth" aria-label="上个月">
              <iconify-icon icon="lucide:chevron-left"></iconify-icon>
            </button>
            <span class="month-year">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
            <button type="button" class="nav-btn" @click="nextMonth" aria-label="下个月">
              <iconify-icon icon="lucide:chevron-right"></iconify-icon>
            </button>
          </div>
          <div class="calendar-grid">
            <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
            <button
              v-for="day in calendarDays"
              :key="day.fullDate"
              type="button"
              class="calendar-day"
              :class="{
                'other-month': day.isOtherMonth,
                'today': day.isToday,
                'selected': day.fullDate === selectedDateStr
              }"
              @click="selectDate(day)"
            >
              {{ day.day }}
            </button>
          </div>
        </article>

        <article class="tile tile-panel tile-soft span-3">
          <div class="tile-head">
            <span class="tile-heading">
              <span class="tile-icon icon-green">
                <iconify-icon icon="lucide:cloud-sun"></iconify-icon>
              </span>
              <h2 class="tile-title">天气</h2>
            </span>
            <span class="weather-location">
              <iconify-icon icon="lucide:map-pin"></iconify-icon>
              {{ weather?.location || '北京' }}
            </span>
          </div>
          <div v-if="weatherLoading" class="weather-note">加载中...</div>
          <div v-else-if="weatherError" class="weather-note">{{ weatherError }}</div>
          <div v-else-if="weather" class="weather-main">
            <span class="weather-emoji">{{ getWeatherEmoji(weather.condition) }}</span>
            <div>
              <p class="temp-value">{{ weather.temperature }}°</p>
              <p class="temp-desc">{{ weather.condition }} · 湿度 {{ weather.humidity }}% · 风速 {{ weather.windSpeed }} km/h</p>
            </div>
          </div>
          <button
            v-if="!locationGranted || weatherError"
            type="button"
            class="location-btn"
            @click="requestLocation"
          >
            <iconify-icon icon="lucide:refresh-cw"></iconify-icon>
            更新位置
          </button>
        </article>

        <article class="tile tile-stat tile-flat">
          <div class="tile-top">
            <span class="tile-icon icon-green">
              <iconify-icon icon="lucide:calendar-days"></iconify-icon>
            </span>
          </div>
          <div>
            <h3 class="tile-value">14</h3>
            <p class="tile-label">即将安排</p>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const userInfo = ref(null)
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// Mock 待办数据
const todoList = ref([
  { id: 1, title: '审核高三2班月考成绩单', due: '今日', done: false },
  { id: 2, title: '参加年级组长会议', due: '今日 14:00', done: false },
  { id: 3, title: '提交本月考勤统计表', due: '明日', done: false },
  { id: 4, title: '完成学生信息批量导入', due: '本周五', done: true },
  { id: 5, title: '更新班级课表', due: '本周五', done: true }
])

const toggleTodo = (item) => {
  item.done = !item.done
}

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const weather = ref(null)
const weatherLoading = ref(false)
const weatherError = ref(null)
const locationGranted = ref(false)

onMounted(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  initWeather()
})

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const days = []
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    days.push({ day, fullDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, isOtherMonth: true })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({ day, fullDate, isOtherMonth: false, isToday: fullDate === todayStr })
  }
  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    days.push({ day, fullDate: `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`, isOtherMonth: true })
  }
  return days
})

const selectedDateStr = computed(() => {
  const d = selectedDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const prevMonth = () => currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
const nextMonth = () => currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
const selectDate = (day) => selectedDate.value = new Date(day.fullDate)

const getWeatherEmoji = (condition) => {
  const emojiMap = { '晴': '☀️', '多云': '⛅', '阴': '☁️', '雨': '🌧️', '雪': '❄️', '雾': '🌫️', '霾': '🌫️' }
  return emojiMap[condition] || '🌤️'
}

const requestLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { locationGranted.value = true; fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude) },
      () => { weatherError.value = '无法获取位置，使用北京'; fetchWeatherByCity('北京') }
    )
  } else {
    weatherError.value = '浏览器不支持位置服务'; fetchWeatherByCity('北京')
  }
}

const fetchWeatherByCoords = async (lat, lon) => {
  weatherLoading.value = true
  weatherError.value = null
  try {
    const { getWeatherByCoords } = await import('../api/weather.js')
    const result = await getWeatherByCoords(lat, lon)
    weather.value = result.success ? result.data : null
    if (!result.success) throw new Error('获取天气失败')
  } catch (e) {
    weatherError.value = '获取天气失败，请稍后重试'
  } finally {
    weatherLoading.value = false
  }
}

const fetchWeatherByCity = async (city = '北京') => {
  weatherLoading.value = true
  weatherError.value = null
  try {
    const { getWeatherByCity } = await import('../api/weather.js')
    const result = await getWeatherByCity(city)
    weather.value = result.success ? result.data : null
    if (!result.success) throw new Error('获取天气失败')
  } catch (e) {
    weatherError.value = '获取天气失败，请稍后重试'
  } finally {
    weatherLoading.value = false
  }
}

const initWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { locationGranted.value = true; fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude) },
      () => fetchWeatherByCity('北京')
    )
  } else {
    fetchWeatherByCity('北京')
  }
}
</script>

<style scoped>
.home-dashboard {
  padding: 1rem 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 16rem;
  color: #52525b;
  font-size: 0.875rem;
  text-align: center;
}

.loading-hint {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.75rem;
}

.bento {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  max-width: 72rem;
  margin: 0 auto;
}

.tile {
  background: #fff;
  border: 1px solid #f4f4f5;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1rem 1.25rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
}

.tile:hover {
  transform: translateY(-0.25rem) scale(1.01);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.tile:active {
  transform: scale(0.98);
}

.span-2 { grid-column: span 2; }
.span-3 { grid-column: span 3; }

.tile-stat {
  aspect-ratio: 2 / 1;
}

.tile-flat {
  aspect-ratio: auto;
  min-height: 8.5rem;
}

.tile-feature {
  background: #fff7ed;
  border-color: #ffedd5;
}

.tile-soft {
  background: #f0fdf4;
  border-color: #dcfce7;
}

.tile-panel {
  height: 100%;
  justify-content: flex-start;
}

.tile-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.tile-top,
.tile-head,
.weather-location,
.weather-main,
.todo-item,
.calendar-header {
  display: flex;
  align-items: center;
}

.tile-top,
.tile-head,
.calendar-header {
  justify-content: space-between;
  gap: 0.75rem;
}

.tile-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  color: #18181b;
  transition: transform 0.25s ease-out, background-color 0.25s ease-out, color 0.25s ease-out;
}

.tile-icon iconify-icon {
  font-size: 1.25rem;
}

.tile:hover .tile-icon {
  transform: scale(1.1);
  background: #18181b;
  color: #fff;
}

.icon-orange { background: #ffedd5; color: #c2410c; }
.icon-blue { background: #eff6ff; color: #1d4ed8; }
.icon-amber { background: #fff7ed; color: #c2410c; }
.icon-green { background: #f0fdf4; color: #15803d; }

.tile-kicker,
.tile-label,
.todo-meta,
.weekday {
  color: #71717a;
  font-size: 0.75rem;
}

.tile-kicker {
  font-weight: 600;
}

.tile-value {
  margin: 0;
  font-size: 1.875rem;
  line-height: 1.1;
  font-weight: 600;
  color: #18181b;
  letter-spacing: -0.02em;
}

.tile-label,
.temp-desc,
.weather-note {
  margin: 0.25rem 0 0;
}

.tile-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #18181b;
}

.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-item {
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease-out, transform 0.2s ease-out;
}

.todo-item:hover {
  background: #fafafa;
}

.todo-item:hover .todo-check {
  transform: scale(1.1);
}

.todo-item:active {
  transform: scale(0.98);
}

.todo-item.done {
  opacity: 0.55;
}

.todo-item.done .todo-text {
  color: #71717a;
  text-decoration: line-through;
}

.todo-check {
  display: inline-flex;
  transition: transform 0.2s ease-out;
}

.icon-done { color: #15803d; font-size: 1.25rem; }
.icon-pending { color: #d4d4d8; font-size: 1.25rem; }
.todo-item:hover .icon-pending { color: #18181b; }

.todo-text {
  flex: 1;
  min-width: 0;
  color: #3f3f46;
  font-size: 0.875rem;
}

.month-year {
  font-size: 0.875rem;
  font-weight: 600;
  color: #18181b;
}

.nav-btn,
.calendar-day,
.location-btn {
  border: 1px solid #e4e4e7;
  background: #fafafa;
  color: #3f3f46;
  cursor: pointer;
  transition: transform 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out;
}

.nav-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover,
.calendar-day:hover {
  background: #fff;
  border-color: #d4d4d8;
}

.nav-btn:active,
.calendar-day:active,
.location-btn:active {
  transform: scale(0.95);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
}

.weekday,
.calendar-day {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.calendar-day {
  height: 1.5rem;
  border-radius: 0.75rem;
  color: #18181b;
  padding: 0;
}

.calendar-day.other-month {
  color: #a1a1aa;
}

.calendar-day.today,
.calendar-day.selected {
  background: #18181b;
  border-color: #18181b;
  color: #fff;
}

.weather-location {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #71717a;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.weather-main {
  gap: 0.75rem;
}

.weather-emoji {
  font-size: 2rem;
  line-height: 1;
}

.temp-value {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 600;
  color: #18181b;
  letter-spacing: -0.02em;
}

.temp-desc,
.weather-note {
  font-size: 0.875rem;
  color: #71717a;
}

.location-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  margin-top: auto;
  border-radius: 0.75rem;
  color: #18181b;
  font-size: 0.875rem;
  font-weight: 500;
}

.location-btn:hover {
  background: #fff;
}

.tile:focus-within,
.nav-btn:focus-visible,
.calendar-day:focus-visible,
.location-btn:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.35);
  outline-offset: 2px;
}

@media (max-width: 1100px) {
  .bento {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .span-2,
  .span-3,
  .tile-feature {
    grid-column: span 2;
  }
  .tile-stat {
    aspect-ratio: auto;
    min-height: 8rem;
  }
}

@media (max-width: 720px) {
  .home-dashboard {
    padding: 1rem;
  }
  .bento {
    grid-template-columns: 1fr;
  }
  .span-2,
  .span-3,
  .tile-feature {
    grid-column: auto;
  }
  .tile-stat {
    aspect-ratio: auto;
    min-height: 8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile:hover,
  .tile:active,
  .todo-item:active,
  .nav-btn:active,
  .calendar-day:active,
  .location-btn:active,
  .tile:hover .tile-icon,
  .todo-item:hover .todo-check {
    transform: none;
  }
}
</style>
