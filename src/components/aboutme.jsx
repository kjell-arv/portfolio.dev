import JEMPic from './img/JEM_p1.jpg'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import ScrollReveal from './ScrollReveal.jsx'
import { useI18n } from '../i18n/I18nContext.jsx'

const easeOut = [0.22, 1, 0.36, 1]

export default function AboutMe() {
  const reduceMotion = useReducedMotion()
  const { achievements, t } = useI18n()

  return (
    <section
      id="about"
      className="relative scroll-mt-[calc(3.125rem+env(safe-area-inset-top,0px)+0.5rem)] py-16 md:scroll-mt-32 md:py-24"
    >
      <div className="section-inner">
        <ScrollReveal>
          <div className="relative mb-12 max-w-2xl">
            <div
              className="pointer-events-none absolute -left-4 top-0 h-24 w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-200/40"
              aria-hidden
            />
            <p className="eyebrow">{t('about.eyebrow')}</p>
            <h2 className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">{t('about.title')}</h2>
            <p className="mt-3 text-base text-ink-muted">{t('about.subtitle')}</p>
          </div>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
          <div className="flex min-w-0 flex-col gap-8">
            <ScrollReveal delay={0.05}>
              <article className="card-surface p-6 sm:p-8">
                <h3 className="font-display text-lg font-semibold text-ink">{t('about.whoTitle')}</h3>
                <p className="mt-4 text-justify text-[0.95rem] leading-relaxed text-ink-muted">
                  {t('about.whoBody')}{' '}
                  <Link
                    to="/background"
                    className="font-semibold text-amber-800 underline-offset-2 hover:underline"
                  >
                    {t('about.readMore')}
                  </Link>
                </p>
              </article>
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2">
              <ScrollReveal delay={0.08}>
                <article className="card-surface flex h-full flex-col p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {t('about.achievementsTitle')} <span className="text-xl">&#127942;</span>
                  </h3>
                  <ul className="mt-4 flex flex-1 flex-col gap-3 text-sm text-ink-muted">
                    {achievements.highlights.slice(0, 4).map((a) => (
                      <li key={a.text} className="flex gap-2.5">
                        <span className="text-lg leading-none" aria-hidden>
                          {a.icon}
                        </span>
                        <span className="leading-snug">{a.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/about-me"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-amber-800 transition hover:text-amber-950"
                  >
                    {t('about.fullList')} <span aria-hidden>→</span>
                  </Link>
                </article>
              </ScrollReveal>

              <ScrollReveal delay={0.12}>
                <article className="card-surface flex h-full flex-col p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {t('about.goalsTitle')} <span className="text-xl">&#127919;</span>
                  </h3>
                  <div className="mt-4 space-y-4 text-sm text-ink-muted">
                    <div>
                      <p className="font-display text-xs font-bold uppercase tracking-wide text-ink">2024–2025</p>
                      <p className="mt-1">{t('about.goal2025')}</p>
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold uppercase tracking-wide text-ink">2026–2027</p>
                      <p className="mt-1">{t('about.goal2027')}</p>
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold uppercase tracking-wide text-ink">2028</p>
                      <p className="mt-1">
                        <span className="text-lg">&#129351;</span> {t('about.goal2028')}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/training"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-amber-800 transition hover:text-amber-950"
                  >
                    {t('about.howTrain')} <span aria-hidden>→</span>
                  </Link>
                </article>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal delay={0.06}>
            <div className="card-surface overflow-hidden p-2 lg:sticky lg:top-28">
              <motion.img
                src={JEMPic}
                alt={t('about.imgAlt')}
                className="aspect-[4/5] w-full rounded-[1.25rem] object-cover object-center"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.35, ease: easeOut }}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
