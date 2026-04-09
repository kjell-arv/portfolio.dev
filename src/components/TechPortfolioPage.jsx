import { useEffect, useState } from 'react'
import PageShell from './PageShell.jsx'
import { getTechPortfolioConfig } from '../lib/techPortfolioStore'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function TechPortfolioPage() {
  const { t } = useI18n()
  const [cfg, setCfg] = useState(() => getTechPortfolioConfig())

  useEffect(() => {
    const sync = () => setCfg(getTechPortfolioConfig())
    window.addEventListener('portfolio-tech-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('portfolio-tech-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const href =
    cfg.url && (cfg.url.startsWith('http') ? cfg.url : `https://${cfg.url}`)

  return (
    <PageShell
      eyebrow={t('techPage.eyebrow')}
      title={cfg.title || t('techPage.titleFallback')}
      subtitle={cfg.blurb || t('techPage.subtitleFallback')}
    >
      <div className="card-surface max-w-3xl space-y-5 p-6 sm:p-8">
        <p className="text-[0.95rem] leading-relaxed text-ink-muted">{t('techPage.body')}</p>
        {cfg.enabled && href ? (
          <a
            href={href}
            target={cfg.openInNewTab ? '_blank' : undefined}
            rel={cfg.openInNewTab ? 'noreferrer noopener' : undefined}
            className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800"
          >
            {t('techPage.openSite')}
          </a>
        ) : (
          <p className="text-sm text-ink-soft">{t('techPage.disabledHint')}</p>
        )}
      </div>
    </PageShell>
  )
}
