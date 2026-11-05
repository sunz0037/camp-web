/** 首期分页：page 从 1，同时带 pageSize 与 size，兼容两套参数名。 */
export function listQuery(page, pageSize, extra = {}) {
  const params = { page, pageSize, size: pageSize }
  Object.entries(extra).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params[key] = value
  })
  return params
}
