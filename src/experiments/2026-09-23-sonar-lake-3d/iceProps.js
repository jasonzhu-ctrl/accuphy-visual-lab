// The ice camp, built in code like the boat (no downloaded models: nothing to license, nothing to load).
// Frame: x forward, y up (ice top = 0), z sideways. Real sizes except the Mini (MINI_SCALE, like the fish) and the
// hole kit, which is scaled a little so a bucket is not a 6 px dot from the camera.
//   makeHoleKit()  — what sits at the live hole: the pole rig with the PingLive Mini, a bucket, an ice rod on its holder,
//                    the auger and the sled the kit came on (named children: the drill animation moves them)
//   makeShelter()  — a pop-up hub shelter with a lit door
//   makeSled()     — a black utility sled: it hauls the kit, so it rides with it (makeHoleKit)
//   makeAimRing()  — the "drill here" ring under the pointer (and the destination marker during a hop)
//   makeGlow(), makeSmoke() — the shelter window's halo, the apex light, the stovepipe's smoke (IceCamp.jsx drives them)
//   makeHeroPhone(), makeAngler() — options for Jason (?hero=phone|angler|both): a lit phone on the pole, a seated angler
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { ICE_T, MINI_DROP, MINI_SCALE, HOLE_DRAW_R } from './iceScene'

const merge = (parts) => mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
const box = (sx, sy, sz, x, y, z) => new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z)
const rbox = (sx, sy, sz, r, x, y, z) => new RoundedBoxGeometry(sx, sy, sz, 2, r).translate(x, y, z)
const cyl = (rt, rb, h, x, y, z, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z)
const mesh = (g, m) => new THREE.Mesh(g, m)

export const KIT_SCALE = 1.5 // bucket, rod, arm, auger: a little bigger than life, like the hole (HOLE_SCALE)
export const MINI_H = 0.1 * MINI_SCALE // body height as drawn
export const CABLE_TOP_Y = 0.42 * KIT_SCALE // where the cable leaves the arm, above the ice

// ACES stays on the props (M24, S version): no environment map exists, so a metallic lobe is only lost light — the
// metals are aluminium-grey and nearly dielectric; the window is unlit and not tone-mapped so it keeps its amber
const M = {
  black: new THREE.MeshStandardMaterial({ color: '#1a1d21', roughness: 0.5, metalness: 0 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.7, metalness: 0.15 }),
  metal: new THREE.MeshStandardMaterial({ color: '#c4cad0', roughness: 0.45, metalness: 0.25 }),
  blue: new THREE.MeshStandardMaterial({ color: '#028cdf', roughness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: '#e6e9ec', roughness: 0.85 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#23272b', roughness: 0.95 }),
  trim: new THREE.MeshStandardMaterial({ color: '#8a2d28', roughness: 0.9 }),
  door: new THREE.MeshStandardMaterial({ color: '#2f343a', roughness: 0.9 }),
  // the same amber as its streak on the ice (uLampColor '#ffb060'); IceCamp.jsx scales the colour per time of day and
  // with the lamp's life — userData.base is full strength
  window: new THREE.MeshBasicMaterial({ color: '#ffb060', toneMapped: false, fog: false }),
  cable: new THREE.MeshStandardMaterial({ color: '#0e0f11', roughness: 0.7 }),
  face: new THREE.MeshStandardMaterial({ color: '#dfe3e8', roughness: 0.6 }),
}
M.window.userData.base = M.window.color.clone()
export const KIT_MATERIALS = M
// a soft contact shadow on the ice: things on a plane need one or they float (#109). A dark blue disc, fading out;
// drawn after the (transparent) sheet. Sits 3 cm up so the thin snow relief never buries it.
const shadeMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `precision highp float; varying vec2 vUv;
    void main() { float r = length((vUv - 0.5) * 2.0); gl_FragColor = vec4(0.01, 0.025, 0.05, 0.55 * (1.0 - smoothstep(0.3, 1.0, r))); }`,
})
export function shadow(rx, rz, x = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2).rotateX(-Math.PI / 2), shadeMat)
  m.position.set(x, 0.03, z); m.renderOrder = 2
  return m
}

