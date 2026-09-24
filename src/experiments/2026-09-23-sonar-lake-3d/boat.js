// Ranger Z521R-style bass boat (Jason 2026-09-24: "参考网上 Ranger 20 尺以上近几年的款式").
// Real specs: 21' 9" (6.63 m) × 96" (2.44 m) beam. Charcoal metal-flake hull with
// a red waterline stripe, grey carpet decks, wraparound windshield, bow trolling
// motor (transducer on its shaft), Power-Pole anchors, jack plate + Mercury 250 Pro XS.
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
const merge = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))

const L = 6.63, W = 2.44
function outline(l, w) {
  const s = new THREE.Shape(), h = w / 2
  s.moveTo(l / 2, 0)
  s.quadraticCurveTo(l * 0.44, h * 0.7, l * 0.2, h * 0.98); s.lineTo(-l * 0.44, h)
  s.quadraticCurveTo(-l / 2, h, -l / 2, h * 0.86); s.lineTo(-l / 2, -h * 0.86); s.quadraticCurveTo(-l / 2, -h, -l * 0.44, -h)
  s.lineTo(l * 0.2, -h * 0.98); s.quadraticCurveTo(l * 0.44, -h * 0.7, l / 2, 0)
  return s
}
const extrude = (l, w, depth, y, bevel = 0) => {
  const g = new THREE.ExtrudeGeometry(outline(l, w), { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 })
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return g
}

