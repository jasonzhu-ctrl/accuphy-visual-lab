// The ice camp, built in code (no downloaded models: nothing to license, nothing to load). Frame: x forward, y up
// (ice top = 0), z sideways, real sizes.
//   makeShelter()  — a pop-up hub shelter with a lit door (door facing −x)
//   makeSled()     — a black utility sled with a gear bag and a battery box
//   shadow()       — a soft contact shadow on the ice
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const merge = (parts) => mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))
const rbox = (sx, sy, sz, r, x, y, z) => new RoundedBoxGeometry(sx, sy, sz, 2, r).translate(x, y, z)
const cyl = (rt, rb, h, x, y, z, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z)
const mesh = (g, m) => new THREE.Mesh(g, m)

const M = {
  black: new THREE.MeshStandardMaterial({ color: '#15171a', roughness: 0.55, metalness: 0.2 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: 0.7, metalness: 0.15 }),
  fabric: new THREE.MeshStandardMaterial({ color: '#23272b', roughness: 0.95 }),
  trim: new THREE.MeshStandardMaterial({ color: '#8a2d28', roughness: 0.9 }),
  door: new THREE.MeshStandardMaterial({ color: '#2f343a', roughness: 0.9 }),
  window: new THREE.MeshStandardMaterial({ color: '#ffb15c', emissive: '#ffa64a', emissiveIntensity: 1.6, roughness: 1 }),
}
export const CAMP_MATERIALS = M
// a soft contact shadow on the ice: things on a plane need one or they float. A dark blue disc, fading out; drawn after
// the (transparent) sheet. Sits 3 cm up so the thin snow relief never buries it.
const shadeMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `precision highp float; varying vec2 vUv;
    void main() { float r = length((vUv - 0.5) * 2.0); gl_FragColor = vec4(0.01, 0.025, 0.05, 0.55 * (1.0 - smoothstep(0.3, 1.0, r))); }`,
})
export function shadow(rx, rz, x = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2).rotateX(-Math.PI / 2), shadeMat)
  m.position.set(x, 0.03, z); m.renderOrder = 2
  return m
}

// ---------- the pop-up hub shelter (a six-sided tent with a pyramid roof), door facing −x ----------
export function makeShelter() {
  const g = new THREE.Group()
  const R = 1.15, H = 1.45
  const wall = new THREE.CylinderGeometry(R * 0.9, R, H, 6, 1, true).translate(0, H / 2, 0)
  const roof = new THREE.ConeGeometry(R * 0.92, 0.75, 6).translate(0, H + 0.37, 0)
  const floorSkirt = new THREE.CylinderGeometry(R * 1.02, R * 1.06, 0.1, 6).translate(0, 0.05, 0)
  g.add(mesh(merge([wall, roof, floorSkirt]), M.fabric))
  g.add(mesh(new THREE.CylinderGeometry(R * 0.905, R * 0.935, 0.14, 6, 1, true).translate(0, H - 0.3, 0), M.trim)) // the red band
  // door on the −x face: a six-segment cylinder has a flat face centred on −x already (its vertices start on +z)
  const face = new THREE.Group()
  const apo = R * 0.95 * Math.cos(Math.PI / 6) // the face's distance from the centre (the wall leans in a little)
  const door = mesh(new THREE.PlaneGeometry(0.72, 1.2).translate(0, 0.62, 0), M.door)
  door.rotation.y = -Math.PI / 2; door.position.set(-apo - 0.012, 0, 0)
  const win = mesh(new THREE.PlaneGeometry(0.42, 0.3).translate(0, 0.98, 0), M.window)
  win.rotation.y = -Math.PI / 2; win.position.set(-apo - 0.02, 0, 0)
  face.add(door, win)
  g.add(face)
  // stovepipe out of the roof
  g.add(mesh(merge([cyl(0.045, 0.045, 0.6, 0.35, H + 0.5, 0.25, 8), cyl(0.07, 0.07, 0.06, 0.35, H + 0.82, 0.25, 8)]), M.black))
  g.add(shadow(1.5, 1.5))
  g.userData = { lampLocal: new THREE.Vector3(-apo - 0.25, 1.0, 0) } // where the lamp light comes from (world after the group transform)
  return g
}

// ---------- a black utility sled with a grey gear bag ----------
export function makeSled() {
  const g = new THREE.Group()
  g.add(mesh(rbox(1.3, 0.3, 0.64, 0.06, 0, 0.15, 0), M.black))
  g.add(mesh(rbox(1.18, 0.1, 0.52, 0.03, 0, 0.3, 0), M.dark)) // the cavity read as a dark top
  g.add(mesh(rbox(0.6, 0.3, 0.38, 0.08, -0.15, 0.4, 0), new THREE.MeshStandardMaterial({ color: '#4b5158', roughness: 0.95 })))
  g.add(mesh(rbox(0.3, 0.2, 0.22, 0.03, 0.4, 0.36, 0.1), M.dark)) // battery box
  g.add(shadow(0.85, 0.5))
  return g
}
