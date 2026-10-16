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
import { ICE_T, MINI_DROP, APEX_Y, HOLE_DRAW_R, MAX_HOLES, ICE_CAMP, col, dir } from './iceScene'
import { setBeamUniforms } from './lakeMaterial'
import { SONAR_HIDE_LAYER } from './SonarScreen'
import { HALF } from './terrain'

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
