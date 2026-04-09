import { lazy, Suspense } from 'react'
import PageShell from './PageShell.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

const TrainingSection = lazy(() => import('./TrainingSection.jsx'))

export default function TrainingDetailPage() {
  const { t } = useI18n()

  return (
    <PageShell
      eyebrow={t('trainingDetailPage.eyebrow')}
      title={t('trainingDetailPage.title')}
      subtitle={t('trainingDetailPage.subtitle')}
    >
      <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink-muted">
        <p>{t('trainingDetailPage.p1')}</p>
        <p>{t('trainingDetailPage.p2')}</p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-8 text-center text-sm text-ink-muted">
            {t('training.loadingChart')}
          </div>
        }
      >
        <TrainingSection embedInPage />
      </Suspense>
      <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-ink-muted">
        <p>{t('trainingDetailPage.p3')}</p>
      </div>
    </PageShell>
  )
}
