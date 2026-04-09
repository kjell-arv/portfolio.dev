import { Helmet } from 'react-helmet-async'
import { siteName, siteTagline, siteUrl } from '../seo/siteConfig'

export default function JsonLd() {
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: siteName,
      description: siteTagline,
      url: siteUrl,
      jobTitle: 'Athlete',
      nationality: { '@type': 'Country', name: 'Germany' },
      homeLocation: { '@type': 'Place', name: 'Berlin, Germany' },
      sameAs: ['https://www.instagram.com/kjell_arv/'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
      description: siteTagline,
      inLanguage: ['en', 'de'],
    },
  ]

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(graph)}</script>
    </Helmet>
  )
}
