import { Link } from 'react-router-dom'
import PageShell from './PageShell.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function AthletePage() {
  const { t } = useI18n()

  return (
    <PageShell
      eyebrow={t('athletePage.eyebrow')}
      title={t('athletePage.title')}
      subtitle={t('athletePage.subtitle')}
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,280px)] lg:items-start">
        <div className="card-surface space-y-5 p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-ink">{t('athletePage.followTitle')}</h2>
          <p className="text-[0.95rem] leading-relaxed text-ink-muted">{t('athletePage.p1')}</p>
          <p className="text-[0.95rem] leading-relaxed text-ink-muted">{t('athletePage.p2')}</p>
        </div>
        <aside className="card-surface p-6">
          <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-amber-900/80">
            {t('athletePage.quickLinks')}
          </p>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-amber-900">
            <li>
              <Link to="/training" className="hover:underline">
                {t('athletePage.linkTraining')}
              </Link>
            </li>
            <li>
              <Link to="/news" className="hover:underline">
                {t('athletePage.linkNews')}
              </Link>
            </li>
            <li>
              <Link to="/connect" className="hover:underline">
                {t('athletePage.linkConnect')}
              </Link>
            </li>
          </ul>
        </aside>
      </div>
    </PageShell>
  )
}
