import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SonarScene from './SonarScene'
import { DEVICES, FT, MODE_LABELS, fanSpans, forwardTiltDeg } from './devices'

export const meta = {
  title: 'Sonar Beam Visualizer — Phase 2 geometry',
  description: 'Fans, PL/PLM switch, cursor = device on the surface, touch drag. Placeholder art.',
}

const SCENE_WIDTH_M = 60 // visible lake width (metres) — placeholder choice

export default function SonarBeam() {
  const [deviceId, setDeviceId] = useState('PLM')
  const [mode, setMode] = useState('down')
  const [rangeFt, setRangeFt] = useState(60)
  const [imperial, setImperial] = useState(true)
  const [showScene, setShowScene] = useState(true)
  const [tiltOverride, setTiltOverride] = useState(null) // debug slider, null = rule
  const [pos, setPos] = useState(0.5) // device x, 0..1 of scene width (for the DOM cursor)

  const device = DEVICES[deviceId]
  const maxFt = device.maxRangeFt
  useEffect(() => {
    if (!device.modes.includes(mode)) setMode('down')
    if (rangeFt > maxFt) setRangeFt(maxFt)
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fans = useMemo(() => fanSpans(device, mode, tiltOverride ?? undefined), [device, mode, tiltOverride])

  // Mutable state read by the render loop every frame (no React re-render on drag).
  const state = useRef({ deviceX01: 0.5, sceneWidthM: SCENE_WIDTH_M, fans, rangeM: rangeFt * FT, showScene })
  state.current.fans = fans
  state.current.rangeM = rangeFt * FT
  state.current.showScene = showScene

  // Pointer: mouse hover moves the device; touch needs a drag (pointerdown + move).
  const wrapRef = useRef()
  const dragging = useRef(false)
  const onPointer = (e) => {
    const isTouch = e.pointerType === 'touch'
    if (isTouch && !dragging.current) return
    const r = wrapRef.current.getBoundingClientRect()
    const x01 = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    state.current.deviceX01 = x01
    setPos(x01)
  }
  const onDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    onPointer(e)
  }
  const onUp = () => { dragging.current = false }

  const surfaceTop = '33.333%' // matches uSurfaceY = h/3
  const fmt = (ft) => (imperial ? `${Math.round(ft)} ft` : `${(ft * FT).toFixed(1)} m`)

  return (
    <main className="fixed inset-0 select-none overflow-hidden bg-black text-white">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-none"
        onPointerMove={onPointer}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      >
        <SonarScene state={state} />

        {/* the device, floating on the surface line — placeholder shape until side-view PNGs exist */}
        <div
          className="pointer-events-none absolute"
          style={{ left: `${pos * 100}%`, top: surfaceTop, transform: 'translate(-50%, -78%)' }}
        >
          <div className={`rounded-md bg-neutral-900 shadow-lg ring-1 ring-white/30 ${deviceId === 'PL' ? 'h-5 w-14' : 'h-4 w-9'}`} />
          <div className="mx-auto mt-0.5 h-2 w-1 bg-neutral-700" />
        </div>
      </div>

      {/* ---- UI ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto absolute left-4 top-4 flex flex-col gap-3 rounded-2xl bg-black/55 p-4 text-sm backdrop-blur"
      >
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">Device</span>
          {Object.values(DEVICES).map((d) => (
            <Btn key={d.id} active={deviceId === d.id} onClick={() => setDeviceId(d.id)}>{d.name}</Btn>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">View</span>
          {device.modes.map((m) => (
            <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{MODE_LABELS[m]}</Btn>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">Range</span>
          <input
            type="range" min={10} max={maxFt} step={5} value={rangeFt}
            onChange={(e) => setRangeFt(+e.target.value)}
            className="w-40 accent-amber-400"
          />
          <button className="tabular-nums text-amber-300" onClick={() => setImperial((v) => !v)} title="toggle ft / m">
            {fmt(rangeFt)}
          </button>
          <span className="text-neutral-500">max {fmt(maxFt)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <label className="flex items-center gap-1"><input type="checkbox" checked={showScene} onChange={(e) => setShowScene(e.target.checked)} /> show scene</label>
          <span>·</span>
          <label className="flex items-center gap-1">
            fwd tilt
            <input
              type="range" min={0} max={90} step={1}
              value={tiltOverride ?? forwardTiltDeg(device.beamDeg)}
              onChange={(e) => setTiltOverride(+e.target.value)}
              className="w-24 accent-neutral-400"
            />
            <span className="tabular-nums">{Math.round(tiltOverride ?? forwardTiltDeg(device.beamDeg))}°</span>
            {tiltOverride !== null && <button className="underline" onClick={() => setTiltOverride(null)}>rule</button>}
          </label>
        </div>
        <div className="text-xs text-neutral-500">
          {device.name}: {device.beamDeg}° beam · fans {fans.map((f) => `[${f[0].toFixed(1)}°, ${f[1].toFixed(1)}°]`).join(' + ')} from straight-down
        </div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-neutral-300 backdrop-blur">
        Move the mouse / drag on touch to slide the device along the surface
      </div>
    </main>
  )
}

function Btn({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={`rounded-full px-3 py-1 transition ${active ? 'bg-amber-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
    >
      {children}
    </button>
  )
}
