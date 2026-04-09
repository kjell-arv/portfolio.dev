/**
 * Extract race-like rows from free-form text (no fixed layout).
 * Scans the whole string for date patterns and infers title / location from nearby words.
 */

const MONTH_MAP = new Map(
  [
    ['january', 1],
    ['jan', 1],
    ['januar', 1],
    ['february', 2],
    ['feb', 2],
    ['februar', 2],
    ['march', 3],
    ['mar', 3],
    ['märz', 3],
    ['maerz', 3],
    ['april', 4],
    ['apr', 4],
    ['may', 5],
    ['mai', 5],
    ['june', 6],
    ['jun', 6],
    ['juni', 6],
    ['july', 7],
    ['jul', 7],
    ['juli', 7],
    ['august', 8],
    ['aug', 8],
    ['september', 9],
    ['sep', 9],
    ['sept', 9],
    ['oktober', 10],
    ['october', 10],
    ['oct', 10],
    ['november', 11],
    ['nov', 11],
    ['december', 12],
    ['dec', 12],
    ['dezember', 12],
    ['dez', 12],
  ].map(([k, v]) => [k.toLowerCase(), v])
)

function toIso(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  const ys = String(y).padStart(4, '0')
  const ms = String(m).padStart(2, '0')
  const ds = String(d).padStart(2, '0')
  return `${ys}-${ms}-${ds}`
}

function expandTwoDigitYear(y) {
  if (y >= 100) return y
  return y < 50 ? 2000 + y : 1900 + y
}

/** @typedef {{ iso: string, index: number, length: number, raw: string, dateEnd?: string, isComposite?: boolean }} DateHit */

/** @param {string} text @returns {DateHit[]} */
function findIsoDates(text) {
  const re = /\b(\d{4})-(\d{2})-(\d{2})\b/g
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    const y = Number(m[1])
    const mo = Number(m[2])
    const d = Number(m[3])
    const iso = toIso(y, mo, d)
    if (iso) out.push({ iso, index: m.index, length: m[0].length, raw: m[0] })
  }
  return out
}

/** @param {string} text @returns {DateHit[]} */
function findEuDates(text) {
  const re = /\b(\d{1,2})[./](\d{1,2})[./](\d{2,4})\b/g
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    let d = Number(m[1])
    let mo = Number(m[2])
    let y = Number(m[3])
    if (m[3].length <= 2) y = expandTwoDigitYear(y)
    const iso = toIso(y, mo, d)
    if (iso) out.push({ iso, index: m.index, length: m[0].length, raw: m[0] })
  }
  return out
}

/** e.g. 28.02.-14.03.2026 or 28.02. - 14.03.2026 */
/** @param {string} text @returns {DateHit[]} */
function findEuDateRanges(text) {
  const re = /\b(\d{1,2})\.(\d{1,2})\.\s*[\u2013\-]\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    const d1 = Number(m[1])
    const mo1 = Number(m[2])
    const d2 = Number(m[3])
    const mo2 = Number(m[4])
    let y = Number(m[5])
    if (m[5].length <= 2) y = expandTwoDigitYear(y)
    const isoStart = toIso(y, mo1, d1)
    const isoEnd = toIso(y, mo2, d2)
    if (!isoStart || !isoEnd) continue
    out.push({
      iso: isoStart,
      dateEnd: isoEnd,
      index: m.index,
      length: m[0].length,
      raw: m[0],
      isComposite: true,
    })
  }
  return out
}

/** e.g. 25./26.03.2026 (two days, same month/year) */
/** @param {string} text @returns {DateHit[]} */
function findEuMultiDay(text) {
  const re = /\b(\d{1,2})\.\s*\/\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    const d1 = Number(m[1])
    const d2 = Number(m[2])
    const mo = Number(m[3])
    let y = Number(m[4])
    if (m[4].length <= 2) y = expandTwoDigitYear(y)
    let isoStart = toIso(y, mo, d1)
    let isoEnd = toIso(y, mo, d2)
    if (!isoStart || !isoEnd) continue
    if (isoStart > isoEnd) [isoStart, isoEnd] = [isoEnd, isoStart]
    out.push({
      iso: isoStart,
      dateEnd: isoEnd,
      index: m.index,
      length: m[0].length,
      raw: m[0],
      isComposite: true,
    })
  }
  return out
}

