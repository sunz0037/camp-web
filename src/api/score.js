/**
 * 成绩管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询成绩列表
 */
export async function getScoreList(params = {}) {
  const { page = 1, size = 20, studentId, courseId, examScheduleId, semester, academicYear, examType } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (studentId) queryParams.append('studentId', studentId)
  if (courseId) queryParams.append('courseId', courseId)
  if (examScheduleId) queryParams.append('examScheduleId', examScheduleId)
  if (semester) queryParams.append('semester', semester)
  if (academicYear) queryParams.append('academicYear', academicYear)
  if (examType) queryParams.append('examType', examType)

  const response = await fetch(`${API_BASE_URL}/api/scores?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取成绩列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询成绩详情
 */
export async function getScoreDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/scores/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取成绩详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建成绩记录
 */
export async function createScore(data) {
  const response = await fetch(`${API_BASE_URL}/api/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建成绩记录失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新成绩记录
 */
export async function updateScore(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/scores/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新成绩记录失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除成绩记录
 */
export async function deleteScore(id) {
  const response = await fetch(`${API_BASE_URL}/api/scores/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除成绩记录失败')
  }

  const result = await response.json()
  return result
}
