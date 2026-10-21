<template>
  <aside class="sidebar-menu">
    <!-- Logo -->
    <div class="menu-header">
      <div class="logo-wrap">
        <div class="logo-icon">
          <iconify-icon icon="lucide:graduation-cap"></iconify-icon>
        </div>
        <h2 class="menu-title">校园OA</h2>
      </div>
    </div>

    <nav class="menu-nav">
      <p class="nav-label">功能菜单</p>

      <!-- 首页 -->
      <router-link to="/home" class="menu-item" :class="{ active: isDashboard }">
        <iconify-icon icon="lucide:layout-dashboard" class="menu-icon"></iconify-icon>
        <span class="menu-text">首页概览</span>
      </router-link>

      <!-- 学生相关 -->
      <router-link
        to="/home/students"
        class="menu-item"
        :class="{ active: $route.path === '/home/students' }"
      >
        <iconify-icon icon="lucide:users" class="menu-icon"></iconify-icon>
        <span class="menu-text">学生信息管理</span>
      </router-link>

      <router-link
        to="/home/emergency-contacts"
        class="menu-item"
        :class="{ active: $route.path === '/home/emergency-contacts' }"
      >
        <iconify-icon icon="lucide:phone-call" class="menu-icon"></iconify-icon>
        <span class="menu-text">应急联系人管理</span>
      </router-link>

      <router-link
        to="/home/attendance"
        class="menu-item"
        :class="{ active: $route.path === '/home/attendance' }"
      >
        <iconify-icon icon="lucide:clipboard-check" class="menu-icon"></iconify-icon>
        <span class="menu-text">考勤管理</span>
      </router-link>

      <!-- 教学教务 -->
      <router-link
        to="/home/courses"
        class="menu-item"
        :class="{ active: $route.path === '/home/courses' }"
      >
        <iconify-icon icon="lucide:book-open" class="menu-icon"></iconify-icon>
        <span class="menu-text">科目管理</span>
      </router-link>

      <router-link
        to="/home/exam-schedules"
        class="menu-item"
        :class="{ active: $route.path === '/home/exam-schedules' }"
      >
        <iconify-icon icon="lucide:calendar-check" class="menu-icon"></iconify-icon>
        <span class="menu-text">考试安排管理</span>
      </router-link>

      <router-link
        to="/home/scores"
        class="menu-item"
        :class="{ active: $route.path === '/home/scores' }"
      >
        <iconify-icon icon="lucide:check-circle" class="menu-icon"></iconify-icon>
        <span class="menu-text">考试成绩管理</span>
      </router-link>

      <!-- 系统管理 -->
      <router-link
        to="/home/grades"
        class="menu-item"
        :class="{ active: $route.path === '/home/grades' }"
      >
        <iconify-icon icon="lucide:layers" class="menu-icon"></iconify-icon>
        <span class="menu-text">年级管理</span>
      </router-link>

      <router-link
        to="/home/classes"
        class="menu-item"
        :class="{ active: $route.path === '/home/classes' }"
      >
        <iconify-icon icon="lucide:users-2" class="menu-icon"></iconify-icon>
        <span class="menu-text">班级管理</span>
      </router-link>

      <router-link
        to="/home/class-courses"
        class="menu-item"
        :class="{ active: $route.path === '/home/class-courses' }"
      >
        <iconify-icon icon="lucide:book-copy" class="menu-icon"></iconify-icon>
        <span class="menu-text">班级授课科目</span>
      </router-link>

      <router-link
        to="/home/users"
        class="menu-item"
        :class="{ active: $route.path === '/home/users' }"
      >
        <iconify-icon icon="lucide:id-card" class="menu-icon"></iconify-icon>
        <span class="menu-text">用户管理</span>
      </router-link>

      <router-link
        to="/home/roles"
        class="menu-item"
        :class="{ active: $route.path === '/home/roles' }"
      >
        <iconify-icon icon="lucide:shield" class="menu-icon"></iconify-icon>
        <span class="menu-text">角色权限管理</span>
      </router-link>

      <router-link
        to="/home/data-permissions"
        class="menu-item"
        :class="{ active: $route.path === '/home/data-permissions' }"
      >
        <iconify-icon icon="lucide:key-round" class="menu-icon"></iconify-icon>
        <span class="menu-text">数据查询权限</span>
      </router-link>

      <router-link
        to="/home/teacher-classes"
        class="menu-item"
        :class="{ active: $route.path === '/home/teacher-classes' }"
      >
        <iconify-icon icon="lucide:school" class="menu-icon"></iconify-icon>
        <span class="menu-text">教师班级关联</span>
      </router-link>

      <router-link
        to="/home/grade-admin-grades"
        class="menu-item"
        :class="{ active: $route.path === '/home/grade-admin-grades' }"
      >
        <iconify-icon icon="lucide:user-cog" class="menu-icon"></iconify-icon>
        <span class="menu-text">年级管理员关联</span>
      </router-link>

      <!-- 校园与数据 -->
      <router-link
        to="/home/announcements"
        class="menu-item"
        :class="{ active: $route.path === '/home/announcements' }"
      >
        <iconify-icon icon="lucide:megaphone" class="menu-icon"></iconify-icon>
        <span class="menu-text">校园公告管理</span>
      </router-link>

      <router-link
        to="/home/visitors"
        class="menu-item"
        :class="{ active: $route.path === '/home/visitors' }"
      >
        <iconify-icon icon="lucide:badge-check" class="menu-icon"></iconify-icon>
        <span class="menu-text">来访登记管理</span>
      </router-link>

      <router-link
        to="/home/batch-operations"
        class="menu-item"
        :class="{ active: $route.path === '/home/batch-operations' }"
      >
        <iconify-icon icon="lucide:database" class="menu-icon"></iconify-icon>
        <span class="menu-text">批量导入导出</span>
      </router-link>

      <router-link
        to="/home/statistics"
        class="menu-item"
        :class="{ active: $route.path === '/home/statistics' }"
      >
        <iconify-icon icon="lucide:bar-chart-3" class="menu-icon"></iconify-icon>
        <span class="menu-text">统计报表</span>
      </router-link>

      <!-- 个人中心 -->
      <router-link
        to="/home/profile"
        class="menu-item"
        :class="{ active: $route.path === '/home/profile' }"
      >
        <iconify-icon icon="lucide:user" class="menu-icon"></iconify-icon>
        <span class="menu-text">个人信息</span>
      </router-link>

      <router-link
        to="/home/change-password"
        class="menu-item"
        :class="{ active: $route.path === '/home/change-password' }"
      >
        <iconify-icon icon="lucide:lock" class="menu-icon"></iconify-icon>
        <span class="menu-text">修改密码</span>
      </router-link>
    </nav>

    <!-- 用户卡片 -->
    <div class="user-card">
      <div class="user-card-inner">
        <div class="user-avatar">{{ getAvatarText(userName) }}</div>
        <div class="user-info">
          <p class="user-name">{{ userName || '用户' }}</p>
          <p class="user-role">{{ userRole }}</p>
        </div>
        <a href="#" class="logout-icon" title="退出登录" @click.prevent="$emit('logout')">
          <iconify-icon icon="lucide:log-out"></iconify-icon>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userName = ref('')