/** @param {string} text @returns {DateHit[]} */
function findNamedDmy(text) {
  const re = /\b(\d{1,2})[.\s]+\s*([A-Za-zäöüÄÖÜß]+)\s+(\d{4})\b/g
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    const d = Number(m[1])
    const moName = m[2]
    const y = Number(m[3])
    const mo = MONTH_MAP.get(moName.toLowerCase())
    if (!mo) continue
    const iso = toIso(y, mo, d)
    if (iso) out.push({ iso, index: m.index, length: m[0].length, raw: m[0] })
  }
  return out
}

/** @param {string} text @returns {DateHit[]} */
function findNamedMdy(text) {
  const re = /\b([A-Za-zäöüÄÖÜß]+)\s+(\d{1,2})(?:st|nd|rd|th)?[,.]?\s+(\d{4})\b/gi
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    const moName = m[1]
    const d = Number(m[2])
    const y = Number(m[3])
    const mo = MONTH_MAP.get(moName.toLowerCase())
    if (!mo) continue
    const iso = toIso(y, mo, d)
    if (iso) out.push({ iso, index: m.index, length: m[0].length, raw: m[0] })
  }
  return out
}

/** e.g. 14th June 2026 (day-first with ordinal) */
/** @param {string} text @returns {DateHit[]} */
function findOrdinalNamed(text) {
  const re = /\b(\d{1,2})(?:st|nd|rd|th)?[.\s]+\s*([A-Za-zäöüÄÖÜß]+)\s+(\d{4})\b/gi
  const out = []
  let m
  while ((m = re.exec(text)) !== null) {
    const d = Number(m[1])
    const moName = m[2]
    const y = Number(m[3])
    const mo = MONTH_MAP.get(moName.toLowerCase())
    if (!mo) continue
    const iso = toIso(y, mo, d)
    if (iso) out.push({ iso, index: m.index, length: m[0].length, raw: m[0] })
  }
  return out
}

/**
 * Merge overlapping hits (same span or contained); prefer longer match at same start.
 * @param {DateHit[]} hits
 * @returns {DateHit[]}
 */
function dedupeOverlaps(hits) {
  const sorted = [...hits].sort((a, b) => a.index - b.index || b.length - a.length)
  const out = []
  for (const h of sorted) {
    const last = out[out.length - 1]
    if (last && h.index < last.index + last.length) {
      const overlap =
        h.index >= last.index && h.index + h.length <= last.index + last.length
      if (overlap) continue
      if (h.index === last.index && h.length > last.length) {
        out[out.length - 1] = h
      }
      continue
    }
    out.push(h)
  }
  return out
}

/**
 * Same calendar day + overlapping position → one event.
 * @param {DateHit[]} hits
 * @returns {DateHit[]}
 */
