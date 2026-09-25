// CPU side of the sonar picture (docs/sonar-style.md §7.13):
//  - a baked terrain depth texture, used by the Panoramic plan-view renderer (and a Float32 copy for
//    CPU lookups, e.g. where a fish's acoustic shadow lands on the bottom);
//  - fish MARKS drawn analytically instead of sampled from the depth strips. Every fish in the beam
//    becomes a segment in screen metres (its body projected into the view — the "photograph"):
//      Panoramic (plan view): the body seen from above → a streak along the fish's heading,
//        plus its shadow on the bottom further out along the same ray;
//      Down / Forward (vertical plane): the body projected into the plane → a horizontal dash whose
//        length is the part of the body parallel to the plane (a fish crossing the plane is a dot).
import * as THREE from 'three'
import { depthAt, HALF } from './terrain'
import { fishPose } from './fish'

export const MAX_MARKS = 64
const TERRAIN_N = 512

export function bakeTerrain() {
  const N = TERRAIN_N, H = HALF
  const f32 = new Float32Array(N * N), h16 = new Uint16Array(N * N)
  for (let j = 0; j < N; j++) {
    const z = -H + ((j + 0.5) * 2 * H) / N
    for (let i = 0; i < N; i++) {
      const x = -H + ((i + 0.5) * 2 * H) / N
      const v = depthAt(x, z)
      f32[j * N + i] = v
      h16[j * N + i] = THREE.DataUtils.toHalfFloat(v)
    }
  }
  // u ↔ world x, v ↔ world z; cell centres at (i + 0.5) / N — the shader samples with the same mapping
  const tex = new THREE.DataTexture(h16, N, N, THREE.RedFormat, THREE.HalfFloatType)
  tex.minFilter = tex.magFilter = THREE.LinearFilter
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return { f32, tex, N, H }
}

export function terrainCPU(b, x, z) {
  const { N, H, f32 } = b
  const fx = ((x + H) / (2 * H)) * N - 0.5, fz = ((z + H) / (2 * H)) * N - 0.5
  const i0 = Math.max(0, Math.min(N - 2, Math.floor(fx))), j0 = Math.max(0, Math.min(N - 2, Math.floor(fz)))
  const tx = Math.min(1, Math.max(0, fx - i0)), tz = Math.min(1, Math.max(0, fz - j0))
  const a = f32[j0 * N + i0], c = f32[j0 * N + i0 + 1], d = f32[(j0 + 1) * N + i0], e = f32[(j0 + 1) * N + i0 + 1]
  return (a * (1 - tx) + c * tx) * (1 - tz) + (d * (1 - tx) + e * tx) * tz
}

