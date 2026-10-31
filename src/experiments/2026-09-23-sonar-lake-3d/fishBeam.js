// Fish in the beam (Jason 2026-10-31, docs/2026-10-31-fish-in-beam-plan.md): the transducer looks somewhere and a reasonable
// number of fish is in the beam. No fish is added and nothing about the beam or the picture changes: while the boat is
// still, when the active beam holds fewer than its minimum, the nearest free fish swim over, about 10 s, ≤ 1 m/s, on a gentle
// curve that starts along the way the fish is already swimming. A visitor circles inside the beam for 30–60 s, and leaves
// only if the beam stays at its minimum without it. Fish already in the beam are never touched, nothing is pushed out above
// the maximum, nothing is called during a drag. The opening spot gets its minimum before the first frame (seedBeamFish).
// Only the poses (fish.js visitPose) know about the visit; this file decides who comes and where to.
import { SPECIES, fishPose, drawnLen, bottomGap, makeVisitPath, makeVisit, startVisitBack, visitInBeamPhase } from './fish'
import { DEVICES } from '../2026-09-23-sonar-beam/devices'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'

// the minimum per fan (Jason's table). The maxima (Mini 5, PingLive 8, Panoramic 8 / 10) only matter in that nothing is called above the minimum
const beamMin = (deviceId, mode) => (mode === 'panoramic' ? (deviceId === 'PL' ? 6 : 4) : deviceId === 'PL' ? 4 : 3)
const REACH = 25 // m: a fish further off does not come
const MAX_CLIMB = 7 // m: a fish keeps roughly to its own depth
const pick = (a, b) => a + (b - a) * Math.random()
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const dot = (v, x, y, z) => v.x * x + v.y * y + v.z * z

// is the point (relative to the apex) inside the fan?
export function inFan(sp, dx, dy, dz) {
  const { c, h, n } = sp.frame, dc = dot(c, dx, dy, dz), dh = dot(h, dx, dy, dz), dn = dot(n, dx, dy, dz)
  if (dc < 0.3 || dx * dx + dy * dy + dz * dz > sp.R * sp.R) return false
  const a = Math.atan2(dh, dc)
  if (a < sp.a0 || a > sp.a1) return false
  if (sp.s0 === 0) { if (dn < 0 || dn > Math.hypot(dc, dh) * Math.tan(sp.theta)) return false } // the flat fan: its slab lies below the fan's own plane
  else if (Math.abs(dn) > Math.max(0.08, dc * Math.tan(sp.theta))) return false
  if (sp.box && (dx > sp.box.xMax || dx < sp.box.xMin || -dy > sp.box.yMax || (sp.box.zMax != null && Math.abs(dz) > sp.box.zMax))) return false
  return true
}

// the point of the fan nearest to where the fish is, well inside, at a depth the water there allows. Relative to the apex.
function targetIn(sp, p, apex, top, f, bedY, narrowZ) {
  const gap = bottomGap(f) + 0.35
  let Y = -(p.y - apex.y), X = p.x - apex.x, Z = p.z - apex.z
  const ceil = apex.y - top
  for (let i = 0; i < 3; i++) {
    Y = Math.max(Y, ceil)
    if (sp.s0 === 0) {
      const xMax = (sp.box?.xMax ?? sp.R) * 0.9, half = 0.8 * (sp.a1 - sp.a0) / 2, a = clamp(Math.atan2(Z, X), -half, half)
      if (Y / Math.tan(0.34) > xMax) Y = xMax * Math.tan(0.34)
      const r = clamp(Math.hypot(X, Z), Y / Math.tan(0.34), Math.min(xMax, Y / Math.tan(0.17))) // 10°–19° below the surface, inside the 5°–25° slab
      X = r * Math.cos(a); Z = r * Math.sin(a)
      if (narrowZ) Z = clamp(Z, -narrowZ * r, narrowZ * r)
    } else {
      const tilt = Math.atan2(sp.frame.c.x, -sp.frame.c.y), half = (sp.a1 - sp.a0) / 2, xMax = (sp.box?.xMax ?? sp.R) * 0.9
      if (sp.box) Y = Math.min(Y, sp.box.yMax * 0.92)
      const a0 = tilt - 0.62 * half, a1 = tilt + 0.62 * half
      if (Y * Math.tan(a0) > xMax) Y = xMax / Math.tan(a0)
      const lo = Y * Math.tan(a0), hi = a1 > 1.5 ? xMax : Math.min(xMax, Y * Math.tan(a1))
      X = clamp(X, lo, hi)
      const u = X * Math.sin(tilt) + Y * Math.cos(tilt), hz = u * Math.tan(sp.theta) * 0.45
      Z = clamp(Z, -hz, hz)
      if (Math.hypot(X, Y, Z) > sp.R * 0.94) { const m = (sp.R * 0.94) / Math.hypot(X, Y, Z); X *= m; Y *= m; Z *= m }
    }
    Y = Math.min(Y, apex.y - (bedY(apex.x + X, apex.z + Z) + gap))
    if (Y < ceil) return null
  }
  return inFan(sp, X, -Y, Z) ? { x: apex.x + X, y: apex.y - Y, z: apex.z + Z } : null
}

