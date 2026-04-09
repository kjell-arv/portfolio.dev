const PROFILES_KEY = 'portfolio-user-profiles'

function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

function readMap() {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(PROFILES_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getProfile(username) {
  const key = normalizeUsername(username)
  const map = readMap()
  return map[key] || { displayName: '', bio: '' }
}

export function saveProfile(username, { displayName, bio }) {
  if (typeof window === 'undefined') return
  const key = normalizeUsername(username)
  const map = readMap()
  map[key] = {
    displayName: (displayName || '').trim(),
    bio: (bio || '').trim(),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map))
  window.dispatchEvent(new Event('portfolio-profile-updated'))
}
