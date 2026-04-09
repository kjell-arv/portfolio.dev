const ALLOWED_KEYS = [
  'portfolio-dashboard-content',
  'portfolio-seed-overrides',
  'portfolio-homepage-layout',
  'portfolio-training-hours',
  'portfolio-tech-promo',
  'portfolio-auth-users-v2',
  'portfolio-audit-log',
  'portfolio-user-profiles',
  'portfolio-race-calendar',
  'portfolio-sponsors',
  'portfolio-news-order',
  'portfolio-locale',
]

export function exportSiteBackup() {
  const data = {}
  for (const key of ALLOWED_KEYS) {
    const v = localStorage.getItem(key)
    if (v != null) data[key] = v
  }
  return JSON.stringify(
    {
      format: 'portfolio-site-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2
  )
}

export function importSiteBackup(jsonString) {
  const parsed = JSON.parse(jsonString)
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file.')
  const payload = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed
  if (!payload || typeof payload !== 'object') throw new Error('Invalid backup structure.')
  let count = 0
  for (const key of Object.keys(payload)) {
    if (!ALLOWED_KEYS.includes(key)) continue
    const val = payload[key]
    if (typeof val !== 'string') continue
    localStorage.setItem(key, val)
    count += 1
  }
  window.dispatchEvent(new Event('portfolio-content-updated'))
  window.dispatchEvent(new Event('portfolio-layout-updated'))
  window.dispatchEvent(new Event('portfolio-auth-changed'))
  window.dispatchEvent(new Event('portfolio-audit-changed'))
  window.dispatchEvent(new Event('portfolio-profile-updated'))
  window.dispatchEvent(new Event('portfolio-training-updated'))
  window.dispatchEvent(new Event('portfolio-tech-updated'))
  window.dispatchEvent(new Event('portfolio-races-updated'))
  window.dispatchEvent(new Event('portfolio-sponsors-updated'))
  window.dispatchEvent(new Event('portfolio-news-order-updated'))
  window.dispatchEvent(new Event('portfolio-locale-changed'))
  return count
}
