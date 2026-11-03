<template>
  <div class="shell">
    <aside class="sidebar">
      <router-link class="brand" to="/home">
        <span class="brand-mark"><AppIcon name="GraduationCap" :size="16" /></span>
        校园OA
      </router-link>
      <nav class="side-nav">
        <router-link
          v-for="item in sideItems"
          :key="item.name"
          class="nav-link"
          active-class="active"
          :to="item.to"
        >
          <AppIcon :name="item.icon" :size="16" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="shell-main">
      <header class="topbar">
        <nav class="crumb" aria-label="面包屑">
          <router-link to="/home/dashboard">校园OA</router-link>
          <span>/</span>
          <strong>{{ crumb }}</strong>
        </nav>
        <button class="jump" type="button" @click="ui.openPalette()">
          <AppIcon name="Search" :size="16" />
          <span>搜索菜单</span>
        </button>
        <div class="top-user">
          <div class="avatar">{{ avatar }}</div>
          <div>
            <strong>{{ auth.user?.name }}</strong>
            <span>{{ auth.user?.title }}</span>
          </div>
          <button class="btn btn-danger" type="button" @click="logout">退出登录</button>
        </div>
      </header>
      <PcOnly v-if="blocked" />
      <router-view v-else />
    </div>

    <nav class="tabbar" aria-label="手机端导航">
      <router-link
        v-for="item in MOBILE_NAV"
        :key="item.name"
        class="tab"
        active-class="active"
        :to="item.to"
      >
        <AppIcon :name="item.icon" :size="18" />
        {{ item.label }}
      </router-link>
    </nav>

    <CommandPalette />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import PcOnly from '../components/PcOnly.vue'
import CommandPalette from '../components/CommandPalette.vue'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { resetRouteInstall } from '../router/index.js'
import { MOBILE_NAV, PHASE_ROUTES, inSidebar, navLabel } from '../nav.js'
import { useViewport } from '../composables/useViewport.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const { isMobile } = useViewport()

const sideItems = computed(() => {
  const role = auth.user?.role
  return PHASE_ROUTES.filter((item) => inSidebar(item, role)).map((item) => ({
    name: item.name,
    icon: item.meta.icon,
    label: navLabel(item, role),
    to: `/home/${item.path}`
  }))
})

const avatar = computed(() => {
  const title = auth.user?.title || ''
  if (title === '教师') return '教'
  if (title === '学生') return '学'
  if (title === '家长') return '家'
  if (title === '教务') return '务'
  return '管'
})

const blocked = computed(() => isMobile.value && route.meta.pcOnly === true)
const crumb = computed(() => route.meta.title || '工作台')

function logout() {
  auth.logout()
  resetRouteInstall()
  router.replace('/login')
}

function onKey(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (ui.palette) ui.closePalette()
    else ui.openPalette()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
