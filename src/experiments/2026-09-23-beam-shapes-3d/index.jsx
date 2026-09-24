import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DEVICES, FT, MODE_LABELS } from '../2026-09-23-sonar-beam/devices'
import { wedgeGeometry, wedgeSpecs } from './wedge'

export const meta = {
  title: 'Beam shapes in 3D',
  description: 'What the PL 135°×20° and PLM 39°×18° beams actually look like under the boat, per mode. Drag to orbit.',
}

const DEPTH_M = 18 // 60 ft placeholder lakebed
const COLORS = { down: '#38bdf8', forward: '#a78bfa', combo: '#38bdf8', panoramic: '#34d399' }

function Wedge({ spec, color }) {
  const geo = useMemo(() => wedgeGeometry(spec), [spec])
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 25), [geo])
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={color} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} roughness={0.4} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </lineSegments>
    </group>
  )
}

function Lake() {
  const stumps = useMemo(() => {
    const out = []
    let seed = 7
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
    for (let i = 0; i < 40; i++) out.push([(rnd() - 0.3) * 90, (rnd() - 0.5) * 70, 0.6 + rnd() * 2.5])
    return out
  }, [])
  return (
    <group>
      {/* lakebed */}
      <mesh rotation-x={-Math.PI / 2} position-y={-DEPTH_M} receiveShadow>
        <planeGeometry args={[160, 160, 1, 1]} />
        <meshStandardMaterial color="#6b5d44" roughness={1} />
      </mesh>
      <gridHelper args={[160, 32, '#8a7a5a', '#5a4d3a']} position-y={-DEPTH_M + 0.02} />
      {stumps.map(([x, z, h], i) => (
        <mesh key={i} position={[x, -DEPTH_M + h / 2, z]}>
          <cylinderGeometry args={[0.35, 0.5, h, 6]} />
          <meshStandardMaterial color="#3b2f22" />
        </mesh>
      ))}
      {/* water surface */}
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[160, 160]} />
        <meshPhysicalMaterial color="#0e7490" transparent opacity={0.35} side={THREE.DoubleSide} roughness={0.15} depthWrite={false} />
      </mesh>
      {/* boat + device */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.5, 1, 1.8]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  )
}

// Simple orbit: drag to rotate, slow auto-rotate when idle.
function Rig({ orbit }) {
  useFrame(({ camera }, dt) => {
    const o = orbit.current
    if (!o.dragging) o.az += dt * 0.08
    const r = o.dist
    camera.position.set(r * Math.cos(o.el) * Math.sin(o.az), r * Math.sin(o.el), r * Math.cos(o.el) * Math.cos(o.az))
    camera.lookAt(8, -8, 0)
  })
  return null
}

export default function BeamShapes3D() {
  const [deviceId, setDeviceId] = useState('PL')
  const [mode, setMode] = useState('forward')
  const [showAll, setShowAll] = useState(false)
  // same R3F first-measure quirk as the sonar-beam experiment: force one re-render
  const [, tick] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => tick(1)); return () => cancelAnimationFrame(id) }, [])
  const device = DEVICES[deviceId]
  const rangeM = Math.min(device.maxRangeFt, 100) * FT // 100 ft display range for the picture
  const orbit = useRef({ az: 0.8, el: 0.55, dist: 75, dragging: false, lx: 0, ly: 0 })

  const wedges = useMemo(() => {
    const modes = showAll ? device.modes.filter((m) => m !== 'combo') : [mode]
    return modes.flatMap((m) => wedgeSpecs(device, m, rangeM).map((spec, i) => ({ spec, color: COLORS[m], key: `${m}-${i}` })))
  }, [device, mode, showAll, rangeM])

  const onDown = (e) => { const o = orbit.current; o.dragging = true; o.lx = e.clientX; o.ly = e.clientY; e.currentTarget.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => {
    const o = orbit.current
    if (!o.dragging) return
    o.az -= (e.clientX - o.lx) * 0.006
    o.el = Math.min(1.4, Math.max(0.1, o.el + (e.clientY - o.ly) * 0.006))
    o.lx = e.clientX; o.ly = e.clientY
  }
  const onUp = () => { orbit.current.dragging = false }

  return (
    <main className="fixed inset-0 bg-[#06111a] text-white select-none">
      <div className="absolute inset-0 touch-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <Canvas camera={{ fov: 40, near: 0.1, far: 500, position: [40, 30, 60] }} dpr={[1, 2]}>
          <color attach="background" args={['#06111a']} />
          <fog attach="fog" args={['#06111a', 90, 220]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[30, 50, 20]} intensity={1.2} />
          <Lake />
          {wedges.map((w) => <Wedge key={w.key} spec={w.spec} color={w.color} />)}
          <Rig orbit={orbit} />
        </Canvas>
      </div>

      <div className="absolute left-4 top-4 flex flex-col gap-3 rounded-2xl bg-black/55 p-4 text-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">Device</span>
          {Object.values(DEVICES).map((d) => (
            <Btn key={d.id} active={deviceId === d.id} onClick={() => { setDeviceId(d.id); if (!d.modes.includes(mode)) setMode('down') }}>{d.name}</Btn>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-neutral-400">View</span>
          {device.modes.map((m) => (
            <Btn key={m} active={!showAll && mode === m} onClick={() => { setMode(m); setShowAll(false) }} color={COLORS[m]}>{MODE_LABELS[m]}</Btn>
          ))}
          <Btn active={showAll} onClick={() => setShowAll((v) => !v)}>all at once</Btn>
        </div>
        <div className="text-xs text-neutral-400">
          {device.name}: <b className="text-white">{device.beamDeg}° × {device.thickDeg}°</b> · shown at 100 ft range, lakebed at 60 ft · drag to orbit
        </div>
      </div>
    </main>
  )
}

function Btn({ active, color, children, ...rest }) {
  return (
    <button
      {...rest}
      style={active && color ? { background: color, color: '#000' } : undefined}
      className={`rounded-full px-3 py-1 transition ${active ? 'bg-amber-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
    >
      {children}
    </button>
  )
}
