/**
 * 班级授课科目管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 查询班级的所有授课科目
 */
export async function getClassCoursesByClassId(classId) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/by-class/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级授课科目列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询班级的启用授课科目
 */
export async function getEnabledClassCoursesByClassId(classId) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/by-class/${classId}/enabled`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级授课科目列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询详情
 */
export async function getClassCourseDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级授课科目详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建班级授课科目
 */
export async function createClassCourse(data) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建班级授课科目失败')
  }

  const result = await response.json()
  return result
}

/**
 * 批量创建班级授课科目
 */
export async function batchCreateClassCourses(classId, courseIds) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/batch?classId=${classId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(courseIds)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '批量创建班级授课科目失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新班级授课科目
 */
export async function updateClassCourse(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新班级授课科目失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除班级授课科目
 */
export async function deleteClassCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除班级授课科目失败')
  }

  const result = await response.json()
  return result
}

/**
 * 批量删除班级授课科目
 */
export async function batchDeleteClassCourses(ids) {
  const response = await fetch(`${API_BASE_URL}/api/class-courses/batch`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(ids)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '批量删除班级授课科目失败')
  }

  const result = await response.json()
  return result
}

