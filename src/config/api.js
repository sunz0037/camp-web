/**
 * 首期接口前缀为 /api/v1，客户端见 src/api/http.js。
 * 不提供跳过登录开关。
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API_PREFIX = '/api/v1'

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  CHANGE_PASSWORD: '/api/v1/auth/password',
  GET_CURRENT_USER: '/api/v1/auth/me'
}
