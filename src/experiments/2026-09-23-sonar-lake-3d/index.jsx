import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import LakeScene from './Scene'
import { DEVICES, FT, MODE_LABELS } from '../2026-09-23-sonar-beam/devices'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'
import { SPECIES } from './fish'

export const meta = {
  title: 'Sonar lake 3D — Phase 3',
  description: '3D lake with real-scale timber, rocks, wreck and NA fish; PL/PLM beam volumes reveal the bottom. Drag the boat.',
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
    parallax: { x: 0, y: 0 }, specs, specKey, closeCam: window.location.search.includes('cam=boat'), fishCam: (/cam=fish:(\w+)/.exec(window.location.search) || [])[1],
  })
  state.current.specs = specs
  state.current.specKey = specKey
  state.current.rangeM = rangeFt * FT
  state.current.imperial = imperial
  // sonar-screen inset: bottom-right, 34 % of the width, wider for PL's 135° fan
  const sonarRect = useRef({ w: 0.34, aspect: 0.6, margin: 16 })
  sonarRect.current.aspect = deviceId === 'PL' ? 0.6 : 0.78

  const onMove = (e) => {
    const s = state.current
    s.parallax.x = (e.clientX / window.innerWidth - 0.5) * 2
    s.parallax.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  const fmt = (ft) => (imperial ? `${Math.round(ft)} ft` : `${(ft * FT).toFixed(1)} m`)

  return (
    <main className="fixed inset-0 select-none overflow-hidden bg-[#9cc1cf] text-white" onPointerMove={onMove}>
      <div className="absolute inset-0 touch-none">
        <LakeScene state={state} sonarRect={sonarRect} />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto absolute inset-x-3 bottom-12 flex flex-col gap-2 rounded-2xl bg-black/55 p-3 text-sm backdrop-blur sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-4 sm:gap-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">Device</span>
          {Object.values(DEVICES).map((d) => <Btn key={d.id} active={deviceId === d.id} onClick={() => setDeviceId(d.id)}>{d.name}</Btn>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-neutral-400">View</span>
          {device.modes.map((m) => <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{MODE_LABELS[m]}</Btn>)}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">Range</span>
          <input type="range" min={20} max={maxFt} step={5} value={rangeFt} onChange={(e) => setRangeFt(+e.target.value)} className="w-40 accent-amber-400" />
          <button className="tabular-nums text-amber-300" onClick={() => setImperial((v) => !v)}>{fmt(rangeFt)}</button>
          <span className="text-neutral-500">max {fmt(maxFt)}</span>
        </div>
        <div className="hidden text-xs text-neutral-500 sm:block">
          {device.name} {device.beamDeg}°×{device.thickDeg}° · fish: {Object.values(SPECIES).map((s) => s.name).join(', ')}
        </div>
      </motion.div>

      {import.meta.env.DEV && window.location.search.includes('debug') && (
        <pre ref={(el) => { state.current.debugEl = el }} className="pointer-events-none absolute left-2 top-1/2 rounded bg-black/60 p-1 text-[10px] text-lime-300" />
      )}
      {/* frame + labels for the sonar screen (the picture itself is drawn by SonarScreen inside the canvas) */}
      <div className="pointer-events-none absolute" style={{ right: 16, bottom: 16, width: '34%', aspectRatio: `1 / ${deviceId === 'PL' ? 0.6 : 0.78}` }}>
        <div className="absolute inset-0 rounded-md ring-1 ring-white/30" />
        <div className="absolute left-2 top-1 text-[11px] font-medium text-amber-200/90">{device.name} · {MODE_LABELS[mode]} · what the app shows</div>
        <div className="absolute right-2 top-1 text-[11px] tabular-nums text-neutral-300">{fmt(rangeFt)}</div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 w-max max-w-[60vw] rounded-full bg-black/50 px-3 py-1 text-xs text-neutral-200 backdrop-blur sm:left-1/2 sm:-translate-x-1/2">
        Drag the boat · the beam reveals what is under it · the small screen is what the app would show
      </div>
    </main>
  )
}

function Btn({ active, children, ...rest }) {
  return (
    <button {...rest} className={`rounded-full px-3 py-1 transition ${active ? 'bg-amber-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
      {children}
    </button>
  )
}
