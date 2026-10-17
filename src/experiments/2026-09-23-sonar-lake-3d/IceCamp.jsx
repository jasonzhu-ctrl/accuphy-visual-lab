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
import { makeHoleKit, makeShelter, makeSled, makeAimRing, KIT_SCALE } from './iceProps'
import { makeSnowfall } from './snow'
import { makeSkyDome } from './iceSky'
import { ICE_T, MINI_DROP, APEX_Y, HOLE_DRAW_R, MAX_HOLES, ICE_CAMP, CUT_R, ISLAND_R, SECTION_CAM, WIND, col, dir } from './iceScene'
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

// The sheet is two meshes (#106): a near square, 240 m at 0.5 m, whose vertices rise by the snow's depth (real drifts, with
// silhouettes and shading at a low camera), following the hole in 2 m steps; and a far flat plane with a square hole for
// it. The shader's noise lives in world space, so the near mesh can move without the snow moving.
const NEAR = 240
export function IceSheet({ mat, state }) {
  const near = useMemo(() => {
    const g = new THREE.PlaneGeometry(NEAR, NEAR, 480, 480); g.rotateX(-Math.PI / 2)
    g.setAttribute('aDisp', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(1), 1))
    return g
  }, [])
  const far = useMemo(() => {
    const sh = new THREE.Shape(); sh.moveTo(-450, -450); sh.lineTo(450, -450); sh.lineTo(450, 450); sh.lineTo(-450, 450); sh.closePath()
    const hole = new THREE.Path(); const h = NEAR / 2 - 0.05; hole.moveTo(-h, -h); hole.lineTo(-h, h); hole.lineTo(h, h); hole.lineTo(h, -h); hole.closePath()
    sh.holes.push(hole)
    const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2)
    g.setAttribute('aDisp', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1))
    return g
  }, [])
  const nearRef = useRef(), farRef = useRef()
  useFrame(({ clock }) => {
    const u = mat.userData.uniforms
    u.uTime.value = clock.elapsedTime
    const s = state.current
    const cx = Math.round(s.boat.x / 2) * 2, cz = Math.round(s.boat.z / 2) * 2
    u.uCenter.value.set(cx, cz)
    if (nearRef.current) nearRef.current.position.set(cx, 0, cz)
    if (farRef.current) farRef.current.position.set(cx, -0.002, cz)
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <mesh ref={nearRef} geometry={near} material={mat} renderOrder={1} frustumCulled={false} />
      <mesh ref={farRef} geometry={far} material={mat} renderOrder={1} frustumCulled={false} />
    </group>
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
    u.uClipZ.value = s.view === 'section' ? s.boat.z + SECTION_CAM.cutZ : 1e5
  })
  return <primitive object={snow} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

