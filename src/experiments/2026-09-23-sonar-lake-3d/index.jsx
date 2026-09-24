import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import LakeScene from './Scene'
import { DEVICES, FT, MODE_LABELS } from '../2026-09-23-sonar-beam/devices'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'

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

  const state = useRef({
    boat: { x: -6, z: 4 }, target: { x: -6, z: 4 }, apex: new THREE.Vector3(), dragging: false,
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
  const sonarRect = useRef({ el: null })

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

      {/* ---- control panel, Accuphy brand ---- */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto absolute inset-x-3 bottom-3 flex flex-col gap-2 rounded-2xl bg-[#0f1216]/80 p-3 text-sm shadow-xl ring-1 ring-white/10 backdrop-blur-md sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-4 sm:w-[420px] sm:gap-3 sm:p-4">
        <div className="flex items-center justify-between">
          <img src="/brand/logo/White Accuphy Logo.png" alt="Accuphy" className="h-5 w-auto" draggable={false} />
          <span className="font-brand-head text-[11px] uppercase tracking-[0.18em] text-[#0d8fdb]">Live sonar · beam explorer</span>
        </div>
        <Row label="Device">
          {Object.values(DEVICES).map((d) => <Btn key={d.id} active={deviceId === d.id} onClick={() => setDeviceId(d.id)}>{d.name}</Btn>)}
        </Row>
        <Row label="View">
          {device.modes.map((m) => <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{MODE_LABELS[m]}</Btn>)}
        </Row>
        <Row label="Range">
          <input type="range" min={20} max={maxFt} step={5} value={rangeFt} onChange={(e) => setRangeFt(+e.target.value)} className="w-40 accent-[#0d8fdb]" />
          <button className="tabular-nums font-semibold text-[#5fc3ff]" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(rangeFt)}</button>
          <span className="text-neutral-500">max {fmt(maxFt)}</span>
        </Row>
        <div className="hidden text-[11px] leading-snug text-neutral-400 sm:block">
          {device.name} · {device.beamDeg}° × {device.thickDeg}° beam · drag the boat, the beam reveals what is under it
        </div>
      </motion.div>

      {/* ---- iPhone Pro Max (landscape, natural titanium) showing the Accuphy Sonar App.
           The bezels are RINGS (CSS mask with a hole) so the GL canvas underneath shows
           through the display area, where SonarScreen draws the picture. ---- */}
      <div className="pointer-events-none absolute right-[4vw] bottom-[200px] w-[92vw] sm:right-[18px] sm:bottom-[18px] sm:w-[min(38vw,560px)]">
        <div style={{ position: 'relative', aspectRatio: '19.5 / 9' }}>
          <div style={{ ...ring('1.6%'), borderRadius: '10.5% / 22%',
            background: 'linear-gradient(135deg, #f4f4f2 0%, #c6c6c3 18%, #ebebe8 40%, #9a9a96 62%, #e0dedb 82%, #b4b3af 100%)',
            boxShadow: '0 18px 40px rgba(0,0,0,0.45)' }} />
          <div style={{ ...ring('1.7%'), inset: '1.6%', borderRadius: '9.5% / 20%', background: '#060606' }} />
          {/* the display hole: SonarScreen renders the sonar picture exactly here */}
          <div ref={(el) => { sonarRect.current.el = el }} style={{ position: 'absolute', inset: '3.3%', borderRadius: '8% / 17%' }}>
            <div className="absolute left-[8%] top-[5%] flex items-center gap-2">
              <img src="/brand/logo/White Accuphy Logo.png" alt="" className="h-[11px] w-auto opacity-90" draggable={false} />
              <span className="text-[10px] text-white/80">{device.name} · {MODE_LABELS[mode]}</span>
            </div>
            <div className="absolute right-[4%] top-[5%] text-[10px] tabular-nums text-white/80">{fmt(rangeFt)}</div>
          </div>
          {/* dynamic island (landscape: on the left) */}
          <div style={{ position: 'absolute', left: '4.6%', top: '50%', width: '2.2%', height: '22%', transform: 'translateY(-50%)', borderRadius: 999, background: '#000', boxShadow: '0 0 0 1px #111' }} />
        </div>
      </div>
      {/* ---- guide strip ---- */}
      <div className="pointer-events-auto absolute right-[18px] top-4 hidden w-[min(600px,42vw)] items-stretch gap-2 md:flex">
        {STEPS.map((st, i) => (
          <button key={st.n} onClick={() => goStep(i)}
            className={`flex-1 rounded-xl px-3 py-2 text-left ring-1 backdrop-blur-md transition ${step === i ? 'bg-[#0d8fdb]/85 text-white ring-white/30' : 'bg-[#0f1216]/70 text-white/85 ring-white/10 hover:bg-[#0f1216]/85'}`}>
            <div className="font-brand-head text-[11px] uppercase tracking-wider opacity-80">Step {st.n}</div>
            <div className="text-[13px] font-semibold leading-tight">{st.title}</div>
            {step === i && <div className="mt-1 text-[11px] leading-snug text-white/85">{st.text}</div>}
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-14 text-xs uppercase tracking-wider text-neutral-400">{label}</span>
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
