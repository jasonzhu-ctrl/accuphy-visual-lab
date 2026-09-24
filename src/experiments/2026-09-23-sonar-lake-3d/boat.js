// A 20 ft+ Ranger-style bass boat (Jason 2026-09-24) with a Mercury V8 Pro XS
// style outboard. Low-poly but in proportion: 6.3 m long, 2.4 m beam.
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
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
  // outboard: current-generation Mercury V8 Pro XS look — tall rounded cowl,
  // sculpted top, side vents, black lower cowl, white/red Pro XS band (Jason 2026-09-24)
  const cx = -L / 2 - 0.38
  const cowlMat = new THREE.MeshStandardMaterial({ color: '#1f2226', metalness: 0.35, roughness: 0.4 })
  const upper = new THREE.CapsuleGeometry(0.27, 0.42, 4, 10); upper.scale(1.15, 1, 0.95); upper.translate(cx, 0.72, 0)
  const lowerCowl = new THREE.CylinderGeometry(0.3, 0.26, 0.32, 12); lowerCowl.scale(1.2, 1, 1); lowerCowl.translate(cx, 0.28, 0)
  const vents = merge([0, 1, 2].map((i) => new THREE.BoxGeometry(0.05, 0.02, 0.34).translate(cx + 0.31, 0.78 + i * 0.06, 0)))
  group.add(new THREE.Mesh(merge([upper, lowerCowl]), cowlMat))
  group.add(new THREE.Mesh(vents, blackMat))
  const band = new THREE.CylinderGeometry(0.315, 0.315, 0.07, 12); band.scale(1.2, 1, 1); band.translate(cx, 0.48, 0)
  group.add(new THREE.Mesh(band, new THREE.MeshStandardMaterial({ color: '#f2f2f2' })))
  const accent = new THREE.CylinderGeometry(0.317, 0.317, 0.025, 12); accent.scale(1.2, 1, 1); accent.translate(cx, 0.43, 0)
  group.add(new THREE.Mesh(accent, new THREE.MeshStandardMaterial({ color: '#c8102e' })))
  const mid = new THREE.BoxGeometry(0.2, 0.55, 0.18); mid.translate(cx, -0.15, 0)
  const lower = new THREE.BoxGeometry(0.5, 0.3, 0.13); lower.translate(cx + 0.06, -0.55, 0)
  const skeg = new THREE.BoxGeometry(0.22, 0.24, 0.04); skeg.translate(cx + 0.14, -0.8, 0)
  const prop = new THREE.TorusGeometry(0.16, 0.035, 5, 8); prop.rotateY(Math.PI / 2); prop.translate(cx - 0.24, -0.55, 0)
  const bracket = new THREE.BoxGeometry(0.16, 0.5, 0.36); bracket.translate(-L / 2 - 0.06, 0.05, 0)
  group.add(new THREE.Mesh(merge([mid, lower, skeg, prop, bracket]), blackMat))
  // trolling motor at the bow with the PingLive on its shaft, head just under the surface
  const tmShaft = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6); tmShaft.translate(L / 2 - 0.25, -0.45, 0.35)
  const tmHead = new THREE.BoxGeometry(0.35, 0.2, 0.2); tmHead.translate(L / 2 - 0.25, 0.32, 0.35)
  const tmLower = new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8); tmLower.rotateZ(Math.PI / 2); tmLower.translate(L / 2 - 0.25, -1.15, 0.35)
  group.add(new THREE.Mesh(merge([tmShaft, tmHead, tmLower]), blackMat))
  return group
}

// Where the transducer sits relative to the boat origin (bow, on the trolling-motor shaft)
export const TRANSDUCER_OFFSET = new THREE.Vector3(6.3 / 2 - 0.25, -0.75, 0.35)
