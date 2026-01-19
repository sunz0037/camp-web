/**
 * 用户管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询用户列表
 */
export async function getUserList(params = {}) {
  const { page = 1, size = 20, userType, status, keyword } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (userType !== undefined && userType !== null) queryParams.append('userType', userType)
  if (status !== undefined && status !== null) queryParams.append('status', status)
  if (keyword) queryParams.append('keyword', keyword)

  const response = await fetch(`${API_BASE_URL}/api/users?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取用户列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询用户详情
 */
export async function getUserDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取用户详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建用户
 */
export async function createUser(data) {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建用户失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新用户信息
 */
export async function updateUser(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新用户信息失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除用户
 */
export async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除用户失败')
  }

  const result = await response.json()
  return result
}

/**
 * 启用/禁用用户
 */
export async function updateUserStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}/status?status=${status}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新用户状态失败')
  }

  const result = await response.json()
  return result
}
