const ALL = ['ADMIN', 'ACADEMIC', 'TEACHER', 'STUDENT']
const STAFF = ['ADMIN', 'ACADEMIC', 'TEACHER']

export const PHASE_ROUTES = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('./views/HomeDashboard.vue'),
    meta: { title: '首页概览', roles: ALL, pcOnly: true, icon: 'LayoutDashboard', sidebar: 'all' }
  },
  {
    path: 'users',
    name: 'Users',
    component: () => import('./views/UserManagementPage.vue'),
    meta: { title: '用户管理', roles: ['ADMIN'], pcOnly: true, icon: 'UserCog', sidebar: 'admin' }
  },
  {
    path: 'roles',
    name: 'Roles',
    component: () => import('./views/RoleManagementPage.vue'),
    meta: { title: '角色权限管理', roles: ['ADMIN'], pcOnly: true, icon: 'Shield', sidebar: 'admin' }
  },
  {
    path: 'students',
    name: 'Students',
    component: () => import('./views/StudentManagementPage.vue'),
    meta: { title: '学生信息管理', roles: STAFF, pcOnly: true, icon: 'Users', sidebar: 'staff' }
  },
  {
    path: 'exam-schedules',
    name: 'ExamSchedules',
    component: () => import('./views/ExamScheduleManagementPage.vue'),
    meta: { title: '考试安排', roles: ALL, pcOnly: true, icon: 'CalendarCheck', sidebar: 'all' }
  },
  {
    path: 'scores',
    name: 'Scores',
    component: () => import('./views/ScoreManagementPage.vue'),
    meta: { title: '考试成绩', roles: ALL, pcOnly: true, icon: 'ClipboardList', sidebar: 'all' }
  },
  {
    path: 'visitors',
    name: 'Visitors',
    component: () => import('./views/VisitorManagementPage.vue'),
    meta: { title: '来访登记', roles: STAFF, pcOnly: true, icon: 'Contact', sidebar: 'staff' }
  },
  {
    path: 'org-classes',
    name: 'OrgClasses',
    component: () => import('./views/OrgClassesPage.vue'),
    meta: {
      title: '班级管理',
      roles: STAFF,
      pcOnly: true,
      icon: 'Network',
      sidebar: 'staff',
      links: [
        { key: 'classes', title: '班级管理', icon: 'Network', query: { tab: 'classes' } },
        { key: 'grades', title: '年级管理', icon: 'Building2', query: { tab: 'grades' } }
      ]
    }
  },
  {
    path: 'courses',
    name: 'Courses',
    component: () => import('./views/CourseManagementPage.vue'),
    meta: { title: '科目管理', roles: STAFF, pcOnly: true, icon: 'BookOpen', sidebar: 'staff' }
  },
  {
    path: 'class-courses',
    name: 'ClassCourses',
    component: () => import('./views/ClassCourseManagementPage.vue'),
    meta: { title: '班级授课科目', roles: STAFF, pcOnly: true, icon: 'BookMarked', sidebar: 'staff' }
  },
  {
    path: 'teacher-classes',
    name: 'TeacherClasses',
    component: () => import('./views/TeacherClassManagementPage.vue'),
    meta: { title: '教师班级关联', roles: STAFF, pcOnly: true, icon: 'Contact', sidebar: 'staff' }
  },
  {
    path: 'grade-admin-grades',
    name: 'GradeAdminGrades',
    component: () => import('./views/GradeAdminGradeManagementPage.vue'),
    meta: { title: '年级管理员关联', roles: ['ADMIN', 'ACADEMIC'], pcOnly: true, icon: 'Link2', sidebar: 'staff' }
  },
  {
    path: 'my-schedule',
    name: 'MySchedule',
    component: () => import('./views/MySchedulePage.vue'),
    meta: { title: '我的课表', roles: ALL, pcOnly: false, icon: 'CalendarDays', sidebar: 'student' }
  },
  {
    path: 'attendance',
    name: 'Attendance',
    component: () => import('./views/AttendanceManagementPage.vue'),
    meta: { title: '考勤管理', roles: ALL, pcOnly: false, icon: 'ClipboardCheck', sidebar: 'all' }
  },
  {
    path: 'exam-schedules',
    name: 'ExamSchedules',
    component: () => import('./views/ExamScheduleManagementPage.vue'),
    meta: { title: '考试安排管理', roles: ALL, pcOnly: true, icon: 'CalendarCheck', sidebar: 'all' }
  },
  {
    path: 'scores',
    name: 'Scores',
    component: () => import('./views/ScoreManagementPage.vue'),
    meta: { title: '考试成绩管理', roles: ALL, pcOnly: true, icon: 'ClipboardList', sidebar: 'all' }
  },
  {
    path: 'announcements',
    name: 'Announcements',
    component: () => import('./views/AnnouncementManagementPage.vue'),
    meta: { title: '校园公告管理', roles: ALL, pcOnly: false, icon: 'Megaphone', sidebar: 'all' }
  },
  {
    path: 'visitors',
    name: 'Visitors',
    component: () => import('./views/VisitorManagementPage.vue'),
    meta: { title: '来访登记管理', roles: STAFF, pcOnly: true, icon: 'Contact', sidebar: 'staff' }
  },
  {
    path: 'emergency-contacts',
    name: 'EmergencyContacts',
    component: () => import('./views/EmergencyContactsPage.vue'),
    meta: { title: '应急联系人管理', roles: STAFF, pcOnly: true, icon: 'UserRound', sidebar: 'staff' }
  },
  {
    path: 'data-permissions',
    name: 'DataPermissions',
    component: () => import('./views/DataPermissionManagementPage.vue'),
    meta: { title: '数据查询权限', roles: ['ADMIN'], pcOnly: true, icon: 'ShieldCheck', sidebar: 'admin' }
  },
  {
    path: 'batch-operations',
    name: 'BatchOperations',
    component: () => import('./views/ComingSoonPage.vue'),
    meta: { title: '批量导入导出', roles: ['ADMIN'], pcOnly: true, icon: 'Download', sidebar: 'admin' }
  },
  {
    path: 'statistics',
    name: 'Statistics',
    component: () => import('./views/ComingSoonPage.vue'),
    meta: { title: '统计报表', roles: ['ADMIN'], pcOnly: true, icon: 'Monitor', sidebar: 'admin' }
  },
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('./views/ProfilePage.vue'),
    meta: { title: '个人信息', roles: ALL, pcOnly: false, icon: 'UserRound', sidebar: 'all' }
  },
  {
    path: 'change-password',
    name: 'ChangePassword',
    component: () => import('./views/ChangePasswordPage.vue'),
    meta: { title: '修改密码', roles: ALL, pcOnly: false, icon: 'KeyRound', sidebar: 'all' }
  }
]

