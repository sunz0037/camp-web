import axios from 'axios'
import { API_BASE } from '../config/api.js'
import { applyManagedHeaders, buildRequestHeaders } from './devHeaders.js'

export class ApiError extends Error {
  constructor(message, extra = {}) {
    super(message)
    this.name = 'ApiError'
    this.network = Boolean(extra.network)
    this.code = extra.code
  }
}

function devProfileEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_API_PROFILE === 'dev'
}

function readUser() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('userInfo')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const http = axios.create({
  baseURL: API_BASE,
  headers: { Accept: 'application/json' }
})

http.interceptors.request.use((config) => {
  const token = typeof localStorage === 'undefined' ? '' : localStorage.getItem('token') || ''
  const headers = buildRequestHeaders({
    token,
    user: readUser(),
    devProfile: devProfileEnabled()
  })
  config.headers = config.headers || {}
  applyManagedHeaders(config.headers, headers)
  return config
})

function envelopeError(data, status) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.code === undefined) {
    return new ApiError('服务暂不可用', { network: true, code: status })
  }
  return new ApiError(data.message || '请求失败', { code: data.code })
}

/** 首期占位：只有真实 refreshToken 才尝试一次。 */
async function tryRefresh() {
  const refreshToken = typeof localStorage === 'undefined' ? '' : localStorage.getItem('refreshToken')
  if (!refreshToken || refreshToken.startsWith('mock-') || refreshToken.startsWith('mock.')) return false
  try {
    const json = await http.post('/auth/refresh', { refreshToken }, { _retry: true })
    const data = json.data || {}
    if (!data.accessToken) return false
    localStorage.setItem('token', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
    return true
  } catch {
    return false
  }
}

http.interceptors.response.use(
  (response) => {
    const data = response.data ?? {}
    if (data && typeof data === 'object' && data.code !== undefined && data.code !== 0 && data.code !== 200) {
      return Promise.reject(new ApiError(data.message || '请求失败', { code: data.code }))
    }
    return data
  },
  async (error) => {
    if (!error.response) {
      return Promise.reject(new ApiError('网络不可用', { network: true }))
    }
    const status = error.response.status
    const data = error.response.data
    const config = error.config || {}
    if (!config._retry && (status === 401 || data?.code === 401)) {
      const refreshed = await tryRefresh()
      if (refreshed) {
        config._retry = true
        return http.request(config)
      }
    }
    return Promise.reject(envelopeError(data, status))
  }
)

/**
 * 统一请求 /api/v1，响应信封 { code, message, data, timestamp }。
 * 开发态请求头由拦截器写入，见 devHeaders.js。
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, _retry = false } = options
  return http.request({
    url: path,
    method,
    data: body,
    _retry
  })
}