// ---------- the PingLive Mini: a shield-shaped puck on its cable (reference/product-images/PingLive Mini (1).png) ----------
export function makeMini() {
  const s = MINI_SCALE
  const w = 0.125 * s, h = 0.1 * s, t = 0.023 * s
  const sh = new THREE.Shape()
  sh.moveTo(-w / 2, h); sh.lineTo(w / 2, h); sh.lineTo(w / 2, h * 0.46); sh.lineTo(0, 0); sh.lineTo(-w / 2, h * 0.46); sh.closePath()
  const body = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: true, bevelSize: 0.004 * s, bevelThickness: 0.004 * s, bevelSegments: 2 }).translate(0, 0, -t / 2)
  const boss = cyl(0.014 * s, 0.014 * s, 0.05 * s, -w * 0.32, h + 0.02 * s, 0, 8) // cable gland at the top-left
  const ring = new THREE.TorusGeometry(0.011 * s, 0.003 * s, 6, 16).translate(w * 0.3, h * 0.7, t / 2 + 0.002) // the button ring
  const g = new THREE.Group()
  g.add(mesh(merge([body, boss]), M.dark), mesh(ring, M.face))
  const label = mesh(new THREE.PlaneGeometry(w * 0.5, h * 0.11).translate(-w * 0.14, h * 0.72, t / 2 + 0.002), M.face) // the wordmark strip
  g.add(label)
  return g // origin = the pointed bottom (the beam apex), face toward +z
}

