/**
 * 教师班级关联管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 查询教师的班级关联列表
 */
export async function getTeacherClassList(teacherId, params = {}) {
  const { page = 1, size = 20 } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)

  const response = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}/classes?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取教师班级关联列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建教师班级关联
 */
export async function createTeacherClass(teacherId, data) {
  const response = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建教师班级关联失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除教师班级关联
 */
export async function deleteTeacherClass(teacherId, id) {
  const response = await fetch(`${API_BASE_URL}/api/teachers/${teacherId}/classes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除教师班级关联失败')
  }

  const result = await response.json()
  return result
}
