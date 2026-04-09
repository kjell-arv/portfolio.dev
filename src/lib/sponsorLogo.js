/**
 * Normalize logo URLs for sponsor cards: keeps #fragments (SVG sprites), supports
 * protocol-relative //, site-relative /, https upgrade for bare domains.
 * @param {string} input
 * @returns {string}
 */
export function normalizeLogoUrl(input) {
  let s = String(input || '').trim()
  if (!s) return ''
  if (s.startsWith('//')) s = `https:${s}`
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('/')) return s
  if (/^data:/i.test(s)) return s
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return s
  return `https://${s}`
}

/**
 * @typedef {{ kind: 'none' }} LogoNone
 * @typedef {{ kind: 'svgSprite', baseUrl: string, fragmentId: string }} LogoSprite
 * @typedef {{ kind: 'svgFile', src: string }} LogoSvgFile
 * @typedef {{ kind: 'svgData', src: string }} LogoSvgData
 * @typedef {{ kind: 'raster', src: string }} LogoRaster
 * @typedef {LogoNone | LogoSprite | LogoSvgFile | LogoSvgData | LogoRaster} ParsedSponsorLogo
 */

/**
 * Decide how to render a sponsor logo: SVG sprite (#id), flat SVG, data URI, or raster <img>.
 * @param {string} raw
 * @returns {ParsedSponsorLogo}
 */
export function parseSponsorLogoUrl(raw) {
  const src = normalizeLogoUrl(raw)
  if (!src) return { kind: 'none' }

  if (src.startsWith('data:')) {
    if (/^data:image\/svg/i.test(src)) return { kind: 'svgData', src }
    return { kind: 'raster', src }
  }

  const hashIdx = src.indexOf('#')
  const base = hashIdx >= 0 ? src.slice(0, hashIdx) : src
  const fragment = hashIdx >= 0 ? src.slice(hashIdx + 1) : ''
  const pathOnly = base.split('?')[0] || ''
  const isSvgPath = /\.svg$/i.test(pathOnly)

  if (isSvgPath && fragment) {
    return { kind: 'svgSprite', baseUrl: base, fragmentId: fragment }
  }
  if (isSvgPath) {
    return { kind: 'svgFile', src }
  }
  return { kind: 'raster', src }
}
