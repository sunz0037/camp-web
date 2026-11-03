<template>
  <div>
    <div v-if="!items.length" class="empty" style="padding: 28px">
      <h2 style="font-size: 18px">本周没有课程</h2>
      <p>课表按星期、开始节次、结束节次和教室展示。</p>
    </div>
    <div v-else class="board">
      <div class="board-row">
        <span class="board-period">节次</span>
        <span v-for="day in days" :key="day" class="board-period">{{ weekdayLabel(day) }}</span>
      </div>
      <div v-for="row in rows" :key="row" class="board-row">
        <span class="board-period num">{{ row }}</span>
        <div v-for="day in days" :key="`${row}-${day}`" class="board-cell">
          <div v-for="item in cell(day, row)" :key="item.id" class="chip">
            <strong>{{ item.name }}</strong>
            <small>{{ item.className }} · {{ item.roomNo }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { periodLabel, weekdayLabel } from '../utils/format.js'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const days = [1, 2, 3, 4, 5]

const rows = computed(() => {
  const set = new Set(props.items.map((item) => periodLabel(item.periodStart, item.periodEnd)))
  return [...set].sort((a, b) => Number(a.split('-')[0]) - Number(b.split('-')[0]))
})

function cell(day, row) {
  return props.items.filter((item) => item.weekday === day && periodLabel(item.periodStart, item.periodEnd) === row)
}
</script>
