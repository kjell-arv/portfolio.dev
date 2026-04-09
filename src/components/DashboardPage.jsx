import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import ScrollReveal from './ScrollReveal.jsx'
import {
  addDashboardContent,
  applySeedOverrides,
  clearAllSeedOverrides,
  duplicateDashboardContent,
  getDashboardContent,
  getSeedOverrides,
  removeDashboardContent,
  updateDashboardContent,
  upsertSeedOverride,
} from '../lib/contentStore'
import {
  adminResetUserPassword,
  changePassword,
  createUser,
  deleteUser,
  getCurrentUser,
  hasPermission,
  listUsers,
  logout,
  PERMISSIONS,
  updateUserPermissions,
} from '../lib/auth'
import { appendAuditEntry, getAuditEntries } from '../lib/auditLog'
import { exportSiteBackup, importSiteBackup } from '../lib/backup'
import ImageCropModal from './ImageCropModal.jsx'
import { seedCompetitions, seedStories } from '../lib/seedContent'
import { getHomepageLayout, resetHomepageLayoutToDefault, saveHomepageLayout } from '../lib/layoutStore'
import { getMergedNewsLists } from '../lib/newsEntries'
import { applyOrderToList, saveNewsOrder } from '../lib/newsOrderStore'
import { getRaceEvents, saveRaceEvents, resetRaceEventsToDefault } from '../lib/raceCalendarStore'
import { createEmptySponsor, getSponsors, resetSponsorsToDefault, saveSponsors } from '../lib/sponsorsStore'
import {
  annotateCalendarRelevance,
  filterCalendarRelevantEvents,
  shouldIncludeInCalendar,
} from '../lib/calendarRelevance'
import { mergeParsedRacesIntoExisting, parseRacesFromText } from '../lib/parseRacesFromText'
import { getTrainingPoints, saveTrainingPoints } from '../lib/trainingStore'
import { getTechPortfolioConfig, saveTechPortfolioConfig } from '../lib/techPortfolioStore'
import { publishStatusLabel } from '../lib/publish'
import { useSaveStatus } from './SaveStatusProvider.jsx'

const sections = [
  { key: 'competitions', label: 'Competitions' },
  { key: 'stories', label: 'Stories' },
  { key: 'updates', label: 'Updates' },
]

const emptyForm = {
  section: 'competitions',
  title: '',
  location: '',
  excerpt: '',
  body: '',
  bodyEn: '',
  bodyDe: '',
  href: '',
  badge: '',
  imageData: null,
  placement: '',
  raceTime: '',
  discipline: '',
  resultUrl: '',
  galleryJson: '',
  publishStatus: 'published',
  scheduleAt: '',
}

function stableSerialize(value) {
  return JSON.stringify(value)
}

function DashboardStatusPill({ variant, children }) {
  const cls =
    variant === 'draft'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : variant === 'instant'
        ? 'border-sky-200 bg-sky-50 text-sky-900'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {children}
    </span>
  )
}

