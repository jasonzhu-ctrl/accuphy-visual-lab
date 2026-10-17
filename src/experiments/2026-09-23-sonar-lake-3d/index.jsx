import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import LakeScene from './Scene'
import { DEVICES, FT, MODE_LABELS, ICE_MODES } from '../2026-09-23-sonar-beam/devices'
import { iceParams, ICE_START, VIEWS } from './iceScene'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'
import { phonePose, isPhoneLayout } from './SonarScreen'
import { COLORMAP_NAMES } from './colormaps'
import SonarChrome from './SonarChrome'
import { screenLayout } from './SonarScreen'
import SignupGate from './SignupGate'
import { isSignedUp } from './signup'
import { depthAt } from './terrain'
import { panoHalfWidth } from './sonarMarks'
// dev: ?bigphone makes the phone huge so the sonar picture can be inspected in screenshots
const BIG_PHONE = import.meta.env.DEV && window.location.search.includes('bigphone')
// Build variant (Jason 2026-10-16): VITE_DEVICES='PLM' makes a PingLive Mini-only page — no device switch, the
// Mini is the device, the step presets use its views. Unset: both devices (the default Lab).
const ONLY_ENV = import.meta.env.VITE_DEVICES === 'PLM' ? 'PLM' : null
// Scene (Jason 2026-10-16: 做一个冰钓的版本): 'lake' = the boat; 'ice' = the frozen lake with the PingLive Mini in an auger hole
// (IceCamp.jsx). The ice page is its own gallery entry (2026-10-16-sonar-ice-3d) and a build variant, VITE_SCENE=ice.
const SCENE_ENV = import.meta.env.VITE_SCENE === 'ice' ? 'ice' : null
// The page is for people who have never used live sonar (Jason 2026-09-24): only Device / View / Range are
// public. Colour map, gain, contrast, noise reject and the depth-range axis are calibration tools — dev only (?dev).
const DEV_TOOLS = import.meta.env.DEV && window.location.search.includes('dev')

// AUTO depth range (PL Forward), as the app does it (Jason 2026-09-24: 声纳是根据他垂直往下的深度来判断深度的
// 然后auto depth是根据这个数字去调节画面depth range的): AUTO follows the depth READOUT — the water straight below
// the transducer, the big number on the screen — and sets the depth range so that bottom sits at ~80 % of the
// screen height, in the app's depth-range steps (8 · 9 · 10 · 12 · 14 · 16 · 18 m …, docs/app-chrome.md).
// A deeper bottom ahead may run off the screen, like in the app. (The first version took the deepest bottom
// anywhere in the picture; over a drop-off that counted water hidden behind the shelf edge, 80 ft over 18 ft.)
const DEPTH_STEPS_M = [6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 25, 30, 35, 40, 45, 50, 60, 70]
const DEPTH_STEPS_FT = [20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 200, 220, 240]
// Down view is fully AUTO on both devices (Jason 2026-09-25, PL Down at 145 ft over 61 ft of water: 像这种情况 auto
// depth就好像没用一样 自动调整了以后有效画面应该在屏幕上会更大). In Down the depth axis IS the range, so the range
// follows the AUTO depth (bottom at ~80 % of the height) instead of only rising when the bottom would leave the screen
// (#52, which let a visitor's long range leave half the screen empty). The Range slider is greyed out there.
function autoDepthFt(s, maxFt) {
  const readoutM = depthAt(s.apex.x, s.apex.z) // the same number as the depth readout on the phone
  const needM = readoutM / 0.8
  const steps = s.imperial ? DEPTH_STEPS_FT.map((ft) => ft * FT) : DEPTH_STEPS_M
  const m = steps.find((v) => v >= needM - 1e-6) ?? steps[steps.length - 1]
  return Math.min(maxFt, m / FT)
}

export const meta = {
  title: 'Sonar lake 3D — Phase 3/4',
  description: '3D lake with real-scale structure and NA fish; PL/PLM beam volumes reveal the bottom; the app screen (computed from the scene) on an iPhone. Drag the boat.',
}

