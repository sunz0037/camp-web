const DEV_ROLES = ['ADMIN', 'ACADEMIC', 'TEACHER', 'STUDENT']

/** mock. / mock- / dev-ROLE 都不是后端签发的访问令牌。 */
export function isRealAccessToken(token) {
  if (!token) return false
  if (token.startsWith('mock.') || token.startsWith('mock-')) return false
  return !/^dev-(ADMIN|ACADEMIC|TEACHER|STUDENT)$/.test(token)
}

export function devRole(user) {
  const role = String(user?.role || '').toUpperCase()
  if (role === 'PARENT') return 'STUDENT'
  if (DEV_ROLES.includes(role)) return role
  return 'TEACHER'
}

function listHeader(values) {
  if (!Array.isArray(values) || !values.length) return ''
  return values.map((item) => String(item).trim()).filter(Boolean).join(',')
}

/**
 * profile=dev 时用 Bearer dev-<ROLE>。
 * 已有真实访问令牌时只发该令牌，不带任何 X-Dev-*。
 * 不发送 X-Dev-Role，避免和 Bearer 同时出现。
 */
export function buildRequestHeaders({ token, user, devProfile }) {
  if (isRealAccessToken(token)) {
    return { Authorization: `Bearer ${token}` }
  }
  if (!devProfile) return {}

  const headers = { Authorization: `Bearer dev-${devRole(user)}` }
  if (user?.id) headers['X-Dev-User-Id'] = String(user.id)
  const classIds = listHeader(user?.classIds)
  const gradeIds = listHeader(user?.gradeIds)
  if (classIds) headers['X-Dev-Class-Ids'] = classIds
  if (gradeIds) headers['X-Dev-Grade-Ids'] = gradeIds
  return headers
}

const MANAGED_HEADERS = [
  'Authorization',
  'X-Dev-User-Id',
  'X-Dev-Class-Ids',
  'X-Dev-Grade-Ids',
  'X-Dev-Role'
]

export function applyManagedHeaders(target, headers) {
  MANAGED_HEADERS.forEach((key) => {
    if (target && typeof target.delete === 'function') target.delete(key)
    else if (target) delete target[key]
  })
  Object.entries(headers).forEach(([key, value]) => {
    if (target && typeof target.set === 'function') target.set(key, value)
    else if (target) target[key] = value
  })
  return target
}
