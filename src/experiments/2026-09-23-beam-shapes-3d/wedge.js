import * as THREE from 'three'

// Builds a "spherical wedge" from an apex at the origin: all directions
// dir(a, b) for a in [a0, a1] (wide angle) and b in [b0, b1] (thickness),
// out to radius R. `dir` returns a unit THREE.Vector3 for angles in radians.
export function wedgeGeometry({ a0, a1, b0, b1, R, dir, na = 48, nb = 8 }) {
  const pos = []
  const push = (v) => pos.push(v.x, v.y, v.z)
  const P = (a, b) => dir(a, b).multiplyScalar(R)
  const apex = new THREE.Vector3()
  const A = (i) => a0 + ((a1 - a0) * i) / na
  const B = (j) => b0 + ((b1 - b0) * j) / nb
  // outer spherical patch
  for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) {
    const p00 = P(A(i), B(j)), p10 = P(A(i + 1), B(j)), p01 = P(A(i), B(j + 1)), p11 = P(A(i + 1), B(j + 1))
    push(p00); push(p10); push(p11); push(p00); push(p11); push(p01)
  }
  // two thickness faces (b = b0, b = b1): fans from the apex along a
  for (let i = 0; i < na; i++) {
    push(apex); push(P(A(i + 1), b0)); push(P(A(i), b0))
    push(apex); push(P(A(i), b1)); push(P(A(i + 1), b1))
  }
  // two wide-angle faces (a = a0, a = a1): fans from the apex along b
  for (let j = 0; j < nb; j++) {
    push(apex); push(P(a0, B(j))); push(P(a0, B(j + 1)))
    push(apex); push(P(a1, B(j + 1))); push(P(a1, B(j)))
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

const d2r = (d) => (d * Math.PI) / 180

// Direction functions. World: x = forward (ahead of the boat), y = up, z = sideways.
// Vertical fan (Down / Forward): wide angle `a` measured from straight-down toward
// +x, thickness `b` sideways (z). `tiltDeg` rotates the whole fan toward +x.
export function verticalFanDir(tiltDeg) {
  const t = d2r(tiltDeg)
  return (a, b) => {
    const x = Math.sin(a) * Math.cos(b), y = -Math.cos(a) * Math.cos(b), z = Math.sin(b)
    return new THREE.Vector3(x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t), z)
  }
}
// Flat fan (Panoramic): wide angle `a` around the vertical axis centred on +x,
// thickness `b` measured downward from horizontal.
export function flatFanDir() {
  return (a, b) => new THREE.Vector3(Math.cos(a) * Math.cos(b), -Math.sin(b), Math.sin(a) * Math.cos(b))
}

// One wedge spec per (device, mode). Angles in degrees.
export function wedgeSpecs(device, mode, rangeM) {
  const half = device.beamDeg / 2, th = device.thickDeg
  const vertical = (tilt) => ({ a0: d2r(-half), a1: d2r(half), b0: d2r(-th / 2), b1: d2r(th / 2), R: rangeM, dir: verticalFanDir(tilt) })
  const fwdTilt = 90 - half // leading edge on the surface (decision #7)
  if (mode === 'down') return [vertical(0)]
  if (mode === 'forward') return [vertical(fwdTilt)]
  if (mode === 'combo') return [vertical(0), vertical(fwdTilt)]
  if (mode === 'panoramic') return [{ a0: d2r(-half), a1: d2r(half), b0: 0, b1: d2r(th), R: rangeM, dir: flatFanDir() }]
  return []
}
