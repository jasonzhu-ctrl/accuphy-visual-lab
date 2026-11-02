// The entry tour (Jason 2026-11-02 in Lab HQ, plan docs/2026-11-02-entry-tour-into-base-plan.md; prototype
// 2026-11-01-tour-proto): three stops, one action each, the same words and order on desktop and phones. It replaces the
// three step cards on the lake pages (the ice page keeps its cards for now). A stop names the action ("Drag the boat",
// "Tap Forward"), not the view still to come; it goes on only when the visitor has done it: dragged the boat, or switched
// to the view it asks for. Between stops the card fades out (0.3 s) and the next fades in (0.42 s); a done stop holds its
// tick for 0.7 s. "Skip tour" at any time, "Replay tour" afterwards; once seen (finished or skipped) it does not start by
// itself again on this device. The page (index.jsx) owns the views: the tour only asks for them through `onShow`, and
// tells the page which tile to light (`onState`). The base version has no lock: Combo shows during the tour.
import { useEffect, useRef, useState } from 'react'
import { sentEvents } from './embed'
import { t } from './i18n'
import ViewIcon from './ViewIcon'
import finger from './assets/tour/finger.svg'
import arrow from './assets/tour/arrow.svg'
import './tour.css'

// stop 1 shows its view and asks for a drag; stops 2–3 ask for a tap on that view's tile
export const TOUR_SCRIPTS = {
  mini: { device: 'PLM', stops: [{ view: 'combo', action: 'drag', key: 'drag' }, { view: 'forward', action: 'tile', key: 'fwd' }, { view: 'down', action: 'tile', key: 'down' }] },
  pl: { device: 'PL', stops: [{ view: 'down', action: 'drag', key: 'drag' }, { view: 'forward', action: 'tile', key: 'fwd' }, { view: 'panoramic', action: 'tile', key: 'pano' }] },
}
const SEEN = 'accuphy_lab_tour_v1'
const q = typeof window !== 'undefined' ? window.location.search : ''
// ?tour=1 always runs it (testing, a shared link); ?tour=off never does
export const tourForced = /[?&]tour=1\b/.test(q)
export const tourOff = /[?&]tour=off\b/.test(q)
export function tourSeen() { try { return localStorage.getItem(SEEN) === '1' } catch { return false } }
const markSeen = () => { try { localStorage.setItem(SEEN, '1') } catch { /* private mode: it may show again next time */ } }
const SLOW = import.meta.env.DEV ? +((/[?&]tourslow(?:=(\d+))?\b/.exec(q) || [, 1])[1] || 4) : 1 // dev: ?tourslow[=k] runs the holds and fades k× slower, for screenshots
const START_MS = 700, IN_DELAY = 80, OUT_MS = 300 * SLOW, CHECK_MS = 700 * SLOW, DRAG_M = 1 // a drag counts once the boat is asked to go 1 m

export default function Tour({ script, auto, phone, mode, deviceId, state, onShow, onState }) {
  const sc = TOUR_SCRIPTS[script]
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [i, setI] = useState(0)
  const [vis, setVis] = useState('hidden') // hidden | in | check | out
  const ring = useRef(null), marks = useRef({}), ptile = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const stop = sc.stops[i]

  const enter = (k) => {
    const st = sc.stops[k]
    setI(k); setVis('hidden')
    if (st.action === 'drag') onShow(sc.device, st.view, false) // the stop's own view is on before its title appears
    onState({ on: true, tile: st.action === 'tile' ? st.view : null })
    later(() => setVis('in'), IN_DELAY)
  }
  const start = () => { timers.current.forEach(clearTimeout); timers.current = []; setPhase('running'); enter(0) }
  const finish = () => { markSeen(); setPhase('done'); setVis('hidden'); onState({ on: false, tile: null }) }
  const skip = () => { setVis('out'); later(finish, OUT_MS) }
  const complete = () => {
    setVis('check')
    later(() => { setVis('out'); later(() => (i + 1 < sc.stops.length ? enter(i + 1) : finish()), OUT_MS) }, CHECK_MS)
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

  // the drag stop: done once the visitor drags the boat a little (the lake's own drag, mouse or finger). The ring sits on the
  // boat: the lake moves its cue caption there every frame (Scene.jsx), so the ring follows the caption's anchor.
  useEffect(() => {
    if (phase !== 'running' || stop.action !== 'drag' || vis === 'hidden') return
    const s = state.current, from = { x: s.target.x, z: s.target.z }
    let raf = 0, done = false
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (vis === 'in' && !done && s.dragging && Math.hypot(s.target.x - from.x, s.target.z - from.z) > DRAG_M) { done = true; complete() }
      const cue = s.hintEl, el = ring.current
      if (!cue || !el) return
      const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(cue.style.transform)
      if (!m) return
      el.style.transform = `translate(${(+m[1] + (phone ? 6 : 10)).toFixed(1)}px, ${(+m[2] + (phone ? 24 : 36)).toFixed(1)}px)` // the caption's anchor sits a little above and left of the hull (design handover §1)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [phase, vis, i]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="ac-tour-title">{t(`tour_${k}_title`)}{vis === 'check' && <span className="ac-tour-tick" aria-hidden="true">✓</span>}</div>
          <div className="ac-tour-text">{t(`tour_${k}_text`)}</div>
          <div className="ac-tour-dots">{sc.stops.map((_, n) => <i key={n} className={n < i || (n === i && vis === 'check') ? 'is-done' : n === i ? 'is-on' : ''} />)}</div>
          {phone && stop.action === 'tile' && (
            <button ref={ptile} type="button" className={`ac-view ac-tour-ptile is-tour-target ${mode === stop.view ? 'is-active' : ''}`} onClick={() => onShow(sc.device, stop.view, true)}>
              <ViewIcon view={stop.view} deg={sc.device === 'PLM' ? 39 : 135} active={mode === stop.view} />
              <span className="ac-view-name">{t('mode_' + stop.view)}</span>
            </button>
          )}
        </div>
        {stop.action === 'drag' && (
          <div ref={ring} className={`ac-tour-cue is-${vis} ${phone ? 'is-phone' : ''}`} aria-hidden="true">
            <i className="ac-tour-cue-wave" /><i className="ac-tour-cue-ring" />
            <img src={arrow} alt="" className="ac-tour-cue-arrow is-left" draggable={false} />
            <img src={finger} alt="" className="ac-tour-cue-finger" draggable={false} />
            <img src={arrow} alt="" className="ac-tour-cue-arrow is-right" draggable={false} />
          </div>
        )}
        <button type="button" className="ac-tour-corner" onClick={skip}>{t('tour_skip')}</button>
      </>)}
      {phase === 'done' && <button type="button" className="ac-tour-corner" onClick={start}>↻ {t('tour_replay')}</button>}
    </div>
  )
}
