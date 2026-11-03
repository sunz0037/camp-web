import { classCourseWritePayload } from '../domain/writePayloads.js'
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

/** DELETE /api/v1/courses/{id} */
export function deleteCourse(id) {
  return api(`/api/v1/courses/${id}`, { method: 'DELETE' })
}

/** GET /api/v1/class-courses */
export function listClassCourses(params = {}) {
  return api('/api/v1/class-courses', { params })
}

/** GET /api/v1/class-courses/my-timetable */
export function getMyTimetable() {
  return api('/api/v1/class-courses/my-timetable')
}

/** POST /api/v1/class-courses */
export function createClassCourse(data) {
  return api('/api/v1/class-courses', { method: 'POST', body: data })
}

/** PUT /api/v1/class-courses/{id} */
export function updateClassCourse(id, data) {
  return api(`/api/v1/class-courses/${id}`, { method: 'PUT', body: data })
}

/** DELETE /api/v1/class-courses/{id} */
export function deleteClassCourse(id) {
  return api(`/api/v1/class-courses/${id}`, { method: 'DELETE' })
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

function slotOf(raw) {
  return {
    weekday: Number(raw.weekday || raw.weekDay || 0),
    periodStart: Number(raw.periodStart || 0),
    periodEnd: Number(raw.periodEnd || raw.periodStart || 0),
    roomNo: raw.roomNo || raw.room || ''
  }
}

export function flattenClassCourses(records) {
  const rows = []
  records.forEach((raw) => {
    const sessions = Array.isArray(raw.sessions) && raw.sessions.length ? raw.sessions : [null]
    sessions.forEach((slot, index) => {
      const time = slot ? slotOf(slot) : { weekday: 1, periodStart: 1, periodEnd: 2, roomNo: '' }
      rows.push({
        id: raw.id,
        sessionIndex: index,
        courseId: raw.courseId ?? null,
        name: raw.courseName || raw.name || '',
        classId: raw.classId ?? null,
        className: raw.className || '',
        grade: raw.gradeName || raw.grade || '',
        teacher: raw.teacherName || raw.teacher || '',
        teacherId: raw.teacherId ?? null,
        academicYear: raw.academicYear || '',
        semester: raw.semester ?? '',
        status: raw.status ?? 1,
        ...time
      })
    })
  })
  return rows
}

export function toTimetableRow(raw) {
  const time = slotOf(raw)
  return {
    id: raw.classCourseId ? `${raw.classCourseId}-${time.weekday}-${time.periodStart}` : raw.id,
    courseId: raw.courseId ?? null,
    name: raw.courseName || raw.name || '',
    classId: raw.classId ?? null,
    className: raw.className || '',
    teacher: raw.teacherName || raw.teacher || '',
    ...time
  }
}

export function toClassCoursePayload(form, siblings = []) {
  return classCourseWritePayload(form, siblings)
}

export async function fetchCourses(params = {}) {
  const page = pageRecords(await listCourses({ page: 1, size: 200, ...params }))
  return page.records.map(toCourseRow)
}

export async function fetchClassCourses(params = {}) {
  const page = pageRecords(await listClassCourses({ page: 1, size: 200, ...params }))
  return flattenClassCourses(page.records)
}

export async function fetchMyTimetable() {
  const data = pageRecords(await getMyTimetable())
  const list = data.records.length ? data.records : []
  return list.map(toTimetableRow)
}
