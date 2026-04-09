import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import ScrollReveal from './ScrollReveal.jsx'
import { getDashboardContent, getSeedOverrides } from '../lib/contentStore'
import { getMergedNewsLists } from '../lib/newsEntries'
import { useI18n } from '../i18n/I18nContext.jsx'
import { usePreviewMode } from '../lib/previewContext.jsx'

const easeOut = [0.22, 1, 0.36, 1]

export default function News({ hideIntro = false, embedded = false }) {
  const reduceMotion = useReducedMotion()
  const { t } = useI18n()
  const preview = usePreviewMode()
  const [orderTick, setOrderTick] = useState(0)
  const [customItems, setCustomItems] = useState(getDashboardContent())
  const [seedOverrides, setSeedOverrides] = useState(getSeedOverrides())

  useEffect(() => {
    const sync = () => {
      setCustomItems(getDashboardContent())
      setSeedOverrides(getSeedOverrides())
    }
    window.addEventListener('portfolio-content-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('portfolio-content-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const bump = () => setOrderTick((x) => x + 1)
    window.addEventListener('portfolio-news-order-updated', bump)
    return () => window.removeEventListener('portfolio-news-order-updated', bump)
  }, [])

  const { mergedCompetitions, mergedStories, mergedUpdates } = useMemo(
    () => getMergedNewsLists(customItems, seedOverrides, { preview }),
    [customItems, seedOverrides, preview, orderTick]
  )

  const renderCard = (item, delay) => (
    <ScrollReveal key={item.id} delay={delay}>
      <Link
        to={`/news/${item.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 shadow-card transition duration-300 hover:-translate-y-1 hover:border-amber-200/60 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {item.img ? (
            <img
              src={item.img}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-neutral-100 text-sm font-semibold text-ink-soft">
              {t('news.dashboardEntry')}
            </div>
          )}
          {item.badge && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-sm shadow-md backdrop-blur-sm">
              {item.badge}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">{item.title}</h3>
          <p className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {item.location || t('news.noLocation')}
            {item.flag && <img src={item.flag} alt="" className="h-3.5 w-5 rounded-sm object-cover shadow-sm" />}
          </p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-4">{item.excerpt}</p>
          <motion.span
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-amber-800"
            whileHover={reduceMotion ? undefined : { x: 4 }}
            transition={{ duration: 0.2, ease: easeOut }}
          >
            {t('news.readMore')} <span aria-hidden>→</span>
          </motion.span>
        </div>
      </Link>
    </ScrollReveal>
  )

  const sectionClass = embedded
    ? 'scroll-mt-[calc(3.125rem+env(safe-area-inset-top,0px)+0.5rem)] py-8 md:scroll-mt-32 md:py-12'
    : 'scroll-mt-[calc(3.125rem+env(safe-area-inset-top,0px)+0.5rem)] py-16 md:scroll-mt-32 md:py-24'

  return (
    <section id={embedded ? 'news-full' : 'news'} className={sectionClass}>
      <div className="section-inner">
        {!hideIntro && (
          <ScrollReveal>
            <div className="mb-12 text-center sm:text-left">
              <p className="eyebrow">{t('news.eyebrow')}</p>
              <h2 id="newsh1" className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">
                {t('news.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-ink-muted sm:mx-0">{t('news.subtitle')}</p>
              <p className="mt-4">
                <Link
                  to="/news"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-900 transition hover:text-amber-950"
                >
                  {t('news.fullPage')} <span aria-hidden>→</span>
                </Link>
              </p>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={hideIntro ? 0 : 0.04}>
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-900/80">
            {t('news.competitions')}
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {mergedCompetitions.map((item, i) => renderCard(item, 0.05 + i * 0.06))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <h3 className="mt-16 font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-900/80">
            {t('news.behind')}
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {mergedStories.map((item, i) => renderCard(item, 0.04 + i * 0.06))}
          </div>
        </ScrollReveal>

        {mergedUpdates.length > 0 && (
          <ScrollReveal delay={0.1}>
            <h3 className="mt-16 font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-900/80">
              {t('news.updates')}
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {mergedUpdates.map((item, i) => renderCard(item, 0.04 + i * 0.06))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