// ---------- the pole rig: base, pole, handle, head with the Mini, cable, router bag ----------
// Two named parts, so a hop reads like the real thing (a sonar pole slides in its base's sleeve):
//   base — tripod legs and feet, hub sleeve and depth collar, router bag, the cable's drop to the bag, contact shadows:
//          it always stands on the ice
//   pole — pole, cane handle, grip, arrow, the head with the Mini, the cable up the pole: it slides up out of the hole
//          and back down (IceCamp.jsx), leaning about the collar ('poleTilt')
// plus a 'ghost' of the submerged part (head + Mini + pole) that IceCamp.jsx shows through the ice in the section view,
// so the beam visibly starts at the device (M04). rig.userData.setPose({ lift, tiltX, tiltZ }) moves the pole and
// re-hangs the cable.
export const POLE_TOP = 1.25 * KIT_SCALE   // the handle's height above the ice
const ghostFill = new THREE.MeshBasicMaterial({ color: '#cfe9ff', transparent: true, opacity: 0.7, depthTest: false, depthWrite: false, fog: false, toneMapped: false })
const ghostRim = new THREE.MeshBasicMaterial({ color: '#9fd8ff', transparent: true, opacity: 0.9, depthTest: false, depthWrite: false, fog: false, toneMapped: false, side: THREE.BackSide })
ghostFill.userData.base = 0.7; ghostRim.userData.base = 0.9
export const GHOST_MATERIALS = [ghostFill, ghostRim]
const ghostOf = (obj, mat, order) => { obj.traverse((o) => { if (o.isMesh) { o.material = mat; o.renderOrder = order; o.frustumCulled = false } }); return obj }
export function makePoleRig() {
  const k = KIT_SCALE
  const rig = new THREE.Group(); rig.name = 'rig'
  const headY = -(ICE_T + MINI_DROP) + MINI_H // the pole's foot: the head bracket; the Mini hangs MINI_H below it (its tip = the beam apex)
  const base = new THREE.Group(); base.name = 'base'
  // three-leg base: a sleeve hub over the hole, legs splayed to rubber feet (legs +40 %: a tripod at 1–2 px, not a scribble)
  const hubY = 0.42 * k
  const legs = []
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3, fx = Math.cos(a) * 0.42 * k, fz = Math.sin(a) * 0.42 * k
    const len = Math.hypot(0.42 * k, hubY - 0.02 * k)
    const leg = new THREE.CylinderGeometry(0.0155 * k, 0.018 * k, len, 8)
    const dir = new THREE.Vector3(fx, 0.02 * k - hubY, fz).normalize()
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir))
    leg.translate(fx / 2, (hubY + 0.02 * k) / 2, fz / 2)
    legs.push(leg, new THREE.CylinderGeometry(0.03 * k, 0.035 * k, 0.03 * k, 10).translate(fx, 0.015 * k, fz))
  }
  base.add(mesh(merge(legs), M.black))
  base.add(mesh(merge([cyl(0.04 * k, 0.04 * k, 0.14 * k, 0, hubY, 0, 12), new THREE.TorusGeometry(0.046 * k, 0.012 * k, 8, 20).rotateX(Math.PI / 2).translate(0, hubY + 0.08 * k, 0)]), M.dark)) // the hub sleeve and the depth collar the pole rests on
  const bagTop = new THREE.Vector3(0.48 * k, 0.15 * k, 0.46 * k)
  base.add(mesh(rbox(0.3 * k, 0.17 * k, 0.2 * k, 0.03 * k, 0.5 * k, 0.085 * k, 0.5 * k), new THREE.MeshStandardMaterial({ color: '#2b2f34', roughness: 0.95 }))) // the router + battery bag
  base.add(shadow(0.55 * k, 0.55 * k), shadow(0.22 * k, 0.17 * k, 0.5 * k, 0.5 * k)) // on the base: they stay on the ice when the pole lifts
  // the pole hangs from a pivot at the collar, so it can lean in the sleeve without the tripod leaving the ice
  const pivotY = hubY + 0.08 * k
  const tilt = new THREE.Group(); tilt.name = 'poleTilt'; tilt.position.y = pivotY
  const pole = new THREE.Group(); pole.name = 'pole'; pole.position.y = -pivotY
  tilt.add(pole); base.add(tilt)
  // the pole: from the head up through the hub to the handle (radius 0.024k: a light-grey line from 30 m)
  const poleLen = POLE_TOP - headY, pr = 0.024 * k
  pole.add(mesh(cyl(pr, pr, poleLen, 0, headY + poleLen / 2, 0, 10), M.metal))
  // the handle: a bent cane at the top with a grip, a small arrow cap shows where the beam points
  const cane = new THREE.TorusGeometry(0.09 * k, pr, 8, 16, Math.PI / 2).rotateY(Math.PI / 2).rotateZ(Math.PI).translate(0.09 * k, POLE_TOP, 0)
  pole.add(mesh(merge([cane, cyl(pr, pr, 0.2 * k, 0.19 * k, POLE_TOP + 0.09 * k, 0, 8).rotateZ(Math.PI / 2)]), M.metal))
  pole.add(mesh(cyl(0.03 * k, 0.03 * k, 0.12 * k, 0, 0, 0, 10).rotateZ(Math.PI / 2).translate(0.24 * k, POLE_TOP + 0.09 * k, 0), M.blue)) // the grip, brand blue
  pole.add(mesh(new THREE.ConeGeometry(0.03 * k, 0.05 * k, 3).rotateZ(-Math.PI / 2).translate(0.05 * k, POLE_TOP + 0.01 * k, 0), M.face)) // the arrow: forward = +x
  // the head: a bracket at the foot of the pole; the Mini hangs from it and pivots with the view (IceCamp.jsx)
  const head = new THREE.Group(); head.name = 'head'; head.position.set(0, headY, 0)
  const bracket = () => mesh(merge([rbox(0.06 * k, 0.07 * k, 0.04 * k, 0.008 * k, 0, 0.01 * k, 0), box(0.05 * k, 0.012 * k, 0.03 * k, 0.03 * k, -0.02 * k, 0)]), M.black)
  head.add(bracket())
  const placeMini = (g) => { g.rotation.y = Math.PI / 2; g.position.set(0.02 * k, -MINI_H, 0); return g } // the face toward +x: Forward
  const mini = placeMini(makeMini()); mini.name = 'mini'
  head.add(mini)
  pole.add(head)
  // the cable: up the pole and over the handle (on the pole), then a drop to the router bag (on the base, re-hung by setPose)
  const A = new THREE.Vector3(0.14 * k, POLE_TOP - 0.2 * k, 0.12 * k)
  const up = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02 * k, headY + 0.02 * k, 0.025 * k), new THREE.Vector3(0.02 * k, hubY, 0.028 * k), new THREE.Vector3(0.02 * k, POLE_TOP - 0.05 * k, 0.03 * k), A.clone()])
  pole.add(mesh(new THREE.TubeGeometry(up, 30, 0.006 * k, 6, false), M.cable))
  const sag = mesh(new THREE.BufferGeometry(), M.cable); base.add(sag)
  const a = new THREE.Vector3(), lastA = new THREE.Vector3(1e9, 0, 0)
  const hang = () => {
    tilt.updateMatrix(); pole.updateMatrix()
    a.copy(A).applyMatrix4(pole.matrix).applyMatrix4(tilt.matrix)
    if (a.distanceToSquared(lastA) < 1e-6) return
    lastA.copy(a)
    const m1 = new THREE.Vector3(a.x + 0.05 * k, a.y - 0.12 * k, a.z + 0.05 * k)
    const m2 = new THREE.Vector3(a.x + (bagTop.x - a.x) * 0.7, a.y + (bagTop.y - a.y) * 0.85, a.z + (bagTop.z - a.z) * 0.7)
    sag.geometry.dispose()
    sag.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone(), m1, m2, bagTop.clone()]), 24, 0.006 * k, 5, false)
  }
  hang()
  // the ghost: the submerged head, Mini and pole drawn again on top (no depth test), cool and translucent, with a wider
  // back-face hull behind as a rim. From 26–45 m the grazing ice and the dark water swallow the real ones.
  const ghost = new THREE.Group(); ghost.name = 'ghost'
  const gHead = new THREE.Group(); gHead.name = 'ghostHead' // turns with the head (IceCamp.jsx copies the rotation)
  gHead.position.set(0, headY, 0)
  const hull = (obj, s, cy) => { const outer = new THREE.Group(), inner = new THREE.Group(); outer.position.y = cy; inner.position.y = -cy; outer.scale.setScalar(s); inner.add(obj); outer.add(inner); return outer }
  gHead.add(ghostOf(hull(placeMini(makeMini()), 1.3, -MINI_H / 2), ghostRim, 6), ghostOf(hull(bracket(), 1.3, 0.01 * k), ghostRim, 6))
  gHead.add(ghostOf(placeMini(makeMini()), ghostFill, 7), ghostOf(bracket(), ghostFill, 7))
  const gLen = 0.1 - headY // the pole from the head up through the ice to just above it
  ghost.add(ghostOf(mesh(cyl(pr * 2.2, pr * 2.2, gLen, 0, headY + gLen / 2, 0, 8), M.black), ghostRim, 6))
  ghost.add(ghostOf(mesh(cyl(pr, pr, gLen, 0, headY + gLen / 2, 0, 8), M.black), ghostFill, 7))
  ghost.add(gHead)
  pole.add(ghost)
  rig.add(base)
  rig.userData.setPose = ({ lift = 0, tiltX = 0, tiltZ = 0 }) => {
    pole.position.y = -pivotY + lift
    tilt.rotation.set(tiltX, 0, tiltZ)
    hang()
  }
  return rig
}

