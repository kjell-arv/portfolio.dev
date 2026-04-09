import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollReveal from './ScrollReveal.jsx'
import { getCurrentUser } from '../lib/auth'
import { getProfile, saveProfile } from '../lib/profileStore'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useSaveStatus } from './SaveStatusProvider.jsx'

export default function ProfilePage() {
  const { t } = useI18n()
  const showSaveStatus = useSaveStatus()
  const user = getCurrentUser()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (!user?.username) return
    const p = getProfile(user.username)
    setDisplayName(p.displayName || '')
    setBio(p.bio || '')
  }, [user?.username])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!user?.username) return
    saveProfile(user.username, { displayName, bio })
    showSaveStatus(t('auth.saved'), 'success')
  }

  if (!user) {
    return (
      <main className="min-h-screen pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-20 md:pt-32">
        <div className="section-inner">
          <p className="text-sm text-ink-muted">{t('auth.signInToView')}</p>
          <Link to="/login" className="mt-2 inline-block font-semibold text-amber-800 hover:underline">
            {t('auth.signIn')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-20 md:pt-32">
      <div className="section-inner">
        <ScrollReveal>
          <div className="mx-auto w-full max-w-lg card-surface p-6 sm:p-8">
            <p className="eyebrow">{t('auth.profileEyebrow')}</p>
            <h1 className="heading-display mt-2 text-3xl text-gradient-brand">{t('auth.profileTitle')}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              {t('auth.profileRole')} <span className="font-semibold text-ink">{user.username}</span> · {t('auth.roleLabel')}{' '}
              <span className="font-semibold text-ink">{user.role}</span>
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {t('auth.displayName')}
                </span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder={t('auth.displayPlaceholder')}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{t('auth.bio')}</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  placeholder={t('auth.bioPlaceholder')}
                />
              </label>
              <button
                type="submit"
                className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
              >
                {t('auth.saveProfile')}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </main>
  )
}
