// The Accuphy mark on the lakebed (Jason 2026-09-24: 放一个Accuphy的logo的模型做成立体的自然躺在水底上 … 船
// forward view 过去的时候 … 小窗里成像出logo的形状). The brand icon — a sonar fan cut into three bands by two
// arcs — as a thick blue sculpture resting on the bottom.
//
// Forward and Down are vertical slices along the boat's heading (+x), so the logo stands in that plane with
// its width along +x and leans a little to one side, like something that settled into the silt. A boat
// running along the logo's line then sees the whole shape; a logo lying flat would be only a thin line in
// those views (the plan view — Panoramic — is the one that sees flat things).
import * as THREE from 'three'
import { bedY } from './terrain'

// The mark, measured from the brand icon (Jason's PNG, 2026-09-24), in units of the outer radius with the
// apex at the origin and angles from straight down: half-angle 47.3°; top band inside a circle 0.025 below
// the apex (radius 0.153); middle band outside a circle 0.067 below the apex (radius 0.216) and within 0.59;
// outer band from 0.69 to 1.
export const LOGO_SHAPE = { half: (47.3 * Math.PI) / 180, c1: [0.025, 0.153], c2: [0.067, 0.216], mid: 0.59, outer0: 0.69 }
// Placement: the flattest open patch on the right of the lake (19 m, level within ~0.6 m over the whole
// footprint and ±4 m to each side, ≥ 3.4 m from the nearest brush). It must be flat ACROSS the boat's line
// too: on the drop-off the 20° beam sees a spread of bottom depths and the thick bottom echo buried the
// logo's outer band (first try at 30,-16). R = apex to the bottom of the outer arc; the logo is 1.47 R wide.
export const LOGO = { x: 56, z: 1, R: 7.5, thick: 0.6, lean: 0.2, roll: 0.025, sink: 0.45 }

// world frame of the logo plane: origin B = bottom of the outer arc, U = width axis (≈ +x), V = up the face
export function logoFrame() {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-LOGO.lean, 0, LOGO.roll, 'XYZ'))
  const B = new THREE.Vector3(LOGO.x, bedY(LOGO.x, LOGO.z) - LOGO.sink, LOGO.z)
  return { B, U: new THREE.Vector3(1, 0, 0).applyQuaternion(q), V: new THREE.Vector3(0, 1, 0).applyQuaternion(q), q, R: LOGO.R }
}

// the three bands as 2D shapes (u right, v up; apex at (0, R), outer-arc bottom at (0, 0))
function logoShapes(R) {
  const { half: h, c1, c2, mid, outer0 } = LOGO_SHAPE
  const apex = new THREE.Vector2(0, R)
  const onEdge = (r, s) => new THREE.Vector2(s * r * Math.sin(h), R - r * Math.cos(h)) // point on the left (s=-1) / right (s=1) edge
  // distance from the apex along an edge to a circle centred c below the apex with radius rho
  const edgeHit = (c, rho) => c * Math.cos(h) + Math.sqrt(rho * rho - c * c * Math.sin(h) * Math.sin(h))
  const angTo = (cx, cy, p) => Math.atan2(p.y - cy, p.x - cx)
  const shapes = []
  { // top band: apex → left edge → arc of circle 1 → right edge → apex
    const [c, rho] = [c1[0] * R, c1[1] * R], re = edgeHit(c, rho), L = onEdge(re, -1), Rt = onEdge(re, 1), cy = R - c
    const s = new THREE.Shape(); s.moveTo(apex.x, apex.y); s.lineTo(L.x, L.y)
    s.absarc(0, cy, rho, angTo(0, cy, L), angTo(0, cy, Rt), false); s.lineTo(apex.x, apex.y); shapes.push(s)
  }
  { // middle band: left edge (circle 2 → mid) → arc r = mid about the apex → right edge back → circle 2 arc back
    const [c, rho] = [c2[0] * R, c2[1] * R], re = edgeHit(c, rho), cy = R - c
    const Li = onEdge(re, -1), Lo = onEdge(mid * R, -1), Ro = onEdge(mid * R, 1), Ri = onEdge(re, 1)
    const s = new THREE.Shape(); s.moveTo(Li.x, Li.y); s.lineTo(Lo.x, Lo.y)
    s.absarc(0, R, mid * R, angTo(0, R, Lo), angTo(0, R, Ro), false); s.lineTo(Ri.x, Ri.y)
    s.absarc(0, cy, rho, angTo(0, cy, Ri), angTo(0, cy, Li), true); shapes.push(s)
  }
  { // outer band: r from outer0 to 1 about the apex
    const Li = onEdge(outer0 * R, -1), Lo = onEdge(R, -1), Ro = onEdge(R, 1), Ri = onEdge(outer0 * R, 1)
    const s = new THREE.Shape(); s.moveTo(Li.x, Li.y); s.lineTo(Lo.x, Lo.y)
    s.absarc(0, R, R, angTo(0, R, Lo), angTo(0, R, Ro), false); s.lineTo(Ri.x, Ri.y)
    s.absarc(0, R, outer0 * R, angTo(0, R, Ri), angTo(0, R, Li), true); shapes.push(s)
  }
  return shapes
}

export function makeLogoGeometry() {
  const { R, thick } = LOGO
  const g = new THREE.ExtrudeGeometry(logoShapes(R), { depth: thick, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2, curveSegments: 40 })
  g.translate(0, 0, -thick / 2)
  // Accuphy blue (tuned for the lake light so it reads as the brand blue in and out of the beam), with a
  // little silt on the upward-facing surfaces. No per-vertex jitter: the extrusion's long thin triangles
  // turned it into visible streaks.
  const n = g.attributes.position.count, col = new Float32Array(n * 3), nor = g.attributes.normal
  for (let i = 0; i < n; i++) {
    const up = Math.max(0, nor.getY(i))
    col[i * 3] = 0.08 + 0.1 * up; col[i * 3 + 1] = 0.38 + 0.03 * up; col[i * 3 + 2] = 0.66 - 0.12 * up
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}

// the space the logo occupies, for keeping fish out (an oriented box along +x)
export function logoObstacle() {
  const { B } = logoFrame(), { R, lean, thick } = LOGO
  const w = R * Math.sin(LOGO_SHAPE.half), side = R * Math.sin(lean)
  return { x: B.x, z: B.z - side / 2, ax: 1, az: 0, hl: w + 0.3, hw: side / 2 + thick / 2 + 0.2, y0: B.y - 0.5, y1: B.y + R * Math.cos(lean) + 0.3 }
}
