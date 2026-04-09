/** Canonical site URL for RSS, OG tags, and JSON-LD (set in `.env` for production). */
export const siteUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || 'https://kjell-arved-brandt.de'

export const siteName = 'Kjell Arved Brandt'
export const siteTagline = 'Junior triathlete · Berlin'

/** Optional OG image path (under public/). */
export const defaultOgImage = '/vite.svg'
