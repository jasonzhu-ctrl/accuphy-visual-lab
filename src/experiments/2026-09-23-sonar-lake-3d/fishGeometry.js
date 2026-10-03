// Realistic fish bodies (Jason 2026-09-24: "尾巴和身体后半段的过渡不自然").
// Body = smooth tube along the length (nose at x=+0.5, peduncle at x≈-0.5)
// with a species profile for height/width; then flat fins as shapes:
// caudal (forked or rounded), dorsal, anal, pectorals. One unit long.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
// The tube and the fin shapes are all indexed, so the merged fish stays indexed: a shared vertex is shaded once,
// which matters now that the vertex shader bends the body (decision #86).

// profile control points: [t along body 0=nose..1=peduncle end, height, width]
const PROFILES = {
  bass:     { pts: [[0, 0.03, 0.03], [0.1, 0.17, 0.11], [0.22, 0.27, 0.15], [0.42, 0.32, 0.16], [0.65, 0.25, 0.13], [0.85, 0.13, 0.07], [1, 0.09, 0.05]], tail: 'round', dorsal: [0.3, 0.72, 0.09], anal: [0.62, 0.82, 0.06], pec: 0.3 },
  salmonid: { pts: [[0, 0.03, 0.03], [0.12, 0.14, 0.1], [0.28, 0.21, 0.13], [0.45, 0.23, 0.13], [0.7, 0.16, 0.1], [0.88, 0.08, 0.05], [1, 0.06, 0.04]], tail: 'fork', dorsal: [0.4, 0.58, 0.07], anal: [0.68, 0.8, 0.05], pec: 0.3 },
  pike:     { pts: [[0, 0.02, 0.03], [0.14, 0.07, 0.07], [0.3, 0.12, 0.1], [0.55, 0.14, 0.11], [0.78, 0.11, 0.08], [0.92, 0.07, 0.05], [1, 0.06, 0.04]], tail: 'fork', dorsal: [0.72, 0.9, 0.06], anal: [0.74, 0.9, 0.05], pec: 0.3 },
  panfish:  { pts: [[0, 0.03, 0.02], [0.1, 0.2, 0.06], [0.25, 0.36, 0.08], [0.45, 0.42, 0.08], [0.65, 0.32, 0.07], [0.85, 0.15, 0.04], [1, 0.1, 0.03]], tail: 'round', dorsal: [0.28, 0.74, 0.12], anal: [0.6, 0.82, 0.1], pec: 0.3 },
  bait:     { pts: [[0, 0.02, 0.02], [0.12, 0.08, 0.06], [0.3, 0.12, 0.08], [0.5, 0.13, 0.08], [0.72, 0.1, 0.06], [0.9, 0.06, 0.04], [1, 0.05, 0.03]], tail: 'fork', dorsal: [0.45, 0.58, 0.04], anal: [0.7, 0.82, 0.03], pec: 0.3, rings: 10, segs: 8 }, // small and many (205 smelt): a lighter tube
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
function fin(points) { // flat fin in the x–y plane (z = 0), double-sided via material
  const sh = new THREE.Shape()
  sh.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) sh.lineTo(points[i][0], points[i][1])
  sh.closePath()
  const g = new THREE.ShapeGeometry(sh, 4)
  g.computeVertexNormals()
  return g
}
export function makeFishGeometry(body) {
  const prof = PROFILES[body]
  const parts = [bodyTube(prof, prof.rings, prof.segs)]
  const H = (t) => interp(prof.pts, t, 1) / 2
  const x = (t) => 0.5 - t
  // caudal fin from the peduncle
  const ped = H(1)
  if (prof.tail === 'fork') {
    parts.push(fin([[x(1) + 0.02, ped], [x(1) - 0.16, 0.19], [x(1) - 0.2, 0.17], [x(1) - 0.07, 0.0], [x(1) - 0.2, -0.17], [x(1) - 0.16, -0.19], [x(1) + 0.02, -ped]]))
  } else {
    parts.push(fin([[x(1) + 0.02, ped], [x(1) - 0.1, 0.15], [x(1) - 0.17, 0.09], [x(1) - 0.19, 0.0], [x(1) - 0.17, -0.09], [x(1) - 0.1, -0.15], [x(1) + 0.02, -ped]]))
  }
  // dorsal fin along the back, anal fin below
  const [d0, d1, dh] = prof.dorsal
  const dm = (d0 + d1) / 2
  parts.push(fin([[x(d0), H(d0) - 0.01], [x(d0) - 0.02, H(d0) + dh], [x(dm), H(dm) + dh * 0.8], [x(d1), H(d1) + dh * 0.35], [x(d1), H(d1) - 0.01]]))
  const [a0, a1, ah] = prof.anal
  parts.push(fin([[x(a0), -H(a0) + 0.01], [x(a0) - 0.02, -H(a0) - ah], [x(a1), -H(a1) - ah * 0.3], [x(a1), -H(a1) + 0.01]]))
  // pectoral fins, angled back, one each side
  const pt = prof.pec, pw = interp(prof.pts, pt, 2) / 2
  for (const side of [1, -1]) {
    const g = fin([[0, 0], [-0.1, 0.03], [-0.13, -0.02], [-0.04, -0.04]])
    g.rotateX(side * Math.PI / 2 * 0.75)
    g.rotateY(side * 0.35)
    g.translate(x(pt), -0.02, side * pw)
    parts.push(g)
  }
  return mergeGeometries(parts)
}
