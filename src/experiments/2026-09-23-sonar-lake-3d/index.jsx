import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import LakeScene from './Scene'
import { DEVICES, FT, MODE_LABELS } from '../2026-09-23-sonar-beam/devices'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'
import { PHONE_POSE } from './SonarScreen'

export const meta = {
  title: 'Sonar lake 3D — Phase 3/4',
  description: '3D lake with real-scale structure and NA fish; PL/PLM beam volumes reveal the bottom; the app screen (computed from the scene) on an iPhone. Drag the boat.',
}

export default function SonarLake3D() {
  const [deviceId, setDeviceId] = useState('PL')
  const [mode, setMode] = useState('forward')
  const [rangeFt, setRangeFt] = useState(80)
  const [imperial, setImperial] = useState(true)
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
  state.current.imperial = imperial
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
    { n: 2, title: 'This is what your phone shows', text: 'The screen is that curtain, seen edge-on: bottom, timber, fish. Forward View aims it ahead of the boat.', device: 'PL', mode: 'forward', range: 80, boat: [8, -18] },
    { n: 3, title: 'Which view, when', text: 'Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below.', device: 'PL', mode: 'panoramic', range: 160, boat: [-50, 8] }, // on the 5 m shelf, scanning toward the drop-off: the flat fan paints the bottom
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

      {/* ---- control panel — styled after shop.accuphy.com (Eurostile uppercase, square blue outline buttons) ---- */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="ac-panel pointer-events-auto absolute inset-x-3 bottom-3 flex flex-col gap-3 p-3 sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-11 sm:w-[400px] sm:p-4">
        <div className="flex items-center justify-between">
          <img src="/brand/logo/logo_OG.png" alt="Accuphy" className="h-5 w-auto" draggable={false} />
          <span className="ac-label">Live sonar · beam explorer</span>
        </div>
        <Row label="Device">
          <div className="ac-seg">{Object.values(DEVICES).map((d) => <button key={d.id} className={`ac-btn ${deviceId === d.id ? 'is-active' : ''}`} onClick={() => setDeviceId(d.id)}>{d.name}</button>)}</div>
        </Row>
        <Row label="View">
          <div className="ac-seg flex-wrap">{device.modes.map((m) => <button key={m} className={`ac-btn ${mode === m ? 'is-active' : ''}`} onClick={() => setMode(m)}>{MODE_LABELS[m]}</button>)}</div>
        </Row>
        <Row label="Range">
          <input type="range" min={20} max={maxFt} step={5} value={rangeFt} onChange={(e) => setRangeFt(+e.target.value)} className="ac-range w-36" />
          <button className="font-brand-head text-[15px] text-[#028cdf]" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(rangeFt)}</button>
          <span className="text-[11px] text-neutral-500">max {fmt(maxFt)}</span>
        </Row>
        <div className="hidden text-[11px] leading-snug text-neutral-600 sm:block">
          {device.name} · {device.beamDeg}° × {device.thickDeg}° beam. Drag the boat — whatever the beam touches lights up.
        </div>
      </motion.div>

      {/* ---- drag hint: follows the boat until the first drag (position set by the render loop) ---- */}
      <div ref={(el) => { state.current.hintEl = el }} className="ac-hint pointer-events-none absolute left-0 top-0 flex items-center gap-2 px-3 py-1.5" style={{ opacity: 0 }}>
        <svg className="hand" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#028cdf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>
        <span className="font-brand-head text-[11px] uppercase tracking-wider">Drag the boat</span>
      </div>

      {/* ---- iPhone Pro Max, landscape, slightly turned in 3D (same pose as the GL picture) ---- */}
      <div ref={(el) => { sonarRect.current.frame = el }} className="pointer-events-none absolute right-[4vw] bottom-[240px] w-[88vw] sm:right-[28px] sm:bottom-[24px] sm:w-[min(38vw,560px)]" style={{ aspectRatio: '19.5 / 9' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transform: `perspective(${PHONE_POSE.perspective}px) rotateY(${PHONE_POSE.rotY}deg) rotateX(${PHONE_POSE.rotX}deg)` }}>
          {/* titanium band with a faint edge highlight, then the black inner bezel ring, then the display hole */}
          <div style={{ ...ring('1.6%'), borderRadius: '10.5% / 22%',
            background: 'linear-gradient(135deg, #f4f4f2 0%, #c6c6c3 18%, #ebebe8 40%, #9a9a96 62%, #e0dedb 82%, #b4b3af 100%)',
            boxShadow: '14px 22px 40px rgba(0,0,0,0.5), -2px -2px 3px rgba(255,255,255,0.5) inset' }} />
          <div style={{ ...ring('1.7%'), inset: '1.6%', borderRadius: '9.5% / 20%', background: '#060606' }} />
          <div ref={(el) => { sonarRect.current.el = el }} style={{ position: 'absolute', inset: '3.3%', borderRadius: '8% / 17%' }}>
            <div className="absolute left-[8%] top-[5%] flex items-center gap-2">
              <img src="/brand/logo/White Accuphy Logo.png" alt="" className="h-[11px] w-auto opacity-90" draggable={false} />
              <span className="text-[10px] text-white/80">{device.name} · {MODE_LABELS[mode]}</span>
            </div>
            <div className="absolute right-[4%] top-[5%] text-[10px] tabular-nums text-white/80">{fmt(rangeFt)}</div>
          </div>
          <div style={{ position: 'absolute', left: '4.6%', top: '50%', width: '2.2%', height: '22%', transform: 'translateY(-50%)', borderRadius: 999, background: '#000', boxShadow: '0 0 0 1px #111' }} />
        </div>
      </div>

      {/* ---- guide strip (website card style) ---- */}
      <div className="pointer-events-auto absolute right-[28px] top-4 hidden w-[min(600px,42vw)] items-stretch gap-2 md:flex">
        {STEPS.map((st, i) => (
          <button key={st.n} onClick={() => goStep(i)} className={`ac-card flex-1 px-3 py-2 text-left transition ${step === i ? 'is-active' : ''}`}>
            <div className="ac-label" style={{ color: step === i ? '#fff' : undefined }}>Step {st.n}</div>
            <div className="text-[13px] font-semibold leading-tight">{st.title}</div>
            {step === i && <div className="mt-1 text-[11px] leading-snug opacity-90">{st.text}</div>}
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
