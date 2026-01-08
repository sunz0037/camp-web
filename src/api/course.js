/**
 * 科目管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询科目列表
 */
export async function getCourseList(params = {}) {
  const { page = 1, size = 20, semester, academicYear, teacherId, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (semester) queryParams.append('semester', semester)
  if (academicYear) queryParams.append('academicYear', academicYear)
  if (teacherId) queryParams.append('teacherId', teacherId)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/courses?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取科目列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 获取所有启用的科目
 */
export async function getAllEnabledCourses() {
  const response = await fetch(`${API_BASE_URL}/api/courses/enabled`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取科目列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询科目详情
 */
export async function getCourseDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取科目详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建科目
 */
export async function createCourse(data) {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建科目失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新科目
 */
export async function updateCourse(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新科目失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除科目
 */
export async function deleteCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除科目失败')
  }

  const result = await response.json()
  return result
}

