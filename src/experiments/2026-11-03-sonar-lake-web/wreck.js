// A ~40 m steel cargo ship wreck (Jason 2026-09-24: 把大的做的再大一倍, 船舷和表面结构复杂一点 — so the
// sonar shows off: hatches, coamings, bulwarks with freeing ports, railings, masts with derricks, a deck
// crane, a stern superstructure with funnel, lifeboat davits, vents, bollards, windlass, rudder and prop).
// Local frame: x = along the ship (bow at +x), y = up from the keel, z = across (port at +z).
// Returns one merged, non-indexed geometry with vertex colours (rust / deck / paint variation).
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'

const merge = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))

export const WRECK_L = 40, WRECK_B = 9
// where the two wrecks lie (shared by the scene and the fish-path clearing in obstacles.js)
// Jason 2026-09-24: 往上20米, 尺寸缩小30% — moved 20 m up the default view (away from the camera, along its
// ground heading (0.25, −0.97)) onto the flat basin floor, and drawn at 70 % (28 m long)
// Jason 2026-09-24: 逆时针转35度 — turned 35° counter-clockwise as seen from above (yaw −0.9 → −0.289 rad);
// the debris layout was made for yaw −0.9 and turns with the ship (debrisYaw)
// Jason 2026-09-25: 船再往前挪一点1/3个船位 — moved 9.3 m (a third of its 28 m) toward its bow, clear of the
// ACCUPHY LAB lockup behind its stern; still on the flat 40 m floor
export const BIG_WRECK = { x: 57.95, z: -46.84, yaw: -0.9 + (35 * Math.PI) / 180, debrisYaw: -0.9, list: 0.3, scale: 0.7 }
export const SMALL_WRECK = { x: 16, z: -26, rot: [0.42, 0.6, 0.12], L: 9.8 }

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

