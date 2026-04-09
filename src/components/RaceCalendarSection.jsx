import { useEffect, useMemo, useState } from 'react'
import ScrollReveal from './ScrollReveal.jsx'
import { getRaceEvents } from '../lib/raceCalendarStore'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function RaceCalendarSection() {
  const { t } = useI18n()
  const [events, setEvents] = useState(() => getRaceEvents())

  useEffect(() => {
    const sync = () => setEvents(getRaceEvents())
    window.addEventListener('portfolio-races-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('portfolio-races-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const up = []
    const pa = []
    for (const e of events) {
      if (e.kind === 'past' || (e.date && e.date < today)) pa.push(e)
      else up.push(e)
    }
    up.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    pa.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    return { upcoming: up, past: pa }
  }, [events])

  return (
    <section
      id="calendar"
      className="scroll-mt-[calc(3.125rem+env(safe-area-inset-top,0px)+0.5rem)] py-16 md:scroll-mt-32 md:py-24"
    >
      <div className="section-inner">
        <ScrollReveal>
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">{t('calendar.eyebrow')}</p>
            <h2 className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">{t('calendar.title')}</h2>
            <p className="mt-3 text-base text-ink-muted">{t('calendar.subtitle')}</p>
          </div>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-2">
          <ScrollReveal delay={0.04}>
            <div className="card-surface p-6 sm:p-8">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-900/80">
                {t('calendar.upcoming')}
              </h3>
              <ul className="mt-5 space-y-4">
                {upcoming.length === 0 && (
                  <li className="text-sm text-ink-muted">{t('calendar.emptyUpcoming')}</li>
                )}
                {upcoming.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-col gap-1 rounded-xl border border-amber-200/60 bg-amber-50/40 px-4 py-3 transition hover:border-amber-300/80"
                  >
                    <span className="font-display text-xs font-bold uppercase tracking-wide text-amber-900/70">
                      {e.dateEnd && e.dateEnd !== e.date ? `${e.date} – ${e.dateEnd}` : e.date}
                    </span>
                    <span className="font-semibold text-ink">{e.title}</span>
                    <span className="text-sm text-ink-muted">{e.location}</span>
                    {e.note && <span className="text-xs text-ink-soft">{e.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="card-surface p-6 sm:p-8">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-900/80">
                {t('calendar.past')}
              </h3>
              <ul className="mt-5 space-y-3">
                {past.slice(0, 8).map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-col gap-0.5 border-b border-neutral-200/80 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      {e.dateEnd && e.dateEnd !== e.date ? `${e.date} – ${e.dateEnd}` : e.date}
                    </span>
                    <span className="text-sm font-medium text-ink">{e.title}</span>
                    <span className="text-xs text-ink-muted">{e.location}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