// ---------- what sits at the live hole ----------
export function makeHoleKit() {
  const k = KIT_SCALE
  const g = new THREE.Group()
  // the sonar pole (Jason 2026-10-16: 声呐pole … 固定在杆子下方的头上): like the ice pole mounts sold for live sonar
  // (Garmin's Panoptix ice pole mount, Patriot IceFix 360, Accuphy's own 0° mount), the Mini is clamped to a head at the
  // bottom of a rigid pole; the pole stands in a three-leg base over the hole and turns by a handle at the top; the
  // cable runs up the pole and down to the router bag on the ice. When the visitor hole-hops the pole slides up out of
  // the hole while the base stays on the ice (IceCamp.jsx).
  g.add(makePoleRig())
  // the kit is spread round the hole (M11: within 1.3 m it was one blob from 30 m), every piece on the ice island
  // (IceCamp.jsx widens it to KIT_ISLAND_R 2.4 for the cut looks)
  // the bucket (the classic seat), left of the hole and toward the camera
  const bx = -1.5, bz = 0.9
  const bucket = merge([cyl(0.15 * k, 0.13 * k, 0.38 * k, bx, 0.19 * k, bz, 14), cyl(0.155 * k, 0.155 * k, 0.025 * k, bx, 0.385 * k, bz, 14)])
  g.add(mesh(bucket, M.white))
  g.add(mesh(cyl(0.12 * k, 0.12 * k, 0.012 * k, bx, 0.4 * k, bz, 14), M.black))
  g.add(shadow(0.2 * k, 0.2 * k, bx, bz))
  g.userData.seat = new THREE.Vector3(bx, 0.41 * k, bz) // the bucket's lid (the angler option sits here)
  // the sled the kit came on (it hauls the kit, so it travels with it), front-left of the hole, nose toward the camera
  const sled = makeSled(); sled.name = 'sled'
  sled.position.set(-2.0, 0, 1.2); sled.rotation.y = Math.PI / 2 + 0.3
  g.add(sled)
  // the ice rod on its holder, tip over the hole, line down the hole
  const rx = 0.38 * k, rz = -0.3 * k
  const holder = merge([box(0.1 * k, 0.02 * k, 0.14 * k, rx, 0.01 * k, rz), cyl(0.01 * k, 0.012 * k, 0.16 * k, rx, 0.09 * k, rz, 6)])
  g.add(mesh(holder, M.black))
  g.add(shadow(0.1 * k, 0.1 * k, rx, rz))
  const rod = new THREE.Group()
  rod.position.set(rx, 0.16 * k, rz)
  const rodGeo = merge([cyl(0.003 * k, 0.006 * k, 0.72 * k, 0, 0.36 * k, 0, 6), cyl(0.022 * k, 0.022 * k, 0.03 * k, 0, 0.06 * k, 0.02 * k, 10)]) // blank + reel
  const rodMesh = mesh(rodGeo, M.black)
  rodMesh.rotation.z = THREE.MathUtils.degToRad(68) // leaning toward the hole (−x)
  rodMesh.rotation.y = Math.atan2(rz, -rx) + Math.PI
  rod.add(rodMesh)
  g.add(rod)
  const line = mesh(new THREE.CylinderGeometry(0.0015 * k, 0.0015 * k, 1.2, 4).translate(0, -0.6, 0), M.face)
  line.position.set(0.06 * k, 0.16 * k + 0.68 * k * Math.sin(THREE.MathUtils.degToRad(22)), -0.03 * k)
  line.material = new THREE.MeshStandardMaterial({ color: '#cfd6dd', roughness: 0.6, transparent: true, opacity: 0.7 })
  g.add(line)
  // the auger, standing in the snow on the other side, leaning (named: the drill animation moves it)
  const auger = makeAuger()
  auger.position.set(1.1, 0, 1.5)
  auger.rotation.z = THREE.MathUtils.degToRad(-10)
  auger.name = 'auger'
  g.add(auger)
  // its contact shadow stays on the ice (kit space, y 0) instead of plunging with the blade (IceCamp.jsx moves it)
  const augerShadow = shadow(0.16 * k, 0.16 * k); augerShadow.name = 'augerShadow'
  augerShadow.position.set(1.1, 0.03, 1.5)
  g.add(augerShadow)
  return g
}

