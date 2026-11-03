import { api } from './http.js'
import { listQuery } from './paging.js'
import { pageRecords } from './unwrap.js'

/**
 * 二期契约（计划第 2 节）：
 * GET/POST /api/v1/exam-scores
 * PUT/DELETE /api/v1/exam-scores/{id}
 * 筛选项：examId、studentId、classId，另支持 keyword / className
 */

export function listExamScores(params = {}) {
  return api('/api/v1/exam-scores', { params })
}

export function createExamScore(data) {
  return api('/api/v1/exam-scores', { method: 'POST', body: data })
}

export function updateExamScore(id, data) {
  return api(`/api/v1/exam-scores/${id}`, { method: 'PUT', body: data })
}

export function deleteExamScore(id) {
  return api(`/api/v1/exam-scores/${id}`, { method: 'DELETE' })
}

export function toScoreRow(raw = {}) {
  const score = raw.score ?? raw.points
  return {
    id: raw.id,
    examId: raw.examId ?? raw.examScheduleId ?? null,
    examName: raw.examName || raw.name || '',
    studentId: raw.studentId ?? null,
    studentNo: raw.studentNo || '',
    studentName: raw.studentName || raw.realName || raw.name || '',
    classId: raw.classId ?? null,
    className: raw.className || '',
    subject: raw.subject || raw.courseName || '',
    score: score === null || score === undefined || score === '' ? null : Number(score),
    gradeLevel: raw.gradeLevel || raw.level || '',
    recordedByName: raw.recordedByName || raw.createdByName || raw.enteredByName || '',
    recordedAt: raw.recordedAt || raw.createdAt || raw.updatedAt || ''
  }
}

function asId(value) {
  if (value === '' || value === null || value === undefined) return null
  const text = String(value)
  return /^\d+$/.test(text) ? Number(text) : value
}

export function toScorePayload(form) {
  return {
    examId: asId(form.examId),
    studentId: asId(form.studentId),
    score: form.score === '' || form.score === null || form.score === undefined ? null : Number(form.score),
    gradeLevel: form.gradeLevel || null
  }
}

export async function fetchScorePage(params) {
  const page = pageRecords(await listExamScores(listQuery(params.page, params.pageSize, {
    examId: params.examId,
    studentId: params.studentId,
    classId: params.classId,
    className: params.className,
    keyword: params.keyword
  })))
  return { ...page, records: page.records.map(toScoreRow) }
}
