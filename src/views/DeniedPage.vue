<template>
  <div class="page">
    <section class="card empty">
      <h2>当前身份无法访问</h2>
      <p>这个页面不在你的菜单里。请从侧栏或底部导航进入可以办理的功能。</p>
      <router-link class="btn btn-primary" :to="landingPath()">返回工作台</router-link>
    </section>
  </div>
</template>

<script setup>
import { landingPath } from '../nav.js'
</script>
