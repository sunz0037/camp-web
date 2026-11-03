<template>
  <div class="page stack">
    <header class="page-head">
      <div>
        <h1>我的课表</h1>
        <p>{{ hint }}</p>
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
import { computed } from 'vue'
import ScheduleBoard from '../components/ScheduleBoard.vue'
import { useAuthStore } from '../stores/auth.js'
import { useCampusStore } from '../stores/campus.js'
import { periodLabel, weekdayLabel } from '../utils/format.js'

const auth = useAuthStore()
const campus = useCampusStore()
const items = computed(() => campus.schedulesFor(auth.user))
const ordered = computed(() => [...items.value].sort((a, b) => a.weekday - b.weekday || a.periodStart - b.periodStart))
const hint = computed(() => {
  if (auth.user?.role === 'TEACHER') return '任课课表，按星期、开始节次、结束节次和教室排列。'
  if (auth.user?.actor === 'PARENT') return `${auth.user.linkedStudentName || '关联学生'} 的班级课表，只读。`
  return '本班课表，只读。'
})
</script>
