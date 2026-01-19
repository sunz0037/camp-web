/**
 * 权限管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 查询权限列表（树形结构）
 */
export async function getPermissionList() {
  const response = await fetch(`${API_BASE_URL}/api/permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取权限列表失败')
  }

  const result = await response.json()
  return result
}