export const MOBILE_NAV = [
  { name: 'Announcements', label: '公告', icon: 'Megaphone', to: '/home/announcements' },
  { name: 'MySchedule', label: '课表', icon: 'CalendarDays', to: '/home/my-schedule' },
  { name: 'Attendance', label: '考勤', icon: 'ClipboardCheck', to: '/home/attendance' },
  { name: 'Profile', label: '我的', icon: 'UserRound', to: '/home/profile' }
]

export function landingPath() {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return '/home/announcements'
  }
  return '/home/dashboard'
}

export function inSidebar(route, role) {
  if (!route.meta.roles.includes(role)) return false
  if (route.meta.sidebar === 'all') return true
  if (route.meta.sidebar === 'staff') return role !== 'STUDENT'
  if (route.meta.sidebar === 'student') return role === 'STUDENT'
  if (route.meta.sidebar === 'admin') return role === 'ADMIN'
  return false
}

export function navLabel(route, role, query = {}) {
  if (route?.name === 'Attendance' && role === 'STUDENT') return '我的考勤'
  if (route?.name === 'OrgClasses') return query.tab === 'grades' ? '年级管理' : '班级管理'
  return route?.meta?.title || '工作台'
}

/** 侧栏条目。年级和班级共用已有页面，只按 Framer 菜单拆成两个入口。 */
export function sidebarLinks(route) {
  const links = route.meta.links
  if (!links?.length) {
    return [{ key: route.name, title: route.meta.title, icon: route.meta.icon, query: {} }]
  }
  return links.map((link) => ({ key: link.key, title: link.title, icon: link.icon, query: link.query || {} }))
}
