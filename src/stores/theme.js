import { defineStore } from 'pinia'
import { fetchSettings, normalizeThemeKey, saveSettings } from '../api/settings.js'

function applyDom(themeKey) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (themeKey === 'default') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', themeKey)
}

// PHASE2-BLOCKED: 换肤入口已隐藏，勿在页面渲染主题切换。
export const useThemeStore = defineStore('theme', {
  state: () => ({
    themeKey: 'default'
  }),
  actions: {
    apply(themeKey) {
      const key = normalizeThemeKey(themeKey)
      this.themeKey = key
      applyDom(key)
    },
    async load() {
      try {
        const settings = await fetchSettings()
        this.apply(settings.themeKey)
      } catch {
        this.apply('default')
      }
    },
    async setTheme(themeKey) {
      const next = normalizeThemeKey(themeKey)
      const prev = this.themeKey
      this.apply(next)
      try {
        await saveSettings(next)
      } catch (error) {
        this.apply(prev)
        throw error
      }
    }
  }
})
