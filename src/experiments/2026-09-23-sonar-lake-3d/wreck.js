// A ~40 m steel cargo ship wreck (Jason 2026-09-24: 把大的做的再大一倍, 船舷和表面结构复杂一点 — so the
// sonar shows off: hatches, coamings, bulwarks with freeing ports, railings, masts with derricks, a deck
// crane, a stern superstructure with funnel, lifeboat davits, vents, bollards, windlass, rudder and prop).
// Local frame: x = along the ship (bow at +x), y = up from the keel, z = across (port at +z).
// Returns one merged, non-indexed geometry with vertex colours (rust / deck / paint variation).
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'

const merge = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))

export const WRECK_L = 40, WRECK_B = 9

// deterministic pseudo-random so the wreck is the same every load
let seed = 4242
const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280

// colour helpers: each part gets a base colour with per-vertex rust variation
function paint(g, [r, gg, b], rust = 0.25) {
  const n = g.attributes.position.count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const k = 0.85 + rand() * 0.3, rr = rand() < rust ? 1 : 0
    col[i * 3] = (r + rr * 0.08) * k; col[i * 3 + 1] = (gg - rr * 0.03) * k; col[i * 3 + 2] = (b - rr * 0.05) * k
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}
const HULL = [0.3, 0.2, 0.15], DECK = [0.34, 0.31, 0.27], HOUSE = [0.42, 0.4, 0.36], DARK = [0.2, 0.18, 0.16]

function box(parts, sx, sy, sz, x, y, z, col = DECK, rot) {
  const g = new THREE.BoxGeometry(sx, sy, sz)
  if (rot) g.rotateX(rot[0] || 0).rotateY(rot[1] || 0).rotateZ(rot[2] || 0)
  g.translate(x, y, z)
  parts.push(paint(g, col))
}
function cyl(parts, r0, r1, h, x, y, z, col = DECK, rot, seg = 10) {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg)
  if (rot) g.rotateX(rot[0] || 0).rotateY(rot[1] || 0).rotateZ(rot[2] || 0)
  g.translate(x, y, z)
  parts.push(paint(g, col))
}
// a cylinder between two points
function rod(parts, a, b, r, col = DECK, seg = 6) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b)
  const len = va.distanceTo(vb)
  const g = new THREE.CylinderGeometry(r, r, len, seg)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize())
  g.applyQuaternion(q)
  g.translate((va.x + vb.x) / 2, (va.y + vb.y) / 2, (va.z + vb.z) / 2)
  parts.push(paint(g, col))
}

// half-beam of the hull outline at position x (bow at +L/2, transom at −L/2)
export function halfBeam(x) {
  const L = WRECK_L, B = WRECK_B
  const u = (x + L / 2) / L // 0 stern … 1 bow
  if (u < 0.08) return B / 2 * (0.84 + 0.16 * (u / 0.08))           // rounded stern
  if (u < 0.68) return B / 2                                          // parallel mid-body
  const t = (u - 0.68) / 0.32
  return (B / 2) * Math.cos(t * t * Math.PI / 2) * (1 - 0.02 * t) + 0.05 // fine bow
}
function outline(x0, x1, n = 40) {
  const pts = []
  for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; pts.push([x, halfBeam(x)]) }
  return pts
}
function shapeFromOutline(x0, x1, holes = []) {
  const top = outline(x0, x1)
  const sh = new THREE.Shape()
  sh.moveTo(top[0][0], -top[0][1])
  for (const [x, h] of top) sh.lineTo(x, -h)
  for (let i = top.length - 1; i >= 0; i--) sh.lineTo(top[i][0], top[i][1])
  sh.closePath()
  for (const [cx, w, d] of holes) {
    const hp = new THREE.Path()
    hp.moveTo(cx - w / 2, -d / 2); hp.lineTo(cx - w / 2, d / 2); hp.lineTo(cx + w / 2, d / 2); hp.lineTo(cx + w / 2, -d / 2); hp.closePath()
    sh.holes.push(hp)
  }
  return sh
}
// extrude a plan-view shape upward from y0 by height h (shape x → x, shape y → −z)
function slab(parts, sh, y0, h, col, bevel = false) {
  const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: bevel, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 2, curveSegments: 4 })
  g.rotateX(-Math.PI / 2)
  g.translate(0, y0, 0)
  parts.push(paint(g, col))
}

