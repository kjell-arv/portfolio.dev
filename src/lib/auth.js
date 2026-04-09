import { appendAuditEntry } from './auditLog'

const USERS_KEY = 'portfolio-auth-users-v2'
const SESSION_USER_KEY = 'portfolio-auth-session-user-v2'

export const PERMISSIONS = {
  EDIT_NEWS: 'editNews',
  PUBLISH: 'publish',
  REARRANGE_SITE: 'rearrangeSite',
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(text) {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return bytesToHex(new Uint8Array(buf))
}

export function needsPasswordSetup() {
  if (typeof window === 'undefined') return false
  return getUsers().length === 0
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!getSessionUsername()
}

function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

function getUsers() {
  if (typeof window === 'undefined') return []
  migrateLegacyOwnerIfNeeded()
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getSessionUsername() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SESSION_USER_KEY)
}

function sanitizeUser(user) {
  if (!user) return null
  return {
    username: user.username,
    role: user.role,
    permissions: { ...user.permissions },
    createdAt: user.createdAt,
  }
}

function buildPasswordRecord(password) {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
  return sha256Hex(`${salt}:${password}`).then((hash) => ({ salt, hash }))
}

function migrateLegacyOwnerIfNeeded() {
  // Intentionally disabled: auth keys were versioned to reset all old passwords.
  // Legacy keys are ignored so setup starts fresh.
  return
}

function triggerAuthChanged() {
  window.dispatchEvent(new Event('portfolio-auth-changed'))
}

export function getCurrentUser() {
  const sessionUsername = getSessionUsername()
  if (!sessionUsername) return null
  const user = getUsers().find((u) => u.username === sessionUsername)
  return sanitizeUser(user)
}

export function hasPermission(permissionKey) {
  const user = getCurrentUser()
  if (!user) return false
  if (user.role === 'owner') return true
  return !!user.permissions?.[permissionKey]
}

export async function setupOwner(username, password, confirmPassword) {
  if (typeof window === 'undefined') return { ok: false, error: 'Unavailable' }
  const normalized = normalizeUsername(username)
  if (!normalized) {
    return { ok: false, error: 'Username is required.' }
  }
  if (password.length < 8) {
    return { ok: false, error: 'Use at least 8 characters.' }
  }
  if (password !== confirmPassword) {
    return { ok: false, error: 'Passwords do not match.' }
  }
  if (getUsers().length > 0) {
    return { ok: false, error: 'An owner account is already set. Use login.' }
  }

  const record = await buildPasswordRecord(password)
  const owner = {
    username: normalized,
    role: 'owner',
    permissions: {
      [PERMISSIONS.EDIT_NEWS]: true,
      [PERMISSIONS.PUBLISH]: true,
      [PERMISSIONS.REARRANGE_SITE]: true,
    },
    ...record,
    createdAt: new Date().toISOString(),
  }
  saveUsers([owner])
  localStorage.setItem(SESSION_USER_KEY, normalized)
  appendAuditEntry('setup.owner', { username: normalized }, normalized)
  triggerAuthChanged()
  return { ok: true }
}

export async function login(username, password) {
  if (typeof window === 'undefined') return false
  const normalized = normalizeUsername(username)
  const user = getUsers().find((u) => u.username === normalized)
  if (!user?.salt || !user?.hash) return false

  const actual = await sha256Hex(`${user.salt}:${password}`)
  const ok = actual === user.hash
  if (ok) {
    localStorage.setItem(SESSION_USER_KEY, normalized)
    triggerAuthChanged()
  }
  return ok
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
  if (typeof window === 'undefined') return { ok: false, error: 'Unavailable' }
  if (newPassword.length < 8) {
    return { ok: false, error: 'Use at least 8 characters for the new password.' }
  }
  if (newPassword !== confirmNewPassword) {
    return { ok: false, error: 'New passwords do not match.' }
  }
  const currentUsername = getSessionUsername()
  if (!currentUsername) {
    return { ok: false, error: 'You are not signed in.' }
  }
  const users = getUsers()
  const index = users.findIndex((u) => u.username === currentUsername)
  if (index === -1) return { ok: false, error: 'User not found.' }
  const actual = await sha256Hex(`${users[index].salt}:${currentPassword}`)
  if (actual !== users[index].hash) {
    return { ok: false, error: 'Current password is wrong.' }
  }

  const record = await buildPasswordRecord(newPassword)
  const next = [...users]
  next[index] = { ...next[index], ...record }
  saveUsers(next)
  appendAuditEntry('auth.password_change', {}, currentUsername)
  triggerAuthChanged()
  return { ok: true }
}

export function logout() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_USER_KEY)
  triggerAuthChanged()
}

export function listUsers() {
  return getUsers().map(sanitizeUser)
}

