<template>
  <div class="sidebar-menu" :class="{ collapsed: isCollapsed }" @click="handleMenuClick">
    <div class="menu-header">
      <h2 v-show="!isCollapsed" class="menu-title">功能菜单</h2>
      <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开菜单' : '收起菜单'">
        <span class="collapse-icon">{{ isCollapsed ? '▶' : '◀' }}</span>
      </button>
    </div>
    
    <nav class="menu-nav">
      <!-- 首页 -->
      <div class="menu-item-wrapper">
        <router-link 
          to="/home" 
          class="menu-item" 
          :class="{ active: $route.path === '/home' || $route.path === '/home/' }"
          :title="isCollapsed ? '首页' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">首页</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">🏠</span>
        </router-link>
      </div>

      <!-- 学生管理 -->
      <div class="menu-item-wrapper">
        <div 
          class="menu-item menu-item-parent"
          :class="{ expanded: expandedMenus.includes('student') }"
          @click="toggleMenu('student')"
          :title="isCollapsed ? '学生管理' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">学生管理</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">👥</span>
          <span v-show="!isCollapsed" class="menu-arrow">{{ expandedMenus.includes('student') ? '▼' : '▶' }}</span>
        </div>
        <div 
          v-show="expandedMenus.includes('student') && !isCollapsed" 
          class="menu-submenu"
        >
          <router-link 
            to="/home/students" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/students' }"
          >
            <span class="menu-text">学生信息管理</span>
          </router-link>
          <router-link 
            to="/home/emergency-contacts" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/emergency-contacts' }"
          >
            <span class="menu-text">应急联系人管理</span>
          </router-link>
          <router-link 
            to="/home/attendance" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/attendance' }"
          >
            <span class="menu-text">考勤管理</span>
          </router-link>
        </div>
      </div>

      <!-- 教学管理 -->
      <div class="menu-item-wrapper">
        <div 
          class="menu-item menu-item-parent"
          :class="{ expanded: expandedMenus.includes('teaching') }"
          @click="toggleMenu('teaching')"
          :title="isCollapsed ? '教学管理' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">教学管理</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">📚</span>
          <span v-show="!isCollapsed" class="menu-arrow">{{ expandedMenus.includes('teaching') ? '▼' : '▶' }}</span>
        </div>
        <div 
          v-show="expandedMenus.includes('teaching') && !isCollapsed" 
          class="menu-submenu"
        >
          <router-link 
            to="/home/courses" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/courses' }"
          >
            <span class="menu-text">科目管理</span>
          </router-link>
          <router-link 
            to="/home/exam-schedules" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/exam-schedules' }"
          >
            <span class="menu-text">考试安排管理</span>
          </router-link>
          <router-link 
            to="/home/scores" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/scores' }"
          >
            <span class="menu-text">考试成绩管理</span>
          </router-link>
        </div>
      </div>

      <!-- 系统管理 -->
      <div class="menu-item-wrapper">
        <div 
          class="menu-item menu-item-parent"
          :class="{ expanded: expandedMenus.includes('system') }"
          @click="toggleMenu('system')"
          :title="isCollapsed ? '系统管理' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">系统管理</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">⚙️</span>
          <span v-show="!isCollapsed" class="menu-arrow">{{ expandedMenus.includes('system') ? '▼' : '▶' }}</span>
        </div>
        <div 
          v-show="expandedMenus.includes('system') && !isCollapsed" 
          class="menu-submenu"
        >
          <router-link 
            to="/home/grades" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/grades' }"
          >
            <span class="menu-text">年级管理</span>
          </router-link>
          <router-link 
            to="/home/classes" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/classes' }"
          >
            <span class="menu-text">班级管理</span>
          </router-link>
          <router-link 
            to="/home/users" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/users' }"
          >
            <span class="menu-text">用户管理</span>
          </router-link>
          <router-link 
            to="/home/roles" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/roles' }"
          >
            <span class="menu-text">角色权限管理</span>
          </router-link>
          <router-link 
            to="/home/data-permissions" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/data-permissions' }"
          >
            <span class="menu-text">数据查询权限管理</span>
          </router-link>
          <router-link 
            to="/home/teacher-classes" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/teacher-classes' }"
          >
            <span class="menu-text">教师班级关联</span>
          </router-link>
          <router-link 
            to="/home/grade-admin-grades" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/grade-admin-grades' }"
          >
            <span class="menu-text">年级管理员关联</span>
          </router-link>
        </div>
      </div>

      <!-- 校园管理 -->
      <div class="menu-item-wrapper">
        <div 
          class="menu-item menu-item-parent"
          :class="{ expanded: expandedMenus.includes('campus') }"
          @click="toggleMenu('campus')"
          :title="isCollapsed ? '校园管理' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">校园管理</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">🏫</span>
          <span v-show="!isCollapsed" class="menu-arrow">{{ expandedMenus.includes('campus') ? '▼' : '▶' }}</span>
        </div>
        <div 
          v-show="expandedMenus.includes('campus') && !isCollapsed" 
          class="menu-submenu"
        >
          <router-link 
            to="/home/announcements" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/announcements' }"
          >
            <span class="menu-text">校园公告管理</span>
          </router-link>
          <router-link 
            to="/home/visitors" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/visitors' }"
          >
            <span class="menu-text">来访登记管理</span>
          </router-link>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="menu-item-wrapper">
        <div 
          class="menu-item menu-item-parent"
          :class="{ expanded: expandedMenus.includes('data') }"
          @click="toggleMenu('data')"
          :title="isCollapsed ? '数据管理' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">数据管理</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">📊</span>
          <span v-show="!isCollapsed" class="menu-arrow">{{ expandedMenus.includes('data') ? '▼' : '▶' }}</span>
        </div>
        <div 
          v-show="expandedMenus.includes('data') && !isCollapsed" 
          class="menu-submenu"
        >
          <router-link 
            to="/home/batch-operations" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/batch-operations' }"
          >
            <span class="menu-text">批量导入导出</span>
          </router-link>
          <router-link 
            to="/home/statistics" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/statistics' }"
          >
            <span class="menu-text">统计报表</span>
          </router-link>
        </div>
      </div>

      <!-- 个人中心 -->
      <div class="menu-item-wrapper">
        <div 
          class="menu-item menu-item-parent"
          :class="{ expanded: expandedMenus.includes('personal') }"
          @click="toggleMenu('personal')"
          :title="isCollapsed ? '个人中心' : ''"
        >
          <span v-show="!isCollapsed" class="menu-text">个人中心</span>
          <span v-show="isCollapsed" class="menu-icon-collapsed">👤</span>
          <span v-show="!isCollapsed" class="menu-arrow">{{ expandedMenus.includes('personal') ? '▼' : '▶' }}</span>
        </div>
        <div 
          v-show="expandedMenus.includes('personal') && !isCollapsed" 
          class="menu-submenu"
        >
          <router-link 
            to="/home/profile" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/profile' }"
          >
            <span class="menu-text">个人信息</span>
          </router-link>
          <router-link 
            to="/home/change-password" 
            class="menu-item menu-item-child"
            :class="{ active: $route.path === '/home/change-password' }"
          >
            <span class="menu-text">修改密码</span>
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const expandedMenus = ref([])
const isCollapsed = ref(false)

