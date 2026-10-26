<template>
  <div class="home-page">
    <button
      v-if="menuOpen"
      type="button"
      class="scrim"
      aria-label="关闭菜单"
      @click="menuOpen = false"
    ></button>
    <SidebarMenu :mobile-open="menuOpen" @logout="handleLogout" />

    <div class="content-wrapper">
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <button type="button" class="header-btn menu-toggle" aria-label="打开菜单" @click="menuOpen = true">
              <iconify-icon icon="lucide:menu"></iconify-icon>
            </button>
            <div>
            <h2 class="header-title">{{ greeting }}，{{ getUserName() }}</h2>
            <p class="header-subtitle">{{ pageSubtitle }}</p>
            </div>
          </div>
          <div class="header-right">
            <div class="search-wrap">
              <iconify-icon icon="lucide:search" class="search-icon"></iconify-icon>
              <input type="text" placeholder="搜索..." class="search-input" v-model="searchKeyword" />
            </div>
            <button class="header-btn icon-btn" title="通知">
              <iconify-icon icon="lucide:bell"></iconify-icon>
              <span class="notification-dot"></span>
            </button>
            <button class="header-btn logout-btn" @click="handleLogout">退出登录</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarMenu from '../components/SidebarMenu.vue'

const router = useRouter()
const route = useRoute()
const searchKeyword = ref('')
const menuOpen = ref(false)

watch(() => route.path, () => {
  menuOpen.value = false
})

const pageSubtitle = computed(() => {
  if (route.name === 'HomeDashboard') return '这是校园今日动态概览'
  return route.meta.title || '校园办公'
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '上午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const getUserName = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.realName || '用户'
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }
  return '用户'
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
}
</script>

<style scoped>
.home-page {
  height: 100vh;
  background: var(--bg-soft);
  display: flex;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}

.header {
  background: #fff;
  border-bottom: 1px solid #f4f4f5;
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu-toggle {
  display: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  color: #18181b;
}

.scrim {
  display: none;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #18181b;
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  color: var(--text-slate-400);
}

.search-input {
  width: 18rem;
  padding: 0.5rem 1rem 0.5rem 2.75rem;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #18181b;
  transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out;
}

.search-input::placeholder {
  color: #a1a1aa;
}

.search-input:focus {
  outline: none;
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: #fafafa;
  border: 1px solid #e4e4e7;
  border-radius: 0.75rem;
  color: #18181b;
  position: relative;
}

.icon-btn:hover {
  background: #fff;
  transform: translateY(-1px);
}

.icon-btn:active,
.logout-btn:active {
  transform: scale(0.95);
}

.icon-btn iconify-icon {
  font-size: 1.25rem;
}

.notification-dot {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  width: 6px;
  height: 6px;
  background: #ea580c;
  border-radius: 50%;
  border: 2px solid white;
}

.logout-btn {
  padding: 0.5rem 1.5rem;
  background: #18181b;
  color: white;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn:hover {
  background: #27272a;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  min-height: 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .scrim {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 90;
    border: 0;
    background: rgba(24, 24, 27, 0.4);
  }
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .header-title {
    font-size: 1.25rem;
  }
  .logout-btn {
    white-space: nowrap;
    flex-shrink: 0;
  }
  .search-wrap,
  .search-input {
    width: 100%;
  }
  .header-right {
    width: 100%;
  }
}
</style>
