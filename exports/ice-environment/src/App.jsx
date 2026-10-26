// The demo: the frozen lake full-screen, an orbit camera (drag to turn, scroll / pinch to zoom, right-drag to pan) and a
// small panel for the presets. URL parameters set the start: ?time=dusk|day|night&look=glass|mixed|snow&cut=0
import { useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import IceEnvironment from './scene/IceEnvironment'
import { CENTER } from './scene/presets'

// the starting view: from the camera side of the cutaway, 7 m up, looking at the camp on the ice and the lake below it
const START_TARGET = new THREE.Vector3(CENTER.x + 2, -2.6, CENTER.z)
const START_CAM = new THREE.Vector3(CENTER.x - 3, 7, CENTER.z + 26)

function Orbit({ focus }) {
  const { camera, gl } = useThree()
  const controls = useMemo(() => {
    const c = new OrbitControls(camera, gl.domElement)
    c.target.copy(START_TARGET)
    c.enableDamping = true; c.dampingFactor = 0.08
    c.minDistance = 3; c.maxDistance = 160
    c.update()
    return c
  }, [camera, gl])
  useEffect(() => () => controls.dispose(), [controls])
  useFrame(() => { controls.update(); focus.copy(controls.target) })
  return null
}

const param = (k, allowed, d) => { const v = new URLSearchParams(window.location.search).get(k); return allowed.includes(v) ? v : d }

export default function App() {
  const [time, setTime] = useState(() => param('time', ['dusk', 'day', 'night'], 'dusk'))
  const [look, setLook] = useState(() => param('look', ['glass', 'mixed', 'snow'], 'glass'))
  const [cutaway, setCutaway] = useState(() => param('cut', ['0', '1'], '1') === '1')
  const focus = useMemo(() => START_TARGET.clone(), [])
  const btn = (on) => ({ font: '12px system-ui, sans-serif', padding: '5px 9px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
    background: on ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)', color: on ? '#0c1424' : '#e8eef5' })
  const row = (label, opts, cur, set) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ width: 54, opacity: 0.7 }}>{label}</span>
      {opts.map((o) => <button key={String(o[0])} style={btn(cur === o[0])} onClick={() => set(o[0])}>{o[1]}</button>)}
    </div>
  )
  return (
    <>
      <Canvas dpr={[1, 1.5]} camera={{ fov: 46, near: 0.5, far: 1600, position: START_CAM.toArray() }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <IceEnvironment time={time} look={look} cutaway={cutaway} focus={focus} />
        <Orbit focus={focus} />
      </Canvas>
      <div style={{ position: 'fixed', left: 12, top: 12, display: 'grid', gap: 6, padding: 10, borderRadius: 10, background: 'rgba(8,14,26,0.55)', backdropFilter: 'blur(8px)', color: '#e8eef5', font: '12px system-ui, sans-serif' }}>
        {row('Time', [['dusk', 'Dusk'], ['day', 'Day'], ['night', 'Night']], time, setTime)}
        {row('Snow', [['glass', 'Glass'], ['mixed', 'Mixed'], ['snow', 'Snow']], look, setLook)}
        {row('Cutaway', [[true, 'On'], [false, 'Off']], cutaway, setCutaway)}
      </div>
    </>
  )
}