// 定义事件
const emit = defineEmits(['collapse-change'])

// 根据当前路由自动展开对应的菜单
const autoExpandMenu = () => {
  const path = route.path
  
  // 根据路径判断应该展开哪个菜单（支持/home/xxx路径）
  if (path.includes('/students') || path.includes('/emergency-contacts') || path.includes('/attendance')) {
    if (!expandedMenus.value.includes('student')) {
      expandedMenus.value.push('student')
    }
  } else if (path.includes('/courses') || path.includes('/exam-schedules') || path.includes('/scores')) {
    if (!expandedMenus.value.includes('teaching')) {
      expandedMenus.value.push('teaching')
    }
  } else if (path.includes('/grades') || path.includes('/classes') || path.includes('/users') || 
             path.includes('/roles') || path.includes('/data-permissions') || 
             path.includes('/teacher-classes') || path.includes('/grade-admin-grades')) {
    if (!expandedMenus.value.includes('system')) {
      expandedMenus.value.push('system')
    }
  } else if (path.includes('/announcements') || path.includes('/visitors')) {
    if (!expandedMenus.value.includes('campus')) {
      expandedMenus.value.push('campus')
    }
  } else if (path.includes('/batch-operations') || path.includes('/statistics')) {
    if (!expandedMenus.value.includes('data')) {
      expandedMenus.value.push('data')
    }
  } else if (path.includes('/profile') || path.includes('/change-password')) {
    if (!expandedMenus.value.includes('personal')) {
      expandedMenus.value.push('personal')
    }
  }
}

