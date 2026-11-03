// The shore round the lake (Jason 2026-11-02, "isn't it the same lake?"; 界面设计's handover
// docs/2026-11-02-shoreline-design-handover.md): one shoreline for the summer lake and the ice page, the same geometry in
// both, only the materials change with the season. Everything here is above the water (or the ice) and hidden from the
// sonar (Shore.jsx puts it on SONAR_HIDE_LAYER); the rising bottom under the water is part of the lakebed (terrain.js).
// Premium rule (#205): no cone-stack trees, no flat colour — conifers of drooping needle sprays, ground with fine grain,
// soft contact shading baked in, a wet band at the summer waterline, snow thickness and shore ice in winter.
import * as THREE from 'three'
import { makeRockGeometry, ROCK_KINDS } from './rocks'
import { shoreR, bedY } from './terrain'

const TAU = Math.PI * 2
const fract = (v) => v - Math.floor(v)
const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453)
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
function fbm(x, y, oct = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f); f *= 2.03; a *= 0.5 } return s / (1 - Math.pow(0.5, oct)) }
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const lerp = (a, b, k) => a + (b - a) * k
let seed = 1
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const C = (hex) => new THREE.Color(hex) // colours as authored (sRGB hex), three converts
const mixc = (a, b, k) => a.clone().lerp(b, Math.min(1, Math.max(0, k)))

// ---- the land's height across the shore. d: metres from the waterline (≥ 0 on land), t: the angle round the lake ----
// (handover §2): beach 0.16 m per metre to 0.36 m, a bank of ~1.25 m (±0.45) from 2.2 to 6.5 m, then land rising slowly with
// rolls. Winter lays 0.22 m of snow over it from the beach up (the snow's thickness shows at the bank).
export function landY(d, t, winter) {
  const beach = Math.min(d * 0.16, 0.36)
  const bank = sm(2.2, 6.5, d) * (1.25 + 0.9 * (fbm(t * 23, 3.1, 3) - 0.5))
  const land = sm(6, 60, d) * 1.6 + (fbm(t * 9, d * 0.05, 4) - 0.5) * 0.9 * sm(8, 30, d)
  return beach + bank + land + (winter ? 0.22 * sm(0.25, 2.2, d) : 0)
}
// The zones along the shore (界面设计's look check of 6c803dd: one even sand ribbon round the lake read as a drawn outline):
// the sand's width wanders 0.4–3 m; in stretches (~25 % of the shore) there is no sand at all and grass, reeds or rocks run to
// the water; the wet line has its own, quicker wobble, so it is never parallel to the grass edge. Winter: the shore-ice rim
// and the snowbank's foot wander the same way.
export function shoreZones(t) {
  const none = fbm(t * 7 + 11, 2.3, 3) > 0.6
  const sand = none ? 0 : 0.4 + 2.6 * Math.pow(Math.min(1, Math.max(0, (fbm(t * 11 + 3, 0.5, 3) - 0.28) / 0.44)), 1.3)
  const wet = none ? 0.18 + 0.2 * fbm(t * 55 + 2, 4.4, 3) : Math.min(sand * 0.9, 0.15 + 0.85 * fbm(t * 48 + 5, 1.1, 3))
  const rim = 0.45 + 1.3 * fbm(t * 13 + 7, 3.3, 3), foot = 0.25 + 1.6 * fbm(t * 9 + 1.7, 6.1, 3)
  return { none, sand, wet, rim, foot }
}
const PROF = [-0.6, -0.3, -0.12, 0, 0.12, 0.28, 0.48, 0.72, 1.0, 1.35, 1.75, 2.2, 2.75, 3.4, 4.1, 4.9, 5.8, 6.8, 8, 9.5, 11.5, 14, 17, 21, 26, 32, 40, 50, 62, 78, 98, 125, 160, 200, 260, 340, 440] // out past the fog (ice: far 300 m; lake: 420 m), so no water or ice shows behind the trees