// The ~10 m wooden workboat (Jason 2026-09-24: +30 %, shaped after the PL wreck imaging; 2026-10-25: 小的沉船的模型太简单了，
// 结构过于简单，尺寸 OK … 把它的结构像窗户啊那些东西都做的完善一点 … 船上面应该是有 … 不同的层级). Same size as the old block
// model (9.8 m × 3.2 m, the wheelhouse roof ~3.6 m above the keel), now built like a small trawler so the sonar has levels
// to draw: a V hull lofted through stations with a rising sheer, a low working deck aft inside bulwarks with freeing
// ports, a raised foredeck with a bow rail, a wheelhouse whose walls are real panels with window and door openings (the
// openings read as dark gaps in the picture), a helm console inside, the roof as an upper deck with a rail, a mast with
// a radar dome, a ladder, a fish-hold hatch knocked open, a winch, a stern gantry, rudder, skeg and propeller.
// Local frame as the old one: x = along the boat (bow +x), y = up (keel ≈ −0.2), z = across.
export const WORKBOAT_L = 9.8
export function makeWorkboat() {
  let sd = 9157
  const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280 // deterministic: the page's Math.random is left alone
  const L = WORKBOAT_L, parts = []
  const ss = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t) }
  const xOf = (u) => -L / 2 + u * L, uOf = (x) => (x + L / 2) / L
  // hull lines: half-breadth and height of the sheer (deck edge), the chine and the keel along u (0 transom → 1 stem)
  const B = (u) => Math.max(0.04, (1.36 + 0.24 * ss(0, 0.32, u)) * (1 - Math.pow(Math.max(0, (u - 0.5) / 0.5), 2.1)))
  const yS = (u) => 1.72 + 0.5 * Math.pow(ss(0.45, 1, u), 1.4)
  const Bc = (u) => B(u) * 0.84
  const yC = (u) => 0.42 + 0.95 * Math.pow(ss(0.55, 1, u), 1.6)
  const yK = (u) => -0.2 + 1.25 * Math.pow(ss(0.72, 1, u), 2.2)
  // one station as a closed ring, port sheer → keel → starboard sheer, closed across the deck
  const ring = (u) => {
    const x = xOf(u), b = B(u), ys = yS(u), bc = Bc(u), yc = yC(u), yk = yK(u)
    const half = [[b, ys], [b * 0.985, 0.55 * ys + 0.45 * yc], [bc, yc], [Math.min(0.07, bc * 0.5), yk]]
    return [...half.map(([z, y]) => [x, y, z]), ...half.slice().reverse().map(([z, y]) => [x, y, -z])]
  }
  const pos = []
  const tri = (a, b, c) => pos.push(...a, ...b, ...c)
  const N = 40, us = Array.from({ length: N + 1 }, (_, i) => Math.pow(i / N, 0.85)) // a little denser toward the stem
  const R = us.map(ring), M = R[0].length
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = R[i][j], b = R[i][(j + 1) % M], c = R[i + 1][(j + 1) % M], d = R[i + 1][j]
    tri(a, b, c); tri(a, c, d) // outward: the ring runs clockwise seen from astern
  }
  const cap = (rg, flip) => { const c = rg.reduce((s, p) => [s[0] + p[0] / M, s[1] + p[1] / M, s[2] + p[2] / M], [0, 0, 0]); for (let j = 0; j < M; j++) flip ? tri(c, rg[(j + 1) % M], rg[j]) : tri(c, rg[j], rg[(j + 1) % M]) }
  cap(R[0], true); cap(R[N], false) // the transom and the stem
  const hull = new THREE.BufferGeometry(); hull.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hull.computeVertexNormals()
  hull.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2)) // (the parts merged with it all carry uvs)
  parts.push(hull)
  const box = (sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0) => { const g = new THREE.BoxGeometry(sx, sy, sz); g.rotateX(rx).rotateY(ry).rotateZ(rz); g.translate(x, y, z); parts.push(g) }
  const rod = (a, b, r, seg = 6) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), g = new THREE.CylinderGeometry(r, r, va.distanceTo(vb), seg)
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()))
    g.translate((va.x + vb.x) / 2, (va.y + vb.y) / 2, (va.z + vb.z) / 2); parts.push(g)
  }
  // rub rails along the sheer
  for (const s of [1, -1]) for (let i = 1; i < N - 1; i += 2) { const u0 = us[i], u1 = us[Math.min(i + 2, N - 1)]; rod([xOf(u0), yS(u0) - 0.08, s * (B(u0) + 0.04)], [xOf(u1), yS(u1) - 0.08, s * (B(u1) + 0.04)], 0.06, 5) }
  // --- level 1: the working deck aft, inside bulwarks 0.6 m high with freeing ports, a gate in the transom bulwark ---
  for (const s of [1, -1]) for (let x = -L / 2 + 0.15; x < 1.0; x += 0.75) {
    if (Math.abs(x + 2.4) < 0.3 || Math.abs(x - 0.3) < 0.3) continue // freeing ports
    const u = uOf(x + 0.36)
    box(0.72, 0.6, 0.06, x + 0.36, yS(u) + 0.3, s * (B(u) - 0.03))
  }
  for (const s of [1, -1]) box(0.06, 0.6, 0.85, -L / 2 + 0.06, yS(0) + 0.3, s * 0.92) // the transom bulwark either side of the gate
  // fish-hold hatch: coaming, the cover knocked half off
  const hx = -2.5, dy = yS(uOf(hx))
  box(1.3, 0.32, 0.07, hx, dy + 0.16, 0.55); box(1.3, 0.32, 0.07, hx, dy + 0.16, -0.55); box(0.07, 0.32, 1.1, hx + 0.62, dy + 0.16, 0); box(0.07, 0.32, 1.1, hx - 0.62, dy + 0.16, 0)
  box(1.0, 0.04, 1.0, hx + 0.02, dy + 0.02, 0) // the hold floor seen through the opening
  box(1.4, 0.08, 1.2, hx - 0.35, dy + 0.42, 0.35, 0.22, 0.3, 0.18)
  // winch drum on its frame behind the wheelhouse, a stern gantry (A-frame) with its block
  box(0.12, 0.6, 0.12, -1.55, dy + 0.3, 0.75); box(0.12, 0.6, 0.12, -1.55, dy + 0.3, -0.75)
  { const g = new THREE.CylinderGeometry(0.28, 0.28, 1.35, 12); g.rotateX(Math.PI / 2); g.translate(-1.55, dy + 0.55, 0); parts.push(g) }
  for (const s of [1, -1]) rod([-L / 2 + 0.35, yS(0.03), s * 1.25], [-L / 2 + 0.05, yS(0) + 2.2, s * 0.85], 0.07)
  rod([-L / 2 + 0.05, yS(0) + 2.2, 0.9], [-L / 2 + 0.05, yS(0) + 2.2, -0.9], 0.07)
  box(0.18, 0.32, 0.12, -L / 2 + 0.05, yS(0) + 1.95, 0)
  // --- level 2: the raised foredeck: a deck 0.45 m above the sheer over the bow, a bow rail, bollards, anchor winch ---
  {
    const x0 = 2.2, x1 = L / 2 - 0.25, n = 14, sh = new THREE.Shape()
    const pts = Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, B(uOf(x)) - 0.06] })
    sh.moveTo(pts[0][0], -pts[0][1]); pts.forEach(([x, h]) => sh.lineTo(x, -h)); for (let i = n; i >= 0; i--) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath()
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.45, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, yS(uOf(x0)) - 0.02, 0); parts.push(g)
    const top = yS(uOf(x0)) + 0.43
    for (const s of [1, -1]) {
      let prev = null
      for (let x = x0 + 0.2; x <= x1 - 0.3; x += 0.6) {
        const z = s * (B(uOf(x)) - 0.14), y = Math.max(top, yS(uOf(x)) + 0.02)
        rod([x, y, z], [x, y + 0.75, z], 0.025, 5)
        if (prev) rod([prev[0], prev[1] + 0.75, prev[2]], [x, y + 0.75, z], 0.022, 5)
        prev = [x, y, z]
      }
    }
    for (const s of [1, -1]) { const g = new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8); g.translate(x0 + 0.7, top + 0.15, s * 0.7); parts.push(g) }
    box(0.5, 0.35, 0.45, x1 - 1.2, top + 0.17, 0)
  }
  // --- the wheelhouse: panel walls with window and door openings, a floor, the helm console inside ---
  const wx0 = -0.95, wx1 = 1.65, wz = 1.12, wy0 = yS(uOf(0.35)) + 0.02, wy1 = wy0 + 1.75, T = 0.08
  const winLo = wy0 + 0.95, winHi = wy0 + 1.5
  box(wx1 - wx0, 0.06, 2 * wz, (wx0 + wx1) / 2, wy0 + 0.03, 0) // floor
  // a wall with openings: [along0, along1] spans, solid below the sill and above the head, mullions between the openings
  const wall = (axis, at, a0, a1, openings) => {
    const put = (p0, p1, y0, y1) => {
      if (p1 - p0 < 0.01 || y1 - y0 < 0.01) return
      if (axis === 'x') box(T, y1 - y0, p1 - p0, at, (y0 + y1) / 2, (p0 + p1) / 2); else box(p1 - p0, y1 - y0, T, (p0 + p1) / 2, (y0 + y1) / 2, at)
    }
    let p = a0
    for (const [o0, o1, lo, hi] of openings) { put(p, o0, wy0, wy1); put(o0, o1, wy0, lo); put(o0, o1, hi, wy1); p = o1 }
    put(p, a1, wy0, wy1)
  }
  wall('x', wx1, -wz, wz, [[-0.95, -0.38, winLo, winHi], [-0.28, 0.28, winLo, winHi], [0.38, 0.95, winLo, winHi]]) // front: three windows
  wall('x', wx0, -wz, wz, [[-0.75, -0.25, winLo, winHi], [0.05, 0.65, wy0 + 0.05, wy0 + 1.6]]) // back: a window and the door
  wall('z', wz, wx0, wx1, [[-0.7, -0.05, winLo, winHi], [0.2, 0.85, winLo, winHi], [1.05, 1.45, winLo, winHi]]) // port side
  wall('z', -wz, wx0, wx1, [[-0.75, -0.15, wy0 + 0.05, wy0 + 1.6], [0.2, 0.85, winLo, winHi], [1.05, 1.45, winLo, winHi]]) // starboard: side door + two windows
  box(0.55, 0.85, 0.95, wx1 - 0.4, wy0 + 0.45, -0.45) // helm console
  box(0.45, 0.45, 1.6, wx0 + 0.35, wy0 + 0.25, 0.25) // bench aft
  // --- level 3: the roof as an upper deck: overhanging slab, a rail round it, a small console, the mast and radar ---
  const ry = wy1 + 0.05
  box(wx1 - wx0 + 0.35, 0.1, 2 * wz + 0.24, (wx0 + wx1) / 2 + 0.1, ry, 0)
  {
    const rx0 = wx0 + 0.05, rx1 = wx1 + 0.15, rz = wz + 0.05, h = 0.85, y = ry + 0.05
    const post = (x, z) => rod([x, y, z], [x, y + h, z], 0.025, 5)
    for (let x = rx0; x <= rx1 + 1e-3; x += (rx1 - rx0) / 4) { post(x, rz); post(x, -rz) }
    for (const z of [-rz / 2, 0, rz / 2]) post(rx1, z)
    for (const s of [1, -1]) rod([rx0, y + h, s * rz], [rx1, y + h, s * rz], 0.022, 5)
    rod([rx1, y + h, -rz], [rx1, y + h, rz], 0.022, 5)
    box(0.4, 0.6, 0.8, rx1 - 0.35, y + 0.3, -0.35) // the upper helm
    const mb = [wx0 + 0.45, y], mt = [wx0 + 0.75, y + 2.6] // the mast, leaning aft a little after the fall
    rod([mb[0], mb[1], 0], [mt[0], mt[1], 0], 0.07, 8)
    rod([mt[0] - 0.05, mt[1] - 0.6, -0.75], [mt[0] - 0.05, mt[1] - 0.6, 0.75], 0.035, 5) // crosstree
    const dome = new THREE.CylinderGeometry(0.32, 0.36, 0.22, 14); dome.translate(mt[0] - 0.12, mt[1] - 0.25, 0); parts.push(dome)
    // the ladder up the back of the wheelhouse, beside the door
    for (const z of [-0.95, -0.6]) rod([wx0 - 0.12, wy0, z], [wx0 - 0.12, y + 0.6, z], 0.025, 5)
    for (let k = 1; k * 0.32 < y - wy0; k++) rod([wx0 - 0.12, wy0 + k * 0.32, -0.95], [wx0 - 0.12, wy0 + k * 0.32, -0.6], 0.018, 4)
  }
  // --- under water: skeg, rudder, propeller ---
  box(2.2, 0.32, 0.12, -L / 2 + 1.25, -0.12, 0)
  box(0.08, 0.95, 0.6, -L / 2 - 0.12, 0.2, 0)
  { const g = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8); g.rotateZ(Math.PI / 2); g.translate(-L / 2 + 0.25, 0.08, 0); parts.push(g) }
  for (let i = 0; i < 3; i++) box(0.05, 0.38, 0.16, -L / 2 + 0.06, 0.08, 0, i * 2.094 + 0.4, 0, 0.3)
  const g = merge(parts)
  const col = new Float32Array(g.attributes.position.count * 3)
  for (let i = 0; i < col.length; i += 3) { const k = 0.9 + rnd() * 0.2; col[i] = 0.34 * k; col[i + 1] = 0.28 * k; col[i + 2] = 0.2 * k }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}
