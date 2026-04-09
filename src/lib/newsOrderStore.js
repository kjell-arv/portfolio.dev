const KEY = 'portfolio-news-order'

/** @returns {{ competitions: string[], stories: string[], updates: string[] }} */
export function getNewsOrder() {
  if (typeof window === 'undefined') {
    return { competitions: [], stories: [], updates: [] }
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { competitions: [], stories: [], updates: [] }
    const parsed = JSON.parse(raw)
    return {
      competitions: Array.isArray(parsed.competitions) ? parsed.competitions : [],
      stories: Array.isArray(parsed.stories) ? parsed.stories : [],
      updates: Array.isArray(parsed.updates) ? parsed.updates : [],
    }
  } catch {
    return { competitions: [], stories: [], updates: [] }
  }
}

export function saveNewsOrder(section, orderedIds) {
  if (typeof window === 'undefined') return
  const cur = getNewsOrder()
  const next = { ...cur, [section]: orderedIds }
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('portfolio-news-order-updated'))
}

export function applyOrderToList(list, section) {
  const order = getNewsOrder()[section]
  if (!order?.length) return list
  const index = new Map(order.map((id, i) => [id, i]))
  return [...list].sort((a, b) => {
    const ia = index.has(a.id) ? index.get(a.id) : 99999
    const ib = index.has(b.id) ? index.get(b.id) : 99999
    if (ia !== ib) return ia - ib
    return 0
  })
}
