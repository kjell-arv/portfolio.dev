const LAYOUT_KEY = 'portfolio-homepage-layout'

const DEFAULT_LAYOUT = {
  order: ['hero', 'about', 'sponsors', 'training', 'calendar', 'news'],
  hidden: {
    hero: false,
    about: false,
    sponsors: false,
    training: false,
    calendar: false,
    news: false,
  },
}

function sanitizeLayout(raw) {
  if (!raw || typeof raw !== 'object') return DEFAULT_LAYOUT
  const validIds = new Set(DEFAULT_LAYOUT.order)
  const rawOrder = Array.isArray(raw.order) ? raw.order : []
  const rawHadSponsors = rawOrder.includes('sponsors')
  const deduped = []
  for (const id of rawOrder) {
    if (validIds.has(id) && !deduped.includes(id)) deduped.push(id)
  }
  for (const id of DEFAULT_LAYOUT.order) {
    if (!deduped.includes(id)) deduped.push(id)
  }
  // Legacy layouts without `sponsors` append it at the end; place it above training once.
  if (!rawHadSponsors && deduped.includes('sponsors') && deduped.includes('training')) {
    const si = deduped.indexOf('sponsors')
    const ti = deduped.indexOf('training')
    if (si > ti) {
      deduped.splice(si, 1)
      deduped.splice(ti, 0, 'sponsors')
    }
  }

  const hidden = {
    hero: !!raw.hidden?.hero,
    about: !!raw.hidden?.about,
    sponsors: !!raw.hidden?.sponsors,
    training: !!raw.hidden?.training,
    calendar: !!raw.hidden?.calendar,
    news: !!raw.hidden?.news,
  }

  return { order: deduped, hidden }
}

export function getHomepageLayout() {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT
  const raw = localStorage.getItem(LAYOUT_KEY)
  if (!raw) return DEFAULT_LAYOUT
  try {
    return sanitizeLayout(JSON.parse(raw))
  } catch {
    return DEFAULT_LAYOUT
  }
}

export function saveHomepageLayout(layout) {
  if (typeof window === 'undefined') return
  const next = sanitizeLayout(layout)
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('portfolio-layout-updated'))
}

export function resetHomepageLayoutToDefault() {
  localStorage.removeItem(LAYOUT_KEY)
  window.dispatchEvent(new Event('portfolio-layout-updated'))
  return DEFAULT_LAYOUT
}
