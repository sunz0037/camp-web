import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    palette: false,
    toasts: []
  }),
  actions: {
    openPalette() {
      this.palette = true
    },
    closePalette() {
      this.palette = false
    },
    toast(message, type = 'info') {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter((item) => item.id !== id)
      }, 2600)
    }
  }
})
