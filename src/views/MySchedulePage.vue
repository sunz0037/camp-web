<template>
  <div class="page stack">
    <section class="card block">
      <p v-if="loadError" :class="netHint(loadError) ? 'load-hint' : 'error-text'">{{ loadError }}</p>
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
import { periodLabel, weekdayLabel } from '../utils/format.js'

const loadError = ref('')

function netHint(message) {
  return String(message).split('；').every((part) => part === '网络不可用' || part === '服务暂不可用')
}
const items = ref([])
const ordered = computed(() => [...items.value].sort((a, b) => a.weekday - b.weekday || a.periodStart - b.periodStart))

onMounted(async () => {
  try {
    items.value = await fetchMyTimetable()
  } catch (error) {
    items.value = []
    loadError.value = error.message || '课表加载失败'
  }
})
</script>