function parseGalleryFromForm(s) {
  if (!s || !String(s).trim()) return undefined
  try {
    const j = JSON.parse(s)
    if (Array.isArray(j)) return j.filter(Boolean)
  } catch {
    /* fall through */
  }
  const lines = String(s)
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
  return lines.length ? lines : undefined
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const showSaveStatus = useSaveStatus()
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [managedUsers, setManagedUsers] = useState(listUsers())
  const [items, setItems] = useState(getDashboardContent())
  const [seedOverrides, setSeedOverrides] = useState(getSeedOverrides())
  const [form, setForm] = useState(emptyForm)
  const [editingItem, setEditingItem] = useState(null)
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [userUsername, setUserUsername] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userError, setUserError] = useState('')
  const [userBusy, setUserBusy] = useState(false)
  const [layout, setLayout] = useState(getHomepageLayout())
  const [imageError, setImageError] = useState('')
  const [cropOpen, setCropOpen] = useState(false)
  const [entrySearch, setEntrySearch] = useState('')
  const [entrySectionFilter, setEntrySectionFilter] = useState('all')
  const [entrySort, setEntrySort] = useState('date_desc')
  const [auditEntries, setAuditEntries] = useState(getAuditEntries())
  const [backupMessage, setBackupMessage] = useState('')
  const [pwResetUser, setPwResetUser] = useState(null)
  const [pwResetNew, setPwResetNew] = useState('')
  const [pwResetConfirm, setPwResetConfirm] = useState('')
  const [pwResetBusy, setPwResetBusy] = useState(false)
  const [trainingPoints, setTrainingPoints] = useState(() => getTrainingPoints())
  const [techPromo, setTechPromo] = useState(() => getTechPortfolioConfig())
  const [raceEvents, setRaceEvents] = useState(() => getRaceEvents())
  const [sponsorRows, setSponsorRows] = useState(() => getSponsors())
  const [racePasteText, setRacePasteText] = useState('')
  const [raceImportMessage, setRaceImportMessage] = useState('')
  const [raceDetectPreview, setRaceDetectPreview] = useState([])
  const [autoAddOnPaste, setAutoAddOnPaste] = useState(false)
  const [strictCalendarFilter, setStrictCalendarFilter] = useState(false)
  const racePasteDebounceRef = useRef(null)
  const formRef = useRef(emptyForm)
  const [newsOrderTick, setNewsOrderTick] = useState(0)
  const [persistedRacesJson, setPersistedRacesJson] = useState(() => stableSerialize(getRaceEvents()))
  const [persistedSponsorsJson, setPersistedSponsorsJson] = useState(() => stableSerialize(getSponsors()))
  const [persistedTrainingJson, setPersistedTrainingJson] = useState(() => stableSerialize(getTrainingPoints()))
  const [persistedTechJson, setPersistedTechJson] = useState(() => stableSerialize(getTechPortfolioConfig()))
  const [newsFormBaselineJson, setNewsFormBaselineJson] = useState(() => stableSerialize(emptyForm))
  const canEditNews = hasPermission(PERMISSIONS.EDIT_NEWS)
  const canPublish = hasPermission(PERMISSIONS.PUBLISH)
  const canRearrangeSite = hasPermission(PERMISSIONS.REARRANGE_SITE)
  const isOwner = currentUser?.role === 'owner'

  const previewForCalendar = useMemo(
    () =>
      raceDetectPreview.filter((ev) => shouldIncludeInCalendar(ev, { strict: strictCalendarFilter })),
    [raceDetectPreview, strictCalendarFilter]
  )
  const previewOtherCount = raceDetectPreview.length - previewForCalendar.length

  const racesDirty = useMemo(
    () => stableSerialize(raceEvents) !== persistedRacesJson,
    [raceEvents, persistedRacesJson]
  )
  const sponsorsDirty = useMemo(
    () => stableSerialize(sponsorRows) !== persistedSponsorsJson,
    [sponsorRows, persistedSponsorsJson]
  )
  const trainingDirty = useMemo(
    () => stableSerialize(trainingPoints) !== persistedTrainingJson,
    [trainingPoints, persistedTrainingJson]
  )
  const techDirty = useMemo(
    () => stableSerialize(techPromo) !== persistedTechJson,
    [techPromo, persistedTechJson]
  )
  const newsFormDirty = useMemo(
    () => stableSerialize(form) !== newsFormBaselineJson,
    [form, newsFormBaselineJson]
  )

  formRef.current = form

  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(getCurrentUser())
      setManagedUsers(listUsers())
    }
    window.addEventListener('portfolio-auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('portfolio-auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  useEffect(() => {
    const syncLayout = () => setLayout(getHomepageLayout())
    window.addEventListener('portfolio-layout-updated', syncLayout)
    window.addEventListener('storage', syncLayout)
    return () => {
      window.removeEventListener('portfolio-layout-updated', syncLayout)
      window.removeEventListener('storage', syncLayout)
    }
  }, [])

  useEffect(() => {
    const syncAudit = () => setAuditEntries(getAuditEntries())
    window.addEventListener('portfolio-audit-changed', syncAudit)
    return () => window.removeEventListener('portfolio-audit-changed', syncAudit)
  }, [])

  useEffect(() => {
    const syncTraining = () => {
      const next = getTrainingPoints()
      setTrainingPoints(next)
      setPersistedTrainingJson(stableSerialize(next))
    }
    window.addEventListener('portfolio-training-updated', syncTraining)
    window.addEventListener('storage', syncTraining)
    return () => {
      window.removeEventListener('portfolio-training-updated', syncTraining)
      window.removeEventListener('storage', syncTraining)
    }
  }, [])

  useEffect(() => {
    const syncTech = () => {
      const next = getTechPortfolioConfig()
      setTechPromo(next)
      setPersistedTechJson(stableSerialize(next))
    }
    window.addEventListener('portfolio-tech-updated', syncTech)
    window.addEventListener('storage', syncTech)
    return () => {
      window.removeEventListener('portfolio-tech-updated', syncTech)
      window.removeEventListener('storage', syncTech)
    }
  }, [])

  useEffect(() => {
    const syncRaces = () => {
      const next = getRaceEvents()
      setRaceEvents(next)
      setPersistedRacesJson(stableSerialize(next))
    }
    window.addEventListener('portfolio-races-updated', syncRaces)
    window.addEventListener('storage', syncRaces)
    return () => {
      window.removeEventListener('portfolio-races-updated', syncRaces)
      window.removeEventListener('storage', syncRaces)
    }
  }, [])

  useEffect(() => {
    const syncSponsors = () => {
      const next = getSponsors()
      setSponsorRows(next)
      setPersistedSponsorsJson(stableSerialize(next))
    }
    window.addEventListener('portfolio-sponsors-updated', syncSponsors)
    window.addEventListener('storage', syncSponsors)
    return () => {
      window.removeEventListener('portfolio-sponsors-updated', syncSponsors)
      window.removeEventListener('storage', syncSponsors)
    }
  }, [])

  useEffect(() => {
    const onOrder = () => setNewsOrderTick((t) => t + 1)
    window.addEventListener('portfolio-news-order-updated', onOrder)
    return () => window.removeEventListener('portfolio-news-order-updated', onOrder)
  }, [])

  const actorName = () => getCurrentUser()?.username ?? 'system'

  const grouped = useMemo(() => {
    const seedItems = applySeedOverrides([...seedCompetitions, ...seedStories], seedOverrides)
    return sections.map((s) => ({
      ...s,
      items: [
        ...items.filter((item) => item.section === s.key).map((item) => ({ ...item, isSeed: false })),
        ...seedItems.filter((item) => item.section === s.key).map((item) => ({ ...item, isSeed: true })),
      ],
    }))
  }, [items, seedOverrides])

  const filteredGrouped = useMemo(() => {
    const sortItems = (list, sectionKey) => {
      const filtered = list.filter((item) => {
        if (entrySectionFilter !== 'all' && item.section !== entrySectionFilter) return false
        const q = entrySearch.trim().toLowerCase()
        if (!q) return true
        return (
          (item.title || '').toLowerCase().includes(q) ||
          (item.excerpt || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q)
        )
      })
      const next = [...filtered]
      if (entrySort === 'manual') return applyOrderToList(next, sectionKey)
      next.sort((a, b) => {
        if (entrySort === 'title_asc') return (a.title || '').localeCompare(b.title || '')
        if (entrySort === 'section_asc') return (a.section || '').localeCompare(b.section || '')
        const da = new Date(a.createdAt || a.updatedAt || 0).getTime()
        const db = new Date(b.createdAt || b.updatedAt || 0).getTime()
        return entrySort === 'date_asc' ? da - db : db - da
      })
      return next
    }
    return grouped.map((g) => ({
      ...g,
      items: sortItems(g.items, g.key),
    }))
  }, [grouped, entrySearch, entrySectionFilter, entrySort, newsOrderTick])

  const publishStatusFromItem = (item) => {
    if (item.publishStatus === 'draft' || item.publishStatus === 'scheduled' || item.publishStatus === 'published') {
      return item.publishStatus
    }
    if (item.published === false) return 'draft'
    return 'published'
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!canEditNews) return
    if (!form.title.trim() || !form.excerpt.trim()) return

    let publishStatus = canPublish ? form.publishStatus : 'published'
    if (!canPublish) publishStatus = 'published'

    if (canPublish && publishStatus === 'scheduled' && !form.scheduleAt?.trim()) {
      showSaveStatus('Choose a date and time for scheduled posts.', 'error')
      return
    }

    let scheduleAt = null
    if (publishStatus === 'scheduled' && form.scheduleAt) {
      scheduleAt = new Date(form.scheduleAt).toISOString()
    }

    const gallery = parseGalleryFromForm(form.galleryJson)
    const payload = {
      section: form.section,
      title: form.title.trim(),
      location: form.location.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body.trim() || '',
      bodyEn: form.bodyEn.trim() || '',
      bodyDe: form.bodyDe.trim() || '',
      href: form.href.trim() || '',
      badge: form.badge.trim() || null,
      imageData: form.imageData || null,
      placement: form.placement.trim() || null,
      raceTime: form.raceTime.trim() || null,
      discipline: form.discipline.trim() || null,
      resultUrl: form.resultUrl.trim() || null,
      ...(gallery !== undefined ? { gallery } : {}),
      source: 'dashboard',
      publishStatus,
      scheduleAt,
      published: publishStatus !== 'draft',
    }

    if (editingItem) {
      if (editingItem.isSeed) {
        const next = upsertSeedOverride(editingItem.id, payload)
        setSeedOverrides(next)
        appendAuditEntry('content.seed_update', { id: editingItem.id, title: payload.title }, actorName())
      } else {
        const next = updateDashboardContent(editingItem.id, payload)
        setItems(next)
        appendAuditEntry('content.update', { id: editingItem.id, title: payload.title }, actorName())
      }
      setEditingItem(null)
      setForm(emptyForm)
      setNewsFormBaselineJson(stableSerialize(emptyForm))
      setImageError('')
      showSaveStatus('Entry updated.', 'success')
      return
    }

    const next = addDashboardContent(payload)
    setItems(next)
    appendAuditEntry('content.create', { title: payload.title, section: payload.section }, actorName())
    const blankWithSection = { ...emptyForm, section: form.section }
    setForm(blankWithSection)
    setNewsFormBaselineJson(stableSerialize(blankWithSection))
    setImageError('')
    showSaveStatus('Entry added.', 'success')
  }

  const removeItem = (id) => {
    setItems(removeDashboardContent(id))
    appendAuditEntry('content.delete', { id }, actorName())
  }

  const duplicateItem = (id) => {
    if (!canEditNews) return
    const next = duplicateDashboardContent(id)
    setItems(next)
    appendAuditEntry('content.duplicate', { id }, actorName())
  }

  const startEdit = (item) => {
    setEditingItem({ id: item.id, isSeed: item.isSeed })
    const nextForm = {
      section: item.section,
      title: item.title || '',
      location: item.location || '',
      excerpt: item.excerpt || '',
      body: item.body || '',
      bodyEn: item.bodyEn || '',
      bodyDe: item.bodyDe || '',
      href: item.href || '',
      badge: item.badge || '',
      imageData: item.imageData || null,
      placement: item.placement || '',
      raceTime: item.raceTime || '',
      discipline: item.discipline || '',
      resultUrl: item.resultUrl || '',
      galleryJson: item.gallery
        ? Array.isArray(item.gallery)
          ? JSON.stringify(item.gallery, null, 2)
          : String(item.gallery)
        : '',
      publishStatus: publishStatusFromItem(item),
      scheduleAt: item.scheduleAt ? new Date(item.scheduleAt).toISOString().slice(0, 16) : '',
    }
    setForm(nextForm)
    setNewsFormBaselineJson(stableSerialize(nextForm))
    setImageError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setNewsFormBaselineJson(stableSerialize(emptyForm))
    setImageError('')
  }

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    setPwBusy(true)
    try {
      const result = await changePassword(pwCurrent, pwNew, pwConfirm)
      if (!result.ok) {
        showSaveStatus(result.error || 'Could not update password.', 'error')
        return
      }
      showSaveStatus('Password updated.', 'success')
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
    } finally {
      setPwBusy(false)
    }
  }

  const onCreateUser = async (e) => {
    e.preventDefault()
    if (!isOwner) return
    setUserError('')
    setUserBusy(true)
    try {
      const result = await createUser(userUsername, userPassword, {
        [PERMISSIONS.EDIT_NEWS]: true,
        [PERMISSIONS.PUBLISH]: false,
        [PERMISSIONS.REARRANGE_SITE]: false,
      })
      if (!result.ok) {
        setUserError(result.error || 'Could not create user.')
        return
      }
      setManagedUsers(listUsers())
      setUserUsername('')
      setUserPassword('')
      showSaveStatus('User created.', 'success')
    } finally {
      setUserBusy(false)
    }
  }

  const onTogglePermission = (username, permission, value) => {
    const target = managedUsers.find((u) => u.username === username)
    if (!target) return
    const result = updateUserPermissions(username, {
      ...target.permissions,
      [permission]: value,
    })
    if (!result.ok) {
      setUserError(result.error || 'Could not update permissions.')
      return
    }
    setManagedUsers(listUsers())
    showSaveStatus('Permissions updated.', 'success')
  }

  const onDeleteUser = (username) => {
    const result = deleteUser(username)
    if (!result.ok) {
      setUserError(result.error || 'Could not delete user.')
      return
    }
    setManagedUsers(listUsers())
    showSaveStatus('User removed.', 'success')
  }

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024

  const processImageFile = (file) => {
    setImageError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image is too large. Maximum size is 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null
      setForm((prev) => ({ ...prev, imageData: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const onImageSelected = (e) => {
    const file = e.target.files?.[0]
    processImageFile(file)
    e.target.value = ''
  }

  const onImageDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    processImageFile(file)
  }

  const onImageDragOver = (e) => {
    e.preventDefault()
  }

  const handleResetLayout = () => {
    if (!canRearrangeSite) return
    if (!confirm('Reset homepage layout to default (Hero → About → Sponsors → Training → Calendar → News, all visible)?')) return
    setLayout(resetHomepageLayoutToDefault())
    appendAuditEntry('layout.reset', {}, actorName())
    showSaveStatus('Homepage layout reset.', 'success')
  }

  const handleResetSeeds = () => {
    if (!isOwner) return
    if (!confirm('Reset all built-in competition/story entries to their original content?')) return
    clearAllSeedOverrides()
    setSeedOverrides({})
    appendAuditEntry('content.seed_reset_all', {}, actorName())
    showSaveStatus('Built-in entries reset.', 'success')
  }

  const handleExportBackup = () => {
    const json = exportSiteBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setBackupMessage('Backup downloaded.')
    appendAuditEntry('backup.export', {}, actorName())
    showSaveStatus('Backup downloaded.', 'success')
  }

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const count = importSiteBackup(typeof reader.result === 'string' ? reader.result : '')
        appendAuditEntry('backup.import', { keys: count }, actorName())
        setBackupMessage(`Imported ${count} data keys. Refresh if the site looks out of sync.`)
        setItems(getDashboardContent())
        setSeedOverrides(getSeedOverrides())
        setLayout(getHomepageLayout())
        setAuditEntries(getAuditEntries())
        setManagedUsers(listUsers())
        setCurrentUser(getCurrentUser())
        setTrainingPoints(getTrainingPoints())
        setTechPromo(getTechPortfolioConfig())
        setRaceEvents(getRaceEvents())
        setSponsorRows(getSponsors())
        setPersistedTrainingJson(stableSerialize(getTrainingPoints()))
        setPersistedTechJson(stableSerialize(getTechPortfolioConfig()))
        setPersistedRacesJson(stableSerialize(getRaceEvents()))
        setPersistedSponsorsJson(stableSerialize(getSponsors()))
        setNewsFormBaselineJson(stableSerialize(formRef.current))
        setNewsOrderTick((t) => t + 1)
        showSaveStatus(`Imported ${count} data keys.`, 'success')
      } catch (err) {
        const msg = err?.message || 'Import failed.'
        setBackupMessage(msg)
        showSaveStatus(msg, 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const submitForcePw = async (e) => {
    e.preventDefault()
    if (!pwResetUser) return
    setPwResetBusy(true)
    try {
      const result = await adminResetUserPassword(pwResetUser, pwResetNew, pwResetConfirm)
      if (!result.ok) {
        setUserError(result.error || 'Could not reset password.')
        return
      }
      setPwResetUser(null)
      setPwResetNew('')
      setPwResetConfirm('')
      setUserError('')
      showSaveStatus('Password reset for user.', 'success')
    } finally {
      setPwResetBusy(false)
    }
  }

  const moveLayoutItem = (fromIndex, direction) => {
    const toIndex = fromIndex + direction
    if (toIndex < 0 || toIndex >= layout.order.length) return
    const nextOrder = [...layout.order]
    const [moved] = nextOrder.splice(fromIndex, 1)
    nextOrder.splice(toIndex, 0, moved)
    const next = { ...layout, order: nextOrder }
    setLayout(next)
    saveHomepageLayout(next)
  }

  const toggleLayoutVisibility = (id) => {
    const next = {
      ...layout,
      hidden: {
        ...layout.hidden,
        [id]: !layout.hidden[id],
      },
    }
    setLayout(next)
    saveHomepageLayout(next)
  }

  const sectionLabels = {
    hero: 'Hero',
    about: 'About',
    sponsors: 'Sponsors',
    training: 'Training',
    calendar: 'Race calendar',
    news: 'News',
  }

  const moveNewsInSection = (section, id, direction) => {
    if (!canEditNews) return
    const { mergedCompetitions, mergedStories, mergedUpdates } = getMergedNewsLists(items, seedOverrides)
    const list =
      section === 'competitions' ? mergedCompetitions : section === 'stories' ? mergedStories : mergedUpdates
    const ids = list.map((x) => x.id)
    const i = ids.indexOf(id)
    if (i < 0) return
    const j = i + direction
    if (j < 0 || j >= ids.length) return
    const next = [...ids]
    const tmp = next[i]
    next[i] = next[j]
    next[j] = tmp
    saveNewsOrder(section, next)
  }

  const saveRaces = () => {
    saveRaceEvents(raceEvents)
    const saved = getRaceEvents()
    setRaceEvents(saved)
    setPersistedRacesJson(stableSerialize(saved))
    appendAuditEntry('races.save', { count: saved.length }, actorName())
    showSaveStatus('Race calendar saved.', 'success')
  }

  const updateRaceField = (index, field, value) => {
    setRaceEvents((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addRaceRow = () => {
    setRaceEvents((prev) => [
      ...prev,
      {
        id: `race-${Date.now()}`,
        title: '',
        date: new Date().toISOString().slice(0, 10),
        dateEnd: '',
        location: '',
        kind: 'upcoming',
        note: '',
      },
    ])
  }

  const removeRaceRow = (index) => {
    setRaceEvents((prev) => prev.filter((_, i) => i !== index))
  }

  const handleResetRaces = () => {
    if (!window.confirm('Reset the race calendar to built-in defaults?')) return
    resetRaceEventsToDefault()
    const next = getRaceEvents()
    setRaceEvents(next)
    setPersistedRacesJson(stableSerialize(next))
    appendAuditEntry('races.reset', {}, actorName())
    showSaveStatus('Race calendar reset to defaults.', 'success')
  }

  const applyParsedRacesToCalendar = useCallback((parsed, messagePrefix, { skipped = 0 } = {}) => {
    if (!parsed.length) {
      setRaceImportMessage(
        'No dates found. Paste any text that includes recognizable dates (e.g. 2026-06-14, 14.06.2026, 14 June 2026, June 14th 2026).'
      )
      return
    }
    setRaceEvents((prev) => {
      const { next, added } = mergeParsedRacesIntoExisting(prev, parsed)
      if (!added.length) {
        setRaceImportMessage('Every line with a date is already in the calendar (same date + title).')
        return prev
      }
      const prefix = messagePrefix || 'Added'
      const skipNote =
        skipped > 0
          ? ` (${skipped} date line${skipped === 1 ? '' : 's'} skipped — not classified as sports calendar wording).`
          : ''
      setRaceImportMessage(
        `${prefix} ${added.length} race${added.length === 1 ? '' : 'es'} to the list below. Use “Save calendar” to keep them.${skipNote}`
      )
      appendAuditEntry('races.import_text', { count: added.length }, actorName())
      return next
    })
  }, [])

  const parseAndAddRacesFromText = () => {
    setRaceImportMessage('')
    const raw = parseRacesFromText(racePasteText)
    const parsed = filterCalendarRelevantEvents(raw, { strict: strictCalendarFilter })
    if (!parsed.length) {
      setRaceImportMessage(
        raw.length
          ? 'Dates found, but none were classified as sports calendar events. Turn off “Strict calendar filter” or paste race/training/camp text.'
          : 'No dates found. Paste any text that includes recognizable dates (e.g. 2026-06-14, 14.06.2026, 14 June 2026, June 14th 2026).'
      )
      return
    }
    applyParsedRacesToCalendar(parsed, 'Added', { skipped: raw.length - parsed.length })
  }

  useEffect(() => {
    if (racePasteDebounceRef.current) clearTimeout(racePasteDebounceRef.current)
    racePasteDebounceRef.current = setTimeout(() => {
      const t = racePasteText.trim()
      if (!t) {
        setRaceDetectPreview([])
        return
      }
      setRaceDetectPreview(annotateCalendarRelevance(parseRacesFromText(racePasteText)))
    }, 380)
    return () => {
      if (racePasteDebounceRef.current) clearTimeout(racePasteDebounceRef.current)
    }
  }, [racePasteText])

  const saveSponsorsSection = () => {
    saveSponsors(sponsorRows)
    const saved = getSponsors()
    setSponsorRows(saved)
    setPersistedSponsorsJson(stableSerialize(saved))
    appendAuditEntry('sponsors.save', { count: saved.length }, actorName())
    showSaveStatus('Sponsors saved.', 'success')
  }

  const updateSponsorField = (index, field, value) => {
    setSponsorRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addSponsorRow = () => {
    setSponsorRows((prev) => [...prev, createEmptySponsor()])
  }

  const removeSponsorRow = (index) => {
    setSponsorRows((prev) => prev.filter((_, i) => i !== index))
  }

  const moveSponsorRow = (index, direction) => {
    setSponsorRows((prev) => {
      const j = index + direction
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  const handleResetSponsors = () => {
    if (
      !window.confirm(
        'Reset sponsors to defaults from src/data/sponsors.js? This clears the saved list in this browser.'
      )
    )
      return
    resetSponsorsToDefault()
    const next = getSponsors()
    setSponsorRows(next)
    setPersistedSponsorsJson(stableSerialize(next))
    appendAuditEntry('sponsors.reset', {}, actorName())
    showSaveStatus('Sponsors reset to code defaults.', 'success')
  }

  const MAX_SPONSOR_LOGO_BYTES = 2 * 1024 * 1024
  const MAX_SPONSOR_LOGO_DATA_URL = 2_400_000

  const onSponsorLogoFile = (index, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showSaveStatus('Please choose an image file.', 'error')
      return
    }
    if (file.size > MAX_SPONSOR_LOGO_BYTES) {
      showSaveStatus('Logo image is too large. Maximum size is 2 MB.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null
      if (!dataUrl) return
      if (dataUrl.length > MAX_SPONSOR_LOGO_DATA_URL) {
        showSaveStatus('Encoded image is too large. Use a smaller file or a logo URL instead.', 'error')
        return
      }
      updateSponsorField(index, 'logoDataUrl', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleRacePaste = (e) => {
    if (!autoAddOnPaste) return
    requestAnimationFrame(() => {
      const val = e.currentTarget.value
      const raw = parseRacesFromText(val)
      const parsed = filterCalendarRelevantEvents(raw, { strict: strictCalendarFilter })
      if (!parsed.length) return
      const skipped = raw.length - parsed.length
      setRaceEvents((prev) => {
        const { next, added } = mergeParsedRacesIntoExisting(prev, parsed)
        if (!added.length) return prev
        const skipNote =
          skipped > 0 ? ` ${skipped} line${skipped === 1 ? '' : 's'} skipped (not calendar wording).` : ''
        setRaceImportMessage(
          `Auto-added ${added.length} race${added.length === 1 ? '' : 'es'}. Tap “Save calendar” to keep them.${skipNote}`
        )
        appendAuditEntry('races.import_text', { count: added.length }, actorName())
        return next
      })
    })
  }

  const updateTrainingRow = (index, field, value) => {
    setTrainingPoints((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: field === 'hours' ? Number(value) || 0 : value }
      return next
    })
  }

  const addTrainingRow = () => {
    setTrainingPoints((prev) => [...prev, { label: `W${prev.length + 1}`, hours: 18 }])
  }

  const removeTrainingRow = (index) => {
    setTrainingPoints((prev) => prev.filter((_, i) => i !== index))
  }

  const saveTrainingChart = () => {
    saveTrainingPoints(trainingPoints)
    const saved = getTrainingPoints()
    setTrainingPoints(saved)
    setPersistedTrainingJson(stableSerialize(saved))
    appendAuditEntry('training.chart', { points: saved.length }, actorName())
    showSaveStatus('Training chart saved.', 'success')
  }

  const saveTechPromo = () => {
    saveTechPortfolioConfig(techPromo)
    const saved = getTechPortfolioConfig()
    setTechPromo(saved)
    setPersistedTechJson(stableSerialize(saved))
    appendAuditEntry('tech_promo.save', { url: saved.url }, actorName())
    showSaveStatus('Tech promo saved.', 'success')
  }

  return (
    <main className="min-h-screen pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-20 md:pt-32">
      <div className="section-inner space-y-8">
        <ScrollReveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Content manager</p>
              <h1 className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">Dashboard</h1>
              <p className="mt-2 text-sm text-ink-muted">
                Publish and manage your site entries. New cards appear automatically in News.
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Signed in as {currentUser?.username || 'unknown'} ({currentUser?.role || 'user'})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-300 hover:text-amber-900"
              >
                View site
              </Link>
              <button
                onClick={onLogout}
                className="inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
              >
                Log out
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.02}>
          <section className="card-surface p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">Backup &amp; preview</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Download or import a JSON backup (content, layout, calendar, news order, training, users, audit log, and
              more). Open preview to see drafts on the public site while signed in.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
              >
                Export backup
              </button>
              <label className="inline-flex cursor-pointer rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100">
                Import backup
                <input type="file" accept="application/json" className="sr-only" onChange={handleImportBackup} />
              </label>
              <Link
                to="/?preview=1"
                className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Open site preview
              </Link>
            </div>
            {backupMessage && <p className="mt-3 text-sm text-ink-muted">{backupMessage}</p>}
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.03}>
          <section className="card-surface p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">Change password</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Updates the password stored in this browser. You stay signed in after a successful change.
            </p>
            <form onSubmit={onChangePassword} className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Current password
                </span>
                <input
                  type="password"
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  autoComplete="current-password"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  New password
                </span>
                <input
                  type="password"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Confirm new password
                </span>
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </label>
              <div className="md:col-span-2 space-y-2">
                <button
                  type="submit"
                  disabled={pwBusy}
                  className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-amber-400 disabled:opacity-60"
                >
                  {pwBusy ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          </section>
        </ScrollReveal>

        {isOwner && (
          <ScrollReveal delay={0.04}>
            <section className="card-surface p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink">Team access</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Create teammates and choose what they can do in this dashboard.
              </p>
              <form onSubmit={onCreateUser} className="mt-5 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Username</span>
                  <input
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Password</span>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    minLength={8}
                    required
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={userBusy}
                    className="inline-flex items-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60"
                  >
                    {userBusy ? 'Creating…' : 'Create user'}
                  </button>
                </div>
              </form>
              {userError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{userError}</p>}
              <div className="mt-5 space-y-3">
                {managedUsers.map((user) => (
                  <article key={user.username} className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{user.username}</p>
                        <p className="text-xs uppercase tracking-wide text-ink-soft">{user.role}</p>
                      </div>
                      {user.role !== 'owner' && (
                        <button
                          onClick={() => onDeleteUser(user.username)}
                          className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {[PERMISSIONS.EDIT_NEWS, PERMISSIONS.PUBLISH, PERMISSIONS.REARRANGE_SITE].map((permission) => (
                        <label key={permission} className="inline-flex items-center gap-2 text-sm text-ink-muted">
                          <input
                            type="checkbox"
                            checked={!!user.permissions?.[permission]}
                            disabled={user.role === 'owner'}
                            onChange={(e) => onTogglePermission(user.username, permission, e.target.checked)}
                          />
                          {permission}
                        </label>
                      ))}
                    </div>
                    {user.role !== 'owner' && (
                      <div className="mt-3 border-t border-neutral-100 pt-3">
                        {pwResetUser === user.username ? (
                          <form onSubmit={submitForcePw} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                            <input
                              type="password"
                              placeholder="New password"
                              value={pwResetNew}
                              onChange={(e) => setPwResetNew(e.target.value)}
                              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none sm:w-44"
                              minLength={8}
                              required
                            />
                            <input
                              type="password"
                              placeholder="Confirm"
                              value={pwResetConfirm}
                              onChange={(e) => setPwResetConfirm(e.target.value)}
                              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none sm:w-44"
                              minLength={8}
                              required
                            />
                            <button
                              type="submit"
                              disabled={pwResetBusy}
                              className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {pwResetBusy ? 'Saving…' : 'Apply'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPwResetUser(null)
                                setPwResetNew('')
                                setPwResetConfirm('')
                              }}
                              className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-ink"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPwResetUser(user.username)}
                            className="text-xs font-semibold text-amber-800 underline-offset-2 hover:underline"
                          >
                            Force password reset
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {isOwner && (
          <ScrollReveal delay={0.043}>
            <section className="card-surface p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink">Audit log</h2>
              <p className="mt-2 text-sm text-ink-muted">Recent actions in this browser (newest first).</p>
              <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3 text-xs text-ink-muted">
                {auditEntries.length === 0 ? (
                  <li>No entries yet.</li>
                ) : (
                  auditEntries.slice(0, 150).map((entry, i) => (
                    <li key={`${entry.t}-${i}`} className="border-b border-neutral-100 pb-2 last:border-0">
                      <span className="text-ink-soft">{new Date(entry.t).toLocaleString()}</span> ·{' '}
                      <span className="font-semibold text-ink">{entry.actor}</span> · {entry.action}
                      {entry.title && ` · ${entry.title}`}
                      {entry.target && ` · ${entry.target}`}
                      {entry.id && ` · id:${String(entry.id).slice(0, 8)}…`}
                    </li>
                  ))
                )}
              </ul>
            </section>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.05}>
          <section className="card-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink">
                    {editingItem ? 'Edit entry' : 'Create new entry'}
                  </h2>
                  {canEditNews && (
                    <DashboardStatusPill variant={newsFormDirty ? 'draft' : 'live'}>
                      {newsFormDirty ? 'Unsaved draft' : 'Matches saved site'}
                    </DashboardStatusPill>
                  )}
                </div>
                {editingItem && (
                  <p className="mt-1 text-sm font-medium text-ink-muted">
                    Editing: {form.title.trim() || '(no title yet)'}
                    {editingItem.isSeed ? ' · built-in entry' : ''}
                  </p>
                )}
                <p className="mt-2 text-sm text-ink-muted">
                  The form is a draft until you use &quot;{editingItem ? 'Save changes' : 'Add entry'}&quot;. The public
                  site updates only after you save.
                </p>
              </div>
            </div>
            {!canEditNews && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                You do not have permission to edit news entries.
              </p>
            )}
            <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
              <fieldset disabled={!canEditNews} className="contents disabled:opacity-60">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Type</span>
                <select
                  value={form.section}
                  onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  {sections.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="e.g. Junior Cup in Holten"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Location</span>
                <input
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="City, Country"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  External link (optional)
                </span>
                <input
                  value={form.href}
                  onChange={(e) => setForm((prev) => ({ ...prev, href: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="https://… (shown on the article page)"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Badge (optional)</span>
                <input
                  value={form.badge}
                  onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="e.g. 🥇 or NEW"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Card preview text
                </span>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  className="min-h-32 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Short text for cards; also used on the article page if full article is empty"
                  required
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Full article (optional)
                </span>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                  className="min-h-40 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Longer text for /news/your-entry — separate paragraphs with a blank line"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Full article (English, optional)
                </span>
                <textarea
                  value={form.bodyEn}
                  onChange={(e) => setForm((prev) => ({ ...prev, bodyEn: e.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Overrides default body when site language is English"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Full article (German, optional)
                </span>
                <textarea
                  value={form.bodyDe}
                  onChange={(e) => setForm((prev) => ({ ...prev, bodyDe: e.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="Overrides default body when site language is German"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Gallery (optional)
                </span>
                <textarea
                  value={form.galleryJson}
                  onChange={(e) => setForm((prev) => ({ ...prev, galleryJson: e.target.value }))}
                  className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-mono text-xs outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder='JSON array, e.g. ["https://…/a.jpg"] — or one image URL per line'
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Placement</span>
                <input
                  value={form.placement}
                  onChange={(e) => setForm((prev) => ({ ...prev, placement: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="e.g. 3rd overall"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Race time</span>
                <input
                  value={form.raceTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, raceTime: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="e.g. 1:52:03"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Discipline</span>
                <input
                  value={form.discipline}
                  onChange={(e) => setForm((prev) => ({ ...prev, discipline: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="e.g. Olympic / Sprint"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Official results URL
                </span>
                <input
                  value={form.resultUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, resultUrl: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder="https://…"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Image</span>
                <div
                  onDragOver={onImageDragOver}
                  onDrop={onImageDrop}
                  className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-6 text-center text-sm text-ink-muted"
                >
                  <p>Drag and drop an image here, or choose a file.</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageSelected}
                    className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-900 hover:file:bg-amber-200"
                  />
                </div>
                {imageError && <p className="mt-2 text-sm font-medium text-red-700">{imageError}</p>}
                {form.imageData && (
                  <div className="mt-3 space-y-2">
                    <img
                      src={form.imageData}
                      alt="Selected entry preview"
                      className="h-36 w-full rounded-xl border border-neutral-200 object-cover sm:w-64"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCropOpen(true)}
                        className="inline-flex rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50"
                      >
                        Crop to 4:3
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, imageData: null }))}
                        className="inline-flex rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                )}
              </label>
              {canPublish && (
                <>
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Status</span>
                    <select
                      value={form.publishStatus}
                      onChange={(e) => setForm((prev) => ({ ...prev, publishStatus: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                  {form.publishStatus === 'scheduled' && (
                    <label className="block md:col-span-2">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Publish at
                      </span>
                      <input
                        type="datetime-local"
                        value={form.scheduleAt}
                        onChange={(e) => setForm((prev) => ({ ...prev, scheduleAt: e.target.value }))}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        required={form.publishStatus === 'scheduled'}
                      />
                    </label>
                  )}
                </>
              )}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
                >
                  {editingItem ? 'Save changes' : 'Add entry'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="ml-3 inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-neutral-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
              </fieldset>
            </form>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <section className="card-surface p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-ink">All entries</h3>
            <p className="mt-1 text-sm text-ink-muted">
              This list shows what is already saved (live on the site after publish rules). Search, filter, sort,
              duplicate, and edit. Choose &quot;Custom order&quot; and use ↑ ↓ to reorder how entries appear in News.
            </p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
              <label className="block min-w-[12rem] flex-1">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Search</span>
                <input
                  value={entrySearch}
                  onChange={(e) => setEntrySearch(e.target.value)}
                  placeholder="Title, text, location…"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </label>
              <label className="block w-full md:w-44">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Section</span>
                <select
                  value={entrySectionFilter}
                  onChange={(e) => setEntrySectionFilter(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="all">All</option>
                  {sections.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block w-full md:w-48">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Sort</span>
                <select
                  value={entrySort}
                  onChange={(e) => setEntrySort(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="date_desc">Newest first</option>
                  <option value="date_asc">Oldest first</option>
                  <option value="title_asc">Title A–Z</option>
                  <option value="section_asc">Section A–Z</option>
                  <option value="manual">Custom order (saved)</option>
                </select>
              </label>
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={handleResetSeeds}
                className="mt-4 inline-flex rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100"
              >
                Reset built-in entries to originals
              </button>
            )}
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.085}>
          <section className="space-y-5">
            {filteredGrouped.map((group) => (
              <article key={group.key} className="card-surface p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-ink">{group.label}</h3>
                {group.items.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">No matching entries.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {group.items.map((item, idx) => (
                      <li key={item.id || item.key} className="rounded-xl border border-neutral-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink">{item.title}</p>
                            <p className="mt-1 text-xs text-ink-soft">{item.location || 'No location set'}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                              {publishStatusLabel(item)}
                            </p>
                            <p className="mt-2 text-sm text-ink-muted">{item.excerpt}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                            {entrySort === 'manual' && canEditNews && (
                              <>
                                <button
                                  type="button"
                                  title="Move up in News"
                                  onClick={() => moveNewsInSection(group.key, item.id, -1)}
                                  disabled={idx === 0}
                                  className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50 disabled:opacity-40"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  title="Move down in News"
                                  onClick={() => moveNewsInSection(group.key, item.id, 1)}
                                  disabled={idx === group.items.length - 1}
                                  className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50 disabled:opacity-40"
                                >
                                  ↓
                                </button>
                              </>
                            )}
                            {canEditNews && (
                              <button
                                onClick={() => startEdit(item)}
                                className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50"
                              >
                                Edit
                              </button>
                            )}
                            {canEditNews && !item.isSeed && (
                              <button
                                onClick={() => duplicateItem(item.id)}
                                className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-50"
                              >
                                Duplicate
                              </button>
                            )}
                            {item.isSeed ? (
                              <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-ink-soft">
                                Existing
                              </span>
                            ) : canEditNews ? (
                              <button
                                onClick={() => removeItem(item.id)}
                                className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
        </ScrollReveal>

        {canRearrangeSite && (
          <ScrollReveal delay={0.1}>
            <section className="card-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Website arrangement</h2>
                <DashboardStatusPill variant="instant">Live · saves immediately</DashboardStatusPill>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                Reorder homepage sections and choose which ones are visible. Changes apply to the public homepage as
                soon as you tap a control (no separate Save button).
              </p>
              <button
                type="button"
                onClick={handleResetLayout}
                className="mt-4 inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
              >
                Reset layout to default
              </button>
              <div className="mt-5 space-y-3">
                {layout.order.map((id, index) => (
                  <article key={id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                    <div>
                      <p className="font-semibold text-ink">{sectionLabels[id] || id}</p>
                      <p className="text-xs uppercase tracking-wide text-ink-soft">
                        {layout.hidden[id] ? 'Hidden on homepage' : 'Visible on homepage'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveLayoutItem(index, -1)}
                        disabled={index === 0}
                        className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50 disabled:opacity-50"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLayoutItem(index, 1)}
                        disabled={index === layout.order.length - 1}
                        className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-ink transition hover:bg-neutral-50 disabled:opacity-50"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleLayoutVisibility(id)}
                        className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
                      >
                        {layout.hidden[id] ? 'Show' : 'Hide'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {canEditNews && (
          <ScrollReveal delay={0.103}>
            <section className="card-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Race calendar (homepage)</h2>
                <DashboardStatusPill variant={racesDirty ? 'draft' : 'live'}>
                  {racesDirty ? 'Unsaved draft' : 'Matches saved site'}
                </DashboardStatusPill>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                These rows power the Race calendar block. Upcoming and past races are grouped automatically by date.
                Edits below are a draft until you tap &quot;Save calendar&quot; — that is what visitors see.
              </p>
              <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm"
                      aria-hidden
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-ink">Smart detect</h3>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-amber-900/70">
                        On-device · no cloud
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  Dates are parsed automatically; wording is scored on-device (sport / training / camps vs taxes,
                  birthdays, bills — not a cloud AI). Preview shows what would land on your public calendar with the
                  current filter.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
                    <input
                      type="checkbox"
                      checked={strictCalendarFilter}
                      onChange={(e) => setStrictCalendarFilter(e.target.checked)}
                      className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                    />
                    Strict calendar filter (only high-confidence sport/event lines)
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
                    <input
                      type="checkbox"
                      checked={autoAddOnPaste}
                      onChange={(e) => setAutoAddOnPaste(e.target.checked)}
                      className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                    />
                    Auto-add to the list when I paste (still use Save calendar to persist)
                  </label>
                </div>
                {raceDetectPreview.length > 0 && (
                  <div className="mt-3 max-h-36 overflow-y-auto rounded-lg border border-amber-200/80 bg-white/90 px-3 py-2 text-xs text-ink">
                    <p className="font-semibold text-amber-950/90">
                      Calendar listing: {previewForCalendar.length} event
                      {previewForCalendar.length === 1 ? '' : 's'}
                      {previewOtherCount > 0 && (
                        <span className="font-normal text-ink-muted">
                          {' '}
                          · {previewOtherCount} other date{previewOtherCount === 1 ? '' : 's'} not classified as calendar
                          events
                        </span>
                      )}
                    </p>
                    <ul className="mt-1 space-y-1.5 text-ink-muted">
                      {previewForCalendar.slice(0, 12).map((ev, i) => (
                        <li key={`${ev.date}-${ev.title}-${i}`} className="flex min-w-0 gap-2">
                          <span className="min-w-0 flex-1 truncate">
                            <span className="font-medium text-ink">
                              {ev.dateEnd && ev.dateEnd !== ev.date ? `${ev.date}–${ev.dateEnd}` : ev.date}
                            </span>
                            {' · '}
                            {ev.title}
                            {ev.location ? ` · ${ev.location}` : ''}
                          </span>
                          {typeof ev._relevance === 'number' && (
                            <span
                              className="shrink-0 tabular-nums text-[10px] text-amber-900/80"
                              title="How strongly this line matches sports/calendar wording"
                            >
                              {Math.round(ev._relevance * 100)}%
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {previewForCalendar.length > 12 && (
                      <p className="mt-1 text-[10px] text-ink-soft">+{previewForCalendar.length - 12} more…</p>
                    )}
                  </div>
                )}
                <textarea
                  value={racePasteText}
                  onChange={(e) => setRacePasteText(e.target.value)}
                  onPaste={handleRacePaste}
                  rows={5}
                  className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder={`Holten sprint 14.06.2026 in Holten. Nationals later 2026-07-18 — Berlin.`}
                  aria-label="Paste text to detect race dates and events"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={parseAndAddRacesFromText}
                    className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600"
                  >
                    Extract dates &amp; add to list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRacePasteText('')
                      setRaceImportMessage('')
                      setRaceDetectPreview([])
                    }}
                    className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
                  >
                    Clear
                  </button>
                </div>
                {raceImportMessage && (
                  <p className="mt-3 text-sm font-medium text-amber-950/90">{raceImportMessage}</p>
                )}
              </div>
              <div className="mt-5 space-y-3">
                {raceEvents.map((ev, index) => (
                  <div
                    key={ev.id}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-neutral-200 bg-white p-3 sm:grid-cols-12 sm:items-end"
                  >
                    <label className="block sm:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Title
                      </span>
                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) => updateRaceField(index, 'title', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="Race name"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        From
                      </span>
                      <input
                        type="date"
                        value={ev.date || ''}
                        onChange={(e) => updateRaceField(index, 'date', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        To (optional)
                      </span>
                      <input
                        type="date"
                        value={ev.dateEnd || ''}
                        onChange={(e) => updateRaceField(index, 'dateEnd', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block sm:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Location
                      </span>
                      <input
                        type="text"
                        value={ev.location || ''}
                        onChange={(e) => updateRaceField(index, 'location', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="City, country"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Kind
                      </span>
                      <select
                        value={ev.kind === 'past' ? 'past' : 'upcoming'}
                        onChange={(e) => updateRaceField(index, 'kind', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                      </select>
                    </label>
                    <div className="flex items-end justify-end sm:col-span-1">
                      <button
                        type="button"
                        title="Remove row"
                        aria-label="Remove race row"
                        onClick={() => removeRaceRow(index)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 text-xl font-light leading-none text-red-700 hover:bg-red-50 sm:h-auto sm:min-h-[2.25rem] sm:w-auto sm:px-3 sm:py-2 sm:text-xs sm:font-semibold"
                      >
                        <span className="select-none sm:hidden">−</span>
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                    <label className="block sm:col-span-12">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Note
                      </span>
                      <input
                        type="text"
                        value={ev.note || ''}
                        onChange={(e) => updateRaceField(index, 'note', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="Distance, discipline…"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addRaceRow}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
                >
                  Add race
                </button>
                <button
                  type="button"
                  onClick={saveRaces}
                  className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600"
                >
                  Save calendar
                </button>
                <button
                  type="button"
                  onClick={handleResetRaces}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
                >
                  Reset to defaults
                </button>
              </div>
            </section>
          </ScrollReveal>
        )}

        {canEditNews && (
          <ScrollReveal delay={0.104}>
            <section className="card-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Sponsors (/sponsors)</h2>
                <DashboardStatusPill variant={sponsorsDirty ? 'draft' : 'live'}>
                  {sponsorsDirty ? 'Unsaved draft' : 'Matches saved site'}
                </DashboardStatusPill>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                Listed on the public Sponsors page. Logos: <strong className="font-semibold text-ink/90">upload an image</strong>{' '}
                (stored in this browser), local files under{' '}
                <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">public/sponsors/</code>, full image URLs,
                or <strong className="font-semibold text-ink/90">SVG sprite</strong> links (
                <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">…file.svg#symbol-id</code>). Upload
                overrides the URL for display. External sprites need a full{' '}
                <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">https://…</code> URL.
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Edits are a draft until you tap &quot;Save sponsors&quot; — that list is what the public page uses.
              </p>
              <div className="mt-5 space-y-3">
                {sponsorRows.map((s, index) => (
                  <div
                    key={s.id}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-neutral-200 bg-white p-3 sm:grid-cols-12 sm:items-end"
                  >
                    <label className="block sm:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Name
                      </span>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateSponsorField(index, 'name', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="Partner name"
                        autoComplete="off"
                      />
                    </label>
                    <label className="block sm:col-span-4">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Website
                      </span>
                      <input
                        type="text"
                        value={s.url}
                        onChange={(e) => updateSponsorField(index, 'url', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="https://… or partner.com"
                        autoComplete="off"
                      />
                    </label>
                    <label className="block sm:col-span-3">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Logo URL (optional)
                      </span>
                      <input
                        type="text"
                        value={s.logo || ''}
                        onChange={(e) => updateSponsorField(index, 'logo', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="/sponsors/logo.png or https://…/icons.svg#sprite-logo"
                        autoComplete="off"
                      />
                    </label>
                    <div className="flex flex-wrap items-end gap-1 sm:col-span-2 sm:justify-end">
                      <button
                        type="button"
                        title="Move up"
                        aria-label="Move sponsor up"
                        onClick={() => moveSponsorRow(index, -1)}
                        disabled={index === 0}
                        className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-neutral-300 bg-white px-2 text-sm font-semibold text-ink transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        aria-label="Move sponsor down"
                        onClick={() => moveSponsorRow(index, 1)}
                        disabled={index >= sponsorRows.length - 1}
                        className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-neutral-300 bg-white px-2 text-sm font-semibold text-ink transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        title="Remove row"
                        aria-label="Remove sponsor row"
                        onClick={() => removeSponsorRow(index)}
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="sm:col-span-12 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/90 p-4">
                      <div className="flex flex-col gap-4">
                        {s.logoDataUrl ? (
                          <div className="w-full min-w-0 shrink-0">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                              Uploaded logo preview
                            </p>
                            <div className="flex min-h-[18rem] w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200/90 bg-white p-6 shadow-sm sm:min-h-[22rem] sm:p-8 lg:min-h-[28rem]">
                              <img
                                src={s.logoDataUrl}
                                alt=""
                                className="h-auto max-h-[min(32rem,78vh)] w-auto max-w-full object-contain object-center"
                              />
                            </div>
                          </div>
                        ) : null}
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                          <label className="inline-flex w-fit cursor-pointer items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100">
                            Upload logo image
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                onSponsorLogoFile(index, e.target.files?.[0])
                                e.target.value = ''
                              }}
                            />
                          </label>
                          {s.logoDataUrl ? (
                            <button
                              type="button"
                              onClick={() => updateSponsorField(index, 'logoDataUrl', '')}
                              className="w-fit text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
                            >
                              Remove image
                            </button>
                          ) : null}
                          <p className="text-xs text-ink-muted">
                            Optional · max 2 MB · overrides logo URL when set. Preview scales to fit (same idea as on the
                            public sponsors page).
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="block sm:col-span-12">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Description (optional)
                      </span>
                      <input
                        type="text"
                        value={s.description || ''}
                        onChange={(e) => updateSponsorField(index, 'description', e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="Short line under the name"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addSponsorRow}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
                >
                  Add sponsor
                </button>
                <button
                  type="button"
                  onClick={saveSponsorsSection}
                  className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600"
                >
                  Save sponsors
                </button>
                <button
                  type="button"
                  onClick={handleResetSponsors}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
                >
                  Reset to code defaults
                </button>
              </div>
            </section>
          </ScrollReveal>
        )}

        {canEditNews && (
          <ScrollReveal delay={0.105}>
            <section className="card-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Training hours (line chart)</h2>
                <DashboardStatusPill variant={trainingDirty ? 'draft' : 'live'}>
                  {trainingDirty ? 'Unsaved draft' : 'Matches saved site'}
                </DashboardStatusPill>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                Each row is one point on the public chart (label + hours). Strava/Garmin auto-sync needs a backend; paste
                weekly totals from your export here. Edits are a draft until you tap &quot;Save chart&quot;.
              </p>
              <div className="mt-5 space-y-3">
                {trainingPoints.map((row, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => updateTrainingRow(index, 'label', e.target.value)}
                      className="min-w-[6rem] flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                      placeholder="Label"
                    />
                    <input
                      type="number"
                      min={0}
                      max={80}
                      step={0.5}
                      value={row.hours}
                      onChange={(e) => updateTrainingRow(index, 'hours', e.target.value)}
                      className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    />
                    <span className="text-xs text-ink-soft">h</span>
                    <button
                      type="button"
                      title="Remove point"
                      aria-label="Remove training point"
                      onClick={() => removeTrainingRow(index)}
                      className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-200 text-xl font-light leading-none text-red-700 hover:bg-red-50 sm:h-auto sm:w-auto sm:px-3 sm:py-1 sm:text-xs sm:font-semibold"
                    >
                      <span className="select-none sm:hidden">−</span>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addTrainingRow}
                  className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-amber-400"
                >
                  Add point
                </button>
                <button
                  type="button"
                  onClick={saveTrainingChart}
                  className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600"
                >
                  Save chart
                </button>
              </div>
            </section>
          </ScrollReveal>
        )}

        {canEditNews && (
          <ScrollReveal delay={0.106}>
            <section className="card-surface border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Tech portfolio box (hero)</h2>
                <DashboardStatusPill variant={techDirty ? 'draft' : 'live'}>
                  {techDirty ? 'Unsaved draft' : 'Matches saved site'}
                </DashboardStatusPill>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                Shows a compact promo card under your hero portrait — drives visitors to your dev portfolio. URL must
                include https:// (or we add it for you). Edits are a draft until you tap &quot;Save tech promo&quot;.
              </p>
              <div className="mt-5 space-y-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={techPromo.enabled}
                    onChange={(e) => setTechPromo((p) => ({ ...p, enabled: e.target.checked }))}
                  />
                  Show promo on homepage
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Portfolio URL
                  </span>
                  <input
                    type="url"
                    value={techPromo.url}
                    onChange={(e) => setTechPromo((p) => ({ ...p, url: e.target.value }))}
                    placeholder="https://github.com/you or your site"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Title</span>
                  <input
                    type="text"
                    value={techPromo.title}
                    onChange={(e) => setTechPromo((p) => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Short blurb</span>
                  <textarea
                    value={techPromo.blurb}
                    onChange={(e) => setTechPromo((p) => ({ ...p, blurb: e.target.value }))}
                    rows={2}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={techPromo.openInNewTab}
                    onChange={(e) => setTechPromo((p) => ({ ...p, openInNewTab: e.target.checked }))}
                  />
                  Open in new tab
                </label>
              </div>
              <button
                type="button"
                onClick={saveTechPromo}
                className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-slate-800"
              >
                Save tech promo
              </button>
            </section>
          </ScrollReveal>
        )}
      </div>
      {cropOpen && form.imageData && (
        <ImageCropModal
          imageData={form.imageData}
          onClose={() => setCropOpen(false)}
          onApply={(dataUrl) => setForm((prev) => ({ ...prev, imageData: dataUrl }))}
        />
      )}
    </main>
  )
}
