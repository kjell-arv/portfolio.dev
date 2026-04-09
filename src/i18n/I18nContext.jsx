import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getStoredLocale, saveLocale } from './localeStore.js'
import { translations } from './translations.js'

const I18nContext = createContext(null)

function getByPath(obj, path) {
  if (!path || !obj) return undefined
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getStoredLocale)

  useEffect(() => {
    const sync = () => setLocaleState(getStoredLocale())
    window.addEventListener('portfolio-locale-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('portfolio-locale-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'de' ? 'de' : 'en'
  }, [locale])

  const setLocale = useCallback((next) => {
    saveLocale(next)
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (path) => {
      const bundle = translations[locale] || translations.en
      const v = getByPath(bundle, path)
      if (v !== undefined && v !== null) return v
      const fallback = getByPath(translations.en, path)
      return fallback !== undefined && fallback !== null ? fallback : path
    },
    [locale]
  )

  const achievements = useMemo(() => {
    const bundle = translations[locale] || translations.en
    return bundle.achievements
  }, [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t, achievements }),
    [locale, setLocale, t, achievements]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}
