// The entry tour (Jason 2026-11-02 in Lab HQ, plan docs/2026-11-02-entry-tour-into-base-plan.md; prototype
// 2026-11-01-tour-proto): three stops, one action each, the same words and order on desktop and phones. It replaces the
// three step cards on every page (the ice page too since 2026-11-02, Jason: "the same logic; it's also the base version"). A stop names the action ("Drag the boat",
// "Tap Forward"), not the view still to come; it goes on only when the visitor has done it: dragged the boat for 4 s, drilled
// a hole (the ice page, which has no boat), or switched to the view it asks for. A tile stop then holds 5 s, and the next fades in (timings below). "Skip tour" at any time,
// "Replay tour" afterwards; once seen (finished or skipped) it does not start by
// itself again on this device. The page (index.jsx) owns the views: the tour only asks for them through `onShow`, and
// tells the page which tile to light (`onState`). The base version has no lock: Combo shows during the tour.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { sentEvents } from './embed'
import { t } from './i18n'
import ViewIcon from './ViewIcon'
import finger from './assets/tour/finger.svg'
import arrow from './assets/tour/arrow.svg'
import './tour.css'

// stop 1 shows its view and asks for a drag (the ice page: a tap on the ice, which drills a hole); stops 2–3 ask for a tap on
// that view's tile. `text` overrides the stop's line (the ice page's views look down a hole, not ahead of a boat).
export const TOUR_SCRIPTS = {
  mini: { device: 'PLM', stops: [{ view: 'combo', action: 'drag', key: 'drag' }, { view: 'forward', action: 'tile', key: 'fwd' }, { view: 'down', action: 'tile', key: 'down' }] },
  pl: { device: 'PL', stops: [{ view: 'down', action: 'drag', key: 'drag' }, { view: 'forward', action: 'tile', key: 'fwd' }, { view: 'panoramic', action: 'tile', key: 'pano' }] },
  ice: { device: 'PLM', seen: 'accuphy_lab_tour_ice_v1', stops: [{ view: 'combo', action: 'drill', key: 'drill' }, { view: 'forward', action: 'tile', key: 'fwd', text: 'tour_ice_fwd_text' }, { view: 'down', action: 'tile', key: 'down', text: 'tour_ice_down_text' }] },
}
// seen once, never by itself again on this device: the lake pages share one mark; the ice page has its own (it teaches a
// different action, and the lake's Ice Fishing tiles lead there after the lake's tour)
const SEEN = 'accuphy_lab_tour_v1'
const seenKey = (script) => TOUR_SCRIPTS[script]?.seen || SEEN
const q = typeof window !== 'undefined' ? window.location.search : ''
// ?tour=1 always runs it (testing, a shared link); ?tour=off never does
export const tourForced = /[?&]tour=1\b/.test(q)
export const tourOff = /[?&]tour=off\b/.test(q)
export function tourSeen(script) { try { return localStorage.getItem(seenKey(script)) === '1' } catch { return false } }
const markSeen = (script) => { try { localStorage.setItem(seenKey(script), '1') } catch { /* private mode: it may show again next time */ } }
const SLOW = import.meta.env.DEV ? +((/[?&]tourslow(?:=(\d+))?\b/.exec(q) || [, 1])[1] || 4) : 1 // dev: ?tourslow[=k] runs the holds and fades k× slower, for screenshots
// Round 3 (Jason 2026-11-02 in Lab HQ: there was not enough time to try each step): stop 1 is done after dragging a while in
// all (stop-and-go counts); every done stop then holds on its own view with its dot blue, nothing to press; a stop
// with no action waits. Fades 0.4 s out, 0.5 s in. Taps in the first 0.6 s of a new card do not count (a stray double tap).
// Round 4 timing as Jason confirmed it (2026-11-02 via Lab HQ): the drag stop is done after 4 s and goes straight on (its dot
// turns blue, then the card fades out, no hold); a tile stop holds 5 s on the new view, the boat free to drag, then the next
// card (after the last, the tour ends). The ice page's drill stop is done at the tap and goes straight on like the drag stop
// (HQ 11-02, Jason's timing: no pause); the hole is still drilling while stop 2 fades in.
const START_MS = 700, IN_DELAY = 80, OUT_MS = 400 * SLOW, HOLD_DRAG_MS = 0, HOLD_TILE_MS = 5000 * SLOW, DRAG_S = 4 * SLOW, GUARD_MS = 600