// ---- trees (handover §3): 7–47 m back, small in front, tall behind, in groups with clearings ----
export function placeTrees(n = 1, R = shoreR) {
  seed = 5531
  const out = []
  for (let i = 0; i < 3000; i++) {
    const t = rnd() * TAU, grp = fbm(t * 14, 1.7, 4)
    if (grp < 0.42 && rnd() < 0.8) { rnd(); rnd(); rnd(); rnd(); continue }
    const d = 7 + Math.pow(rnd(), 0.75) * 40, near = sm(7, 22, d)
    const h = lerp(2.2 + rnd() * 2.8, 5 + rnd() * 8, near) * (0.78 + 0.45 * grp)
    const k = rnd(), w = 0.72 + rnd() * 0.56
    if (fbm(t * 5 + 2, d * 0.04, 3) < 0.38) continue // clearings
    const rank = rnd() // the density budget keeps the trees with rank < density (the same set ?trees= always chose)
    if (rank > n) continue
    const r = R(t) + d
    out.push({ t, d, x: r * Math.cos(t), z: r * Math.sin(t), h, w, k, rank, rot: rnd() * TAU, lean: [(rnd() - 0.5) * 0.07, (rnd() - 0.5) * 0.07] })
  }
  return out
}

// ---- the ground strip round the lake: from just under the waterline out into the fog ----
// vertex colour = the zone (wet sand, sand, grass, forest floor; or ice rim, snow, shaded snow), times baked contact shade
// under the trees; aZone (x: wet band, y: shade) feeds the material's fine detail.
// target, i0, i1: recolour that ground over strips i0…i1 only (the contact shade after the tree budget drops some trees;
// Shore.jsx spreads it over a few frames)
export function makeGround(trees, winter, R = shoreR, N = 1400, target = null, i0 = 0, i1 = N) {
  const M = PROF.length, cnt = (N + 1) * M
  const pos = target ? target.attributes.position.array : new Float32Array(cnt * 3), col = target ? target.attributes.color.array : new Float32Array(cnt * 3), zone = target ? target.attributes.aZone.array : new Float32Array(cnt * 2)
  // trees binned by angle, for the contact shade
  const BINS = 720, bins = Array.from({ length: BINS }, () => [])
  for (const tr of trees) bins[Math.floor((tr.t / TAU) * BINS) % BINS].push(tr)
  const S = winter
    ? { rim: C('#c4d6e6'), rim2: C('#e2ecf6'), snow: C('#eef2f8'), shade: C('#c8d4e6'), forest: C('#b9c6da') }
    : { wet: C('#5e5544'), sand: C('#b2a484'), sand2: C('#9c8f70'), grass: C('#566e40'), grass2: C('#687a48'), floor: C('#3a4630'), floor2: C('#4a4a34') }
  const c = new THREE.Color()
  for (let i = i0; i <= i1; i++) {
    const t = (i / N) * TAU, r0 = R(t), cs = Math.cos(t), sn = Math.sin(t)
    for (let j = 0; j < M; j++) {
      const jit = j > 2 && j < M - 1 ? (fbm(t * 30, j * 0.7, 3) - 0.5) * 0.3 * Math.min(1, PROF[j] / 3) : 0
      const d = PROF[j] + jit, r = r0 + d, k = i * M + j
      const x = r * cs, z = r * sn
      if (!target) { pos[k * 3] = x; pos[k * 3 + 1] = d < 0 ? bedY(x, z) + 0.015 : landY(d, t, winter); pos[k * 3 + 2] = z } // under the water: on the lakebed's own rise (terrain.js)
      const n1 = fbm(t * 60, d * 0.4, 3), n2 = fbm(t * 13 + 5, d * 0.08, 3)
      // contact shade (soft AO) from the trees near this point, darkest at the trunk
      let ao = 0
      if (d > 4) {
        const b0 = Math.floor((t / TAU) * BINS)
        for (let db = -4; db <= 4; db++) for (const tr of bins[(b0 + db + BINS) % BINS]) {
          const q = Math.hypot(tr.x - x, tr.z - z) / (tr.h * tr.w * 0.34 + 0.6)
          if (q < 1.6) ao += (1 - sm(0.15, 1.6, q)) * 0.42
        }
      }
      ao = Math.min(0.62, ao)
      let wet = 0
      const Z = shoreZones(t)
      if (winter) {
        if (d < Z.foot * 0.5) c.copy(mixc(S.rim, S.rim2, n1)) // the shore ice reaching up under the snow's foot
        else c.copy(mixc(S.snow, S.shade, 0.18 + 0.45 * n2 * sm(4, 12, d) + 0.25 * sm(2.2, 4.5, d) * (1 - sm(4.5, 7, d)))) // the bank's face in shadow
        if (d > 12) c.lerp(S.forest, 0.35 * sm(12, 30, d))
      } else {
        const sandEnd = Z.sand + 0.35 * (n1 - 0.5) // the grass edge, ragged
        if (d < Z.wet) { c.copy(Z.none ? mixc(S.wet, S.floor2, 0.5) : mixc(S.wet, S.sand, sm(Z.wet * 0.3, Z.wet, d) * 0.85)); wet = 1 - sm(Z.wet * 0.25, Z.wet, d) }
        else if (d < sandEnd + 0.7) c.copy(mixc(mixc(S.sand, S.sand2, n1 * 0.6), mixc(S.grass, S.grass2, n2), sm(sandEnd - 0.3, sandEnd + 0.7, d) * (0.55 + 0.45 * n1)))
        else c.copy(mixc(mixc(S.grass, S.grass2, n2), mixc(S.floor, S.floor2, n1), sm(8, 20, d) * (0.55 + 0.45 * n1)))
      }
      c.multiplyScalar(1 - ao * (winter ? 0.55 : 0.75))
      col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b
      zone[k * 2] = wet; zone[k * 2 + 1] = ao
    }
  }
  if (target) { target.attributes.color.needsUpdate = true; target.attributes.aZone.needsUpdate = true; return target }
  const idx = []
  for (let i = 0; i < N; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = (i + 1) * M + j; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aZone', new THREE.BufferAttribute(zone, 2))
  g.setIndex(idx); g.computeVertexNormals()
  return g
}

// the winter shore ice: a slightly raised, cracked rim where the lake ice meets the bank (d −1.2 … 0.5)
export function makeShoreIce(R = shoreR, N = 1400) {
  const P = [-1.4, -0.9, -0.45, 0, 0.35, 0.6], M = P.length
  const pos = new Float32Array((N + 1) * M * 3)
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * TAU, r0 = R(t)
    for (let j = 0; j < M; j++) {
      const Z = shoreZones(t), d = P[j] < 0 ? P[j] * Z.rim : P[j] * (0.6 + 0.8 * Z.foot), r = r0 + d, k = (i * M + j) * 3
      const lift = j === 0 ? 0.004 : 0.03 + 0.05 * sm(-1.4, 0, d) + 0.04 * (fbm(t * 90, d * 2, 3) - 0.5) * (j < M - 1 ? 1 : 0)
      pos[k] = r * Math.cos(t); pos[k + 1] = j === M - 1 ? landY(d, t, true) - 0.02 : lift; pos[k + 2] = r * Math.sin(t)
    }
  }
  const idx = []
  for (let i = 0; i < N; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = (i + 1) * M + j; idx.push(a, b, a + 1, b, b + 1, a + 1) }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals()
  return g
}

