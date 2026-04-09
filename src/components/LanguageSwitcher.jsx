import { useI18n } from '../i18n/I18nContext.jsx'

const btn =
  'rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide transition sm:text-xs'

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-neutral-300/90 bg-white/95 p-0.5 shadow-sm ${className}`}
      role="group"
      aria-label={t('header.langSwitch')}
    >
      <button
        type="button"
        className={`${btn} ${locale === 'en' ? 'bg-amber-500 text-white shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={`${btn} ${locale === 'de' ? 'bg-amber-500 text-white shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        onClick={() => setLocale('de')}
        aria-pressed={locale === 'de'}
      >
        DE
      </button>
    </div>
  )
}
