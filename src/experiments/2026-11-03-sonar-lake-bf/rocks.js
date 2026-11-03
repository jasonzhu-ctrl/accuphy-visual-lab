// Lake rocks built in code (decision #131). Jason 2026-10-24: "石头像爆米花一样" — the old rock was a DodecahedronGeometry
// whose shared corners were moved one copy at a time, so every rock fell apart into loose flat-shaded shards.
// These are the boulders of a Canadian Shield lake: glacially rounded granite and gneiss, often flattened, with a few
// flat joint faces and rounded edges, smooth skins with fine pitting, a film of algae and silt. Six shapes, each a
// subdivided icosahedron (welded, so the skin stays whole) shaped by: an ellipsoid, a few soft planar cuts (joints),
// low-frequency bumps, fine grain, a flattened base. All in code: nothing to license, nothing to load (#87, #94).
// Unit rock: horizontal half-extent 0.62, the base at y = −0.4 (buried by placement), the top at ≤ +0.4 — the same
// envelope obstacles.js uses (radius 0.63 s, y − 0.45 s … y + 0.4 s).
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

// ---- deterministic noise ----
const fract = (v) => v - Math.floor(v)
const hash3 = (x, y, z) => fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453)
function vnoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const fx = x - xi, fy = y - yi, fz = z - zi
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), sz = fz * fz * (3 - 2 * fz)
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz)
  const x00 = c(0, 0, 0) + (c(1, 0, 0) - c(0, 0, 0)) * sx, x10 = c(0, 1, 0) + (c(1, 1, 0) - c(0, 1, 0)) * sx
  const x01 = c(0, 0, 1) + (c(1, 0, 1) - c(0, 0, 1)) * sx, x11 = c(0, 1, 1) + (c(1, 1, 1) - c(0, 1, 1)) * sx
  const y0 = x00 + (x10 - x00) * sy, y1 = x01 + (x11 - x01) * sy
  return y0 + (y1 - y0) * sz
}
function fbm3(x, y, z, oct = 3) {
  let v = 0, amp = 0.5, f = 1
  for (let i = 0; i < oct; i++) { v += amp * vnoise3(x * f, y * f, z * f); amp *= 0.5; f *= 2.07 }
  return v / (1 - Math.pow(0.5, oct))
}
let seed = 1
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280

// The six kinds. ax: ellipsoid half-axes (x, y, z) before fitting; facets: how many joint planes, cut: their distance
// from the centre on the unit sphere (smaller = bigger flat face), round: edge rounding; bump/grain: displacement.
// colour: the wet rock's albedo (granite greys, gneiss, a greenish algae film) — darker than the old 0.46 so the beam
// lifts it to orange, not white (timber sits at 0.24–0.28, logo.js: a light plinth "glowed as white as the letters").
export const ROCK_KINDS = [
  { name: 'boulder', ax: [1, 0.74, 0.86], facets: 3, cut: [0.62, 0.78], round: 0.10, bump: 0.16, grain: 0.014, colour: [0.36, 0.30, 0.26] }, // pink granite, rounded
  { name: 'block', ax: [1, 0.82, 0.78], facets: 6, cut: [0.48, 0.64], round: 0.04, bump: 0.07, grain: 0.012, colour: [0.29, 0.29, 0.27] }, // jointed grey granite
  { name: 'slab', ax: [1, 0.36, 0.80], facets: 2, cut: [0.42, 0.52], round: 0.07, bump: 0.10, grain: 0.012, slab: true, colour: [0.25, 0.25, 0.23] }, // a gneiss slab
  { name: 'loaf', ax: [1.3, 0.60, 0.70], facets: 2, cut: [0.66, 0.80], round: 0.12, bump: 0.12, grain: 0.012, colour: [0.35, 0.31, 0.25] }, // tan, long and low
  { name: 'shard', ax: [1, 0.84, 0.64], facets: 7, cut: [0.46, 0.64], round: 0.02, bump: 0.05, grain: 0.015, colour: [0.24, 0.24, 0.22] }, // a broken dark fragment
  { name: 'cobble', ax: [1, 0.86, 0.90], facets: 0, cut: [0, 0], round: 0, bump: 0.15, grain: 0.016, colour: [0.27, 0.31, 0.22] }, // algae-green, lumpy
]

