// CPU side of the sonar picture (docs/sonar-style.md §7.13):
//  - a baked terrain depth texture, used by the Panoramic plan-view renderer (and a Float32 copy for
//    CPU lookups, e.g. where a fish's acoustic shadow lands on the bottom);
//  - fish MARKS drawn analytically instead of sampled from the depth strips. Every fish in the beam
//    becomes a segment in screen metres: its body as the sonar sees it NOW (not the path it swam), which
//    the shader turns into the image a formed beam makes of it (sonarShader.js fishEcho, decision #120):
//      Panoramic (plan view): the body seen from above, plus its shadow on the bottom further out along the ray;
//      Down / Forward (vertical plane): the body projected into the plane (a fish crossing the plane is a point).
//    Along the ray only the swim bladder's depth shows, across it the whole flank; the shader smears both by the
//    beam (a fixed angle) and the pulse, so far fish become needles along the arc and near ones show their body.
import * as THREE from 'three'
import { depthAt, HALF } from './terrain'
import { fishPose } from './fish'

export const MAX_MARKS = 64
export const MARK_ROWS = 5 // texture rows per mark (see computeMarks)
// Panoramic picture half-width in units of the range (screenLayout: h = 0.9 R, w = h × 2.08 aspect)
export const panoHalfWidth = 0.45 * 2.08
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
  const data = new Float32Array(MAX_MARKS * MARK_ROWS * 4)
  const tex = new THREE.DataTexture(data, MAX_MARKS, MARK_ROWS, THREE.RGBAFormat, THREE.FloatType)
  tex.minFilter = tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return { data, tex }
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
// Panoramic coverage vs depression angle (rad): the flat fan is installed 5° down and 20° thick, so it covers
// 5°–25° below the transducer (soft edges 2°–6° and 23°–28°). Only what lies in that slab — the same slab the
// 3D curtain draws — shows on the screen (Jason 2026-09-24: 没有在探测的coverage里的东西是不会显示的). The old
// response kept ~50 % out to 60° and let deep things the curtain never reaches (the wreck) show.
// Plus a sidelobe below the slab (Jason 2026-09-24: 要的 但是要好 — the app's lake recordings show bottom close to the
// boat): ≈ 0.8 of the main response from 25° down, fading out by 60°, so the bottom continues toward the boat a
// little darker and only the patch right under the transducer stays dark. The 3D curtain still draws the main slab.
export const PANO_SIDELOBE = 0.8
export const panoLobe = (g) => smooth(0.035, 0.105, g) * (1 - smooth(0.4, 0.49, g)) + PANO_SIDELOBE * smooth(0.4, 0.49, g) * (1 - smooth(0.62, 1.05, g))

