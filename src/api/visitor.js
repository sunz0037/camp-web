/**
 * 来访登记管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询来访登记列表
 */
export async function getVisitorList(params = {}) {
  const { page = 1, size = 20, visitDate, status, visitTargetUserId, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (visitDate) queryParams.append('visitDate', visitDate)
  if (status !== undefined && status !== null) queryParams.append('status', status)
  if (visitTargetUserId) queryParams.append('visitTargetUserId', visitTargetUserId)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/visitors?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取来访登记列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询来访登记详情
 */
export async function getVisitorDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取来访登记详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建来访登记
 */
export async function createVisitor(data) {
  const response = await fetch(`${API_BASE_URL}/api/visitors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建来访登记失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新来访登记
 */
export async function updateVisitor(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新来访登记失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除来访登记
 */
export async function deleteVisitor(id) {
  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除来访登记失败')
  }

  const result = await response.json()
  return result
}

/**
 * 审核并批准来访登记
 */
export async function approveVisitor(id, status, remark) {
  const queryParams = new URLSearchParams()
  queryParams.append('status', status)
  if (remark) queryParams.append('remark', remark)

  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}/approve?${queryParams}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '批准来访登记失败')
  }

  const result = await response.json()
  return result
}

/**
 * 拒绝来访登记
 */
export async function rejectVisitor(id, remark) {
  const queryParams = new URLSearchParams()
  if (remark) queryParams.append('remark', remark)

  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}/reject?${queryParams}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '拒绝来访登记失败')
  }

  const result = await response.json()
  return result
}

/**
 * 登记来访人实际进入时间
 */
export async function recordEntry(id, entryTime) {
  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}/entry?entryTime=${encodeURIComponent(entryTime)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '登记进入时间失败')
  }

  const result = await response.json()
  return result
}

/**
 * 登记来访人实际离开时间
 */
export async function recordExit(id, exitTime) {
  const response = await fetch(`${API_BASE_URL}/api/visitors/${id}/exit?exitTime=${encodeURIComponent(exitTime)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '登记离开时间失败')
  }

  const result = await response.json()
  return result
}
