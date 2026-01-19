/**
 * 应急联系人管理API
 */
import { API_BASE_URL } from '../config/api.js'

/**
 * 根据学生ID查询所有应急联系人
 */
export async function getEmergencyContactsByStudentId(studentId) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/by-student/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取应急联系人列表失败')
  }

  const result = await response.json()
  return result
}

/**
 * 查询应急联系人详情
 */
export async function getEmergencyContactDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取应急联系人详情失败')
  }

  const result = await response.json()
  return result
}

/**
 * 创建应急联系人
 */
export async function createEmergencyContact(data) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '创建应急联系人失败')
  }

  const result = await response.json()
  return result
}

/**
 * 更新应急联系人
 */
export async function updateEmergencyContact(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新应急联系人失败')
  }

  const result = await response.json()
  return result
}

/**
 * 删除应急联系人
 */
export async function deleteEmergencyContact(id) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '删除应急联系人失败')
  }

  const result = await response.json()
  return result
}

/**
 * 设置主要联系人
 */
export async function setPrimaryContact(studentId, contactId) {
  const response = await fetch(`${API_BASE_URL}/api/emergency-contacts/set-primary?studentId=${studentId}&contactId=${contactId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '设置主要联系人失败')
  }

  const result = await response.json()
  return result
}
