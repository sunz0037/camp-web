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
    path: 'students',
    name: 'Students',
    component: () => import('./views/StudentManagementPage.vue'),
    meta: { title: '学生信息', roles: STAFF, pcOnly: true, icon: 'Users', sidebar: 'staff' }
  },
  {
    path: 'courses',
    name: 'Courses',
    component: () => import('./views/CourseManagementPage.vue'),
    meta: { title: '课程与排课', roles: STAFF, pcOnly: true, icon: 'BookOpen', sidebar: 'staff' }
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
    path: 'announcements',
    name: 'Announcements',
    component: () => import('./views/AnnouncementManagementPage.vue'),
    meta: { title: '校园公告', roles: ALL, pcOnly: false, icon: 'Megaphone', sidebar: 'all' }
  },
  {
    path: 'org-classes',
    name: 'OrgClasses',
    component: () => import('./views/OrgClassesPage.vue'),
    meta: { title: '年级班级', roles: STAFF, pcOnly: true, icon: 'Network', sidebar: 'staff' }
  },
  {
    path: 'users',
    name: 'Users',
    component: () => import('./views/UserManagementPage.vue'),
    meta: { title: '用户账号', roles: ['ADMIN'], pcOnly: true, icon: 'UserCog', sidebar: 'admin' }
  },
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('./views/ProfilePage.vue'),
    meta: { title: '个人中心', roles: ALL, pcOnly: false, icon: 'UserRound', sidebar: 'all' }
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

export function navLabel(route, role) {
  if (route.name === 'Attendance' && role === 'STUDENT') return '我的考勤'
  return route.meta.title
}
