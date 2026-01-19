/**
 * 数据查询权限管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询数据查询权限列表
 */
export async function getDataPermissionList(params = {}) {
  const { page = 1, size = 20, userId, roleId, dataType } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)
  if (userId) queryParams.append('userId', userId)
  if (roleId) queryParams.append('roleId', roleId)
  if (dataType) queryParams.append('dataType', dataType)

  const response = await fetch(`${API_BASE_URL}/api/data-permissions?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取数据查询权限列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询数据查询权限详情
 */
export async function getDataPermissionDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/data-permissions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取数据查询权限详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建数据查询权限
 */
export async function createDataPermission(data) {
  const response = await fetch(`${API_BASE_URL}/api/data-permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建数据查询权限失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新数据查询权限
 */
export async function updateDataPermission(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/data-permissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新数据查询权限失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除数据查询权限
 */
export async function deleteDataPermission(id) {
  const response = await fetch(`${API_BASE_URL}/api/data-permissions/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除数据查询权限失败')
  }

  const result = await response.json()
  return result
}
