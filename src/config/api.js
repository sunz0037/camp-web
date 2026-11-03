/**
 * Axios 的 baseURL 使用 VITE_API_BASE，开发环境见 .env.development。
 * 未配置时回退到同源 /api/v1。
 */
export const API_BASE = String(import.meta.env.VITE_API_BASE || '/api/v1').replace(/\/$/, '')

/** 旧模块仍把这个值当作主机根地址，再自行拼接 /api/... */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API_PREFIX = '/api/v1'

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  CHANGE_PASSWORD: '/api/v1/auth/password',
  GET_CURRENT_USER: '/api/v1/auth/me'
}
