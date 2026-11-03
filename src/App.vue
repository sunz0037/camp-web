<template>
  <router-view />
  <div class="toast-wrap" aria-live="polite">
    <div v-for="item in ui.toasts" :key="item.id" class="toast" :class="item.type">
      {{ item.message }}
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from './stores/ui.js'

const ui = useUiStore()
</script>
