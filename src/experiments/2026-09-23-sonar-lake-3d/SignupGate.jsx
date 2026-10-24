// Sign-up gate (Jason 2026-09-24): opens when a visitor taps one of the display-only app controls on the
// phone inset. It cannot be dismissed without signing up, and the lake / sonar picture stays frozen while
// it is open (the page pauses the render loop). Frosted-glass card, same material as the panel.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { submitSignup, isEmail } from './signup'
import { labEvent } from './embed'

export default function SignupGate({ onDone }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [error, setError] = useState('')
  const input = useRef(null)
  useEffect(() => { input.current?.focus() }, [])
  // no way out but signing up: swallow Escape
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation() } }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!isEmail(email)) { setStatus('error'); setError('Please enter a valid email address.'); return }
    setStatus('sending'); setError('')
    try { await submitSignup({ email }); labEvent('signup', { source: 'gate' }, { once: true }); onDone() } catch (err) { setStatus('error'); setError(err.message || 'Something went wrong — please try again.') }
  }

  return (
    <div className="ac-gate fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <motion.form onSubmit={submit} noValidate initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="ac-panel w-full max-w-[420px] p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <img src="/brand/logo/White Accuphy Logo.png" alt="Accuphy" className="h-[18px] w-auto" draggable={false} />
          <span className="ac-title">Sonar app</span>
        </div>
        <h2 id="gate-title" className="mt-5 text-[22px] font-semibold leading-tight tracking-[-0.01em]">These are the real app controls.</h2>
        <p className="ac-soft mt-2 text-[14px] leading-relaxed">
          Sign up to keep exploring — we’ll send you PingLive tips, product news and early offers from Accuphy.
        </p>
        <label className="mt-5 block">
          <span className="ac-label">Email</span>
          <input ref={input} type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
            placeholder="you@example.com" className="ac-input mt-1.5 w-full" aria-invalid={status === 'error'} />
        </label>
        {status === 'error' && <div className="mt-2 text-[12.5px] text-[#ffd0d0]" role="alert">{error}</div>}
        <button type="submit" disabled={status === 'sending'} className="ac-primary mt-4 w-full">{status === 'sending' ? 'Signing up…' : 'Sign up & continue'}</button>
        <p className="ac-soft mt-4 text-[12px] leading-snug">
          We respect your inbox: no spam and no sharing — just a few emails from Accuphy. Unsubscribe anytime.{' '}
          <a href="https://accuphy.ca/policies/privacy-policy" target="_blank" rel="noreferrer" className="underline decoration-white/40 underline-offset-2 hover:decoration-white">Privacy policy</a>
        </p>
      </motion.form>
    </div>
  )
}