export function IceCamp({ state, beamMats, iceMat, T }) {
  const kit = useMemo(makeHoleKit, [])
  const shelter = useMemo(makeShelter, [])
  const sled = useMemo(makeSled, [])
  const aim = useMemo(makeAimRing, [])
  const parts = useMemo(() => ({ rig: kit.getObjectByName('rig'), head: kit.getObjectByName('head'), auger: kit.getObjectByName('auger'), park: kit.getObjectByName('auger').position.clone(), lean: kit.getObjectByName('auger').rotation.z }), [kit])
  const s0 = state.current
  // the camp: shelter and sled a few metres from the first hole, the door toward it
  const campAt = (hx, hz, dx, dz) => {
    const cx = hx + dx, cz = hz + dz
    const ux = hx - cx, uz = hz - cz, L = Math.hypot(ux, uz)
    const yaw = Math.atan2(uz / L, -ux / L)
    const lamp = shelter.userData.lampLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).add(new THREE.Vector3(cx, 0, cz))
    return { x: cx, z: cz, yaw, lamp }
  }
  const camp = useMemo(() => campAt(s0.boat.x, s0.boat.z, ICE_CAMP[0], ICE_CAMP[1]), [shelter, s0]) // eslint-disable-line react-hooks/exhaustive-deps
  const campG = useRef(), sledG = useRef(), lampRef = useRef()
  useEffect(() => {
    const s = state.current
    s.holes = [{ x: s.boat.x, z: s.boat.z, r: HOLE_DRAW_R, live: true }]
    setHoles(iceMat, s.holes)
    const u = iceMat.userData.uniforms
    u.uLamp.value.set(camp.lamp.x, camp.lamp.y, camp.lamp.z, T.lamp)
    u.uLampColor.value.set('#ffb060')
  }, [iceMat, camp, T, state])
  const glowRef = useRef()
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
      auger.position.set(park.x * (1 - inOut), -0.9 * Math.sin(Math.PI * Math.min(1, Math.max(0, (drilling - 0.12) / 0.76))), park.z * (1 - inOut))
      auger.rotation.z = parts.lean * (1 - inOut)
      auger.rotation.y += dt * 22
    } else { auger.position.copy(park); auger.rotation.z = parts.lean }
    kit.position.set(s.boat.x, 0, s.boat.z)
    parts.rig.position.y = lift // the whole pole rig comes out of the hole and goes back in
    // the head turns with the view: the Mini's face forward for Forward and Combo, down for Down, Live Ice and Ice Fishing
    const headT = s.mode === 'forward' || s.mode === 'combo' ? 0 : -Math.PI / 2
    parts.head.rotation.z += (headT - parts.head.rotation.z) * Math.min(1, dt * 4)
    // two things, kept apart: s.noSignal is the state machine's boolean (a hop is under way); s.signal (0..1) is the
    // visual gate, from the geometry — the transducer is wet while it is below the ice's underside. Everything the
    // sonar lights (the wedge, the lit bottom, the ice window, the cyan glow, the phone's picture and readout) follows
    // s.signal, so cause and effect stay together: the cone rides up with the Mini and goes out as it leaves the water
    // (~0.3 s), stays dark on the walk and the drill, and wakes with the picture after the drop (~3/s, bottom first)
    s.noSignal = d.phase !== 'idle'
    const apexY = APEX_Y + lift
    const wet = apexY < -ICE_T - 0.05 ? 1 : apexY > -ICE_T + 0.05 ? 0 : (s.signalT ?? 1) // ±5 cm hysteresis round the underside
    s.signalT = wet
    if (s.signal === undefined) s.signal = 1
    s.signal += (wet - s.signal) * Math.min(1, dt * (wet < s.signal ? 10 : 3))
    if (Math.abs(wet - s.signal) < 1e-3) s.signal = wet
    s.apex.set(s.boat.x, Math.min(apexY, -ICE_T - 0.05), s.boat.z) // the wedge's apex never pokes through the sheet
    setBeamUniforms(beamMats, s.specs, s.apex)
    for (const m of beamMats) { const bu = m.userData.uniforms; if (bu.uBeamGain) bu.uBeamGain.value = s.signal }
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
    u.uBeamOn.value = s.signal // the ice window over the beam and the live hole's glow (iceSheet.js) go with the same gate
    if (glowRef.current) { glowRef.current.position.set(s.boat.x, APEX_Y + 0.3 + lift, s.boat.z); glowRef.current.intensity = 3 * s.signal }
    // the aim ring under the pointer (on the underside of the sheet in the under-ice view)
    aim.visible = !!s.aiming && !!s.aim
    if (s.aim) aim.position.set(s.aim.x, s.view === 'under' ? -ICE_T - 0.02 : 0.015, s.aim.z)
    // the section view keeps the camp beside the hole, inside the cut; the other views leave it where the visitor started
    const c = s.view === 'section' ? campAt(s.boat.x, s.boat.z, 7.5, -3.0) : camp
    if (campG.current) { campG.current.position.set(c.x, 0, c.z); campG.current.rotation.y = c.yaw }
    if (sledG.current) { sledG.current.position.set(c.x + (s.view === 'section' ? 1.6 : -1.1), 0, c.z + (s.view === 'section' ? -2.2 : 2.3)); sledG.current.rotation.y = c.yaw + 0.5 }
    if (lampRef.current) lampRef.current.position.set(c.lamp.x, c.lamp.y + 0.2, c.lamp.z)
    u.uLamp.value.set(c.lamp.x, c.lamp.y, c.lamp.z, T.lamp)
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <primitive object={kit} />
      <primitive ref={campG} object={shelter} position={[camp.x, 0, camp.z]} rotation-y={camp.yaw} />
      <primitive ref={sledG} object={sled} position={[camp.x - 1.1, 0, camp.z + 2.3]} rotation-y={camp.yaw + 0.5} />
      <primitive object={aim} />
      <pointLight ref={lampRef} position={[camp.lamp.x, camp.lamp.y + 0.2, camp.lamp.z]} color="#ffb060" intensity={T.lamp * 7} distance={10} decay={2} />
      <pointLight ref={(l) => { if (l) l.position.set(state.current.boat.x, APEX_Y + 0.3, state.current.boat.z); glowRef.current = l }} color="#7fe6ff" intensity={3} distance={4} decay={2} />
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
  // the section view: the ice in front of the wall is cut away, so a tap counts only on the ice behind it (a ray that
  // meets the sheet's plane in front of the wall came through the water column or the empty cut — ignored)
  const onIce = (s, p) => s.view !== 'section' || p.z < s.boat.z + SECTION_CAM.cutZ - 0.4
  const onDown = (e) => { e.stopPropagation(); const s = state.current; if (!onIce(s, e.point)) { s.aiming = false; s.aim = null; return } s.aiming = true; s.aim = clampXZ(e.point); e.target.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => { const s = state.current; if (!s.aiming) return; if (!onIce(s, e.point)) { s.aim = null; return } s.aim = clampXZ(e.point) }
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
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ---- view A: the hole's daylight, a soft column from the hole down to the bottom (under-ice photography's light shaft) ----
export function LightShaft({ state }) {
  const mesh = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTime: { value: 0 }, uTop: { value: -ICE_T }, uBottom: { value: -12 } },
      vertexShader: /* glsl */ `varying vec3 vW; varying vec3 vN; varying vec2 vUv;
        void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `precision highp float; varying vec3 vW; varying vec3 vN; varying vec2 vUv; uniform float uTime; uniform float uTop; uniform float uBottom;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          float t = clamp((uTop - vW.y) / (uTop - uBottom), 0.0, 1.0);
          float rays = 0.55 + 0.45 * vnoise(vec2(vUv.x * 7.0, vW.y * 0.35 - uTime * 0.12));
          float rim = pow(abs(dot(normalize(vN), normalize(cameraPosition - vW))), 0.8);
          float a = pow(1.0 - t, 1.6) * 0.42 * rays * rim;
          gl_FragColor = vec4(vec3(0.7, 0.9, 1.0) * a, a);
        }`,
    })
    const m = new THREE.Mesh(new THREE.CylinderGeometry(HOLE_DRAW_R * 1.05, HOLE_DRAW_R * 2.6, 1, 28, 1, true), mat)
    m.frustumCulled = false; m.renderOrder = 3
    return m
  }, [])
  useFrame(({ clock }) => {
    const s = state.current
    mesh.visible = s.view === 'under'
    if (!mesh.visible) return
    const D = depthAt(s.boat.x, s.boat.z), H = Math.max(1, D - ICE_T)
    mesh.position.set(s.boat.x, -ICE_T - H / 2, s.boat.z); mesh.scale.y = H
    mesh.material.uniforms.uTime.value = clock.elapsedTime; mesh.material.uniforms.uBottom.value = -D
  })
  return <primitive object={mesh} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

// ---- view A: marine snow — slow specks in the water give the column its volume ----
export function MarineSnow({ state }) {
  const pts = useMemo(() => makeSnowfall(1400, new THREE.Vector3(70, 11, 70), { speed: 0.12, size: 0.6, alpha: 0.6, color: '#9fc7d8' }), [])
  const { gl } = useThree()
  useFrame(({ clock }) => {
    const s = state.current
    pts.visible = s.view === 'under' || s.view === 'section'
    const u = pts.userData.uniforms
    u.uTime.value = clock.elapsedTime; u.uAmount.value = s.view === 'section' ? 0.7 : 0.9; u.uPixelRatio.value = gl.getPixelRatio()
    u.uCenter.value.set(s.boat.x, -11.4, s.boat.z)
    u.uClipZ.value = s.view === 'section' ? s.boat.z + SECTION_CAM.cutZ - 0.2 : 1e5
  })
  return <primitive object={pts} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

// ---- view B: the cut faces of the section — the ice slab, the water column, the soil under the lakebed ----
export function SectionFaces({ state }) {
  const parts = useMemo(() => {
    const slabT = SECTION_CAM.slab
    // the slab's cut face: lake ice in section — white and frosty at the top, clearer and bluer below, thin horizontal
    // layers from the freeze-up, a few bubbles caught in it (colours are display values)
    const slabMat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uT: { value: slabT }, uWind: { value: WIND.clone() }, uCover: { value: 0.27 }, uHole: { value: new THREE.Vector2(1e4, 1e4) } },
      vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `precision highp float; varying vec3 vW; uniform float uT; uniform vec2 uWind; uniform float uCover; uniform vec2 uHole;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
        float fbm3(vec2 p) { return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.1 + 1.3) + 0.125 * vnoise(p * 4.3 + 2.7); }
        float fbm4(vec2 p) { return fbm3(p) + 0.0625 * vnoise(p * 8.9 + 5.1); }
        // the sheet's snow mask (iceSheet.js), evaluated at the wall, so the cap on the slab matches the snow behind it
        float snowAt(vec2 P) {
          vec2 Pw = vec2(dot(P, uWind), dot(P, vec2(-uWind.y, uWind.x)));
          float big = fbm4(P * 0.035 + 3.0), sast = fbm3(vec2(Pw.x * 0.07, Pw.y * 0.6) + 7.0);
          float h0 = 0.55 * big + 0.45 * sast;
          float h = 0.82 * h0 + 0.18 * fbm3(P * 0.8 + 1.7);
          float thr = mix(0.62, 0.30, uCover);
          float streakN = fbm3(vec2(Pw.x * 0.05, Pw.y * 0.7) + 2.0);
          float streaks = smoothstep(0.645, 0.665, streakN + 0.03 * (vnoise(P * 3.0) - 0.5));
          float hh = h + 0.02 * (vnoise(P * 2.3 + 9.0) - 0.5);
          float core = smoothstep(thr - 0.012, thr + 0.012, hh), skirt = smoothstep(thr - 0.09, thr - 0.005, hh);
          float open = 1.0 - smoothstep(9.0, 16.0, distance(P, uHole) + 3.0 * (fbm3(P * 0.11 + 5.0) - 0.5));
          return max(max(core, 0.4 * skirt), streaks) * (1.0 - 0.9 * open);
        }
        void main() {
          float d = clamp(-vW.y / uT, 0.0, 1.0);
          float snow = snowAt(vW.xz);
          vec3 top = vec3(0.84, 0.9, 0.95), mid = vec3(0.58, 0.74, 0.86), bot = vec3(0.34, 0.56, 0.74); // ice in section: white-blue over clear blue, not a white wall
          vec3 c = d < 0.5 ? mix(top, mid, d * 2.0) : mix(mid, bot, (d - 0.5) * 2.0);
          float layers = 0.5 + 0.5 * sin(vW.y * 70.0 + vnoise(vW.xz * 0.6) * 4.0);
          c *= 0.9 + 0.1 * layers;
          float bubbles = smoothstep(0.88, 0.96, vnoise(vec2(vW.x * 22.0, vW.y * 46.0)));
          c = mix(c, vec3(0.95, 0.98, 1.0), bubbles * 0.5);
          float frost = 1.0 - smoothstep(0.0, 0.1, d);
          c = mix(c, vec3(0.95, 0.97, 1.0), frost * 0.7);
          float cap = snow * (1.0 - smoothstep(0.02, 0.16, d)); // the snow lying on the slab, seen on its cut edge
          c = mix(c, vec3(0.97, 0.98, 1.0), cap * 0.95);
          gl_FragColor = vec4(c, 0.92);
        }`,
    })
    const slab = new THREE.Mesh(new THREE.BoxGeometry(240, slabT, 0.04), slabMat)
    const line = new THREE.Mesh(new THREE.BoxGeometry(240, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: '#bfe9ff', transparent: true, opacity: 0.8 })) // the waterline under the slab
    const waterMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTop: { value: -slabT }, uTime: { value: 0 } },
      vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: /* glsl */ `precision highp float; varying vec3 vW; uniform float uTop; uniform float uTime;
        void main() { float d = clamp((uTop - vW.y) / 24.0, 0.0, 1.0);
          vec3 c = mix(vec3(0.07, 0.3, 0.36), vec3(0.01, 0.05, 0.08), pow(d, 0.7));
          gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), mix(0.28, 0.46, d)); }`,
    })
    const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 60).translate(0, -30, 0), waterMat)
    water.renderOrder = 2
    const soil = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }))
    soil.frustumCulled = false
    return { slab, water, soil, line, slabT, key: '' }
  }, [])
  useFrame(() => {
    const s = state.current
    const on = s.view === 'section'
    parts.slab.visible = parts.water.visible = parts.soil.visible = parts.line.visible = on
    if (!on) return
    const cz = s.boat.z + SECTION_CAM.cutZ, cx = s.boat.x
    parts.slab.position.set(cx, -parts.slabT / 2, cz + 0.02)
    parts.slab.material.uniforms.uHole.value.set(s.boat.x, s.boat.z)
    parts.line.position.set(cx, -parts.slabT - 0.02, cz + 0.04)
    parts.water.position.set(cx, -parts.slabT, cz + 0.01)
    const key = `${cx.toFixed(0)}|${cz.toFixed(1)}`
    if (key !== parts.key) { // the soil's top edge follows the lakebed along the cut
      parts.key = key
      const N = 241, pos = new Float32Array(N * 9), colr = new Float32Array(N * 9), idx = []
      const sed = new THREE.Color('#262216'), mid = new THREE.Color('#4a3b26'), bot = new THREE.Color('#16110a') // sediment, brown, dark
      for (let i = 0; i < N; i++) {
        const x = cx - 120 + i, y = -depthAt(x, cz) - 0.05
        pos.set([x, y, cz, x, y - 0.45, cz, x, -48, cz], i * 9); colr.set([sed.r, sed.g, sed.b, mid.r, mid.g, mid.b, bot.r, bot.g, bot.b], i * 9)
        if (i < N - 1) { const a = i * 3, b = a + 3; idx.push(a, a + 1, b, b, a + 1, b + 1, a + 1, a + 2, b + 1, b + 1, a + 2, b + 2) }
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx)
      parts.soil.geometry.dispose(); parts.soil.geometry = g
    }
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <primitive object={parts.slab} />
      <primitive object={parts.line} />
      <primitive object={parts.water} />
      <primitive object={parts.soil} />
    </group>
  )
}

export { col, KIT_SCALE }
