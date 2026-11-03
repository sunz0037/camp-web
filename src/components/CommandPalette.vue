<template>
  <div v-if="ui.palette" class="modal-mask" @click.self="close">
    <div class="palette" role="dialog" aria-label="菜单快捷跳转">
      <input ref="inputRef" v-model="keyword" placeholder="搜索菜单" @keydown.esc="close" @keydown.enter="goActive" />
      <button
        v-for="(item, index) in results"
        :key="item.name"
        type="button"
        class="hit"
        :class="{ active: index === active }"
        @mouseenter="active = index"
        @click="go(item)"
      >
        <span>{{ item.label }}</span>
        <small class="muted">{{ item.path }}{{ item.note ? ` · ${item.note}` : '' }}</small>
      </button>
      <p v-if="!results.length" class="empty" style="padding: 24px">没有匹配的菜单</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PHASE_ROUTES, navLabel } from '../nav.js'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const keyword = ref('')
const active = ref(0)
const inputRef = ref(null)

const results = computed(() => {
  const role = auth.user?.role
  const query = keyword.value.trim()
  return PHASE_ROUTES
    .filter((route) => role && route.meta.roles.includes(role))
    .map((route) => ({
      name: route.name,
      label: navLabel(route, role),
      note: route.meta.noteTitle || '',
      path: `/home/${route.path}`
    }))
    .filter((item) => !query || item.label.includes(query))
})

watch(() => ui.palette, async (open) => {
  if (!open) return
  keyword.value = ''
  active.value = 0
  await nextTick()
  inputRef.value?.focus()
})

watch(results, () => {
  active.value = 0
})

function close() {
  ui.closePalette()
}

function go(item) {
  close()
  router.push(item.path)
}

function goActive() {
  const item = results.value[active.value]
  if (item) go(item)
}
</script>
