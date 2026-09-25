// Everything solid a fish must not swim through, as simple shapes in metres (Jason 2026-09-24: 鱼穿过木头是个
// bug). Used once at load to route every fish's swim loop around structure (fish.js clearPaths).
//   cylinder: { x, z, r, y0, y1 }        oriented box: { x, z, ax, az, hl, hw, y0, y1 } (ax, az = long axis)
// Shapes are envelopes: a tree's limbs count as one solid crown, so fish pass beside the timber, not between limbs.
import { placeAll } from './vegetation'
import { bedY } from './terrain'
import { WRECK_L, WRECK_B, BIG_WRECK, SMALL_WRECK } from './wreck'
import { logoObstacle } from './logo'

const cyl = (x, z, r, y0, y1) => ({ x, z, r, y0, y1 })
const box = (x, z, yaw, hl, hw, y0, y1) => ({ x, z, ax: Math.cos(yaw), az: -Math.sin(yaw), hl, hw, y0, y1 })

export function buildObstacles() {
  const it = placeAll() // deterministic (seeded) — the same items the scene draws
  const out = []
  for (const t of it.tall) { // trunk (tilted up to ±0.1 rad) + the crown of dead limbs from 35 % of the height up
    out.push(cyl(t.x, t.z, 0.06 * t.s + 0.1 * t.s * Math.abs(t.tilt), t.y - 0.3, t.y + t.s))
    out.push(cyl(t.x, t.z, 0.32 * t.s, t.y + 0.33 * t.s, t.y + 1.08 * t.s))
  }
  for (const b of it.bush) out.push(cyl(b.x, b.z, 0.58 * b.s, b.y - 0.1, b.y + 1.2 * b.s))
  for (const s of it.stump) out.push(cyl(s.x, s.z, 0.26 * s.s + 0.05, s.y - 0.1, s.y + 1.15 * s.s))
  for (const r of it.rock) out.push(cyl(r.x, r.z, 0.63 * r.s, r.y - 0.45 * r.s, r.y + 0.4 * r.s))
  for (const l of it.log) out.push(box(l.x, l.z, l.rot, l.s / 2 + 0.2, 0.4, l.y - 0.4, l.y + 0.45))
  { // the small workboat (tilted on its side)
    const { x, z, rot, L } = SMALL_WRECK, yb = bedY(x, z)
    out.push(box(x, z, rot[1], L / 2 + 0.4, 2.8, yb - 1, yb + 5))
  }
  { // the 40 m cargo ship: hull + deck gear, the stern house, the two masts (listing ~17°: widen the box)
    const { x, z, yaw } = BIG_WRECK, ax = Math.cos(yaw), az = -Math.sin(yaw), yb = bedY(x, z)
    out.push(box(x, z, yaw, WRECK_L / 2 + 0.8, WRECK_B / 2 + 2.2, yb - 2, yb + 9))
    const at = (s) => [x + ax * s, z + az * s]
    { const [hx, hz] = at(-WRECK_L * 0.38); out.push(box(hx, hz, yaw, 4.2, 6.5, yb + 6, yb + 18)) }        // stern house + funnel
    for (const [s, h] of [[WRECK_L * 0.28, 12.5], [-1.6, 11.5]]) { const [mx, mz] = at(s); out.push(cyl(mx, mz, 2.6, yb + 6, yb + 7 + h)) } // masts, cross-trees, derricks
  }
  out.push(logoObstacle())
  return out
}

// does a fish at (x, y, z) with clearance cl (and body half-height hy) touch obstacle o?
export function touches(o, x, y, z, cl, hy = 0.2) {
  if (y + hy < o.y0 || y - hy > o.y1) return false
  const dx = x - o.x, dz = z - o.z
  if (o.r != null) return dx * dx + dz * dz < (o.r + cl) * (o.r + cl)
  const a = Math.abs(dx * o.ax + dz * o.az) - o.hl, b = Math.abs(-dx * o.az + dz * o.ax) - o.hw
  return Math.hypot(Math.max(a, 0), Math.max(b, 0)) < cl
}
// boxes → a row of circles along the long axis (spacing ≤ half-width, radius covers the corners), so the
// path test only needs circles
export function toCircles(obstacles) {
  const out = []
  for (const o of obstacles) {
    if (o.r != null) { out.push(o); continue }
    const n = Math.max(1, Math.ceil((2 * o.hl) / Math.max(0.5, o.hw))), step = (2 * o.hl) / n, r = Math.hypot(o.hw, step / 2)
    for (let i = 0; i <= n; i++) { const s = -o.hl + i * step; out.push({ x: o.x + o.ax * s, z: o.z + o.az * s, r, y0: o.y0, y1: o.y1 }) }
  }
  return out
}
// how far the obstacle reaches from its centre (for a quick near-list)
export const extent = (o) => (o.r != null ? o.r : Math.hypot(o.hl, o.hw))
