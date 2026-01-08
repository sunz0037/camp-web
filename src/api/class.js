/**
 * 班级管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询班级列表
 */
export async function getClassList(params = {}) {
  const { page = 1, size = 20, gradeId, gradeType, status, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (gradeId) queryParams.append('gradeId', gradeId)
  if (gradeType) queryParams.append('gradeType', gradeType)
  if (status !== undefined && status !== null) queryParams.append('status', status)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/classes?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询班级详情
 */
export async function getClassDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建班级
 */
export async function createClass(data) {
  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建班级失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新班级
 */
export async function updateClass(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新班级失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除班级
 */
export async function deleteClass(id) {
  const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除班级失败')
  }

  const result = await response.json()
  return result
}

/**
 * 根据年级ID查询班级列表
 */
export async function getClassesByGradeId(gradeId) {
  const response = await fetch(`${API_BASE_URL}/api/classes/by-grade/${gradeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 根据年级ID查询启用的班级列表
 */
export async function getEnabledClassesByGradeId(gradeId) {
  const response = await fetch(`${API_BASE_URL}/api/classes/by-grade/${gradeId}/enabled`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级列表失败')
  }

  const result = await response.json()
  return result
}

