// "Send to a friend" (BF funnel handoff 2026-10-26, item 1; redone #188, Jason 2026-10-29 in Lab HQ: "开搞 要做到丝滑 顺畅 无误 的").
// A click opens a small popover in the store style — a QR code of the share link, the link in a read-only field, "Copy
// link". Desktop: the QR is for the visitor's own phone camera. Phones (Jason 2026-10-29 in Lab HQ: "手机也用二维码和copy"): the
// same popover, centred, the QR for a friend standing next to you; no native share sheet (the macOS one felt wrong on a
// computer, and Jason wants QR and copy only), no WhatsApp / SMS buttons. navigator.share is never called.
// What goes out is the STORE page of the visitor's market (embed.js shareUrl: utm by channel), never the Lab's
// own address. Each send reports `share` { channel, market }. No reward wording anywhere (Meta forbids it).
// Copy inside the store's iframe: clipboard.writeText needs allow="clipboard-write"; else execCommand('copy') on the
// selected field; else the text stays selected with a "Press ⌘C" hint. Never window.prompt.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import qrcode from 'qrcode-generator'
import { labEvent, shareUrl, shareMarket } from './embed'
import { t } from './i18n'
import './buttons.css'

// the QR as an SVG path: crisp at any DPR, no canvas, no network (qrcode-generator, MIT — assets/LICENSES.md)
export function qrSvgPath(text) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make()
  const n = qr.getModuleCount(); let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
  return { n, d }
}
function QR({ text }) {
  const { n, d } = qrSvgPath(text)
  return <svg viewBox={`0 0 ${n} ${n}`} role="img" aria-label={t('qr_label')}><path d={d} fill="#000" /></svg>
}
// one popover at a time on the page (A8, 2026-11-02): the share popover and the app badges' QR never show together
export function popoverOpened(id) { window.dispatchEvent(new CustomEvent('ac-popover', { detail: id })) }
export function onPopover(id, close) { const on = (e) => { if (e.detail !== id) close() }; window.addEventListener('ac-popover', on); return () => window.removeEventListener('ac-popover', on) }

const isMac = () => { try { return /Mac|iPhone|iPad/.test(navigator.platform || '') } catch { return false } }

