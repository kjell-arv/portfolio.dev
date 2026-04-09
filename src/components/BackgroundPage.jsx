import PageShell from './PageShell.jsx'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function BackgroundPage() {
  const { t } = useI18n()

  return (
    <PageShell
      eyebrow={t('backgroundPage.eyebrow')}
      title={t('backgroundPage.title')}
      subtitle={t('backgroundPage.subtitle')}
    >
      <div className="max-w-3xl space-y-6 text-[0.95rem] leading-relaxed text-ink-muted">
        <p>{t('backgroundPage.p1')}</p>
        <p>{t('backgroundPage.p2')}</p>
        <p>
          {t('backgroundPage.p3before')}{' '}
          <Link to="/about-me" className="font-semibold text-amber-900 underline-offset-2 hover:underline">
            {t('backgroundPage.achievementsLink')}
          </Link>{' '}
          {t('backgroundPage.p3after')}
        </p>
      </div>
    </PageShell>
  )
}
