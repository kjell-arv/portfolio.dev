import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, useReducedMotion } from 'framer-motion'
import { getDashboardContent, getSeedOverrides } from '../lib/contentStore'
import { findNewsEntryById } from '../lib/newsEntries'
import { useI18n } from '../i18n/I18nContext.jsx'
import { usePreviewMode } from '../lib/previewContext.jsx'
import { getResolvedBody, parseGallery } from '../lib/bodyLocale'
import { siteName, siteUrl } from '../seo/siteConfig'

const easeOut = [0.22, 1, 0.36, 1]

function splitBody(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .trim()
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function NewsEntryPage() {
  const { entryId } = useParams()
  const { t, locale } = useI18n()
  const preview = usePreviewMode()
  const reduceMotion = useReducedMotion()
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

  const entry = useMemo(
    () => findNewsEntryById(entryId, customItems, seedOverrides, { preview }),
    [entryId, customItems, seedOverrides, preview]
  )

  const sectionLabel = useMemo(() => {
    if (!entry) return t('news.newsFallback')
    if (entry.section === 'competitions') return t('news.sectionCompetitions')
    if (entry.section === 'stories') return t('news.sectionStories')
    if (entry.section === 'updates') return t('news.sectionUpdates')
    return t('news.newsFallback')
  }, [entry, t])

  if (!entryId) {
    return <Navigate to="/news" replace />
  }

  if (!entry) {
    return <Navigate to="/news" replace />
  }

  const bodyText = getResolvedBody(entry, locale)
  const paragraphs = splitBody(bodyText)
  const href = (entry.href || '').trim()
  const externalHref =
    href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:'))
  const gallery = parseGallery(entry)
  const canonical = `${siteUrl.replace(/\/$/, '')}/news/${entry.id}`
  const ogImage =
    entry.img && typeof entry.img === 'string' && entry.img.startsWith('http')
      ? entry.img
      : entry.img
        ? `${siteUrl.replace(/\/$/, '')}${entry.img}`
        : `${siteUrl.replace(/\/$/, '')}/vite.svg`

  const hasMeta = entry.placement || entry.raceTime || entry.discipline || entry.resultUrl

  return (
    <main className="min-h-screen pb-20 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pt-32">
      <Helmet>
        <title>{entry.title} · {siteName}</title>
        <meta name="description" content={(entry.excerpt || '').slice(0, 160)} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={entry.title} />
        <meta property="og:description" content={(entry.excerpt || '').slice(0, 200)} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="section-inner flex max-w-3xl flex-col gap-8">
        <nav>
          <Link
            to="/news"
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
            {t('news.backToNews')}
          </Link>
        </nav>

        {preview && (
          <div className="rounded-xl border border-amber-400/60 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-950">
            {t('news.previewBanner')}
          </div>
        )}

        <header>
          <p className="eyebrow">{sectionLabel}</p>
          <h1 className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">{entry.title}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            {entry.location || '—'}
            {entry.flag && (
              <img src={entry.flag} alt="" className="h-3.5 w-5 rounded-sm object-cover shadow-sm" />
            )}
          </p>
        </header>

        {hasMeta && (
          <div className="card-surface grid gap-3 p-5 sm:grid-cols-2">
            <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-amber-900/75">
              {t('news.metaTitle')}
            </p>
            {entry.placement && (
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">{t('news.placementLabel')}: </span>
                {entry.placement}
              </p>
            )}
            {entry.raceTime && (
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">{t('news.timeLabel')}: </span>
                {entry.raceTime}
              </p>
            )}
            {entry.discipline && (
              <p className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">{t('news.disciplineLabel')}: </span>
                {entry.discipline}
              </p>
            )}
            {entry.resultUrl && (
              <p className="sm:col-span-2">
                <a
                  href={entry.resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-amber-800 underline-offset-2 hover:underline"
                >
                  {t('news.openLink')} (results)
                </a>
              </p>
            )}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-card">
          {entry.img ? (
            <img
              src={entry.img}
              alt=""
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-amber-100 to-neutral-100 text-sm font-semibold text-ink-soft">
              {t('news.noImage')}
            </div>
          )}
          {entry.badge && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-sm shadow-md backdrop-blur-sm">
              {entry.badge}
            </span>
          )}
        </div>

        {gallery.length > 0 && (
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-amber-900/80">
              {t('news.galleryTitle')}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100">
                  <img src={src} alt="" className="aspect-[4/3] h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        <article className="space-y-5 text-[0.95rem] leading-relaxed text-ink-muted">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {externalHref && (
          <p>
            <a
              href={href}
              className="inline-flex items-center gap-1 text-sm font-bold text-amber-800 underline-offset-2 hover:underline"
              {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {t('news.openLink')} <span aria-hidden>→</span>
            </a>
          </p>
        )}

        <p className="text-sm text-ink-soft">
          <Link to="/" className="font-semibold text-amber-900 hover:underline">
            {t('news.home')}
          </Link>
          {' · '}
          <Link to="/news" className="font-semibold text-amber-900 hover:underline">
            {t('news.allNews')}
          </Link>
        </p>
      </div>
    </main>
  )
}
