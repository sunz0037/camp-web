import { api } from './http.js'
import { listQuery } from './paging.js'
import { pageRecords } from './unwrap.js'
import { toApiDateTime } from '../utils/format.js'

/**
 * 二期契约（计划第 2 节）：
 * GET/POST /api/v1/visitors
 * GET/PUT/DELETE /api/v1/visitors/{id}
 * POST /api/v1/visitors/{id}/approve|reject|check-in|check-out
 * 状态：PENDING 待审 / APPROVED 已批准 / REJECTED 已拒绝 / CHECKED_IN 已入校 / CHECKED_OUT 已离校
 */

const STATUS_LABEL = {
  PENDING: '待审',
  APPROVED: '已批准',
  REJECTED: '已拒绝',
  CHECKED_IN: '已入校',
  CHECKED_OUT: '已离校'
}

export function listVisitors(params = {}) {
  return api('/api/v1/visitors', { params })
}

export function getVisitor(id) {
  return api(`/api/v1/visitors/${id}`)
}

export function createVisitor(data) {
  return api('/api/v1/visitors', { method: 'POST', body: data })
}

export function updateVisitor(id, data) {
  return api(`/api/v1/visitors/${id}`, { method: 'PUT', body: data })
}

export function deleteVisitor(id) {
  return api(`/api/v1/visitors/${id}`, { method: 'DELETE' })
}

export function approveVisitor(id) {
  return api(`/api/v1/visitors/${id}/approve`, { method: 'POST', body: {} })
}

export function rejectVisitor(id) {
  return api(`/api/v1/visitors/${id}/reject`, { method: 'POST', body: {} })
}

export function checkInVisitor(id) {
  return api(`/api/v1/visitors/${id}/check-in`, { method: 'POST', body: {} })
}

export function checkOutVisitor(id) {
  return api(`/api/v1/visitors/${id}/check-out`, { method: 'POST', body: {} })
}

export function visitorStatus(value) {
  const text = String(value ?? '').toUpperCase()
  const table = {
    0: 'PENDING',
    PENDING: 'PENDING',
    待审: 'PENDING',
    待审核: 'PENDING',
    1: 'APPROVED',
    APPROVED: 'APPROVED',
    已批准: 'APPROVED',
    2: 'CHECKED_IN',
    CHECKED_IN: 'CHECKED_IN',
    已入校: 'CHECKED_IN',
    已进入: 'CHECKED_IN',
    3: 'CHECKED_OUT',
    CHECKED_OUT: 'CHECKED_OUT',
    已离校: 'CHECKED_OUT',
    已离开: 'CHECKED_OUT',
    4: 'REJECTED',
    REJECTED: 'REJECTED',
    已拒绝: 'REJECTED'
  }
  return table[value] || table[text] || 'PENDING'
}

export function visitorStatusLabel(value) {
  return STATUS_LABEL[visitorStatus(value)] || '待审'
}

export function toVisitorRow(raw = {}) {
  return {
    id: raw.id,
    visitorName: raw.visitorName || raw.name || '',
    idNo: raw.idNo || raw.idNumber || raw.certificateNo || raw.visitorIdCard || '',
    phone: raw.phone || raw.visitorPhone || '',
    reason: raw.reason || raw.visitPurpose || raw.purpose || '',
    hostName: raw.hostName || raw.visitTargetName || raw.host || '',
    hostUserId: raw.hostUserId ?? raw.visitTargetUserId ?? null,
    appointmentTime: raw.appointmentTime || raw.visitTimeStart || raw.appointedAt || '',
    arrivalTime: raw.arrivalTime || raw.entryTime || raw.checkInTime || '',
    leaveTime: raw.leaveTime || raw.exitTime || raw.checkOutTime || '',
    status: visitorStatus(raw.status),
    remark: raw.remark || ''
  }
}

export function toVisitorPayload(form) {
  return {
    visitorName: String(form.visitorName || '').trim(),
    idNo: String(form.idNo || '').trim(),
    phone: String(form.phone || '').trim(),
    reason: String(form.reason || '').trim(),
    hostName: String(form.hostName || '').trim(),
    hostUserId: form.hostUserId || null,
    appointmentTime: toApiDateTime(form.appointmentTime),
    remark: String(form.remark || '').trim()
  }
}

export async function fetchVisitorPage(params) {
  const page = pageRecords(await listVisitors(listQuery(params.page, params.pageSize, {
    status: params.status,
    keyword: params.keyword
  })))
  return { ...page, records: page.records.map(toVisitorRow) }
}
