<template>
  <div class="table-foot">
    <span>{{ summary }}</span>
    <div class="pager">
      <button type="button" :disabled="page <= 1" @click="$emit('update:page', page - 1)">上一页</button>
      <template v-for="(n, index) in pageList" :key="n">
        <span v-if="index > 0 && n - pageList[index - 1] > 1">…</span>
        <button type="button" :class="{ active: n === page }" @click="$emit('update:page', n)">{{ n }}</button>
      </template>
      <button type="button" :disabled="page >= pageCount" @click="$emit('update:page', page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: { type: String, default: '' },
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  pageList: { type: Array, default: () => [] }
})

defineEmits(['update:page'])
</script>
