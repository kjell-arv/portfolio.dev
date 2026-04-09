import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './header.css'
import { isAuthenticated, needsPasswordSetup } from '../lib/auth'
import { useI18n } from '../i18n/I18nContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

const navLinkClass =
  'font-display text-sm font-semibold text-ink/90 transition-colors hover:text-amber-800 md:text-[0.95rem]'

export default function Header() {
  const { t } = useI18n()
  const [showMenu, setShowMenu] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isAuthenticated())

  const ownerHref = loggedIn ? '/dashboard' : needsPasswordSetup() ? '/setup' : '/login'
  const ownerLabel = loggedIn
    ? t('header.dashboard')
    : needsPasswordSetup()
      ? t('header.setup')
      : t('header.login')

  const toggleMenu = () => {
    setShowMenu((prev) => !prev)
  }

  useEffect(() => {
    const setMenuHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setMenuHeight()
    window.addEventListener('resize', setMenuHeight)
    window.addEventListener('orientationchange', setMenuHeight)
    return () => {
      window.removeEventListener('resize', setMenuHeight)
      window.removeEventListener('orientationchange', setMenuHeight)
    }
  }, [])

  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showMenu])

  useEffect(() => {
    const syncAuth = () => setLoggedIn(isAuthenticated())
    window.addEventListener('portfolio-auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('portfolio-auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const closeMenu = () => {
    setShowMenu(false)
  }

  return (
    <header className="headersec flex center justify-center w-screen fixed top-0 left-0 z-50 border-b border-neutral-200/80 bg-gray-100/85 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-gray-100/75">
      <div className="headerdiv mx-auto w-full max-w-6xl px-4 font-bold sm:px-6 lg:px-8">
        <div className="div1 flex items-center justify-between gap-4">
          <div className="namediv h-full flex items-center">
            <Link
              to="/"
              className="contacth1 font-display text-xl font-bold tracking-tight text-ink select-none md:text-2xl"
              onClick={closeMenu}
            >
              KAB
            </Link>
            <div
              className={`menutoggle ${showMenu ? 'active' : ''}`}
              onClick={toggleMenu}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleMenu()
              }}
              aria-label={t('header.openMenu')}
            >
              <svg className="burger-icon" width="30" height="30" viewBox="0 0 100 80" aria-hidden>
                <rect className="line top" width="100" height="15" rx="10"></rect>
                <rect className="line middle" y="30" width="100" height="15" rx="10"></rect>
                <rect className="line bottom" y="60" width="100" height="15" rx="10"></rect>
              </svg>
            </div>
          </div>
          {showMenu && (
            <div className="responsivediv">
              <nav className="menu flex flex-col gap-6 pl-12 pt-8 mb-8" aria-label={t('header.menu')}>
                <ul className="flex flex-col gap-6">
                  <li>
                    <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">
                      {t('header.menu')}
                    </h2>
                  </li>
                  <li className="ml-8">
                    <LanguageSwitcher />
                  </li>
                  <li>
                    <Link to="/" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.home')}
                    </Link>
                  </li>
                  <li>
                    <a href="/#about" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.aboutMe')}
                    </a>
                  </li>
                  <li>
                    <a href="/#training" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.training')}
                    </a>
                  </li>
                  <li>
                    <a href="/#news" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.news')}
                    </a>
                  </li>
                  <li>
                    <Link to="/about-me" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.achievements')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/sponsors" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.sponsorCta')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/connect" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('connectPage.title')}
                    </Link>
                  </li>
                  <li>
                    <a href="/#newsletter" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {t('header.newsletter')}
                    </a>
                  </li>
                  <li>
                    {loggedIn && (
                      <Link to="/profile" className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                        {t('header.profile')}
                      </Link>
                    )}
                  </li>
                  <li>
                    <Link to={ownerHref} className={`${navLinkClass} ml-8`} onClick={closeMenu}>
                      {ownerLabel}
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <ul className="ulist hidden lg:flex items-center gap-6 xl:gap-8">
            <li>
              <a href="/#about" className={navLinkClass}>
                {t('header.about')}
              </a>
            </li>
            <li>
              <a href="/#training" className={navLinkClass}>
                {t('header.training')}
              </a>
            </li>
            <li>
              <a href="/#news" className={navLinkClass}>
                {t('header.news')}
              </a>
            </li>
            <li>
              <Link to="/about-me" className={navLinkClass}>
                {t('header.achievements')}
              </Link>
            </li>
            <li>
              <Link to="/sponsors" className={navLinkClass}>
                {t('header.sponsorCta')}
              </Link>
            </li>
            <li>
              <Link to="/connect" className={navLinkClass}>
                {t('connectPage.title')}
              </Link>
            </li>
            {loggedIn && (
              <li>
                <Link to="/profile" className={navLinkClass}>
                  {t('header.profile')}
                </Link>
              </li>
            )}
            <li>
              <Link to={ownerHref} className={navLinkClass}>
                {ownerLabel}
              </Link>
            </li>
          </ul>
          <div className="subbuttondiv flex flex-wrap items-center justify-end gap-2">
            <LanguageSwitcher />
            <a
              href="/#newsletter"
              className="subscribe-button inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
            >
              {t('header.subscribe')}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