export async function createUser(username, password, permissions) {
  const actor = getCurrentUser()
  if (!actor || actor.role !== 'owner') {
    return { ok: false, error: 'Only owner can create users.' }
  }
  const normalized = normalizeUsername(username)
  if (!normalized) return { ok: false, error: 'Username is required.' }
  if (password.length < 8) return { ok: false, error: 'Use at least 8 characters.' }
  const users = getUsers()
  if (users.some((u) => u.username === normalized)) {
    return { ok: false, error: 'Username already exists.' }
  }
  const record = await buildPasswordRecord(password)
  const next = [
    ...users,
    {
      username: normalized,
      role: 'editor',
      permissions: {
        [PERMISSIONS.EDIT_NEWS]: !!permissions?.[PERMISSIONS.EDIT_NEWS],
        [PERMISSIONS.PUBLISH]: !!permissions?.[PERMISSIONS.PUBLISH],
        [PERMISSIONS.REARRANGE_SITE]: !!permissions?.[PERMISSIONS.REARRANGE_SITE],
      },
      ...record,
      createdAt: new Date().toISOString(),
    },
  ]
  saveUsers(next)
  appendAuditEntry('user.create', { target: normalized }, actor.username)
  triggerAuthChanged()
  return { ok: true }
}

export async function signUp(username, password, confirmPassword) {
  if (typeof window === 'undefined') return { ok: false, error: 'Unavailable' }
  const normalized = normalizeUsername(username)
  if (!normalized) return { ok: false, error: 'Username is required.' }
  if (password.length < 8) return { ok: false, error: 'Use at least 8 characters.' }
  if (password !== confirmPassword) return { ok: false, error: 'Passwords do not match.' }
  const users = getUsers()
  if (users.length === 0) return { ok: false, error: 'Owner must complete setup first.' }
  if (users.some((u) => u.username === normalized)) {
    return { ok: false, error: 'Username already exists.' }
  }
  const record = await buildPasswordRecord(password)
  const next = [
    ...users,
    {
      username: normalized,
      role: 'editor',
      permissions: {
        [PERMISSIONS.EDIT_NEWS]: true,
        [PERMISSIONS.PUBLISH]: false,
        [PERMISSIONS.REARRANGE_SITE]: false,
      },
      ...record,
      createdAt: new Date().toISOString(),
    },
  ]
  saveUsers(next)
  appendAuditEntry('auth.signup', { username: normalized }, normalized)
  triggerAuthChanged()
  return { ok: true }
}

export function updateUserPermissions(username, permissions) {
  const actor = getCurrentUser()
  if (!actor || actor.role !== 'owner') {
    return { ok: false, error: 'Only owner can change permissions.' }
  }
  const normalized = normalizeUsername(username)
  const users = getUsers()
  const index = users.findIndex((u) => u.username === normalized)
  if (index === -1) return { ok: false, error: 'User not found.' }
  if (users[index].role === 'owner') return { ok: false, error: 'Owner permissions cannot be changed.' }
  const next = [...users]
  next[index] = {
    ...next[index],
    permissions: {
      [PERMISSIONS.EDIT_NEWS]: !!permissions?.[PERMISSIONS.EDIT_NEWS],
      [PERMISSIONS.PUBLISH]: !!permissions?.[PERMISSIONS.PUBLISH],
      [PERMISSIONS.REARRANGE_SITE]: !!permissions?.[PERMISSIONS.REARRANGE_SITE],
    },
  }
  saveUsers(next)
  appendAuditEntry('user.permissions', { target: normalized, permissions: next[index].permissions }, actor.username)
  triggerAuthChanged()
  return { ok: true }
}

export function deleteUser(username) {
  const actor = getCurrentUser()
  if (!actor || actor.role !== 'owner') {
    return { ok: false, error: 'Only owner can delete users.' }
  }
  const normalized = normalizeUsername(username)
  if (actor.username === normalized) {
    return { ok: false, error: 'You cannot delete your own account.' }
  }
  const user = getUsers().find((u) => u.username === normalized)
  if (!user) return { ok: false, error: 'User not found.' }
  if (user.role === 'owner') return { ok: false, error: 'Owner account cannot be deleted.' }
  const next = getUsers().filter((u) => u.username !== normalized)
  saveUsers(next)
  appendAuditEntry('user.delete', { target: normalized }, actor.username)
  triggerAuthChanged()
  return { ok: true }
}

export async function adminResetUserPassword(username, newPassword, confirmPassword) {
  if (typeof window === 'undefined') return { ok: false, error: 'Unavailable' }
  const actor = getCurrentUser()
  if (!actor || actor.role !== 'owner') {
    return { ok: false, error: 'Only owner can reset passwords.' }
  }
  if (newPassword.length < 8) {
    return { ok: false, error: 'Use at least 8 characters.' }
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'Passwords do not match.' }
  }
  const normalized = normalizeUsername(username)
  const users = getUsers()
  const index = users.findIndex((u) => u.username === normalized)
  if (index === -1) return { ok: false, error: 'User not found.' }
  if (users[index].role === 'owner') {
    return { ok: false, error: 'Owner must use “Change password” in the dashboard.' }
  }
  const record = await buildPasswordRecord(newPassword)
  const next = [...users]
  next[index] = { ...next[index], ...record }
  saveUsers(next)
  appendAuditEntry('user.password_reset', { target: normalized }, actor.username)
  triggerAuthChanged()
  return { ok: true }
}
