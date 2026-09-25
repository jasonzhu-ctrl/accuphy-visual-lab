// The Accuphy lockup on the lakebed (Jason 2026-09-24: 放一个Accuphy的logo的模型做成立体的自然躺在水底上 … 船
// forward view 过去的时候 … 小窗里成像出logo的形状; then: the white ACCUPHY letters were missing). The brand
// lockup — white ACCUPHY with the blue sonar fan inside the U (the fan's middle band is the U's bowl) — as a
// solid sculpture resting on the bottom. Outlines are brand-exact: the top copy of
// public/brand/logo/Untitled-1.svg, extruded here and rasterised into the sonar's distance texture.
//
// Forward and Down are vertical slices along the boat's heading (+x), so the lockup stands upright in that
// plane with its width along +x; a boat running along its line images the whole word.
// It stands on a low stone plinth, like a brand monument. The sonar puts a thick bright echo on the bottom that
// swallows anything within ~1.5 m of it, and the fan hangs 1.1 m below the letters' baseline: sitting on the
// bed (or on silt ridges, tried first) the fan's outer band vanished into that echo. The plinth lifts the whole
// mark 1.3 m clear; its top follows the letters' baseline with a notch where the fan dips.
import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { bedY } from './terrain'

// Placement: the flat 19.5 m patch on the right of the lake (level within 0.4 m along its 22 m after a 2.5°
// trend, which the monument follows; flat across its line, which the 20° beam needs).
export const LOCKUP = { x: 57, z: 2, width: 22, thick: 0.5, plinth: 1.3, plinthDepth: 1.4, sink: 0.35 }
// the lockup in its own SVG units (public/brand/logo/Untitled-1.svg, top copy): width, height, horizontal
// centre, fan bottom, letters' baseline, fan bottom x, and the notch the fan dips into
export const LOCKUP_SVG = { w: 1966.18, h: 380, cx: 983.6, bottom: 369.9, base: 273.3, fanX: 1027, notch: [852, 1206] }
let frame0 = null
// the lockup's frame as plain numbers: origin B = (word centre, fan-bottom height = plinth notch floor),
// roll (in-plane, following the bed's trend), s = metres per SVG unit, vBase = baseline height above B
export function lockupFrame() {
  if (frame0) return frame0
  const s = LOCKUP.width / LOCKUP_SVG.w
  const roll = Math.atan((bedY(LOCKUP.x + 9, LOCKUP.z) - bedY(LOCKUP.x - 9, LOCKUP.z)) / 18)
  const uFan = (LOCKUP_SVG.fanX - LOCKUP_SVG.cx) * s
  const B = { x: LOCKUP.x, y: bedY(LOCKUP.x + uFan, LOCKUP.z) + LOCKUP.plinth - uFan * Math.sin(roll), z: LOCKUP.z }
  frame0 = { s, roll, lean: 0, B, vBase: (LOCKUP_SVG.bottom - LOCKUP_SVG.base) * s }
  return frame0
}
// brand outlines (even-odd), SVG units, y down
const LETTERS_D = 'm1706.6684 3.1238h76.6099l53.9326 113.4553 53.6802-113.4553h75.2905l-95.6923 180.0624v90.1159h-68.129v-90.1159zm-722.9209 178.6547-52.0004 48.6453c-12.075-16.2351-19.4417-36.8129-19.4417-61.7167v-165.5833h67.7628v159.5682c0 7.4676 1.1463 13.384 3.6793 19.0865zm89.3279-.2815c2.5974-5.8603 3.3186-10.8981 3.3186-18.805v-159.5682h68.6137v165.5833c0 25.3006-7.1957 46.0224-19.0324 62.2584zm-1000.7305 91.8051h-71.3449l100.2461-270.1783h78.0228l100.6874 270.1783h-71.4053l-16.5628-47.5977h-103.9309zm33.5273-98.1782h68.4859l-34.5787-99.2047zm331.8543-175.1239c66.3261 0 115.1736 39.9827 132.2815 94.1434h-73.2778c-11.1524-19.8377-30.8098-34.0628-59.0034-34.0628h-.0003c-93.2888 0-93.2888 155.6326 0 155.6326h.0003c28.4212 0 48.1699-14.4587 59.2704-34.5456h73.1568c-16.9699 54.4045-65.9052 94.6262-132.4272 94.6262-83.2329 0-138.9408-62.9638-138.9408-137.8968-.0003-74.933 55.7076-137.897 138.9405-137.897zm300.0985 0c66.3262 0 115.1737 39.9827 132.2816 94.1434h-73.2779c-11.1523-19.8377-30.8097-34.0628-59.0034-34.0628h-.0003c-93.2887 0-93.2887 155.6326 0 155.6326h.0003c28.4213 0 48.17-14.4587 59.2705-34.5456h73.1568c-16.9699 54.4045-65.9052 94.6262-132.4273 94.6262-83.2328 0-138.9407-62.9638-138.9407-137.8968-.0003-74.933 55.7076-137.897 138.9404-137.897zm454.8331 273.869v-271.0287h113.2455c51.6614 0 97.9781 28.5492 97.9781 83.9435 0 56.0948-42.5934 89.5156-95.4269 89.5156h-48.8016v97.5696zm104.8938-217.9386h-37.8987v68.4125h37.8987c50.5043 0 51.0675-68.4125 0-68.4125zm141.6435 217.3717v-270.4618h67.5621v106.4274h105.7017v-106.4274h66.7117v270.4618h-66.7117v-111.4228h-105.7017v111.4228z'
const FAN_D = 'm1028.576 139.8419-28.3909 26.5595c3.9271 9.3175 15.8731 15.8063 27.86 16.0172 12.4033.2179 24.8511-6.2502 28.5049-16.4053zm-44.8285 41.9366c15.4112 36.3929 74.6456 37.4882 89.3353-.2974l52.9129 49.5034c-43.5798 59.7992-150.3062 58.5786-194.2738-.5368zm-72.9235 68.2189-47.5761 44.5067c19.3014 30.0382 47.5186 48.7766 77.6321 60.0699 62.686 23.5091 145.0508 20.5959 203.239-13.1692 19.8329-11.5087 37.2731-26.904 49.7707-46.9007l-46.9953-43.967c-26.3593 34.2139-69.7322 53.7106-118.474 53.3075-47.8071-.3955-91.0916-19.9837-117.5964-53.8472z'

