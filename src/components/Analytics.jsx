import { Helmet } from 'react-helmet-async'

/**
 * Privacy-friendly analytics: Plausible when `VITE_PLAUSIBLE_DOMAIN` is set (no cookies).
 */
export default function Analytics() {
  const domain = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_PLAUSIBLE_DOMAIN : ''
  if (!domain) return null

  return (
    <Helmet>
      <script defer data-domain={domain} src="https://plausible.io/js/script.js" />
    </Helmet>
  )
}
