// A low-key 21 ft bass boat, built in code (decisions #83, #87, #88; docs/boat-fish-plan.md §5).
// Real class: Ranger Z521R / Phoenix 921 / Bass Cat Puma — 6.63 m × 2.44 m (96" beam). The hull is lofted through
// V sections (≈ 19° deadrise at the transom sharpening to ≈ 32° forward, a pad keel aft, two lifting strakes and a
// chine flat per side), with an almost flat sheer (+4 cm toward the bow, #83), a pointed, lightly flared bow and a
// squared transom. Muted charcoal gelcoat with one thin side line; no Power-Poles, no logos (#83). The bow trolling
// motor and the PingLive on its shaft are the old ones, only lifted onto the new deck: the beam apex
// (TRANSDUCER_OFFSET) does not move. Boat frame: x forward (bow +L/2), y up (waterline 0), z to starboard.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { LoftGeometry } from 'three/addons/geometries/LoftGeometry.js'
// Extrude geometries are non-indexed, the rest indexed — normalise first.
const merge = (parts) => mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)))

const L = 6.63, W = 2.44, HB = W / 2
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const xOf = (u) => -L / 2 + u * L // u: 0 at the transom → 1 at the bow tip
const uOf = (x) => (x + L / 2) / L

// ---------- hull lines ----------
// half-breadth at the sheer: full beam carried far forward, a pointed bow with a convex curve, a slightly narrower transom
const sheerB = (u) => HB * (1 - Math.pow(Math.max(0, 1 - ((1 - u) * L) / 2.9), 2.3)) * (0.95 + 0.05 * ss(0, 0.35, u))
const sheerY = (u) => 0.46 + 0.04 * ss(0.45, 1, u)                                        // almost flat (#83)
const chineB = (u) => sheerB(u) * (0.86 - 0.24 * ss(0.55, 1, u))                          // more flare toward the bow
const chineY = (u) => -0.02 + (sheerY(u) - 0.02) * Math.pow(ss(0.48, 1, u), 1.25)
const keelY = (u) => -0.34 + (sheerY(u) + 0.28) * Math.pow(ss(0.58, 1, u), 2.3)          // forefoot lifts ≈ 1 m behind the tip
const padB = (u) => 0.07 * (1 - ss(0.45, 0.62, u))                                       // pad keel, aft only
const strakeH = (u) => 0.016 * (1 - ss(0.8, 0.97, u))

// starboard half of a station, sheer → pad edge, as [z, y]
function halfSection(u) {
  const B = sheerB(u), ys = sheerY(u), Bc = chineB(u), yc = chineY(u), yk = keelY(u), pb = padB(u), sh = strakeH(u)
  const pts = [[B, ys], [B + (Bc - B) * 0.5 + 0.012 * Math.min(1, B / 0.3), ys + (yc - ys) * 0.5], [Bc, yc]]
  const cf = Math.min(0.05, Bc * 0.15), z0 = Bc - cf, y0 = yc - 0.006
  pts.push([z0, y0]) // chine flat (spray rail)
  const yV = (z) => yk + ((y0 - yk) * (z - pb)) / Math.max(z0 - pb, 1e-4)
  for (const f of [0.68, 0.35]) { // lifting strakes: a short drop, a flat underside, back onto the V
    const zs = pb + f * (z0 - pb), w = sh > 0 ? 0.028 : 0
    pts.push([zs, yV(zs)], [zs, yV(zs) - sh], [zs - w, yV(zs) - sh])
  }
  pts.push([pb, yk])
  return pts
}
// full station, starboard sheer → keel → port sheer (counter-clockwise seen from the bow: outward normals)
function section(u) {
  const x = xOf(u), h = halfSection(u)
  return [...h.map(([z, y]) => new THREE.Vector3(x, y, z)), new THREE.Vector3(x, keelY(u), 0), ...h.slice().reverse().map(([z, y]) => new THREE.Vector3(x, y, -z))]
}
const STATIONS = Array.from({ length: 33 }, (_, i) => 1 - Math.pow(1 - i / 32, 1.6)) // denser toward the bow
function hullGeometry() {
  return new LoftGeometry(STATIONS.map(section), { closed: false, capStart: true }) // capStart: the transom
}
// starboard hull surface at height y: z of the side (between the sheer and the chine)
function sideZ(u, y) {
  const h = halfSection(u)
  for (let i = 0; i < 2; i++) { const [za, ya] = h[i], [zb, yb] = h[i + 1]; if (y <= ya && y >= yb) return za + ((zb - za) * (y - ya)) / (yb - ya) }
  return h[0][0]
}
// starboard waterline (y = 0): z where each station's bottom crosses the water, until the forefoot
export function waterlineZ(u) {
  const h = halfSection(u)
  for (let i = 0; i < h.length - 1; i++) { const [za, ya] = h[i], [zb, yb] = h[i + 1]; if (ya >= 0 && yb < 0) return za + ((zb - za) * ya) / (ya - yb) }
  return null
}