// world frame: origin B (lockup centre, fan-bottom height), U = along the word (≈ +x), V = up the face
export function logoFrame() {
  const f = lockupFrame()
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-f.lean, 0, f.roll, 'XYZ'))
  return { B: new THREE.Vector3(f.B.x, f.B.y, f.B.z), U: new THREE.Vector3(1, 0, 0).applyQuaternion(q), V: new THREE.Vector3(0, 1, 0).applyQuaternion(q), q, s: f.s }
}
// logo-plane metres from SVG units: u along the word from its centre, v up from the fan's bottom
const toPlane = (s) => (p) => new THREE.Vector2((p.x - LOCKUP_SVG.cx) * s, (LOCKUP_SVG.bottom - p.y) * s)

export function makeLogoGeometry() {
  const { s } = lockupFrame(), t = LOCKUP.thick
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOCKUP_SVG.w} ${LOCKUP_SVG.h}"><path fill="#ffffff" fill-rule="evenodd" d="${LETTERS_D}"/><path fill="#278aca" fill-rule="evenodd" d="${FAN_D}"/></svg>`
  const parts = new SVGLoader().parse(svg).paths.map((path, i) => {
    const m = toPlane(s)
    const shapes = path.toShapes().map((sh) => { // even-odd holes (the A's and P's counters) handled by toShapes
      const { shape, holes } = sh.extractPoints(16)
      const out = new THREE.Shape(shape.map(m))
      out.holes = holes.map((h) => new THREE.Path(h.map(m)))
      return out
    })
    const g = new THREE.ExtrudeGeometry(shapes, { depth: t, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 1, curveSegments: 12 })
    g.translate(0, 0, -t / 2)
    // colours tuned for the lake light (the logo material keeps them under the beam): brand white letters,
    // Accuphy blue fan; a little silt on the upward-facing surfaces
    const fan = i === 1, n = g.attributes.position.count, col = new Float32Array(n * 3), nor = g.attributes.normal
    for (let k = 0; k < n; k++) {
      const up = Math.max(0, nor.getY(k))
      if (fan) { col[k * 3] = 0.08 + 0.1 * up; col[k * 3 + 1] = 0.38 + 0.03 * up; col[k * 3 + 2] = 0.66 - 0.12 * up }
      else { col[k * 3] = 0.8 - 0.1 * up; col[k * 3 + 1] = 0.82 - 0.08 * up; col[k * 3 + 2] = 0.84 - 0.16 * up }
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  })
  return mergeGeometries(parts)
}

