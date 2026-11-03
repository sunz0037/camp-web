import { api } from './http.js'
import { pageRecords } from './unwrap.js'

/** GET /api/v1/grades */
export function listGrades(params = {}) {
  return api('/api/v1/grades', { params })
}

/** POST /api/v1/grades */
export function createGrade(data) {
  return api('/api/v1/grades', { method: 'POST', body: data })
}

/** PUT /api/v1/grades/{id} */
export function updateGrade(id, data) {
  return api(`/api/v1/grades/${id}`, { method: 'PUT', body: data })
}

/** DELETE /api/v1/grades/{id} */
export function deleteGrade(id) {
  return api(`/api/v1/grades/${id}`, { method: 'DELETE' })
}

/** GET /api/v1/classes */
export function listClasses(params = {}) {
  return api('/api/v1/classes', { params })
}

/** POST /api/v1/classes */
export function createClass(data) {
  return api('/api/v1/classes', { method: 'POST', body: data })
}

/** PUT /api/v1/classes/{id} */
export function updateClass(id, data) {
  return api(`/api/v1/classes/${id}`, { method: 'PUT', body: data })
}

/** DELETE /api/v1/classes/{id} */
export function deleteClass(id) {
  return api(`/api/v1/classes/${id}`, { method: 'DELETE' })
}

export function toGradeRow(raw) {
  return {
    id: raw.id,
    gradeCode: raw.gradeCode || '',
    gradeName: raw.gradeName || raw.name || '',
    gradeType: raw.gradeType || 'SENIOR',
    gradeLevel: raw.gradeLevel ?? '',
    description: raw.description || '',
    status: raw.status ?? 1
  }
}

export function toClassRow(raw) {
  return {
    id: raw.id,
    gradeId: raw.gradeId ?? null,
    gradeName: raw.gradeName || raw.grade || '',
    classCode: raw.classCode || '',
    className: raw.className || raw.name || '',
    classNumber: raw.classNumber ?? '',
    capacity: raw.capacity ?? '',
    currentCount: raw.currentCount ?? 0,
    headTeacherId: raw.headTeacherId ?? '',
    headTeacherName: raw.headTeacherName || '',
    status: raw.status ?? 1
  }
}

export async function fetchGrades(params = {}) {
  const page = pageRecords(await listGrades({ page: 1, size: 200, ...params }))
  return page.records.map(toGradeRow)
}

export async function fetchOrgClasses(params = {}) {
  const page = pageRecords(await listClasses({ page: 1, size: 200, ...params }))
  return page.records.map(toClassRow)
}