// ---------- helpers ----------
// a flat panel over a planform [x, z] outline, each vertex at height yOf(x)
function deckPanel(outline, yOf) {
  const s = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)))
  const g = new THREE.ShapeGeometry(s, 1)
  g.rotateX(-Math.PI / 2) // shape (x, −z) → (x, 0, z)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) p.setY(i, yOf(p.getX(i)))
  g.computeVertexNormals()
  return g
}
const deckOutline = (u0, u1, inset, n = 24) => {
  const st = [], pt = []
  for (let i = 0; i <= n; i++) {
    const u = u0 + ((u1 - u0) * i) / n, z = sheerB(u) - inset
    if (z <= 0.002) { st.push([xOf(u), 0]); break }
    st.push([xOf(u), z]); pt.unshift([xOf(u), -z])
  }
  return [...st, ...pt]
}
// a wall along the cockpit side, z(u) from the floor to the gunwale
function wall(u0, u1, zOf, y0, y1Of, n = 16) {
  const lo = [], hi = []
  for (let i = 0; i <= n; i++) { const u = u0 + ((u1 - u0) * i) / n; lo.push(new THREE.Vector3(xOf(u), y0, zOf(u))); hi.push(new THREE.Vector3(xOf(u), y1Of(u), zOf(u))) }
  return new LoftGeometry([lo, hi], { closed: false })
}
const box = (sx, sy, sz, x, y, z) => new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z)
const rbox = (sx, sy, sz, r, x, y, z) => new RoundedBoxGeometry(sx, sy, sz, 2, r).translate(x, y, z)

// small noise texture for the carpet (8-bit + linear filtering: safe on Safari, #73)
function carpetTexture() {
  const n = 64, d = new Uint8Array(n * n * 4)
  let s = 7
  for (let i = 0; i < n * n; i++) { s = (s * 16807) % 2147483647; const v = 200 + (s % 56); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255 }
  const t = new THREE.DataTexture(d, n, n, THREE.RGBAFormat)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true
  t.needsUpdate = true
  return t
}

