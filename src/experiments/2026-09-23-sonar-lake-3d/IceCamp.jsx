// The ice scene's own parts, used by Scene.jsx when scene === 'ice' (iceScene.js has the story and the presets):
//   IceSky    — the dome, centred on the camera
//   IceSheet  — the frozen surface (iceSheet.js), on the sonar-hidden layer like the water
//   IceCamp   — the live hole with the Mini on its pole rig and the kit, the shelter, the aim and destination rings,
//               and the hole-hopping sequence: the pole slides up → the kit walks, the tripod steps aside → the auger
//               drills → the tripod slides back, the pole goes down. The sonar has no signal meanwhile.
//   Snowfall  — the flakes
//   IcePick   — tap or drag on the ice: the ring follows the pointer; on release the kit moves there (crosshair over ice)
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeHoleKit, makeShelter, makeAimRing, makeGlow, makeSmoke, makeHeroPhone, makeAngler, KIT_SCALE, KIT_MATERIALS, GHOST_MATERIALS, POLE_TOP } from './iceProps'
import { makeSnowfall } from './snow'
import { makeSkyDome } from './iceSky'
import { ICE_T, MINI_DROP, APEX_Y, HOLE_DRAW_R, MAX_HOLES, ICE_CAMP, CUT_R, SECTION_CAM, WIND, TIMES, ICE_LAKE_W, ICE_CAM_D, col, dir } from './iceScene'
import { setBeamUniforms } from './lakeMaterial'
import { SONAR_HIDE_LAYER } from './SonarScreen'
import { HALF, depthAt } from './terrain'

const LIFT = ICE_T + MINI_DROP + 0.35 // how far the pole slides up when the Mini is pulled out of the hole
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

// ---- the camp and the hop (P05) ----
const easeOut = (u) => 1 - (1 - u) * (1 - u)
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
// the walk: speeds up over the first 30 %, cruises, brakes over the last 50 % (a trapezoid velocity profile)
const walk = (u, a = 0.3, b = 0.5) => { const v = 1 / (1 - a / 2 - b / 2); return u < a ? (v * u * u) / (2 * a) : u < 1 - b ? v * (a / 2 + u - a) : 1 - (v * (1 - u) * (1 - u)) / (2 * b) }
// the shelter from the live hole in the section view, per layout (M11): on desktop a secondary accent behind and right
// of the kit, on phones fully inside the right edge; both clear of the Forward cut box (|z| ≥ 5.5)
const CAMP_SECTION = { desktop: [8.5, -6], phone: [5.5, -5.5] }
const KIT_ISLAND_R = 2.4 // the spread kit and its sled stand on the island in the cut looks (iceScene ISLAND_R is 1.9)
const BASE_PARK = 0.85 * KIT_SCALE // during the walk and the drill the tripod stands aside: its feet clear the slush ring
const POLE_LEAN = -0.12 // and the lifted pole leans away from the hole in its sleeve
const PLUNGE = 0.6 // how deep the auger's blade goes
const U_ARRIVE = 0.12, U_PLUNGE = 0.76 // drill phase: the auger swings over the hole by u 0.12, plunges over the next 0.76
const U_BREAK = U_ARRIVE + (U_PLUNGE * Math.asin(ICE_T / PLUNGE)) / Math.PI // the blade crosses the ice's underside
const OLD_HOLE_AGE = 20 // s: a hole left behind is open water this long, then skins over (iceSheet.js reads it from w)
// the shelter lamp and its window per time of day (M04: the hut is the second thing the eye finds, the device first)
const LAMP = { dusk: { lamp: 0.75, window: 1.25 }, night: { lamp: 1.0, window: 1.3 }, day: { lamp: 0.25, window: 0.9 } }
const Q = typeof window !== 'undefined' ? window.location.search : ''
const HUT = (/[?&]hut=(stay|fold|follow)/.exec(Q) || [])[1] || 'follow' // Jason's pick (follow = as approved so far)
const HERO = (/[?&]hero=(phone|angler|both)/.exec(Q) || [])[1] || '' // Jason's pick: nothing extra by default
const Y_AXIS = new THREE.Vector3(0, 1, 0)

