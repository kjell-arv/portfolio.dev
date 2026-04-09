import PageShell from './PageShell.jsx'
import ScrollReveal from './ScrollReveal.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

function YearBlock({ year, items }) {
  if (!items.length) return null
  return (
    <div className="relative pl-4">
      <div
        className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-amber-400/80 via-amber-300/40 to-transparent"
        aria-hidden
      />
      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-amber-900/75">{year}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((line) => (
          <li key={line} className="flex gap-2.5 text-[0.95rem] leading-snug text-ink-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/90" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AboutMePage() {
  const { achievements, t } = useI18n()

  return (
    <PageShell
      eyebrow={t('achievementsPage.eyebrow')}
      title={t('achievementsPage.title')}
      subtitle={t('achievementsPage.subtitle')}
    >
      <ScrollReveal>
        <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 p-6 shadow-card sm:p-8">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-950/80">
            {t('achievementsPage.highlightsTitle')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-muted">{t('achievementsPage.highlightsSub')}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {achievements.highlights.map((a) => (
              <li
                key={a.text}
                className="flex gap-3 rounded-xl border border-amber-200/60 bg-white/85 px-4 py-3 shadow-sm transition hover:border-amber-300/80 hover:shadow-md"
              >
                <span className="text-xl leading-none" aria-hidden>
                  {a.icon}
                </span>
                <span className="text-sm font-medium leading-snug text-ink">{a.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </ScrollReveal>

      <div className="grid gap-8 lg:gap-10">
        {achievements.categories.map((cat, i) => (
          <ScrollReveal key={cat.id} delay={0.04 + i * 0.05}>
            <section className="card-surface overflow-hidden p-0 shadow-lift">
              <div className={`border-b border-amber-200/50 bg-gradient-to-r ${cat.accent} px-6 py-5 sm:px-8`}>
                <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">{cat.title}</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-950/55">{cat.shortLabel}</p>
              </div>
              <div className="space-y-10 px-6 py-8 sm:px-8">
                {cat.years
                  .filter((y) => y.items.length > 0)
                  .map((y) => (
                    <YearBlock key={`${cat.id}-${y.year}`} year={y.year} items={y.items} />
                  ))}
              </div>
            </section>
          </ScrollReveal>
        ))}
      </div>
    </PageShell>
  )
}