// a power auger: flighting on a shaft, a powerhead with two handles and brand-blue grips; origin at the blade tip
export function makeAuger() {
  const k = KIT_SCALE
  const g = new THREE.Group()
  const shaftH = 1.05 * k
  const parts = [cyl(0.016 * k, 0.016 * k, shaftH, 0, shaftH / 2 + 0.04 * k, 0, 8), new THREE.ConeGeometry(0.1 * k, 0.1 * k, 12).rotateX(Math.PI).translate(0, 0.05 * k, 0)]
  for (let i = 0; i < 6; i++) { // flighting: tilted discs read as a screw from the camera (+40 % thick: not a hairline)
    const d = new THREE.CylinderGeometry(0.1 * k, 0.1 * k, 0.017 * k, 14).rotateX(0.32).rotateY(i * 1.1).translate(0, 0.12 * k + i * 0.11 * k, 0)
    parts.push(d)
  }
  g.add(mesh(merge(parts), M.metal))
  const headY = shaftH + 0.08 * k
  const head = merge([rbox(0.3 * k, 0.2 * k, 0.2 * k, 0.03 * k, 0, headY + 0.1 * k, 0), box(0.7 * k, 0.025 * k, 0.025 * k, 0, headY + 0.12 * k, 0.16 * k)])
  g.add(mesh(head, M.black))
  const grips = merge([cyl(0.018 * k, 0.018 * k, 0.12 * k, 0, headY + 0.12 * k, 0.16 * k, 8).rotateZ(Math.PI / 2).translate(0.3 * k, 0, 0), cyl(0.018 * k, 0.018 * k, 0.12 * k, 0, headY + 0.12 * k, 0.16 * k, 8).rotateZ(Math.PI / 2).translate(-0.3 * k, 0, 0)])
  g.add(mesh(grips, M.blue))
  g.userData.shaftH = shaftH
  return g
}