export function makeMarksTexture() {
  const data = new Float32Array(MAX_MARKS * 4 * 4)
  const tex = new THREE.DataTexture(data, MAX_MARKS, 4, THREE.RGBAFormat, THREE.FloatType)
  tex.minFilter = tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return { data, tex }
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
// Panoramic beam response vs depression angle (rad): main lobe ≈ 5°–25° (installed 5° down, 20° thick),
// sidelobes fading out to ≈ 60° — the app's lake frames show bottom and fish right up to the apex
export const panoLobe = (g) => smooth(0.01, 0.07, g) * (1 - 0.55 * smooth(0.52, 1.13, g))

const pose = {}, pose0 = {}
const cand = []
// The app blends consecutive pings (persistence), so a moving fish is drawn as the path it swam over
// the last ~0.7 s: a streak along its heading, brightest mid-way, pointed ends (§7.13). Schools
// therefore show parallel streaks; a hovering fish is just its body.
const PERSIST = 0.7
// Fills the marks texture. Rows: 0 = segment (x0,y0,x1,y1) in screen metres; 1 = (halfWidth, strength,
// fan, seed); 2 = shadow blotch (cx, cy, half-axis along the ray, half-axis across); 3 = (0, 0, hasShadow, 0).
export function computeMarks({ pop, t, specs, apex, flat, bake, rangeM }, marks) {
  cand.length = 0
  if (!pop || !specs.length) return 0
  const zt = -apex.y // transducer depth below the surface
  for (const f of pop) {
    const o = fishPose(f, t, pose)
    const o0 = fishPose(f, t - PERSIST, pose0)
    // big fish bloom: a strong echo spills into neighbouring beams and range cells, so a big fish paints a
    // mark larger than its body (Jason 2026-09-24: 下面有一条大鱼 … 声纳上面显示也要再大一点). Bait and
    // panfish stay true size; a 1.1 m+ musky ×1.9.
    const L = f.len * (1 + 0.9 * smooth(0.3, 1.1, f.len))
    const dirx = Math.cos(o.heading), dirz = -Math.sin(o.heading)
    // trail endpoints (world x, z) with the body added at both ends along the swim direction
    let tx = o.x - o0.x, tz = o.z - o0.z; const tl = Math.hypot(tx, tz)
    if (tl > 1e-4) { tx /= tl; tz /= tl } else { tx = dirx; tz = dirz }
    const ax0 = o0.x - tx * L / 2, az0 = o0.z - tz * L / 2, ay0 = o0.y
    const ax1 = o.x + tx * L / 2, az1 = o.z + tz * L / 2
    const dx = o.x - apex.x, dy = o.y - apex.y, dz = o.z - apex.z
    const rl = Math.hypot(dx, dy, dz)
    if (rl < 0.3 || rl > rangeM * 1.05) continue
    const seed = (Math.abs(f.phase) * 7.13) % 1
    const size = Math.min(1.45, Math.max(0.55, Math.sqrt(L / 0.4)))
    // aspect: how broadside the body is to the ray (1 = broadside, 0 = head-on)
    const along = (dirx * dx + dirz * dz) / rl
    const aspect = Math.sqrt(Math.max(0, 1 - along * along))
    // head-on fish wink in and out ping to ping (the app's small marks flicker)
    const wink = 1 - (1 - aspect) * 0.4 * (0.5 + 0.5 * Math.sin(t * 7.3 + seed * 40))
    if (flat) {
      const d = Math.hypot(dx, dz)
      if (d > rangeM * 1.02) continue
      const bearing = Math.atan2(dz, dx)
      const half = (specs[0].a1 - specs[0].a0) / 2
      if (Math.abs(bearing) > half + 0.04) continue
      const zf = -o.y
      const lobe = panoLobe(Math.atan2(zf - zt, d))
      if (lobe < 0.04) continue
      // plan view: screen x = starboard (+z), screen y = forward (+x) — the swept body from above
      const m = { x0: az0 - apex.z, y0: ax0 - apex.x, x1: az1 - apex.z, y1: ax1 - apex.x, hw: 0.07 * L + 0.03, s: Math.min(1.5, 1.8 * size * lobe * (0.72 + 0.28 * aspect) * wink * (0.55 + 0.45 * seed)), fan: 0, seed, sh: 0 }
      // shadow: the ray transducer → fish continues down and meets the bottom at plan distance s;
      // central projection from the transducer scales the silhouette by k = s / d
      const rx = dx / d, rz = dz / d
      for (let s = d + 0.25; s < Math.min(d * 5, rangeM * 1.4); s += 0.3) {
        const rayDepth = zt + ((zf - zt) * s) / d
        if (rayDepth >= terrainCPU(bake, apex.x + rx * s, apex.z + rz * s)) {
          // only the current body casts the shadow: a rounded blotch at the body's image on the bottom
          // (central projection from the transducer, scale k), longer along the ray (the fish's height)
          const k = s / d, rhx = dz / d, rhy = dx / d
          const tang = Math.abs(dirz * rhy - dirx * rhx) * L / 2          // body half-extent across the ray
          m.sx0 = dz * k; m.sy0 = dx * k                                   // blotch centre (screen metres)
          m.sx1 = Math.min(1.6, (0.15 + 0.3 * L) * k + 0.15)               // half-axis along the ray
          m.sy1 = Math.min(1.0, (tang + 0.06) * k + 0.04)                  // half-axis across the ray
          m.sh = 1
          break
        }
      }
      cand.push(m)
    } else {
      const X = dx, Y = -dy // vertical plane: screen x = forward (+x), screen y = depth below the apex
      specs.forEach((sp, k) => {
        const centre = Math.atan2(sp.frame.c.x, -sp.frame.c.y), half = (sp.a1 - sp.a0) / 2
        if (Math.abs(Math.atan2(X, Y) - centre) > half + 0.03) return
        const u = X * sp.frame.c.x - Y * sp.frame.c.y // distance along the fan centre
        const halfThick = Math.max(0.08, u * Math.tan(sp.theta))
        const q = dz / halfThick
        if (Math.abs(q) > 1.25) return
        const wz = Math.exp(-0.8 * q * q * q * q) // beam pattern across the slab: flat inside, falling off at the edges
        // the swept body projected into the vertical plane (x forward, y depth below the apex)
        // half-thickness ≈ the body depth (≈ 0.25 L): near fish are solid blobs, far fish thin dashes
        cand.push({ x0: ax0 - apex.x, y0: -(ay0 - apex.y), x1: ax1 - apex.x, y1: Y, hw: 0.15 * L + 0.015, s: Math.min(1.4, 1.6 * size * wz * (0.5 + 0.5 * aspect) * wink * (0.7 + 0.3 * seed)), fan: k, seed, sh: 0 })
      })
    }
  }
  cand.sort((a, b) => b.s - a.s)
  const n = Math.min(MAX_MARKS, cand.length)
  const D = marks.data, W = MAX_MARKS * 4
  D.fill(0)
  for (let i = 0; i < n; i++) {
    const m = cand[i], o = i * 4
    D[o] = m.x0; D[o + 1] = m.y0; D[o + 2] = m.x1; D[o + 3] = m.y1
    D[W + o] = m.hw; D[W + o + 1] = m.s; D[W + o + 2] = m.fan; D[W + o + 3] = m.seed
    if (m.sh) {
      D[2 * W + o] = m.sx0; D[2 * W + o + 1] = m.sy0; D[2 * W + o + 2] = m.sx1; D[2 * W + o + 3] = m.sy1
      D[3 * W + o + 2] = 1
    }
  }
  marks.tex.needsUpdate = true
  return n
}