export default function SonarLake3D({ scene: sceneProp }) {
  const scene = sceneProp || SCENE_ENV || (/[?&]scene=ice/.test(window.location.search) ? 'ice' : 'lake')
  const ICE = scene === 'ice'
  const ONLY = ICE ? 'PLM' : ONLY_ENV // on the ice the Mini is the device: the app's ice views are the Mini's
  const SHOWN_DEVICES = ONLY ? [DEVICES[ONLY]] : Object.values(DEVICES)
  const [deviceId, setDeviceId] = useState(ONLY || 'PL')
  const [mode, setMode] = useState(ICE ? 'liveice' : 'forward')
  const [view, setView] = useState(ICE ? iceParams().view : 'top') // ice page cameras: top / under the ice / section (docs/ice-relationship-study.md)
  // the ice page: the step cards stack under the control panel, so the ice band across the top stays open for taps
  const panelRef = useRef(null)
  const [cardsTop, setCardsTop] = useState(340)
  useEffect(() => {
    if (!ICE) return
    const m = () => { const el = panelRef.current; if (el) setCardsTop(el.offsetTop + el.offsetHeight + 12) }
    m(); const id = setTimeout(m, 400); window.addEventListener('resize', m)
    return () => { clearTimeout(id); window.removeEventListener('resize', m) }
  }, [ICE, view, mode])
  const [rangeFt, setRangeFt] = useState(80)       // the visitor's own range (slider)
  const [depthFt, setDepthFt] = useState(70) // depth range (PL Forward; every PLM view) — driven by AUTO below
  const [autoDepth, setAutoDepth] = useState(true) // off only when the dev Depth slider is touched
  const [gate, setGate] = useState(false)          // sign-up gate open → the lake and the sonar picture freeze
  const [toast, setToast] = useState(false)
  const toastT = useRef(0)
  const [imperial, setImperial] = useState(true)
  const [colormap, setColormap] = useState('garmin_amber') // LiveScope-measured amber (§7.7); the app's own 'orange' is Moreland_Black_Body
  const [gain, setGain] = useState(0.57)
  const [contrast, setContrast] = useState(0.4)    // demo look (sonar-style.md §6.5): floor mostly gone, a trace of noise stays
  const [noise, setNoise] = useState(0.3)          // noise reject (inset cleaner than real use, decision #28): the smaller of the two, used last
  const [, tick] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => tick(1)); return () => cancelAnimationFrame(id) }, [])
  // phone layout and phone pose follow the window width (rotate / resize)
  useEffect(() => { const on = () => tick((n) => n + 1); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])
  const phone = isPhoneLayout()

  const device = DEVICES[deviceId]
  const modes = ICE ? ICE_MODES : device.modes
  const maxFt = device.maxRangeFt
  useEffect(() => {
    if (!modes.includes(mode)) setMode(ICE ? 'liveice' : 'down')
    if (rangeFt > maxFt) setRangeFt(maxFt)
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Down and Forward run on AUTO depth, on both devices (PL Forward #41, PingLive Mini #60, PL Down #65). Down and
  // Forward share ONE depth range, so the bottom under the boat sits at the same height (~80 %) in both and does not
  // jump when the view changes (Jason 2026-09-25: 他们的底能不能尽量align一点呢). In Down the depth axis is the range,
  // so Down's range is that AUTO value. Combo keeps the app's own two scales (SonarScreen.jsx screenLayout).
  const autoDepthOn = autoDepth && mode !== 'panoramic' // Down, Forward and Combo's Down panel
  const downLike = mode === 'down' || mode === 'ice' || mode === 'liveice' // the ice views are the Down fan (+ the flasher): AUTO range too
  // the range everything uses: Down's is the AUTO depth range; Forward and Panoramic use the visitor's range
  const effRangeFt = downLike ? depthFt : rangeFt
  const specs = useMemo(() => {
    const rangeFt = effRangeFt
    const sp = wedgeSpecs(device, mode, rangeFt * FT)
    // PL Forward: the sound covers the whole picture box (range ahead × depth range down, sonar-style.md §6.9);
    // the curtain in the lake is that box, so it touches exactly what the phone shows
    if (deviceId === 'PL' && mode === 'forward' && sp[0]) { const R = rangeFt * FT, D = depthFt * FT; sp[0] = { ...sp[0], R: Math.hypot(R, D) * 1.001, box: { xMin: -0.25 * R, xMax: R, yMax: D } } }
    // Panoramic: the picture runs to its corners (range ahead × half-width sideways), so the curtain does too;
    // with the 5°–25° slab it then covers exactly what the screen shows (Jason 2026-09-24: coverage 错位)
    if (mode === 'panoramic' && sp[0]) { const R = rangeFt * FT; sp[0] = { ...sp[0], R: 1.6 * R, box: { xMin: -1e5, xMax: R, yMax: 1e5, zMax: panoHalfWidth * R } } }
    // PLM Forward: range ahead × AUTO depth down, the sound reaching the box's far corner like PL Forward, so the
    // bottom stays on the picture however deep the water is
    // PL Down: the app draws echoes over the whole 1:1 box (its lower corners too, sonar-style.md §6.9), so the sound
    // reaches the box corners and the bottom runs across the full width
    if (deviceId === 'PL' && mode === 'down' && sp[0]) { const D = rangeFt * FT, w = D * 2.08; sp[0] = { ...sp[0], R: Math.hypot(w / 2, D) * 1.001, box: { xMin: -w / 2, xMax: w / 2, yMax: D } } }
    // PLM Combo: the Down fan reaches its AUTO-depth panel, the Forward fan its 0.7 × range panel (SonarScreen.jsx)
    if (deviceId === 'PLM' && mode === 'combo' && sp[1]) {
      const R = rangeFt * FT, D = depthFt * FT, wd = (D * 2.08) / 2
      sp[0] = { ...sp[0], R: Math.hypot(0.8 * wd, D) * 1.001, box: { xMin: -0.2 * wd, xMax: 0.8 * wd, yMax: D } }
      sp[1] = { ...sp[1], R: Math.hypot(R, 0.7 * R) * 1.001, box: { xMin: -0.25 * R, xMax: R, yMax: 0.7 * R } }
    }
    if (deviceId === 'PLM' && mode === 'forward' && sp[0]) { const R = rangeFt * FT, D = depthFt * FT; sp[0] = { ...sp[0], R: Math.hypot(R, D) * 1.001, box: { xMin: -0.25 * R, xMax: R, yMax: D } } }
    return sp
  }, [device, deviceId, mode, effRangeFt, depthFt])
  const specKey = `${deviceId}-${mode}-${effRangeFt}`
  const layout = useMemo(() => screenLayout(deviceId, mode, effRangeFt * FT, 2.08, specs, depthFt * FT), [deviceId, mode, effRangeFt, depthFt, specs]) // display aspect = phone frame aspect

  const b0 = (/boat=(-?[\d.]+),(-?[\d.]+)/.exec(window.location.search) || []).slice(1).map(Number) // dev: ?boat=x,z
  // Phones open on the standing-timber flat (18 ft; bass, walleye and pike 8–15 m ahead), so the 50 m-wide phone view
  // shows structure and fish at once (Jason 2026-10-16: 手机版本这块地方没什么结构和鱼 … 只是改手机). Desktop keeps
  // (-6, 4) and the ice scene keeps its own start; ?boat= overrides all of them.
  const PHONE_START = [16, 11]
  const START = b0.length === 2 ? b0 : ICE ? ICE_START : phone ? PHONE_START : [-6, 4]
  const state = useRef({
    boat: { x: START[0], z: START[1] }, target: { x: START[0], z: START[1] }, apex: new THREE.Vector3(), dragging: false,
    frameX: phone && !ICE && b0.length !== 2 ? PHONE_START[0] - 1 : undefined, // phones: boat left, timber right, and the ACCUPHY LAB lockup (x −1…31 at z −52) fully in view (Jason 2026-10-16: 把 Accuphy Lab 露出来)
    parallax: { x: 0, y: 0 }, specs, specKey,
    closeCam: window.location.search.includes('cam=boat'), wreckCam: /cam=wreck/.test(window.location.search), logoCam: /cam=logo/.test(window.location.search),
    fishCam: (/cam=fish:(\w+)/.exec(window.location.search) || [])[1],
    fishCamIndex: +((/cam=fish:\w+:(\d+)/.exec(window.location.search) || [])[1] || 0),
  })
  state.current.specs = specs
  state.current.specKey = specKey
  state.current.rangeM = effRangeFt * FT
  state.current.depthM = depthFt * FT
  state.current.imperial = imperial
  state.current.colormap = colormap
  state.current.gain = gain
  state.current.contrast = contrast
  state.current.noise = noise
  state.current.mode = mode
  state.current.deviceId = deviceId
  state.current.view = view
  // the sonar picture is drawn by the GL canvas into the phone's screen element
  const sonarRect = useRef({ el: null, frame: null })

  // AUTO depth: deeper at once (the bottom never drops off the screen), shallower only after 1.5 s
  // so the axis does not pump while the boat crosses uneven bottom
  useEffect(() => {
    if (!autoDepthOn) return
    let lowSince = 0, lowMax = 0
    const id = setInterval(() => {
      const s = state.current
      if (s.apex.y === 0) return // the boat is not placed yet (first frame still compiling)
      const want = autoDepthFt(s, device.maxDepthFt), cur = s.depthM / FT, now = performance.now()
      if (want > cur + 0.01) { lowSince = 0; setDepthFt(want) }
      else if (want < cur - 0.01) {
        if (!lowSince) { lowSince = now; lowMax = want } else lowMax = Math.max(lowMax, want)
        if (now - lowSince > 1500) { lowSince = 0; setDepthFt(lowMax) }
      } else lowSince = 0
    }, 200)
    return () => clearInterval(id)
  }, [autoDepthOn, device, imperial])


  // the app's buttons on the phone are display-only: a tap asks for an email (once per browser)
  const onLocked = () => {
    // the friends test build has no sign-up gate (Jason 2026-09-26: 他能直接看 不要邮箱什么的): only the hint
    if (!import.meta.env.VITE_NO_GATE && !isSignedUp()) { setGate(true); return }
    setToast(true); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(false), 2400)
  }

  const onMove = (e) => {
    const s = state.current
    s.parallax.x = (e.clientX / window.innerWidth - 0.5) * 2
    s.parallax.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  const fmt = (ft) => (imperial ? `${Math.round(ft)} ft` : `${(ft * FT).toFixed(1)} m`)
  // phones: the range is changed with the app's own −/+ on the phone screen (Jason 2026-10-03), in steps
  const RANGE_STEPS_FT = [20, 30, 40, 50, 60, 70, 80, 100, 120, 150, 180, 200, 240]
  const stepRange = (dir) => {
    const steps = RANGE_STEPS_FT.filter((v) => v <= maxFt)
    const i = dir > 0 ? steps.findIndex((v) => v > rangeFt + 0.5) : steps.findLastIndex((v) => v < rangeFt - 0.5)
    if (i >= 0) setRangeFt(steps[i])
  }

  // the three-step guide (docs/3d-beam-reference.md §3): each step is a preset
  const [step, setStep] = useState(0)
  const STEPS = ICE ? [
    { n: 1, title: 'The beam under the ice', text: 'The PingLive Mini hangs in the hole and pings straight down. Tap the ice anywhere to drill a new hole — whatever the beam touches lights up.', device: 'PLM', mode: 'liveice', range: 60, boat: ICE_START },
    { n: 2, title: 'Watch them come in', text: 'The flasher is the dial: the bottom, your bait and every fish that rises, by depth around the ring. The panel beside it draws the same fish as marks.', device: 'PLM', mode: 'ice', range: 60, boat: [-8, -10] },
    { n: 3, title: 'Look ahead without drilling', text: 'Forward View turns the beam sideways: fish and structure 60 ft away, under ice you never cut.', device: 'PLM', mode: 'forward', range: 60, boat: [16, 11] },
  ] : [
    { n: 1, title: 'This is the beam', text: 'A thin curtain of sound under the boat. Drag the boat — whatever the curtain touches lights up.', device: 'PL', mode: 'down', range: 80, boat: [-20, 6] },
    { n: 2, title: 'This is what your phone shows', text: 'The screen is that curtain, seen edge-on: bottom, timber, fish. Forward View aims it ahead of the boat.', device: 'PL', mode: 'forward', range: 60, boat: [16, 11] }, // standing timber + bass 8–15 m ahead on the 7 m flat
    { n: 3, title: 'Which view, when', text: 'Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below.', device: 'PL', mode: 'panoramic', range: 70, boat: [-50, 8] }, // on the 5 m shelf, scanning toward the drop-off: the flat fan paints the bottom
  ].map((st) => (ONLY ? { ...st, device: ONLY, mode: st.mode === 'panoramic' ? 'combo' : st.mode, ...(st.mode === 'panoramic' ? { text: 'Combo shows Down and Forward side by side; Forward to cast at fish ahead; Down to fish straight below.' } : {}) } : st))
  const goStep = (i) => {
    const st = STEPS[i]; setStep(i); setDeviceId(st.device); setMode(st.mode); setRangeFt(st.range)
    state.current.target.x = st.boat[0]; state.current.target.z = st.boat[1]
    state.current.frameX = st.boat[0] + 14 // phones: re-centre the zoomed-out view on the preset (boat left, beam right)
  }

  return (
    <>
    <main inert={gate} aria-hidden={gate || undefined} className="font-brand fixed inset-0 select-none overflow-hidden bg-[#9cc1cf] text-white" style={ICE ? { background: iceParams().T.bg } : undefined} onPointerMove={onMove}>
      <div className="absolute inset-0 touch-none">
        <LakeScene state={state} sonarRect={sonarRect} paused={gate} scene={scene} />
      </div>

      {/* ---- control panel — Apple-style frosted glass over the lake (Jason 2026-09-24) ---- */}
      <motion.div ref={panelRef} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="ac-panel pointer-events-auto absolute flex flex-col gap-3 max-sm:hidden sm:left-4 sm:top-14 sm:w-[400px] sm:p-4">
        <div className="flex items-center justify-between px-1 pt-0.5">
          <img src="/brand/logo/White Accuphy Logo.png" alt="Accuphy" className="h-[18px] w-auto drop-shadow-[0_1px_2px_rgba(0,20,30,0.25)]" draggable={false} />
          <span className="ac-title">Lab</span>
        </div>
        <div className="ac-divider" />
        <Row label="Device">
          <div className="ac-seg">{SHOWN_DEVICES.map((d) => <button key={d.id} className={`ac-btn ${deviceId === d.id ? 'is-active' : ''}`} onClick={() => setDeviceId(d.id)}>{d.name}</button>)}</div>
        </Row>
        <Row label="View">
          <div className="ac-seg">{modes.map((m) => <button key={m} className={`ac-btn ${mode === m ? 'is-active' : ''}`} onClick={() => setMode(m)}>{MODE_LABELS[m].replace(' View', '')}</button>)}</div>
        </Row>
        {ICE && (
          <Row label="Camera">
            <div className="ac-seg">{VIEWS.map((v) => <button key={v} className={`ac-btn ${view === v ? 'is-active' : ''}`} onClick={() => setView(v)}>{{ top: 'Top', under: 'Under the ice', section: 'Section' }[v]}</button>)}</div>
          </Row>
        )}
        <Row label="Range">
          {/* Down: the range is the AUTO depth range, so the slider only shows it */}
          <input type="range" min={20} max={maxFt} step={5} value={effRangeFt} disabled={downLike} title={downLike ? 'AUTO: follows the water depth' : undefined} onChange={(e) => setRangeFt(+e.target.value)} className="ac-range w-36" style={{ '--fill': `${((effRangeFt - 20) / (maxFt - 20)) * 100}%`, opacity: downLike ? 0.45 : 1 }} />
          <button className="ac-value" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(effRangeFt)}</button>
          <span className="ac-soft text-[11px]">max {fmt(maxFt)}</span>
        </Row>
        {DEV_TOOLS && deviceId === 'PL' && mode === 'forward' && (
          <Row label="Depth">
            <input type="range" min={20} max={device.maxDepthFt} step={5} value={Math.round(depthFt)} onChange={(e) => { setAutoDepth(false); setDepthFt(+e.target.value) }} className="ac-range w-36" style={{ '--fill': `${((depthFt - 20) / (device.maxDepthFt - 20)) * 100}%` }} />
            <span className="ac-value">{fmt(depthFt)}</span>
            <button className={`ac-btn ${autoDepth ? 'is-active' : ''}`} onClick={() => setAutoDepth((v) => !v)}>auto</button>
          </Row>
        )}
        {DEV_TOOLS && (<>
        <Row label="Screen">
          <select value={colormap} onChange={(e) => setColormap(e.target.value)} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11.5px] text-white/90">
            {COLORMAP_NAMES.map((n) => <option key={n} value={n} className="bg-[#0f1216]">{n}</option>)}
          </select>
          <span className="ac-label">gain</span>
          <input type="range" min={0.3} max={1} step={0.05} value={gain} onChange={(e) => setGain(+e.target.value)} className="ac-range w-20" style={{ '--fill': `${((gain - 0.3) / 0.7) * 100}%` }} />
          <span className="ac-value text-[13px]">{Math.round(gain * 100)}%</span>
        </Row>
        <Row label="Tune">
          <span className="ac-label">contrast</span>
          <input type="range" min={0} max={1} step={0.05} value={contrast} onChange={(e) => setContrast(+e.target.value)} className="ac-range w-20" style={{ '--fill': `${contrast * 100}%` }} />
          <span className="ac-value text-[13px]">{Math.round(contrast * 100)}%</span>
          <span className="ac-label">noise</span>
          <input type="range" min={0} max={1} step={0.05} value={noise} onChange={(e) => setNoise(+e.target.value)} className="ac-range w-20" style={{ '--fill': `${noise * 100}%` }} />
          <span className="ac-value text-[13px]">{Math.round(noise * 100)}%</span>
        </Row>
        </>)}
        <div className="ac-soft hidden px-1 text-[11.5px] leading-snug sm:block">
          {device.name} · {device.beamDeg}° × {device.thickDeg}° beam{ICE ? ', through the ice. Tap the ice to drill a new hole' : '. Drag the boat'} — whatever the beam touches lights up.
        </div>
      </motion.div>

      {/* ---- drag hint: follows the boat until the first drag (position set by the render loop) ---- */}
      <div ref={(el) => { state.current.hintEl = el }} className="ac-hint pointer-events-none absolute left-0 top-0 flex items-center gap-2 px-3.5 py-2" style={{ opacity: 0 }}>
        <svg className="hand" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#028cdf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>
        <span className="font-brand-head text-[11px] uppercase tracking-wider">{ICE ? 'Tap the ice to drill' : 'Drag the boat'}</span>
      </div>

      {/* ---- iPhone Pro Max, landscape, turned slightly in 3D (same pose as the GL picture).
           Proportions from the 15/16 Pro Max: body 2.08:1, corner radius ≈ 14 % of the short side,
           thin uniform bezel, Dynamic Island on the left in landscape, volume/action buttons on top,
           power button below; brushed titanium band; faint glass reflection over the display. ---- */}
      <div ref={(el) => { sonarRect.current.frame = el }} className={`pointer-events-none absolute inset-x-3 bottom-[calc(14px+env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-[28px] sm:bottom-[24px] ${BIG_PHONE ? 'sm:w-[min(88vw,1400px)]' : 'sm:w-[min(38vw,560px)]'}`} style={{ aspectRatio: '2.08 / 1' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transform: `perspective(${phonePose().perspective}px) rotateY(${phonePose().rotY}deg) rotateX(${phonePose().rotX}deg)` }}>
          {/* side buttons (on the top edge in landscape: action + volume; power on the bottom edge) */}
          <div className="ph-btn" style={{ left: '14%', top: '-1.2%', width: '2.2%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '19.5%', top: '-1.2%', width: '4.6%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '25.5%', top: '-1.2%', width: '4.6%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '22%', bottom: '-1.2%', width: '7%', height: '1.6%' }} />
          {/* titanium band (ring), inner black bezel (ring), display hole */}
          <div className="ph-band" style={{ ...ring('1.35%'), borderRadius: '6.6% / 13.8%', boxShadow: '16px 26px 44px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 0 0 2px rgba(0,0,0,0.12)' }} />
          <div style={{ ...ring('1.25%'), inset: '1.35%', borderRadius: '6.1% / 12.7%', background: '#040404' }} />
          <div ref={(el) => { sonarRect.current.el = el }} style={{ position: 'absolute', inset: '2.6%', borderRadius: '5.4% / 11.3%', containerType: 'size', overflow: 'hidden' }}>
            <SonarChrome layout={layout} deviceId={deviceId} mode={mode} rangeFt={effRangeFt} depthFt={depthFt} imperial={imperial} gain={gain} autoDepth={autoDepth} autoRange={downLike} onRange={phone ? stepRange : undefined} phone={phone} onLocked={onLocked} depthRef={(el) => { state.current.depthEl = el }} />
            <div className="ph-glass" />
          </div>
          {/* antenna lines in the titanium band (two per long edge, like the Pro Max) */}
          {[['16%', 'top'], ['84%', 'top'], ['16%', 'bottom'], ['84%', 'bottom']].map(([l, side]) => (
            <div key={l + side} style={{ position: 'absolute', left: l, [side]: 0, width: '0.35%', height: '1.35%', background: 'rgba(0,0,0,0.55)', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.15)' }} />
          ))}
          {/* Dynamic Island: vertical pill on the left in landscape */}
          <div style={{ position: 'absolute', left: '4.1%', top: '50%', width: '2.4%', height: '20%', transform: 'translateY(-50%)', borderRadius: 999, background: '#000', boxShadow: '0 0 0 1px #0a0a0a' }} />
        </div>
        {/* phones: the View capsule sits on the phone frame's top edge (Jason 2026-10-03) — the big panel is gone */}
        {phone && (
          <div ref={(el) => { sonarRect.current.dock = el }} className="pointer-events-auto absolute bottom-full left-1/2 mb-2 -translate-x-1/2">
            <div className="ac-seg ac-seg-lg">{modes.map((m) => <button key={m} className={`ac-btn ${mode === m ? 'is-active' : ''}`} onClick={() => setMode(m)}>{MODE_LABELS[m].replace(' View', '')}</button>)}</div>
          </div>
        )}
        {/* after sign-up the app buttons stay display-only: a short hint above the phone instead of the gate */}
        <div role="status" aria-live="polite" className={`ac-hint absolute bottom-full right-0 mb-3 max-sm:mb-16 whitespace-nowrap px-3.5 py-2 text-[12px] font-medium transition-opacity duration-300 ${toast ? 'opacity-100' : 'opacity-0'}`}>
          {phone ? 'These are the app’s own controls — the range −/+ work.' : 'These are the app’s own controls — use the panel to change the view.'}
        </div>
      </div>

      {/* ---- phones: device switch, top right (the panel is hidden there) ---- */}
      {phone && !ONLY && (
        <div className="pointer-events-auto absolute right-3 top-4">
          <div className="ac-seg">{Object.values(DEVICES).map((d) => <button key={d.id} className={`ac-btn ${deviceId === d.id ? 'is-active' : ''}`} onClick={() => setDeviceId(d.id)}>{d.name}</button>)}</div>
        </div>
      )}

      {/* ---- guide strip ---- */}
      <div className={ICE ? 'pointer-events-auto absolute hidden flex-col gap-2 md:flex' : 'pointer-events-auto absolute right-[28px] top-4 hidden w-[min(620px,44vw)] items-stretch gap-2.5 md:flex'} style={ICE ? { left: 16, top: cardsTop, width: 400 } : undefined}>
        {STEPS.map((st, i) => (
          <button key={st.n} onClick={() => goStep(i)} className={`ac-card flex-1 text-left ${ICE ? 'px-3.5 py-2.5' : 'px-3.5 py-3'} ${step === i ? 'is-active' : ''}`}>
            <div className="flex items-center gap-2"><span className="ac-num">0{st.n}</span><span className="ac-label">Step</span></div>
            <div className="mt-1.5 text-[13.5px] font-semibold leading-tight">{st.title}</div>
            {step === i && <div className="ac-body mt-1.5 text-[11.5px] leading-snug">{st.text}</div>}
          </button>
        ))}
      </div>
      {import.meta.env.DEV && window.location.search.includes('debug') && (
        <pre ref={(el) => { state.current.debugEl = el }} className="pointer-events-none absolute left-2 top-1/2 rounded bg-black/60 p-1 text-[10px] text-lime-300" />
      )}
    </main>
    {gate && <SignupGate onDone={() => setGate(false)} />}
    </>
  )
}

// a filled box with a rectangular hole the size of its content box (CSS mask-composite)
function ring(pad) {
  return { position: 'absolute', inset: 0, padding: pad, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)' }
}
function Row({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="ac-label w-14">{label}</span>
      {children}
    </div>
  )
}
function Btn({ active, children, ...rest }) {
  return (
    <button {...rest} className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${active ? 'bg-[#0d8fdb] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]' : 'bg-white/8 text-white/85 hover:bg-white/15'}`}>
      {children}
    </button>
  )
}
