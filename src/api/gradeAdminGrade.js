/**
 * 年级管理员关联管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 查询年级管理员的年级关联列表
 */
export async function getGradeAdminGradeList(adminId, params = {}) {
  const { page = 1, size = 20 } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)

  const response = await fetch(`${API_BASE_URL}/api/grade-admins/${adminId}/grades?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取年级管理员关联列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建年级管理员关联
 */
export async function createGradeAdminGrade(adminId, data) {
  const response = await fetch(`${API_BASE_URL}/api/grade-admins/${adminId}/grades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建年级管理员关联失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除年级管理员关联
 */
export async function deleteGradeAdminGrade(adminId, id) {
  const response = await fetch(`${API_BASE_URL}/api/grade-admins/${adminId}/grades/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除年级管理员关联失败')
  }

  const result = await response.json()
  return result
}
