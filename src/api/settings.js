import { api } from './http.js'
import { unwrapData } from './unwrap.js'

/** default 对应 v1.3.4 壳层，不得改写 :root 默认令牌。 */
export const THEME_KEYS = ['default', 'dark', 'campus-green']

export function normalizeThemeKey(value) {
  return THEME_KEYS.includes(value) ? value : 'default'
}

export async function fetchSettings() {
  const data = unwrapData(await api('/api/v1/me/settings'))
  return { themeKey: normalizeThemeKey(data?.themeKey) }
}

export function saveSettings(themeKey) {
  const key = normalizeThemeKey(themeKey)
  return api('/api/v1/me/settings', { method: 'PUT', body: { themeKey: key } })
}
