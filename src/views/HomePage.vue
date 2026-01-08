<template>
  <div class="home-page">
    <!-- 左侧菜单栏 -->
    <SidebarMenu @collapse-change="handleMenuCollapse" />
    
    <!-- 右侧内容区域 -->
    <div class="content-wrapper" :class="{ 'menu-collapsed': isMenuCollapsed }">
      <!-- 顶部导航栏 -->
      <header class="header">
        <div class="header-content">
          <h1 class="logo">校园OA系统</h1>
          <div class="user-info-header">
            <span class="welcome-text">欢迎，{{ getUserName() }}</span>
            <button class="logout-btn" @click="handleLogout">退出登录</button>
          </div>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SidebarMenu from '../components/SidebarMenu.vue'

const router = useRouter()
const isMenuCollapsed = ref(false)

// 处理菜单收起状态变化
const handleMenuCollapse = (collapsed) => {
  isMenuCollapsed.value = collapsed
}

// 获取用户名
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

// 退出登录
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
  background: #ffffff;
  display: flex;
}

.content-wrapper {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  transition: margin-left 0.3s ease;
}

/* 当菜单收起时，调整内容区域边距 */
.home-page:has(.sidebar-menu.collapsed) .content-wrapper {
  margin-left: 64px;
}

/* 当菜单收起时，调整内容区域边距 */
.home-page:has(.sidebar-menu.collapsed) .content-wrapper {
  margin-left: 64px;
}

.header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  margin: 0;
  letter-spacing: -0.01em;
}

.user-info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  color: #1d1d1f;
  font-size: 0.9375rem;
  margin-right: 1rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background: #333333;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
  min-height: calc(100vh - 80px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .main-content {
    padding: 1.5rem;
  }
}
</style>