export function makeRangerBoat() {
  const g = new THREE.Group()
  const hullMat = new THREE.MeshStandardMaterial({ color: '#1c1f24', metalness: 0.75, roughness: 0.28 }) // charcoal metal flake
  const stripeMat = new THREE.MeshStandardMaterial({ color: '#c8102e', metalness: 0.4, roughness: 0.35 })
  const silverMat = new THREE.MeshStandardMaterial({ color: '#cfd4da', metalness: 0.85, roughness: 0.25 })
  const carpetMat = new THREE.MeshStandardMaterial({ color: '#6f7479', roughness: 1 })
  const blackMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.55, metalness: 0.3 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#a9cfe0', transparent: true, opacity: 0.4, roughness: 0.05, metalness: 0.1 })
  const white = new THREE.MeshStandardMaterial({ color: '#f2f2f2' })

  // hull with a slight V (lower section narrower), sheer rising toward the bow
  g.add(new THREE.Mesh(extrude(L, W, 0.62, -0.5, 0.06), hullMat))
  g.add(new THREE.Mesh(extrude(L * 0.96, W * 0.78, 0.25, -0.72), hullMat))          // keel section
  g.add(new THREE.Mesh(extrude(L * 1.004, W * 1.03, 0.05, -0.2), stripeMat))          // red waterline stripe
  g.add(new THREE.Mesh(extrude(L * 1.006, W * 1.04, 0.06, 0.12), silverMat))          // rub rail
  // decks: bow casting deck (raised), cockpit, rear deck
  g.add(new THREE.Mesh(extrude(L * 0.98, W * 0.95, 0.05, 0.15), carpetMat))
  const bowDeck = new RoundedBoxGeometry(2.3, 0.14, W * 0.86, 2, 0.04); bowDeck.translate(L * 0.3, 0.24, 0); g.add(new THREE.Mesh(bowDeck, carpetMat))
  const rearDeck = new RoundedBoxGeometry(1.7, 0.14, W * 0.88, 2, 0.04); rearDeck.translate(-L * 0.33, 0.24, 0); g.add(new THREE.Mesh(rearDeck, carpetMat))
  for (const z of [-0.55, 0.55]) { const lid = new THREE.BoxGeometry(1.2, 0.02, 0.8); lid.translate(-L * 0.33, 0.32, z); g.add(new THREE.Mesh(lid, blackMat)) }
  const cockpit = new THREE.BoxGeometry(1.9, 0.02, W * 0.7); cockpit.translate(-0.25, 0.16, 0); g.add(new THREE.Mesh(cockpit, carpetMat))
  // consoles + wraparound windshield (driver starboard, passenger port)
  const cons = new RoundedBoxGeometry(0.6, 0.55, 0.75, 2, 0.06); cons.translate(0.05, 0.45, -0.55); g.add(new THREE.Mesh(cons, hullMat))
  const cons2 = new RoundedBoxGeometry(0.45, 0.4, 0.6, 2, 0.06); cons2.translate(0.05, 0.38, 0.6); g.add(new THREE.Mesh(cons2, hullMat))
  const shield = new THREE.CylinderGeometry(0.95, 0.95, 0.36, 18, 1, true, -0.55, 1.1); shield.translate(-0.35, 0.86, -0.55); g.add(new THREE.Mesh(shield, glassMat))
  const shield2 = new THREE.CylinderGeometry(0.75, 0.75, 0.28, 14, 1, true, -0.5, 1.0); shield2.translate(-0.25, 0.7, 0.6); g.add(new THREE.Mesh(shield2, glassMat))
  // seats: driver + passenger buckets, bow and rear pedestal seats
  const seat = (bucket) => merge([new THREE.CylinderGeometry(0.04, 0.05, 0.3, 6).translate(0, 0.3, 0), new RoundedBoxGeometry(0.5, 0.12, 0.5, 2, 0.04).translate(0, 0.5, 0), new RoundedBoxGeometry(0.16, bucket ? 0.55 : 0.42, 0.5, 2, 0.04).translate(-0.2, bucket ? 0.82 : 0.75, 0)])
  for (const [x, z, b] of [[-0.55, -0.55, true], [-0.55, 0.6, true], [1.75, 0.15, false], [-2.5, 0, false]]) { const m = new THREE.Mesh(seat(b), blackMat); m.position.set(x, 0.14, z); g.add(m) }
  // graphics: "RANGER" decal strip on both sides
  for (const z of [W / 2 + 0.02, -W / 2 - 0.02]) { const d = new THREE.BoxGeometry(1.6, 0.14, 0.01); d.translate(0.3, -0.05, z); g.add(new THREE.Mesh(d, white)) }
  // Power-Poles at the stern corners
  for (const z of [W / 2 - 0.15, -W / 2 + 0.15]) { const pp = merge([new THREE.BoxGeometry(0.12, 1.3, 0.08).translate(-L / 2 - 0.1, 0.55, z), new THREE.BoxGeometry(0.4, 0.06, 0.08).translate(-L / 2 - 0.22, 1.2, z)]); g.add(new THREE.Mesh(pp, blackMat)) }
  // jack plate + Mercury 250 Pro XS
  const cx = -L / 2 - 0.5
  const plate = new THREE.BoxGeometry(0.28, 0.5, 0.42); plate.translate(-L / 2 - 0.12, 0.02, 0); g.add(new THREE.Mesh(plate, silverMat))
  const cowlMat = new THREE.MeshStandardMaterial({ color: '#141518', metalness: 0.4, roughness: 0.38 })
  const panelMat = new THREE.MeshStandardMaterial({ color: '#2b2e33', metalness: 0.5, roughness: 0.35 })
  const top = new RoundedBoxGeometry(0.66, 0.5, 0.56, 3, 0.09); top.rotateZ(-0.16); top.translate(cx, 0.86, 0)
  const main = new RoundedBoxGeometry(0.7, 0.52, 0.6, 3, 0.07); main.translate(cx, 0.46, 0)
  const hood = new RoundedBoxGeometry(0.16, 0.34, 0.4, 2, 0.06); hood.translate(cx + 0.38, 0.9, 0)
  const lowerCowl = new RoundedBoxGeometry(0.74, 0.22, 0.64, 2, 0.05); lowerCowl.translate(cx, 0.12, 0)
  g.add(new THREE.Mesh(merge([top, main, hood, lowerCowl]), cowlMat))
  const sideL = new THREE.BoxGeometry(0.5, 0.36, 0.02); sideL.translate(cx - 0.02, 0.5, 0.31); const sideR = sideL.clone(); sideR.translate(0, 0, -0.62)
  g.add(new THREE.Mesh(merge([sideL, sideR]), panelMat))
  const decal = (z) => merge([new THREE.BoxGeometry(0.34, 0.09, 0.012).translate(cx - 0.04, 0.5, z), new THREE.BoxGeometry(0.34, 0.02, 0.012).translate(cx - 0.04, 0.58, z)])
  g.add(new THREE.Mesh(merge([decal(0.325), decal(-0.325)]), white))
  const red = merge([new THREE.BoxGeometry(0.36, 0.012, 0.014).translate(cx - 0.04, 0.62, 0.325), new THREE.BoxGeometry(0.36, 0.012, 0.014).translate(cx - 0.04, 0.62, -0.325)])
  g.add(new THREE.Mesh(red, stripeMat))
  const mid = new THREE.BoxGeometry(0.22, 0.5, 0.2); mid.translate(cx, -0.22, 0)
  const torpedo = new THREE.CylinderGeometry(0.09, 0.07, 0.62, 10); torpedo.rotateZ(Math.PI / 2); torpedo.translate(cx + 0.02, -0.58, 0)
  const gear = new THREE.BoxGeometry(0.2, 0.32, 0.12); gear.translate(cx + 0.1, -0.4, 0)
  const skeg = new THREE.BoxGeometry(0.2, 0.26, 0.035); skeg.translate(cx + 0.16, -0.82, 0)
  const prop = new THREE.TorusGeometry(0.17, 0.035, 5, 8); prop.rotateY(Math.PI / 2); prop.translate(cx - 0.33, -0.58, 0)
  g.add(new THREE.Mesh(merge([mid, torpedo, gear, skeg, prop]), blackMat))
  // bow trolling motor (Minn Kota-style) with the PingLive on the shaft, head just under the surface
  const tx = L / 2 - 0.35, tz = 0.35
  const tmShaft = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6); tmShaft.translate(tx, -0.5, tz)
  const tmHead = new RoundedBoxGeometry(0.42, 0.2, 0.22, 2, 0.05); tmHead.translate(tx - 0.05, 0.34, tz)
  const tmMount = new THREE.BoxGeometry(0.7, 0.08, 0.3); tmMount.translate(tx - 0.2, 0.3, tz)
  const tmLower = new THREE.CylinderGeometry(0.06, 0.08, 0.42, 8); tmLower.rotateZ(Math.PI / 2); tmLower.translate(tx, -1.2, tz)
  const pl = new THREE.BoxGeometry(0.16, 0.12, 0.2); pl.translate(tx + 0.02, -0.95, tz + 0.12) // the PingLive puck
  g.add(new THREE.Mesh(merge([tmShaft, tmHead, tmMount, tmLower]), blackMat))
  g.add(new THREE.Mesh(pl, new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.4 })))
  return g
}
export const TRANSDUCER_OFFSET = new THREE.Vector3(L / 2 - 0.33, -0.95, 0.47)
