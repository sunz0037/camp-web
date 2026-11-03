import { api } from './http.js'
import { pageRecords } from './unwrap.js'

/** GET /api/v1/attendances/summaries */
export function listSummaries(params = {}) {
  return api('/api/v1/attendances/summaries', { params })
}

/** GET /api/v1/attendances/classes */
export function listAttendanceClasses(params = {}) {
  return api('/api/v1/attendances/classes', { params })
}

/** GET /api/v1/attendances/records */
export function listAttendanceRecords(params = {}) {
  return api('/api/v1/attendances/records', { params })
}

/** POST /api/v1/attendances/summaries */
export function createSummary(data) {
  return api('/api/v1/attendances/summaries', { method: 'POST', body: data })
}

const RECORD_STATUS = { 1: 'absent', 2: 'late', 3: 'leave', 4: 'early' }

export function toSummaryRow(raw) {
  const leave = Number(raw.leaveCount ?? raw.leave ?? 0)
  const late = Number(raw.lateCount ?? raw.late ?? 0)
  const absent = Number(raw.absentCount ?? raw.absent ?? 0)
  const present = Number(raw.presentCount ?? raw.actual ?? raw.present ?? 0)
  return {
    id: raw.id,
    date: raw.attendanceDate || raw.date || '',
    className: raw.className || '',
    grade: raw.grade || '',
    courseId: raw.courseId ?? null,
    courseName: raw.courseName || raw.course || '班级日报',
    summary: {
      expected: Number(raw.expectedCount ?? raw.expected ?? 0),
      actual: present,
      leave,
      late,
      absent,
      leaveOrLate: leave + late
    }
  }
}

const EXCEPTION_STATUS = {
  ABSENT: 'absent',
  LATE: 'late',
  PERSONAL_LEAVE: 'leave',
  SICK_LEAVE: 'leave',
  EARLY_LEAVE: 'leave'
}

export function toRecordRow(raw) {
  const status = EXCEPTION_STATUS[raw.exceptionType] || RECORD_STATUS[raw.status] || 'absent'
  const studentId = raw.studentId
  return {
    key: raw.id ?? `${studentId}-${raw.attendanceDate || ''}`,
    id: raw.id,
    date: raw.attendanceDate || raw.date || '',
    className: raw.className || (raw.classId != null ? `班级#${raw.classId}` : '—'),
    courseName: raw.courseName || raw.course || (raw.courseId != null ? `课程#${raw.courseId}` : '—'),
    courseId: raw.courseId ?? null,
    studentId,
    studentNo: raw.studentNo || (studentId != null ? String(studentId) : '—'),
    name: raw.studentName || raw.realName || raw.name || (studentId != null ? `学生#${studentId}` : '—'),
    status
  }
}

export async function fetchSummaries(params = {}) {
  const page = pageRecords(await listSummaries({ page: 1, size: 200, ...params }))
  return page.records.map(toSummaryRow)
}

export async function fetchRecords(params = {}) {
  const page = pageRecords(await listAttendanceRecords({ page: 1, size: 200, ...params }))
  return page.records.map(toRecordRow)
}
