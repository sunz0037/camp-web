import { computed, ref } from 'vue'

/** 与 Framer 列表占位文案一致。接口不可用时显示这一行，不阻塞壳层。 */
export const PLACEHOLDER_ROW = '示例占位行 · 实际数据由后端接口加载（共 — 条）'
export const PAGE_SIZE = 20

export function useListShell() {
  const page = ref(1)
  const total = ref(0)
  const loading = ref(true)
  const loadError = ref('')
  const usingPlaceholder = ref(false)

  const pageCount = computed(() => {
    if (usingPlaceholder.value) return 1
    return Math.max(1, Math.ceil(total.value / PAGE_SIZE) || 1)
  })

  const pageList = computed(() => {
    return Array.from({ length: pageCount.value }, (_, index) => index + 1).filter((n) => {
      return n === 1 || n === pageCount.value || Math.abs(n - page.value) <= 1
    })
  })

  const rangeText = computed(() => {
    if (usingPlaceholder.value || !total.value) return '—'
    const from = (page.value - 1) * PAGE_SIZE + 1
    const to = Math.min(page.value * PAGE_SIZE, total.value)
    return `${from}-${to}`
  })

  const summary = computed(() => {
    if (usingPlaceholder.value) return '共 — 条'
    if (!total.value) return '共 0 条'
    return `共 ${total.value} 条 · 显示 ${rangeText.value}`
  })

  function netHint(message) {
    const text = String(message || '')
    return text.split('；').every((part) => part === '网络不可用' || part === '服务暂不可用')
  }

  function markPlaceholder(error) {
    usingPlaceholder.value = true
    total.value = 0
    const message = String(error?.message || '')
    const offline = !message
      || message === 'Failed to fetch'
      || message.includes('Network')
      || message.includes('ECONNREFUSED')
      || /^获取.+失败$/.test(message)
      || Boolean(error?.network)
    loadError.value = offline ? '网络不可用' : message
  }

  function markReady(count) {
    usingPlaceholder.value = false
    total.value = count
    loadError.value = ''
  }

  return {
    page,
    total,
    loading,
    loadError,
    usingPlaceholder,
    pageCount,
    pageList,
    summary,
    netHint,
    markPlaceholder,
    markReady,
    pageSize: PAGE_SIZE
  }
}

export function readRecords(result) {
  const data = result && typeof result === 'object' && 'data' in result ? result.data : result
  if (Array.isArray(data)) return { records: data, total: data.length }
  if (!data || typeof data !== 'object') return { records: [], total: 0 }
  const records = data.records || data.list || data.items || data.content || data.rows || []
  const list = Array.isArray(records) ? records : []
  return { records: list, total: Number(data.total ?? list.length) }
}

export function formatDate(value) {
  if (!value) return '—'
  const text = String(value)
  if (text.includes('T')) return text.split('T')[0]
  return text.slice(0, 10)
}

export function actionError(error, fallback) {
  const message = String(error?.message || '')
  if (!message || error?.network || /JSON|Unexpected|Failed to fetch|Network|ECONNREFUSED/.test(message)) {
    return fallback
  }
  return message
}

export function acceptResult(result) {
  if (result && typeof result === 'object' && result.code !== undefined && result.code !== 0 && result.code !== 200) {
    throw new Error(result.message || '接口未接通')
  }
  return result
}
