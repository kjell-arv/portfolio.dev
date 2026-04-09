import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/header'
import Hero from './components/hero'
import AboutMe from './components/aboutme.jsx'
import News from './components/news.jsx'
import HashScroll from './components/HashScroll.jsx'
import Seo from './components/Seo.jsx'
import JsonLd from './components/JsonLd.jsx'
import Analytics from './components/Analytics.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'
import { SaveStatusProvider } from './components/SaveStatusProvider.jsx'
import { PreviewProvider } from './lib/previewContext.jsx'

const TrainingSection = lazy(() => import('./components/TrainingSection.jsx'))
const RaceCalendarSection = lazy(() => import('./components/RaceCalendarSection.jsx'))
const SponsorsSection = lazy(() => import('./components/SponsorsSection.jsx'))
import AboutMePage from './components/AboutMePage.jsx'
import LoginPage from './components/LoginPage.jsx'
import SignupPage from './components/SignupPage.jsx'
import SetupPage from './components/SetupPage.jsx'
import DashboardPage from './components/DashboardPage.jsx'
import ProfilePage from './components/ProfilePage.jsx'
import AthletePage from './components/AthletePage.jsx'
import BackgroundPage from './components/BackgroundPage.jsx'
import TrainingDetailPage from './components/TrainingDetailPage.jsx'
import NewsDetailPage from './components/NewsDetailPage.jsx'
import NewsEntryPage from './components/NewsEntryPage.jsx'
import ConnectPage from './components/ConnectPage.jsx'
import SponsorsPage from './components/SponsorsPage.jsx'
import TechPortfolioPage from './components/TechPortfolioPage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import { getHomepageLayout } from './lib/layoutStore'

function App() {
  const [layout, setLayout] = useState(getHomepageLayout())

  useEffect(() => {
    const syncLayout = () => setLayout(getHomepageLayout())
    window.addEventListener('portfolio-layout-updated', syncLayout)
    window.addEventListener('storage', syncLayout)
    return () => {
      window.removeEventListener('portfolio-layout-updated', syncLayout)
      window.removeEventListener('storage', syncLayout)
    }
  }, [])

  const homepageSections = useMemo(
    () => ({
      hero: <Hero />,
      about: <AboutMe />,
      sponsors: (
        <Suspense
          fallback={
            <section className="py-16">
              <div className="section-inner text-center text-sm text-ink-muted">Loading sponsors…</div>
            </section>
          }
        >
          <SponsorsSection />
        </Suspense>
      ),
      training: (
        <Suspense
          fallback={
            <section className="py-20">
              <div className="section-inner text-center text-sm text-ink-muted">Loading training chart…</div>
            </section>
          }
        >
          <TrainingSection />
        </Suspense>
      ),
      calendar: (
        <Suspense
          fallback={
            <section className="py-16">
              <div className="section-inner text-center text-sm text-ink-muted">Loading calendar…</div>
            </section>
          }
        >
          <RaceCalendarSection />
        </Suspense>
      ),
      news: <News />,
    }),
    []
  )

  return (
    <Router>
      <SaveStatusProvider>
        <PreviewProvider>
          <HashScroll />
          <Seo />
          <JsonLd />
          <Analytics />
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <main className="min-h-screen pb-8">
                  {layout.order.map((id) => (layout.hidden[id] ? null : homepageSections[id]))}
                </main>
              }
            />
            <Route path="/about-me" element={<AboutMePage />} />
            <Route path="/athlete" element={<AthletePage />} />
            <Route path="/background" element={<BackgroundPage />} />
            <Route path="/training" element={<TrainingDetailPage />} />
            <Route path="/news/:entryId" element={<NewsEntryPage />} />
            <Route path="/news" element={<NewsDetailPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/tech" element={<TechPortfolioPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PreviewProvider>
      </SaveStatusProvider>
    </Router>
  )
}

export default App
