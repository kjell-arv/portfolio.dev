const KEY = 'portfolio-tech-promo'

const DEFAULT_CONFIG = {
  enabled: false,
  url: '',
  title: 'Tech portfolio',
  blurb: 'Projects, stack & experiments — built alongside training.',
  openInNewTab: true,
}

function sanitize(cfg) {
  if (!cfg || typeof cfg !== 'object') return { ...DEFAULT_CONFIG }
  return {
    enabled: !!cfg.enabled,
    url: typeof cfg.url === 'string' ? cfg.url.trim() : '',
    title: typeof cfg.title === 'string' && cfg.title.trim() ? cfg.title.trim().slice(0, 80) : DEFAULT_CONFIG.title,
    blurb: typeof cfg.blurb === 'string' ? cfg.blurb.trim().slice(0, 200) : DEFAULT_CONFIG.blurb,
    openInNewTab: cfg.openInNewTab !== false,
  }
}

export function getTechPortfolioConfig() {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIG }
  const raw = localStorage.getItem(KEY)
  if (!raw) return { ...DEFAULT_CONFIG }
  try {
    return sanitize(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveTechPortfolioConfig(updates) {
  if (typeof window === 'undefined') return
  const next = sanitize({ ...getTechPortfolioConfig(), ...updates })
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('portfolio-tech-updated'))
}
