import { api } from './http.js'

/** GET /api/v1/class-courses/by-class/{classId} */
export function getClassCoursesByClassId(classId) {
  return api(`/api/v1/class-courses/by-class/${classId}`)
}

/** GET /api/v1/class-courses/by-class/{classId}/enabled */
export function getEnabledClassCoursesByClassId(classId) {
  return api(`/api/v1/class-courses/by-class/${classId}/enabled`)
}

/** GET /api/v1/class-courses/{id} */
export function getClassCourseDetail(id) {
  return api(`/api/v1/class-courses/${id}`)
}

/** POST /api/v1/class-courses */
export function createClassCourse(data) {
  return api('/api/v1/class-courses', { method: 'POST', body: data })
}

/** POST /api/v1/class-courses/batch */
export function batchCreateClassCourses(classId, courseIds) {
  return api('/api/v1/class-courses/batch', { method: 'POST', params: { classId }, body: courseIds })
}

/** PUT /api/v1/class-courses/{id} */
export function updateClassCourse(id, data) {
  return api(`/api/v1/class-courses/${id}`, { method: 'PUT', body: data })
}

/** DELETE /api/v1/class-courses/{id} */
export function deleteClassCourse(id) {
  return api(`/api/v1/class-courses/${id}`, { method: 'DELETE' })
}

/** DELETE /api/v1/class-courses/batch */
export function batchDeleteClassCourses(ids) {
  return api('/api/v1/class-courses/batch', { method: 'DELETE', body: ids })
}