export default function ShareButton({ compact = false, thumb, className = '', style }) {
  const phone = compact // the phone dock passes `compact`; the panel (desktop) does not
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pressHint, setPressHint] = useState(false)
  const wrap = useRef(null), pop = useRef(null), field = useRef(null), closeBtn = useRef(null), opener = useRef(null), timer = useRef(0)
  const id = useId()
  const market = shareMarket()
  useEffect(() => () => clearTimeout(timer.current), [])

  const close = (refocus = true) => { setOpen(false); setCopied(false); setPressHint(false); if (refocus) opener.current?.focus() }
  const show = (channel) => { setOpen(true); popoverOpened(id); labEvent('share', { channel, market }) }
  useEffect(() => onPopover(id, () => close(false)), []) // eslint-disable-line react-hooks/exhaustive-deps

  // close on Esc and on a click outside; move focus in
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    const onDown = (e) => { if (!wrap.current?.contains(e.target) && !pop.current?.contains(e.target)) close() }
    document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onDown, true)
    const f = setTimeout(() => closeBtn.current?.focus(), 30) // × on both: focusing the field would select it and scroll it to the end (and may raise a keyboard)
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onDown, true); clearTimeout(f) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = (e) => { e.stopPropagation(); if (open) close(); else show('qr_shown') }

  // Desktop (界面设计 11-03, via HQ): the box opens beside the panel, 14 px right of it, its bottom on the button's, at least 16 px
  // inside the window top and bottom (above the button it ran 46–75 px off the top at 1280×800). It stays a child of the button's
  // wrap (absolute, from the measured rects, against whatever box contains it): inside the panel's glass and motion `fixed` would be the panel's anyway, and it keeps
  // the same inherited look. The arrow (buttons.css .is-side) points at the button and moves with the clamp.
  const [side, setSide] = useState(false)
  useLayoutEffect(() => { setSide(!phone && !!wrap.current?.closest('.ac-panel')) }, [phone])
  useLayoutEffect(() => {
    if (!open || !side) return
    const place = () => {
      const p = pop.current, panel = wrap.current?.closest('.ac-panel')
      if (!p || !panel) return
      const cb = p.offsetParent || panel, cr = cb.getBoundingClientRect() // the box's own containing block (its padding box)
      const ox = cr.left + cb.clientLeft, oy = cr.top + cb.clientTop, br = opener.current.getBoundingClientRect(), h = p.offsetHeight
      const top = Math.max(16, Math.min(br.bottom - h, window.innerHeight - 16 - h))
      p.style.left = `${panel.getBoundingClientRect().right + 14 - ox}px`
      p.style.top = `${top - oy}px`
      p.style.setProperty('--ac-arrow-y', `${Math.max(16, Math.min(h - 16, br.top + br.height / 2 - top))}px`)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open, side, copied, pressHint])

  const copy = async () => {
    const url = shareUrl('copy')
    const done = () => { setCopied(true); setPressHint(false); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1500); labEvent('share', { channel: 'copy', market }) }
    try { await navigator.clipboard.writeText(url); done(); return } catch { /* no clipboard-write in this frame */ }
    try { field.current?.focus(); field.current?.select(); if (document.execCommand('copy')) { done(); field.current.scrollLeft = 0; return } } catch { /* blocked */ }
    field.current?.focus(); field.current?.select(); setPressHint(true)
  }

  const copyUrl = shareUrl('copy')
  // selecting an input scrolls it to the end of the selection; keep the start of the address in view (HQ 2026-10-29)
  const selectKeepStart = (e) => { const el = e.target; el.select(); requestAnimationFrame(() => { el.scrollLeft = 0 }) }
  return (
    <span ref={wrap} className={`ac-share-wrap ${className}`} style={style} onPointerDown={(e) => e.stopPropagation()}>
      <button ref={opener} type="button" className={`ac-share ${compact ? 'is-compact' : 'is-panel'}`} aria-label={t(compact ? 'share_buddy_phone' : 'share')} aria-expanded={open} aria-controls={id} onClick={onClick}>
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M14 2 1.8 7l4.7 2.3M14 2 11 14.2 6.5 9.3M14 2 6.5 9.3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>{t(compact ? 'share_buddy_phone' : 'share')}</span>
      </button>
      {/* the phone popover goes to <body>: inside the phone dock (a transformed element) position: fixed would be relative to the dock */}
      {(phone ? (n) => createPortal(n, document.body) : (n) => n)(<AnimatePresence>
        {open && (
          <motion.div ref={pop} key="pop" id={id} role="dialog" aria-modal="false" aria-labelledby={`${id}-t`} className={`ac-share-pop ${phone ? 'is-phone' : side ? 'is-side' : ''}`}
            initial={phone ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }} animate={phone ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }} exit={phone ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}
            onPointerDown={(e) => e.stopPropagation()}> {/* phones: opacity only — the centring transform is the CSS's (.is-phone) */}
            <h3 id={`${id}-t`}>{t('share_title')}</h3>
            <button ref={closeBtn} type="button" className="ac-share-x" aria-label={t('share_close')} onClick={close}>×</button>
            {/* what the friend gets: the view on screen, one line. Sending unlocks nothing and carries no reward */}
            {thumb && <div className="ac-share-preview"><img src={thumb} alt="" draggable={false} />{t('share_line') && <p>{t('share_line')}</p>}</div>}
            <span className="ac-share-qr"><QR text={shareUrl('qr')} /></span>
            <p className="ac-share-cap">{t(phone ? 'share_qr_caption_phone' : 'share_qr_caption')}</p>
            <div className="ac-share-row">
              <input ref={field} className="ac-share-field" type="text" readOnly value={copyUrl} aria-label={t('share_link_label')} onFocus={selectKeepStart} onClick={selectKeepStart} />
              <button type="button" className={`ac-share-copy ${copied ? 'is-done' : ''}`} onClick={copy} aria-live="polite">{copied ? t('share_copied_check') : t('share_copy')}</button>
            </div>
            <p className="ac-share-hint">{pressHint ? t('share_press_copy', { keys: isMac() ? '⌘C' : 'Ctrl+C' }) : t('share_copy_hint')}</p>
          </motion.div>
        )}
      </AnimatePresence>)}
    </span>
  )
}
