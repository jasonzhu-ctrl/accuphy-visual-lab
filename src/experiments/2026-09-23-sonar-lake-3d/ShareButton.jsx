// "Send to a friend" (BF funnel handoff 2026-10-26, item 1; redone #188, Jason 2026-10-29 in Lab HQ: "开搞 要做到丝滑 顺畅 无误 的").
// Desktop: a click opens a small popover in the store style — a QR code of the share link (scan with the phone camera),
// the link in a read-only field, "Copy link". The macOS share sheet (AirDrop, Notes…) felt wrong on a computer, so
// navigator.share is never called on desktop. Phones: the native share sheet (iMessage, Messenger, WhatsApp…); when it is
// missing or refused (the store's iframe without web-share) the same popover without the QR: link + Copy + WhatsApp + SMS.
// What goes out is the STORE page of the visitor's market (embed.js shareUrl: utm by channel), never the Lab's
// own address. Each send reports `share` { channel, market }. No reward wording anywhere (Meta forbids it).
// Copy inside the store's iframe: clipboard.writeText needs allow="clipboard-write"; else execCommand('copy') on the
// selected field; else the text stays selected with a "Press ⌘C" hint. Never window.prompt.
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import qrcode from 'qrcode-generator'
import { labEvent, shareUrl, shareMarket } from './embed'
import { t } from './i18n'

// the QR as an SVG path: crisp at any DPR, no canvas, no network (qrcode-generator, MIT — assets/LICENSES.md)
export function qrSvgPath(text) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make()
  const n = qr.getModuleCount(); let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
  return { n, d }
}
function QR({ text }) {
  const { n, d } = qrSvgPath(text)
  return <svg viewBox={`0 0 ${n} ${n}`} role="img" aria-label="QR code"><path d={d} fill="#000" /></svg>
}

const isMac = () => { try { return /Mac|iPhone|iPad/.test(navigator.platform || '') } catch { return false } }

export default function ShareButton({ compact = false, className = '', style }) {
  const phone = compact // the phone dock passes `compact`; the panel (desktop) does not
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pressHint, setPressHint] = useState(false)
  const wrap = useRef(null), pop = useRef(null), field = useRef(null), closeBtn = useRef(null), opener = useRef(null), timer = useRef(0)
  const id = useId()
  const market = shareMarket()
  const text = t('share_text')
  useEffect(() => () => clearTimeout(timer.current), [])

  const close = () => { setOpen(false); setCopied(false); setPressHint(false); opener.current?.focus() }
  const show = (channel) => { setOpen(true); labEvent('share', { channel, market }) }

  // close on Esc and on a click outside; move focus in
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    const onDown = (e) => { if (!wrap.current?.contains(e.target) && !pop.current?.contains(e.target)) close() }
    document.addEventListener('keydown', onKey, true); document.addEventListener('pointerdown', onDown, true)
    const f = setTimeout(() => closeBtn.current?.focus(), 30) // × on both: focusing the field would select it and scroll it to the end (and may raise a keyboard)
    return () => { document.removeEventListener('keydown', onKey, true); document.removeEventListener('pointerdown', onDown, true); clearTimeout(f) }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const onClick = async (e) => {
    e.stopPropagation()
    if (open) { close(); return }
    if (phone && typeof navigator.share === 'function') {
      try { await navigator.share({ title: 'Accuphy Lab', text, url: shareUrl('native') }); labEvent('share', { channel: 'native', market }); return }
      catch (err) { if (err && err.name === 'AbortError') return /* the visitor closed the sheet */ } // NotAllowedError etc.: the popover
    }
    show(phone ? 'fallback_shown' : 'qr_shown')
  }

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
  const enc = encodeURIComponent(`${text} ${shareUrl('whatsapp')}`), encSms = encodeURIComponent(`${text} ${shareUrl('sms')}`)
  return (
    <span ref={wrap} className={`ac-share-wrap ${className}`} style={style} onPointerDown={(e) => e.stopPropagation()}>
      <button ref={opener} type="button" className={`ac-share ${compact ? 'is-compact' : ''}`} aria-label={t('share')} aria-expanded={open} aria-controls={id} onClick={onClick}>
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M11 2.5 8 5.5M11 2.5v3M11 2.5H8M8 5.5 3 10.5v3h3l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>{t(compact ? 'share_short' : 'share')}</span>
      </button>
      {/* the phone popover goes to <body>: inside the phone dock (a transformed element) position: fixed would be relative to the dock */}
      {(phone ? (n) => createPortal(n, document.body) : (n) => n)(<AnimatePresence>
        {open && (
          <motion.div ref={pop} key="pop" id={id} role="dialog" aria-modal="false" aria-labelledby={`${id}-t`} className={`ac-share-pop ${phone ? 'is-phone' : ''}`}
            initial={{ opacity: 0, y: phone ? 0 : 6, scale: 0.98 }} animate={{ opacity: 1, y: phone ? '-50%' : 0, scale: 1 }} exit={{ opacity: 0, y: phone ? '-50%' : 4, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}
            style={phone ? { y: '-50%' } : undefined} onPointerDown={(e) => e.stopPropagation()}>
            <h3 id={`${id}-t`}>{t('share')}</h3>
            <button ref={closeBtn} type="button" className="ac-share-x" aria-label={t('share_close')} onClick={close}>×</button>
            {!phone && (<>
              <span className="ac-share-qr"><QR text={shareUrl('qr')} /></span>
              <p className="ac-share-cap">{t('share_qr_caption')}</p>
            </>)}
            <div className="ac-share-row">
              <input ref={field} className="ac-share-field" type="text" readOnly value={copyUrl} aria-label={t('share_link_label')} onFocus={selectKeepStart} onClick={selectKeepStart} />
              <button type="button" className={`ac-share-copy ${copied ? 'is-done' : ''}`} onClick={copy} aria-live="polite">{copied ? t('share_copied_check') : t('share_copy')}</button>
            </div>
            <p className="ac-share-hint">{pressHint ? t('share_press_copy', { keys: isMac() ? '⌘C' : 'Ctrl+C' }) : t('share_copy_hint')}</p>
            {phone && (
              <div className="ac-share-alts">
                <a href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener" onClick={() => { labEvent('share', { channel: 'whatsapp', market }); close() }}>WhatsApp</a>
                <a href={`sms:?&body=${encSms}`} onClick={() => { labEvent('share', { channel: 'sms', market }); close() }}>{t('share_sms')}</a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>)}
    </span>
  )
}
