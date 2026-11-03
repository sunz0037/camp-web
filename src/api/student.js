import { studentWritePayload } from '../domain/writePayloads.js'
import { api } from './http.js'
import { pageRecords, unwrapData } from './unwrap.js'

/** GET /api/v1/students */
export function listStudents(params = {}) {
  return api('/api/v1/students', { params })
}

/** GET /api/v1/students/{id} */
export function getStudent(id) {
  return api(`/api/v1/students/${id}`)
}

/** POST /api/v1/students */
export function createStudent(data) {
  return api('/api/v1/students', { method: 'POST', body: data })
}

/** PUT /api/v1/students/{id} */
export function updateStudent(id, data) {
  return api(`/api/v1/students/${id}`, { method: 'PUT', body: data })
}

/** GET /api/v1/classes */
export function listClasses(params = {}) {
  return api('/api/v1/classes', { params })
}

/** GET /api/v1/emergency-contacts/by-student/{studentId} */
export function listEmergencyContacts(studentId) {
  return api(`/api/v1/emergency-contacts/by-student/${studentId}`)
}

/** POST /api/v1/emergency-contacts */
export function createEmergencyContact(data) {
  return api('/api/v1/emergency-contacts', { method: 'POST', body: data })
}

const STATUS_LABEL = { 0: '休学', 1: '在读', 2: '毕业', 3: '退学' }

export function genderLabel(value) {
  if (value === 1 || value === '1' || value === '男') return '男'
  if (value === 0 || value === 2 || value === '0' || value === '2' || value === '女') return '女'
  return value ? String(value) : '—'
}

export function statusLabel(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (STATUS_LABEL[value] ) return STATUS_LABEL[value]
  return String(value)
}

export function toStudentRow(raw) {
  return {
    id: raw.id,
    studentNo: raw.studentNo || raw.studentNumber || '',
    name: raw.realName || raw.name || raw.studentName || '',
    gender: genderLabel(raw.gender),
    grade: raw.grade || raw.gradeName || '',
    className: raw.classNameFull || raw.className || '',
    classId: raw.classId ?? null,
    gradeId: raw.gradeId ?? null,
    phone: raw.phone || raw.mobile || '',
    status: statusLabel(raw.status)
  }
}

export function toStudentPayload(form, classes = []) {
  return studentWritePayload(form, classes)
}

export function toClassOption(raw) {
  return {
    id: raw.id,
    name: raw.className || raw.name || '',
    grade: raw.gradeName || raw.grade || '',
    gradeId: raw.gradeId ?? null
  }
}

export async function fetchStudentPage(params) {
  const page = pageRecords(await listStudents(params))
  return { ...page, records: page.records.map(toStudentRow) }
}

export async function fetchClasses() {
  const page = pageRecords(await listClasses({ page: 1, size: 200 }))
  return page.records.map(toClassOption).filter((item) => item.name)
}

export async function fetchContacts(studentId) {
  const data = unwrapData(await listEmergencyContacts(studentId))
  const list = Array.isArray(data) ? data : pageRecords(data).records
  return list.map((item) => ({
    id: item.id,
    name: item.contactName || item.name || '',
    relation: item.relationship || item.relation || '',
    phone: item.phone || '',
    primary: item.isPrimary === 1 || item.primary === true
  }))
}