// ---- a conifer of needle sprays: a tapering trunk and whorls of drooping branches, each branch two crossed cards of
// the spray texture (so it reads from above and from ice level), denser and shorter up the crown; no two alike. Normals
// are bent outward and up from the axis, so the crown shades as one soft volume. Colour: dark inside, lighter tips;
// aSnow marks the upper faces of the branches for winter (the winter material lays snow there, not a white tint).
// lite: the back rows (≥ 24 m from the water, seen small through the fog): two-thirds of the whorls, the same silhouette
export function makeConifer(variant, lite = false) {
  seed = 9100 + variant * 977
  const pos = [], nrm = [], uv = [], col = [], snow = []
  const shape = [ // crown profiles: spruce (narrow), fir (dense), pine-ish (open lower crown)
    { whorls: 15, per: 5, len: 0.31, top: 0.985, droop: 0.12, base: 0.1 },
    { whorls: 17, per: 6, len: 0.27, top: 0.99, droop: 0.08, base: 0.08 },
    { whorls: 13, per: 5, len: 0.34, top: 0.975, droop: 0.16, base: 0.16 },
    { whorls: 16, per: 5, len: 0.29, top: 0.985, droop: 0.1, base: 0.12 },
  ][variant % 4]
  const inner = new THREE.Color('#ffffff'), v = new THREE.Vector3()
  const push = (p, n, u, vv, shade, sn) => { pos.push(p.x, p.y, p.z); nrm.push(n.x, n.y, n.z); uv.push(u, vv); col.push(shade, shade, shade); snow.push(sn) }
  // trunk: bark, 10 sides, tapering, a slight bend
  const TR = 10, TS = 6
  for (let s = 0; s < TS; s++) for (let a = 0; a < TR; a++) {
    for (const [ds, da] of [[0, 0], [1, 0], [0, 1], [1, 0], [1, 1], [0, 1]]) {
      const y = ((s + ds) / TS) * 0.62, ang = ((a + da) / TR) * TAU, rr = 0.022 * (1 - y * 0.9) + 0.003
      const bx = Math.sin(y * 3 + variant) * 0.008
      push(v.set(Math.cos(ang) * rr + bx, y, Math.sin(ang) * rr), new THREE.Vector3(Math.cos(ang), 0.15, Math.sin(ang)).normalize(), 0.02 + 0.06 * ((a + da) / TR), 0.02 + 0.02 * ((s + ds) / TS), -0.35, 0) // u < 0.1: the bark strip of the atlas
    }
  }
  const card = (ox, oy, oz, dir, side, L, W, tilt, droop, shade0) => {
    // a card from the branch's root along dir (horizontal unit), length L, tilted by `tilt` about its own axis, drooping
    const SEG = 2, up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3(dir.x, 0, dir.z).normalize()
    const sideV = new THREE.Vector3().crossVectors(up, d).normalize()
    const wv = sideV.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(up, Math.sin(tilt)) // the card's width axis
    const rows = []
    for (let s = 0; s <= SEG; s++) {
      const u = s / SEG, along = u * L, drop = droop * L * u * u - 0.06 * L * u
      const c0 = new THREE.Vector3(ox, oy, oz).addScaledVector(d, along).addScaledVector(up, -drop)
      const half = W * (0.35 + 0.65 * Math.sin(Math.min(1, u * 1.15) * Math.PI * 0.62)) * 0.5
      rows.push([c0.clone().addScaledVector(wv, -half), c0.clone().addScaledVector(wv, half), u])
    }
    for (let s = 0; s < SEG; s++) {
      const [a0, a1, u0] = rows[s], [b0, b1, u1] = rows[s + 1]
      const quad = [[a0, u0, 0], [b0, u1, 0], [a1, u0, 1], [b0, u1, 0], [b1, u1, 1], [a1, u0, 1]]
      for (const [p, uu, vv] of quad) {
        // the crown's soft normal: out from the axis and up, with a little of the card's own facing
        const out = new THREE.Vector3(p.x, 0, p.z); const rr = out.length(); out.normalize()
        const n = out.multiplyScalar(0.75).add(new THREE.Vector3(0, 0.55 + 0.25 * (p.y - 0.5), 0)).normalize()
        const shade = shade0 * (0.55 + 0.45 * Math.min(1, rr / 0.22)) // darker toward the trunk (self-shadow)
        push(p, n, 0.1 + uu * 0.9, side + vv * 0.5, shade, Math.max(0, Math.sin(tilt) * side * 2 - 0.5) + 0.35 * uu) // aSnow: the card's upper face
      }
    }
  }
  const { per, len, top, droop, base } = shape, whorls = lite ? Math.round(shape.whorls * 0.66) : shape.whorls
  for (let w = 0; w < whorls; w++) {
    const u = w / (whorls - 1), y = base + u * (top - base - 0.04) + (rnd() - 0.5) * 0.02
    const env = Math.pow(1 - u, 0.92) * (0.85 + rnd() * 0.3) // the crown's cone, uneven
    const L = 0.05 + len * env, count = Math.max(3, Math.round(per * (0.8 + 0.4 * rnd()) * (1 - u * 0.3)))
    const a0 = rnd() * TAU, shade0 = 0.72 + 0.28 * u + (rnd() - 0.5) * 0.12 // lower whorls darker
    for (let b = 0; b < count; b++) {
      if (rnd() < 0.12 && u < 0.85) continue // a missing branch: see-through gaps at the edge
      const ang = a0 + (b / count) * TAU + (rnd() - 0.5) * 0.6, dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang))
      const Lb = L * (0.8 + rnd() * 0.4), Wb = Lb * (0.62 + rnd() * 0.18), dr = droop * (0.7 + rnd() * 0.6) + u * 0.04
      const tl = 0.55 + rnd() * 0.25
      card(0, y, 0, dir, 0, Lb, Wb, tl, dr, shade0) // the spray's two faces: up-tilted and down-tilted, a V along the branch
      card(0, y + 0.004, 0, dir, 0.5, Lb * 0.92, Wb * 0.85, -tl * 0.8, dr, shade0 * 0.92)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setAttribute('aSnow', new THREE.Float32BufferAttribute(snow, 1))
  g.computeBoundingSphere()
  return g
}

