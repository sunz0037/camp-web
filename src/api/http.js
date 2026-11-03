const BASE = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, extra = {}) {
    super(message)
    this.name = 'ApiError'
    this.network = Boolean(extra.network)
    this.code = extra.code
  }
}

async function parseBody(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError('服务暂不可用', { network: true, code: response.status })
  }
}

/** 首期占位：只有真实接口发了 refreshToken 才尝试一次，失败则沿用原错误。 */
async function tryRefresh() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken || refreshToken.startsWith('mock-')) return false
  try {
    const json = await api('/auth/refresh', {
      method: 'POST',
      auth: false,
      body: { refreshToken },
      _retry: true
    })
    const data = json.data || {}
    if (!data.accessToken) return false
    localStorage.setItem('token', data.accessToken)
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
    return true
  } catch {
    return false
  }
}

/**
 * 统一请求 /api/v1，响应信封 { code, message, data, timestamp }。
 * code 为 0 或 200 视为成功。网络失败时抛出 ApiError.network。
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, auth = true, _retry = false } = options
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE}/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch {
    throw new ApiError('网络不可用', { network: true })
  }

  const json = await parseBody(response)
  const code = json.code
  const ok = response.ok && (code === undefined || code === 0 || code === 200)
  if (!ok && !_retry && auth && (code === 401 || response.status === 401)) {
    const refreshed = await tryRefresh()
    if (refreshed) return api(path, { ...options, _retry: true })
  }
  if (!ok) {
    if (code === undefined) {
      throw new ApiError('服务暂不可用', { network: true, code: response.status })
    }
    throw new ApiError(json.message || '请求失败', { code })
  }
  return json
}
