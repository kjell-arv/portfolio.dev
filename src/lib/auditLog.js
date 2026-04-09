const AUDIT_KEY = 'portfolio-audit-log'
const MAX_ENTRIES = 500

function readEntries() {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(AUDIT_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getAuditEntries() {
  return readEntries()
}

export function appendAuditEntry(action, detail = {}, actor = 'system') {
  if (typeof window === 'undefined') return
  const next = [
    {
      t: Date.now(),
      action,
      actor,
      ...detail,
    },
    ...readEntries(),
  ].slice(0, MAX_ENTRIES)
  localStorage.setItem(AUDIT_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('portfolio-audit-changed'))
}
