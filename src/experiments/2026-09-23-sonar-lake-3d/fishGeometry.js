// Realistic fish bodies (Jason 2026-09-24: "尾巴和身体后半段的过渡不自然"; anatomy, decision #90).
// Body = smooth tube along the length (nose at x=+0.5, peduncle at x≈-0.5) with a species profile for height/width;
// fins as flat shapes: caudal, one dorsal or a spiny + soft pair, anal, paired pectorals and pelvics, the salmonids'
// adipose; eyes as small discs on the head. One unit long.
// uv tells the fish shader what a vertex is (lakeMaterial.js): the tube uses uv.x ∈ [0, 1]; an eye uv.x ≈ −1 (uv holds
// the position on the eye, for the pupil, the iris and the glint); a fin uv.x = −2 (uv.y runs across its rays).
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
// The tube and the fin shapes are all indexed, so the merged fish stays indexed: a shared vertex is shaded once,
// which matters now that the vertex shader bends the body (decision #86).

// profile control points: [t along body 0=nose..1=peduncle end, height, width]; fins as [t0, t1, height];
// eye: [t, radius]; dorsal2: a second (soft) dorsal — then `dorsal` is the spiny one
const PROFILES = {
  bass:     { pts: [[0, 0.03, 0.03], [0.1, 0.17, 0.11], [0.22, 0.27, 0.15], [0.42, 0.32, 0.16], [0.65, 0.25, 0.13], [0.85, 0.13, 0.07], [1, 0.09, 0.05]], tail: 'shallow', dorsal: [0.27, 0.5, 0.1], dorsal2: [0.5, 0.72, 0.1], anal: [0.62, 0.82, 0.07], pec: 0.3, pelvic: 0.33, eye: [0.085, 0.028], segs: 16 },
  walleye:  { pts: [[0, 0.03, 0.03], [0.1, 0.12, 0.09], [0.25, 0.19, 0.12], [0.45, 0.2, 0.12], [0.68, 0.15, 0.09], [0.88, 0.08, 0.05], [1, 0.06, 0.04]], tail: 'fork', dorsal: [0.24, 0.47, 0.1], dorsal2: [0.53, 0.72, 0.075], anal: [0.64, 0.8, 0.055], pec: 0.28, pelvic: 0.31, eye: [0.095, 0.03], segs: 16 }, // walleye: a big, high eye
  perch:    { pts: [[0, 0.03, 0.03], [0.1, 0.16, 0.08], [0.25, 0.27, 0.11], [0.42, 0.28, 0.11], [0.65, 0.2, 0.09], [0.86, 0.1, 0.05], [1, 0.07, 0.04]], tail: 'fork', dorsal: [0.24, 0.47, 0.11], dorsal2: [0.51, 0.7, 0.08], anal: [0.62, 0.78, 0.06], pec: 0.28, pelvic: 0.31, eye: [0.085, 0.036], segs: 16 },
  salmonid: { pts: [[0, 0.03, 0.03], [0.12, 0.14, 0.1], [0.28, 0.21, 0.13], [0.45, 0.23, 0.13], [0.7, 0.16, 0.1], [0.88, 0.08, 0.05], [1, 0.06, 0.04]], tail: 'fork', dorsal: [0.4, 0.58, 0.07], adipose: [0.82, 0.88, 0.028], anal: [0.68, 0.8, 0.05], pec: 0.3, pelvic: 0.55, eye: [0.075, 0.026], segs: 16 },
  pike:     { pts: [[0, 0.02, 0.03], [0.14, 0.07, 0.07], [0.3, 0.12, 0.1], [0.55, 0.14, 0.11], [0.78, 0.11, 0.08], [0.92, 0.07, 0.05], [1, 0.06, 0.04]], tail: 'fork', dorsal: [0.72, 0.9, 0.06], anal: [0.74, 0.9, 0.05], pec: 0.3, pelvic: 0.56, eye: [0.13, 0.02], segs: 16 },
  panfish:  { pts: [[0, 0.03, 0.02], [0.1, 0.2, 0.06], [0.25, 0.36, 0.08], [0.45, 0.42, 0.08], [0.65, 0.32, 0.07], [0.85, 0.15, 0.04], [1, 0.1, 0.03]], tail: 'round', dorsal: [0.28, 0.74, 0.12], anal: [0.6, 0.82, 0.1], pec: 0.3, pelvic: 0.33, eye: [0.09, 0.042] },
  bait:     { pts: [[0, 0.02, 0.02], [0.12, 0.08, 0.06], [0.3, 0.12, 0.08], [0.5, 0.13, 0.08], [0.72, 0.1, 0.06], [0.9, 0.06, 0.04], [1, 0.05, 0.03]], tail: 'fork', dorsal: [0.45, 0.58, 0.04], anal: [0.7, 0.82, 0.03], pec: 0.3, pelvic: 0.5, eye: [0.09, 0.02], rings: 10, segs: 8 }, // small and many (smelt): a lighter tube
}
// smooth interpolation through control points (Catmull-Rom on each channel)
function interp(pts, t, ch) {
  const n = pts.length
  let i = 0
  while (i < n - 2 && t > pts[i + 1][0]) i++
  const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)]
  const u = (t - p1[0]) / (p2[0] - p1[0])
  const c = (a, b, cc, d) => 0.5 * ((2 * b) + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u * u + (-a + 3 * b - 3 * cc + d) * u * u * u)
  return Math.max(0.005, c(p0[ch], p1[ch], p2[ch], p3[ch]))
}