// the needle atlas: u 0–0.1 bark, then two sprays (v 0–0.5, 0.5–1) drawn along u. Grey levels only — the tree's colour
// comes from the material (dark inside, lighter tips). Each spray is a ragged, tapering mass of needles (opaque inside so
// it survives the mipmaps at a distance), with side twigs, needle streaks at ~50° and a few see-through gaps.
export function makeNeedleTexture() {
  const W = 512, H = 512, img = new ImageData(W, H), px = img.data
  const put = (x, y, l, a) => { const k = (y * W + x) * 4; px[k] = px[k + 1] = px[k + 2] = l; px[k + 3] = a }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u0 = x / W
    if (u0 < 0.1) { const g = 0.5 + 0.5 * Math.sin(y * 0.55 + 3 * noise(x * 0.3, y * 0.05)); put(x, y, 70 + 40 * g, 255); continue } // bark
    const half = y < H / 2 ? 0 : 1, vv = ((y - half * H / 2) / (H / 2)) * 2 - 1 // −1 … 1 across the spray
    const u = (u0 - 0.1) / 0.9, v = vv
    const rag = 0.12 * (noise(u * 40, v * 8 + half * 9) - 0.5) + 0.08 * (noise(u * 110, v * 30 + half * 5) - 0.5)
    const w = (0.22 + 0.78 * Math.sin(Math.min(1, u * 1.15) * Math.PI * 0.62)) * (0.86 + 0.14 * noise(u * 6, half * 3)) * (1 - 0.25 * Math.pow(u, 6))
    const edge = w + rag - Math.abs(v)
    if (edge < 0 || u > 0.985) { put(x, y, 0, 0); continue }
    // side twigs every ~1/12 of the length, angled forward; needles: fine streaks at ±50° off the twig
    const tw = Math.abs(fract(u * 12 - Math.abs(v) * 0.9 + half * 0.37) - 0.5)
    const streak = 0.5 + 0.5 * Math.sin((u * 260 + (v > 0 ? 1 : -1) * v * 140) + 6 * noise(u * 30, v * 30))
    const hole = noise(u * 34 + 7, v * 11 + half * 13) // a few gaps to see through
    if (hole > 0.8 && Math.abs(v) > 0.18) { put(x, y, 0, 0); continue }
    let l = 150 + 80 * streak * (0.6 + 0.4 * noise(u * 80, v * 20)) - 60 * (1 - Math.min(1, tw * 6)) * Math.max(0, 1 - Math.abs(v) / w) // twigs darker
    l -= 70 * Math.max(0, 0.12 - Math.abs(v)) / 0.12 // the main twig
    l *= 0.72 + 0.28 * Math.min(1, Math.abs(v) / Math.max(0.05, w) + 0.2) // toward the edge: lighter tips
    l *= 0.62 + 0.38 * Math.min(1, edge / 0.09) // the fringe a little darker, so the cards' edges never glow against the ground
    put(x, y, Math.max(20, Math.min(255, l)), Math.round(255 * Math.min(1, edge / 0.045)))
  }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.getContext('2d').putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter
  return tex
}

