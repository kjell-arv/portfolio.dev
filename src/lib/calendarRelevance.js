/**
 * Heuristic relevance: which date blocks read like sports / calendar events vs unrelated dates.
 * On-device only (keyword + context scoring — not an LLM).
 */

const POSITIVE_PATTERNS = [
  /\b(triathlon|triathl(on|in)|ironman|70\.3|itu|wtcs|super\s*league)\b/i,
  /\b(wettkampf|wettkämpfe|rennen|schwimm|radfahren|laufen|duathlon|aquathlon)\b/i,
  /\b(championship|meisterschaft|meisterschaften|european\s*cup|world\s*cup|national|nationals)\b/i,
  /\b(cup|pokal|kampf|finale|qualifikation|qualifying|relay|staffel|mixed\s*relay)\b/i,
  /\b(sprint|olympic|middle|long\s*distance|ld|olympia|olympics)\b/i,
  /\b(trainings?|trainingslager|lager|camp|clinic|lehrgang)\b/i,
  /\b(national\s*kader|nationalkader|nachwuchs|junior|u23|u20|elite)\b/i,
  /\b(leistungsdiagnostik|diagnostik|performance\s*test)\b/i,
  /\b(\bnk\b|\btl\b|verband|world\s*triathlon)\b/i,
  /\b(race|competition|event|wettkampf|start|strecke)\b/i,
  /\b(team|kader|athlet|athlete|coach|trainer)\b/i,
]

const NEGATIVE_PATTERNS = [
  /\b(geburtstag|birthday|jubiläum|anniversary|hochzeit|wedding)\b/i,
  /\b(steuer|tax|invoice|rechnung|zahlung|mahnung|buchhaltung)\b/i,
  /\b(miete|rent|kaution|lease)\b/i,
  /\b(newsletter|abonnement|unsubscribe|marketing)\b/i,
  /\b(bewerbung|job\s*interview|kündigung)\b/i,
]

const SOFT_NEGATIVE = [/\b(deadline|frist|abgabe)\b/i, /\b(zoom|teams)\s*call\b/i]

/**
 * @param {{ title?: string, location?: string, note?: string, date?: string, dateEnd?: string }} event
 * @returns {number} 0–1
 */
export function scoreCalendarRelevance(event) {
  const blob = `${event.title || ''} ${event.location || ''} ${event.note || ''}`

  let score = 0.38
  if (event.dateEnd && event.dateEnd !== event.date) score += 0.1

  const t = (event.title || '').trim()
  if (t.length > 40) score += 0.12
  else if (t.length > 18) score += 0.08
  else if (t.length > 8) score += 0.04

  let posMatches = 0
  for (const re of POSITIVE_PATTERNS) {
    if (re.test(blob)) {
      posMatches++
      score += 0.055
      if (posMatches >= 6) break
    }
  }

  for (const re of NEGATIVE_PATTERNS) {
    if (re.test(blob)) {
      score -= 0.42
      break
    }
  }
  for (const re of SOFT_NEGATIVE) {
    if (re.test(blob)) score -= 0.1
  }

  if (t.toLowerCase() === 'race') score -= 0.06

  return Math.min(1, Math.max(0, score))
}

/**
 * @param {Array<object>} parsed
 * @param {{ strict?: boolean }} strict — tighter = keep fewer borderline lines
 */
export function filterCalendarRelevantEvents(parsed, { strict = false } = {}) {
  if (!Array.isArray(parsed) || !parsed.length) return []
  return parsed.filter((e) => shouldIncludeInCalendar(e, { strict }))
}

export function shouldIncludeInCalendar(event, { strict = false }) {
  const blob = `${event.title || ''} ${event.location || ''} ${event.note || ''}`
  const s = scoreCalendarRelevance(event)
  const hasPos = POSITIVE_PATTERNS.some((re) => re.test(blob))
  const hasNeg = NEGATIVE_PATTERNS.some((re) => re.test(blob))

  if (strict) return s >= 0.56

  if (hasNeg && !hasPos && s < 0.48) return false
  if (s < 0.22) return false
  return true
}

export function annotateCalendarRelevance(parsed) {
  if (!Array.isArray(parsed)) return []
  return parsed.map((e) => ({
    ...e,
    _relevance: scoreCalendarRelevance(e),
  }))
}