function dedupeSameSpot(hits) {
  const key = (h) => `${h.iso}|${h.index}`
  const seen = new Set()
  return hits.filter((h) => {
    const k = key(h)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function splitRemainder(rest) {
  let t = rest.replace(/\s+/g, ' ').trim()
  t = t.replace(/^[,;:\-|–—]\s*/, '').trim()
  t = t.replace(/\s*[—–]\s*[—–]\s*/g, ' — ').replace(/\s+-\s+-\s+/g, ' - ')

  const colon = t.match(/^([^:]+):\s*(.+)$/)
  if (colon) {
    const left = colon[1].trim()
    const right = colon[2].trim()
    const leftLooksLikeDate = /^[\d.\s/–-]+$/.test(left) || left.length < 2
    if (right.length > 1 && leftLooksLikeDate) {
      return { title: right, location: '', note: '' }
    }
    if (right.length > 2 && left.length < 60 && right.length >= left.length) {
      return { title: right, location: '', note: left }
    }
  }

  const pipe = t.split(/\s*\|\s*/)
  if (pipe.length >= 2) {
    const title = pipe[0].trim()
    const mid = pipe[1].trim()
    const note = pipe.slice(2).join(' | ').trim()
    if (/[—–-]\s*\S/.test(mid)) {
      const dash = mid.split(/\s*[—–-]\s*/)
      return {
        title: title || mid,
        location: dash[0]?.trim() || '',
        note: [dash.slice(1).join(' — '), note].filter(Boolean).join(' · ') || '',
      }
    }
    return { title: title || 'Race', location: mid, note: note || '' }
  }

  const em = t.split(/\s*[—–]\s*/).filter((s) => s.trim())
  if (em.length >= 2) {
    return {
      title: em[0].trim(),
      location: em[1].trim(),
      note: em.slice(2).join(' — ').trim(),
    }
  }

  const dash = t.split(/\s+-\s+/)
  if (dash.length >= 2) {
    return {
      title: dash[0].trim(),
      location: dash[1].trim(),
      note: dash.slice(2).join(' - ').trim(),
    }
  }

  const comma = t.indexOf(',')
  if (comma > 0 && comma < t.length - 1) {
    const left = t.slice(0, comma).trim()
    const right = t.slice(comma + 1).trim()
    if (left.length > 2 && right.length > 1 && !/^\d/.test(right)) {
      return { title: left, location: right, note: '' }
    }
  }

  return { title: t, location: '', note: '' }
}

function stripDateLikeTokens(s) {
  return s
    .replace(/\b\d{1,2}\.\d{1,2}\.\s*[\u2013\-]\s*\d{1,2}\.\d{1,2}\.\d{2,4}\b/g, ' ')
    .replace(/\b\d{1,2}\.\s*\/\s*\d{1,2}\.\d{1,2}\.\d{2,4}\b/g, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')
    .replace(/\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b/g, ' ')
    .replace(/\b\d{1,2}[.\s]+\s*[A-Za-zäöüÄÖÜß]+\s+\d{4}\b/gi, ' ')
    .replace(/\b[A-Za-zäöüÄÖÜß]+\s+\d{1,2}(?:st|nd|rd|th)?[,.]?\s+\d{4}\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferTitleFromBefore(s) {
  if (!s) return ''
  let t = stripDateLikeTokens(s).replace(/\s+/g, ' ').trim()
  t = t.replace(
    /\s*(?:on|am|for|at|the|@\s*|von|vom|bis|–|—)\s*$/i,
    ''
  ).trim()
  t = t.replace(/\s+(?:is|was|are)\s*$/i, '').trim()
  const bySentence = t.split(/(?<=[.!?])\s+/)
  let chunk = bySentence[bySentence.length - 1]?.trim() || t
  chunk = chunk.replace(/^[-–—•\s]+/, '').trim()
  chunk = chunk.replace(/\s+(?:is|was|are)\s*$/i, '').trim()
  const words = chunk.split(/\s+/)
  if (words.length > 16) chunk = words.slice(-16).join(' ')
  return chunk.slice(0, 120).trim()
}

function inferLocationFromAfter(s, titleHint) {
  if (!s) return ''
  let t = s.replace(/\s+/g, ' ').trim()
  t = t.replace(/^\s*[—–-]\s*/, '').trim()
  const paren = t.match(/^\s*\(([^)]+)\)/)
  if (paren) return paren[1].trim().replace(/[.,;]$/, '').slice(0, 80)

  const inAt = t.match(
    /\b(?:in|at|bei|am|auf|@\s*|near|outside)\s+([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9 ,.'’/-]{0,65})/i
  )
  if (inAt) {
    let loc = inAt[1].trim()
    loc = loc.split(/\s+(?:really|then|and also|also|before|after)\s/i)[0]?.trim() || loc
    const dot = loc.search(/\.\s+[A-Z]/)
    if (dot > 2 && dot < 50) loc = loc.slice(0, dot)
    loc = loc.split(/\s+(?:then|and also|also|before|after)\s/i)[0]?.trim() || loc
    loc = loc.replace(/\s+(?:for|on|with)\s.*$/i, '').trim()
    loc = loc.replace(/[.,;]$/, '')
    return loc.slice(0, 80)
  }

  const comma = t.match(/^[,;]\s*([^,.(;]+)/)
  if (comma) return comma[1].trim().replace(/[.,;]$/, '').slice(0, 80)

  // Sentence punctuation, not ordinal/section dots like "1. Liga" (German).
  const stop = t.search(/(?<!\d)\.(?!\d)|[!?\n]/)
  const head = (stop >= 0 ? t.slice(0, stop) : t).trim()
  if (
    head.length > 2 &&
    head.length < 90 &&
    !/^\d/.test(head) &&
    !/^(and|or|then|also|but)\s+/i.test(head)
  ) {
    const cleaned = head.replace(/[.,;]$/, '')
    const hw = cleaned.split(/\s+/).length
    if (hw > 4 || /\s+and\s+\w+\s+and\s+/i.test(cleaned)) return ''
    if (/^(somewhere|anywhere|here|there)\b/i.test(cleaned)) return ''
    if (hw === 1 && /^(finish|start|end|go|stop|race|begin)$/i.test(cleaned)) return ''
    if (titleHint && cleaned.toLowerCase() === String(titleHint).toLowerCase().trim()) return ''
    if (/^(we|i)\s+(start|go|have|are)\b/i.test(cleaned)) return ''
    if (/^we\s+/i.test(cleaned)) return ''
    return cleaned
  }

  return ''
}

function cleanTitle(title, afterClean) {
  let t = (title || '').trim()
  t = t.replace(/^\s*and\s+/i, '').trim()
  if (/^(somewhere|anywhere)\s+and\s+/i.test(t)) t = t.replace(/^(somewhere|anywhere)\s+and\s+/i, '').trim()
  if (/^(also|then)$/i.test(t)) t = ''
  if (!t || t.length < 2) {
    const raw = (afterClean || '').trim().replace(/^\s*[—–-]\s*/, '')
    const w = raw.split(/[.!\s]/)[0]
    if (w && w.length > 2 && /^[a-z]+$/i.test(w)) return w.charAt(0).toUpperCase() + w.slice(1)
  }
  if (t.length && t === t.toLowerCase() && t.length < 48) {
    t = t.charAt(0).toUpperCase() + t.slice(1)
  }
  return t || 'Race'
}

function inferTitleWhenBeforeIsShort(before, after) {
  const b = before.replace(/\s+/g, ' ').trim()
  if (b.length >= 14) return ''
  if (b.length > 0 && !/^(on|at|for|the|a|an|in)\s*$/i.test(b)) return ''
  const a = after.replace(/^\s*[—–-]\s*/, '').trim()
  const first = a.split(/(?<!\d)\.(?!\d)|[!?]/)[0]?.trim() || ''
  if (first.length < 3) return ''
  let t = first.split(/\s+/).slice(0, 14).join(' ')
  if (/^we\s+/i.test(first)) {
    t = first.trim().split(/\s+/).slice(0, 14).join(' ')
    t = t.charAt(0).toUpperCase() + t.slice(1)
  } else if (/^i\s+/i.test(first)) {
    t = first.replace(/^i\s+/i, 'I ').trim().split(/\s+/).slice(0, 14).join(' ')
  }
  return t.slice(0, 120)
}

function buildTitleLocationNote(before, after, structured) {
  const note = structured.note?.trim() || ''
  const titleStruct = structured.title?.trim() || ''
  const locStruct = structured.location?.trim() || ''

  const afterClean = after.replace(/^\s*(?:[:\u2014\u2013]|-)\s*/, '').trim()

  let title = inferTitleFromBefore(before)
  const shortTitle = inferTitleWhenBeforeIsShort(before, afterClean)
  if (shortTitle && (title.length < 4 || before.trim().length < 14)) title = shortTitle
  if (!title || title.length < 2) title = titleStruct
  else if (
    titleStruct &&
    title.length > titleStruct.length * 2.5 &&
    titleStruct.length > 4 &&
    titleStruct.length < 90 &&
    !/^in\s+[A-Za-z]/i.test(titleStruct)
  ) {
    title = titleStruct
  }
  if (!title) title = titleStruct || 'Race'
  title = cleanTitle(title, afterClean)

  const locInfer = inferLocationFromAfter(afterClean, title)
  let location = locInfer || locStruct || ''
  if (locInfer && locStruct && locStruct.length > 60 && locInfer.length < locStruct.length) {
    location = locInfer
  }

  return { title: title.slice(0, 200), location: location.slice(0, 200), note: note.slice(0, 300) }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/** Start/end character indices of the line containing `index`. */
function getLineBoundsAt(s, index) {
  if (index < 0 || index > s.length) return { start: 0, end: s.length }
  let start = s.lastIndexOf('\n', index - 1)
  start = start === -1 ? 0 : start + 1
  let end = s.indexOf('\n', index)
  if (end === -1) end = s.length
  return { start, end }
}

/**
 * Title/location must come from the same line as the date — not from text between this date and the previous one.
 */
function sameLineBeforeAfter(normalized, hit) {
  const { start: lineStart, end: lineEnd } = getLineBoundsAt(normalized, hit.index)
  const before = normalized.slice(lineStart, hit.index).trim()
  const after = normalized.slice(hit.index + hit.length, lineEnd).trim()
  return { before, after }
}

/** Free lines between the end of the previous event line and this date line (e.g. "Falls ich …"). */
function interLineQualifier(normalized, prevHit, hit) {
  if (!prevHit) return ''
  const prevLine = getLineBoundsAt(normalized, prevHit.index)
  const currLine = getLineBoundsAt(normalized, hit.index)
  if (currLine.start <= prevLine.end) return ''
  const gap = normalized.slice(prevLine.end, currLine.start).trim()
  if (!gap) return ''
  if (/\d{4}-\d{2}-\d{2}/.test(gap) || /\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\b/.test(gap)) return ''
  const oneLine = gap.replace(/\s+/g, ' ').trim()
  return oneLine.length > 200 ? oneLine.slice(0, 200) : oneLine
}

/**
 * @param {string} text
 * @returns {DateHit[]}
 */
function hitOverlapsComposite(h, composites) {
  const a0 = h.index
  const a1 = h.index + h.length
  for (const c of composites) {
    const r0 = c.index
    const r1 = c.index + c.length
    if (a0 < r1 && a1 > r0) return true
  }
  return false
}

function findAllDateHits(text) {
  if (!text || typeof text !== 'string') return []
  const composite = [...findEuDateRanges(text), ...findEuMultiDay(text)]
  const simple = [
    ...findIsoDates(text),
    ...findEuDates(text),
    ...findNamedDmy(text),
    ...findNamedMdy(text),
    ...findOrdinalNamed(text),
  ].filter((h) => !hitOverlapsComposite(h, composite))

  const merged = [...composite, ...simple]
  let hits = dedupeSameSpot(merged)
  hits.sort((a, b) => a.index - b.index)
  hits = dedupeOverlaps(hits)
  return hits
}

/**
 * @param {string} text
 * @returns {Array<{ title: string, date: string, dateEnd?: string, location: string, note: string, kind: 'upcoming' | 'past' }>}
 */
export function parseRacesFromText(text) {
  if (!text || typeof text !== 'string') return []
  const normalized = text.replace(/\r\n/g, '\n')
  const hits = findAllDateHits(normalized)
  const today = todayIso()
  const out = []
  const seen = new Set()

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i]
    const prevHit = hits[i - 1]
    const { before, after } = sameLineBeforeAfter(normalized, hit)
    const qualifier = interLineQualifier(normalized, prevHit, hit)

    let rest = `${before} ${after}`.replace(/\s+/g, ' ').trim()
    rest = rest.replace(/\s*[—–]\s*[—–]\s*/g, ' — ').replace(/\s+-\s+-\s+/g, ' - ')

    const structured = splitRemainder(rest)
    let { title, location, note } = buildTitleLocationNote(before, after, structured)
    if (qualifier) {
      note = note ? `${note} · ${qualifier}` : qualifier
    }

    const endIso = hit.dateEnd || hit.iso
    const dedupeKey = `${hit.iso}|${hit.dateEnd || ''}|${title.toLowerCase()}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const row = {
      title: title || 'Race',
      date: hit.iso,
      location,
      note,
      kind: endIso < today ? 'past' : 'upcoming',
    }
    if (hit.dateEnd && hit.dateEnd !== hit.iso) row.dateEnd = hit.dateEnd
    out.push(row)
  }

  return out
}

/**
 * Append parsed races to existing calendar rows; skips duplicates (same date + title, case-insensitive).
 * @returns {{ next: Array, added: Array }}
 */
export function mergeParsedRacesIntoExisting(existing, parsed) {
  if (!Array.isArray(existing) || !Array.isArray(parsed)) return { next: existing || [], added: [] }
  const existingSet = new Set(
    existing.map((e) => `${e.date}|${e.dateEnd || ''}|${(e.title || '').toLowerCase().trim()}`)
  )
  const added = []
  for (const p of parsed) {
    const k = `${p.date}|${p.dateEnd || ''}|${p.title.toLowerCase().trim()}`
    if (existingSet.has(k)) continue
    existingSet.add(k)
    added.push({
      id: `race-${Date.now()}-${added.length}-${Math.random().toString(36).slice(2, 8)}`,
      title: p.title,
      date: p.date,
      ...(p.dateEnd && p.dateEnd !== p.date ? { dateEnd: p.dateEnd } : {}),
      location: p.location || '',
      note: p.note || '',
      kind: p.kind,
    })
  }
  return { next: [...existing, ...added], added }
}
