/**
 * 年级管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询年级列表
 */
export async function getGradeList(params = {}) {
  const { page = 1, size = 20, gradeType, status, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (gradeType) queryParams.append('gradeType', gradeType)
  if (status !== undefined && status !== null) queryParams.append('status', status)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/grades?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取年级列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询年级详情
 */
export async function getGradeDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取年级详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建年级
 */
export async function createGrade(data) {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建年级失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新年级
 */
export async function updateGrade(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新年级失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除年级
 */
export async function deleteGrade(id) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除年级失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询所有启用的年级
 */
export async function getAllEnabledGrades() {
  const response = await fetch(`${API_BASE_URL}/api/grades/all-enabled`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取年级列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 根据年级类型查询
 */
export async function getGradesByType(gradeType) {
  const response = await fetch(`${API_BASE_URL}/api/grades/by-type/${gradeType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取年级列表失败')
  }

  const result = await response.json()
  return result
}

