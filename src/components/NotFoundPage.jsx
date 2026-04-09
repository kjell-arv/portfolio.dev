import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { siteName } from '../seo/siteConfig'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen pb-24 pt-[calc(6rem+env(safe-area-inset-top,0px))] md:pt-36">
      <Helmet>
        <title>404 · {siteName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="section-inner">
        <div className="mx-auto max-w-lg text-center">
          <p className="eyebrow">404</p>
          <h1 className="heading-display mt-3 text-4xl text-gradient-brand md:text-5xl">Page not found</h1>
          <p className="mt-4 text-ink-muted">
            This URL doesn&apos;t exist or was moved. Head back to the homepage or open a section below.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-600"
            >
              Home
            </Link>
            <Link
              to="/news"
              className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-amber-400"
            >
              News
            </Link>
            <Link
              to="/connect"
              className="inline-flex rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-amber-400"
            >
              Connect
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
