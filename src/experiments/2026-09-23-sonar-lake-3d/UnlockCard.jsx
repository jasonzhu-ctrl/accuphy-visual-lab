// The subscribe card that unlocks the locked views (#191; Jason 2026-10-30: "把live combo给blur了吧 … 订阅以后可以全部给看"). Replaces the
// old sign-up gate (2026-09-24): this card can be closed (×, Esc, a tap outside) and the visitor stays on the view they had; the
// lake keeps running behind it. Success says so for a moment, then opens the view; this device remembers it (signup.js).
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { submitSignup, isEmail, signupTestMode } from './signup'
import { labEvent } from './embed'
import { t, LANG } from './i18n'

export function LockIcon({ size = 11, style }) {
  return <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" style={style}><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><rect x="2.8" y="6.8" width="10.4" height="7.6" rx="1.8" fill="currentColor" /></svg>
}

const DONE_MS = 1100

export default function UnlockCard({ name, product, view, onClose, onDone }) {
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
    try { await submitSignup({ email, language: LANG }); labEvent('signup', { source: 'unlock', product, view }, { once: true }) /* never the email: the iframe message goes to '*' */; setStatus('done'); setTimeout(onDone, DONE_MS) } catch (err) { setStatus('error'); setError(t(err.message === 'not_ready' ? 'unlock_err_closed' : 'unlock_err_send')) }
  }

  return (
    <div className="ac-gate fixed inset-0 z-[60] flex overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="unlock-title" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <motion.form onSubmit={submit} noValidate initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        className="ac-panel relative m-auto w-full max-w-[420px] p-5 text-white sm:p-7">
        <button type="button" className="ac-unlock-x" aria-label={t('share_close')} onClick={onClose}>×</button>
        <div className="ac-unlock-badge"><LockIcon size={18} /></div>
        <h2 id="unlock-title" className="mt-3 pr-6 text-[21px] font-semibold leading-tight tracking-[-0.01em]">{status === 'done' ? t('unlock_done', { view: name }) : t('unlock_title', { view: name })}</h2>
        {status !== 'done' && <>
        <p className="ac-soft mt-2 text-[14px] leading-relaxed">{t('unlock_text', { view: name })}</p>
        <label className="mt-4 block">
          <span className="ac-label">{t('unlock_email')}</span>
          <input ref={input} type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
            placeholder="you@example.com" className="ac-input mt-1.5 w-full select-text" aria-invalid={status === 'error'} />
        </label>
        {status === 'error' && <div className="mt-2 text-[12.5px] text-[#ffd0d0]" role="alert">{error}</div>}
        <button type="submit" disabled={status === 'sending'} className="ac-primary mt-3.5 w-full">{status === 'sending' ? t('unlock_sending') : t('unlock_cta')}</button>
        <p className="ac-soft mt-3 text-[12px] leading-snug">
          {t('unlock_consent')}{' '}
          <a href="https://shop.accuphy.com/policies/privacy-policy" target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">{t('unlock_privacy')}</a>
        </p>
        {signupTestMode() && <p className="mt-2 text-[11.5px] font-semibold text-[#ffd98a]">Test mode: nothing is sent.</p>}
        </>}
      </motion.form>
    </div>
  )
}
