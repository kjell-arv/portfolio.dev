import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useI18n } from '../i18n/I18nContext.jsx'

const easeOut = [0.22, 1, 0.36, 1]

export default function PageShell({ eyebrow, title, subtitle, children }) {
  const reduceMotion = useReducedMotion()
  const { t } = useI18n()

  return (
    <main className="min-h-screen pb-20 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pt-32">
      <div className="section-inner flex flex-col gap-10">
        <nav>
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-amber-900 transition hover:text-amber-700"
          >
            <motion.span
              aria-hidden
              className="inline-block"
              whileHover={reduceMotion ? undefined : { x: -3 }}
              transition={{ duration: 0.2, ease: easeOut }}
            >
              ←
            </motion.span>
            {t('common.backHome')}
          </Link>
        </nav>
        <header className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="heading-display mt-2 text-4xl text-gradient-brand md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 text-lg leading-relaxed text-ink-muted">{subtitle}</p>}
        </header>
        {children}
      </div>
    </main>
  )
}
