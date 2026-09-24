import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SonarScene from './SonarScene'
import { DEVICES, FT, MODE_LABELS, fanSpans, forwardTiltDeg } from './devices'

export const meta = {
  title: 'Sonar Beam Visualizer — Phase 2 geometry',
  description: 'Fans, PL/PLM switch, cursor = device on the surface, touch drag. Placeholder art.',
}

const SCENE_HEIGHT_M = 45 // visible scene height (metres): 15 m sky + 30 m water — placeholder choice

export default function SonarBeam() {
  const [deviceId, setDeviceId] = useState('PLM')
  const [mode, setMode] = useState('down')
  const [rangeFt, setRangeFt] = useState(60)
  const [imperial, setImperial] = useState(true)
  const [showScene, setShowScene] = useState(true)
  const [tiltOverride, setTiltOverride] = useState(null) // debug slider, null = rule
  const [pos, setPos] = useState(0.5) // device x, 0..1 of scene width (for the DOM cursor)

  // R3F mounts the scene only once it has measured the container; in some
  // embeds the first measurement is 0×0 and nothing renders until the next
  // React render. One forced re-render after mount makes it robust.
  const [, tick] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => tick(1))
    return () => cancelAnimationFrame(id)
  }, [])

  const device = DEVICES[deviceId]
  const maxFt = device.maxRangeFt
  useEffect(() => {
    if (!device.modes.includes(mode)) setMode('down')
    if (rangeFt > maxFt) setRangeFt(maxFt)
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fans = useMemo(() => fanSpans(device, mode, tiltOverride ?? undefined), [device, mode, tiltOverride])

  // Mutable state read by the render loop every frame (no React re-render on drag).
  const state = useRef({ deviceX01: 0.5, sceneHeightM: SCENE_HEIGHT_M, fans, rangeM: rangeFt * FT, showScene })
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

  // Dev aid: `?frame=375x812` renders the experiment inside a centred box of
  // that size (a fake phone) instead of full-viewport, so odd aspect ratios can
  // be checked in a desktop browser without device emulation.
  const frame = /frame=(\d+)x(\d+)/.exec(window.location.search)
  const frameStyle = frame
    ? { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: `min(${frame[1]}px, 100vw)`, height: `min(${frame[2]}px, 100vh)`, boxShadow: '0 0 0 2px #444' }
    : undefined

  return (
    <main className={`${frame ? '' : 'fixed inset-0'} select-none overflow-hidden bg-black text-white`} style={frameStyle}>
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
        className="pointer-events-auto absolute inset-x-3 bottom-12 flex flex-col gap-2 rounded-2xl bg-black/55 p-3 text-sm backdrop-blur sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-4 sm:gap-3 sm:p-4"
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
        <div className="hidden text-xs text-neutral-500 sm:block">
          {device.name}: {device.beamDeg}° beam · fans {fans.map((f) => `[${f[0].toFixed(1)}°, ${f[1].toFixed(1)}°]`).join(' + ')} from straight-down
        </div>
      </motion.div>

      {import.meta.env.DEV && window.location.search.includes('debug') && (
        <pre ref={(el) => { state.current.debugEl = el }} className="pointer-events-none absolute right-2 top-2 max-w-[60vw] whitespace-pre-wrap rounded bg-black/60 p-1 text-[10px] text-lime-300" />
      )}
      <div className="pointer-events-none absolute bottom-3 left-1/2 w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-neutral-300 backdrop-blur">
        Move the mouse or drag to slide the device along the surface
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
