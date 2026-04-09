import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import ScrollReveal from './ScrollReveal.jsx'
import TechPortfolioBox from './TechPortfolioBox.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'
import { CONTACT_EMAIL } from '../lib/contact.js'
import portrait from './img/IMG_2117.jpg'
import instalogo from './img/insta.png'
import ytlogo from './img/yt.png'
import wwwlogo from './img/www.png'

const easeOut = [0.22, 1, 0.36, 1]

const socialKeys = [
  { href: 'https://www.instagram.com/kjell_arv/', icon: instalogo, label: 'Instagram', handle: '@kjell_arv' },
  { href: 'https://www.youtube.com/', icon: ytlogo, label: 'YouTube', handle: 'Channel' },
  { href: 'https://www.kjell-arved-brandt.de', icon: wwwlogo, label: 'Website', handle: 'kjell-arved-brandt.de' },
]

function Hero() {
  const reduceMotion = useReducedMotion()
  const { t } = useI18n()

  const tags = [t('hero.tagSwim'), t('hero.tagBike'), t('hero.tagRun'), t('hero.tagGermany')]

  return (
    <section id="hero" className="relative overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0 bg-[length:48px_48px] bg-grid-faint opacity-[0.45]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,28rem)] bg-gradient-to-b from-amber-100/50 via-transparent to-transparent" aria-hidden />

      <div className="section-inner relative pt-[calc(4.75rem+env(safe-area-inset-top,0px))] pb-16 md:pb-24 md:pt-[calc(7rem+env(safe-area-inset-top,0px))]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="eyebrow">{t('hero.eyebrow')}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{t('hero.tagline')}</p>
            <p className="mt-2">
              <Link
                to="/athlete"
                className="text-sm font-semibold text-amber-900 underline-offset-2 transition hover:underline"
              >
                {t('hero.athleteProfile')}
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <motion.a
              id="newsletter"
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Newsletter signup')}`}
              className="group inline-flex flex-col gap-0.5 rounded-2xl border border-amber-300/90 bg-gradient-to-br from-amber-100 to-amber-50 px-5 py-3.5 text-left shadow-md transition-all hover:border-amber-400 hover:shadow-lg"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            >
              <span className="text-sm font-bold text-ink">{t('hero.newsletter')}</span>
              <span className="text-xs font-medium text-ink-muted">{t('hero.newsletterSub')}</span>
            </motion.a>
            <Link to="/connect" className="text-xs font-semibold text-amber-900/90 underline-offset-2 hover:underline">
              {t('hero.connectWays')}
            </Link>
          </div>
        </motion.div>

        <ScrollReveal delay={0.04}>
          <div className="card-surface grid overflow-hidden lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-0">
            <div className="relative flex justify-center bg-gradient-to-br from-amber-50/80 to-neutral-100/50 p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_55%)]" aria-hidden />
              <motion.div
                className="relative"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: easeOut }}
              >
                <img
                  src={portrait}
                  alt="Kjell Arved Brandt"
                  className="h-56 w-56 rounded-[2rem] border-4 border-white object-cover shadow-lift sm:h-64 sm:w-64 sm:rounded-[2.25rem]"
                />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                  U23
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
              <div>
                <h1 className="heading-display text-[clamp(1.85rem,5vw,2.75rem)] leading-[1.1] text-gradient-brand">
                  Kjell Arved Brandt
                </h1>
                <p className="mt-3 text-sm font-semibold italic text-amber-900/85">
                  &quot;Vom Becken an die Weltspitze&quot; <span className="not-italic">&#129351;</span>
                </p>
              </div>
              <p className="max-w-xl text-base leading-relaxed text-ink-muted">{t('hero.intro')}</p>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-200/90 bg-white/80 px-3 py-1 text-xs font-semibold text-ink-muted shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
                <Link
                  to="/training"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/90 bg-gradient-to-r from-amber-100/90 to-amber-50/90 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm transition hover:border-amber-400 hover:shadow-md"
                >
                  <span aria-hidden>📈</span> {t('hero.trainingLoad')}
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <TechPortfolioBox />

        <ScrollReveal delay={0.1} className="mt-10">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-card backdrop-blur-sm md:p-6">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">{t('hero.followAlong')}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium text-ink-soft">{t('hero.followSub')}</p>
                <Link to="/connect" className="text-xs font-semibold text-amber-900 underline-offset-2 hover:underline">
                  {t('hero.connectPage')}
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {socialKeys.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-[52px] items-center gap-3 rounded-xl border border-neutral-200/80 bg-surface-muted/80 px-4 py-3 transition hover:border-amber-300/80 hover:bg-amber-50/80"
                >
                  <img src={item.icon} alt="" className="h-6 w-6 object-contain opacity-90" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{item.label}</p>
                    <p className="truncate text-sm font-semibold text-ink group-hover:text-amber-900">{item.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Hero