const clearPoint = (f, x, y, z, r, top, circles, bedY) => {
  const Ld = drawnLen(f), cl = 0.34 * Ld + r, hy = 0.12 * Ld + 0.25, gap = bottomGap(f) - 0.3
  if (y > top) return false
  if (y - bedY(x, z) < gap) return false
  if (r > 0) for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; if (y - 0.25 - bedY(x + r * Math.cos(a), z + r * Math.sin(a)) < gap) return false } // the slow loop's whole area, on a slope too
  for (const c of circles) if (y + hy > c.y0 && y - hy < c.y1 && Math.hypot(x - c.x, z - c.z) < c.r + cl) return false
  return true
}

// the fish's whole way in: curved one way, the other, or nearly straight
function pathIn(f, t, T, sp, apex, top, circles, bedY) {
  const p = fishPose(f, t, {}), v = fishPose(f, t + 0.05, {})
  let dir = [v.x - p.x, v.y - p.y, v.z - p.z]
  const nd = Math.hypot(...dir) || 1; dir = dir.map((d) => d / nd)
  const v0 = nd / 0.05, stay = makeStay(sp, T, p, apex)
  for (const b of [0.12 * (Math.random() < 0.5 ? 1 : -1), -0.12, 0.03]) {
    const path = makeVisitPath(p, dir, T, stay.dir, b, Math.min(v0, 0.5), stay.speed)
    if (path.points.every((q) => clearPoint(f, q[0], q[1], q[2], 0.15, top, circles, bedY))) return { path, stay, v0 }
  }
  return null
}
// the slow loop a visitor swims inside the beam: small enough to stay in the slab, starting along the way the fish arrives
function makeStay(sp, T, p, apex) {
  const flat = sp.s0 === 0, u = Math.hypot(T.x - apex.x, T.y - apex.y, T.z - apex.z)
  const ax = (flat ? 0.5 : clamp(0.14 * u, 0.3, 1)) * (p.x <= T.x ? 1 : -1), az = (flat ? 0.3 : clamp(0.1 * u * Math.tan(sp.theta) * 2, 0.08, 0.3)) * (p.z <= T.z ? 1 : -1), ay = Math.min(0.2, 0.05 * u), w = 0.22
  const dir = [ax, 1.3 * ay, 0.7 * az], n = Math.hypot(...dir)
  return { ax, az, ay, w, dir: dir.map((d) => d / n), speed: n * w }
}

const live = (f) => f.act?.kind === 'visit'
function counts(pop, t, specs, apex, o) {
  const n = specs.map(() => 0), going = specs.map(() => 0)
  for (const f of pop) {
    if (f.species === 'smelt' || !f.radius) continue
    const a = f.act
    if (live(f) && visitInBeamPhase(a, t) === 'in' && a.spec === specs) { if (specs[a.fan]) going[a.fan]++; continue }
    fishPose(f, t, o)
    specs.forEach((sp, k) => { if (inFan(sp, o.x - apex.x, o.y - apex.y, o.z - apex.z)) n[k]++ })
  }
  return [n, going]
}

const makeState = () => ({ next: 0, ax: null, az: null, still: 0 })
const pops = new WeakMap()

// call fish for fan k; nearest first
function call(pop, t, specs, k, need, apex, top, circles, bedY, o, taken) {
  const sp = specs[k], list = []
  for (const f of pop) {
    if (f.species === 'smelt' || !f.radius || f.act || f.burst || f.until > t || f.beamCool > t) continue
    fishPose(f, t, o)
    if (specs.some((s) => inFan(s, o.x - apex.x, o.y - apex.y, o.z - apex.z))) continue
    const T = targetIn(sp, { x: o.x + pick(-1.5, 1.5), y: o.y, z: o.z + pick(-1.5, 1.5) }, apex, top, f, bedY)
    if (!T || Math.abs(T.y - o.y) > MAX_CLIMB) continue
    const d = Math.hypot(T.x - o.x, T.z - o.z)
    if (d <= REACH) list.push([d, f, T])
  }
  list.sort((a, b) => a[0] - b[0]) // nearest to the beam, not to the boat
  let tries = 0
  for (const [, f, T] of list) {
    if (need <= 0 || tries++ > 14) break
    if (taken.some((q) => Math.hypot(q.x - T.x, q.y - T.y, q.z - T.z) < 1.3) || !clearPoint(f, T.x, T.y, T.z, 0.6, top, circles, bedY)) continue
    const way = pathIn(f, t, T, sp, apex, top, circles, bedY)
    if (!way) continue
    f.act = makeVisit(t, way.path, way.stay, T, k, specs, way.path.T + pick(30, 60), apex)
    taken.push(T); need--
  }
}

function release(f, t, top, circles, bedY) {
  const back = startVisitBack(f, t, 0.7)
  if (back.points.every((q) => clearPoint(f, q[0], q[1], q[2], 0.15, top, circles, bedY))) f.act.back = back
  else { f.act.t2 = Infinity; f.act.until = t + 4 } // nothing in the way next time, or it stays a little longer
}