export function makeCargoWreck() {
  seed = 4242
  const L = WRECK_L, B = WRECK_B, parts = []
  const DECK_Y = 6.0
  const hatches = [[10.5, 6.0, 5.6], [2.0, 6.0, 5.6], [-6.5, 5.0, 5.6]] // centre x, length, width
  // --- hull: solid lower body + a 1.8 m upper shell with the hatch openings cut through it ---
  slab(parts, shapeFromOutline(-L / 2, L / 2 - 0.05), 0.3, 3.9, HULL, true)
  slab(parts, shapeFromOutline(-L / 2 + 0.2, L / 2 - 0.3, hatches), 4.2, 1.8, HULL)
  // hold floors (dark) at the bottom of each opening
  for (const [cx, w, d] of hatches) box(parts, w - 0.1, 0.1, d - 0.1, cx, 4.3, 0, DARK)
  // --- hatch coamings + covers: #1 closed, #2 open, #3 covers knocked off (one lying across the deck edge) ---
  for (const [cx, w, d] of hatches) {
    box(parts, w + 0.4, 0.8, 0.22, cx, DECK_Y + 0.4, d / 2 + 0.11, HOUSE)
    box(parts, w + 0.4, 0.8, 0.22, cx, DECK_Y + 0.4, -d / 2 - 0.11, HOUSE)
    box(parts, 0.22, 0.8, d, cx + w / 2 + 0.11, DECK_Y + 0.4, 0, HOUSE)
    box(parts, 0.22, 0.8, d, cx - w / 2 - 0.11, DECK_Y + 0.4, 0, HOUSE)
  }
  for (let i = 0; i < 3; i++) box(parts, 1.9, 0.3, 5.9, hatches[0][0] - 2 + i * 2, DECK_Y + 0.95, 0, DECK, [0, 0, (rand() - 0.5) * 0.06])
  box(parts, 2.4, 0.3, 5.6, hatches[2][0] + 1.2, DECK_Y + 1.1, 1.2, DECK, [0.35, 0.2, 0.12])
  box(parts, 2.4, 0.3, 5.4, hatches[2][0] - 1.6, DECK_Y + 0.6, -B / 2 - 0.4, DECK, [-0.9, -0.1, 0.05])
  // --- forecastle (raised bow deck) and poop deck (raised stern deck) ---
  slab(parts, shapeFromOutline(L * 0.3, L / 2 - 0.3), DECK_Y, 2.2, HULL)
  slab(parts, shapeFromOutline(-L / 2 + 0.2, -L * 0.28), DECK_Y, 2.0, HULL)
  // --- bulwarks along the well deck, with freeing ports and a torn-away section ---
  for (const side of [1, -1]) {
    for (let x = -L * 0.28 + 0.6; x < L * 0.3 - 0.6; x += 2.0) {
      const gap = ((x + 20) % 8) < 1.6            // freeing ports every 8 m
      const torn = side === 1 && x > -2 && x < 4   // a stretch ripped away on the port side
      if (gap || torn) continue
      const h = halfBeam(x + 1.0)
      box(parts, 2.0, 1.1, 0.12, x + 1.0, DECK_Y + 0.55, side * (h - 0.06), HULL)
    }
    // one bulwark plate bent outward
    box(parts, 2.0, 1.1, 0.12, 5.0, DECK_Y + 0.3, side * (B / 2 + 0.35), HULL, [side * 0.9, 0, 0])
  }
  // --- railings on the forecastle and poop deck edges: stanchions + two rails ---
  const rail = (x0, x1, y) => {
    for (const side of [1, -1]) {
      let prev = null
      for (let x = x0; x <= x1; x += 1.25) {
        const z = side * (halfBeam(x) - 0.15)
        rod(parts, [x, y, z], [x, y + 1.05, z], 0.04, HOUSE, 5)
        if (prev) { rod(parts, [prev[0], y + 1.05, prev[1]], [x, y + 1.05, z], 0.035, HOUSE, 5); rod(parts, [prev[0], y + 0.55, prev[1]], [x, y + 0.55, z], 0.03, HOUSE, 5) }
        prev = [x, z]
      }
    }
  }
  rail(L * 0.3 + 0.4, L / 2 - 1.2, DECK_Y + 2.2)
  rail(-L / 2 + 0.8, -L * 0.28 - 0.3, DECK_Y + 2.0)
  // --- stern superstructure: three decks, bridge with wings, windows, funnel, radar mast ---
  const hx = -L * 0.38
  box(parts, 7.0, 2.6, 7.2, hx, DECK_Y + 2.0 + 1.3, 0, HOUSE)
  box(parts, 6.0, 2.4, 6.6, hx - 0.3, DECK_Y + 4.6 + 1.2, 0, HOUSE)
  box(parts, 4.4, 2.2, 8.8, hx + 0.4, DECK_Y + 7.0 + 1.1, 0, HOUSE)      // bridge with wings
  for (let i = 0; i < 6; i++) box(parts, 0.08, 0.7, 0.9, hx + 2.64, DECK_Y + 8.4, -3.2 + i * 1.28, DARK) // bridge windows
  for (let i = 0; i < 5; i++) for (const s of [1, -1]) box(parts, 0.7, 0.5, 0.08, hx - 2.6 + i * 1.3, DECK_Y + 3.6, s * 3.64, DARK) // portholes/windows
  cyl(parts, 0.95, 1.15, 5.0, hx - 2.6, DECK_Y + 7.0 + 2.5, 0, DARK, [0, 0, 0.12], 14) // funnel, raked aft
  cyl(parts, 1.2, 1.2, 0.45, hx - 2.92, DECK_Y + 11.4, 0, HOUSE, [0, 0, 0.12], 14)      // funnel band
  rod(parts, [hx + 0.4, DECK_Y + 9.2, 0], [hx + 0.2, DECK_Y + 12.8, 0], 0.09, HOUSE)  // radar mast
  rod(parts, [hx + 0.2, DECK_Y + 12.2, -1.4], [hx + 0.2, DECK_Y + 12.2, 1.4], 0.06, HOUSE)
  // lifeboat davits (one empty, one with its boat still hanging) + a lifeboat fallen on the poop deck
  for (const s of [1, -1]) for (const dx of [-1.6, 1.4]) {
    rod(parts, [hx - 1.0 + dx, DECK_Y + 4.6, s * 3.2], [hx - 1.0 + dx, DECK_Y + 7.0, s * 3.7], 0.09, HOUSE)
    rod(parts, [hx - 1.0 + dx, DECK_Y + 7.0, s * 3.7], [hx - 1.0 + dx, DECK_Y + 6.7, s * 4.4], 0.08, HOUSE)
  }
  { const g = new THREE.SphereGeometry(1, 12, 8); g.scale(3.2, 0.7, 1.0); g.translate(hx - 1.1, DECK_Y + 5.9, 4.3); parts.push(paint(g, HOUSE)) }
  { const g = new THREE.SphereGeometry(1, 12, 8); g.scale(3.0, 0.65, 1.0); g.rotateZ(0.25); g.rotateY(0.4); g.translate(hx + 3.8, DECK_Y + 2.6, -2.2); parts.push(paint(g, HOUSE)) }
  // --- masts with cross-trees and derrick booms ---
  const mast = (x, h) => {
    rod(parts, [x, DECK_Y, 0], [x, DECK_Y + h, 0], 0.28, HOUSE, 10)
    rod(parts, [x, DECK_Y + h - 1.0, -2.2], [x, DECK_Y + h - 1.0, 2.2], 0.1, HOUSE)
    rod(parts, [x - 0.8, DECK_Y + 1.2, 0], [x - 0.8, DECK_Y + 1.2 + h * 0.35, 0], 0.18, HOUSE) // kingpost
    for (const s of [1, -1]) {
      rod(parts, [x - 0.4, DECK_Y + 1.5, s * 0.9], [x - 7.5, DECK_Y + 6.0, s * 1.6], 0.14, HOUSE) // derrick booms toward the hatch
      rod(parts, [x, DECK_Y + h - 1.0, s * 2.2], [x - 7.5, DECK_Y + 6.0, s * 1.6], 0.025, DARK, 4) // topping lifts
      rod(parts, [x, DECK_Y + h - 1.0, s * 2.2], [x, DECK_Y, s * (B / 2 - 0.3)], 0.03, DARK, 4)     // shrouds
    }
  }
  mast(L * 0.28, 12.5)
  mast(-1.6, 11.5)
  // --- deck crane between hatches #1 and #2 ---
  cyl(parts, 0.8, 0.9, 2.0, 6.2, DECK_Y + 1.0, -2.8, HOUSE, null, 12)
  box(parts, 1.8, 1.6, 1.6, 6.2, DECK_Y + 2.8, -2.8, HOUSE)
  box(parts, 10.0, 0.5, 0.5, 6.2 + 3.8, DECK_Y + 6.0, -2.8, HOUSE, [0, 0.35, 0.72])
  // --- deck fittings: bollards, mushroom vents, winches, windlass + chain, capstan ---
  for (const x of [-9.5, 0.4, 7.4, 13.8]) for (const s of [1, -1]) { cyl(parts, 0.22, 0.26, 0.6, x, DECK_Y + 0.3, s * (B / 2 - 0.7), DARK, null, 8); cyl(parts, 0.22, 0.26, 0.6, x + 0.7, DECK_Y + 0.3, s * (B / 2 - 0.7), DARK, null, 8) }
  for (const [x, z] of [[-3.2, 3.2], [-3.2, -3.2], [5.6, 3.3], [13.4, -3.4], [14.2, 3.2], [-11.2, 3.4], [-11.2, -3.4]]) { cyl(parts, 0.28, 0.28, 1.3, x, DECK_Y + 0.65, z, HOUSE, null, 8); cyl(parts, 0.5, 0.42, 0.25, x, DECK_Y + 1.4, z, HOUSE, null, 8) }
  for (const x of [L * 0.28 - 1.8, -3.0]) { cyl(parts, 0.45, 0.45, 1.8, x, DECK_Y + 0.7, 0, DARK, [Math.PI / 2, 0, 0], 10); box(parts, 1.2, 0.6, 2.4, x, DECK_Y + 0.3, 0, DARK) }
  for (const s of [1, -1]) { cyl(parts, 0.5, 0.5, 1.0, L / 2 - 4.5, DECK_Y + 2.7, s * 1.1, DARK, [Math.PI / 2, 0, 0], 10); for (let i = 0; i < 8; i++) box(parts, 0.28, 0.14, 0.18, L / 2 - 4.0 + i * 0.32, DECK_Y + 2.35 - i * 0.02, s * 1.1 + i * s * 0.28, DARK, [0, s * 0.7, 0]) }
  // --- anchor at the bow, rudder + propeller at the stern ---
  box(parts, 0.25, 1.6, 0.9, L / 2 - 2.2, DECK_Y - 1.0, B / 2 - 0.4, DARK, [0.2, 0, 0.1])
  box(parts, 2.4, 4.2, 0.3, -L / 2 - 1.0, 2.2, 0, DARK)
  cyl(parts, 0.45, 0.45, 0.8, -L / 2 - 0.3, 2.0, 0, DARK, [0, 0, Math.PI / 2], 10)
  for (let i = 0; i < 4; i++) box(parts, 0.12, 1.5, 0.55, -L / 2 - 0.2, 2.0, 0, DARK, [i * Math.PI / 2 + 0.3, 0, 0.35])
  // --- exposed frames (ribs) where the port bulwark and shell plating are torn ---
  for (let x = -1.5; x < 4.0; x += 0.9) rod(parts, [x, DECK_Y - 1.4, B / 2 - 0.05], [x, DECK_Y + 0.9, B / 2 + 0.05], 0.09, HULL, 5)
  return merge(parts)
}

// Loose debris around the wreck: crates, drums and bent plates on the bottom (world placement done by the caller)
export function makeWreckDebris() {
  seed = 777
  const parts = []
  const items = []
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2, d = 6 + rand() * 18
    const kind = i % 3
    const g = kind === 0 ? new THREE.BoxGeometry(2.0 + rand(), 1.1, 1.2) : kind === 1 ? new THREE.CylinderGeometry(0.3, 0.3, 0.9, 8) : new THREE.BoxGeometry(2.6, 0.12, 1.6 + rand())
    g.rotateX(kind === 1 ? Math.PI / 2 * rand() : (rand() - 0.5) * 0.4)
    g.rotateY(rand() * Math.PI)
    paint(g, kind === 2 ? HULL : DECK)
    items.push({ g, dx: Math.cos(a) * d, dz: Math.sin(a) * d, lift: kind === 0 ? 0.5 : kind === 1 ? 0.3 : 0.05 })
  }
  return { parts, items }
}
