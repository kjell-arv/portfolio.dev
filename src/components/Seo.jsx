import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { defaultOgImage, siteName, siteTagline, siteUrl } from '../seo/siteConfig'

const ROUTES = {
  '/': { title: siteName, description: `${siteTagline} — Race updates, training, and results.` },
  '/about-me': { title: `Achievements · ${siteName}`, description: 'National and international triathlon results and milestones.' },
  '/athlete': { title: `Athlete profile · ${siteName}`, description: 'Background, racing for Germany, and quick links.' },
  '/background': { title: `About · ${siteName}`, description: 'From swimming to triathlon — extended background.' },
  '/training': { title: `Training · ${siteName}`, description: 'Weekly training volume chart and methodology.' },
  '/news': { title: `News & stories · ${siteName}`, description: 'Competitions, camps, and season updates.' },
  '/connect': { title: `Connect · ${siteName}`, description: 'Newsletter and social channels.' },
  '/sponsors': { title: `Sponsors · ${siteName}`, description: 'Partners and sponsors supporting the journey.' },
  '/tech': { title: `Tech · ${siteName}`, description: 'Secondary site and developer portfolio promo.' },
  '/login': { title: `Login · ${siteName}`, description: 'Owner access.' },
  '/signup': { title: `Sign up · ${siteName}`, description: 'Create account.' },
  '/setup': { title: `Setup · ${siteName}`, description: 'One-time owner password setup.' },
  '/dashboard': { title: `Dashboard · ${siteName}`, description: 'Content and site management.' },
  '/profile': { title: `Profile · ${siteName}`, description: 'Account profile.' },
}

export default function Seo() {
  const { pathname } = useLocation()
  const base = ROUTES[pathname] || {
    title: `${siteName}`,
    description: siteTagline,
  }
  const isNewsEntry = pathname.startsWith('/news/') && pathname !== '/news'
  const title = isNewsEntry ? `Article · ${siteName}` : base.title
  const description = base.description
  const canonical = `${siteUrl.replace(/\/$/, '')}${pathname}`
  const ogImage = `${siteUrl.replace(/\/$/, '')}${defaultOgImage}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <link rel="alternate" type="application/rss+xml" title="RSS" href={`${siteUrl.replace(/\/$/, '')}/rss.xml`} />
      <link rel="alternate" type="application/json" title="JSON Feed" href={`${siteUrl.replace(/\/$/, '')}/news.json`} />
    </Helmet>
  )
}