// The side views' picture of the lockup: a signed distance to its outline (metres, < 0 inside), 8-bit so it
// filters on every GPU, read with ONE texture fetch per pixel (budget phones are GPU-bound). Rasterised from
// the same brand paths; exact Euclidean distance transform (Felzenszwalb) on the mask.
export const LOGO_SDF_MAX = 0.6 // metres encoded either side of the outline
export function makeLogoSdf(texW = 1024) {
  const { s } = lockupFrame(), SW = LOCKUP_SVG.w, SH = LOCKUP_SVG.h
  const texH = Math.round((texW * SH) / SW)
  const c = document.createElement('canvas'); c.width = texW; c.height = texH
  const ctx = c.getContext('2d'), k = texW / SW
  ctx.setTransform(k, 0, 0, k, 0, 0); ctx.fillStyle = '#fff'
  ctx.fill(new Path2D(LETTERS_D), 'evenodd'); ctx.fill(new Path2D(FAN_D), 'evenodd')
  const a = ctx.getImageData(0, 0, texW, texH).data
  const N = texW * texH, INF = 1e20, inside = new Uint8Array(N)
  for (let i = 0; i < N; i++) inside[i] = a[i * 4 + 3] > 127 ? 1 : 0
  const toIn = edt2d(inside, 1, texW, texH, INF), toOut = edt2d(inside, 0, texW, texH, INF)
  const mPerTexel = (SW / texW) * s, u8 = new Uint8Array(N)
  for (let y = 0; y < texH; y++) for (let x = 0; x < texW; x++) {
    const i = y * texW + x
    const sd = (inside[i] ? -(Math.sqrt(toOut[i]) - 0.5) : Math.sqrt(toIn[i]) - 0.5) * mPerTexel
    u8[(texH - 1 - y) * texW + x] = Math.round(255 * Math.min(1, Math.max(0, 0.5 + sd / (2 * LOGO_SDF_MAX)))) // row 0 = SVG bottom
  }
  const tex = new THREE.DataTexture(u8, texW, texH, THREE.RedFormat, THREE.UnsignedByteType)
  tex.minFilter = tex.magFilter = THREE.LinearFilter
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}
// squared distance from every pixel to the nearest pixel whose mask equals `target` (separable 1D passes)
function edt2d(mask, target, W, H, INF) {
  const f = new Float64Array(Math.max(W, H)), d = new Float64Array(Math.max(W, H)), v = new Int32Array(Math.max(W, H)), z = new Float64Array(Math.max(W, H) + 1)
  const g = new Float64Array(W * H)
  for (let i = 0; i < W * H; i++) g[i] = mask[i] === target ? 0 : INF
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = g[y * W + x]; edt1d(f, H, d, v, z, INF); for (let y = 0; y < H; y++) g[y * W + x] = d[y] }
  for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = g[y * W + x]; edt1d(f, W, d, v, z, INF); for (let x = 0; x < W; x++) g[y * W + x] = d[x] }
  return g
}
function edt1d(f, n, d, v, z, INF) {
  let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]) }
    k++; v[k] = q; z[k] = s; z[k + 1] = INF
  }
  k = 0
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]] }
}

// the plinth: a stone block whose top follows the letters' baseline, with a notch where the fan dips; it is
// ordinary structure (seen by every sonar pass), set 0.35 m into the silt
export function makePlinthGeometry() {
  const { s, vBase } = lockupFrame(), { width, plinth, plinthDepth, sink } = LOCKUP
  const uL = -width / 2 - 0.5, uR = width / 2 + 0.5, vBot = -plinth - sink, vTop = vBase + 0.02, vN = -0.03
  const n0 = (LOCKUP_SVG.notch[0] - LOCKUP_SVG.cx) * s, n1 = (LOCKUP_SVG.notch[1] - LOCKUP_SVG.cx) * s
  const sh = new THREE.Shape([[uL, vBot], [uR, vBot], [uR, vTop], [n1, vTop], [n1, vN], [n0, vN], [n0, vTop], [uL, vTop]].map(([u, v]) => new THREE.Vector2(u, v)))
  const g = new THREE.ExtrudeGeometry(sh, { depth: plinthDepth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1 })
  g.translate(0, 0, -plinthDepth / 2)
  const n = g.attributes.position.count, col = new Float32Array(n * 3), nor = g.attributes.normal
  // dark stone (the beam lifts structure ×3, so a light plinth glowed as white as the letters), silt on top
  for (let k = 0; k < n; k++) { const up = Math.max(0, nor.getY(k)); col[k * 3] = 0.17 + 0.06 * up; col[k * 3 + 1] = 0.17 + 0.05 * up; col[k * 3 + 2] = 0.18 + 0.01 * up }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return g
}

// the space the monument occupies (lockup + plinth), for keeping fish out (an oriented box along +x)
export function logoObstacle() {
  const { B, s } = lockupFrame(), H = LOCKUP_SVG.bottom * s
  return { x: B.x, z: B.z, ax: 1, az: 0, hl: LOCKUP.width / 2 + 0.8, hw: LOCKUP.plinthDepth / 2 + 0.3, y0: B.y - LOCKUP.plinth - 0.5, y1: B.y + H + 0.3 }
}