// grass and reeds at the summer waterline (in winter a few dry reed stems stand out of the snow): crossed blade cards
export function makeTuft(kind) {
  seed = kind === 'reed' ? 77 : 55
  const pos = [], uv = [], col = []
  const blades = kind === 'reed' ? 9 : 10
  for (let i = 0; i < blades; i++) {
    const a = rnd() * TAU, r = rnd() * 0.12, h = (kind === 'reed' ? 0.9 + rnd() * 0.9 : 0.18 + rnd() * 0.26), lean = (rnd() - 0.5) * 0.5, w = kind === 'reed' ? 0.012 : 0.02
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r, dx = Math.cos(a + 1.3), dz = Math.sin(a + 1.3)
    const tipx = bx + Math.cos(a) * lean * h, tipz = bz + Math.sin(a) * lean * h
    const tri = [[bx - dx * w, 0, bz - dz * w], [bx + dx * w, 0, bz + dz * w], [tipx, h, tipz]]
    for (const p of tri) { pos.push(...p); uv.push(0, p[1] / h); const s = 0.55 + 0.45 * (p[1] / h); col.push(s, s, s) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}
export function placeTufts(R = shoreR) {
  seed = 811
  const grass = [], reed = []
  for (let i = 0; i < 26000; i++) {
    const t = rnd() * TAU, patch = fbm(t * 40, 2.2, 3), d = -0.2 + Math.pow(rnd(), 1.6) * 14, s = 0.7 + rnd() * 0.7, rot = rnd() * TAU
    const r = R(t) + d, it = { x: r * Math.cos(t), z: r * Math.sin(t), t, d, s, rot }
    const Z = shoreZones(t)
    if (d > Z.sand + 0.2 && patch > (Z.none ? 0.3 : 0.46)) grass.push(it) // where there is no sand the grass runs to the water
    else if (d < 0.6 && patch > (Z.none ? 0.42 : 0.62) && rnd() < 0.9) reed.push(it)
  }
  return { grass, reed }
}

// rocks along the waterline (§3): in places, mostly small, flattened, sunk into the sand or water. The lake's own boulder
// shapes (rocks.js), lit as dry rock in the air.
export const ROCK_GEOS = () => ROCK_KINDS.map((k, i) => makeRockGeometry(k, 3 + i, 2))
export function placeShoreRocks(R = shoreR) {
  seed = 3301
  const out = []
  for (let i = 0; i < 4200 && out.length < 900; i++) {
    const t = rnd() * TAU, d = -1.4 + rnd() * 3.6, s = 0.2 + Math.pow(rnd(), 2.2) * 0.9, k = Math.floor(rnd() * ROCK_KINDS.length), rot = rnd() * TAU, tilt = (rnd() - 0.5) * 0.3
    if (fbm(t * 26, 9.1, 3) < 0.52 && !(shoreZones(t).none && fbm(t * 70, 2.7, 3) > 0.5)) continue // and clusters where there is no sand
    const r = R(t) + d
    out.push({ x: r * Math.cos(t), z: r * Math.sin(t), t, d, s, k, rot, tilt })
  }
  return out
}

// ---- materials: MeshStandard (the page's lights and fog) with the fine detail added in the shader ----
const NOISE_GLSL = /* glsl */ `
  float shH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float shN(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(shH(i), shH(i + vec2(1, 0)), u.x), mix(shH(i + vec2(0, 1)), shH(i + vec2(1, 1)), u.x), u.y); }
  float shF(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * shN(p); p *= 2.07; a *= 0.5; } return s / 0.9375; }
`
function withWorld(mat, { vertex = '', fragmentHead = '', fragmentColor = '', fragmentRough = '', uniforms = {} }) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vShW;\n${vertex.split('//BODY')[0]}`)
      .replace('#include <worldpos_vertex>', `#include <worldpos_vertex>\n{ vec4 w4 = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n w4 = instanceMatrix * w4;\n#endif\n vShW = (modelMatrix * w4).xyz; }\n${vertex.split('//BODY')[1] || ''}`)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vShW;\n${NOISE_GLSL}\n${fragmentHead}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${fragmentColor}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${fragmentRough}`)
  }
  return mat
}

