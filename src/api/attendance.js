/**
 * 考勤管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询班级每日考勤汇总列表
 */
export async function getClassDailyList(params = {}) {
  const { page = 1, size = 20, grade, className, attendanceDate } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (grade) queryParams.append('grade', grade)
  if (className) queryParams.append('className', className)
  if (attendanceDate) queryParams.append('attendanceDate', attendanceDate)

  const response = await fetch(`${API_BASE_URL}/api/attendance/classes?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取班级考勤汇总列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建或更新班级每日考勤汇总
 */
export async function upsertClassDaily(data) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '保存班级考勤汇总失败')
  }

  const result = await response.json()
  return result
}

/**
 * 分页查询学生异常考勤记录列表
 */
export async function getStudentAttendanceList(params = {}) {
  const { page = 1, size = 20, grade, className, attendanceDate, status } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (grade) queryParams.append('grade', grade)
  if (className) queryParams.append('className', className)
  if (attendanceDate) queryParams.append('attendanceDate', attendanceDate)
  if (status !== undefined && status !== null) queryParams.append('status', status)

  const response = await fetch(`${API_BASE_URL}/api/attendance/students?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取学生考勤记录列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建学生异常考勤记录
 */
export async function createStudentAttendance(data) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建学生考勤记录失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新学生异常考勤记录
 */
export async function updateStudentAttendance(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新学生考勤记录失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除学生异常考勤记录
 */
export async function deleteStudentAttendance(id) {
  const response = await fetch(`${API_BASE_URL}/api/attendance/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除学生考勤记录失败')
  }

  const result = await response.json()
  return result
}
