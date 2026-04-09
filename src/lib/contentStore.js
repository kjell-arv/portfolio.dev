const CONTENT_KEY = 'portfolio-dashboard-content'
const SEED_OVERRIDES_KEY = 'portfolio-seed-overrides'

export function getDashboardContent() {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(CONTENT_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDashboardContent(items) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONTENT_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('portfolio-content-updated'))
}

export function addDashboardContent(item) {
  const current = getDashboardContent()
  const next = [{ ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]
  saveDashboardContent(next)
  return next
}

export function updateDashboardContent(id, updates) {
  const next = getDashboardContent().map((item) => {
    if (item.id !== id) return item
    return { ...item, ...updates, updatedAt: new Date().toISOString() }
  })
  saveDashboardContent(next)
  return next
}

export function removeDashboardContent(id) {
  const next = getDashboardContent().filter((item) => item.id !== id)
  saveDashboardContent(next)
  return next
}

export function duplicateDashboardContent(id) {
  const items = getDashboardContent()
  const item = items.find((i) => i.id === id)
  if (!item) return items
  const copy = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    title: `${item.title} (copy)`,
    publishStatus: 'draft',
    scheduleAt: null,
    published: false,
  }
  delete copy.updatedAt
  const next = [copy, ...items]
  saveDashboardContent(next)
  return next
}

export function clearAllSeedOverrides() {
  saveSeedOverrides({})
  return {}
}

export function getSeedOverrides() {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(SEED_OVERRIDES_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveSeedOverrides(overrides) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SEED_OVERRIDES_KEY, JSON.stringify(overrides))
  window.dispatchEvent(new Event('portfolio-content-updated'))
}

export function upsertSeedOverride(id, updates) {
  const current = getSeedOverrides()
  const next = {
    ...current,
    [id]: {
      ...(current[id] || {}),
      ...updates,
    },
  }
  saveSeedOverrides(next)
  return next
}

export function applySeedOverrides(items, overrides = getSeedOverrides()) {
  return items.map((item) => ({
    ...item,
    ...(overrides[item.id] || {}),
  }))
}
