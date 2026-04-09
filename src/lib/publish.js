/** @typedef {'draft' | 'scheduled' | 'published'} PublishStatus */

/**
 * Normalize legacy `published` boolean into publishStatus.
 * @param {object} item
 */
export function getPublishStatus(item) {
  if (item.publishStatus === 'draft' || item.publishStatus === 'scheduled' || item.publishStatus === 'published') {
    return item.publishStatus
  }
  if (item.published === false) return 'draft'
  return 'published'
}

/**
 * Whether an entry should appear on the public News section.
 * @param {{ preview?: boolean }} [opts] — When `preview` is true (owner preview mode), drafts are included.
 */
export function isEntryVisibleOnPublicSite(item, opts = {}) {
  if (opts.preview) return true
  const status = getPublishStatus(item)
  if (status === 'draft') return false
  if (status === 'published') return true
  if (status === 'scheduled') {
    if (!item.scheduleAt) return false
    const when = new Date(item.scheduleAt).getTime()
    if (Number.isNaN(when)) return false
    return Date.now() >= when
  }
  return false
}

export function publishStatusLabel(item) {
  const status = getPublishStatus(item)
  if (status === 'draft') return 'Draft'
  if (status === 'published') return 'Published'
  if (status === 'scheduled') {
    if (!item.scheduleAt) return 'Scheduled'
    return `Scheduled · ${new Date(item.scheduleAt).toLocaleString()}`
  }
  return status
}
