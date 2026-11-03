// The ice camp, built in code like the boat (no downloaded models: nothing to license, nothing to load).
// Frame: x forward, y up (ice top = 0), z sideways. Real sizes except the Mini (MINI_SCALE, like the fish) and the
// hole kit, which is scaled a little so a bucket is not a 6 px dot from the camera.
//   makeHoleKit()  — what sits at the live hole: the PingLive Mini on its cable, a transducer arm, a bucket, an ice rod
//                    on its holder, and the auger (named children: the drill animation turns and lowers it)
//   makeShelter()  — a pop-up hub shelter with a lit door (the camp stays where the visitor started)
//   makeSled()     — a black utility sled by the shelter
//   makeAimRing()  — the "drill here" ring under the pointer
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

const M = {
  black: new THREE.MeshStandardMaterial({ color: '#15171a', roughness: 0.55, metalness: 0.2 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.7, metalness: 0.15 }),
  metal: new THREE.MeshStandardMaterial({ color: '#9aa2aa', roughness: 0.35, metalness: 0.6 }),
  blue: new THREE.MeshStandardMaterial({ color: '#028cdf', roughness: 0.5 }),
  white: new THREE.MeshStandardMaterial({ color: '#e6e9ec', roughness: 0.85 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#23272b', roughness: 0.95 }),
  trim: new THREE.MeshStandardMaterial({ color: '#8a2d28', roughness: 0.9 }),
  door: new THREE.MeshStandardMaterial({ color: '#2f343a', roughness: 0.9 }),
  window: new THREE.MeshStandardMaterial({ color: '#ffb15c', emissive: '#ffa64a', emissiveIntensity: 1.6, roughness: 1 }),
  cable: new THREE.MeshStandardMaterial({ color: '#0e0f11', roughness: 0.7 }),
  face: new THREE.MeshStandardMaterial({ color: '#dfe3e8', roughness: 0.6 }),
}
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
export const POLE_TOP = 1.25 * KIT_SCALE   // the handle's height above the ice
export function makePoleRig() {
  const k = KIT_SCALE
  const rig = new THREE.Group(); rig.name = 'rig'
  const headY = -(ICE_T + MINI_DROP) + MINI_H // the pole's foot: the head bracket; the Mini hangs MINI_H below it (its tip = the beam apex)
  // three-leg base: a sleeve hub over the hole, legs splayed to rubber feet
  const hubY = 0.42 * k
  const legs = []
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 3, fx = Math.cos(a) * 0.42 * k, fz = Math.sin(a) * 0.42 * k
    const len = Math.hypot(0.42 * k, hubY - 0.02 * k)
    const leg = new THREE.CylinderGeometry(0.011 * k, 0.013 * k, len, 8)
    const dir = new THREE.Vector3(fx, 0.02 * k - hubY, fz).normalize()
    leg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir))
    leg.translate(fx / 2, (hubY + 0.02 * k) / 2, fz / 2)
    legs.push(leg, new THREE.CylinderGeometry(0.03 * k, 0.035 * k, 0.03 * k, 10).translate(fx, 0.015 * k, fz))
  }
  rig.add(mesh(merge(legs), M.black))
  rig.add(mesh(merge([cyl(0.034 * k, 0.034 * k, 0.14 * k, 0, hubY, 0, 12), new THREE.TorusGeometry(0.04 * k, 0.012 * k, 8, 20).rotateX(Math.PI / 2).translate(0, hubY + 0.08 * k, 0)]), M.dark)) // the hub sleeve and the depth collar the pole rests on
  // the pole: from the head up through the hub to the handle
  const poleLen = POLE_TOP - headY
  rig.add(mesh(cyl(0.016 * k, 0.016 * k, poleLen, 0, headY + poleLen / 2, 0, 10), M.metal))
  // the handle: a bent cane at the top with a grip, a small arrow cap shows where the beam points
  const cane = new THREE.TorusGeometry(0.09 * k, 0.016 * k, 8, 16, Math.PI / 2).rotateY(Math.PI / 2).rotateZ(Math.PI).translate(0.09 * k, POLE_TOP, 0)
  rig.add(mesh(merge([cane, cyl(0.016 * k, 0.016 * k, 0.2 * k, 0.19 * k, POLE_TOP + 0.09 * k, 0, 8).rotateZ(Math.PI / 2).translate(0, 0, 0)]), M.metal))
  rig.add(mesh(cyl(0.022 * k, 0.022 * k, 0.12 * k, 0, 0, 0, 10).rotateZ(Math.PI / 2).translate(0.24 * k, POLE_TOP + 0.09 * k, 0), M.blue)) // the grip, brand blue
  rig.add(mesh(new THREE.ConeGeometry(0.03 * k, 0.05 * k, 3).rotateZ(-Math.PI / 2).translate(0.05 * k, POLE_TOP + 0.01 * k, 0), M.face)) // the arrow: forward = +x
  // the head: a bracket at the foot of the pole; the Mini hangs from it and pivots with the view (IceCamp.jsx)
  const head = new THREE.Group(); head.name = 'head'; head.position.set(0, headY, 0)
  head.add(mesh(merge([rbox(0.06 * k, 0.07 * k, 0.04 * k, 0.008 * k, 0, 0.01 * k, 0), box(0.05 * k, 0.012 * k, 0.03 * k, 0.03 * k, -0.02 * k, 0)]), M.black))
  const mini = makeMini(); mini.name = 'mini'
  mini.rotation.y = Math.PI / 2 // the face toward +x: Forward
  mini.position.set(0.02 * k, -MINI_H, 0)
  head.add(mini)
  rig.add(head)
  // the cable: up the pole, over the handle, down in a sag to the router bag on the ice
  const up = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02 * k, headY + 0.02 * k, 0.025 * k), new THREE.Vector3(0.02 * k, hubY, 0.028 * k), new THREE.Vector3(0.02 * k, POLE_TOP - 0.05 * k, 0.03 * k), new THREE.Vector3(0.14 * k, POLE_TOP - 0.2 * k, 0.12 * k), new THREE.Vector3(0.36 * k, 0.35 * k, 0.32 * k), new THREE.Vector3(0.48 * k, 0.14 * k, 0.46 * k)])
  rig.add(mesh(new THREE.TubeGeometry(up, 40, 0.006 * k, 6, false), M.cable))
  rig.add(mesh(rbox(0.3 * k, 0.17 * k, 0.2 * k, 0.03 * k, 0.5 * k, 0.085 * k, 0.5 * k), new THREE.MeshStandardMaterial({ color: '#2b2f34', roughness: 0.95 }))) // the router + battery bag
  rig.add(shadow(0.55 * k, 0.55 * k), shadow(0.22 * k, 0.17 * k, 0.5 * k, 0.5 * k))
  return rig
}

