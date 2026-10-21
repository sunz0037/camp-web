<template>
  <div class="home-dashboard">
    <div v-if="!userInfo" class="loading-container">
      <p>正在加载用户信息，请稍候...</p>
      <p class="loading-hint">如果长时间未显示，请检查是否已登录</p>
    </div>
    <template v-else>
      <div class="dashboard-inner">
        <!-- 统计卡片 -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon teal">
                <iconify-icon icon="lucide:users-round"></iconify-icon>
              </div>
              <span class="stat-badge">学生</span>
            </div>
            <h3 class="stat-value">2,482</h3>
            <p class="stat-label">学生总数</p>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon blue">
                <iconify-icon icon="lucide:book-open"></iconify-icon>
              </div>
              <span class="stat-badge">课程</span>
            </div>
            <h3 class="stat-value">142</h3>
            <p class="stat-label">进行中课程</p>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon amber">
                <iconify-icon icon="lucide:megaphone"></iconify-icon>
              </div>
              <span class="stat-badge">公告</span>
            </div>
            <h3 class="stat-value">08</h3>
            <p class="stat-label">最新公告</p>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon violet">
                <iconify-icon icon="lucide:calendar-days"></iconify-icon>
              </div>
              <span class="stat-badge">今日</span>
            </div>
            <h3 class="stat-value">14</h3>
            <p class="stat-label">即将安排</p>
          </div>
        </div>

        <!-- 主内容：待办 + 日历 + 天气 -->
        <div class="content-grid">
          <!-- 个人待办 -->
          <div class="card todo-card">
            <div class="card-title-row">
              <h2 class="card-title">个人待办</h2>
              <span class="todo-count">{{ todoList.filter(t => !t.done).length }} 项未完成</span>
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
          </div>

          <!-- 日历卡片（紧凑） -->
          <div class="card calendar-card compact">
            <h2 class="card-title">日历</h2>
            <div class="calendar-header">
              <button class="nav-btn" @click="prevMonth">
                <iconify-icon icon="lucide:chevron-left"></iconify-icon>
              </button>
              <span class="month-year">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
              <button class="nav-btn" @click="nextMonth">
                <iconify-icon icon="lucide:chevron-right"></iconify-icon>
              </button>
            </div>
            <div class="calendar-grid">
              <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
              <div
                v-for="day in calendarDays"
                :key="day.fullDate"
                class="calendar-day"
                :class="{
                  'other-month': day.isOtherMonth,
                  'today': day.isToday,
                  'selected': day.fullDate === selectedDateStr
                }"
                @click="selectDate(day)"
              >
                {{ day.day }}
              </div>
            </div>
          </div>

          <!-- 天气卡片（紧凑） -->
          <div class="card weather-card compact">
            <div class="weather-header">
              <h2 class="card-title">天气</h2>
              <span class="weather-location">
                <iconify-icon icon="lucide:map-pin"></iconify-icon>
                {{ weather?.location || '北京' }}
              </span>
            </div>
            <div v-if="weatherLoading" class="weather-loading">加载中...</div>
            <div v-else-if="weatherError" class="weather-error">{{ weatherError }}</div>
            <div v-else-if="weather" class="weather-content compact">
              <div class="weather-main">
                <span class="weather-emoji">{{ getWeatherEmoji(weather.condition) }}</span>
                <div class="weather-temp">
                  <span class="temp-value">{{ weather.temperature }}°</span>
                  <span class="temp-desc">{{ weather.condition }}</span>
                </div>
              </div>
              <div class="weather-details">
                <span>湿度 {{ weather.humidity }}%</span>
                <span>风速 {{ weather.windSpeed }} km/h</span>
              </div>
            </div>
            <button
              v-if="!locationGranted || weatherError"
              class="location-btn"
              @click="requestLocation"
            >
              <iconify-icon icon="lucide:refresh-cw"></iconify-icon>
              更新位置
            </button>
          </div>
        </div>
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
  padding: 3rem;
  min-height: calc(100vh - 88px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-slate-600);
  font-size: 1rem;
  text-align: center;
}

.loading-hint {
  font-size: 0.875rem;
  color: var(--text-slate-500);
  margin-top: 0.5rem;
}

.dashboard-inner {
  max-width: 1300px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border: 1px solid var(--border-refined);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon iconify-icon {
  font-size: 1.25rem;
  color: inherit;
}

.stat-icon.teal,
.stat-icon.blue,
.stat-icon.amber,
.stat-icon.violet {
  background: var(--bg-neutral);
  color: var(--primary-charcoal);
}

.stat-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-lavender);
  background: var(--accent-lavender-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--primary-charcoal);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0;
}

/* 主内容网格：待办(大) + 日历(小) + 天气(小) */
.content-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: 2rem;
}

.card {
  background: white;
  border: 1px solid var(--border-refined);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
}

.card.compact {
  padding: 1.75rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-charcoal);
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f1ee;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f1ee;
}

.card-title-row .card-title {
  margin: 0;
  padding: 0;
  border: none;
}

.todo-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-lavender);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #fafaf9;
  margin: 0 -0.5rem;
  padding: 0.875rem 0.75rem;
  border-radius: 12px;
}

.todo-item.done {
  opacity: 0.5;
}

.todo-item.done .todo-text {
  color: var(--text-muted);
  text-decoration: line-through;
}

.todo-check {
  flex-shrink: 0;
}

.todo-check .icon-done {
  font-size: 1.25rem;
  color: var(--accent-lavender);
}

.todo-check .icon-pending {
  font-size: 1.25rem;
  color: var(--border-refined);
}

.todo-item:hover .icon-pending {
  color: var(--accent-lavender);
}

.todo-text {
  flex: 1;
  font-size: 0.9375rem;
  color: var(--text-main);
}

.todo-meta {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* 日历紧凑样式 */
.calendar-card.compact .card-title {
  margin-bottom: 0.75rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.month-year {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--primary-charcoal);
}

.nav-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-slate-200);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-slate-600);
  transition: all 0.2s;
}

.nav-btn:hover {
  background: var(--bg-neutral);
  color: var(--primary-charcoal);
}

.nav-btn iconify-icon {
  font-size: 0.875rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: var(--text-slate-500);
  padding: 0.25rem;
  font-size: 0.6875rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-slate-800);
}

.calendar-day:hover {
  background: var(--accent-lavender-soft);
}

.calendar-day.other-month {
  color: var(--border-refined);
}

.calendar-day.today,
.calendar-day.selected {
  background: var(--primary-charcoal);
  color: white;
}

/* 天气紧凑样式 */
.weather-card.compact {
  position: relative;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.weather-header .card-title {
  margin: 0;
  padding: 0;
  border: none;
}

.weather-location {
  font-size: 0.75rem;
  color: var(--text-slate-500);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.weather-loading,
.weather-error {
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--text-slate-500);
}

.weather-content.compact {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.weather-content.compact .weather-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0;
}

.weather-content.compact .weather-emoji {
  font-size: 2.5rem;
}

.weather-content.compact .temp-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-charcoal);
}

.weather-content.compact .temp-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.weather-details {
  display: flex;
  gap: 1rem;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.location-btn {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-lavender-soft);
  color: var(--accent-lavender);
  border: 1px solid var(--accent-lavender-soft);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.location-btn:hover {
  background: #ebe5ff;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