function bodyTube(prof, rings = 26, segs = 14) {
  const pos = [], idx = [], uv = []
  for (let i = 0; i <= rings; i++) {
    const t = i / rings
    const x = 0.5 - t                 // nose at +0.5, peduncle at -0.5
    const ry = interp(prof.pts, t, 1) / 2, rz = interp(prof.pts, t, 2) / 2
    for (let j = 0; j <= segs; j++) {
      const a = (j / segs) * Math.PI * 2
      // slightly flatter belly than back
      const yy = Math.sin(a), y = yy > 0 ? yy * ry : yy * ry * 0.92
      pos.push(x, y, Math.cos(a) * rz)
      uv.push(t, j / segs)
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < segs; j++) {
    const a = i * (segs + 1) + j, b = a + segs + 1
    idx.push(a, b, a + 1, b, b + 1, a + 1)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)) // fins have uv; merge needs matching attributes
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}
// flat fin in the x–y plane (z = 0), double-sided via the material; rays(x, y) → the coordinate across its rays
function fin(points, rays) {
  const sh = new THREE.Shape()
  sh.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) sh.lineTo(points[i][0], points[i][1])
  sh.closePath()
  const g = new THREE.ShapeGeometry(sh, 4)
  g.computeVertexNormals()
  const p = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, -2, rays(p.getX(i), p.getY(i)))
  return g
}
// mirror a part to the other side (z → −z) and keep its triangles front-facing
function mirrorZ(g) {
  const m = g.clone().applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1))
  const ix = m.index.array
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t }
  m.index.needsUpdate = true
  return m
}
export function makeFishGeometry(body) {
  const prof = PROFILES[body]
  const parts = [bodyTube(prof, prof.rings, prof.segs)]
  const H = (t) => interp(prof.pts, t, 1) / 2, Wd = (t) => interp(prof.pts, t, 2) / 2
  const x = (t) => 0.5 - t
  // caudal fin from the peduncle; rays fan out from it
  const ped = H(1), xp = x(1) + 0.02
  const fan = (px, py) => Math.atan2(py, xp - px + 1e-4) / 1.2
  if (prof.tail === 'fork') {
    parts.push(fin([[xp, ped], [x(1) - 0.16, 0.19], [x(1) - 0.2, 0.17], [x(1) - 0.07, 0.0], [x(1) - 0.2, -0.17], [x(1) - 0.16, -0.19], [xp, -ped]], fan))
  } else if (prof.tail === 'shallow') { // black bass: a broad tail, only slightly forked
    parts.push(fin([[xp, ped], [x(1) - 0.13, 0.155], [x(1) - 0.18, 0.13], [x(1) - 0.13, 0.0], [x(1) - 0.18, -0.13], [x(1) - 0.13, -0.155], [xp, -ped]], fan))
  } else {
    parts.push(fin([[xp, ped], [x(1) - 0.1, 0.15], [x(1) - 0.17, 0.09], [x(1) - 0.19, 0.0], [x(1) - 0.17, -0.09], [x(1) - 0.1, -0.15], [xp, -ped]], fan))
  }
  // fins along the back and belly: rays leave the base slanted back
  const along = (t0, t1) => (px, py) => ((x(t0) - px) + 0.45 * Math.abs(py)) / (x(t0) - x(t1))
  const [d0, d1, dh] = prof.dorsal
  if (prof.dorsal2) {
    // spiny dorsal: a row of spines, tallest near the front
    const hf = [0.8, 1, 0.93, 0.82, 0.68, 0.52, 0.36], n = hf.length - 1, pts = [[x(d0), H(d0) - 0.01]]
    for (let k = 0; k <= n; k++) {
      const t = d0 + ((d1 - d0) * k) / n
      pts.push([x(t) - 0.008, H(t) + dh * hf[k]])
      if (k < n) { const tm = d0 + ((d1 - d0) * (k + 0.55)) / n; pts.push([x(tm), H(tm) + dh * hf[k] * 0.6]) }
    }
    pts.push([x(d1), H(d1) - 0.01])
    parts.push(fin(pts, along(d0, d1)))
    const [e0, e1, eh] = prof.dorsal2, em = (e0 + e1) / 2 // soft dorsal, rounded
    parts.push(fin([[x(e0), H(e0) - 0.01], [x(e0) - 0.01, H(e0) + eh * 0.85], [x(em), H(em) + eh], [x(e1) + 0.02, H(e1) + eh * 0.55], [x(e1), H(e1) - 0.01]], along(e0, e1)))
  } else {
    const dm = (d0 + d1) / 2
    parts.push(fin([[x(d0), H(d0) - 0.01], [x(d0) - 0.02, H(d0) + dh], [x(dm), H(dm) + dh * 0.8], [x(d1), H(d1) + dh * 0.35], [x(d1), H(d1) - 0.01]], along(d0, d1)))
  }
  if (prof.adipose) { const [f0, f1, fh] = prof.adipose; parts.push(fin([[x(f0), H(f0) - 0.008], [x((f0 + f1) / 2), H((f0 + f1) / 2) + fh], [x(f1), H(f1) - 0.008]], along(f0, f1))) }
  const [a0, a1, ah] = prof.anal
  parts.push(fin([[x(a0), -H(a0) + 0.01], [x(a0) - 0.02, -H(a0) - ah], [x(a1), -H(a1) - ah * 0.3], [x(a1), -H(a1) + 0.01]], along(a0, a1)))
  // paired fins: pectorals behind the gill, angled back; pelvics under the belly, splayed a little
  const root = (px, py) => Math.atan2(-py, -px + 1e-4) / 0.9
  const pt = prof.pec, pw = Wd(pt)
  const pel = prof.pelvic, pelY = -H(pel) * 0.86, pelW = Wd(pel) * 0.45
  for (const side of [1, -1]) {
    const g = fin([[0, 0], [-0.1, 0.03], [-0.13, -0.02], [-0.04, -0.04]], root)
    g.rotateX(side * Math.PI / 2 * 0.75)
    g.rotateY(side * 0.35)
    g.translate(x(pt), -0.02, side * pw)
    parts.push(g)
    const v = fin([[0, 0], [-0.09, -0.02], [-0.1, -0.055], [-0.03, -0.03]], root)
    v.rotateX(side * 0.35)
    v.translate(x(pel), pelY, side * pelW)
    parts.push(v)
  }
  // eyes: a disc on each side of the head, just proud of the skin; uv = (−1 + 0.2·ex, ey) with (ex, ey) on the eye
  const [te, re] = prof.eye, ry = H(te), rz = Wd(te), ye = 0.3 * ry, ze = Math.sqrt(1 - 0.09) * rz
  const nrm = new THREE.Vector3(0, ye / (ry * ry), ze / (rz * rz)).normalize()
  const eye = new THREE.CircleGeometry(re, 14)
  const ep = eye.attributes.position, euv = eye.attributes.uv
  for (let i = 0; i < ep.count; i++) euv.setXY(i, -1 + 0.2 * (ep.getX(i) / re), ep.getY(i) / re)
  eye.rotateX(-Math.atan2(nrm.y, nrm.z))
  eye.translate(x(te) + nrm.x * 0.006, ye + nrm.y * 0.006, ze + nrm.z * 0.006)
  parts.push(eye, mirrorZ(eye))
  return mergeGeometries(parts)
}