// ---------- the pop-up hub shelter (a six-sided tent with a pyramid roof), door facing −x ----------
// 'body' holds everything that folds (IceCamp.jsx ?hut=fold); the contact shadow stays outside it
export function makeShelter() {
  const g = new THREE.Group()
  const body = new THREE.Group(); body.name = 'body'
  g.add(body)
  const R = 1.15, H = 1.45
  const wall = new THREE.CylinderGeometry(R * 0.9, R, H, 6, 1, true).translate(0, H / 2, 0)
  const roof = new THREE.ConeGeometry(R * 0.92, 0.75, 6).translate(0, H + 0.37, 0)
  const floorSkirt = new THREE.CylinderGeometry(R * 1.02, R * 1.06, 0.1, 6).translate(0, 0.05, 0)
  body.add(mesh(merge([wall, roof, floorSkirt]), M.fabric))
  body.add(mesh(new THREE.CylinderGeometry(R * 0.905, R * 0.935, 0.14, 6, 1, true).translate(0, H - 0.3, 0), M.trim)) // the red band
  // door on the −x face: a six-segment cylinder has a flat face centred on −x already (its vertices start on +z)
  const face = new THREE.Group()
  const apo = R * 0.95 * Math.cos(Math.PI / 6) // the face's distance from the centre (the wall leans in a little)
  const door = mesh(new THREE.PlaneGeometry(0.72, 1.2).translate(0, 0.62, 0), M.door)
  door.rotation.y = -Math.PI / 2; door.position.set(-apo - 0.012, 0, 0)
  const win = mesh(new THREE.PlaneGeometry(0.42, 0.3).translate(0, 0.98, 0), M.window)
  win.rotation.y = -Math.PI / 2; win.position.set(-apo - 0.02, 0, 0)
  face.add(door, win)
  body.add(face)
  // stovepipe out of the roof
  body.add(mesh(merge([cyl(0.045, 0.045, 0.6, 0.35, H + 0.5, 0.25, 8), cyl(0.07, 0.07, 0.06, 0.35, H + 0.82, 0.25, 8)]), M.black))
  g.add(shadow(1.5, 1.5))
  g.userData = {
    lampLocal: new THREE.Vector3(-apo - 0.25, 1.0, 0), // where the lamp light comes from (world after the group transform)
    windowLocal: new THREE.Vector3(-apo - 0.12, 0.98, 0), // the window's halo, 0.1 m proud of the door
    pipeTip: new THREE.Vector3(0.35, H + 0.86, 0.25), // where the smoke leaves the stovepipe
  }
  return g
}

// ---------- a black utility sled with a grey gear bag ----------
export function makeSled() {
  const g = new THREE.Group()
  g.add(mesh(rbox(1.3, 0.3, 0.64, 0.06, 0, 0.15, 0), M.black))
  g.add(mesh(rbox(1.18, 0.1, 0.52, 0.03, 0, 0.3, 0), M.dark)) // the cavity read as a dark top
  g.add(mesh(rbox(0.6, 0.3, 0.38, 0.08, -0.15, 0.4, 0), new THREE.MeshStandardMaterial({ color: '#4b5158', roughness: 0.95 })))
  g.add(mesh(rbox(0.3, 0.2, 0.22, 0.03, 0.4, 0.36, 0.1), M.dark)) // battery box
  g.add(shadow(0.85, 0.5))
  return g
}

// ---------- the "drill here" ring ----------
export function makeAimRing() {
  const r = HOLE_DRAW_R
  const ring = mesh(new THREE.RingGeometry(r * 1.15, r * 1.45, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#028cdf', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }))
  const dot = mesh(new THREE.CircleGeometry(r * 0.9, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.28, depthWrite: false }))
  const g = new THREE.Group()
  g.add(ring, dot)
  g.position.y = 0.015
  g.visible = false
  g.userData = { ring: ring.material, dot: dot.material }
  return g
}

// ---------- a soft additive glow quad (camera-facing: IceCamp.jsx copies the camera's rotation) ----------
// the shelter window's halo (the cheapest stand-in for bloom) and the light at the beam's apex. uI scales it.
export function makeGlow(w, h, color, { core = 0, depthTest = true, order = 3 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uI: { value: 0 }, uColor: { value: new THREE.Color(color) }, uCore: { value: core } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `precision highp float; varying vec2 vUv; uniform float uI; uniform vec3 uColor; uniform float uCore;
      void main() {
        float r = clamp(length((vUv - 0.5) * 2.0), 0.0, 1.0);
        float a = pow(1.0 - r, 2.0) + uCore * exp(-r * r * 40.0);
        vec3 c = mix(uColor, vec3(1.0), uCore * exp(-r * r * 60.0));
        gl_FragColor = vec4(pow(c, vec3(1.0 / 2.2)), a * uI);
      }`,
  })
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  m.renderOrder = order; m.frustumCulled = false
  return m
}