// ---------- the boat ----------
const DECK_AFT = -2.05, DECK_FWD = 0.5, FLOOR_Y = 0.2, CAP = 0.16 // cockpit footwell between the rear and bow decks
export function makeBassBoat() {
  const hullMat = new THREE.MeshPhysicalMaterial({ color: '#3a3f46', metalness: 0.1, roughness: 0.45, clearcoat: 0.55, clearcoatRoughness: 0.18, side: THREE.DoubleSide })
  const lineMat = new THREE.MeshStandardMaterial({ color: '#5b6571', metalness: 0.2, roughness: 0.45, side: THREE.DoubleSide })
  const carpetMat = new THREE.MeshStandardMaterial({ color: '#7a8086', roughness: 0.96, map: carpetTexture(), side: THREE.DoubleSide })
  const seamMat = new THREE.MeshStandardMaterial({ color: '#202327', roughness: 0.8 })
  const seatMat = new THREE.MeshStandardMaterial({ color: '#2f3237', roughness: 0.62 })
  const blackMat = new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.5, metalness: 0.25 })
  const metalMat = new THREE.MeshStandardMaterial({ color: '#a3aab1', roughness: 0.32, metalness: 0.45 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#86a2ad', transparent: true, opacity: 0.42, roughness: 0.06, metalness: 0, side: THREE.DoubleSide, depthWrite: false })

  const uA = uOf(DECK_AFT), uF = uOf(DECK_FWD)
  const ysAt = (x) => sheerY(uOf(x))

  // hull shell + gunwale caps along the cockpit + cockpit walls (gelcoat)
  const hull = hullGeometry()
  const capOuter = (u) => sheerB(u) - 0.03, capInner = (u) => sheerB(u) - CAP
  const capPanel = (sgn) => deckPanel([...Array.from({ length: 13 }, (_, i) => { const u = uA + ((uF - uA) * i) / 12; return [xOf(u), sgn * capOuter(u)] }),
    ...Array.from({ length: 13 }, (_, i) => { const u = uF - ((uF - uA) * i) / 12; return [xOf(u), sgn * capInner(u)] })], (x) => ysAt(x) - 0.004)
  const walls = [1, -1].map((sgn) => wall(uA, uF, (u) => sgn * capInner(u), FLOOR_Y, (u) => sheerY(u) - 0.004))
  const gel = merge([hull, capPanel(1), capPanel(-1), ...walls])

  // decks (carpet): bow casting deck, rear deck, cockpit floor, the two step faces
  const bowDeck = deckPanel(deckOutline(uF, 1, 0.03, 30), (x) => ysAt(x) - 0.006)
  const rearDeck = deckPanel(deckOutline(0.004, uA, 0.03, 8), () => sheerY(0) - 0.03)
  const floor = deckPanel(deckOutline(uA, uF, CAP, 12), () => FLOOR_Y)
  const stepFace = (u, y1) => { const z = capInner(u); return new THREE.PlaneGeometry(2 * z, y1 - FLOOR_Y).rotateY(Math.PI / 2).translate(xOf(u), (y1 + FLOOR_Y) / 2, 0) }
  const carpet = merge([bowDeck, rearDeck, floor, stepFace(uA, sheerY(0) - 0.03), stepFace(uF, ysAt(DECK_FWD) - 0.006)])

  // hatch seams: rod locker and side lockers on the bow deck, two livewell lids on the rear deck
  const seams = []
  const lid = (x0, x1, z0, z1, y) => { const t = 0.012, h = 0.006; seams.push(box(x1 - x0, h, t, (x0 + x1) / 2, y, z0), box(x1 - x0, h, t, (x0 + x1) / 2, y, z1), box(t, h, z1 - z0, x0, y, (z0 + z1) / 2), box(t, h, z1 - z0, x1, y, (z0 + z1) / 2)) }
  lid(0.78, 2.35, -0.2, 0.2, ysAt(1.5))
  for (const s of [1, -1]) lid(0.85, 1.7, s > 0 ? 0.42 : -0.9, s > 0 ? 0.9 : -0.42, ysAt(1.3))
  for (const s of [1, -1]) lid(-3.1, -2.25, s > 0 ? 0.16 : -0.88, s > 0 ? 0.88 : -0.16, sheerY(0) - 0.026)

  // consoles: driver (starboard) and passenger (port), rounded fronts, dash sloping toward the seats
  const consoleGeo = (w, h, z0) => {
    const s = new THREE.Shape()
    s.moveTo(-0.06, FLOOR_Y); s.lineTo(0.47, FLOOR_Y)
    s.quadraticCurveTo(0.53, FLOOR_Y + h * 0.55, 0.4, FLOOR_Y + h * 0.82)
    s.quadraticCurveTo(0.3, FLOOR_Y + h, 0.12, FLOOR_Y + h)
    s.lineTo(-0.06, FLOOR_Y + h - 0.09); s.lineTo(-0.06, FLOOR_Y)
    const g = new THREE.ExtrudeGeometry(s, { depth: w - 0.06, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 8 })
    return g.translate(0, 0, z0 - (w - 0.06) / 2)
  }
  const DRV = { z: 0.6, w: 0.62, h: 0.66 }, PAS = { z: -0.6, w: 0.56, h: 0.58 }
  const consoles = merge([consoleGeo(DRV.w, DRV.h, DRV.z), consoleGeo(PAS.w, PAS.h, PAS.z)])
  // wraparound windshields: a tinted strip round the front and the outboard side, leaning back
  const shield = (c, side) => {
    const yb = FLOOR_Y + c.h - 0.03, path = [[0.18, c.z - side * c.w * 0.5], [0.33, c.z - side * c.w * 0.18], [0.35, c.z + side * c.w * 0.12], [0.24, c.z + side * c.w * 0.5], [-0.04, c.z + side * (c.w * 0.5 + 0.02)]]
    const lo = path.map(([x, z]) => new THREE.Vector3(x, yb, z)), hi = path.map(([x, z]) => new THREE.Vector3(x - 0.1, yb + 0.3, z + side * 0.01))
    return new LoftGeometry([lo, hi], { closed: false })
  }
  const glass = merge([shield(DRV, 1), shield(PAS, -1)])
  const wheel = merge([new THREE.TorusGeometry(0.15, 0.016, 6, 20).rotateY(Math.PI / 2).rotateZ(-0.5).translate(-0.02, FLOOR_Y + DRV.h - 0.02, DRV.z), new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6).rotateZ(Math.PI / 2 - 0.5).translate(0.02, FLOOR_Y + DRV.h - 0.04, DRV.z)])
  const dash = merge([box(0.16, 0.012, 0.36, 0.05, FLOOR_Y + DRV.h - 0.035, DRV.z), box(0.14, 0.012, 0.3, 0.05, FLOOR_Y + PAS.h - 0.035, PAS.z)])

  // seats: the bucket bench behind the consoles, bow and rear pedestal seats (dark vinyl)
  const bench = [box(0.46, 0.27, 1.9, -1.08, FLOOR_Y + 0.135, 0)]
  const benchTop = []
  for (const [z, w] of [[0.6, 0.52], [0, 0.36], [-0.6, 0.52]]) {
    benchTop.push(rbox(0.46, 0.1, w, 0.04, -1.06, FLOOR_Y + 0.32, z))
    benchTop.push(rbox(0.1, 0.42, w, 0.04, -1.29, FLOOR_Y + 0.6, z)) // backrest
  }
  const pedestal = (x, y) => [new THREE.CylinderGeometry(0.035, 0.05, 0.36, 8).translate(x, y + 0.18, 0), rbox(0.42, 0.09, 0.44, 0.035, x, y + 0.4, 0), rbox(0.08, 0.26, 0.4, 0.03, x - 0.19, y + 0.57, 0)]
  const seatsNear = merge([...bench, ...benchTop, ...pedestal(2.15, ysAt(2.15) - 0.006), ...pedestal(-2.72, sheerY(0) - 0.03)])
  const seatsFar = merge([...bench, ...benchTop.filter((_, i) => i % 2 === 0)])

  // rub rail (round the sheer, bow included) and one thin side line (muted, #83)
  const railPts = []
  for (let i = 0; i < 40; i++) { const u = i / 40; railPts.push(new THREE.Vector3(xOf(u), sheerY(u) - 0.012, sheerB(u) + 0.012)) }
  railPts.push(new THREE.Vector3(L / 2 + 0.012, sheerY(1) - 0.012, 0)) // round the stem
  const rail = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...railPts, ...railPts.slice(0, -1).reverse().map((p) => new THREE.Vector3(p.x, p.y, -p.z))], false, 'centripetal'), 160, 0.022, 6, false)
  const sideLine = [1, -1].map((sgn) => {
    const lo = [], hi = []
    for (let i = 0; i <= 24; i++) {
      const u = 0.004 + 0.83 * (i / 24), taper = 1 - ss(0.62, 0.83, u), y = sheerY(u) - 0.1
      lo.push(new THREE.Vector3(xOf(u), y - 0.018 * taper, sgn * (sideZ(u, y - 0.018 * taper) + 0.004)))
      hi.push(new THREE.Vector3(xOf(u), y + 0.018 * taper, sgn * (sideZ(u, y + 0.018 * taper) + 0.004)))
    }
    return new LoftGeometry([lo, hi], { closed: false })
  })
  const line = merge(sideLine)

  // outboard (a 250-class V6, plain black, no badges) on a jack plate
  const cx = -L / 2 - 0.5
  const cowlShape = new THREE.Shape()
  cowlShape.moveTo(0.28, 0.6); cowlShape.quadraticCurveTo(0.36, 0.88, 0.2, 1.06); cowlShape.quadraticCurveTo(0.02, 1.16, -0.2, 1.12)
  cowlShape.quadraticCurveTo(-0.38, 1.06, -0.39, 0.84); cowlShape.lineTo(-0.33, 0.6); cowlShape.lineTo(0.28, 0.6)
  const cowl = new THREE.ExtrudeGeometry(cowlShape, { depth: 0.46, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3, curveSegments: 10 }).translate(cx, 0, -0.23)
  const lowerCowl = rbox(0.62, 0.42, 0.52, 0.06, cx - 0.04, 0.38, 0)
  const foil = new THREE.Shape([[0.13, 0], [0.04, 0.055], [-0.12, 0.025], [-0.15, 0], [-0.12, -0.025], [0.04, -0.055]].map(([a, b]) => new THREE.Vector2(a, b)))
  const leg = new THREE.ExtrudeGeometry(foil, { depth: 0.74, bevelEnabled: false, curveSegments: 4 }).rotateX(-Math.PI / 2).translate(cx, -0.57, 0)
  const torpedo = new THREE.CapsuleGeometry(0.075, 0.4, 4, 10).rotateZ(Math.PI / 2).translate(cx + 0.02, -0.6, 0)
  const skeg = box(0.18, 0.22, 0.03, cx + 0.05, -0.76, 0)
  const avPlate = box(0.46, 0.014, 0.28, cx - 0.02, -0.4, 0)
  const outboard = merge([cowl, lowerCowl, leg, torpedo, skeg, avPlate])
  const blades = [0, 1, 2].map((k) => new THREE.SphereGeometry(1, 8, 6).scale(0.025, 0.15, 0.075).translate(0, 0.12, 0).rotateX((k * 2 * Math.PI) / 3).translate(cx - 0.3, -0.6, 0))
  const metal = merge([rail, box(0.2, 0.46, 0.42, -L / 2 - 0.1, 0.12, 0), box(0.6, 0.02, 0.5, cx - 0.04, 0.6, 0), new THREE.CylinderGeometry(0.05, 0.06, 0.12, 8).rotateZ(Math.PI / 2).translate(cx - 0.26, -0.6, 0), ...blades])
  const metalFar = merge([box(0.2, 0.46, 0.42, -L / 2 - 0.1, 0.12, 0), box(0.6, 0.02, 0.5, cx - 0.04, 0.6, 0)])

  // bow trolling motor with the PingLive on its shaft — the old parts, lifted onto the new deck (#83)
  const tx = L / 2 - 0.35, tz = 0.35, lift = ysAt(tx) - 0.006 - 0.26
  const tmShaft = new THREE.CylinderGeometry(0.03, 0.03, 1.6 + lift, 6).translate(tx, -0.5 + lift / 2, tz)
  const tmHead = new RoundedBoxGeometry(0.42, 0.2, 0.22, 2, 0.05).translate(tx - 0.05, 0.34 + lift, tz)
  const tmMount = box(0.7, 0.08, 0.3, tx - 0.2, 0.3 + lift, tz)
  const tmLower = new THREE.CylinderGeometry(0.06, 0.08, 0.42, 8).rotateZ(Math.PI / 2).translate(tx, -1.2, tz)
  const puck = box(0.16, 0.12, 0.2, tx + 0.02, -0.95, tz + 0.12) // the PingLive
  const black = merge([outboard, tmShaft, tmHead, tmMount, tmLower])
  const puckMat = new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.4 })

  // two levels of detail: everything up close; from the overview / phone camera (the boat is small there) no seams,
  // rail, glass, wheel or pedestal seats
  const mesh = (g, m) => new THREE.Mesh(g, m)
  const near = new THREE.Group(), far = new THREE.Group()
  near.add(mesh(gel, hullMat), mesh(carpet, carpetMat), mesh(consoles, hullMat), mesh(merge(seams), seamMat), mesh(dash, seamMat), mesh(seatsNear, seatMat), mesh(line, lineMat),
    mesh(black, blackMat), mesh(metal, metalMat), mesh(wheel, blackMat), mesh(puck, puckMat), mesh(glass, glassMat))
  far.add(mesh(gel, hullMat), mesh(carpet, carpetMat), mesh(consoles, hullMat), mesh(seatsFar, seatMat), mesh(black, blackMat), mesh(metalFar, metalMat), mesh(puck, puckMat))
  const lod = new THREE.LOD()
  lod.addLevel(near, 0)
  lod.addLevel(far, 38)
  return lod
}

