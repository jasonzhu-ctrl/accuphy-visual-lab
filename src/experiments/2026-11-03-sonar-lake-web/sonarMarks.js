// CPU side of the sonar picture (docs/sonar-style.md §7.13):
//  - a baked terrain depth texture (Panoramic's floor, #178, and the far bottom of the vertical views);
//  - fish MARKS drawn analytically: since #170 only the ice page's jig and the dev aid ?fish=marks (vertical views; the
//    fish are drawn from their bodies, #153). Every fish in the beam becomes a segment in screen metres: its body as the
//    sonar sees it NOW (not the path it swam), which the shader turns into the image a formed beam makes of it
//    (sonarShader.js fishEcho, decision #120): the body projected into the vertical plane (a fish crossing it is a point).
//    (Panoramic's plan-view marks went with the plan view, #178.)
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
  const h16 = new Uint16Array(N * N)
  for (let j = 0; j < N; j++) {
    const z = -H + ((j + 0.5) * 2 * H) / N
    for (let i = 0; i < N; i++) {
      const x = -H + ((i + 0.5) * 2 * H) / N
      const v = depthAt(x, z)
      h16[j * N + i] = THREE.DataUtils.toHalfFloat(v)
    }
  }
  // u ↔ world x, v ↔ world z; cell centres at (i + 0.5) / N — the shader samples with the same mapping
  const tex = new THREE.DataTexture(h16, N, N, THREE.RedFormat, THREE.HalfFloatType)
  tex.minFilter = tex.magFilter = THREE.LinearFilter
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return { tex, N, H }
}

export function makeMarksTexture() {
  const data = new Float32Array(MAX_MARKS * MARK_ROWS * 4)
  const tex = new THREE.DataTexture(data, MAX_MARKS, MARK_ROWS, THREE.RGBAFormat, THREE.FloatType)
  tex.minFilter = tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return { data, tex }
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

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
export function computeMarks({ jig, pop, t, specs, apex, flat, rangeM }, marks) {
  cand.length = 0
  if (!pop || !specs.length) return 0
  for (const f of pop) {
    const o = fishPose(f, t, pose)
    const dx = o.x - apex.x, dy = o.y - apex.y, dz = o.z - apex.z
    const rl = Math.hypot(dx, dy, dz)
    if (flat || rl < 0.3 || rl > rangeM * 1.05) continue // (Panoramic draws its fish from their bodies, #178)
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
      const deep = Math.min(1, Math.max(0, (Math.hypot(X, Y) - 13) / 14)) // a lead head is a strong target: deep it still reads (#172)
      cand.push({ a: [X, y0, X, Y], g: null, hw: 0.08, s: JIG_S * (1 + 1.2 * deep), fan: k, seed: 0.37, sh: 0, legacy: 1, aspect: 1 })
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
