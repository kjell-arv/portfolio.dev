import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollReveal from './ScrollReveal.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { getSponsors } from '../lib/sponsorsStore.js'
import SponsorLogo from './SponsorLogo.jsx'

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function SponsorsSection() {
  const { t } = useI18n()
  const [sponsors, setSponsors] = useState(() => getSponsors())

  useEffect(() => {
    const sync = () => setSponsors(getSponsors())
    sync()
    window.addEventListener('portfolio-sponsors-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('portfolio-sponsors-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <section
      id="sponsors"
      className="scroll-mt-[calc(3.125rem+env(safe-area-inset-top,0px)+0.5rem)] py-16 md:scroll-mt-32 md:py-24"
    >
      <div className="section-inner">
        <ScrollReveal>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">{t('homeSponsors.eyebrow')}</p>
              <h2 className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">{t('homeSponsors.title')}</h2>
              <p className="mt-3 text-base text-ink-muted">{t('homeSponsors.subtitle')}</p>
            </div>
            <Link
              to="/sponsors"
              className="shrink-0 self-start rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 sm:self-auto"
            >
              {t('homeSponsors.viewAll')} <span aria-hidden>→</span>
            </Link>
          </div>
        </ScrollReveal>

        {sponsors.length === 0 ? (
          <ScrollReveal delay={0.04}>
            <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-8 text-center shadow-card">
              <p className="text-sm text-ink-muted">{t('homeSponsors.empty')}</p>
            </div>
          </ScrollReveal>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sponsors.map((s) => (
              <li key={s.id}>
                <ScrollReveal delay={0.02}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-card transition hover:border-amber-300/80 hover:bg-amber-50/50"
                  >
                    <div className="mb-3 flex min-h-[5rem] items-center justify-center">
                      <SponsorLogo logoUrl={s.logo} logoDataUrl={s.logoDataUrl} initials={initials(s.name)} />
                    </div>
                    <span className="text-center font-display text-sm font-semibold text-ink group-hover:text-amber-900">
                      {s.name}
                    </span>
                  </a>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
