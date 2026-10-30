// Trial of real refraction on the three step cards (Jason 2026-10-30, docs/2026-10-30-panel-redesign-brief.md): ?glass=shu or ?glass=rdev.
// Without the parameter, and in Safari and Firefox (SVG filters in backdrop-filter are Chromium only), the cards keep their frost.
// shu: the displacement filter straight in backdrop-filter, after shuding/liquid-glass. rdev: a blurred backdrop with an edge-only filter
// and colour fringes, after rdev/liquid-glass-react. Both MIT (assets/LICENSES.md); the map is re-derived for a rectangular card.
import { useEffect, useId, useRef } from 'react'

export const GLASS = (() => {
  try {
    const m = /[?&]glass=(shu|rdev)\b/.exec(window.location.search)
    const chromium = /Chrom(e|ium)\//.test(navigator.userAgent) && !/\bFirefox\//.test(navigator.userAgent)
    return m && chromium ? m[1] : null
  } catch { return null }
})()

const smooth = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x) }

// R, G = how far to sample, 0.5 = stay: strongest at the rim, nothing in the middle
function edgeMap(w, h, band) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const ctx = c.getContext('2d'), img = ctx.createImageData(w, h)
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
    const px = x + 0.5 - w / 2, py = y + 0.5 - h / 2
    const inset = Math.min(w / 2 - Math.abs(px), h / 2 - Math.abs(py))
    const k = 1 - smooth(0, band, inset)
    img.data[i] = 127.5 + 127.5 * k * (px / (w / 2)); img.data[i + 1] = 127.5 + 127.5 * k * (py / (h / 2)); img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

export default function GlassLayer({ kind }) {
  const id = useId().replace(/\W/g, ''), box = useRef(null), image = useRef(null), filter = useRef(null)
  useEffect(() => {
    const el = box.current
    const fit = () => {
      const w = Math.max(2, Math.round(el.clientWidth)), h = Math.max(2, Math.round(el.clientHeight))
      for (const n of [filter.current, image.current]) { n.setAttribute('width', w); n.setAttribute('height', h) }
      image.current.setAttribute('href', edgeMap(w, h, 26))
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = kind === 'rdev' ? -46 : -34
  return (
    <span ref={box} className="ac-glass-layer" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter ref={filter} id={id} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" colorInterpolationFilters="sRGB">
          <feImage ref={image} x="0" y="0" preserveAspectRatio="none" result="map" />
          {kind === 'shu' ? <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" /> : <>
            <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result="r" />
            <feColorMatrix in="r" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="R" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * 0.94} xChannelSelector="R" yChannelSelector="G" result="g" />
            <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="G" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={scale * 0.88} xChannelSelector="R" yChannelSelector="G" result="b" />
            <feColorMatrix in="b" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="B" />
            <feBlend in="G" in2="B" mode="screen" result="GB" /><feBlend in="R" in2="GB" mode="screen" />
          </>}
        </filter>
      </svg>
      {kind === 'shu'
        ? <span className="ac-glass-fill" style={{ WebkitBackdropFilter: 'none', backdropFilter: `url(#${id}) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1)` }} />
        : <span className="ac-glass-fill" style={{ WebkitBackdropFilter: 'blur(5px) saturate(150%)', backdropFilter: 'blur(5px) saturate(150%)', filter: `url(#${id})` }} />}
    </span>
  )
}
