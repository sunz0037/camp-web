<template>
  <div class="placeholder-page bento-page">
    <section class="placeholder-hero">
      <h1>{{ pageTitle }}</h1>
      <p>这一块还在整理。你可以先回到首页查看今日概览，或从左侧菜单进入已经可用的管理功能。</p>
      <router-link to="/home/" class="btn-primary back-btn">返回首页</router-link>
    </section>
    <article class="placeholder-tile tile-warm">
      <strong>建设中</strong>
      <span>页面结构已按便当盒留好，功能接入后会放在大卡片里。</span>
    </article>
    <article class="placeholder-tile tile-mint">
      <strong>数据稍后</strong>
      <span>统计和导入导出不会提前堆进同一张卡片。</span>
    </article>
    <article class="placeholder-tile">
      <strong>从菜单继续</strong>
      <span>信息、教学、考试和权限都已经可以打开。</span>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || '功能页面')
</script>
