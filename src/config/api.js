/**
 * API配置文件
 */
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

