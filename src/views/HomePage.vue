<template>
  <div class="home-page">
    <SidebarMenu @logout="handleLogout" />

    <div class="content-wrapper">
      <!-- 顶部导航栏 - 玻璃拟态 -->
      <header class="header">
        <div class="header-content">
          <div class="header-left">
            <h2 class="header-title">{{ greeting }}，{{ getUserName() }}</h2>
            <p class="header-subtitle">这是校园今日动态概览</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SidebarMenu from '../components/SidebarMenu.vue'

const router = useRouter()
const searchKeyword = ref('')

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
  min-height: 100vh;
  background: var(--bg-soft);
  display: flex;
}

.content-wrapper {
  flex: 1;
  margin-left: 288px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background: rgba(248, 247, 244, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-refined);
  padding: 1.75rem 3rem;
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

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-charcoal);
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
  gap: 1.5rem;
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
  width: 288px;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  background: white;
  border: 1px solid var(--border-refined);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--text-main);
  transition: all 0.2s;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
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
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid var(--border-refined);
  border-radius: 50%;
  color: var(--primary-charcoal);
  position: relative;
}

.icon-btn:hover {
  background: var(--bg-slate-100);
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
  background: var(--accent-lavender);
  border-radius: 50%;
  border: 2px solid white;
}

.logout-btn {
  padding: 0.625rem 1.5rem;
  background: var(--primary-charcoal);
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

.logout-btn:hover {
  opacity: 0.9;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  min-height: calc(100vh - 88px);
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  .search-input {
    width: 100%;
  }
}
</style>
