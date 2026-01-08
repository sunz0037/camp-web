<template>
  <div class="home-dashboard">
    <!-- 调试信息 -->
    <div v-if="!userInfo" class="loading-container">
      <p>正在加载用户信息，请稍候...</p>
      <p style="font-size: 0.875rem; color: #999; margin-top: 0.5rem;">如果长时间未显示，请检查是否已登录</p>
    </div>
    <div v-else class="content-grid">
      <!-- 左侧：用户信息卡片 -->
      <div class="user-card">
        <h2 class="card-title">个人信息</h2>
        <div class="user-details">
          <div class="avatar-section">
            <div class="avatar">
              <img v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" :alt="userInfo.realName" />
              <span v-else class="avatar-text">{{ getAvatarText(userInfo?.realName) }}</span>
            </div>
          </div>
          <div class="info-section">
            <div class="info-item">
              <span class="label">姓名</span>
              <span class="value">{{ userInfo?.realName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">身份</span>
              <span class="value">{{ getUserTypeName(userInfo?.userType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">学号/工号</span>
              <span class="value">{{ userInfo?.username || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：日历卡片 -->
      <div class="calendar-card">
        <h2 class="card-title">日历</h2>
        <div class="calendar-header">
          <button class="nav-btn" @click="prevMonth">‹</button>
          <span class="month-year">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
          <button class="nav-btn" @click="nextMonth">›</button>
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

      <!-- 右侧：天气卡片 -->
      <div class="weather-card">
        <h2 class="card-title">天气</h2>
        <div class="weather-location">
          <span>📍 {{ weather?.location || '北京' }}</span>
          <button v-if="!locationGranted" class="location-btn" @click="requestLocation">
            获取位置
          </button>
        </div>
        <div v-if="weatherLoading" class="weather-loading">加载中...</div>
        <div v-else-if="weatherError" class="weather-error">{{ weatherError }}</div>
        <div v-else-if="weather" class="weather-content">
          <div class="weather-main">
            <span class="weather-emoji">{{ getWeatherEmoji(weather.condition) }}</span>
            <div class="weather-temp">
              <span class="temp-value">{{ weather.temperature }}°</span>
              <span class="temp-desc">{{ weather.condition }}</span>
            </div>
          </div>
          <div class="weather-details">
            <div class="detail-item">
              <span class="detail-label">湿度</span>
              <span class="detail-value">{{ weather.humidity }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">风速</span>
              <span class="detail-value">{{ weather.windSpeed }}km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 调试信息：显示加载状态 -->
    <div v-if="!userInfo" class="loading-container">
      <p>正在加载用户信息，请稍候...</p>
      <p style="font-size: 0.875rem; color: #999; margin-top: 0.5rem;">如果长时间未显示，请检查是否已登录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 用户信息
const userInfo = ref(null)

// 日历相关
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

// 天气相关
const weather = ref(null)
const weatherLoading = ref(false)
const weatherError = ref(null)
const locationGranted = ref(false)

// 从localStorage加载用户信息
onMounted(() => {
  console.log('HomeDashboard mounted')
  const userInfoStr = localStorage.getItem('userInfo')
  console.log('userInfo from localStorage:', userInfoStr)
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
      console.log('parsed userInfo:', userInfo.value)
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  } else {
    console.warn('未找到用户信息，请先登录')
  }
  initWeather()
})

// 日历相关方法
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
  
  // 上个月的日期
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    days.push({
      day,
      fullDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isOtherMonth: true
    })
  }
  
  // 当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      day,
      fullDate,
      isOtherMonth: false,
      isToday: fullDate === todayStr
    })
  }
  
  // 下个月的日期（补齐到42个，6行7列）
  const remaining = 42 - days.length
  for (let day = 1; day <= remaining; day++) {
    days.push({
      day,
      fullDate: `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isOtherMonth: true
    })
  }
  
  return days
})

const selectedDateStr = computed(() => {
  const d = selectedDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const selectDate = (day) => {
  selectedDate.value = new Date(day.fullDate)
}

// 用户信息相关
const getAvatarText = (name) => {
  if (!name) return '?'
  return name.length > 2 ? name.substring(name.length - 2) : name
}

const getUserTypeName = (type) => {
  const map = {
    1: '学生',
    2: '教工',
    3: '管理员'
  }
  return map[type] || '未知'
}

// 天气相关
const getWeatherEmoji = (condition) => {
  const emojiMap = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '雨': '🌧️',
    '雪': '❄️',
    '雾': '🌫️',
    '霾': '🌫️'
  }
  return emojiMap[condition] || '🌤️'
}

const requestLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationGranted.value = true
        const { latitude, longitude } = position.coords
        fetchWeatherByCoords(latitude, longitude)
      },
      (error) => {
        console.error('获取位置失败:', error)
        weatherError.value = '无法获取位置信息，使用默认位置（北京）'
        fetchWeatherByCity('北京')
      }
    )
  } else {
    weatherError.value = '浏览器不支持位置服务，使用默认位置（北京）'
    fetchWeatherByCity('北京')
  }
}

const fetchWeatherByCoords = async (lat, lon) => {
  weatherLoading.value = true
  weatherError.value = null
  
  try {
    const weatherAPI = await import('../api/weather.js')
    const result = await weatherAPI.getWeatherByCoords(lat, lon)
    
    if (result.success) {
      weather.value = result.data
    } else {
      throw new Error('获取天气失败')
    }
  } catch (error) {
    console.error('获取天气失败:', error)
    weatherError.value = '获取天气信息失败，请稍后重试'
  } finally {
    weatherLoading.value = false
  }
}

const fetchWeatherByCity = async (city = '北京') => {
  weatherLoading.value = true
  weatherError.value = null
  
  try {
    const weatherAPI = await import('../api/weather.js')
    const result = await weatherAPI.getWeatherByCity(city)
    
    if (result.success) {
      weather.value = result.data
    } else {
      throw new Error('获取天气失败')
    }
  } catch (error) {
    console.error('获取天气失败:', error)
    weatherError.value = '获取天气信息失败，请稍后重试'
  } finally {
    weatherLoading.value = false
  }
}

const initWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationGranted.value = true
        const { latitude, longitude } = position.coords
        fetchWeatherByCoords(latitude, longitude)
      },
      () => {
        fetchWeatherByCity('北京')
      }
    )
  } else {
    fetchWeatherByCity('北京')
  }
}
</script>

<style scoped>
.home-dashboard {
  padding: 2.5rem;
  background: #ffffff;
  min-height: calc(100vh - 200px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
  font-size: 1rem;
  text-align: center;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  letter-spacing: -0.01em;
}

/* 用户信息卡片 */
.user-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f5f5f7;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-text {
  color: #1d1d1f;
  font-size: 2rem;
  font-weight: 600;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.5rem;
}

.info-item .label {
  color: #6e6e73;
  font-weight: 400;
  font-size: 0.9375rem;
}

.info-item .value {
  color: #1d1d1f;
  font-weight: 500;
  font-size: 0.9375rem;
}

/* 日历卡片 */
.calendar-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.month-year {
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: -0.01em;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #1d1d1f;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f5f5f7;
  border-color: #d2d2d7;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 500;
  color: #6e6e73;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #1d1d1f;
}

.calendar-day:hover {
  background: #f5f5f7;
}

.calendar-day.other-month {
  color: #d2d2d7;
}

.calendar-day.today {
  background: #0071e3;
  color: white;
  font-weight: 600;
}

.calendar-day.selected {
  background: #1d1d1f;
  color: white;
  font-weight: 600;
}

/* 天气卡片 */
.weather-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.weather-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6e6e73;
  font-size: 0.9375rem;
  margin-bottom: 1rem;
}

.location-btn {
  margin-left: auto;
  padding: 0.375rem 0.75rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.location-btn:hover {
  background: #333333;
}

.weather-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.weather-emoji {
  font-size: 3rem;
}

.temp-value {
  font-size: 2.5rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: -0.02em;
}

.temp-desc {
  font-size: 0.9375rem;
  color: #6e6e73;
}

.weather-details {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.detail-label {
  font-size: 0.8125rem;
  color: #6e6e73;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
}
</style>

