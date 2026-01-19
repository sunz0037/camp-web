import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import HomePage from '../views/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordPage.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'HomeDashboard',
        component: () => import('../views/HomeDashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/StudentManagementPage.vue'),
        meta: { title: '学生信息管理' }
      },
      {
        path: 'emergency-contacts',
        name: 'EmergencyContacts',
        component: () => import('../views/EmergencyContactManagementPage.vue'),
        meta: { title: '应急联系人管理' }
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('../views/AttendanceManagementPage.vue'),
        meta: { title: '考勤管理' }
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('../views/CourseManagementPage.vue'),
        meta: { title: '科目管理' }
      },
      {
        path: 'exam-schedules',
        name: 'ExamSchedules',
        component: () => import('../views/ExamScheduleManagementPage.vue'),
        meta: { title: '考试安排管理' }
      },
      {
        path: 'scores',
        name: 'Scores',
        component: () => import('../views/ScoreManagementPage.vue'),
        meta: { title: '考试成绩管理' }
      },
      {
        path: 'grades',
        name: 'Grades',
        component: () => import('../views/GradeManagementPage.vue'),
        meta: { title: '年级管理' }
      },
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('../views/ClassManagementPage.vue'),
        meta: { title: '班级管理' }
      },
      {
        path: 'class-courses',
        name: 'ClassCourses',
        component: () => import('../views/ClassCourseManagementPage.vue'),
        meta: { title: '班级授课科目管理' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UserManagementPage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('../views/RoleManagementPage.vue'),
        meta: { title: '角色权限管理' }
      },
      {
        path: 'data-permissions',
        name: 'DataPermissions',
        component: () => import('../views/DataPermissionManagementPage.vue'),
        meta: { title: '数据查询权限管理' }
      },
      {
        path: 'teacher-classes',
        name: 'TeacherClasses',
        component: () => import('../views/TeacherClassManagementPage.vue'),
        meta: { title: '教师班级关联' }
      },
      {
        path: 'grade-admin-grades',
        name: 'GradeAdminGrades',
        component: () => import('../views/GradeAdminGradeManagementPage.vue'),
        meta: { title: '年级管理员关联' }
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: () => import('../views/AnnouncementManagementPage.vue'),
        meta: { title: '校园公告管理' }
      },
      {
        path: 'visitors',
        name: 'Visitors',
        component: () => import('../views/VisitorManagementPage.vue'),
        meta: { title: '来访登记管理' }
      },
      {
        path: 'batch-operations',
        name: 'BatchOperations',
        component: () => import('../views/PlaceholderPage.vue'),
        meta: { title: '批量导入导出' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/PlaceholderPage.vue'),
        meta: { title: '统计报表' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/ProfilePage.vue'),
        meta: { title: '个人信息' }
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('../views/ChangePasswordPage.vue'),
        meta: { title: '修改密码' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  
  // 如果访问/home但没有子路径，重定向到首页dashboard
  if (to.path === '/home') {
    next({ path: '/home/', replace: true })
    return
  }
  
  if (to.meta.requiresAuth) {
    if (!token || !userInfo) {
      // 需要登录但未登录，跳转到登录页
      next('/login')
    } else {
      // 已登录，允许访问
      next()
    }
  } else {
    // 如果已登录，访问登录页时跳转到首页
    if ((to.path === '/login' || to.path === '/') && token && userInfo) {
      next('/home/')
    } else {
      next()
    }
  }
})

export default router