// ---------- what sits at the live hole ----------
export function makeHoleKit() {
  const k = KIT_SCALE
  const g = new THREE.Group()
  // the sonar pole (Jason 2026-10-16: 声呐pole … 固定在杆子下方的头上): like the ice pole mounts sold for live sonar
  // (Garmin's Panoptix ice pole mount, Patriot IceFix 360, Accuphy's own 0° mount), the Mini is clamped to a head at the
  // bottom of a rigid pole; the pole stands in a three-leg base over the hole and turns by a handle at the top; the
  // cable runs up the pole and down to the router bag on the ice. The whole rig lifts out when the visitor hole-hops.
  g.add(makePoleRig())
  // the bucket (the classic seat), behind and to the side of the hole
  const bx = -0.55 * k, bz = 0.42 * k
  const bucket = merge([cyl(0.15 * k, 0.13 * k, 0.38 * k, bx, 0.19 * k, bz, 14), cyl(0.155 * k, 0.155 * k, 0.025 * k, bx, 0.385 * k, bz, 14)])
  g.add(mesh(bucket, M.white))
  g.add(mesh(cyl(0.12 * k, 0.12 * k, 0.012 * k, bx, 0.4 * k, bz, 14), M.black))
  g.add(shadow(0.2 * k, 0.2 * k, bx, bz))
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
  // the line from the rod tip straight down the hole to the jig (IceCamp stretches it every frame): a 1-px line so it
  // reads at the section camera's 30 m, where a real 0.2 mm line (or a 2 mm cylinder) is far below a pixel
  const tip = new THREE.Vector3(0.06 * k, 0.16 * k + 0.68 * k * Math.sin(THREE.MathUtils.degToRad(22)), -0.03 * k)
  const lineGeo = new THREE.BufferGeometry().setFromPoints([tip.clone(), tip.clone().setY(-2)])
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: '#dfe8ef', transparent: true, opacity: 0.55, depthWrite: false }))
  line.name = 'fishline'; line.userData.tip = tip; line.frustumCulled = false
  g.add(line)
  // the jig: a small gold spoon (drawn ~4× life size so it reads at 30 m, like the hole) that flashes when it is lifted
  const jig = new THREE.Group(); jig.name = 'jig'
  const spoonMat = new THREE.MeshStandardMaterial({ color: '#d9b25a', metalness: 0.85, roughness: 0.28, emissive: '#ffd27a', emissiveIntensity: 0.25 })
  const spoon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8).scale(0.45, 1, 0.22), spoonMat)
  spoon.position.y = -0.09
  jig.add(spoon, new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), M.black)) // the split ring / knot at the top
  jig.position.set(tip.x, -2, tip.z)
  jig.userData.mat = spoonMat
  g.add(jig)
  // the auger, standing in the snow on the other side (named: the drill animation moves it)
  const auger = makeAuger()
  auger.position.set(0.1 * k, 0, 0.85 * k)
  auger.rotation.z = THREE.MathUtils.degToRad(-6)
  auger.name = 'auger'
  g.add(auger)
  return g
}

