import { api } from './http.js'
import { pageRecords, unwrapData } from './unwrap.js'
import { toUserRow } from '../domain/writePayloads.js'

/** GET /api/v1/users */
export function listUsers(params = {}) {
  return api('/api/v1/users', { params })
}

/** POST /api/v1/users */
export function createUser(data) {
  return api('/api/v1/users', { method: 'POST', body: data })
}

/** PUT /api/v1/users/{id} */
export function updateUser(id, data) {
  return api(`/api/v1/users/${id}`, { method: 'PUT', body: data })
}

/** PUT /api/v1/users/{id}/status?status= */
export function updateUserStatus(id, status) {
  return api(`/api/v1/users/${id}/status`, { method: 'PUT', params: { status } })
}

/** GET /api/v1/users/{id}/roles */
export function getUserRoles(id) {
  return api(`/api/v1/users/${id}/roles`)
}

/** PUT /api/v1/users/{id}/roles */
export function replaceUserRoles(id, data) {
  return api(`/api/v1/users/${id}/roles`, { method: 'PUT', body: data })
}

export async function fetchStaffOptions(userType = 2) {
  const page = pageRecords(await listUsers({ page: 1, size: 200, userType, status: 1 }))
  return page.records.map((raw) => ({
    id: raw.id,
    name: raw.realName || raw.username || '',
    account: raw.username || ''
  }))
}

export async function fetchUserPage(params = {}) {
  const page = pageRecords(await listUsers({ page: 1, size: 100, ...params }))
  const records = await Promise.all(page.records.map(async (raw) => {
    try {
      const data = unwrapData(await getUserRoles(raw.id))
      const codes = Array.isArray(data?.roleCodes) ? data.roleCodes : []
      return toUserRow(raw, codes)
    } catch {
      return toUserRow(raw, [])
    }
  }))
  return { ...page, records }
}
