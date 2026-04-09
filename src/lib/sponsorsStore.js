import { sponsors as staticSponsors } from '../data/sponsors.js'
import { normalizeLogoUrl } from './sponsorLogo.js'

const KEY = 'portfolio-sponsors'

/** Max stored size for an uploaded logo (data URL), ~2.3 MB JSON-safe. */
const MAX_LOGO_DATA_URL_LEN = 2_400_000

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** @param {string} u */
function normalizeUrl(u) {
  const s = String(u || '').trim()
  if (!s) return ''
  if (/^mailto:/i.test(s)) return s
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('/')) return s
  return `https://${s}`
}

/**
 * @param {unknown} raw
 * @returns {{ id: string, name: string, url: string, logo: string, logoDataUrl: string, description: string } | null}
 */
function sanitizeOne(raw) {
  if (!raw || typeof raw !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (raw)
  const name = String(o.name ?? '').trim().slice(0, 160)
  const urlRaw = String(o.url ?? '').trim()
  if (!name || !urlRaw) return null
  const url = normalizeUrl(urlRaw)
  if (!url) return null
  const logoRaw = o.logo != null ? String(o.logo).trim() : ''
  const logo = logoRaw ? normalizeLogoUrl(logoRaw).slice(0, 2048) : ''
  let logoDataUrl = ''
  if (o.logoDataUrl != null && typeof o.logoDataUrl === 'string') {
    const d = o.logoDataUrl.trim()
    if (d.startsWith('data:image/') && d.length <= MAX_LOGO_DATA_URL_LEN) logoDataUrl = d
  }
  const description = o.description != null ? String(o.description).trim().slice(0, 400) : ''
  const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim().slice(0, 80) : newId()
  return { id, name, url, logo, logoDataUrl, description }
}

function sanitizeList(list) {
  if (!Array.isArray(list)) return []
  const out = []
  for (const raw of list) {
    const s = sanitizeOne(raw)
    if (s) out.push(s)
  }
  return out
}

/** Defaults from `src/data/sponsors.js` until the dashboard saves custom data. */
export function getSponsors() {
  if (typeof window === 'undefined') return sanitizeList(staticSponsors)
  const raw = localStorage.getItem(KEY)
  if (raw === null) return sanitizeList(staticSponsors)
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? sanitizeList(parsed) : []
  } catch {
    return []
  }
}

export function saveSponsors(list) {
  if (typeof window === 'undefined') return
  const next = sanitizeList(list)
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('portfolio-sponsors-updated'))
}

export function resetSponsorsToDefault() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('portfolio-sponsors-updated'))
}

export function createEmptySponsor() {
  return {
    id: newId(),
    name: '',
    url: '',
    logo: '',
    logoDataUrl: '',
    description: '',
  }
}
