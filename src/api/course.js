import { api } from './http.js'
import { pageRecords } from './unwrap.js'

/** GET /api/v1/courses */
export function listCourses(params = {}) {
  return api('/api/v1/courses', { params })
}

/** POST /api/v1/courses */
export function createCourse(data) {
  return api('/api/v1/courses', { method: 'POST', body: data })
}

/** PUT /api/v1/courses/{id} */
export function updateCourse(id, data) {
  return api(`/api/v1/courses/${id}`, { method: 'PUT', body: data })
}

/** GET /api/v1/schedules — 星期、开始节次、结束节次、教室 */
export function listSchedules(params = {}) {
  return api('/api/v1/schedules', { params })
}

/** POST /api/v1/schedules */
export function createSchedule(data) {
  return api('/api/v1/schedules', { method: 'POST', body: data })
}

/** PUT /api/v1/schedules/{id} */
export function updateSchedule(id, data) {
  return api(`/api/v1/schedules/${id}`, { method: 'PUT', body: data })
}

export function toCourseRow(raw) {
  return {
    id: raw.id,
    code: raw.courseCode || raw.code || '',
    name: raw.courseName || raw.name || '',
    credit: raw.credit ?? null,
    status: raw.status
  }
}

export function toScheduleRow(raw) {
  return {
    id: raw.id,
    courseId: raw.courseId ?? null,
    name: raw.courseName || raw.name || '',
    className: raw.className || '',
    grade: raw.grade || raw.gradeName || '',
    teacher: raw.teacherName || raw.teacher || '',
    weekday: Number(raw.weekday || raw.weekDay || 0),
    periodStart: Number(raw.periodStart || 0),
    periodEnd: Number(raw.periodEnd || raw.periodStart || 0),
    roomNo: raw.roomNo || raw.room || ''
  }
}

export function toSchedulePayload(form) {
  return {
    courseId: form.courseId || null,
    courseName: form.name || '',
    className: form.className,
    teacherName: form.teacher,
    weekday: Number(form.weekday),
    periodStart: Number(form.periodStart),
    periodEnd: Number(form.periodEnd),
    roomNo: form.roomNo
  }
}

export async function fetchCourses(params = {}) {
  const page = pageRecords(await listCourses({ page: 1, size: 200, ...params }))
  return page.records.map(toCourseRow)
}

export async function fetchSchedules(params = {}) {
  const page = pageRecords(await listSchedules({ page: 1, size: 200, ...params }))
  return page.records.map(toScheduleRow)
}
