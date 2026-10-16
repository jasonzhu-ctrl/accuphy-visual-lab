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

// ---------- what sits at the live hole ----------
export function makeHoleKit() {
  const k = KIT_SCALE
  const g = new THREE.Group()
  // the Mini, hanging in the hole; its cable runs up through the hole to the arm
  const mini = makeMini()
  mini.position.set(0, -(ICE_T + MINI_DROP), 0)
  mini.name = 'mini'
  g.add(mini)
  const cableLen = ICE_T + MINI_DROP - MINI_H + CABLE_TOP_Y
  const cable = mesh(new THREE.CylinderGeometry(0.007 * k, 0.007 * k, 1, 6).translate(0, 0.5, 0), M.cable) // unit length, scaled in y
  cable.position.set(-0.125 * MINI_SCALE * 0.32, -(ICE_T + MINI_DROP) + MINI_H, 0)
  cable.scale.y = cableLen
  cable.name = 'cable'
  g.add(cable)
  // transducer arm: a short post beside the hole with a horizontal arm over it
  const ax = -(HOLE_DRAW_R + 0.1 * k)
  const arm = merge([cyl(0.014 * k, 0.016 * k, CABLE_TOP_Y, ax, CABLE_TOP_Y / 2, 0, 8), box(-ax + 0.03 * k, 0.02 * k, 0.03 * k, ax / 2 - 0.02 * k, CABLE_TOP_Y, 0), box(0.12 * k, 0.015 * k, 0.12 * k, ax, 0.008 * k, 0)])
  g.add(mesh(arm, M.black))
  // the bucket (the classic seat), behind and to the side of the hole
  const bx = -0.55 * k, bz = 0.42 * k
  const bucket = merge([cyl(0.15 * k, 0.13 * k, 0.38 * k, bx, 0.19 * k, bz, 14), cyl(0.155 * k, 0.155 * k, 0.025 * k, bx, 0.385 * k, bz, 14)])
  g.add(mesh(bucket, M.white))
  g.add(mesh(cyl(0.12 * k, 0.12 * k, 0.012 * k, bx, 0.4 * k, bz, 14), M.black))
  // the ice rod on its holder, tip over the hole, line down the hole
  const rx = 0.38 * k, rz = -0.3 * k
  const holder = merge([box(0.1 * k, 0.02 * k, 0.14 * k, rx, 0.01 * k, rz), cyl(0.01 * k, 0.012 * k, 0.16 * k, rx, 0.09 * k, rz, 6)])
  g.add(mesh(holder, M.black))
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
