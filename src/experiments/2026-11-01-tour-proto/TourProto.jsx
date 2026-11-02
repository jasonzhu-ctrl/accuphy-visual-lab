// The three-stop entry tour, prototype (Lab HQ brief 2026-11-01, Jason: 动，先做小样). Laid over the sonar lake page without
// touching it: it waits for the page's `ready` event, dims the lake, shows one stop at a time (a big title, one line, one
// action), and goes on only when the visitor has done the action — dragged the boat, or clicked the one panel tile that
// is lit. Between stops the card fades out (300 ms) and the next fades in (420 ms). The panel is locked while the tour
// runs (tour.css, a class on <body>), except the tile the stop asks for. "Skip" at any time; "Replay tour" afterwards.
// Copy is placeholder (HQ: 真文字之后和 Jason 定). Nothing is remembered between visits yet (HQ: 小样里可以先不记).
// Phones (and a phone held sideways): no panel, so the tour starts after the Home pick, stop 1 is a tap on the lake, stops 2–3
// go on with "Next". The layout is read again on resize: a page that loads in a small or hidden pane and grows later
// (Lab HQ 2026-11-01: the tour never started in the browser pane) must still begin on the desktop path.
import { useEffect, useRef, useState } from 'react'
import { sentEvents } from '../2026-09-23-sonar-lake-3d/embed'
import { t } from '../2026-09-23-sonar-lake-3d/i18n'
import { isLandscapePhone, isPhoneLayout } from '../2026-09-23-sonar-lake-3d/SonarScreen'
import './tour.css'

// Placeholder scripts. `device` = the panel's device button to press first; `view` = the view the stop shows or asks for.
// action: drag = drag the boat (tap on phones), tile = click that view's tile on the panel (a "Next" button on phones).
const SCRIPTS = {
  mini: { device: 'PingLive Mini', stops: [
    { view: 'combo', action: 'drag', title: 'Drag the boat', phoneTitle: 'Tap the boat', text: 'Whatever the beam touches shows up live in the Accuphy Sonar app.' },
    { view: 'forward', action: 'tile', title: 'PingLive Mini Forward View', text: 'Tap Forward on the panel — the beam looks ahead of the boat, where you cast.' },
    { view: 'down', action: 'tile', title: 'See what’s right below', text: 'Tap Down — the beam points straight under the boat.' },
  ] },
  pl: { device: 'PingLive', stops: [
    { view: 'down', action: 'drag', title: 'Drag the boat', phoneTitle: 'Tap the boat', text: 'Whatever the beam touches shows up live in the Accuphy Sonar app.' },
    { view: 'forward', action: 'tile', title: 'PingLive Forward View', text: 'Tap Forward on the panel — the beam looks ahead of the boat, where you cast.' },
    { view: 'panoramic', action: 'tile', title: 'Scan wide', text: 'Tap Panoramic — a wide sweep ahead of the boat to find fish and structure.' },
  ] },
}
const SLOW = import.meta.env.DEV ? +((/[?&]tourslow(?:=(\d+))?\b/.exec(window.location.search) || [, 1])[1] || 4) : 1 // dev: ?tourslow[=k] runs the holds and fades k× slower (default 4), for screenshots
const OUT_MS = 300 * SLOW, CHECK_MS = 700 * SLOW, DRAG_PX = 14

// the panel's own buttons (the page's DOM): nothing here changes the page's code
const tiles = () => [...document.querySelectorAll('.ac-panel .ac-views .ac-view')]
const tileFor = (view) => tiles().find((el) => el.querySelector('.ac-view-name')?.textContent === t('mode_' + view))
const pressDevice = (name) => [...document.querySelectorAll('.ac-panel .ac-seg .ac-btn')].find((b) => b.textContent === name)?.click()
// the "Drag the boat" caption the lake keeps over the boat: its transform is the boat's place on screen (Scene.jsx)
const cueEl = () => document.querySelector('main > div.pointer-events-none.absolute.left-0.top-0.whitespace-nowrap')
const onCanvas = (e) => e.target?.tagName === 'CANVAS'
const phoneNow = () => isPhoneLayout() || isLandscapePhone() // the lake's own layouts without a panel (SonarScreen.jsx)