// ---------- where the hull meets the water ----------
// A foam ribbon along the waterline (wider at the bow, brighter when moving) and a soft dark patch under the hull.
// Both stay on the (flat) water while the boat bobs (Scene.jsx).
export function makeWaterContact() {
  const st = [], N = 40
  let uEnd = 1
  for (let i = 0; i <= N; i++) { const u = (i / N) * 0.99; if (waterlineZ(u) == null) { uEnd = u; break } }
  for (let i = 0; i <= N; i++) {
    const u = (uEnd - 0.002) * (i / N), z = waterlineZ(u) ?? 0, w = 0.3 + 0.3 * ss(0.55, uEnd, u) // reaches past the flare; a bow wave forward
    st.push([xOf(u), z, w])
  }
  const xTip = xOf(uEnd) + 0.05
  const sections = []
  for (const [x, z, w] of st) sections.push([new THREE.Vector3(x, 0, z - 0.03), new THREE.Vector3(x, 0, z + w)])
  sections.push([new THREE.Vector3(xTip - 0.03, 0, 0), new THREE.Vector3(xTip + 0.6, 0, 0)])
  for (const [x, z, w] of st.slice().reverse()) sections.push([new THREE.Vector3(x, 0, -z + 0.03), new THREE.Vector3(x, 0, -z - w)])
  const foamGeo = new LoftGeometry(sections, { closed: false })
  const foamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uFoam: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vW;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `precision highp float; varying vec2 vUv; varying vec3 vW; uniform float uTime; uniform float uFoam;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main() {
        float edge = pow(1.0 - vUv.y, 1.3);                              // strongest against the hull
        float n = vnoise(vW.xz * 7.0 + vec2(uTime * 0.7, -uTime * 0.5)) * 0.6 + vnoise(vW.xz * 17.0 - uTime) * 0.4;
        float a = edge * smoothstep(0.15, 0.65, n + 0.35 * edge) * (0.6 + 0.4 * uFoam) * 0.85;
        gl_FragColor = vec4(vec3(0.92, 0.96, 0.97), a);
      }`,
  })
  const foam = new THREE.Mesh(foamGeo, foamMat)
  foam.renderOrder = 2 // over the water surface (transparent, drawn at 0)
  const shadeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `precision highp float; varying vec2 vUv;
      void main() { float r = length((vUv - 0.5) * 2.0); gl_FragColor = vec4(0.03, 0.14, 0.17, 0.34 * (1.0 - smoothstep(0.45, 1.0, r))); }`,
  })
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.18, W * 1.45).rotateX(-Math.PI / 2).translate(0.1, -0.05, 0), shadeMat)
  shade.renderOrder = -1 // under the water surface
  const g = new THREE.Group()
  g.add(shade, foam)
  g.userData.foam = foamMat
  return g
}

export const TRANSDUCER_OFFSET = new THREE.Vector3(L / 2 - 0.33, -0.95, 0.47)
