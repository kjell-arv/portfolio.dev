import PageShell from './PageShell.jsx'
import News from './news.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function NewsDetailPage() {
  const { t } = useI18n()

  return (
    <PageShell
      eyebrow={t('newsDetailPage.eyebrow')}
      title={t('newsDetailPage.title')}
      subtitle={t('newsDetailPage.subtitle')}
    >
      <News hideIntro embedded />
    </PageShell>
  )
}