// 切换菜单展开/收起
const toggleMenu = (menuKey) => {
  // 如果菜单已收起，点击一级菜单时先展开菜单
  if (isCollapsed.value) {
    isCollapsed.value = false
    // 展开后自动展开对应的子菜单
    setTimeout(() => {
      if (!expandedMenus.value.includes(menuKey)) {
        expandedMenus.value.push(menuKey)
      }
    }, 100)
    return
  }
  
  // 展开状态下，正常切换子菜单
  const index = expandedMenus.value.indexOf(menuKey)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(menuKey)
  }
}

// 切换菜单栏收起/展开
const toggleCollapse = (event) => {
  event.stopPropagation()
  isCollapsed.value = !isCollapsed.value
  // 收起时，关闭所有子菜单
  if (isCollapsed.value) {
    expandedMenus.value = []
  }
  // 通知父组件菜单状态变化
  emit('collapse-change', isCollapsed.value)
}

// 处理菜单点击（收起状态下点击菜单项时展开）
const handleMenuClick = (event) => {
  // 如果点击的是收起按钮，不处理
  if (event.target.closest('.collapse-btn')) {
    return
  }
  
  // 如果菜单已收起，点击菜单项时展开菜单
  if (isCollapsed.value && event.target.closest('.menu-item')) {
    isCollapsed.value = false
    emit('collapse-change', false)
  }
}

// 监听路由变化，自动展开对应菜单
watch(() => route.path, () => {
  autoExpandMenu()
})

onMounted(() => {
  autoExpandMenu()
})

// 暴露收起状态和方法，供父组件使用
defineExpose({
  isCollapsed,
  toggleCollapse
})

// 监听收起状态变化，通知父组件
watch(isCollapsed, (newVal) => {
  emit('collapse-change', newVal)
})
</script>

<style scoped>
.sidebar-menu {
  width: 260px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar-menu.collapsed {
  width: 64px;
}

/* 当菜单收起时，通过CSS变量通知父容器 */
.sidebar-menu.collapsed {
  --menu-width: 64px;
}

.sidebar-menu:not(.collapsed) {
  --menu-width: 260px;
}

.menu-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.menu-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #000000;
  letter-spacing: -0.01em;
  flex: 1;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: #f5f5f7;
  border-color: #d2d2d7;
}

.collapse-icon {
  font-size: 0.75rem;
  color: #1d1d1f;
  line-height: 1;
}

.menu-nav {
  padding: 0.5rem 0;
}

.menu-item-wrapper {
  margin-bottom: 0.25rem;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  color: #1d1d1f;
  text-decoration: none;
  transition: background-color 0.2s ease;
  cursor: pointer;
  font-size: 0.9375rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu.collapsed .menu-item {
  padding: 0.75rem;
  justify-content: center;
}

.menu-item:hover {
  background-color: #f5f5f7;
}

.menu-item.active {
  background-color: #f5f5f7;
  color: #0071e3;
  font-weight: 500;
}

.menu-item-parent {
  font-weight: 500;
}

.menu-item-parent.expanded {
  color: #0071e3;
}

.menu-item-child {
  padding-left: 2.5rem;
  font-weight: 400;
  color: #6e6e73;
}

.menu-item-child:hover {
  color: #1d1d1f;
}

.menu-item-child.active {
  color: #0071e3;
  font-weight: 500;
}

.menu-icon-collapsed {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  flex: 1;
}

.menu-arrow {
  font-size: 0.75rem;
  color: #86868b;
  margin-left: 0.5rem;
  transition: transform 0.2s ease;
}

.menu-item-parent.expanded .menu-arrow {
  color: #0071e3;
}

.menu-submenu {
  background-color: #fafafa;
  border-left: 2px solid #e5e7eb;
  margin-left: 1.25rem;
  overflow: hidden;
}

.sidebar-menu.collapsed .menu-submenu {
  display: none;
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 8px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #d2d2d7;
  border-radius: 4px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #a1a1a6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-menu {
    width: 240px;
  }
  
  .menu-item {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
  
  .menu-item-child {
    padding-left: 2rem;
  }
}
</style>
