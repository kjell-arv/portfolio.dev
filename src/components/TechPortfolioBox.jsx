import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import ScrollReveal from './ScrollReveal.jsx'
import { getTechPortfolioConfig } from '../lib/techPortfolioStore'
import { useI18n } from '../i18n/I18nContext.jsx'

const easeOut = [0.22, 1, 0.36, 1]

export default function TechPortfolioBox() {
  const reduceMotion = useReducedMotion()
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

  if (!cfg.enabled || !cfg.url) return null

  const href = cfg.url.startsWith('http') ? cfg.url : `https://${cfg.url}`

  return (
    <ScrollReveal delay={0.07} className="mt-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
        <motion.a
          href={href}
          target={cfg.openInNewTab ? '_blank' : undefined}
          rel={cfg.openInNewTab ? 'noreferrer noopener' : undefined}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-left shadow-lg shadow-slate-900/20 ring-1 ring-white/10 transition hover:border-emerald-500/40 hover:shadow-emerald-500/10 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6"
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl"
            aria-hidden
          />
          <div className="relative min-w-0 flex-1">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
              {t('hero.techAlsoPublishing')}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-white md:text-xl">{cfg.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{cfg.blurb}</p>
          </div>
          <div className="relative mt-4 flex shrink-0 items-center md:mt-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2.5 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/30 transition group-hover:bg-emerald-500/25">
              {t('hero.techVisitSite')}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </motion.a>
        <Link
          to="/tech"
          className="flex shrink-0 items-center justify-center rounded-2xl border border-slate-600/40 bg-slate-800/80 px-5 py-4 text-sm font-bold text-emerald-300/95 shadow-md ring-1 ring-white/5 transition hover:border-emerald-500/35 hover:bg-slate-800 md:w-40"
        >
          {t('hero.techMoreSite')}
        </Link>
      </div>
    </ScrollReveal>
  )
}
