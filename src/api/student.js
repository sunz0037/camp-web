/**
 * 学生管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询学生列表
 */
export async function getStudentList(params = {}) {
  const { page = 1, size = 20, grade, className, major, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (grade) queryParams.append('grade', grade)
  if (className) queryParams.append('className', className)
  if (major) queryParams.append('major', major)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/students?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取学生列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询学生详情
 */
export async function getStudentDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取学生详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建学生信息
 */
export async function createStudent(data) {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建学生信息失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新学生信息
 */
export async function updateStudent(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新学生信息失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除学生信息
 */
export async function deleteStudent(id) {
  const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除学生信息失败')
  }

  const result = await response.json()
  return result
}
