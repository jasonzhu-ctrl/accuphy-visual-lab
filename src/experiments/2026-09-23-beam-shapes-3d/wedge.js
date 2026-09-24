import * as THREE from 'three'

// A beam wedge with FLAT thickness faces (Jason 2026-09-23: "底面应该是平的",
// "俯视左右两边应该是直的"). The wedge is the fan of directions in the plane
// spanned by `c` (centre direction) and `h` (in-plane perpendicular), swept
// across its thickness by two PLANES hinged on the apex along `h`:
//   point(a, s) = R·(cos a·c + sin a·h) + s·R·cos a·tan(theta)·n
// so on a flat bottom the footprint's long sides are straight, and the far
// boundary is the arc of radius R in the fan plane.
export function wedgeGeometry({ a0, a1, s0, s1, R, frame, theta, na = 48, ns = 6 }) {
  const { c, h, n } = frame
  const pos = []
  const push = (v) => pos.push(v.x, v.y, v.z)
  const P = (a, s) => {
    const v = new THREE.Vector3().addScaledVector(c, R * Math.cos(a)).addScaledVector(h, R * Math.sin(a))
    return v.addScaledVector(n, s * R * Math.cos(a) * Math.tan(theta))
  }
  const apex = new THREE.Vector3()
  const A = (i) => a0 + ((a1 - a0) * i) / na
  const S = (j) => s0 + ((s1 - s0) * j) / ns
  for (let i = 0; i < na; i++) for (let j = 0; j < ns; j++) {
    const p00 = P(A(i), S(j)), p10 = P(A(i + 1), S(j)), p01 = P(A(i), S(j + 1)), p11 = P(A(i + 1), S(j + 1))
    push(p00); push(p10); push(p11); push(p00); push(p11); push(p01)
  }
  for (let i = 0; i < na; i++) {           // two flat thickness faces
    push(apex); push(P(A(i + 1), s0)); push(P(A(i), s0))
    push(apex); push(P(A(i), s1)); push(P(A(i + 1), s1))
  }
  for (let j = 0; j < ns; j++) {           // two wide-angle faces
    push(apex); push(P(a0, S(j))); push(P(a0, S(j + 1)))
    push(apex); push(P(a1, S(j + 1))); push(P(a1, S(j)))
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

const d2r = (d) => (d * Math.PI) / 180
const V = (x, y, z) => new THREE.Vector3(x, y, z)

// World: x = forward (ahead of the boat), y = up, z = sideways.
// Vertical fan (Down / Forward) tilted toward +x by tiltDeg; thickness sideways.
function verticalFrame(tiltDeg) {
  const t = d2r(tiltDeg)
  return { c: V(Math.sin(t), -Math.cos(t), 0), h: V(Math.cos(t), Math.sin(t), 0), n: V(0, 0, 1) }
}
// Flat fan (Panoramic): fan plane horizontal, centred on +x; thickness downward.
const flatFrame = { c: V(1, 0, 0), h: V(0, 0, 1), n: V(0, -1, 0) }

// One wedge spec per (device, mode). Uses the *display* beam angle if the
// device defines one (PLM is drawn at 43° instead of 39° — Jason's call).
export function wedgeSpecs(device, mode, rangeM) {
  const beam = device.displayBeamDeg ?? device.beamDeg
  const half = beam / 2, th = device.thickDeg
  const vertical = (tilt) => ({ a0: d2r(-half), a1: d2r(half), s0: -1, s1: 1, R: rangeM, frame: verticalFrame(tilt), theta: d2r(th / 2) })
  const fwdTilt = 90 - half // leading edge on the surface (decision #7)
  if (mode === 'down') return [vertical(0)]
  if (mode === 'forward') return [vertical(fwdTilt)]
  if (mode === 'combo') return [vertical(0), vertical(fwdTilt)]
  if (mode === 'panoramic') return [{ a0: d2r(-half), a1: d2r(half), s0: 0, s1: 1, R: rangeM, frame: flatFrame, theta: d2r(th) }]
  return []
}
