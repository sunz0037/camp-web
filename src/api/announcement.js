import { api } from './http.js'
import { pageRecords } from './unwrap.js'

/** GET /api/v1/announcements */
export function listAnnouncements(params = {}) {
  return api('/api/v1/announcements', { params })
}

/** GET /api/v1/announcements/{id} */
export function getAnnouncement(id) {
  return api(`/api/v1/announcements/${id}`)
}

/** POST /api/v1/announcements */
export function createAnnouncement(data) {
  return api('/api/v1/announcements', { method: 'POST', body: data })
}

/** POST /api/v1/announcements/{id}/read */
export function markAnnouncementRead(id) {
  return api(`/api/v1/announcements/${id}/read`, { method: 'POST', body: {} })
}

export function toAnnouncementRow(raw) {
  const publishedAt = raw.publishTime || raw.publishedAt || raw.createdAt || ''
  return {
    id: raw.id,
    title: raw.title || '',
    body: raw.content || raw.body || '',
    pinned: raw.isTop === 1 || raw.pinned === true,
    scope: raw.targetAudience || raw.scope || '全校',
    author: raw.publisherName || raw.author || '',
    publishedAt: String(publishedAt).replace('T', ' ').slice(0, 16),
    read: raw.read === true || raw.isRead === 1
  }
}

export async function fetchAnnouncements(params = {}) {
  const page = pageRecords(await listAnnouncements({ page: 1, size: 100, ...params }))
  return page.records.map(toAnnouncementRow)
}
