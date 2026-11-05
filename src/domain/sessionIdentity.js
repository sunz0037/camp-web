/** 登录态身份与按钮权限。顶栏文案和写按钮都从这里出，避免只看 userType。 */

export const ROLE_PERMISSIONS = {
  ADMIN: ['org:write', 'student:import', 'student:write', 'course:write', 'attendance:record', 'announcement:publish', 'announcement:top', 'user:write'],
  ACADEMIC: ['org:write', 'student:import', 'student:write', 'course:write', 'attendance:record', 'announcement:publish', 'announcement:top'],
  TEACHER: ['student:write', 'course:write', 'attendance:record', 'announcement:publish'],
  STUDENT: []
}

const ROLE_RANK = ['ADMIN', 'ACADEMIC', 'TEACHER', 'STUDENT']

const ROLE_TITLE = {
  ADMIN: '管理员',
  ACADEMIC: '教务',
  TEACHER: '教师',
  STUDENT: '学生'
}

export function normalizeRole(role) {
  const value = String(role || 'STUDENT').toUpperCase()
  if (value === 'PARENT') return { role: 'STUDENT', actor: 'PARENT', title: '家长' }
  if (value === 'GRADE_ADMIN') return { role: 'ACADEMIC', actor: 'ACADEMIC', title: '教务' }
  const known = ROLE_RANK.includes(value)
  const code = known ? value : 'STUDENT'
  return { role: code, actor: code, title: ROLE_TITLE[code] }
}

function roleCodesOf(raw) {
  const list = Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw]
  const codes = []
  for (const item of list) {
    const value = String(item || '').trim().toUpperCase()
    if (!value) continue
    const code = value === 'GRADE_ADMIN' ? 'ACADEMIC' : value
    if (ROLE_RANK.includes(code) || code === 'PARENT') codes.push(code)
  }
  return codes
}

/**
 * 教务和教师的 userType 都是 2。有 roles 时按 ADMIN > ACADEMIC > TEACHER > STUDENT 取最高档。
 * 没有 roles 才退回 userType，此时 2 只能当成教师。
 */
export function pickRole(remote, { portal, identifier } = {}) {
  const codes = roleCodesOf(remote?.roles ?? remote?.roleCodes ?? remote?.role)
  for (const role of ROLE_RANK) {
    if (codes.includes(role)) return role
  }
  if (codes.includes('PARENT')) return 'PARENT'
  const userType = Number(remote?.userType)
  if (userType === 3) return 'ADMIN'
  if (userType === 1) return 'STUDENT'
  if (userType === 2) return 'TEACHER'
  const id = String(identifier || '').trim().toLowerCase()
  if (portal === 'student') return 'STUDENT'
  if (id === 'admin') return 'ADMIN'
  if (id.startsWith('academic')) return 'ACADEMIC'
  return 'TEACHER'
}

/**
 * 按钮可见性以 ROLE_PERMISSIONS 为下限，再并上接口多给的码。
 * 教师种子含 student:write / course:write；后端默认只有 student:export、attendance:record、announcement:publish。
 * 学生种子为空，接口没给写权限时继续隐藏。
 */
export function sessionPermissions(role, remotePermissions) {
  const seeded = ROLE_PERMISSIONS[role] || []
  const extra = Array.isArray(remotePermissions) ? remotePermissions : []
  const codes = []
  for (const code of [...seeded, ...extra]) {
    if (typeof code === 'string' && code && !codes.includes(code)) codes.push(code)
  }
  return codes
}

export function loginIdentity(remote, context = {}) {
  const mapped = normalizeRole(pickRole(remote, context))
  return {
    role: mapped.role,
    actor: mapped.actor,
    title: mapped.title,
    permissions: sessionPermissions(mapped.role, remote?.permissions)
  }
}
