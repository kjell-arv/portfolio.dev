const STORAGE_KEY = 'portfolio-locale'

export const SUPPORTED_LOCALES = ['en', 'de']

export function getStoredLocale() {
  if (typeof window === 'undefined') return 'en'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'de') return v
  } catch {
    /* ignore */
  }
  return 'en'
}

export function saveLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  try {
    localStorage.setItem(STORAGE_KEY, locale)
    window.dispatchEvent(new Event('portfolio-locale-changed'))
  } catch {
    /* ignore */
  }
}
