/**
 * API配置文件
 */

/** 测试阶段跳过登录，直接进入内部页面调试（上线前请改为 false） */
export const SKIP_LOGIN_FOR_DEV = true

const MOCK_USER_INFO = {
  id: 1,
  username: 'admin',
  realName: '测试管理员',
  userType: 3
}

export function ensureDevAuth() {
  if (!SKIP_LOGIN_FOR_DEV) return
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'dev-mock-token')
  }
  if (!localStorage.getItem('userInfo')) {
    localStorage.setItem('userInfo', JSON.stringify(MOCK_USER_INFO))
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  // 认证相关
  LOGIN: '/api/auth/login',
  ACTIVATE: '/api/auth/activate',
  LOGOUT: '/api/auth/logout',
  CHANGE_PASSWORD: '/api/auth/password',
  REFRESH_TOKEN: '/api/auth/refresh',
  GET_CURRENT_USER: '/api/auth/me'
}

