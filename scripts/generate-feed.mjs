/**
 * Generates static RSS and JSON feeds from seed content (build-time).
 * Dashboard-only entries are not included until you extend this script to read a build artifact.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const { seedCompetitions, seedStories } = await import('../src/lib/seedContent.js')

const siteName = 'Kjell Arved Brandt'
const baseUrl = (process.env.VITE_SITE_URL || 'https://kjell-arved-brandt.de').replace(/\/$/, '')
const items = [...seedCompetitions, ...seedStories].map((e) => ({
  title: e.title,
  link: `${baseUrl}/news/${e.id}`,
  description: (e.excerpt || '').replace(/</g, '&lt;'),
  pubDate: new Date().toUTCString(),
  id: e.id,
}))

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} — News</title>
    <link>${baseUrl}/</link>
    <description>Competitions, camps, and updates.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map(
        (it) => `
    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${it.link}</link>
      <guid isPermaLink="true">${it.link}</guid>
      <pubDate>${it.pubDate}</pubDate>
      <description>${escapeXml(it.description)}</description>
    </item>`
      )
      .join('')}
  </channel>
</rss>
`

const jsonFeed = {
  version: 'https://jsonfeed.org/version/1.1',
  title: `${siteName} — News`,
  home_page_url: `${baseUrl}/`,
  feed_url: `${baseUrl}/news.json`,
  items: items.map((it) => ({
    id: it.id,
    url: it.link,
    title: it.title,
    content_text: it.description,
    date_published: new Date().toISOString(),
  })),
}

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public/rss.xml'), rss, 'utf8')
writeFileSync(join(root, 'public/news.json'), JSON.stringify(jsonFeed, null, 2), 'utf8')
console.log('Wrote public/rss.xml and public/news.json')

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
