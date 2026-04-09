import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ScrollReveal from './ScrollReveal.jsx'
import { login, needsPasswordSetup } from '../lib/auth'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useSaveStatus } from './SaveStatusProvider.jsx'

export default function LoginPage() {
  const { t } = useI18n()
  const showSaveStatus = useSaveStatus()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (needsPasswordSetup()) {
      navigate('/setup', { replace: true })
    }
  }, [navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const ok = await login(username, password)
      if (!ok) {
        setError(t('auth.wrongPassword'))
        return
      }
      showSaveStatus('Signed in.', 'success')
      navigate('/dashboard')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-20 md:pt-32">
      <div className="section-inner">
        <ScrollReveal>
          <div className="mx-auto w-full max-w-lg card-surface p-6 sm:p-8">
            <p className="eyebrow">{t('auth.privateAccess')}</p>
            <h1 className="heading-display mt-2 text-3xl text-gradient-brand">{t('auth.loginTitle')}</h1>
            <p className="mt-3 text-sm text-ink-muted">{t('auth.loginIntro')}</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {t('auth.username')}
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {t('auth.password')}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  required
                />
              </label>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600 disabled:opacity-60"
              >
                {busy ? t('auth.signingIn') : t('auth.signIn')}
              </button>
              <p className="text-sm text-ink-muted">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="font-semibold text-amber-800 hover:underline">
                  {t('auth.signUp')}
                </Link>
              </p>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </main>
  )
}
