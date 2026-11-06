<template>
  <div class="shell">
    <aside class="sidebar">
      <router-link class="brand" to="/home">
        <span class="brand-mark"><AppIcon name="GraduationCap" :size="16" /></span>
        校园OA
      </router-link>
      <nav class="side-nav">
        <p class="nav-label">功能菜单</p>
        <router-link
          v-for="item in sideItems"
          :key="item.key"
          class="nav-link"
          :class="{ active: item.active }"
          :to="item.to"
        >
          <span class="nav-ico" :class="`nav-ico-${item.icon}`">
            <AppIcon :name="item.icon" :size="15" />
          </span>
          <span class="nav-text">{{ item.label }}</span>
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
          <span>搜索…</span>
        </button>
        <div class="top-user">
          <button class="note-btn" type="button" aria-label="通知">
            <AppIcon name="Bell" :size="16" />
            <span class="note-badge">3</span>
          </button>
          <div class="user-menu" ref="userMenu">
            <button class="user-pill" type="button" aria-haspopup="menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
              <div class="avatar">{{ avatar }}</div>
              <div>
                <strong>{{ auth.user?.name }}</strong>
                <span>{{ auth.user?.title }}</span>
              </div>
              <AppIcon name="ChevronDown" :size="14" />
            </button>
            <div v-if="menuOpen" class="user-drop" role="menu">
              <router-link role="menuitem" to="/home/profile" @click="menuOpen = false">个人信息</router-link>
              <router-link role="menuitem" to="/home/change-password" @click="menuOpen = false">修改密码</router-link>
              <button role="menuitem" type="button" @click="logout">退出登录</button>
            </div>
          </div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import PcOnly from '../components/PcOnly.vue'
import CommandPalette from '../components/CommandPalette.vue'
import { useAuthStore } from '../stores/auth.js'
import { useUiStore } from '../stores/ui.js'
import { resetRouteInstall } from '../router/index.js'
import { MOBILE_NAV, PHASE_ROUTES, inSidebar, navLabel, sidebarLinks } from '../nav.js'
import { useViewport } from '../composables/useViewport.js'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const { isMobile } = useViewport()
const menuOpen = ref(false)
const userMenu = ref(null)

const sideItems = computed(() => {
  const role = auth.user?.role
  return PHASE_ROUTES.filter((item) => inSidebar(item, role)).flatMap((item) => {
    return sidebarLinks(item).map((link) => {
      const active = route.name === item.name && Object.entries(link.query).every(([key, value]) => {
        const current = route.query[key]
        return (current || (item.name === 'OrgClasses' && key === 'tab' ? 'classes' : '')) === value
      })
      return {
        key: `${item.name}-${link.key}`,
        icon: link.icon,
        label: item.name === 'Attendance' ? navLabel(item, role) : link.title,
        active,
        to: { path: `/home/${item.path}`, query: link.query }
      }
    })
  })
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
const crumb = computed(() => {
  const item = PHASE_ROUTES.find((entry) => entry.name === route.name)
  return item ? navLabel(item, auth.user?.role, route.query) : (route.meta.title || '工作台')
})

function logout() {
  auth.logout()
  resetRouteInstall()
  router.replace('/login')
}

function onKey(event) {
  if (event.key === 'Escape') menuOpen.value = false
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (ui.palette) ui.closePalette()
    else ui.openPalette()
  }
}

function onPointer(event) {
  if (!userMenu.value?.contains(event.target)) menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onPointer)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('pointerdown', onPointer)
})
</script>
