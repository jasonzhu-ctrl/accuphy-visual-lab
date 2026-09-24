// Natural-looking underwater structure: drowned timber, bushy little trees,
// stumps, fallen logs, weed tufts, rocks. All sizes in metres. Jason 2026-09-24:
// "树桩排列自然一些, 形状不同更细的有很多分叉的水底小树, 石头大小分布随机自然".
import * as THREE from 'three'
import { mergeGeometries as _merge } from 'three/addons/utils/BufferGeometryUtils.js'
import { bedY, depthAt, fbm, ROCK_HUMPS } from './terrain'

const merge = (parts) => _merge(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
let seed = 5
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
const setSeed = (s) => { seed = s }

function paint(g, r, gg, b, jitter = 0.05) {
  const n = g.attributes.position.count, col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { const j = 1 + (rnd() - 0.5) * jitter * 2; col[i * 3] = r * j; col[i * 3 + 1] = gg * j; col[i * 3 + 2] = b * j }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}
// a tapered branch from `from` along direction `dir` of length `len`
function branch(from, dir, len, r0, r1, seg = 5) {
  const g = new THREE.CylinderGeometry(r1, r0, len, seg)
  g.translate(0, len / 2, 0)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  g.applyQuaternion(q)
  g.translate(from.x, from.y, from.z)
  return g
}
function limbs(parts, from, dir, len, r0, depth, spread) {
  parts.push(branch(from, dir, len, r0, r0 * 0.45))
  if (depth === 0) return
  const end = from.clone().addScaledVector(dir.clone().normalize(), len)
  const n = 2 + Math.floor(rnd() * 2)
  for (let i = 0; i < n; i++) {
    const d = dir.clone().normalize()
    d.x += (rnd() - 0.5) * spread; d.z += (rnd() - 0.5) * spread; d.y += (rnd() - 0.2) * spread * 0.6
    const start = from.clone().addScaledVector(dir.clone().normalize(), len * (0.55 + 0.4 * rnd()))
    limbs(parts, i === 0 ? end : start, d, len * (0.45 + 0.25 * rnd()), r0 * 0.5, depth - 1, spread)
  }
}

// Tall drowned tree, ~1 unit tall (scaled per instance to 3–10 m): bare trunk, a few dead limbs.
export function makeTallTree(variant) {
  setSeed(100 + variant)
  const parts = [branch(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 1, 0.05, 0.012, 7)]
  const n = 2 + Math.floor(rnd() * 4)
  for (let i = 0; i < n; i++) {
    const h = 0.35 + rnd() * 0.55
    const d = new THREE.Vector3(Math.cos(i * 2.4 + rnd()), 0.5 + rnd() * 0.8, Math.sin(i * 2.4 + rnd()))
    limbs(parts, new THREE.Vector3(0, h, 0), d, 0.16 + rnd() * 0.14, 0.014, 1, 0.9)
  }
  return paint(merge(parts), 0.24, 0.19, 0.13, 0.15)
}
// Small bushy tree fully under water, ~1 unit tall (scaled to 1.5–3.5 m): many fine forks.
export function makeBushTree(variant) {
  setSeed(200 + variant)
  const parts = [branch(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0.32, 0.035, 0.02, 6)]
  const n = 5 + Math.floor(rnd() * 4)
  for (let i = 0; i < n; i++) {
    const a = i * (6.28 / n) + rnd() * 0.6
    const d = new THREE.Vector3(Math.cos(a) * (0.6 + rnd() * 0.5), 0.9 + rnd() * 0.5, Math.sin(a) * (0.6 + rnd() * 0.5))
    limbs(parts, new THREE.Vector3(0, 0.28 + rnd() * 0.06, 0), d, 0.28 + rnd() * 0.14, 0.016, 2, 1.1)
  }
  return paint(merge(parts), 0.27, 0.22, 0.15, 0.2)
}
export function makeStump() {
  setSeed(300)
  const g = new THREE.CylinderGeometry(0.16, 0.24, 1, 8); g.translate(0, 0.5, 0)
  const top = new THREE.ConeGeometry(0.12, 0.35, 6); top.translate(0.06, 1.05, 0.02)
  const root = new THREE.CylinderGeometry(0.08, 0.14, 0.4, 5); root.rotateZ(1.2); root.translate(0.2, 0.08, 0)
  return paint(merge([g, top, root]), 0.28, 0.22, 0.15, 0.12)
}
export function makeLog() {
  setSeed(400)
  const g = new THREE.CylinderGeometry(0.16, 0.24, 1, 8); g.rotateZ(Math.PI / 2)
  const a = new THREE.CylinderGeometry(0.03, 0.06, 0.3, 5); a.rotateX(1.1); a.translate(-0.2, 0.12, 0.05)
  const b = new THREE.CylinderGeometry(0.03, 0.06, 0.25, 5); b.rotateX(-1.2); b.rotateZ(0.5); b.translate(0.25, 0.1, -0.05)
  return paint(merge([g, a, b]), 0.25, 0.2, 0.14, 0.12)
}
export function makeWeedTuft() {
  setSeed(500)
  const parts = []
  for (let i = 0; i < 7; i++) {
    const blade = new THREE.ConeGeometry(0.035, 1, 3); blade.translate(0, 0.5, 0)
    blade.rotateX((rnd() - 0.5) * 0.5); blade.rotateZ((rnd() - 0.5) * 0.5); blade.rotateY(rnd() * 6.28)
    blade.translate((rnd() - 0.5) * 0.25, 0, (rnd() - 0.5) * 0.25)
    parts.push(blade)
  }
  return paint(merge(parts), 0.22, 0.42, 0.2, 0.25)
}
export function makeRock(variant) {
  setSeed(600 + variant)
  const g = new THREE.DodecahedronGeometry(0.5, 1)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) { const k = 0.8 + rnd() * 0.45; p.setXYZ(i, p.getX(i) * k, p.getY(i) * (0.55 + rnd() * 0.3), p.getZ(i) * k) }
  g.computeVertexNormals()
  return paint(g, 0.46, 0.44, 0.39, 0.12)
}

