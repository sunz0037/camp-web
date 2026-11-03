import { api } from './http.js'
import { listQuery } from './paging.js'
import { pageRecords } from './unwrap.js'
import { toApiDateTime } from '../utils/format.js'

/**
 * 二期契约（计划第 2 节）：
 * GET/POST /api/v1/exams
 * GET/PUT/DELETE /api/v1/exams/{id}
 * 筛选项：grade、examType、isPublic、status、keyword
 * 列表 data：{ items, total, page, pageSize }
 */

export function listExams(params = {}) {
  return api('/api/v1/exams', { params })
}

export function getExam(id) {
  return api(`/api/v1/exams/${id}`)
}

export function createExam(data) {
  return api('/api/v1/exams', { method: 'POST', body: data })
}

export function updateExam(id, data) {
  return api(`/api/v1/exams/${id}`, { method: 'PUT', body: data })
}

export function deleteExam(id) {
  return api(`/api/v1/exams/${id}`, { method: 'DELETE' })
}

function gradeClassText(gradeName, className) {
  if (className && gradeName && String(className).startsWith(gradeName)) return className
  const text = [gradeName, className].filter(Boolean).join(' · ')
  return text || '—'
}

function flag(value) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

export function examStatus(value) {
  const text = String(value ?? '').toUpperCase()
  if (value === 0 || text === '0' || text === 'CANCELLED' || text === 'CANCELED' || value === '已取消') {
    return 'CANCELLED'
  }
  return 'NORMAL'
}

export function examStatusLabel(value) {
  return examStatus(value) === 'CANCELLED' ? '已取消' : '正常'
}

export function toExamRow(raw = {}) {
  const gradeName = raw.gradeName || raw.grade || raw.targetGrade || ''
  const className = raw.className || raw.targetClass || ''
  return {
    id: raw.id,
    name: raw.name || raw.examName || raw.title || '',
    subject: raw.subject || raw.courseName || raw.subjectName || '',
    examType: raw.examType || raw.type || '',
    gradeName,
    classId: raw.classId ?? null,
    className,
    gradeClass: gradeClassText(gradeName, className),
    startTime: raw.startTime || raw.startAt || raw.examDate || raw.beginTime || '',
    endTime: raw.endTime || raw.endAt || raw.finishTime || '',
    isPublic: flag(raw.isPublic ?? raw.public ?? raw.published),
    status: examStatus(raw.status),
    remark: raw.remark || ''
  }
}

export function toExamPayload(form) {
  return {
    name: String(form.name || '').trim(),
    subject: String(form.subject || '').trim(),
    examType: form.examType || '',
    gradeName: form.gradeName || null,
    className: String(form.className || '').trim() || null,
    classId: form.classId || null,
    startTime: toApiDateTime(form.startTime),
    endTime: toApiDateTime(form.endTime),
    isPublic: Boolean(form.isPublic),
    status: examStatus(form.status),
    remark: String(form.remark || '').trim()
  }
}

export async function fetchExamPage(params) {
  const page = pageRecords(await listExams(listQuery(params.page, params.pageSize, {
    grade: params.grade,
    examType: params.examType,
    isPublic: params.isPublic,
    status: params.status,
    keyword: params.keyword
  })))
  return { ...page, records: page.records.map(toExamRow) }
}