// every frame, after the behaviours
export function stepBeamFish(pop, t, specs, deviceId, mode, apex, busy, top, circles, bedY) {
  if (!apex || apex.y === 0) return
  const b = pops.get(pop) || makeState(); pops.set(pop, b)
  const moved = b.ax === null || Math.hypot(apex.x - b.ax, apex.z - b.az) > 0.01
  b.ax = apex.x; b.az = apex.z
  if (moved || busy) b.still = t
  for (const f of pop) if (live(f) && f.act.back && t > f.act.t2 + f.act.back.T) { f.act = null; f.beamCool = t + pick(20, 40) } // home again; a fish does not follow the boat from spot to spot
  if (t < b.next) return
  b.next = t + 1
  const o = {}, min = beamMin(deviceId, mode), [n, going] = specs.length ? counts(pop, t, specs, apex, o) : [[], []]
  for (const f of pop) {
    if (!live(f) || f.act.back || visitInBeamPhase(f.act, t) !== 'stay') continue
    const a = f.act, far = Math.hypot(a.apex.x - apex.x, a.apex.z - apex.z) > 1.5 // the boat moved off: it goes home now
    if (!far && t < a.until) continue
    fishPose(f, t, o)
    const fans = specs.map((sp, k) => (inFan(sp, o.x - apex.x, o.y - apex.y, o.z - apex.z) ? k : -1)).filter((k) => k >= 0)
    if (!far && fans.some((k) => n[k] <= min)) { a.until = t + 10; continue } // the beam needs it
    release(f, t, top, circles, bedY)
    if (f.act?.back) fans.forEach((k) => n[k]--)
  }
  if (t - b.still < 1.2 || !specs.length) return // the boat has settled first
  const taken = []
  specs.forEach((_, k) => { const need = min - n[k] - going[k]; if (need > 0) call(pop, t, specs, k, need, apex, top, circles, bedY, o, taken) })
}

// the opening spot, before the first frame: whichever device and view the visitor picks first has its minimum. Fish are placed
// (no one sees it), each in its slow loop: 4 under the boat (Mini and PingLive Down), 4 ahead in the Panoramic slab and in the
// Mini's Forward slab, and on the lake 2 more out to the side for PingLive Panoramic. Fish already there count.
export function seedBeamFish(pop, t, apex, ice, top, depthM, circles, bedY) {
  const R = 80 * 0.3048, o = {}
  const down = wedgeSpecs(DEVICES.PLM, 'down', Math.max(depthM / 0.8, 8))[0]
  const fwd = { ...wedgeSpecs(DEVICES.PLM, 'forward', R)[0], box: { xMin: 0, xMax: R, yMax: depthM / 0.8 } }, flat = { ...wedgeSpecs(DEVICES.PLM, 'panoramic', R)[0], box: { xMin: -1e5, xMax: R, yMax: 1e5 } }
  const wide = { ...wedgeSpecs(DEVICES.PL, 'panoramic', R)[0], R: 1.6 * R, box: { xMin: -1e5, xMax: R, yMax: 1e5, zMax: 0.936 * R } }
  const jobs = ice ? [[down, 4, down], [fwd, 4, fwd]] : [[down, 4, down], [flat, 4, fwd], [wide, 6, wide]]
  const taken = []
  for (const [sp, want, check] of jobs) {
    let have = 0
    for (const f of pop) { if (f.species === 'smelt' || !f.radius) continue; fishPose(f, t, o); if (inFan(sp, o.x - apex.x, o.y - apex.y, o.z - apex.z) && inFan(check, o.x - apex.x, o.y - apex.y, o.z - apex.z)) have++ }
    const list = pop.filter((f) => f.species !== 'smelt' && f.radius && !f.act).map((f) => { fishPose(f, t, o); return [Math.hypot(o.x - apex.x, o.z - apex.z), f] }).sort((a, b) => a[0] - b[0])
    for (const [, f] of list) {
      if (have >= want) break
      fishPose(f, t, o)
      for (let i = 0; i < 6; i++) { // among standing timber the spot is tight: a few tries, and a smaller loop
        const T = targetIn(sp, { x: apex.x + (sp === down ? pick(-2, 2) : pick(6, 20)), y: o.y, z: sp === wide ? o.z : apex.z + pick(-0.5, 0.5) }, apex, top, f, bedY, sp === flat ? 0.1 : 0)
        if (!T || !inFan(check, T.x - apex.x, T.y - apex.y, T.z - apex.z) || Math.abs(T.y - o.y) > 14) continue
        if (taken.some((q) => Math.hypot(q.x - T.x, q.y - T.y, q.z - T.z) < 0.7) || !clearPoint(f, T.x, T.y, T.z, 0.25, top, circles, bedY)) continue
        const stay = makeStay(sp, T, { x: T.x - Math.random() + 0.5, z: T.z - Math.random() + 0.5 }, apex)
        if (!clearPoint(f, T.x, T.y, T.z, 0.6, top, circles, bedY)) { stay.ax *= 0.35; stay.az *= 0.35 }
        f.act = makeVisit(t, null, stay, T, -1, null, t + pick(30, 60), apex)
        taken.push(T); have++
        break
      }
    }
  }
}
