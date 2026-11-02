// The official App Store and Google Play badges (BF funnel handoff 2026-10-26, item 2), black, English or French-Canadian.
// Jason 2026-10-28 ("太 AI 了" about the first look): store style, nothing invented — the badges as Apple and Google ship
// them, at least 40 px high (Apple's onscreen minimum, "legible but not dominant"), a quarter of their height of clear
// space, no rounding or glass of our own, and one short caption above them.
// A8 (Jason 11-01, base version 11-02: "徽章、二维码、Learn More、分享这些属于基础版本的"; design
// docs/2026-11-01-app-badges-desktop-1280.jpg, details docs/2026-11-02-tour-design/a8-look.css): desktop only, above the phone,
// right-aligned. A badge is a button: it opens that store's QR code to the left (168 px of code, "Scan to download Accuphy
// Sonar App", a pointer at the badges), closed by ×, a click outside, Esc or the same badge; the other badge swaps the store;
// never open together with the share popover. The code goes straight to the store's app page
// (links from 对接, docs/2026-11-01-app-qr-plan.md "11-01 改"): the App Store without a country, so an iPhone opens its own
// country's store; Google Play with utm_medium=qr in `referrer`. The App Store campaign parameter needs the provider token
// (Lab HQ list C8): none yet. A click still reports `app_badge` { store }, now meaning "opened the code". Phones show no badges.
import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import appStoreEn from './badges/app-store-en.svg'
import appStoreFr from './badges/app-store-fr.svg'
import playEn from './badges/google-play-en.png'
import playFr from './badges/google-play-fr.png'
import { labEvent } from './embed'
import { LANG, t } from './i18n'
import { qrSvgPath, onPopover, popoverOpened } from './ShareButton'

export const APP_STORE = `https://apps.apple.com/app/id6743123048${LANG === 'fr' ? '?l=fr-CA' : ''}`
export const PLAY = `https://play.google.com/store/apps/details?id=com.accuphy.sonar&hl=${LANG === 'fr' ? 'fr_CA' : 'en_CA'}&referrer=${encodeURIComponent('utm_source=accuphy-lab&utm_medium=qr')}`
const STORES = [
  { id: 'app_store', name: 'App Store', url: APP_STORE, img: LANG === 'fr' ? appStoreFr : appStoreEn, alt: 'Download on the App Store' },
  { id: 'google_play', name: 'Google Play', url: PLAY, img: LANG === 'fr' ? playFr : playEn, alt: 'Get it on Google Play' },
]

export default function AppBadges({ height = 40, caption = true, className = '', style }) {
  const [open, setOpen] = useState(null) // the store whose code is shown
  const wrap = useRef(null), pop = useRef(null), btns = useRef({})
  const id = useId()
  const close = () => setOpen(null)
  useEffect(() => onPopover(id, close), []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); btns.current[open]?.focus(); close() } }
    const onDown = (e) => { if (!wrap.current?.contains(e.target)) close() }
    document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onDown, true)
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onDown, true) }
  }, [open])
  const toggle = (s) => {
    if (open === s.id) { close(); return }
    setOpen(s.id); popoverOpened(id); labEvent('app_badge', { store: s.id })
  }
  const shown = STORES.find((s) => s.id === open)
  return (
    <span ref={wrap} className={`ac-badges-wrap ${className}`} style={style} onPointerDown={(e) => e.stopPropagation()}>
      {caption && <span className="ac-cap">{t('get_app')}</span>}
      <span className="ac-badges" style={{ '--h': `${height}px` }}>
        {STORES.map((s) => (
          <button key={s.id} ref={(el) => { btns.current[s.id] = el }} type="button" className="ac-badge-btn" aria-label={t('app_qr_open', { store: s.name })} aria-expanded={open === s.id} aria-controls={id} onClick={() => toggle(s)}>
            <img src={s.img} alt={s.alt} draggable={false} />
          </button>
        ))}
      </span>
      <AnimatePresence>
        {shown && (
          <motion.div ref={pop} key="pop" id={id} role="dialog" aria-modal="false" aria-label={shown.name} className="ac-app-pop"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <button type="button" className="ac-share-x" aria-label={t('share_close')} onClick={() => { btns.current[open]?.focus(); close() }}>×</button>
            <span className="ac-app-pop-store">{GLYPH[shown.id]}{shown.name}</span>
            <span className="ac-app-pop-qr"><QR text={shown.url} /></span>
            <p className="ac-app-pop-cap">{t('app_qr_caption')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
// the stores' glyphs, 13 px, white (the row above the code says which store it is)
const GLYPH = {
  app_store: <svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M11.2 8.5c0-1.6 1.3-2.3 1.4-2.4-.8-1.1-1.9-1.3-2.3-1.3-1-.1-1.9.6-2.4.6s-1.3-.6-2.1-.5c-1.1 0-2.1.6-2.6 1.6-1.1 1.9-.3 4.8.8 6.3.5.8 1.1 1.6 1.9 1.6.8 0 1-.5 2-.5s1.2.5 2 .5c.8 0 1.3-.8 1.8-1.5.6-.9.8-1.7.8-1.8 0 0-1.3-.6-1.3-2.6ZM9.6 3.8c.4-.5.7-1.2.6-1.9-.6 0-1.4.4-1.8.9-.4.4-.7 1.1-.6 1.8.7.1 1.4-.3 1.8-.8Z" /></svg>,
  google_play: <svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2.6 1.4 9.4 8l-6.8 6.6c-.3-.1-.5-.4-.5-.8V2.2c0-.4.2-.7.5-.8Zm7.6 7.4 1.7 1.7-7.4 4.2 5.7-5.9Zm2.6-2.7 2 1.1c.6.4.6 1.2 0 1.6l-2 1.1L11 8l1.8-1.9ZM4.5 1.3l7.4 4.2-1.7 1.7-5.7-5.9Z" /></svg>,
}
function QR({ text }) {
  const { n, d } = qrSvgPath(text)
  return <svg viewBox={`0 0 ${n} ${n}`} role="img" aria-label={t('qr_label')}><path d={d} fill="#000" /></svg>
}
