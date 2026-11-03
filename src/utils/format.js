export function isLoadHint(message) {
  const text = String(message || '')
  if (!text) return false
  return text.split('；').every((part) => part === '网络不可用' || part === '服务暂不可用')
}

export function maskPhone(phone) {
  const value = String(phone || '')
  if (value.length < 7) return value || '—'
  return `${value.slice(0, 3)}****${value.slice(-4)}`
}

export function maskId(value) {
  const text = String(value || '')
  if (text.length < 8) return text || '—'
  return `${text.slice(0, 3)}***********${text.slice(-4)}`
}

export function formatDateTime(value) {
  if (!value) return '—'
  return String(value).replace('T', ' ').slice(0, 16)
}

export function toInputDateTime(value) {
  if (!value) return ''
  return String(value).replace(' ', 'T').slice(0, 16)
}

export function toApiDateTime(value) {
  if (!value) return null
  const text = String(value).trim().replace(' ', 'T')
  if (!text) return null
  if (text.length === 16) return `${text}:00`
  return text
}

export function weekdayIndex(date = new Date()) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export function weekdayLabel(day) {
  const label = '一二三四五六日'[day - 1]
  return label ? `周${label}` : '—'
}

export const PERIOD_TIME = {
  1: '08:00',
  2: '08:55',
  3: '10:00',
  4: '10:55',
  5: '14:00',
  6: '14:55',
  7: '16:00',
  8: '16:55'
}

export function periodLabel(start, end) {
  return `${start}-${end}`
}

export function todayISO(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export function downloadText(filename, text) {
  const blob = new Blob([`\ufeff${text}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function scopeLabel(user, classNames = []) {
  if (!user) return '未登录'
  if (user.role === 'ADMIN' || user.role === 'ACADEMIC') return '全校'
  if (user.role === 'TEACHER') return classNames.length ? classNames.join('、') : '未分配班级'
  if (user.actor === 'PARENT') return `${user.linkedStudentName || '关联学生'} · ${user.className || '未分班'}`
  return user.className || '本人'
}

export const ROLE_LABEL = {
  ADMIN: '管理员',
  ACADEMIC: '教务',
  TEACHER: '教师',
  STUDENT: '学生',
  PARENT: '家长'
}

export const ATTENDANCE_LABEL = {
  present: '出勤',
  leave: '请假',
  late: '迟到',
  absent: '旷课'
}

export function nid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}
