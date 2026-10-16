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
import { ICE_T, MINI_DROP, APEX_Y, HOLE_DRAW_R, MAX_HOLES, ICE_CAMP, CUT_R, ISLAND_R, SECTION_CAM, col, dir } from './iceScene'
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
    u.uClipZ.value = s.view === 'section' ? s.boat.z + SECTION_CAM.cutZ : 1e5
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
  const cableLen = ICE_T + MINI_DROP - MINI_H + CABLE_TOP_Y
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
    if (glowRef.current) { glowRef.current.position.set(s.boat.x, APEX_Y + 0.3 + lift, s.boat.z); glowRef.current.intensity = 3 * u.uBeamOn.value }
    // the aim ring under the pointer (on the underside of the sheet in the under-ice view)
    aim.visible = !!s.aiming
    if (s.aim) aim.position.set(s.aim.x, s.view === 'under' ? -ICE_T - 0.02 : 0.015, s.aim.z)
    // the section view keeps the camp beside the hole, inside the cut; the other views leave it where the visitor started
    const c = s.view === 'section' ? campAt(s.boat.x, s.boat.z, -9, 0.6) : camp
    if (campG.current) { campG.current.position.set(c.x, 0, c.z); campG.current.rotation.y = c.yaw }
    if (sledG.current) { sledG.current.position.set(c.x - 1.1, 0, c.z + (s.view === 'section' ? -2.6 : 2.3)); sledG.current.rotation.y = c.yaw + 0.5 }
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
    pts.visible = s.view === 'under'
    const u = pts.userData.uniforms
    u.uTime.value = clock.elapsedTime; u.uAmount.value = 0.9; u.uPixelRatio.value = gl.getPixelRatio()
    u.uCenter.value.set(s.boat.x, -11.4, s.boat.z)
  })
  return <primitive object={pts} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

// ---- view B: the cut faces of the section — the ice slab, the water column, the soil under the lakebed ----
export function SectionFaces({ state }) {
  const parts = useMemo(() => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(240, ICE_T, 0.04), new THREE.MeshStandardMaterial({ color: '#d4e6f2', emissive: '#8fb9d6', emissiveIntensity: 0.4, roughness: 0.55, transparent: true, opacity: 0.94 }))
    const waterMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uTop: { value: -ICE_T }, uTime: { value: 0 } },
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
    return { slab, water, soil, key: '' }
  }, [])
  useFrame(() => {
    const s = state.current
    const on = s.view === 'section'
    parts.slab.visible = parts.water.visible = parts.soil.visible = on
    if (!on) return
    const cz = s.boat.z + SECTION_CAM.cutZ, cx = s.boat.x
    parts.slab.position.set(cx, -ICE_T / 2, cz + 0.02)
    parts.water.position.set(cx, -ICE_T, cz + 0.01)
    const key = `${cx.toFixed(0)}|${cz.toFixed(1)}`
    if (key !== parts.key) { // the soil's top edge follows the lakebed along the cut
      parts.key = key
      const N = 241, pos = new Float32Array(N * 6), colr = new Float32Array(N * 6), idx = []
      const top = new THREE.Color('#5a4a2e'), bot = new THREE.Color('#1a140c')
      for (let i = 0; i < N; i++) {
        const x = cx - 120 + i, y = -depthAt(x, cz) - 0.05
        pos.set([x, y, cz, x, -48, cz], i * 6); colr.set([top.r, top.g, top.b, bot.r, bot.g, bot.b], i * 6)
        if (i < N - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 2, i * 2 + 1, i * 2 + 3)
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(colr, 3)); g.setIndex(idx)
      parts.soil.geometry.dispose(); parts.soil.geometry = g
    }
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <primitive object={parts.slab} />
      <primitive object={parts.water} />
      <primitive object={parts.soil} />
    </group>
  )
}

export { col, KIT_SCALE }
