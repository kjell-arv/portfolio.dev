/**
 * Resolve long-form body for current UI language. Falls back to `body`, then `excerpt`.
 * @param {object} entry
 * @param {'en' | 'de'} locale
 */
export function getResolvedBody(entry, locale) {
  if (!entry) return ''
  if (locale === 'de') {
    return (entry.bodyDe && String(entry.bodyDe).trim()) || entry.body || entry.excerpt || ''
  }
  return (entry.bodyEn && String(entry.bodyEn).trim()) || entry.body || entry.excerpt || ''
}

/** @returns {string[]} */
export function parseGallery(entry) {
  if (!entry?.gallery) return []
  if (Array.isArray(entry.gallery)) return entry.gallery.filter(Boolean)
  if (typeof entry.gallery === 'string') {
    try {
      const p = JSON.parse(entry.gallery)
      return Array.isArray(p) ? p.filter(Boolean) : []
    } catch {
      return entry.gallery
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }
  return []
}