// ---------- smoke from the stovepipe: a few soft world-size puffs rising and drifting with the wind ----------
// All motion is analytic in the vertex shader (age = (time + seed·life) mod life): no per-frame CPU work.
// The object sits at the pipe tip in world space with no rotation, so uWind is the world wind.
export function makeSmoke(count = 20, { life = 4, rise = 0.35, drift = 0.7 } = {}) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count)
  for (let i = 0; i < count; i++) seed[i] = i / count
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uWind: { value: new THREE.Vector2(1, 0) }, uViewH: { value: 800 }, uAlpha: { value: 1 }, uColor: { value: new THREE.Color('#8a8f99').lerp(new THREE.Color('#ffb060'), 0.1) } },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform vec2 uWind; uniform float uViewH; uniform float uAlpha; varying float vA;
      void main() {
        float a = mod(uTime + aSeed * ${life.toFixed(1)}, ${life.toFixed(1)}), f = a / ${life.toFixed(1)};
        float j = fract(sin(aSeed * 91.7) * 4375.85) - 0.5;
        vec3 p = position + vec3(uWind.x, 0.0, uWind.y) * ${drift.toFixed(2)} * a * (0.6 + 0.6 * f) + vec3(0.0, ${rise.toFixed(2)} * a, 0.0)
               + vec3(sin(a * 1.3 + j * 9.0), 0.0, cos(a * 1.1 + j * 7.0)) * 0.06 * a;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float size = mix(0.12, 0.4, f);
        gl_PointSize = clamp(size * projectionMatrix[1][1] * 0.5 * uViewH / -mv.z, 1.0, 64.0);
        vA = 0.1 * (1.0 - f) * smoothstep(0.0, 0.25, a) * uAlpha;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `precision mediump float; uniform vec3 uColor; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); float a = (1.0 - smoothstep(0.1, 0.5, d)) * vA; if (a < 0.003) discard; gl_FragColor = vec4(pow(uColor, vec3(1.0 / 2.2)), a); }`,
  })
  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false; pts.renderOrder = 4
  return pts
}

// ---------- option for Jason (?hero=phone|both): the visitor's phone clipped near the top of the pole ----------
// Display scale (like the Mini): a real phone is a 3 px dot from 30 m. Landscape, screen toward the camera side and
// tilted up, showing the Live Ice layout (dial left, fan right), plus a small cool light that lifts the rig out of black.
export function makeHeroPhone() {
  const g = new THREE.Group(); g.name = 'heroPhone'
  const W = 0.34, H = 0.18
  const c = document.createElement('canvas'); c.width = 256; c.height = 128
  const x = c.getContext('2d')
  x.fillStyle = '#05070a'; x.fillRect(0, 0, 256, 128)
  x.fillStyle = '#e8edf2'; x.beginPath(); x.arc(58, 64, 46, 0, Math.PI * 2); x.fill() // the dial
  x.fillStyle = '#b9c3cf'; x.beginPath(); x.arc(58, 64, 30, 0, Math.PI * 2); x.fill()
  x.strokeStyle = '#ff3b1f'; x.lineWidth = 9; x.beginPath(); x.arc(58, 64, 41, 2.3, 2.75); x.stroke()
  x.strokeStyle = '#ffd21f'; x.lineWidth = 9; x.beginPath(); x.arc(58, 64, 41, 2.75, 2.95); x.stroke()
  x.fillStyle = '#0a2cc8'; x.beginPath(); x.moveTo(184, 10); x.lineTo(250, 120); x.lineTo(118, 120); x.closePath(); x.fill() // the fan
  x.fillStyle = '#ff3b1f'; x.fillRect(132, 92, 104, 9); x.fillStyle = '#ffd21f'; x.fillRect(140, 95, 88, 3)
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  g.add(mesh(rbox(W, H, 0.022, 0.018, 0, 0, -0.012), M.black))
  const screen = mesh(new THREE.PlaneGeometry(W * 0.92, H * 0.86), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false }))
  screen.position.z = 0.0005
  g.add(screen)
  g.add(mesh(box(0.05, 0.06, 0.05, 0, -H / 2 - 0.02, -0.04), M.dark)) // the clamp on the pole
  const light = new THREE.PointLight('#8fd0ff', 2.2, 3, 2); light.position.set(0, 0.05, 0.35)
  g.add(light)
  return g
}

