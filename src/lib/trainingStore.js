const KEY = 'portfolio-training-hours'

/** Default demo curve — replace via Dashboard. */
export const DEFAULT_TRAINING_POINTS = [
  { label: 'Jul', hours: 16 },
  { label: 'Aug', hours: 19 },
  { label: 'Sep', hours: 21 },
  { label: 'Oct', hours: 20 },
  { label: 'Nov', hours: 18 },
  { label: 'Dec', hours: 15 },
  { label: 'Jan', hours: 22 },
  { label: 'Feb', hours: 21 },
  { label: 'Mar', hours: 24 },
  { label: 'Apr', hours: 23 },
]

function sanitizePoints(raw) {
  if (!Array.isArray(raw)) return [...DEFAULT_TRAINING_POINTS]
  const next = raw
    .filter((p) => p && typeof p === 'object')
    .map((p) => ({
      label: String(p.label || '').slice(0, 24) || '—',
      hours: Math.max(0, Math.min(80, Number(p.hours) || 0)),
    }))
    .filter((p) => p.label)
  return next.length >= 2 ? next : [...DEFAULT_TRAINING_POINTS]
}

export function getTrainingPoints() {
  if (typeof window === 'undefined') return [...DEFAULT_TRAINING_POINTS]
  const raw = localStorage.getItem(KEY)
  if (!raw) return [...DEFAULT_TRAINING_POINTS]
  try {
    const parsed = JSON.parse(raw)
    return sanitizePoints(parsed.points ?? parsed)
  } catch {
    return [...DEFAULT_TRAINING_POINTS]
  }
}

export function saveTrainingPoints(points) {
  if (typeof window === 'undefined') return
  const next = sanitizePoints(points)
  localStorage.setItem(KEY, JSON.stringify({ points: next, updatedAt: new Date().toISOString() }))
  window.dispatchEvent(new Event('portfolio-training-updated'))
}
