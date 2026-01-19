/**
 * 角色管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 分页查询角色列表
 */
export async function getRoleList(params = {}) {
  const { page = 1, size = 20 } = params
  const queryParams = new URLSearchParams()
  queryParams.append('page', page)
  queryParams.append('size', size)

  const response = await fetch(`${API_BASE_URL}/api/roles?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取角色列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询角色详情
 */
export async function getRoleDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取角色详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建角色
 */
export async function createRole(data) {
  const response = await fetch(`${API_BASE_URL}/api/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建角色失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新角色
 */
export async function updateRole(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新角色失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除角色
 */
export async function deleteRole(id) {
  const response = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除角色失败')
  }

  const result = await response.json()
  return result
}

/**
 * 为角色分配权限
 */
export async function assignPermissions(roleId, permissionIds) {
  const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(permissionIds)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '分配权限失败')
  }

  const result = await response.json()
  return result
}