export default function Tour({ script, auto, phone, mode, deviceId, state, onShow, onState }) {
  const sc = TOUR_SCRIPTS[script]
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [i, setI] = useState(0)
  const [vis, setVis] = useState('hidden') // hidden | in | check (the hold) | out
  const [armed, setArmed] = useState(false) // past the 0.6 s guard of a new card
  const ring = useRef(null), marks = useRef({}), ptile = useRef(null), titleEl = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const stop = sc.stops[i]

  const enter = (k) => {
    const st = sc.stops[k]
    setI(k); setVis('hidden'); setArmed(false); doneRef.current = false
    if (st.action !== 'tile') onShow(sc.device, st.view, false) // the stop's own view is on before its title appears
    onState({ on: true, tile: st.action === 'tile' ? st.view : null })
    later(() => setVis('in'), IN_DELAY)
    later(() => setArmed(true), IN_DELAY + GUARD_MS)
  }
  const start = () => { timers.current.forEach(clearTimeout); timers.current = []; setPhase('running'); enter(0) }
  const finish = () => { markSeen(script); setPhase('done'); setVis('hidden'); onState({ on: false, tile: null }) }
  const skip = () => { setVis('out'); later(finish, OUT_MS) }
  const doneRef = useRef(false) // the current stop was done (not skipped): its dot stays blue while the card fades out
  const complete = () => {
    doneRef.current = true
    setVis('check')
    later(() => { setVis('out'); later(() => (i + 1 < sc.stops.length ? enter(i + 1) : finish()), OUT_MS) }, stop.action === 'tile' ? HOLD_TILE_MS : HOLD_DRAG_MS)
  }

  // it begins 0.7 s after the lake is on screen (the page's `ready`), on desktop and phones alike
  useEffect(() => {
    if (!auto) { setPhase('done'); return }
    let begun = false
    const begin = () => { if (!begun) { begun = true; later(start, START_MS) } }
    if (sentEvents.has('ready')) begin()
    const on = (e) => { if (e.detail?.event === 'ready') begin() }
    window.addEventListener('accuphy-lab', on)
    return () => window.removeEventListener('accuphy-lab', on)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // a tile stop is done when the page shows its view (the visitor tapped the lit tile)
  useEffect(() => { if (phase === 'running' && vis === 'in' && stop.action === 'tile' && mode === stop.view && deviceId === sc.device) complete() }, [phase, vis, i, mode, deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  // the drag stop: done after 4 s of the lake's own drag in all (mouse or finger; stop-and-go adds up), shown by the ring
  // filling round the boat. The cue sits on the boat: the lake moves its caption there every frame (Scene.jsx), so the cue
  // follows the caption's anchor.
  const dragT = useRef(0)
  useEffect(() => {
    if (phase !== 'running' || stop.action !== 'drag' || vis === 'hidden') return
    const s = state.current
    if (vis === 'in' && !armed) dragT.current = 0
    let raf = 0, done = false, last = performance.now()
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now
      const el = ring.current, dragging = vis === 'in' && armed && !done && s.dragging
      if (dragging) {
        dragT.current += dt
        if (marks.current.prog) marks.current.prog.style.strokeDashoffset = `${(100 - 100 * Math.min(1, dragT.current / DRAG_S)).toFixed(2)}`
        if (dragT.current >= DRAG_S) { done = true; complete() }
      }
      // the cue's states (design progress-ring.css): dragging = only the ring and the arc; released early = the marks back,
      // the arc stays where it got to
      if (el) { el.classList.toggle('is-dragging', dragging); el.classList.toggle('has-progress', !dragging && dragT.current > 0) }
      const cue = s.hintEl
      if (!cue || !el) return
      const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(cue.style.transform)
      if (!m) return
      el.style.transform = `translate(${(+m[1] + (phone ? 6 : 10)).toFixed(1)}px, ${(+m[2] + (phone ? 24 : 36)).toFixed(1)}px)` // the caption's anchor sits a little above and left of the hull (design handover §1)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [phase, vis, i, armed]) // eslint-disable-line react-hooks/exhaustive-deps

  // the drill stop (the ice page): done when a tap on the ice starts a hop to a new hole (IceCamp.jsx IcePick). The cue — a
  // ring with a tapping finger — sits on the spot the lake marks for a tap (Scene.jsx s.tapAt: the reticle in the section
  // view) and stays where it was tapped while the cue pops and fades.
  useEffect(() => {
    if (phase !== 'running' || stop.action !== 'drill' || vis === 'hidden') return
    const s = state.current
    let raf = 0, done = vis !== 'in'
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!done && armed && s.drill && s.drill.phase !== 'idle') { done = true; complete(); return }
      const el = ring.current, at = s.tapAt
      if (!done && el && at) el.style.transform = `translate(${at[0].toFixed(1)}px, ${at[1].toFixed(1)}px)`
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [phase, vis, i, armed]) // eslint-disable-line react-hooks/exhaustive-deps

  // a tile stop: the spotlight, the two rings, the tapping finger and the TAP bubble follow the tile (the panel's tile on
  // desktop, the one under the words on phones); read every frame, so a resize or the card's fade-in is followed
  useEffect(() => {
    if (phase !== 'running' || stop.action !== 'tile' || vis === 'hidden') return
    let raf = 0
    const put = (el, x, y, w, h) => { if (!el) return; el.style.left = `${x}px`; el.style.top = `${y}px`; if (w != null) { el.style.width = `${w}px`; el.style.height = `${h}px` } }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const tile = phone ? ptile.current : document.querySelector('.ac-panel .ac-view.is-tour-target'), M = marks.current
      if (!tile) return
      const r = tile.getBoundingClientRect()
      if (!r.width) return
      put(M.spot, r.left - 6, r.top - 6, r.width + 12, r.height + 12)
      put(M.w1, r.left, r.top, r.width, r.height); put(M.w2, r.left, r.top, r.width, r.height)
      put(M.tap, r.left + r.width / 2 + 20, r.top + r.height / 2 - 10) // on the view art, clear of the name (design 1e21d90)
      if (phone) put(M.bub, r.right + 14, r.top + r.height / 2); else put(M.bub, r.left + r.width / 2, r.top - 12)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [phase, vis, i, phone]) // eslint-disable-line react-hooks/exhaustive-deps

  // The title in five languages (界面设计 11-03): on a desktop one line, shrunk to fit (at most the CSS size, 46 px at 1280, at least
  // 38 px; still longer, it wraps, balanced), and the same size on all the stops of the tour: the smallest any of its titles needs, so
  // it doesn't jump between stops (a ✓ or anything else in a title counts, the whole text is measured). On a phone at most two lines
  // at 30 px, else 26 px (Dutch "Tik op Panoramische weergave"). English fits as it is, so it keeps its size.
  useLayoutEffect(() => {
    const el = titleEl.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = ''; el.style.whiteSpace = ''
      const base = parseFloat(getComputedStyle(el).fontSize)
      if (phone) {
        if (el.getBoundingClientRect().height > base * 1.08 * 2 + 1) el.style.fontSize = Math.min(base, 26) + 'px'
        return
      }
      const min = Math.min(base, 38)
      const probe = el.cloneNode(false) // same class, same width; no height, so nothing moves while it measures
      probe.style.cssText = 'visibility:hidden;height:0;overflow:hidden;white-space:nowrap'
      el.after(probe)
      const need = (text) => {
        probe.textContent = text; probe.style.fontSize = base + 'px'
        if (probe.scrollWidth <= probe.clientWidth) return base
        let size = Math.max(min, Math.floor((base * probe.clientWidth / probe.scrollWidth) * 2) / 2)
        probe.style.fontSize = size + 'px'
        while (probe.scrollWidth > probe.clientWidth && size > min) { size = Math.max(min, size - 0.5); probe.style.fontSize = size + 'px' }
        return size
      }
      const size = Math.min(...sc.stops.map((st) => need(t(`tour_${st.key}_title`))))
      probe.remove()
      if (size < base) el.style.fontSize = size + 'px' // still too long at 38 px: it wraps (balanced)
    }
    fit()
    let on = true
    document.fonts?.ready?.then(() => { if (on) fit() })
    window.addEventListener('resize', fit)
    return () => { on = false; window.removeEventListener('resize', fit) }
  }, [phase, i, phone, script]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'idle') return null
  const k = stop.key
  return (
    <div className={`ac-tour-layer ${phone ? 'is-phone' : ''}`} style={SLOW > 1 ? { '--tour-k': SLOW } : undefined} aria-live="polite">
      {phase === 'running' && (<>
        {stop.action === 'tile' && (
          <div className={`ac-tour-marks is-${vis}`} aria-hidden="true">
            <div ref={(el) => { marks.current.spot = el }} className="ac-tour-spot" />
            <div ref={(el) => { marks.current.w1 = el }} className="ac-tour-wave" />
            <div ref={(el) => { marks.current.w2 = el }} className="ac-tour-wave is-late" />
            <div ref={(el) => { marks.current.tap = el }} className={`ac-tour-tap ${phone ? 'is-phone' : ''}`}><img src={finger} alt="" className="ac-tour-tap-finger" draggable={false} /><i className="ac-tour-tap-dot" /></div>
            <div ref={(el) => { marks.current.bub = el }} className={`ac-tour-bubble ${phone ? 'is-right' : ''}`}>{t('tour_tap')}</div>
          </div>
        )}
        <div className={`ac-tour-card is-${vis}`}>
          <div ref={titleEl} className="ac-tour-title">{t(`tour_${k}_title`)}</div>
          <div className="ac-tour-text">{t(stop.text || `tour_${k}_text`)}</div>
          <div className="ac-tour-dots">{sc.stops.map((_, n) => <i key={n} className={n < i || (n === i && (vis === 'check' || (vis === 'out' && phase === 'running' && doneRef.current))) ? 'is-done' : n === i ? 'is-on' : ''} />)}</div>
          {phone && stop.action === 'tile' && (
            <button ref={ptile} type="button" className={`ac-view ac-tour-ptile is-tour-target ${mode === stop.view ? 'is-active' : ''}`} onClick={() => onShow(sc.device, stop.view, true)}>
              <ViewIcon view={stop.view} deg={sc.device === 'PLM' ? 39 : 135} active={mode === stop.view} />
              <span className="ac-view-name">{t('mode_' + stop.view)}</span>
            </button>
          )}
        </div>
        {stop.action === 'drag' && (
          <div ref={ring} className={`ac-tour-cue ${vis === 'check' ? 'is-complete' : `is-${vis}`} ${phone ? 'is-phone' : ''}`} aria-hidden="true">
            <svg className="ac-tour-prog" viewBox="0 0 84 84"><circle className="ac-tour-prog-track" cx="42" cy="42" r="39" /><circle className="ac-tour-prog-arc" cx="42" cy="42" r="39" pathLength="100" style={{ strokeDashoffset: 100 }} ref={(el) => { marks.current.prog = el }} /></svg>
            <i className="ac-tour-cue-wave" /><i className="ac-tour-cue-ring" />
            <img src={arrow} alt="" className="ac-tour-cue-arrow is-left" draggable={false} />
            <img src={finger} alt="" className="ac-tour-cue-finger" draggable={false} />
            <img src={arrow} alt="" className="ac-tour-cue-arrow is-right" draggable={false} />
          </div>
        )}
        {stop.action === 'drill' && (
          <div ref={ring} className={`ac-tour-cue is-tap ${vis === 'check' ? 'is-complete' : `is-${vis}`} ${phone ? 'is-phone' : ''}`} aria-hidden="true">
            <i className="ac-tour-cue-wave" /><i className="ac-tour-cue-ring" />
            <div className={`ac-tour-tap ${phone ? 'is-phone' : ''}`}><img src={finger} alt="" className="ac-tour-tap-finger" draggable={false} /><i className="ac-tour-tap-dot" /></div>
          </div>
        )}
        {(vis === 'in' || vis === 'hidden') && !armed && <div className="ac-tour-guard" />} {/* from the moment a card is chosen, before it fades in */}
        <button type="button" className="ac-tour-corner" onClick={skip}>{t('tour_skip')}</button>
      </>)}
      {phase === 'done' && <button type="button" className="ac-tour-corner" onClick={start}>↻ {t('tour_replay')}</button>}
    </div>
  )
}