const pose = {}, pose0 = {}
const cand = []
// The app blends consecutive pings (persistence): the echo of ~0.2 s ago still glows faintly behind a moving fish.
// Until #120 the mark was the whole path of the last 0.7 s, which made every swimming fish a smooth oval along
// screen x (Jason 2026-10-23: 鱼在游动也好 … 转身也好 … 不动的时候 … 椭圆的球形).
const GHOST_DT = 0.2, GHOST_A = 0.22
// The body as the beam images it: [tail x, y, head x, y] in screen metres (apex at 0):
// (cx, cy) the body's centre, (ex, ey) its axis projected into the screen (length ≤ 1), L its length. Along the ray
// the body is a head-on target: the swim bladder and weaker head and tail peaks (the shader's profile), a little
// shorter than the body; across the ray it is the flank.
function bodySeg(cx, cy, ex, ey, L, wag) {
  const r = Math.hypot(cx, cy) || 1, rx = cx / r, ry = cy / r
  const ar = (ex * rx + ey * ry) * L, atx = ex * L - ar * rx, aty = ey * L - ar * ry
  const hx = 0.5 * (atx + 0.6 * ar * rx), hy = 0.5 * (aty + 0.6 * ar * ry)
  // the tail beat bends the rear half a little (visible on near, broadside fish)
  const hl = Math.hypot(hx, hy) || 1, wx = (-hy / hl) * wag, wy = (hx / hl) * wag
  return [cx - hx + wx, cy - hy + wy, cx + hx, cy + hy]
}
// Fills the marks texture. Rows: 0 = body (tail x, y, head x, y) in screen metres; 1 = (body half-width, strength,
// fan, seed); 2 = shadow blotch (cx, cy, half-axis along the ray, half-axis across); 3 = (activity 0..1, or -1 for
// the legacy capsule; aspect; hasShadow; ghost strength); 4 = the ghost: the body 0.2 s ago (tail x, y, head x, y).
const JIG_S = (() => { const m = typeof window !== 'undefined' && /jigs=([\d.]+)/.exec(window.location.search); return m ? +m[1] : 0.6 })() // dev aid ?jigs=
export function computeMarks({ jig, pop, t, specs, apex, flat, bake, rangeM }, marks) {
  cand.length = 0
  if (!pop || !specs.length) return 0
  const zt = -apex.y // transducer depth below the surface
  for (const f of pop) {
    const o = fishPose(f, t, pose)
    const dx = o.x - apex.x, dy = o.y - apex.y, dz = o.z - apex.z
    const rl = Math.hypot(dx, dy, dz)
    if (rl < 0.3 || rl > rangeM * (flat ? 1.45 : 1.05)) continue // Panoramic's picture runs to its corners (≈ 1.37 R)
    const o0 = fishPose(f, t - GHOST_DT, pose0)
    // big fish bloom: a strong echo spills into neighbouring beams and range cells, so a big fish paints a
    // mark larger than its body (Jason 2026-09-24: 下面有一条大鱼 … 声纳上面显示也要再大一点). Bait and
    // panfish stay true size; a 1.1 m+ musky ×1.9.
    const L = f.len * (1 + 0.9 * smooth(0.3, 1.1, f.len))
    const cp = Math.cos(o.pitch || 0), bx = Math.cos(o.heading) * cp, by = Math.sin(o.pitch || 0), bz = -Math.sin(o.heading) * cp
    const cp0 = Math.cos(o0.pitch || 0), bx0 = Math.cos(o0.heading) * cp0, by0 = Math.sin(o0.pitch || 0), bz0 = -Math.sin(o0.heading) * cp0
    const seed = (Math.abs(f.phase) * 7.13) % 1
    const size = Math.min(1.45, Math.max(0.55, Math.sqrt(L / 0.4)))
    // aspect: how broadside the body is to the ray (1 = broadside, 0 = head-on). A broadside fish returns ~17–20 dB
    // more than a head-on one (fisheries target-strength data): head-on fish go faint ("ghostly"), turning
    // broadside lights them up. Until #120 the swing was only ×2.
    const along = (bx * dx + by * dy + bz * dz) / rl
    const aspect = Math.sqrt(Math.max(0, 1 - along * along))
    const aGain = 0.18 + 0.82 * aspect * aspect
    // activity: a calm fish's echo is steady ping to ping, a swimming or turning one swings widely
    let turn = Math.abs(o.heading - o0.heading) % (2 * Math.PI); turn = Math.min(turn, 2 * Math.PI - turn)
    const act = Math.min(1, (o.speed || 0) / 0.8 + turn / 0.35)
    // the tail beat: a small wag of the rear half, and a little more echo when the flank is bent toward the beam
    const beat = Math.sin(t * (13 + 9 * seed) + seed * 40) // 2–3.5 Hz
    const wag = 0.1 * L * (0.3 + 0.7 * Math.min(1, (o.speed || 0) / 0.5)) * beat
    const flex = 0.9 + 0.1 * beat
    const bw = 0.11 * L + 0.01 // half the body's depth
    if (flat) {
      const d = Math.hypot(dx, dz)
      if (dx > rangeM * 1.01 || Math.abs(dz) > panoHalfWidth * rangeM) continue // outside the picture (and the curtain)
      const bearing = Math.atan2(dz, dx)
      const half = (specs[0].a1 - specs[0].a0) / 2
      if (Math.abs(bearing) > half + 0.04) continue
      const zf = -o.y
      const lobe = panoLobe(Math.atan2(zf - zt, d))
      if (lobe < 0.04) continue
      // plan view: screen x = starboard (+z), screen y = forward (+x) — the body seen from above
      const m = { a: bodySeg(dz, dx, bz, bx, L, wag), g: bodySeg(o0.z - apex.z, o0.x - apex.x, bz0, bx0, L, 0), hw: bw, s: Math.min(1.5, 1.8 * size * lobe * (0.45 + 0.55 * aGain) * flex * (0.55 + 0.45 * seed)), fan: 0, seed, aspect, act, sh: 0, legacy: 0 }
      // shadow: the ray transducer → fish continues down and meets the bottom at plan distance s;
      // central projection from the transducer scales the silhouette by k = s / d
      const rx = dx / d, rz = dz / d
      for (let s = d + 0.25; s < Math.min(d * 5, rangeM * 1.4); s += 0.3) {
        const rayDepth = zt + ((zf - zt) * s) / d
        if (rayDepth >= terrainCPU(bake, apex.x + rx * s, apex.z + rz * s)) {
          // only the current body casts the shadow: a rounded blotch at the body's image on the bottom
          // (central projection from the transducer, scale k), longer along the ray (the fish's height)
          const k = s / d, rhx = dz / d, rhy = dx / d
          const tang = Math.abs(bz * rhy - bx * rhx) * L / 2               // body half-extent across the ray
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
        // the body's axis in the plane: x forward, y down
        cand.push({ a: bodySeg(X, Y, bx, -by, L, wag), g: bodySeg(o0.x - apex.x, -(o0.y - apex.y), bx0, -by0, L, 0), hw: bw, s: Math.min(1.5, 2.1 * size * wz * aGain * flex * (0.7 + 0.3 * seed)), fan: k, seed, aspect, act, sh: 0, legacy: 0 })
      })
    }
  }
  // the ice page's jig (IceCamp s.jig): a small, faint mark like a little baitfish, with a short trail as it pops and
  // falls — on jet it lands in the cyan-green, never the red of the bottom (tuned by eye against the dial). It keeps
  // the old capsule mark (legacy): the dial and the Live Ice view were tuned on it.
  if (jig && !flat) {
    const X = jig.x - apex.x, Y = -(jig.y - apex.y), dz = jig.z - apex.z
    specs.forEach((sp, k) => {
      const centre = Math.atan2(sp.frame.c.x, -sp.frame.c.y), half = (sp.a1 - sp.a0) / 2
      if (Y <= 0.3 || Math.abs(Math.atan2(X, Y) - centre) > half + 0.03) return
      const u = X * sp.frame.c.x - Y * sp.frame.c.y
      if (Math.abs(dz) > Math.max(0.08, u * Math.tan(sp.theta)) * 1.25) return
      // a 4 cm spoon is far below a range cell: the app paints it as a short dash ~ a beam wide and a cell or two tall,
      // so the mark gets a minimum size (hw 8 cm, 15 cm tall) plus the trail of its last pop
      const y0 = Math.min(-(jig.yPrev - apex.y), Y - 0.15)
      cand.push({ a: [X, y0, X, Y], g: null, hw: 0.08, s: JIG_S, fan: k, seed: 0.37, sh: 0, legacy: 1, aspect: 1 })
    })
  }
  cand.sort((a, b) => b.s - a.s)
  const n = Math.min(MAX_MARKS, cand.length)
  const D = marks.data, W = MAX_MARKS * 4
  D.fill(0)
  for (let i = 0; i < n; i++) {
    const m = cand[i], o = i * 4
    for (let j = 0; j < 4; j++) D[o + j] = m.a[j]
    D[W + o] = m.hw; D[W + o + 1] = m.s; D[W + o + 2] = m.fan; D[W + o + 3] = m.seed
    if (m.sh) { D[2 * W + o] = m.sx0; D[2 * W + o + 1] = m.sy0; D[2 * W + o + 2] = m.sx1; D[2 * W + o + 3] = m.sy1 }
    D[3 * W + o] = m.legacy ? -1 : m.act; D[3 * W + o + 1] = m.aspect; D[3 * W + o + 2] = m.sh; D[3 * W + o + 3] = m.legacy ? 0 : GHOST_A
    if (m.g) for (let j = 0; j < 4; j++) D[4 * W + o + j] = m.g[j]
  }
  marks.tex.needsUpdate = true
  return n
}
