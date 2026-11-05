<template>
  <div class="page stack">
    <section class="card preview-card">
      <h2>{{ title }}</h2>
      <p class="sub">功能开发中，敬请期待…</p>
      <router-link class="btn btn-primary" to="/home/dashboard">返回首页</router-link>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.title || '功能页面')
</script>