const userRole = ref('')

const isDashboard = computed(() => route.path === '/home' || route.path === '/home/')

const emit = defineEmits(['logout'])

const getAvatarText = (name) => {
  if (!name) return '用'
  return name.length >= 2 ? name.slice(-2) : name
}

const loadUserInfo = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const info = JSON.parse(userInfoStr)
      userName.value = info.realName || info.username || '用户'
      const roleMap = { 1: '学生', 2: '教工', 3: '管理员' }
      userRole.value = roleMap[info.userType] || '用户'
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.sidebar-menu {
  width: 288px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-refined);
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 2rem 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--primary-charcoal);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.logo-icon iconify-icon {
  font-size: 1.25rem;
}

.menu-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-charcoal);
  letter-spacing: -0.02em;
}

.menu-nav {
  flex: 1;
  padding: 0.5rem 0.75rem 1rem;
}

.nav-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-slate-400);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
  padding: 0 1rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-slate-600);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 16px;
  margin-bottom: 2px;
}

.menu-item .menu-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.menu-item .menu-text {
  flex: 1;
}

.menu-item:hover {
  background: rgba(167, 139, 250, 0.05);
  color: var(--primary-charcoal);
}

.menu-item.active {
  background: var(--accent-lavender-soft);
  color: var(--primary-charcoal) !important;
}

.user-card {
  padding: 1.5rem 1rem;
  margin-top: auto;
}

.user-card-inner {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(167, 139, 250, 0.1);
  color: var(--accent-lavender);
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-slate-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-slate-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-icon {
  color: var(--text-slate-400);
  padding: 0.25rem;
  border-radius: 8px;
  transition: color 0.2s;
}

.logout-icon:hover {
  color: #ef4444;
}

.sidebar-menu::-webkit-scrollbar {
  width: 5px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: var(--border-slate-200);
  border-radius: 10px;
}

@media (max-width: 768px) {
  .sidebar-menu {
    width: 260px;
  }
}
</style>
