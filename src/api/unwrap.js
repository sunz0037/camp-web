export function unwrapData(json) {
  if (json && typeof json === 'object' && 'data' in json && ('code' in json || 'timestamp' in json)) {
    return json.data
  }
  return json
}

export function pageRecords(json) {
  const data = unwrapData(json)
  if (Array.isArray(data)) {
    return { records: data, total: data.length, page: 1, size: data.length }
  }
  if (!data || typeof data !== 'object') {
    return { records: [], total: 0, page: 1, size: 0 }
  }
  const records = data.records || data.list || data.items || data.content || data.rows || []
  const list = Array.isArray(records) ? records : []
  return {
    records: list,
    total: Number(data.total ?? list.length),
    page: Number(data.page ?? 1),
    size: Number(data.pageSize ?? data.size ?? list.length)
  }
}
