// The ice scene's own parts, used by Scene.jsx when scene === 'ice' (iceScene.js has the story and the presets):
//   IceSky    — the dome, centred on the camera
//   IceSheet  — the frozen surface (iceSheet.js), on the sonar-hidden layer like the water
//   IceCamp   — the live hole with the Mini and its kit, the shelter and sled at the start spot, the aim ring, and the
//               hole-hopping sequence: lift the Mini → walk → drill → drop it in. The sonar has no signal meanwhile.
//   Snowfall  — the flakes
//   IcePick   — tap or drag on the ice: the ring follows the pointer; on release the kit moves there
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { setHoles } from './iceSheet'
import { makeHoleKit, makeShelter, makeSled, makeAimRing, MINI_H, CABLE_TOP_Y, KIT_SCALE } from './iceProps'
import { makeSnowfall } from './snow'
import { makeSkyDome } from './iceSky'
import { ICE_T, MINI_DROP, APEX_Y, HOLE_DRAW_R, MAX_HOLES, ICE_CAMP, CUT_R, ISLAND_R, col, dir } from './iceScene'
import { setBeamUniforms } from './lakeMaterial'
import { SONAR_HIDE_LAYER } from './SonarScreen'
import { HALF, depthAt } from './terrain'

const LIFT = ICE_T + MINI_DROP + 0.35 // how far the Mini comes up when it is pulled out of the hole
const DUR = { lift: 0.55, move: 0.9, drill: 1.5, drop: 0.7 }
const ease = (u) => u * u * (3 - 2 * u)

export function IceSky({ T }) {
  const dome = useMemo(() => makeSkyDome(1000), [])
  const { camera } = useThree()
  useEffect(() => {
    const u = dome.userData.uniforms
    u.uZenith.value.set(T.zenith); u.uHorizon.value.set(T.horizon); u.uBelow.value.set(T.bg); u.uGlow.value.set(T.glow)
    u.uGlowDir.value.copy(dir(T.glowDir)); u.uStars.value = T.stars; u.uAurora.value = T.aurora
  }, [dome, T])
  useFrame(({ clock }) => { dome.position.copy(camera.position); dome.userData.uniforms.uTime.value = clock.elapsedTime })
  return <primitive object={dome} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

export function IceSheet({ mat }) {
  useFrame(({ clock }) => { mat.userData.uniforms.uTime.value = clock.elapsedTime })
  return (
    <mesh rotation-x={-Math.PI / 2} material={mat} renderOrder={1} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)}>
      <planeGeometry args={[900, 900]} />
    </mesh>
  )
}

