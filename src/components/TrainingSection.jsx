import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import ScrollReveal from './ScrollReveal.jsx'
import { getTrainingPoints } from '../lib/trainingStore'
import { useI18n } from '../i18n/I18nContext.jsx'

const chartColors = {
  stroke: '#c2410c',
  fill: 'url(#trainingGradient)',
  grid: 'rgba(15, 23, 42, 0.06)',
}

export default function TrainingSection({ embedInPage = false }) {
  const { t } = useI18n()
  const [data, setData] = useState(() => getTrainingPoints())

  useEffect(() => {
    const sync = () => setData(getTrainingPoints())
    window.addEventListener('portfolio-training-updated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('portfolio-training-updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const maxH = Math.max(8, ...data.map((d) => d.hours), 1)

  const sectionClass = embedInPage
    ? 'relative py-8 md:py-12'
    : 'relative scroll-mt-[calc(3.125rem+env(safe-area-inset-top,0px)+0.5rem)] py-16 md:scroll-mt-32 md:py-24'

  return (
    <section
      id={embedInPage ? 'training-full' : 'training'}
      className={sectionClass}
    >
      {!embedInPage && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" aria-hidden />
      )}

      <div className="section-inner">
        {!embedInPage && (
          <ScrollReveal>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">{t('training.eyebrow')}</p>
                <h2 className="heading-display mt-2 text-3xl text-gradient-brand md:text-4xl">{t('training.title')}</h2>
                <p className="mt-3 text-base text-ink-muted">{t('training.intro')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-900">
                  {t('training.badgeDashboard')}
                </span>
                <Link
                  to="/training"
                  className="inline-flex items-center rounded-full border border-amber-300/90 bg-gradient-to-r from-amber-100/90 to-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-950 shadow-sm transition hover:border-amber-400 hover:shadow-md"
                >
                  {t('training.fullPage')} <span aria-hidden className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={embedInPage ? 0 : 0.06}>
          <div className="card-surface relative overflow-hidden p-6 sm:p-8 md:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl" aria-hidden />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-200/20 blur-3xl" aria-hidden />

            <div className="relative">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-semibold text-ink">{t('training.hoursPerPeriod')}</h3>
                <p className="text-sm text-ink-muted">
                  {t('training.peakInView')}{' '}
                  <span className="font-semibold text-amber-900">
                    {maxH.toFixed(0)} {t('training.hoursUnit')}
                  </span>
                </p>
              </div>

              <div className="h-[min(320px,55vw)] w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trainingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, Math.ceil(maxH * 1.15)]}
                      width={36}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgb(254 243 199)',
                        boxShadow: '0 10px 40px -12px rgb(0 0 0 / 0.15)',
                      }}
                      labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                      formatter={(value) => [
                        `${Number(value).toFixed(1)} ${t('training.hoursUnit')}`,
                        t('training.chartSeries'),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke={chartColors.stroke}
                      strokeWidth={2.5}
                      fill={chartColors.fill}
                      dot={{ r: 4, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-6 text-center text-xs leading-relaxed text-ink-soft">{t('training.stravaNote')}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
