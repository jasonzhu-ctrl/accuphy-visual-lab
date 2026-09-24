// A 20 ft+ Ranger-style bass boat (Jason 2026-09-24) with a Mercury V8 Pro XS
// style outboard. Low-poly but in proportion: 6.3 m long, 2.4 m beam.
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
const merge = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))

function hullOutline(L, W) {
  const s = new THREE.Shape()
  const h = W / 2
  s.moveTo(L / 2, 0)
  s.quadraticCurveTo(L * 0.42, h * 0.75, L * 0.18, h)
  s.lineTo(-L * 0.46, h); s.quadraticCurveTo(-L / 2, h, -L / 2, h * 0.85)
  s.lineTo(-L / 2, -h * 0.85); s.quadraticCurveTo(-L / 2, -h, -L * 0.46, -h)
  s.lineTo(L * 0.18, -h); s.quadraticCurveTo(L * 0.42, -h * 0.75, L / 2, 0)
  return s
}

export function makeRangerBoat() {
  const L = 6.3, W = 2.4
  const group = new THREE.Group()
  const hullMat = new THREE.MeshStandardMaterial({ color: '#16233d', metalness: 0.55, roughness: 0.35 })
  const deckMat = new THREE.MeshStandardMaterial({ color: '#8d9198', roughness: 0.95 })
  const blackMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5, metalness: 0.3 })
  const trimMat = new THREE.MeshStandardMaterial({ color: '#c9ced6', metalness: 0.7, roughness: 0.3 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#9fc7d8', transparent: true, opacity: 0.45, roughness: 0.1 })

  // hull: extruded outline, slight V by scaling the bottom in
  const hull = new THREE.ExtrudeGeometry(hullOutline(L, W), { depth: 0.55, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 2 })
  hull.rotateX(-Math.PI / 2); hull.translate(0, -0.42, 0)
  group.add(new THREE.Mesh(hull, hullMat))
  // gunwale trim line
  const trim = new THREE.ExtrudeGeometry(hullOutline(L * 1.005, W * 1.02), { depth: 0.05, bevelEnabled: false })
  trim.rotateX(-Math.PI / 2); trim.translate(0, 0.13, 0)
  group.add(new THREE.Mesh(trim, trimMat))
  // decks: raised bow casting deck, cockpit floor, rear deck (carpet)
  const bow = new THREE.ExtrudeGeometry(hullOutline(L * 0.98, W * 0.96), { depth: 0.06, bevelEnabled: false })
  bow.rotateX(-Math.PI / 2); bow.translate(0, 0.12, 0)
  group.add(new THREE.Mesh(bow, deckMat))
  const cockpit = new THREE.BoxGeometry(1.7, 0.3, W * 0.8); cockpit.translate(-0.5, 0.0, 0)
  group.add(new THREE.Mesh(cockpit, deckMat))
  // console + windshield (driver on starboard)
  const console_ = new THREE.BoxGeometry(0.55, 0.5, 0.7); console_.translate(-0.4, 0.4, -0.5)
  group.add(new THREE.Mesh(console_, hullMat))
  const shield = new THREE.BoxGeometry(0.05, 0.35, 0.75); shield.translate(-0.12, 0.8, -0.5)
  group.add(new THREE.Mesh(shield, glassMat))
  // seats: two pedestal seats in the cockpit, one on the bow deck
  const seat = () => merge([new THREE.CylinderGeometry(0.04, 0.05, 0.35, 6).translate(0, 0.3, 0), new THREE.BoxGeometry(0.45, 0.12, 0.45).translate(0, 0.52, 0), new THREE.BoxGeometry(0.42, 0.4, 0.1).translate(-0.18, 0.75, 0)])
  for (const [x, z] of [[-0.9, -0.5], [-0.9, 0.5], [1.5, 0]]) { const m = new THREE.Mesh(seat(), blackMat); m.position.set(x, 0.1, z); group.add(m) }
  // outboard: Mercury 250 Pro XS (V8) proportions — tall boxy cowl with soft
  // edges, top sloping forward, chined lower cowl, "hood" intake at the front,
  // black with graphite side panels and a white/red Pro XS band (Jason 2026-09-24)
  const cx = -L / 2 - 0.40
  const cowlMat = new THREE.MeshStandardMaterial({ color: '#141518', metalness: 0.4, roughness: 0.38 })
  const panelMat = new THREE.MeshStandardMaterial({ color: '#2b2e33', metalness: 0.5, roughness: 0.35 })
  const top = new RoundedBoxGeometry(0.66, 0.5, 0.56, 3, 0.09); top.rotateZ(-0.16); top.translate(cx, 0.86, 0)
  const main = new RoundedBoxGeometry(0.7, 0.52, 0.6, 3, 0.07); main.translate(cx, 0.46, 0)
  const hood = new RoundedBoxGeometry(0.16, 0.34, 0.4, 2, 0.06); hood.translate(cx + 0.38, 0.9, 0)
  const lowerCowl = new RoundedBoxGeometry(0.74, 0.22, 0.64, 2, 0.05); lowerCowl.translate(cx, 0.12, 0)
  group.add(new THREE.Mesh(merge([top, main, hood, lowerCowl]), cowlMat))
  const sideL = new THREE.BoxGeometry(0.5, 0.36, 0.02); sideL.translate(cx - 0.02, 0.5, 0.31)
  const sideR = sideL.clone(); sideR.translate(0, 0, -0.62)
  group.add(new THREE.Mesh(merge([sideL, sideR]), panelMat))
  const decal = (z) => merge([new THREE.BoxGeometry(0.34, 0.09, 0.012).translate(cx - 0.04, 0.5, z), new THREE.BoxGeometry(0.34, 0.02, 0.012).translate(cx - 0.04, 0.58, z)])
  group.add(new THREE.Mesh(decal(0.325), new THREE.MeshStandardMaterial({ color: '#f4f4f4' })))
  group.add(new THREE.Mesh(decal(-0.325), new THREE.MeshStandardMaterial({ color: '#f4f4f4' })))
  const red = merge([new THREE.BoxGeometry(0.36, 0.012, 0.014).translate(cx - 0.04, 0.62, 0.325), new THREE.BoxGeometry(0.36, 0.012, 0.014).translate(cx - 0.04, 0.62, -0.325)])
  group.add(new THREE.Mesh(red, new THREE.MeshStandardMaterial({ color: '#c8102e' })))
  const mid = new THREE.BoxGeometry(0.22, 0.5, 0.2); mid.translate(cx, -0.22, 0)
  const torpedo = new THREE.CylinderGeometry(0.09, 0.07, 0.62, 10); torpedo.rotateZ(Math.PI / 2); torpedo.translate(cx + 0.02, -0.58, 0)
  const gear = new THREE.BoxGeometry(0.2, 0.32, 0.12); gear.translate(cx + 0.1, -0.4, 0)
  const skeg = new THREE.BoxGeometry(0.2, 0.26, 0.035); skeg.translate(cx + 0.16, -0.82, 0)
  const prop = new THREE.TorusGeometry(0.17, 0.035, 5, 8); prop.rotateY(Math.PI / 2); prop.translate(cx - 0.33, -0.58, 0)
  const bracket = new THREE.BoxGeometry(0.18, 0.5, 0.4); bracket.translate(-L / 2 - 0.07, 0.02, 0)
  group.add(new THREE.Mesh(merge([mid, torpedo, gear, skeg, prop, bracket]), blackMat))
  // trolling motor at the bow with the PingLive on its shaft, head just under the surface
  const tmShaft = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6); tmShaft.translate(L / 2 - 0.25, -0.45, 0.35)
  const tmHead = new THREE.BoxGeometry(0.35, 0.2, 0.2); tmHead.translate(L / 2 - 0.25, 0.32, 0.35)
  const tmLower = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8); tmLower.rotateZ(Math.PI / 2); tmLower.translate(L / 2 - 0.25, -1.15, 0.35)
  group.add(new THREE.Mesh(merge([tmShaft, tmHead, tmLower]), blackMat))
  return group
}

// Where the transducer sits relative to the boat origin (bow, on the trolling-motor shaft)
export const TRANSDUCER_OFFSET = new THREE.Vector3(6.3 / 2 - 0.25, -0.75, 0.35)