// ---------- option for Jason (?hero=angler|both): an angler sitting on the bucket ----------
// A dark, matte silhouette (no face, no cartoon detail) in a hooded parka, forearms on the knees, head turned to the
// screen. ~1.25× life like the kit, so the bucket fits him. Origin = the bucket's lid; faces +x.
export function makeAngler({ phoneInHands = false } = {}) {
  const g = new THREE.Group(); g.name = 'angler'
  const parka = new THREE.MeshStandardMaterial({ color: '#1d2126', roughness: 0.95, metalness: 0 })
  const pants = new THREE.MeshStandardMaterial({ color: '#16191d', roughness: 0.95, metalness: 0 })
  const S = 1.25
  const limb = (r, a, b, mat) => { // a capsule from point a to point b
    const d = new THREE.Vector3().subVectors(b, a), L = d.length()
    const m = mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, L - 0.0), 4, 10), mat)
    m.position.copy(a).add(b).multiplyScalar(0.5)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
    return m
  }
  const v = (x, y, z) => new THREE.Vector3(x * S, y * S, z * S)
  const hip = 0.05
  for (const s of [-1, 1]) {
    g.add(limb(0.075, v(0.02, hip + 0.04, s * 0.1), v(0.36, hip + 0.06, s * 0.12), pants)) // thigh
    g.add(limb(0.062, v(0.38, hip + 0.04, s * 0.12), v(0.42, -0.4, s * 0.13), pants)) // shin, down to the boot (the lid is 0.49 m up, pre-scale)
    g.add(mesh(rbox(0.24 * S, 0.11 * S, 0.12 * S, 0.04 * S, 0.47 * S, -0.437 * S, s * 0.13 * S), M.black)) // boot, its sole on the ice
  }
  const torso = mesh(new THREE.CapsuleGeometry(0.17 * S, 0.3 * S, 6, 14), parka) // the parka, leaning forward
  torso.position.copy(v(0.08, hip + 0.33, 0)); torso.rotation.z = -0.32; torso.scale.set(1, 1, 1.12)
  g.add(torso)
  const head = new THREE.Group(); head.position.copy(v(0.2, hip + 0.68, 0))
  const hood = mesh(new THREE.SphereGeometry(0.125 * S, 16, 12), parka); hood.scale.set(1.0, 1.08, 0.96)
  const ruff = mesh(new THREE.TorusGeometry(0.085 * S, 0.03 * S, 8, 16), new THREE.MeshStandardMaterial({ color: '#2c3036', roughness: 1 })) // the hood's opening, toward the screen
  ruff.rotation.y = Math.PI / 2; ruff.position.x = 0.1 * S
  head.add(hood, ruff); head.rotation.z = -0.35 // looking down at the screen
  g.add(head)
  const hand = phoneInHands ? v(0.42, hip + 0.3, 0.02) : null
  for (const s of [-1, 1]) {
    const sh = v(0.12, hip + 0.5, s * 0.19), el = v(0.3, hip + 0.22, s * 0.2)
    const hd = hand ? hand.clone().add(v(0, 0, s * 0.05)) : v(0.44, hip + 0.12, s * 0.14)
    g.add(limb(0.055, sh, el, parka), limb(0.05, el, hd, parka))
  }
  if (phoneInHands) { // a small lit screen between the hands
    const scr = mesh(new THREE.PlaneGeometry(0.1 * S, 0.06 * S), new THREE.MeshBasicMaterial({ color: '#bfe4ff', toneMapped: false, fog: false }))
    scr.position.copy(hand).add(v(0.02, 0.03, 0)); scr.rotation.set(0, -Math.PI / 2, 0); scr.rotateX(-0.6)
    g.add(scr)
  }
  const sh = shadow(0.55, 0.42, 0.35 * S, 0); sh.position.y = -0.41 * KIT_SCALE + 0.03 // on the ice, under the boots
  g.add(sh)
  return g
}
