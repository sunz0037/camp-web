<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <h1>{{ pageTitle }}</h1>
      <p>功能开发中，敬请期待...</p>
      <router-link to="/home/" class="back-btn">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || '功能页面')
</script>

<style scoped>
.placeholder-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.placeholder-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.placeholder-content h1 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 2rem;
}

.placeholder-content p {
  margin: 0 0 2rem;
  color: #666;
  font-size: 1.1rem;
}

.back-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #5568d3;
}
</style>

