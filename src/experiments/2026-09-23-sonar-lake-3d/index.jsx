import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import LakeScene from './Scene'
import { DEVICES, FT, MODE_LABELS } from '../2026-09-23-sonar-beam/devices'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'
import { PHONE_POSE } from './SonarScreen'
import { COLORMAP_NAMES } from './colormaps'
import SonarChrome from './SonarChrome'
import { screenLayout } from './SonarScreen'
// dev: ?bigphone makes the phone huge so the sonar picture can be inspected in screenshots
const BIG_PHONE = import.meta.env.DEV && window.location.search.includes('bigphone')
// The page is for people who have never used live sonar (Jason 2026-09-24): only Device / View / Range are
// public. Colour map, gain, contrast, noise reject and the depth-range axis are calibration tools — dev only (?dev).
const DEV_TOOLS = import.meta.env.DEV && window.location.search.includes('dev')

export const meta = {
  title: 'Sonar lake 3D — Phase 3/4',
  description: '3D lake with real-scale structure and NA fish; PL/PLM beam volumes reveal the bottom; the app screen (computed from the scene) on an iPhone. Drag the boat.',
}

export default function SonarLake3D() {
  const [deviceId, setDeviceId] = useState('PL')
  const [mode, setMode] = useState('forward')
  const [rangeFt, setRangeFt] = useState(80)
  const [depthFt, setDepthFt] = useState(70) // PL Forward depth range (app: 12 m at 14 m range)
  const [imperial, setImperial] = useState(true)
  const [colormap, setColormap] = useState('garmin_amber') // LiveScope-measured amber (§7.7); the app's own 'orange' is Moreland_Black_Body
  const [gain, setGain] = useState(0.57)
  const [contrast, setContrast] = useState(0.4)    // demo look (sonar-style.md §6.5): floor mostly gone, a trace of noise stays
  const [noise, setNoise] = useState(0.3)          // noise reject (inset cleaner than real use, decision #28): the smaller of the two, used last
  const [, tick] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => tick(1)); return () => cancelAnimationFrame(id) }, [])

  const device = DEVICES[deviceId]
  const maxFt = device.maxRangeFt
  useEffect(() => {
    if (!device.modes.includes(mode)) setMode('down')
    if (rangeFt > maxFt) setRangeFt(maxFt)
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const specs = useMemo(() => wedgeSpecs(device, mode, rangeFt * FT), [device, mode, rangeFt])
  const specKey = `${deviceId}-${mode}-${rangeFt}`
  const layout = useMemo(() => screenLayout(deviceId, mode, rangeFt * FT, 2.08, specs, depthFt * FT), [deviceId, mode, rangeFt, depthFt, specs]) // display aspect = phone frame aspect

  const b0 = (/boat=(-?[\d.]+),(-?[\d.]+)/.exec(window.location.search) || []).slice(1).map(Number) // dev: ?boat=x,z
  const state = useRef({
    boat: { x: b0[0] ?? -6, z: b0[1] ?? 4 }, target: { x: b0[0] ?? -6, z: b0[1] ?? 4 }, apex: new THREE.Vector3(), dragging: false,
    parallax: { x: 0, y: 0 }, specs, specKey,
    closeCam: window.location.search.includes('cam=boat'),
    fishCam: (/cam=fish:(\w+)/.exec(window.location.search) || [])[1],
    fishCamIndex: +((/cam=fish:\w+:(\d+)/.exec(window.location.search) || [])[1] || 0),
  })
  state.current.specs = specs
  state.current.specKey = specKey
  state.current.rangeM = rangeFt * FT
  state.current.depthM = depthFt * FT
  state.current.imperial = imperial
  state.current.colormap = colormap
  state.current.gain = gain
  state.current.contrast = contrast
  state.current.noise = noise
  state.current.mode = mode
  state.current.deviceId = deviceId
  // the sonar picture is drawn by the GL canvas into the phone's screen element
  const sonarRect = useRef({ el: null, frame: null })

  const onMove = (e) => {
    const s = state.current
    s.parallax.x = (e.clientX / window.innerWidth - 0.5) * 2
    s.parallax.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  const fmt = (ft) => (imperial ? `${Math.round(ft)} ft` : `${(ft * FT).toFixed(1)} m`)

  // the three-step guide (docs/3d-beam-reference.md §3): each step is a preset
  const [step, setStep] = useState(0)
  const STEPS = [
    { n: 1, title: 'This is the beam', text: 'A thin curtain of sound under the boat. Drag the boat — whatever the curtain touches lights up.', device: 'PL', mode: 'down', range: 80, boat: [-20, 6] },
    { n: 2, title: 'This is what your phone shows', text: 'The screen is that curtain, seen edge-on: bottom, timber, fish. Forward View aims it ahead of the boat.', device: 'PL', mode: 'forward', range: 60, boat: [16, 11] }, // standing timber + bass 8–15 m ahead on the 7 m flat
    { n: 3, title: 'Which view, when', text: 'Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below.', device: 'PL', mode: 'panoramic', range: 70, boat: [-50, 8] }, // on the 5 m shelf, scanning toward the drop-off: the flat fan paints the bottom
  ]
  const goStep = (i) => {
    const st = STEPS[i]; setStep(i); setDeviceId(st.device); setMode(st.mode); setRangeFt(st.range)
    state.current.target.x = st.boat[0]; state.current.target.z = st.boat[1]
  }

  return (
    <main className="font-brand fixed inset-0 select-none overflow-hidden bg-[#9cc1cf] text-white" onPointerMove={onMove}>
      <div className="absolute inset-0 touch-none">
        <LakeScene state={state} sonarRect={sonarRect} />
      </div>

      {/* ---- control panel — Apple-style frosted glass over the lake (Jason 2026-09-24) ---- */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="ac-panel pointer-events-auto absolute inset-x-3 bottom-3 flex flex-col gap-3 p-3.5 sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-14 sm:w-[400px] sm:p-4">
        <div className="flex items-center justify-between px-1 pt-0.5">
          <img src="/brand/logo/White Accuphy Logo.png" alt="Accuphy" className="h-[18px] w-auto drop-shadow-[0_1px_2px_rgba(0,20,30,0.25)]" draggable={false} />
          <span className="ac-title">Beam explorer</span>
        </div>
        <div className="ac-divider" />
        <Row label="Device">
          <div className="ac-seg">{Object.values(DEVICES).map((d) => <button key={d.id} className={`ac-btn ${deviceId === d.id ? 'is-active' : ''}`} onClick={() => setDeviceId(d.id)}>{d.name}</button>)}</div>
        </Row>
        <Row label="View">
          <div className="ac-seg">{device.modes.map((m) => <button key={m} className={`ac-btn ${mode === m ? 'is-active' : ''}`} onClick={() => setMode(m)}>{MODE_LABELS[m].replace(' View', '')}</button>)}</div>
        </Row>
        <Row label="Range">
          <input type="range" min={20} max={maxFt} step={5} value={rangeFt} onChange={(e) => setRangeFt(+e.target.value)} className="ac-range w-36" style={{ '--fill': `${((rangeFt - 20) / (maxFt - 20)) * 100}%` }} />
          <button className="ac-value" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(rangeFt)}</button>
          <span className="ac-soft text-[11px]">max {fmt(maxFt)}</span>
        </Row>
        {DEV_TOOLS && deviceId === 'PL' && mode === 'forward' && (
          <Row label="Depth">
            <input type="range" min={20} max={device.maxDepthFt} step={5} value={depthFt} onChange={(e) => setDepthFt(+e.target.value)} className="ac-range w-36" style={{ '--fill': `${((depthFt - 20) / (device.maxDepthFt - 20)) * 100}%` }} />
            <span className="ac-value">{fmt(depthFt)}</span>
            <span className="ac-soft text-[11px]">depth axis</span>
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
          {device.name} · {device.beamDeg}° × {device.thickDeg}° beam. Drag the boat — whatever the beam touches lights up.
        </div>
      </motion.div>

      {/* ---- drag hint: follows the boat until the first drag (position set by the render loop) ---- */}
      <div ref={(el) => { state.current.hintEl = el }} className="ac-hint pointer-events-none absolute left-0 top-0 flex items-center gap-2 px-3.5 py-2" style={{ opacity: 0 }}>
        <svg className="hand" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#028cdf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>
        <span className="font-brand-head text-[11px] uppercase tracking-wider">Drag the boat</span>
      </div>

      {/* ---- iPhone Pro Max, landscape, turned slightly in 3D (same pose as the GL picture).
           Proportions from the 15/16 Pro Max: body 2.08:1, corner radius ≈ 14 % of the short side,
           thin uniform bezel, Dynamic Island on the left in landscape, volume/action buttons on top,
           power button below; brushed titanium band; faint glass reflection over the display. ---- */}
      <div ref={(el) => { sonarRect.current.frame = el }} className={`pointer-events-none absolute right-[4vw] bottom-[240px] w-[88vw] sm:right-[28px] sm:bottom-[24px] ${BIG_PHONE ? 'sm:w-[min(88vw,1400px)]' : 'sm:w-[min(38vw,560px)]'}`} style={{ aspectRatio: '2.08 / 1' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transform: `perspective(${PHONE_POSE.perspective}px) rotateY(${PHONE_POSE.rotY}deg) rotateX(${PHONE_POSE.rotX}deg)` }}>
          {/* side buttons (on the top edge in landscape: action + volume; power on the bottom edge) */}
          <div className="ph-btn" style={{ left: '14%', top: '-1.2%', width: '2.2%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '19.5%', top: '-1.2%', width: '4.6%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '25.5%', top: '-1.2%', width: '4.6%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '22%', bottom: '-1.2%', width: '7%', height: '1.6%' }} />
          {/* titanium band (ring), inner black bezel (ring), display hole */}
          <div className="ph-band" style={{ ...ring('1.35%'), borderRadius: '6.6% / 13.8%', boxShadow: '16px 26px 44px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 0 0 2px rgba(0,0,0,0.12)' }} />
          <div style={{ ...ring('1.25%'), inset: '1.35%', borderRadius: '6.1% / 12.7%', background: '#040404' }} />
          <div ref={(el) => { sonarRect.current.el = el }} style={{ position: 'absolute', inset: '2.6%', borderRadius: '5.4% / 11.3%', containerType: 'size', overflow: 'hidden' }}>
            <SonarChrome layout={layout} deviceId={deviceId} mode={mode} rangeFt={rangeFt} depthFt={depthFt} imperial={imperial} gain={gain} depthRef={(el) => { state.current.depthEl = el }} />
            <div className="ph-glass" />
          </div>
          {/* antenna lines in the titanium band (two per long edge, like the Pro Max) */}
          {[['16%', 'top'], ['84%', 'top'], ['16%', 'bottom'], ['84%', 'bottom']].map(([l, side]) => (
            <div key={l + side} style={{ position: 'absolute', left: l, [side]: 0, width: '0.35%', height: '1.35%', background: 'rgba(0,0,0,0.55)', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.15)' }} />
          ))}
          {/* Dynamic Island: vertical pill on the left in landscape */}
          <div style={{ position: 'absolute', left: '4.1%', top: '50%', width: '2.4%', height: '20%', transform: 'translateY(-50%)', borderRadius: 999, background: '#000', boxShadow: '0 0 0 1px #0a0a0a' }} />
        </div>
      </div>

      {/* ---- guide strip ---- */}
      <div className="pointer-events-auto absolute right-[28px] top-4 hidden w-[min(620px,44vw)] items-stretch gap-2.5 md:flex">
        {STEPS.map((st, i) => (
          <button key={st.n} onClick={() => goStep(i)} className={`ac-card flex-1 px-3.5 py-3 text-left ${step === i ? 'is-active' : ''}`}>
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