export default function TourProto({ variant = 'mini' }) {
  const [phone, setPhone] = useState(phoneNow)
  useEffect(() => { const on = () => setPhone(phoneNow()); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])
  const script = SCRIPTS[variant] || SCRIPTS.mini
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [i, setI] = useState(0)
  const [vis, setVis] = useState('hidden') // hidden | in | check | out
  const [tileIdx, setTileIdx] = useState(0) // 1-based nth-child of the tile to click, 0 = none
  const ring = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const stop = script.stops[i]

  // the panel may still be redrawing (device just pressed, or a pane that just grew): try again for a moment
  const showTile = (view, tries = 12) => { const el = tileFor(view); if (el) el.click(); else if (tries > 0) later(() => showTile(view, tries - 1), 150) }
  const enter = (k) => {
    const st = script.stops[k]
    setI(k); setVis('hidden')
    if (!phone && st.action === 'drag') showTile(st.view) // the stop's own view is on before the title appears
    setTileIdx(!phone && st.action === 'tile' ? tiles().indexOf(tileFor(st.view)) + 1 : 0)
    later(() => setVis('in'), 80)
  }
  const start = () => { setPhase('running'); if (!phone) pressDevice(script.device); later(() => enter(0), 60) } // the panel redraws its tiles for the device first
  const finish = () => { setPhase('done'); setVis('hidden'); setTileIdx(0) }
  const skip = () => { setVis('out'); later(finish, OUT_MS) }
  const complete = () => {
    setVis('check')
    later(() => { setVis('out'); later(() => (i + 1 < script.stops.length ? enter(i + 1) : finish()), OUT_MS) }, CHECK_MS)
  }

  // the tour begins once the lake is on screen: desktop 0.7 s after the page's `ready`; a phone layout after its Home pick.
  // Which of the two is decided when `ready` arrives and again on resize, not once at mount.
  useEffect(() => {
    let ready = sentEvents.has('ready'), begun = false
    const begin = (ms) => { if (begun) return; begun = true; later(start, ms) }
    const arm = () => { if (ready && !begun && !phoneNow()) begin(700) }
    const on = (e) => {
      const d = e.detail; if (!d) return
      if (d.event === 'ready') { ready = true; arm() }
      if (d.event === 'view' && d.data?.source === 'home' && ready) begin(300)
    }
    window.addEventListener('accuphy-lab', on); window.addEventListener('resize', arm)
    arm()
    return () => { window.removeEventListener('accuphy-lab', on); window.removeEventListener('resize', arm) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // the panel is locked while the tour runs (tour.css), the lake dimmed
  useEffect(() => { document.body.classList.toggle('lab-tour', phase === 'running'); return () => document.body.classList.remove('lab-tour') }, [phase])

  // what completes the current stop
  useEffect(() => {
    if (phase !== 'running' || vis !== 'in') return
    if (stop.action === 'drag') {
      let from = null
      const down = (e) => { if (onCanvas(e)) from = [e.clientX, e.clientY] }
      const move = (e) => { if (from && Math.hypot(e.clientX - from[0], e.clientY - from[1]) >= (phone ? 0 : DRAG_PX)) { from = null; complete() } }
      const up = () => { if (phone && from) complete(); from = null }
      window.addEventListener('pointerdown', down, true); window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', up, true)
      return () => { window.removeEventListener('pointerdown', down, true); window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', up, true) }
    }
    if (stop.action === 'tile' && !phone) {
      const on = (e) => { if (e.detail?.event === 'view' && e.detail.data?.view === stop.view) complete() }
      window.addEventListener('accuphy-lab', on)
      return () => window.removeEventListener('accuphy-lab', on)
    }
  }, [phase, vis, i]) // eslint-disable-line react-hooks/exhaustive-deps

  // the pulse ring follows the boat (the lake moves the cue caption to the boat every frame; the ring sits on its anchor)
  useEffect(() => {
    if (phase !== 'running' || stop.action !== 'drag' || vis === 'hidden') return
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const cue = cueEl(), el = ring.current
      if (!cue || !el) return
      const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(cue.style.transform)
      if (!m) return
      el.style.transform = `translate(${(+m[1] + (phone ? 6 : 10)).toFixed(1)}px, ${(+m[2] + (phone ? 24 : 36)).toFixed(1)}px) translate(-50%, -50%)` // the caption's anchor sits a little above and left of the hull
      el.style.opacity = '1'
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [phase, vis, i]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'idle') return null
  return (
    <div className={`lab-tour-layer ${phone ? 'is-phone' : ''}`} style={SLOW > 1 ? { '--tour-k': SLOW } : undefined} aria-live="polite">
      {tileIdx > 0 && <style>{`body.lab-tour .ac-views .ac-view:nth-child(${tileIdx}){pointer-events:auto;opacity:1;animation:lab-tour-pulse 1.6s ease-out infinite}`}</style>}
      {phase === 'running' && (<>
        <div className={`lab-tour-card is-${vis}`}>
          <div className="lab-tour-title">{(phone && stop.phoneTitle) || stop.title}</div>
          <div className="lab-tour-text">{stop.text}</div>
          <div className="lab-tour-dots">{script.stops.map((_, k) => <i key={k} className={k < i || (k === i && vis === 'check') ? 'is-done' : k === i ? 'is-on' : ''} />)}</div>
          {phone && stop.action === 'tile' && <button type="button" className="lab-tour-next" onClick={complete}>Next →</button>}
        </div>
        {stop.action === 'drag' && <div ref={ring} className="lab-tour-ring" style={{ opacity: 0 }} aria-hidden="true" />}
        <button type="button" className="lab-tour-corner" onClick={skip}>Skip tour</button>
      </>)}
      {phase === 'done' && <button type="button" className="lab-tour-corner" onClick={start}>↻ Replay tour</button>}
    </div>
  )
}
