/**
 * 校园公告管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询公告列表
 */
export async function getAnnouncementList(params = {}) {
  const { page = 1, size = 20, category, status, isTop, isUrgent, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (category) queryParams.append('category', category)
  if (status !== undefined && status !== null) queryParams.append('status', status)
  if (isTop !== undefined && isTop !== null) queryParams.append('isTop', isTop)
  if (isUrgent !== undefined && isUrgent !== null) queryParams.append('isUrgent', isUrgent)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/announcements?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取公告列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询公告详情
 */
export async function getAnnouncementDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取公告详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建公告
 */
export async function createAnnouncement(data) {
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建公告失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新公告
 */
export async function updateAnnouncement(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新公告失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除公告
 */
export async function deleteAnnouncement(id) {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除公告失败')
  }

  const result = await response.json()
  return result
}

/**
 * 置顶/取消置顶
 */
export async function toggleTop(id, isTop) {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/top?isTop=${isTop}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '操作失败')
  }

  const result = await response.json()
  return result
}

/**
 * 撤回公告
 */
export async function withdrawAnnouncement(id) {
  const response = await fetch(`${API_BASE_URL}/api/announcements/${id}/withdraw`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '撤回公告失败')
  }

  const result = await response.json()
  return result
}