// the ground: sand grain, grass blades' mottling, forest-floor needles; winter: drift ripples along the wind, sparkle
export function makeGroundMaterial(winter) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: winter ? 0.78 : 0.95, metalness: 0 })
  return withWorld(m, {
    vertex: `attribute vec2 aZone; varying vec2 vZone; //BODY vZone = aZone;`,
    fragmentHead: `varying vec2 vZone; uniform float uWinter;`,
    uniforms: { uWinter: { value: winter ? 1 : 0 } },
    fragmentColor: /* glsl */ `
      vec2 P = vShW.xz;
      float fine = shF(P * 7.0), mid = shF(P * 1.3 + 7.0), grain = shH(floor(P * 60.0));
      if (uWinter > 0.5) {
        // drifts: long ripples across the wind (from the north-west), crisp blue-grey in their lee
        vec2 wd = normalize(vec2(0.8, 0.6));
        float ph = dot(P, wd) * 2.6 + shF(P * 0.35) * 6.0, fw = fwidth(ph);
        float rip = sin(ph) * 0.5 + 0.5;
        float lee = smoothstep(0.55, 0.95, rip) * (0.6 + 0.4 * mid) * (1.0 - smoothstep(0.6, 1.6, fw)); // fades out where the ripples get finer than a pixel (far off, at a grazing view)
        diffuseColor.rgb *= 1.0 - 0.07 * lee - 0.05 * (fine - 0.5);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.9, 0.95, 1.06), 0.5 * lee);
        // sparkle in low sun: a few grains catch the light toward the camera
        vec3 V = normalize(cameraPosition - vShW);
        float sp = step(0.9965, grain) * smoothstep(0.2, 0.9, 1.0 - V.y) * (1.0 - vZone.y) * (1.0 - smoothstep(0.02, 0.06, fwidth(P.x * 60.0) / 60.0));
        diffuseColor.rgb += sp * 0.55;
      } else {
        // sand grain and pebbles near the water; on the grass, tufted mottling and darker blades; under the trees, needles
        float grassK = smoothstep(0.32, 0.5, diffuseColor.g - diffuseColor.r * 0.82);
        float g1 = shF(P * 18.0);
        diffuseColor.rgb *= 0.88 + 0.22 * fine + 0.1 * (grain - 0.5) * (1.0 - grassK);
        float blades = shN(P * vec2(55.0, 9.0)) * 0.5 + shN(P * vec2(9.0, 55.0)) * 0.5; // a fine weave of blades, so it never reads as felt
        diffuseColor.rgb *= mix(1.0, (0.7 + 0.42 * g1 * (0.6 + 0.4 * mid)) * (0.86 + 0.28 * blades), grassK);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.06, 1.0, 0.82), grassK * smoothstep(0.6, 0.9, mid) * 0.5); // sun-dried patches
        diffuseColor.rgb *= 1.0 - 0.18 * vZone.x * (0.7 + 0.3 * fine); // the wet band is darker
      }`,
    fragmentRough: `if (uWinter < 0.5) roughnessFactor = mix(roughnessFactor, 0.22, vZone.x); else roughnessFactor = mix(roughnessFactor, 0.55, step(0.996, shH(floor(vShW.xz * 60.0))));`,
  })
}
export function makeShoreIceMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: '#d4e2ee', roughness: 0.3, metalness: 0 })
  return withWorld(m, {
    fragmentColor: /* glsl */ `
      vec2 P = vShW.xz;
      float cr = abs(shN(P * 2.2) - 0.5) * 2.0, cr2 = abs(shN(P * 5.1 + 3.0) - 0.5) * 2.0;
      float crack = (1.0 - smoothstep(0.0, 0.05, cr)) * 0.6 + (1.0 - smoothstep(0.0, 0.04, cr2)) * 0.35;
      diffuseColor.rgb = mix(vec3(0.77, 0.84, 0.9), vec3(0.89, 0.93, 0.97), shF(P * 0.8));
      diffuseColor.rgb *= 1.0 - crack * 0.28;`,
  })
}
// the trees: needles from the atlas, dark inside to lighter tips; winter: snow on the upper faces of the branches
export function makeTreeMaterial(tex, winter) {
  const m = new THREE.MeshStandardMaterial({ map: tex, vertexColors: true, roughness: 0.82, metalness: 0, side: THREE.DoubleSide, alphaTest: 0.3, alphaToCoverage: true })
  const inner = winter ? C('#1e302c') : C('#1a2e22'), tip = winter ? C('#3e5648') : C('#3a583a')
  return withWorld(m, {
    vertex: `attribute float aSnow; varying float vSnow; varying vec2 vUvS; //BODY vSnow = aSnow; vUvS = uv;`,
    fragmentHead: `varying float vSnow; varying vec2 vUvS; uniform vec3 uInner; uniform vec3 uTip; uniform float uWinter;`,
    uniforms: { uInner: { value: inner }, uTip: { value: tip }, uWinter: { value: winter ? 1 : 0 } },
    fragmentColor: /* glsl */ `
      float bark = step(vUvS.x, 0.1);
      float tipK = smoothstep(0.15, 1.0, vUvS.x) * (0.55 + 0.45 * shN(vShW.xz * 3.0 + vShW.y));
      vec3 shade = vColor.rgb;
      vec3 needle = mix(uInner, uTip, tipK) * (0.9 + 0.65 * diffuseColor.r / max(shade.r, 0.05)); // the atlas' grey: light needles, dark twigs
      diffuseColor.rgb = bark > 0.5 ? diffuseColor.rgb * vec3(0.55, 0.5, 0.46) : needle * shade;
      if (uWinter > 0.5 && bark < 0.5) {
        // snow lies where we see the branch from above (the facing normal points up), patchy, thicker toward the tips
        vec3 fN = normalize(cross(dFdx(vShW), dFdy(vShW)));
        vec3 toCam = normalize(cameraPosition - vShW); if (dot(fN, toCam) < 0.0) fN = -fN;
        float up = smoothstep(0.35, 0.8, fN.y) * smoothstep(0.1, 0.6, vSnow + 0.25);
        float patchy = smoothstep(0.35, 0.7, shN(vShW.xz * 6.0 + vShW.y * 3.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.93, 0.97) * (0.85 + 0.15 * shade.r), up * patchy * 0.92);
      }`,
  })
}
export function makeRockMaterial(winter) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0 })
  return withWorld(m, {
    vertex: `varying vec3 vShN; //BODY vShN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);`,
    fragmentHead: `varying vec3 vShN; uniform float uWinter;`,
    uniforms: { uWinter: { value: winter ? 1 : 0 } },
    fragmentColor: /* glsl */ `
      // the lake's rock albedo was made for under water: lifted for dry rock in air, wet and darker at the waterline
      diffuseColor.rgb = diffuseColor.rgb * 1.55 + 0.05;
      float wet = 1.0 - smoothstep(0.02, 0.22, vShW.y);
      diffuseColor.rgb *= 1.0 - 0.38 * wet * (1.0 - uWinter);
      diffuseColor.rgb *= 0.9 + 0.2 * shF(vShW.xz * 9.0 + vShW.y * 7.0); // lichen and grain
      if (uWinter > 0.5) {
        float cap = smoothstep(0.45, 0.8, normalize(vShN).y) * smoothstep(0.3, 0.6, shN(vShW.xz * 4.0) + 0.25);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92, 0.94, 0.97), cap);
      }`,
    fragmentRough: `roughnessFactor = mix(roughnessFactor, 0.25, (1.0 - smoothstep(0.02, 0.22, vShW.y)) * (1.0 - uWinter));`,
  })
}
export function makeTuftMaterial(kind, winter) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, side: THREE.DoubleSide, color: kind === 'reed' ? (winter ? '#9a8a68' : '#6f7a46') : '#5e7a40' })
  return withWorld(m, { fragmentColor: `diffuseColor.rgb *= 0.85 + 0.3 * shN(vShW.xz * 4.0);` })
}
