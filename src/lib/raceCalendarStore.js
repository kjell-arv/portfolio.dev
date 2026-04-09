const KEY = 'portfolio-race-calendar'

const DEFAULT_EVENTS = [
  {
    id: 'race-d1',
    title: 'Junior European Cup',
    date: '2026-06-14',
    location: 'Holten, NL',
    kind: 'upcoming',
    note: 'Sprint distance',
  },
  {
    id: 'race-d2',
    title: 'National Championships',
    date: '2026-07-18',
    location: 'Germany',
    kind: 'upcoming',
    note: 'Olympic distance',
  },
  {
    id: 'race-p1',
    title: 'Junior European Championships',
    date: '2025-09-12',
    location: 'Melilla, ES',
    kind: 'past',
    note: 'Mixed relay & individual',
  },
]

function sanitize(list) {
  if (!Array.isArray(list)) return DEFAULT_EVENTS
  return list.filter((x) => x && x.id && x.title)
}

export function getRaceEvents() {
  if (typeof window === 'undefined') return DEFAULT_EVENTS
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_EVENTS
    const parsed = JSON.parse(raw)
    const s = sanitize(parsed)
    return s.length ? s : DEFAULT_EVENTS
  } catch {
    return DEFAULT_EVENTS
  }
}

export function saveRaceEvents(events) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(sanitize(events)))
  window.dispatchEvent(new Event('portfolio-races-updated'))
}

export function resetRaceEventsToDefault() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('portfolio-races-updated'))
}
