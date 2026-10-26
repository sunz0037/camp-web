<template>
  <aside class="sidebar-menu" :class="{ open: mobileOpen }">
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

      <router-link to="/home" class="menu-item" :class="{ active: isDashboard }" title="首页概览">
        <iconify-icon icon="lucide:layout-dashboard" class="menu-icon"></iconify-icon>
        <span class="menu-text">首页概览</span>
      </router-link>

      <div v-for="group in menuGroups" :key="group.id" class="menu-group">
        <button
          type="button"
          class="menu-item menu-group-btn"
          :class="{ active: isGroupActive(group), open: openGroupId === group.id }"
          :title="group.label"
          @click="toggleGroup(group.id)"
        >
          <iconify-icon :icon="group.icon" class="menu-icon"></iconify-icon>
          <span class="menu-text">{{ group.label }}</span>
          <iconify-icon
            icon="lucide:chevron-down"
            class="menu-chevron"
            :class="{ open: openGroupId === group.id }"
          ></iconify-icon>
        </button>
        <div v-show="openGroupId === group.id" class="submenu">
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="menu-item submenu-item"
            :class="{ active: route.path === item.to }"
          >
            <span class="menu-text">{{ item.label }}</span>
          </router-link>
        </div>
      </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  mobileOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['logout'])

const route = useRoute()
const userName = ref('')
const userRole = ref('')

const menuGroups = [
  {
    id: 'info',
    label: '信息管理',
    icon: 'lucide:users',
    items: [
      { label: '学生信息', to: '/home/students' },
      { label: '应急联系人', to: '/home/emergency-contacts' },
      { label: '年级', to: '/home/grades' },
      { label: '班级', to: '/home/classes' },
      { label: '教师班级', to: '/home/teacher-classes' },
      { label: '年级管理员', to: '/home/grade-admin-grades' }
    ]
  },
  {
    id: 'teaching',
    label: '教学管理',
    icon: 'lucide:book-open',
    items: [
      { label: '科目', to: '/home/courses' },
      { label: '班级授课', to: '/home/class-courses' },
      { label: '考勤', to: '/home/attendance' }
    ]
  },
  {
    id: 'exam',
    label: '考试管理',
    icon: 'lucide:calendar-check',
    items: [
      { label: '考试安排', to: '/home/exam-schedules' },
      { label: '考试成绩', to: '/home/scores' }
    ]
  },
  {
    id: 'permission',
    label: '权限管理',
    icon: 'lucide:shield',
    items: [
      { label: '用户', to: '/home/users' },
      { label: '角色权限', to: '/home/roles' },
      { label: '数据权限', to: '/home/data-permissions' }
    ]
  },
  {
    id: 'campus',
    label: '校园管理',
    icon: 'lucide:megaphone',
    items: [
      { label: '校园公告', to: '/home/announcements' },
      { label: '来访登记', to: '/home/visitors' }
    ]
  },
  {
    id: 'data',
    label: '数据管理',
    icon: 'lucide:database',
    items: [
      { label: '导入导出', to: '/home/batch-operations' },
      { label: '统计报表', to: '/home/statistics' }
    ]
  },
  {
    id: 'account',
    label: '个人中心',
    icon: 'lucide:user',
    items: [
      { label: '个人信息', to: '/home/profile' },
      { label: '修改密码', to: '/home/change-password' }
    ]
  }
]

const openGroupId = ref(null)

const isDashboard = computed(() => route.path === '/home' || route.path === '/home/')

const activeGroupId = computed(() => {
  const group = menuGroups.find((item) => item.items.some((child) => child.to === route.path))
  return group ? group.id : null
})

watch(activeGroupId, (id) => {
  if (id) openGroupId.value = id
}, { immediate: true })

const toggleGroup = (id) => {
  openGroupId.value = openGroupId.value === id ? null : id
}

const isGroupActive = (group) => group.id === activeGroupId.value


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
  width: 220px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #f4f4f5;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.menu-header {
  padding: 1.25rem 0.75rem 0.5rem 1.5rem;
  display: flex;
  align-items: center;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: #18181b;
  border-radius: 0.75rem;
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
  font-size: 0.75rem;
  font-weight: 500;
  color: #a1a1aa;
  margin: 0 0 0.75rem;
  padding-left: 0.75rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
  color: var(--text-slate-600);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
}

.menu-item .menu-icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
  transition: transform 0.2s ease-out, color 0.2s ease-out;
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

.menu-item .menu-text {
  flex: 1;
}

.menu-item:hover {
  background: #fafafa;
  color: #18181b;
}

.menu-item.active {
  background: #f4f4f5;
  color: #18181b !important;
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-group-btn {
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
}

.menu-item.menu-group-btn.active {
  background: transparent;
  color: var(--primary-charcoal);
}

.menu-chevron {
  font-size: 1rem;
  color: var(--text-slate-400);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.menu-chevron.open {
  transform: rotate(180deg);
  color: var(--primary-charcoal);
}

.submenu {
  margin: 0 0 0.75rem 2rem;
}

.submenu-item {
  padding: 0.55rem 0.85rem;
  font-size: 0.875rem;
  border-radius: 12px;
}

.user-card {
  padding: 0.75rem 0.75rem 1.25rem;
  margin-top: auto;
}

.user-card-inner {
  background: #fff;
  border: 1px solid #f4f4f5;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 0.75rem;
  background: #f4f4f5;
  color: #18181b;
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
    width: min(18rem, 86vw);
    transform: translateX(-105%);
    transition: transform 0.25s ease-out;
  }

  .sidebar-menu.open {
    transform: translateX(0);
  }
}
</style>
