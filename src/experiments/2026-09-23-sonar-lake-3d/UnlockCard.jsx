// The subscribe card that unlocks the locked views (#191; Jason 2026-10-30: "把live combo给blur了吧 … 订阅以后可以全部给看"). Replaces the
// old sign-up gate (2026-09-24): this card can be closed (×, Esc, a tap outside) and the visitor stays on the view they had; the
// lake keeps running behind it. Success says so for a moment, then opens the view; this device remembers it (signup.js).
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { submitSignup, isEmail, signupTestMode } from './signup'
import { labEvent, shareMarket } from './embed'
import { t, LANG } from './i18n'

// small and fine on purpose: a lock on a tile or a pill, not a paywall sign. `open` lifts the shackle (the unlock moment)
export function LockIcon({ size = 11, open = false, style }) {
  return (
    <svg className={`ac-lock ${open ? 'is-open' : ''}`} viewBox="0 0 12 14" width={size} height={size} aria-hidden="true" style={style}>
      <path className="ac-lock-shackle" d="M3.4 6.4V4.1a2.6 2.6 0 0 1 5.2 0v2.3" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <rect x="1.6" y="6.2" width="8.8" height="6.6" rx="1.4" fill="currentColor" />
    </svg>
  )
}

const DONE_MS = 1500 // the frost clears, one sonar sweep, then the view opens

export default function UnlockCard({ name, img, product, view, onClose, onDone }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | error | done
  const [error, setError] = useState('')
  const input = useRef(null)
  useEffect(() => {
    const opener = document.activeElement
    if (window.matchMedia?.('(pointer: fine)').matches) input.current?.focus() // not on touch: the keyboard would hide the card before it is read
    const k = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    window.addEventListener('keydown', k, true)
    return () => { window.removeEventListener('keydown', k, true); opener?.focus?.() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault()
    if (!isEmail(email)) { setStatus('error'); setError(t('unlock_err_email')); return }
    setStatus('sending'); setError('')
    try { await submitSignup({ email, language: LANG, market: shareMarket(), view, product }); labEvent('signup', { source: 'unlock', product, view }, { once: true }) /* never the email: the iframe message goes to '*' */; setStatus('done'); setTimeout(onDone, DONE_MS) } catch (err) { setStatus('error'); setError(t(err.message === 'not_ready' ? 'unlock_err_closed' : 'unlock_err_send')) }
  }

  const done = status === 'done'
  return (
    <MotionConfig reducedMotion="user">
      <motion.div className="ac-gate fixed inset-0 z-[60] flex overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="unlock-title" onPointerDown={(e) => { if (e.target === e.currentTarget && !done) onClose() }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.3 }}>
        <motion.form onSubmit={submit} noValidate initial={{ opacity: 0, y: 12, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 1.015, transition: { duration: 0.2 } }} transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
          className={`ac-panel ac-unlock relative m-auto w-full text-white ${done ? 'is-done' : ''}`}>
          {/* the view itself, under frost: what subscribing opens. On success the frost clears and a sonar sweep crosses it */}
          <div className="ac-unlock-media" aria-hidden="true">
            {img && <img src={img} alt="" draggable={false} />}
            <span className="ac-unlock-grid" />
            <span className="ac-unlock-sweep" />
            <span className="ac-unlock-chip"><LockIcon size={13} open={done} /></span>
          </div>
          {!done && <button type="button" className="ac-unlock-x" aria-label={t('share_close')} onClick={onClose}><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></button>}
          <div className="ac-unlock-body">
            <h2 id="unlock-title" className="ac-unlock-title">{done ? t('unlock_done', { view: name }) : t('unlock_title', { view: name })}</h2>
            <AnimatePresence initial={false}>
              {!done && (
                <motion.div key="form" exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: 'hidden' }}>
                  <p className="ac-unlock-text">{t('unlock_text', { view: name })}</p>
                  <label className="mt-3.5 block">
                    <span className="ac-label">{t('unlock_email')}</span>
                    <input ref={input} type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                      placeholder="you@example.com" className="ac-input mt-1.5 w-full select-text" aria-invalid={status === 'error'} />
                  </label>
                  {status === 'error' && <div className="mt-2 text-[12.5px] text-[#ffd0d0]" role="alert">{error}</div>}
                  <button type="submit" disabled={status === 'sending'} className="ac-primary mt-3 w-full">{status === 'sending' ? t('unlock_sending') : t('unlock_cta')}</button>
                  <p className="ac-unlock-fine">
                    {t('unlock_consent')}{' '}
                    <a href="https://shop.accuphy.com/policies/privacy-policy" target="_blank" rel="noreferrer">{t('unlock_privacy')}</a>
                  </p>
                  {signupTestMode() && <p className="mt-1.5 text-[11px] font-semibold text-[#ffd98a]">Test mode: nothing is sent.</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      </motion.div>
    </MotionConfig>
  )
}
