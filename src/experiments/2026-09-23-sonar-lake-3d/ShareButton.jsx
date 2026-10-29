// "Send to a friend" (BF funnel handoff 2026-10-26, item 1). The system share sheet when the browser has it; otherwise
// (Facebook's Android browser) three fallbacks: WhatsApp, SMS, copy the link. What goes out is the STORE page
// (shop.accuphy.com/pages/lab?ref=share, /fr/ for French), never the Lab's own address. Each send reports `share`
// with the channel. No reward wording anywhere (Meta forbids it; none is offered during BF).
// Look (Jason 2026-10-28, "太 AI 了" about the pill): a plain text link in the panel's own type, a small share glyph before
// it — the store's footer style, no pill, no glass.
import { useEffect, useRef, useState } from 'react'
import { labEvent, LANG_PATH } from './embed'
import { t } from './i18n'

const SHARE_URL = () => `https://shop.accuphy.com${LANG_PATH}/pages/lab?ref=share`

export default function ShareButton({ compact = false, className = '', style }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const url = SHARE_URL(), text = t('share_text')
  const done = (channel) => { labEvent('share', { channel }); setOpen(false) }
  const onClick = async (e) => {
    e.stopPropagation()
    if (navigator.share) {
      try { await navigator.share({ title: 'Accuphy Lab', text, url }); done('system') } catch { /* the visitor closed the sheet */ }
      return
    }
    setOpen((v) => !v)
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => { setCopied(false); setOpen(false) }, 1400); labEvent('share', { channel: 'copy' }) } catch { window.prompt(t('share_copy'), url) }
  }
  const enc = encodeURIComponent(`${text} ${url}`)
  return (
    <span className={`ac-share-wrap ${className}`} style={style} onPointerDown={(e) => e.stopPropagation()}>
      <button type="button" className={`ac-share ${compact ? 'is-compact' : ''}`} aria-label={t('share')} aria-expanded={open} onClick={onClick}>
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M11 2.5 8 5.5M11 2.5v3M11 2.5H8M8 5.5 3 10.5v3h3l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>{t(compact ? 'share_short' : 'share')}</span>
      </button>
      {open && (
        <span className="ac-share-menu glass" role="menu">
          <a role="menuitem" href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener" onClick={() => done('whatsapp')}>WhatsApp</a>
          <a role="menuitem" href={`sms:?&body=${enc}`} onClick={() => done('sms')}>{t('share_sms')}</a>
          <button role="menuitem" type="button" onClick={copy}>{copied ? t('share_copied') : t('share_copy')}</button>
        </span>
      )}
    </span>
  )
}
