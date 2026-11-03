<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>我的课表</h1>
        <p>{{ hint }}</p>
        <p v-if="loadError" class="error-text">{{ loadError }}</p>
      </div>
    </header>
    <section class="card block">
      <ul v-if="items.length" class="week-list" style="margin-bottom: 16px">
        <li v-for="item in ordered" :key="item.id">
          <span><strong>{{ weekdayLabel(item.weekday) }}</strong> · {{ item.name }}</span>
          <span class="num muted">{{ periodLabel(item.periodStart, item.periodEnd) }} 节 · {{ item.roomNo }}</span>
        </li>
      </ul>
      <ScheduleBoard :items="items" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ScheduleBoard from '../components/ScheduleBoard.vue'
import { fetchMyTimetable } from '../api/course.js'
import { useAuthStore } from '../stores/auth.js'
import { periodLabel, weekdayLabel } from '../utils/format.js'

const auth = useAuthStore()
const loadError = ref('')
const items = ref([])
const ordered = computed(() => [...items.value].sort((a, b) => a.weekday - b.weekday || a.periodStart - b.periodStart))
const hint = computed(() => {
  if (auth.user?.role === 'TEACHER') return '任课课表来自 /api/v1/class-courses/my-timetable。'
  if (auth.user?.actor === 'PARENT') return `${auth.user.linkedStudentName || '关联学生'} 的班级课表，只读。`
  return '本班课表来自 /api/v1/class-courses/my-timetable，只读。'
})

onMounted(async () => {
  try {
    items.value = await fetchMyTimetable()
  } catch (error) {
    items.value = []
    loadError.value = error.message || '课表加载失败'
  }
})
</script>