// a power auger: flighting on a shaft, a powerhead with two handles and brand-blue grips; origin at the blade tip
export function makeAuger() {
  const k = KIT_SCALE
  const g = new THREE.Group()
  const shaftH = 1.05 * k
  const parts = [cyl(0.016 * k, 0.016 * k, shaftH, 0, shaftH / 2 + 0.04 * k, 0, 8), new THREE.ConeGeometry(0.1 * k, 0.1 * k, 12).rotateX(Math.PI).translate(0, 0.05 * k, 0)]
  for (let i = 0; i < 6; i++) { // flighting: tilted discs read as a screw from the camera
    const d = new THREE.CylinderGeometry(0.1 * k, 0.1 * k, 0.012 * k, 14).rotateX(0.32).rotateY(i * 1.1).translate(0, 0.12 * k + i * 0.11 * k, 0)
    parts.push(d)
  }
  g.add(mesh(merge(parts), M.metal))
  const headY = shaftH + 0.08 * k
  const head = merge([rbox(0.3 * k, 0.2 * k, 0.2 * k, 0.03 * k, 0, headY + 0.1 * k, 0), box(0.7 * k, 0.025 * k, 0.025 * k, 0, headY + 0.12 * k, 0.16 * k)])
  g.add(mesh(head, M.black))
  const grips = merge([cyl(0.018 * k, 0.018 * k, 0.12 * k, 0, headY + 0.12 * k, 0.16 * k, 8).rotateZ(Math.PI / 2).translate(0.3 * k, 0, 0), cyl(0.018 * k, 0.018 * k, 0.12 * k, 0, headY + 0.12 * k, 0.16 * k, 8).rotateZ(Math.PI / 2).translate(-0.3 * k, 0, 0)])
  g.add(mesh(grips, M.blue))
  g.add(shadow(0.16 * k, 0.16 * k))
  g.userData.shaftH = shaftH
  return g
}

// ---------- the pop-up hub shelter (a six-sided tent with a pyramid roof), door facing −x ----------
export function makeShelter() {
  const g = new THREE.Group()
  const R = 1.15, H = 1.45
  const wall = new THREE.CylinderGeometry(R * 0.9, R, H, 6, 1, true).translate(0, H / 2, 0)
  const roof = new THREE.ConeGeometry(R * 0.92, 0.75, 6).translate(0, H + 0.37, 0)
  const floorSkirt = new THREE.CylinderGeometry(R * 1.02, R * 1.06, 0.1, 6).translate(0, 0.05, 0)
  g.add(mesh(merge([wall, roof, floorSkirt]), M.fabric))
  g.add(mesh(new THREE.CylinderGeometry(R * 0.905, R * 0.935, 0.14, 6, 1, true).translate(0, H - 0.3, 0), M.trim)) // the red band
  // door on the −x face: a six-segment cylinder has a flat face centred on −x already (its vertices start on +z)
  const face = new THREE.Group()
  const apo = R * 0.95 * Math.cos(Math.PI / 6) // the face's distance from the centre (the wall leans in a little)
  const door = mesh(new THREE.PlaneGeometry(0.72, 1.2).translate(0, 0.62, 0), M.door)
  door.rotation.y = -Math.PI / 2; door.position.set(-apo - 0.012, 0, 0)
  const win = mesh(new THREE.PlaneGeometry(0.42, 0.3).translate(0, 0.98, 0), M.window)
  win.rotation.y = -Math.PI / 2; win.position.set(-apo - 0.02, 0, 0)
  face.add(door, win)
  g.add(face)
  // stovepipe out of the roof
  g.add(mesh(merge([cyl(0.045, 0.045, 0.6, 0.35, H + 0.5, 0.25, 8), cyl(0.07, 0.07, 0.06, 0.35, H + 0.82, 0.25, 8)]), M.black))
  g.add(shadow(1.5, 1.5))
  g.userData = { lampLocal: new THREE.Vector3(-apo - 0.25, 1.0, 0) } // where the lamp light comes from (world after the group transform)
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
  return g
}