// Push the hole list into the sheet. w per hole: 1 live; 0.9 → 1 while the auger drills it (0.9 = shavings, no water
// yet; it reaches 1 over 0.15 s after the blade breaks through); old holes 0.75 → 0 over OLD_HOLE_AGE (0.75 = just
// left, open water; 0 = skinned). iceSheet.js today treats w > 0.75 as live and anything else as skinned. Returns
// whether an old hole is still ageing (so the uniforms keep being written).
function writeHoles(mat, holes, now) {
  const u = mat.userData.uniforms
  const list = holes.slice(-MAX_HOLES)
  let ageing = false
  list.forEach((h, i) => {
    let w = h.w ?? 1
    if (!h.live) { w = 0.75 * (1 - Math.min(1, Math.max(0, (now - (h.born ?? -1e9)) / OLD_HOLE_AGE))); if (w > 0) ageing = true }
    u.uHoles.value[i].set(h.x, h.z, h.r, w)
  })
  u.uHoleCount.value = list.length
  return ageing
}

export function IceCamp({ state, beamMats, iceMat, T }) {
  const kit = useMemo(makeHoleKit, [])
  const shelter = useMemo(makeShelter, [])
  const aim = useMemo(makeAimRing, [])
  const dest = useMemo(makeAimRing, []) // where the kit is going (from the tap until the auger arrives) and the "too close" flash
  const halo = useMemo(() => makeGlow(0.9, 0.7, '#ffb060'), [])
  const apexGlow = useMemo(() => makeGlow(0.5, 0.5, '#7fe6ff', { core: 0.9, depthTest: false, order: 8 }), [])
  const smoke = useMemo(() => makeSmoke(), [])
  const timeKey = Object.keys(TIMES).find((k) => TIMES[k] === T) || 'dusk'
  const lampT = LAMP[timeKey]
  const parts = useMemo(() => {
    const auger = kit.getObjectByName('auger')
    const p = { rig: kit.getObjectByName('rig'), base: kit.getObjectByName('base'), head: kit.getObjectByName('head'), ghost: kit.getObjectByName('ghost'), ghostHead: kit.getObjectByName('ghostHead'), auger, augerShadow: kit.getObjectByName('augerShadow'), park: auger.position.clone(), lean: auger.rotation.z, hutBody: shelter.getObjectByName('body') }
    if (HERO === 'phone' || HERO === 'both') { // a lit phone clipped near the top of the pole, screen toward the camera side
      const ph = makeHeroPhone(); ph.position.set(0, POLE_TOP - 0.25, 0.075); ph.rotation.set(-0.44, -0.12, 0, 'YXZ')
      kit.getObjectByName('pole').add(ph)
    }
    if (HERO === 'angler' || HERO === 'both') { // on the bucket, turned to the screen (his own phone when the pole has none)
      const a = makeAngler({ phoneInHands: HERO === 'angler' }); a.position.copy(kit.userData.seat)
      a.rotation.y = -Math.atan2(-kit.userData.seat.z, -kit.userData.seat.x)
      kit.add(a)
    }
    return p
  }, [kit, shelter])
  const s0 = state.current
  // the camp: the shelter a few metres from the hole, the door toward it (allocation-free: it runs every frame)
  const campAt = (hx, hz, dx, dz, out = { lamp: new THREE.Vector3(), win: new THREE.Vector3(), pipe: new THREE.Vector3() }) => {
    const cx = hx + dx, cz = hz + dz
    const ux = hx - cx, uz = hz - cz, L = Math.hypot(ux, uz)
    out.x = cx; out.z = cz; out.yaw = Math.atan2(uz / L, -ux / L)
    out.lamp.copy(shelter.userData.lampLocal).applyAxisAngle(Y_AXIS, out.yaw).add({ x: cx, y: 0, z: cz })
    out.win.copy(shelter.userData.windowLocal).applyAxisAngle(Y_AXIS, out.yaw).add({ x: cx, y: 0, z: cz })
    out.pipe.copy(shelter.userData.pipeTip).applyAxisAngle(Y_AXIS, out.yaw).add({ x: cx, y: 0, z: cz })
    return out
  }
  const camp = useMemo(() => campAt(s0.boat.x, s0.boat.z, ICE_CAMP[0], ICE_CAMP[1]), [shelter, s0]) // eslint-disable-line react-hooks/exhaustive-deps
  const live = useMemo(() => ({ c: campAt(0, 0, 1, 1), boxT: [new THREE.Vector4(), new THREE.Vector4()], doorN: new THREE.Vector3(), toCam: new THREE.Vector3(), life: { next: 4 + Math.random() * 6, dip0: -10 } }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const campG = useRef(), lampRef = useRef()
  useEffect(() => {
    const s = state.current
    s.holes = [{ x: s.boat.x, z: s.boat.z, r: HOLE_DRAW_R, live: true, w: 1 }]
    s.iceT = s.iceT ?? 0
    s.holesAgeing = writeHoles(iceMat, s.holes, s.iceT)
    const u = iceMat.userData.uniforms
    u.uLamp.value.set(camp.lamp.x, camp.lamp.y, camp.lamp.z, lampT.lamp)
    u.uLampColor.value.set('#ffb060')
  }, [iceMat, camp, lampT, state])
  useFrame((st, dtRaw) => {
    const s = state.current
    const dtR = Math.min(dtRaw, 0.1)
    const dt = dtR * (s.hopRate ?? 1) // dev aid: window.__sonarState.hopRate = 0.1 slows the hop ten times for frame-exact strips
    s.iceT = (s.iceT ?? 0) + dt
    const now = s.iceT
    const d = (s.drill ||= { phase: 'idle', t: 0, opened: false })
    const section = s.view === 'section'
    const phone = s.phoneCam ?? (ICE_LAKE_W / (2 * Math.tan(THREE.MathUtils.degToRad(st.camera.fov / 2)) * (st.size.width / st.size.height) * ICE_CAM_D.length()) > 1) // the Rig's k > 1 test, until Scene.jsx publishes s.phoneCam
    const hut = (s.hut ||= { mode: '', t: 0 })
    if (d.phase === 'idle' && Math.hypot(s.target.x - s.boat.x, s.target.z - s.boat.z) > 0.8) {
      d.phase = 'lift'; d.t = 0; d.opened = false; d.pushed = false
      d.from = { x: s.boat.x, z: s.boat.z }; d.to = { x: s.target.x, z: s.target.z }
      const L = Math.hypot(d.to.x - d.from.x, d.to.z - d.from.z) || 1
      d.dir = { x: (d.to.x - d.from.x) / L, z: (d.to.z - d.from.z) / L }
      d.ring = 0
      s.hasDragged = true // any hop (a tap or a step card) retires the hint
      if (HUT === 'fold' && section) { hut.mode = 'fold'; hut.t = 0 }
    }
    d.t += dt
    hut.t += dt
    let lift = 0, baseX = 0, lean = 0, lead = 0, bob = 0, drilling = 0
    if (d.phase !== 'idle') {
      const dur = d.phase === 'move' ? (d.moveDur ?? DUR.move) : DUR[d.phase]
      const u = Math.min(1, d.t / dur)
      if (d.phase === 'lift') { // the pole slides up out of the hole; the base stays on the ice
        lift = easeOut(u) * LIFT
        if (u >= 1) { d.phase = 'move'; d.t = 0 }
      } else if (d.phase === 'move') { // the kit walks; the tripod steps aside, the carried pole leans and bobs
        lift = LIFT
        const e = walk(u)
        s.boat.x = d.from.x + (d.to.x - d.from.x) * e; s.boat.z = d.from.z + (d.to.z - d.from.z) * e
        const p = ease(Math.min(1, d.t / 0.3)); baseX = BASE_PARK * p; lean = POLE_LEAN * p
        const env = Math.sin(Math.PI * u)
        lead = 0.07 * env; bob = 0.04 * Math.sin(2 * Math.PI * d.t) ** 2 * env // a 4° lead, a 4 cm step at 2 Hz
        if (u >= 1) { d.phase = 'drill'; d.t = 0 }
      } else if (d.phase === 'drill') {
        lift = LIFT; baseX = BASE_PARK; lean = POLE_LEAN; drilling = u
        if (u >= 1) { d.phase = 'drop'; d.t = 0 }
      } else if (d.phase === 'drop') { // the tripod slides back over the new hole (0.3 s), then the pole goes down (0.4 s)
        const tS = 0.3
        if (d.t < tS) { const p = 1 - ease(d.t / tS); baseX = BASE_PARK * p; lean = POLE_LEAN * p; lift = LIFT }
        else lift = (1 - ease(Math.min(1, (d.t - tS) / (DUR.drop - tS)))) * LIFT
        if (u >= 1) {
          d.phase = 'idle'; d.t = 0
          if (HUT === 'fold' && section) { campAt(s.boat.x, s.boat.z, ...CAMP_SECTION[phone ? 'phone' : 'desktop'], live.c); hut.placed = true; hut.mode = 'pitch'; hut.t = 0 }
        }
      }
    }
    // the auger: parked beside the hole, or over it, spinning up, down PLUNGE and back up, spinning down
    const { auger, park } = parts
    let holesDirty = false
    if (drilling > 0) {
      const inOut = Math.min(1, drilling / U_ARRIVE) * (1 - Math.max(0, (drilling - 0.88) / 0.12))
      const pl = Math.min(1, Math.max(0, (drilling - U_ARRIVE) / U_PLUNGE))
      auger.position.set(park.x * (1 - inOut), -PLUNGE * Math.sin(Math.PI * pl), park.z * (1 - inOut))
      auger.rotation.z = parts.lean * (1 - inOut)
      auger.rotation.y += dt * 22 * smooth(0, 0.15, drilling) * (1 - smooth(0.9, 1, drilling))
      if (!d.pushed && drilling >= U_ARRIVE) { // the blade bites: the new hole starts (shavings), the old one is left open
        d.pushed = true
        s.holes.forEach((h) => { if (h.live) { h.live = false; h.born = now } })
        s.holes.push({ x: d.to.x, z: d.to.z, r: 0.001, live: true, w: 0.9 })
        if (s.holes.length > MAX_HOLES) s.holes.shift()
      }
      if (d.pushed && !d.opened) s.holes[s.holes.length - 1].r = Math.max(0.001, HOLE_DRAW_R * smooth(U_ARRIVE, U_BREAK, drilling))
      if (!d.opened && auger.position.y < -ICE_T) { d.opened = true; d.openT = now } // break-through, from where the blade really is
      holesDirty = d.pushed
    } else { auger.position.copy(park); auger.rotation.z = parts.lean }
    if (d.opened && d.openT != null) {
      const h = s.holes[s.holes.length - 1]
      if (h.live && h.w < 1) { h.r = HOLE_DRAW_R; h.w = Math.min(1, 0.9 + (0.1 * (now - d.openT)) / 0.15); holesDirty = true }
    }
    if (holesDirty || s.holesAgeing) s.holesAgeing = writeHoles(iceMat, s.holes, now)
    parts.augerShadow.position.set(auger.position.x, 0.03, auger.position.z)
    kit.position.set(s.boat.x, 0, s.boat.z)
    parts.base.position.x = baseX
    const poleLift = lift + bob
    parts.rig.userData.setPose({ lift: poleLift, tiltZ: lean - lead * (d.dir?.x ?? 0), tiltX: lead * (d.dir?.z ?? 0) })
    // the head turns with the view: the Mini's face forward for Forward and Combo, down for Down, Live Ice and Ice Fishing
    const headT = s.mode === 'forward' || s.mode === 'combo' ? 0 : -Math.PI / 2
    parts.head.rotation.z += (headT - parts.head.rotation.z) * Math.min(1, dtR * 8)
    parts.ghostHead.rotation.z = parts.head.rotation.z
    // two things, kept apart: s.noSignal is the state machine's boolean (a hop is under way); s.signal (0..1) is the
    // visual gate, from the geometry — the transducer is wet while it is below the ice's underside. Everything the
    // sonar lights (the wedge, the lit bottom, the ice window, the apex light, the phone's picture and readout) follows
    // s.signal, so cause and effect stay together: the cone rides up with the Mini and goes out as it leaves the water
    // (~0.3 s), stays dark on the walk and the drill, and wakes with the picture after the drop (~3/s, bottom first)
    s.noSignal = d.phase !== 'idle'
    const apexY = APEX_Y + poleLift
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
    // its footprint on the bottom under the hole and everything above it, with a margin. The boxes ease toward their
    // targets (6/s) so a mode change morphs the opening instead of popping it (M28)
    u.uCutC.value.set(s.boat.x, s.boat.z); u.uCutR.value = CUT_R; u.uIsland.value = KIT_ISLAND_R
    const D = Math.max(1, depthAt(s.boat.x, s.boat.z) + APEX_Y) // water under the Mini
    const fans = s.specs.slice(0, 2)
    fans.forEach((sp, k) => {
      const phi = Math.atan2(sp.frame.c.x, -sp.frame.c.y), h = (sp.a1 - sp.a0) / 2
      const reach = (a) => (Math.abs(a) >= Math.PI / 2 - 1e-3 ? Math.sign(a) * sp.R : Math.max(-sp.R, Math.min(sp.R, D * Math.tan(a))))
      const xMin = Math.min(reach(phi - h), 0) - 1.0, xMax = reach(phi + h) + 1.0
      const zHalf = Math.min(sp.R, Math.hypot(D, Math.max(-xMin, xMax))) * Math.tan(sp.theta) + 0.8
      live.boxT[k].set(xMin, xMax, zHalf, 1)
    })
    for (let k = fans.length; k < 2; k++) live.boxT[k].w = 0
    const eb = 1 - Math.exp(-6 * dtR)
    for (let k = 0; k < 2; k++) {
      const b = u.uCutBox.value[k], t = live.boxT[k]
      if (!live.boxInit) { b.copy(t); continue }
      if (t.w > 0.5) {
        if (b.w < 0.5) { const m = (t.x + t.y) / 2; b.set(m, m, 0, 1) } // a new fan grows from its centre
        b.x += (t.x - b.x) * eb; b.y += (t.y - b.y) * eb; b.z += (t.z - b.z) * eb
      } else if (b.w > 0.5) { // a fan that went away shrinks to its centre, then switches off
        const m = (b.x + b.y) / 2
        b.x += (m - b.x) * eb; b.y += (m - b.y) * eb; b.z -= b.z * eb
        if (b.y - b.x < 0.05 && b.z < 0.05) b.w = 0
      }
    }
    live.boxInit = true
    u.uBeamOn.value = s.signal // the ice window over the beam and the live hole's glow (iceSheet.js) go with the same gate
    // the beam's source: a small cool light at the apex, pulsing with the pings, out with the signal (M04)
    apexGlow.position.copy(s.apex); apexGlow.quaternion.copy(st.camera.quaternion)
    apexGlow.material.uniforms.uI.value = s.signal * (0.75 + 0.25 * Math.exp(-((st.clock.elapsedTime * 8) % 1) * 5))
    apexGlow.visible = s.signal > 0.004
    // the ghost of the submerged head, Mini and pole: section view only, fading as the pole comes up
    const gf = section ? Math.max(0, 1 - poleLift / LIFT) : 0
    parts.ghost.visible = gf > 0.01
    for (const m of GHOST_MATERIALS) m.opacity = m.userData.base * gf
    // the aim ring under the pointer (on the underside of the sheet in the under-ice view)
    const ringY = s.view === 'under' ? -ICE_T - 0.02 : 0.015
    aim.visible = !!s.aiming && !!s.aim
    if (s.aim) aim.position.set(s.aim.x, ringY, s.aim.z)
    // the destination: from the tap until the auger arrives, pulsing, then a 0.25 s fade (M12); a tap too close to the
    // live hole flashes its ring once instead of being silently ignored
    const going = d.phase === 'lift' || d.phase === 'move' || (d.phase === 'drill' && drilling <= U_ARRIVE)
    d.ring = d.phase === 'idle' ? 0 : going ? 1 : Math.max(0, (d.ring ?? 0) - dtR * 4)
    const flash = s.rejectT != null ? (performance.now() / 1000 - s.rejectT) / 0.4 : 2
    if (d.ring > 0.001 && d.to) {
      const pulse = 0.5 + 0.5 * Math.sin((st.clock.elapsedTime * 2 * Math.PI) / 1.2)
      dest.visible = true; dest.position.set(d.to.x, ringY, d.to.z); dest.scale.setScalar(1 + 0.12 * pulse)
      dest.userData.ring.opacity = (0.5 + 0.35 * pulse) * d.ring; dest.userData.dot.opacity = 0.28 * d.ring
    } else if (flash < 1 && d.phase === 'idle') {
      const a = Math.sin(Math.PI * flash)
      dest.visible = true; dest.position.set(s.boat.x, ringY, s.boat.z); dest.scale.setScalar(1 + 0.15 * flash)
      dest.userData.ring.opacity = 0.85 * a; dest.userData.dot.opacity = 0.2 * a
    } else dest.visible = false
    // the camp. Section view: beside the hole at the layout's offset; the other views leave it where the visitor started.
    // During a hop (?hut=): follow = it keeps its place beside the kit; stay = it stays put; fold = it folds at the lift
    // and pitches again beside the new hole after the drop, lamp last
    const off = CAMP_SECTION[phone ? 'phone' : 'desktop']
    let c = camp
    if (section) {
      const key = `${phone}`
      if (HUT === 'follow') c = campAt(s.boat.x, s.boat.z, off[0], off[1], live.c)
      else {
        if (!hut.placed || hut.key !== key || hut.view !== 'section') { campAt(s.boat.x, s.boat.z, off[0], off[1], live.c); hut.placed = true }
        c = live.c
      }
      hut.key = key
    }
    hut.view = s.view
    let fold = 1, hutLamp = 1
    if (section && hut.mode === 'fold') { fold = 1 - 0.94 * ease(Math.min(1, hut.t / 0.45)); hutLamp = Math.max(0, 1 - hut.t / 0.2) }
    else if (section && hut.mode === 'pitch') {
      fold = 0.06 + 0.94 * ease(Math.min(1, hut.t / 0.5)); hutLamp = Math.min(1, Math.max(0, (hut.t - 0.5) / 0.25))
      if (hut.t > 0.75) hut.mode = ''
    } else if (d.phase === 'idle' || !section) hut.mode = '' // guard: a view switch or a finished hop never leaves it folded
    const hutShown = !(section && hut.mode === 'fold' && hut.t >= 0.45)
    if (campG.current) { campG.current.position.set(c.x, 0, c.z); campG.current.rotation.y = c.yaw; campG.current.visible = hutShown }
    parts.hutBody.scale.y = fold
    // the lamp's life (M23): a slow breath (±4 %) and, every 6–14 s, a 0.35 s dip as someone moves past the window
    const T0 = st.clock.elapsedTime
    if (T0 > live.life.next) { live.life.dip0 = T0; live.life.next = T0 + 6 + Math.random() * 8 }
    const dx = (T0 - live.life.dip0) / 0.35, dip = dx >= 0 && dx < 1 ? Math.sin(Math.PI * dx) ** 2 : 0
    const breath = 1 + 0.04 * Math.sin(T0 * 1.9)
    const lifeW = breath * (1 - 0.3 * dip), lifeL = breath * (1 - 0.15 * dip)
    const lampV = lampT.lamp * lifeL * hutLamp
    if (lampRef.current) { lampRef.current.position.set(c.lamp.x, c.lamp.y + 0.2, c.lamp.z); lampRef.current.intensity = lampV * (section ? 4.5 : 7) }
    u.uLamp.value.set(c.lamp.x, c.lamp.y, c.lamp.z, lampV)
    KIT_MATERIALS.window.color.copy(KIT_MATERIALS.window.userData.base).multiplyScalar((lampT.window / 1.3) * lifeW * hutLamp)
    // the window's halo: camera-facing, fading as the door turns away (no warm patch from above or behind)
    live.doorN.set(-Math.cos(c.yaw), 0, Math.sin(c.yaw))
    live.toCam.copy(st.camera.position).sub(c.win).normalize()
    halo.position.copy(c.win); halo.position.y = c.win.y * fold; halo.quaternion.copy(st.camera.quaternion)
    halo.material.uniforms.uI.value = 0.32 * lampT.lamp * lifeW * hutLamp * smooth(0, 0.4, live.doorN.dot(live.toCam)) * (hutShown ? 1 : 0)
    // the stovepipe's smoke: someone is in there (hidden in daylight, when the lamp is weak)
    smoke.position.set(c.pipe.x, c.pipe.y * fold, c.pipe.z)
    const su = smoke.material.uniforms
    su.uTime.value = T0; su.uWind.value.copy(WIND); su.uViewH.value = st.size.height * st.viewport.dpr
    su.uAlpha.value = lampT.lamp >= 0.5 && hutShown ? hutLamp : 0
    smoke.visible = su.uAlpha.value > 0.001
  })
  return (
    <group onUpdate={(g) => g.traverse((o) => o.layers.set(SONAR_HIDE_LAYER))}>
      <primitive object={kit} />
      <primitive ref={campG} object={shelter} position={[camp.x, 0, camp.z]} rotation-y={camp.yaw} />
      <primitive object={aim} />
      <primitive object={dest} />
      <primitive object={halo} />
      <primitive object={smoke} />
      <primitive object={apexGlow} />
      <pointLight ref={lampRef} position={[camp.lamp.x, camp.lamp.y + 0.2, camp.lamp.z]} color="#ffb060" intensity={lampT.lamp * 7} distance={10} decay={2} />
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
  const { gl } = useThree()
  const cursor = (c) => { if (gl.domElement.style.cursor !== c) gl.domElement.style.cursor = c } // crosshair over the ice a tap would drill
  const clampXZ = (p) => ({ x: THREE.MathUtils.clamp(p.x, -58, 58), z: THREE.MathUtils.clamp(p.z, -58, 58) })
  // the section view: the ice in front of the wall is cut away, so a tap counts only on the ice behind it (a ray that
  // meets the sheet's plane in front of the wall came through the water column or the empty cut — ignored)
  const onIce = (s, p) => s.view !== 'section' || p.z < s.boat.z + SECTION_CAM.cutZ - 0.4
  const onDown = (e) => { e.stopPropagation(); const s = state.current; if (!onIce(s, e.point)) { s.aiming = false; s.aim = null; return } s.aiming = true; s.aim = clampXZ(e.point); e.target.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => { const s = state.current; const ok = onIce(s, e.point); cursor(ok ? 'crosshair' : ''); if (!s.aiming) return; if (!ok) { s.aim = null; return } s.aim = clampXZ(e.point) }
  const onUp = () => {
    const s = state.current
    if (!s.aiming) return
    s.aiming = false
    if (!s.aim || s.drill?.phase !== 'idle') return
    if (Math.hypot(s.aim.x - s.boat.x, s.aim.z - s.boat.z) < 1.0) { s.rejectT = performance.now() / 1000; return } // too close: IceCamp flashes the live hole's ring
    s.target.x = s.aim.x; s.target.z = s.aim.z; s.hasDragged = true
  }
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.02} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerOut={() => cursor('')}>
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