// ---------- placement ----------
const smooth = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t) }
// Rejection-sample positions: `weight(x,z)` in [0,1] is the chance to keep a spot.
function scatter(n, weight, box = 62) {
  const out = []
  let guard = 0
  while (out.length < n && guard++ < n * 60) {
    const x = (rnd() - 0.5) * 2 * box, z = (rnd() - 0.5) * 2 * box
    if (rnd() < weight(x, z)) out.push([x, z])
  }
  return out
}
const clump = (x, z, f, off) => Math.pow(fbm(x * f + off, z * f + off * 2), 3) * 4 // clumpy noise mask

export function placeAll() {
  setSeed(777)
  const d = depthAt
  const items = { tall: [], bush: [], stump: [], log: [], weed: [], rock: [] }
  // tall timber: along the old shoreline / drop-off (depth 7–14 m), clumped, plus the deep basin edge
  scatter(70, (x, z) => (d(x, z) > 7 && d(x, z) < 14 ? 0.9 : 0.03) * Math.min(1, clump(x, z, 0.06, 1)))
    .forEach(([x, z]) => items.tall.push({ x, z, y: bedY(x, z) - 0.2, s: 3 + rnd() * 7, rot: rnd() * 6.28, tilt: (rnd() - 0.5) * 0.2 }))
  // bushy submerged trees: shelf and hump flanks (depth 4–10 m), tight clumps
  scatter(160, (x, z) => (d(x, z) > 3.5 && d(x, z) < 10 ? 0.9 : 0.05) * Math.min(1, clump(x, z, 0.09, 4)))
    .forEach(([x, z]) => items.bush.push({ x, z, y: bedY(x, z) - 0.05, s: 1.4 + rnd() * 2.1, rot: rnd() * 6.28, tilt: (rnd() - 0.5) * 0.25 }))
  // stumps: near the tall timber, in loose groups
  scatter(60, (x, z) => (d(x, z) > 5 && d(x, z) < 13 ? 0.8 : 0.02) * Math.min(1, clump(x, z, 0.07, 9)))
    .forEach(([x, z]) => items.stump.push({ x, z, y: bedY(x, z) - 0.05, s: 0.5 + rnd() * 0.9, rot: rnd() * 6.28, tilt: (rnd() - 0.5) * 0.3 }))
  // fallen logs on the shelf and slopes
  scatter(12, (x, z) => (d(x, z) > 4 && d(x, z) < 15 ? 0.5 : 0.02))
    .forEach(([x, z]) => items.log.push({ x, z, y: bedY(x, z) + 0.12, s: 4 + rnd() * 6, rot: rnd() * 6.28, tilt: (rnd() - 0.5) * 0.1 }))
  // weed beds on the shallow shelf
  scatter(700, (x, z) => (d(x, z) < 7.5 ? 0.9 : 0.0) * Math.min(1, clump(x, z, 0.11, 13)), 66)
    .forEach(([x, z]) => items.weed.push({ x, z, y: bedY(x, z), s: 0.6 + rnd() * 1.0, rot: rnd() * 6.28, tilt: 0 }))
  // rocks: a pile on the hump (bigger toward the centre) + scattered boulders + some on the drop-off
  for (let i = 0; i < 90; i++) {
    const a = rnd() * 6.28, r = Math.pow(rnd(), 0.6) * 11
    const x = 30 + Math.cos(a) * r, z = 12 + Math.sin(a) * r * 0.75
    const s = 0.35 + (1 - r / 11) * 1.4 * rnd() + rnd() * 0.5
    items.rock.push({ x, z, y: bedY(x, z) + s * 0.22, s, rot: rnd() * 6.28, tilt: rnd() * 0.6 })
  }
  // 3–5 big boulders (2–4 m) anywhere in the play area, and 2–3 small rock humps
  scatter(4, (x, z) => (d(x, z) > 5 && d(x, z) < 30 && Math.hypot(x - 30, z - 12) > 14 ? 0.6 : 0))
    .forEach(([x, z]) => { const s = 2 + rnd() * 2; items.rock.push({ x, z, y: bedY(x, z) + s * 0.25, s, rot: rnd() * 6.28, tilt: rnd() * 0.3 }) })
  for (const [hx, hz, hr] of ROCK_HUMPS) {
    for (let i = 0; i < 22; i++) {
      const a = rnd() * 6.28, r = Math.pow(rnd(), 0.7) * hr
      const x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r
      const s = 0.3 + (1 - r / hr) * 0.9 * rnd() + rnd() * 0.3
      items.rock.push({ x, z, y: bedY(x, z) + s * 0.22, s, rot: rnd() * 6.28, tilt: rnd() * 0.6 })
    }
  }
  scatter(45, (x, z) => (Math.hypot(x - 30, z - 12) < 22 ? 0.3 : 0.0) + (d(x, z) > 8 && d(x, z) < 13 ? 0.15 : 0))
    .forEach(([x, z]) => { const s = 0.3 + rnd() * 1.1; items.rock.push({ x, z, y: bedY(x, z) + s * 0.2, s, rot: rnd() * 6.28, tilt: rnd() * 0.6 }) })
  return items
}