const tmp = new THREE.Vector3()
// detail: icosahedron subdivisions (2 → 320 triangles, 3 → 1280)
export function makeRockGeometry(kind, variant = 0, detail = 2) {
  const K = typeof kind === 'number' ? ROCK_KINDS[kind % ROCK_KINDS.length] : kind
  seed = 700 + ROCK_KINDS.indexOf(K) * 31 + variant * 7
  let g = mergeVertices(new THREE.IcosahedronGeometry(1, detail), 1e-4) // welded: one point per corner
  const p = g.attributes.position
  // the joint planes: unit normals and distances; a slab's two planes are its top and bottom
  const planes = []
  for (let i = 0; i < K.facets; i++) {
    let n
    if (K.slab) n = new THREE.Vector3((rnd() - 0.5) * 0.3, i === 0 ? 1 : -1, (rnd() - 0.5) * 0.3).normalize()
    else n = new THREE.Vector3(rnd() - 0.5, (rnd() - 0.5) * 0.8, rnd() - 0.5).normalize()
    planes.push({ n, d: K.cut[0] + rnd() * (K.cut[1] - K.cut[0]) })
  }
  const off = [rnd() * 50, rnd() * 50, rnd() * 50]
  // one side leans out a little: no rock is symmetric
  const lean = new THREE.Vector3(rnd() - 0.5, (rnd() - 0.5) * 0.4, rnd() - 0.5).normalize(), leanK = 0.08 + rnd() * 0.1
  for (let i = 0; i < p.count; i++) {
    tmp.set(p.getX(i), p.getY(i), p.getZ(i))
    // low-frequency bumps first (the rock's mass), then the joint cuts, so the flat faces stay flat
    const b = (fbm3(tmp.x * 1.3 + off[0], tmp.y * 1.3 + off[1], tmp.z * 1.3 + off[2]) - 0.5) * 2
    tmp.multiplyScalar(1 + K.bump * b + leanK * Math.max(0, tmp.dot(lean)))
    // soft planar cuts: beyond the plane the point is pulled back onto it, with a rounded shoulder of width `round`
    for (const { n, d } of planes) {
      const e = tmp.dot(n) - d
      if (e > 0) { const r = Math.max(K.round, 1e-3); tmp.addScaledVector(n, -(e - r * (1 - Math.exp(-e / r)))) }
    }
    // fine grain: pitting and weathering
    const gr = (vnoise3(tmp.x * 9 + off[1], tmp.y * 9 + off[2], tmp.z * 9 + off[0]) - 0.5) * 2
    tmp.multiplyScalar(1 + K.grain * gr)
    tmp.set(tmp.x * K.ax[0], tmp.y * K.ax[1], tmp.z * K.ax[2])
    // the base, in the silt: flattened so a rock sits instead of balancing on a point
    const h = K.ax[1]
    if (tmp.y < -0.55 * h) tmp.y = -0.55 * h + (tmp.y + 0.55 * h) * 0.4
    p.setXYZ(i, tmp.x, tmp.y, tmp.z)
  }
  // fit the envelope: horizontal half-extent 0.62, base at y = −0.4, top no higher than +0.4
  g.computeBoundingBox()
  const bb = g.boundingBox
  const hx = Math.max(Math.abs(bb.min.x), bb.max.x, Math.abs(bb.min.z), bb.max.z)
  let k = 0.62 / hx
  if ((bb.max.y - bb.min.y) * k > 0.8) k = 0.8 / (bb.max.y - bb.min.y)
  g.scale(k, k, k)
  g.computeBoundingBox()
  g.translate(0, -0.4 - g.boundingBox.min.y, 0)
  g.computeVertexNormals()
  // colour: the kind's albedo, silt-dark toward the base, a per-point jitter and lighter / darker patches
  const n = g.attributes.position.count, col = new Float32Array(n * 3), q = g.attributes.position
  for (let i = 0; i < n; i++) {
    const y = q.getY(i)
    const silt = 0.72 + 0.28 * THREE.MathUtils.smoothstep(y, -0.4, 0.05)
    const patch = 1 + 0.16 * (fbm3(q.getX(i) * 3.1 + off[2], y * 3.1, q.getZ(i) * 3.1 + off[0], 2) - 0.5) * 2
    const j = 1 + (rnd() - 0.5) * 0.08
    const m = silt * patch * j
    col[i * 3] = K.colour[0] * m; col[i * 3 + 1] = K.colour[1] * m; col[i * 3 + 2] = K.colour[2] * m
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}