export function Snowfall({ state, T }) {
  const snow = useMemo(() => makeSnowfall(), [])
  const { gl } = useThree()
  useFrame(({ clock }) => {
    const u = snow.userData.uniforms
    u.uTime.value = clock.elapsedTime
    u.uAmount.value = T.snowfall
    u.uPixelRatio.value = gl.getPixelRatio()
    const s = state.current
    u.uCenter.value.set(s.camX ?? s.boat.x, 0, 0)
  })
  return <primitive object={snow} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

export function IceCamp({ state, beamMats, iceMat, T }) {
  const kit = useMemo(makeHoleKit, [])
  const shelter = useMemo(makeShelter, [])
  const sled = useMemo(makeSled, [])
  const aim = useMemo(makeAimRing, [])
  const parts = useMemo(() => ({ mini: kit.getObjectByName('mini'), cable: kit.getObjectByName('cable'), auger: kit.getObjectByName('auger'), park: kit.getObjectByName('auger').position.clone(), lean: kit.getObjectByName('auger').rotation.z }), [kit])
  const s0 = state.current
  // the camp: shelter and sled a few metres from the first hole, the door toward it
  const camp = useMemo(() => {
    const cx = s0.boat.x + ICE_CAMP[0], cz = s0.boat.z + ICE_CAMP[1]
    const ux = s0.boat.x - cx, uz = s0.boat.z - cz, L = Math.hypot(ux, uz)
    const yaw = Math.atan2(uz / L, -ux / L)
    const lamp = shelter.userData.lampLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(new THREE.Vector3(cx, 0, cz))
    return { x: cx, z: cz, yaw, lamp }
  }, [shelter, s0])
  useEffect(() => {
    const s = state.current
    s.holes = [{ x: s.boat.x, z: s.boat.z, r: HOLE_DRAW_R, live: true }]
    setHoles(iceMat, s.holes)
    const u = iceMat.userData.uniforms
    u.uLamp.value.set(camp.lamp.x, camp.lamp.y, camp.lamp.z, T.lamp)
    u.uLampColor.value.set('#ffb060')
  }, [iceMat, camp, T, state])
  const cableLen = ICE_T + MINI_DROP - MINI_H + CABLE_TOP_Y
  useFrame((_, dt) => {
    const s = state.current
    const d = (s.drill ||= { phase: 'idle', t: 0, opened: false })
    if (d.phase === 'idle' && Math.hypot(s.target.x - s.boat.x, s.target.z - s.boat.z) > 0.8) {
      d.phase = 'lift'; d.t = 0; d.opened = false
      d.from = { x: s.boat.x, z: s.boat.z }; d.to = { x: s.target.x, z: s.target.z }
    }
    d.t += Math.min(dt, 0.1)
    let lift = 0, drilling = 0
    const { auger, park } = parts
    if (d.phase !== 'idle') {
      const u = Math.min(1, d.t / DUR[d.phase]), e = ease(u)
      if (d.phase === 'lift') { lift = e * LIFT; if (u >= 1) { d.phase = 'move'; d.t = 0 } }
      else if (d.phase === 'move') {
        lift = LIFT
        s.boat.x = d.from.x + (d.to.x - d.from.x) * e; s.boat.z = d.from.z + (d.to.z - d.from.z) * e
        if (u >= 1) { d.phase = 'drill'; d.t = 0 }
      } else if (d.phase === 'drill') {
        lift = LIFT; drilling = u
        if (!d.opened && u > 0.62) { // the auger breaks through: the hole opens, the old one is left behind
          d.opened = true
          s.holes.forEach((h) => { h.live = false })
          s.holes.push({ x: d.to.x, z: d.to.z, r: HOLE_DRAW_R, live: true })
          if (s.holes.length > MAX_HOLES) s.holes.shift()
          setHoles(iceMat, s.holes)
        }
        if (u >= 1) { d.phase = 'drop'; d.t = 0 }
      } else if (d.phase === 'drop') { lift = (1 - e) * LIFT; if (u >= 1) { d.phase = 'idle'; d.t = 0 } }
    }
    // the auger: parked beside the hole, or over it, spinning and going down 0.55 m then back up
    if (drilling > 0) {
      const inOut = Math.min(1, drilling / 0.12) * (1 - Math.max(0, (drilling - 0.88) / 0.12))
      auger.position.set(park.x * (1 - inOut), -0.6 * Math.sin(Math.PI * Math.min(1, Math.max(0, (drilling - 0.12) / 0.76))), park.z * (1 - inOut))
      auger.rotation.z = parts.lean * (1 - inOut)
      auger.rotation.y += dt * 22
    } else { auger.position.copy(park); auger.rotation.z = parts.lean }
    kit.position.set(s.boat.x, 0, s.boat.z)
    parts.mini.position.y = APEX_Y + lift
    parts.cable.position.y = parts.mini.position.y + MINI_H
    parts.cable.scale.y = Math.max(0.05, cableLen - lift)
    s.noSignal = d.phase !== 'idle'
    s.apex.set(s.boat.x, APEX_Y, s.boat.z)
    setBeamUniforms(beamMats, s.specs, s.apex)
    const u = iceMat.userData.uniforms
    // the cutaway's shape (iceSheet.js cutSDF, IceWalls below): a circle round the hole, stretched by each fan's reach —
    // its footprint on the bottom under the hole and everything above it, with a margin
    u.uCutC.value.set(s.boat.x, s.boat.z); u.uCutR.value = CUT_R; u.uIsland.value = ISLAND_R
    const D = Math.max(1, depthAt(s.boat.x, s.boat.z) + APEX_Y) // water under the Mini
    const fans = s.specs.slice(0, 2)
    fans.forEach((sp, k) => {
      const phi = Math.atan2(sp.frame.c.x, -sp.frame.c.y), h = (sp.a1 - sp.a0) / 2
      const reach = (a) => (Math.abs(a) >= Math.PI / 2 - 1e-3 ? Math.sign(a) * sp.R : Math.max(-sp.R, Math.min(sp.R, D * Math.tan(a))))
      const xMin = Math.min(reach(phi - h), 0) - 1.0, xMax = reach(phi + h) + 1.0
      const zHalf = Math.min(sp.R, Math.hypot(D, Math.max(-xMin, xMax))) * Math.tan(sp.theta) + 0.8
      u.uCutBox.value[k].set(xMin, xMax, zHalf, 1)
    })
    for (let k = fans.length; k < 2; k++) u.uCutBox.value[k].w = 0
    u.uBeamOn.value += ((s.noSignal ? 0 : 1) - u.uBeamOn.value) * Math.min(1, dt * 6)
    // the aim ring under the pointer
    aim.visible = !!s.aiming
    if (s.aim) aim.position.set(s.aim.x, 0.015, s.aim.z)
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <primitive object={kit} />
      <primitive object={shelter} position={[camp.x, 0, camp.z]} rotation-y={camp.yaw} />
      <primitive object={sled} position={[camp.x - 1.1, 0, camp.z + 2.3]} rotation-y={camp.yaw + 0.5} />
      <primitive object={aim} />
      <pointLight position={[camp.lamp.x, camp.lamp.y + 0.2, camp.lamp.z]} color="#ffb060" intensity={T.lamp * 7} distance={10} decay={2} />
    </group>
  )
}

// the ice walls of the cutaway: a ribbon of ice along the pool's edge and round the island, ICE_T tall, rebuilt whenever
// the pool moves or changes shape (the same SDF as the shader, marched from the hole outward)
function cutSDF(px, pz, c) {
  const qx = px - c.cx, qz = pz - c.cz
  let d = Math.hypot(qx, qz) - c.R
  for (const b of c.boxes) {
    const rr = 1.2, hx = (b.xMax - b.xMin) / 2, ax = Math.abs(qx - (b.xMin + b.xMax) / 2) - hx + rr, az = Math.abs(qz) - b.zHalf + rr
    d = Math.min(d, Math.hypot(Math.max(ax, 0), Math.max(az, 0)) + Math.min(Math.max(ax, az), 0) - rr)
  }
  return Math.max(d, c.island - Math.hypot(qx, qz))
}
function ribbon(points) { // closed loop of [x, z] → a wall from y = 0 down to −ICE_T, white at the top, blue below
  const n = points.length, pos = new Float32Array(n * 6), colr = new Float32Array(n * 6), idx = []
  const top = new THREE.Color('#eef6fc'), bot = new THREE.Color('#8fb8d6')
  points.forEach(([x, z], i) => {
    pos.set([x, 0, z, x, -ICE_T, z], i * 6)
    colr.set([top.r, top.g, top.b, bot.r, bot.g, bot.b], i * 6)
    const j = (i + 1) % n
    idx.push(i * 2, i * 2 + 1, j * 2, j * 2, i * 2 + 1, j * 2 + 1)
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx)
  g.computeVertexNormals()
  return g
}
export function IceWalls({ state, iceMat }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, emissive: '#7fa6c4', emissiveIntensity: 0.45, transparent: true, opacity: 0.96, side: THREE.DoubleSide }), []) // pale ice, readable at dusk
  const outer = useRef(), island = useRef(), key = useRef('')
  useFrame(() => {
    const u = iceMat.userData.uniforms
    const c = { cx: u.uCutC.value.x, cz: u.uCutC.value.y, R: u.uCutR.value, island: u.uIsland.value, boxes: u.uCutBox.value.filter((b) => b.w > 0.5).map((b) => ({ xMin: b.x, xMax: b.y, zHalf: b.z })) }
    const k = `${c.cx.toFixed(2)}|${c.cz.toFixed(2)}|${c.boxes.map((b) => `${b.xMin.toFixed(1)},${b.xMax.toFixed(1)},${b.zHalf.toFixed(1)}`).join(';')}`
    if (k === key.current || !outer.current) return
    key.current = k
    const N = 128, pts = [], isl = []
    for (let i = 0; i < N; i++) {
      const th = (i / N) * 2 * Math.PI, dx = Math.cos(th), dz = Math.sin(th)
      let r = c.island + 0.05
      while (r < 60 && cutSDF(c.cx + dx * r, c.cz + dz * r, c) <= 0) r += 0.25
      let lo = r - 0.25, hi = r
      for (let b = 0; b < 7; b++) { const m = (lo + hi) / 2; if (cutSDF(c.cx + dx * m, c.cz + dz * m, c) <= 0) lo = m; else hi = m }
      pts.push([c.cx + dx * hi, c.cz + dz * hi])
      isl.push([c.cx + dx * c.island, c.cz + dz * c.island])
    }
    outer.current.geometry?.dispose(); outer.current.geometry = ribbon(pts)
    island.current.geometry?.dispose(); island.current.geometry = ribbon(isl)
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <mesh ref={outer} material={mat} frustumCulled={false} />
      <mesh ref={island} material={mat} frustumCulled={false} />
    </group>
  )
}

export function IcePick({ state }) {
  const clampXZ = (p) => ({ x: THREE.MathUtils.clamp(p.x, -58, 58), z: THREE.MathUtils.clamp(p.z, -58, 58) })
  const onDown = (e) => { e.stopPropagation(); const s = state.current; s.aiming = true; s.aim = clampXZ(e.point); e.target.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => { const s = state.current; if (!s.aiming) return; s.aim = clampXZ(e.point) }
  const onUp = () => {
    const s = state.current
    if (!s.aiming) return
    s.aiming = false
    if (!s.aim || s.drill?.phase !== 'idle') return
    if (Math.hypot(s.aim.x - s.boat.x, s.aim.z - s.boat.z) < 1.0) return
    s.target.x = s.aim.x; s.target.z = s.aim.z; s.hasDragged = true
  }
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.02} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <planeGeometry args={[HALF * 2, HALF * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}

export { col, KIT_SCALE }
