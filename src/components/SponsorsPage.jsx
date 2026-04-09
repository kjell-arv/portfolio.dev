import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from './PageShell.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { CONTACT_EMAIL } from '../lib/contact.js'
import { getSponsors } from '../lib/sponsorsStore.js'
import SponsorLogo from './SponsorLogo.jsx'

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function SponsorsPage() {
  const { t } = useI18n()
  const [sponsors, setSponsors] = useState(() => getSponsors())
  const sponsorMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('header.topicSponsorship'))}`

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
    <PageShell
      eyebrow={t('sponsorsPage.eyebrow')}
      title={t('sponsorsPage.title')}
      subtitle={t('sponsorsPage.subtitle')}
    >
      <div className="max-w-3xl">
        <p className="text-base leading-relaxed text-ink-muted">{t('sponsorsPage.intro')}</p>
      </div>

      {sponsors.length === 0 ? (
        <div className="card-surface max-w-2xl p-8 text-center">
          <p className="text-sm leading-relaxed text-ink-muted">{t('sponsorsPage.empty')}</p>
          <a
            href={sponsorMailto}
            className="mt-6 inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
          >
            {t('sponsorsPage.ctaButton')}
          </a>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-card transition hover:border-amber-300/80 hover:bg-amber-50/50"
              >
                <div className="mb-4 flex h-20 items-center justify-center">
                  <SponsorLogo logoUrl={s.logo} logoDataUrl={s.logoDataUrl} initials={initials(s.name)} />
                </div>
                <span className="font-display text-base font-semibold text-ink group-hover:text-amber-900">{s.name}</span>
                {s.description ? (
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">{s.description}</p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="card-surface mt-4 max-w-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t('sponsorsPage.ctaTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t('sponsorsPage.ctaBody')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={sponsorMailto}
            className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
          >
            {t('sponsorsPage.ctaButton')}
          </a>
          <Link
            to="/connect"
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-amber-400 hover:bg-amber-50/80"
          >
            {t('sponsorsPage.ctaConnect')}
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
