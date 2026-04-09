import { Link } from 'react-router-dom'
import PageShell from './PageShell.jsx'
import instalogo from './img/insta.png'
import ytlogo from './img/yt.png'
import wwwlogo from './img/www.png'
import { useI18n } from '../i18n/I18nContext.jsx'
import { CONTACT_EMAIL } from '../lib/contact.js'

const social = [
  { href: 'https://www.instagram.com/kjell_arv/', icon: instalogo, label: 'Instagram', handle: '@kjell_arv' },
  { href: 'https://www.youtube.com/', icon: ytlogo, label: 'YouTube', handle: 'Channel' },
  { href: 'https://www.kjell-arved-brandt.de', icon: wwwlogo, label: 'Website', handle: 'kjell-arved-brandt.de' },
]

export default function ConnectPage() {
  const { t } = useI18n()
  const sponsorMailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('header.topicSponsorship'))}`

  return (
    <PageShell
      eyebrow={t('connectPage.eyebrow')}
      title={t('connectPage.title')}
      subtitle={t('connectPage.subtitle')}
    >
      <div className="card-surface mb-8 p-6 sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">{t('connectPage.sponsorsTeaser')}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/sponsors"
            className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
          >
            {t('connectPage.sponsorsSeePage')}
          </Link>
          <a
            href={sponsorMailto}
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-amber-400 hover:bg-amber-50/80"
          >
            {t('connectPage.sponsorsEmail')}
          </a>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-surface p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-ink">{t('connectPage.newsletterTitle')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t('connectPage.newsletterBody')}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Newsletter signup')}`}
            className="mt-6 inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
          >
            {t('connectPage.emailSubscribe')}
          </a>
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-card backdrop-blur-sm md:p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">{t('connectPage.followAlong')}</h2>
            <p className="text-xs font-medium text-ink-soft">{t('connectPage.followSub')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-1">
            {social.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[52px] items-center gap-3 rounded-xl border border-neutral-200/80 bg-surface-muted/80 px-4 py-3 transition hover:border-amber-300/80 hover:bg-amber-50/80"
              >
                <img src={item.icon} alt="" className="h-6 w-6 object-contain opacity-90" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{item.label}</p>
                  <p className="truncate text-sm font-semibold text-ink group-hover:text-amber-900">{item.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
