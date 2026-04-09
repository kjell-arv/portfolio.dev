import { useEffect, useState } from 'react'
import { parseSponsorLogoUrl } from '../lib/sponsorLogo.js'

const boxClass =
  'flex h-20 w-full items-center justify-center overflow-hidden [&_img]:max-h-16 [&_img]:max-w-[180px] [&_img]:object-contain [&_img]:opacity-90 [&_img]:transition-opacity group-hover:[&_img]:opacity-100 [&_svg]:max-h-16 [&_svg]:max-w-[180px] [&_svg]:opacity-90 [&_svg]:transition-opacity group-hover:[&_svg]:opacity-100'

const spriteSvgClass = 'h-full w-full max-h-16 max-w-[180px] shrink-0'

/**
 * Renders sponsor artwork: optional uploaded `logoDataUrl` first, then URL/sprite/svg; falls back to initials.
 */
export default function SponsorLogo({ logoUrl, logoDataUrl, initials }) {
  const parsed = parseSponsorLogoUrl(logoUrl)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [logoUrl, logoDataUrl])

  const uploaded =
    typeof logoDataUrl === 'string' && logoDataUrl.trim().startsWith('data:image/') ? logoDataUrl.trim() : ''

  if (uploaded) {
    if (failed) {
      return (
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/90 text-lg font-bold text-amber-900">
          {initials}
        </span>
      )
    }
    return (
      <span className={boxClass}>
        <img
          src={uploaded}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }

  if (parsed.kind === 'none' || failed) {
    return (
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/90 text-lg font-bold text-amber-900">
        {initials}
      </span>
    )
  }

  if (parsed.kind === 'svgSprite') {
    const href = `${parsed.baseUrl}#${parsed.fragmentId}`
    return (
      <span className={boxClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className={spriteSvgClass}
          aria-hidden
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
        >
          <use href={href} xlinkHref={href} />
        </svg>
      </span>
    )
  }

  const imgSrc = parsed.kind === 'svgFile' || parsed.kind === 'svgData' || parsed.kind === 'raster' ? parsed.src : ''

  return (
    <span className={boxClass}>
      <img
        src={imgSrc}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  )
}
