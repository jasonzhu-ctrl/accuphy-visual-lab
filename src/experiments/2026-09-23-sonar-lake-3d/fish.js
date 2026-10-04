// Fish species — real North American sizes (metres). Jason 2026-09-23.
// Jason 2026-09-24: at this camera distance real sizes are invisible, so fish are
// DRAWN at FISH_DISPLAY_SCALE × their true length. Data stays true.
export const FISH_DISPLAY_SCALE = 2.6
// Drawn length of one fish. Decision #85: the display size can differ per species (`scale` in SPECIES, default
// FISH_DISPLAY_SCALE); everything that sizes or clears a DRAWN fish goes through here. The sonar keeps f.len.
export const drawnLen = (f) => f.len * (SPECIES[f.species].scale ?? FISH_DISPLAY_SCALE)
// Colours/markings researched per species (2026-09-24, Jason: "仔细研究, 现在有重复").
// back → side → belly gradient. pattern: 0 none · 1 dark vertical bars on the
// sides · 2 light spots · 3 dark speckle all over · 4 dark lateral band of
// blotches · 5 dark saddles on the back · 6 small black spots on the upper half
// · 7 bright silver lateral stripe · 8 broken, irregular dark vertical bars (musky) · 9 rows of pale bean-shaped spots
// (northern pike) · 10 dark bars tapering down a yellow side, orange lower fins (yellow perch).
export const SPECIES = {
  largemouth: { name: 'Largemouth bass', len: [0.38, 0.55], body: 'bass',     back: '#2f4a1f', side: '#6f8f3f', belly: '#e9e7cc', pattern: 4 }, // green, black lateral band
  smallmouth: { name: 'Smallmouth bass', len: [0.33, 0.45], body: 'bass',     back: '#4a3d1c', side: '#8a6d34', belly: '#dccfa5', pattern: 1 }, // bronze-brown, vertical bars
  walleye:    { name: 'Walleye',         len: [0.45, 0.70], body: 'walleye',  back: '#55582a', side: '#c49a3c', belly: '#f4efd8', pattern: 5 }, // golden-brass, dark saddles, glassy eye, white tail tip
  crappie:    { name: 'Crappie',         len: [0.25, 0.35], body: 'panfish',  back: '#4f5d5a', side: '#aab4b4', belly: '#f1f4f4', pattern: 3 }, // silver, dark mottling
  smelt:      { name: 'Smelt',           len: [0.12, 0.20], body: 'bait',     back: '#6a8a84', side: '#c7d6d8', belly: '#f4f8f8', pattern: 7 }, // translucent olive back, silver stripe
  musky:      { name: 'Muskellunge',     len: [0.75, 1.30], body: 'pike',     back: '#3f4a2c', side: '#8f9f6e', belly: '#e9e4cf', pattern: 8, scale: 2.2 }, // olive-brown back, silver-green/golden sides, broken dark bars; drawn 2.2× (Jason, #89)
  laketrout:  { name: 'Lake trout',      len: [0.60, 0.90], body: 'salmonid', back: '#2f3b37', side: '#5c6a63', belly: '#d9ddd4', pattern: 2 }, // dark grey-green, light spots
  salmon:     { name: 'Chinook salmon',  len: [0.70, 1.00], body: 'salmonid', back: '#34485a', side: '#b3c0c9', belly: '#f2f4f5', pattern: 6 }, // steel-blue back, silver, black spots
  // phase 3 (#89, #90): Canada's staples
  yellowperch: { name: 'Yellow perch',   len: [0.18, 0.30], body: 'perch',    back: '#4a5a24', side: '#c8b247', belly: '#efe6c2', pattern: 10 }, // olive back, yellow sides, dark bars
  pike:       { name: 'Northern pike',   len: [0.50, 0.90], body: 'pike',     back: '#2f4426', side: '#6e8a4a', belly: '#e6e8d0', pattern: 9 }, // green, pale bean-shaped spots
}

let seed = 11
export const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
const range = ([a, b]) => a + (b - a) * rnd()

// Build the population: [{ species, len, home:[x,y,z], phase, radius, speed }]
// `bedY(x,z)` gives the lakebed height so fish sit at realistic heights; `obstacles` (obstacles.js, as
// circles) keeps every swim loop clear of timber, rocks, wrecks and the logo.
export function makePopulation(bedY, obstacles) {
  const fish = []
  const add = (species, x, z, offBottom, n = 1, spread = 0) => {
    for (let i = 0; i < n; i++) {
      const px = x + (rnd() - 0.5) * spread, pz = z + (rnd() - 0.5) * spread
      const y = bedY(px, pz) + offBottom + (rnd() - 0.5) * Math.min(spread, 3) * 0.5
      // schools move together: a shared swim direction and phase per school (derived from the school's
      // position, so no extra rnd() calls and every fish keeps its place) — the app shows a school as
      // parallel streaks (sonar-style.md §7.13)
      const sh = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1
      const ph0 = rnd() * Math.PI * 2
      fish.push({ species, len: range(SPECIES[species].len), home: [px, y, pz], phase: sh * 40 + (ph0 - Math.PI) * 0.13, rot: sh * Math.PI * 2 + ((ph0 * 7.1) % 1 - 0.5) * 0.5, radius: 1.5 + rnd() * 3, speed: 0.15 + rnd() * 0.2 })
    }
  }
  const addOne = (species, x, z, offBottom, len) => {
    const y = bedY(x, z) + offBottom
    const ph = rnd() * Math.PI * 2
    fish.push({ species, len, home: [x, y, z], phase: ph, rot: (ph * 3.7) % (Math.PI * 2), radius: 4 + rnd() * 4, speed: 0.08 + rnd() * 0.06 })
  }
  // bass hold on timber (shelf edge x≈-18) and the rock hump (30,12)
  add('largemouth', -16, 4, 1.2, 4, 10)
  add('largemouth', 28, 10, 1.5, 3, 8)
  add('smallmouth', 31, 14, 1.0, 4, 10)
  // walleye along the drop-off, tight to the bottom
  add('walleye', -8, -10, 0.6, 3, 14)
  add('walleye', -6, 18, 0.6, 3, 12)
  // crappie: two loose schools suspended near timber
  add('crappie', -15, -2, 4.0, 14, 5)
  add('crappie', -20, 12, 3.5, 12, 5)
  // shelf bait for the Panoramic step (the app's lake frames are full of small dashes in 1–6 m of water)
  add('smelt', -46, 12, 2.5, 40, 7)
  add('crappie', -54, 4, 2.0, 8, 5)
  add('smelt', -58, 14, 2.0, 25, 6)
  add('smelt', -38, 2, 3.0, 30, 6)
  add('crappie', -40, 16, 1.5, 12, 6)
  add('largemouth', -35, 9, 1.0, 4, 6)
  // smelt: two tight bait balls in open water
  add('smelt', 10, -6, 7.0, 60, 4)
  add('smelt', 20, 26, 6.0, 50, 4)
  // three musky, small → large, cruising the weed/timber edges (Jason 2026-09-24)
  addOne('musky', -26, 14, 2.0, 0.78)
  addOne('musky', -4, 20, 2.5, 1.02)
  addOne('musky', 24, 22, 2.0, 1.28)
  // deep water (>25 m): lake trout tight to the bottom, chinook suspended
  // lake trout: low in the deep water, tight to the bottom (Jason 2026-09-24)
  add('laketrout', 4, -48, 1.2, 5, 16)
  add('laketrout', 46, -36, 1.2, 4, 16) // up-and-right deep slope too (Jason 2026-09-24)
  // chinook: 10 in the deep water at mixed depths — 3 a little closer/shallower
  // to the drop-off, the rest spread naturally over the 30–40 m basin
  addOne('salmon', 2, -22, 9.0, 0.82); addOne('salmon', 14, -24, 12.0, 0.9); addOne('salmon', -8, -26, 10.0, 0.76)
  ;[[10, -36, 18], [22, -40, 24], [-4, -40, 15], [30, -34, 20], [6, -50, 26], [18, -52, 14], [-14, -46, 21], [38, -28, 16], [48, -38, 22], [56, -30, 12], [42, -46, 26]]
    .forEach(([x, z, off]) => addOne('salmon', x, z, off, 0.7 + rnd() * 0.3))
  // phase 3 (Jason #85/#89): more walleye along the drop-off, yellow perch schools on the weedy shelf and the timber
  // edge, northern pike cruising the weed edges. Appended after everyone else, so no earlier fish moves.
  add('walleye', -14, 2, 0.6, 4, 12)
  add('walleye', 4, -20, 0.8, 3, 12)
  add('walleye', 14, 20, 0.7, 3, 10)
  add('yellowperch', -46, 4, 1.2, 9, 7)
  add('yellowperch', -32, 16, 1.0, 8, 6)
  add('yellowperch', -24, -8, 1.4, 8, 6)
  addOne('pike', -52, 9, 1.4, 0.62); addOne('pike', -40, -3, 1.6, 0.8); addOne('pike', -30, 22, 1.4, 0.55); addOne('pike', 34, 25, 1.8, 0.86)
  // Spread bass, musky and salmon through the water column — some deep, some shallow (Jason 2026-09-24:
  // 水层分散一点 有深有浅). Only the depth changes (x/z stay), from a per-fish hash so no rnd() calls shift.
  fish.forEach((f, i) => {
    const sp = f.species
    if (!['largemouth', 'smallmouth', 'musky', 'salmon'].includes(sp)) return
    const D = -bedY(f.home[0], f.home[2])
    const u = Math.abs(Math.sin(i * 12.9898 + f.home[0] * 3.1 + f.home[2] * 1.7) * 43758.5453) % 1
    const v = Math.abs(Math.sin(i * 78.233 + f.home[2] * 2.3) * 12345.678) % 1
    let depth
    if (sp === 'largemouth' || sp === 'smallmouth') {
      if (u < 0.4) return                                   // 40 % stay near the bottom / on the structure
      depth = u < 0.75 ? D * (0.35 + 0.3 * v) : 1.2 + 2.0 * v // 35 % suspended mid-water, 25 % shallow
    } else if (sp === 'musky') {
      depth = 1.5 + u * Math.max(0.5, D - 2.5)               // cruising anywhere from just under the surface down
    } else {
      depth = 4 + u * Math.max(0.5, D - 5)                    // chinook suspended across the whole column
    }
    depth = Math.min(Math.max(depth, 0.9), D - 0.4)
    f.home[1] = -depth
  })
  keepOffBottom(fish, bedY)
  keepUnderSurface(fish, bedY)
  if (obstacles) clearPaths(fish, obstacles, bedY) // a moved loop keeps the same bottom gap at its new spot
  // fewer smelt (phase 3, #85): every third one goes after placement, so the rest keep their exact places and the bait
  // balls stay dense but cheaper
  let nSmelt = 0
  for (let i = fish.length - 1; i >= 0; i--) if (fish[i].species === 'smelt' && nSmelt++ % 3 === 2) fish.splice(i, 1)
  // dev: ?fishtest — fixed fish at known spots so the sonar marks can be compared with the app's
  // frames (docs/sonar-style.md §7.2). The transducer sits ≈ (+3.0, −0.9, +0.5) from the ?boat point.
  // ?boat=28,11 → apex ≈ (31, −0.9, 11.5): Down view.  ?boat=16,11 → apex ≈ (19, −0.9, 11.5): PLM Forward.
  if (typeof window !== 'undefined' && /fishtest/.test(window.location.search)) {
    const T = (species, len, x, y, z, heading) => ({ species, len, home: [x, y, z], phase: 0, radius: 0, speed: 0, heading })
    fish.push(
      T('largemouth', 0.5, 31, -3, 11.5, 0),            // Down: 2 m under the transducer, broadside to the plane
      T('largemouth', 0.5, 32.2, -5, 11.5, Math.PI / 2), // Down: head-on to the plane (only the cross-section)
      T('musky', 1.1, 29.6, -4.2, 11.5, 0),              // Down: big fish, broadside
      T('largemouth', 0.5, 31, -6.5, 11.5, 0),           // Forward: 12 m ahead of the (16,11) apex at 6.5 m
      T('largemouth', 0.5, 28, -5, 11.5, Math.PI / 2),   // Forward: 9 m ahead, head-on
      T('musky', 1.1, 33, -4, 11.5, 0),                  // Forward: 14 m ahead, broadside
    )
    // bait school around the test piling (app frame: dozens of small dashes crowding the piling)
    for (let i = 0; i < 40; i++) fish.push({ species: 'smelt', len: 0.16 + rnd() * 0.08, home: [31 + (rnd() - 0.5) * 4, -2.5 - rnd() * 4, 11.5 + (rnd() - 0.5) * 1.2], phase: rnd() * 6.28, radius: 0.3 + rnd() * 0.5, speed: 0.3 + rnd() * 0.3 })
  }
  return fish
}

// No fish lies on the bottom (Jason 2026-09-25: 鱼不能完全贴住底部). A fish's lowest point — its centre minus the
// ±0.3 m bob and half its DRAWN body height — stays at least 0.4 m above the highest bottom anywhere under its
// swim loop (the loop fills a rotated ±radius × ±0.6 radius rectangle; slopes used to put bellies into the bed).
// Only raises fish; no rnd() calls, so x/z and the rest of the lake stay exactly as they were.
export const bottomGap = (f) => 0.3 + 0.12 * drawnLen(f) + 0.4
function loopBedTop(f, bedY, r = f.radius) {
  const c = Math.cos(f.rot || 0), s = Math.sin(f.rot || 0)
  let top = -1e9
  for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) {
    const lx = (i / 2) * r, lz = j * 0.6 * r
    top = Math.max(top, bedY(f.home[0] + lx * c - lz * s, f.home[2] + lx * s + lz * c))
  }
  return top
}
function keepOffBottom(fish, bedY) {
  for (const f of fish) {
    if (!f.radius) continue
    const yMin = loopBedTop(f, bedY) + bottomGap(f)
    if (f.home[1] < yMin) f.home[1] = Math.min(yMin, -0.9)
  }
}

// Nothing swims out of the water: a fish's highest point — its centre plus the ±0.3 m bob and half its DRAWN body
// height — stays at least ~0.4 m under the surface (#91: the middle of the lake became 8–9 m deep, so schools set a
// fixed height off the bottom would break it). Only lowers fish, never below their bottom gap; no rnd() calls.
function keepUnderSurface(fish, bedY) {
  for (const f of fish) {
    if (!f.radius) continue
    const cap = -1.3 - 0.12 * drawnLen(f)
    if (f.home[1] > cap) f.home[1] = Math.max(cap, loopBedTop(f, bedY) + bottomGap(f))
  }
}

// Keep every swim loop clear of solid structure (Jason 2026-09-24: 鱼穿过木头是个bug; only if it stays
// cheap). A fish swims a fixed Lissajous loop that fills a rotated rectangle (±radius × ±0.6 radius) around
// its home, so a loop is clear when no obstacle circle (grown by a third of the DRAWN body length) reaches
// that rectangle at the fish's height. Fixed once at load — no per-frame cost: first a smaller loop in the
// same spot, then the nearest free spot within 10 m, then lifting the fish over low structure. No rnd()
// calls, so the rest of the lake stays exactly as it was.
function clearPaths(fish, circles, bedY) {
  const ring = (ds) => { const o = []; for (const d of ds) for (let i = 0; i < 16; i++) o.push([Math.cos((i * Math.PI) / 8) * d, Math.sin((i * Math.PI) / 8) * d]); return o }
  const nearOffsets = [[0, 0], ...ring([1.5, 3, 4.5, 6])], farOffsets = ring([8, 10, 12, 14])
  const rectDist = (o, hx, hz, c, s, r) => {
    const dx = o.x - hx, dz = o.z - hz
    const lx = c * dx + s * dz, lz = -s * dx + c * dz
    return Math.hypot(Math.max(Math.abs(lx) - r, 0), Math.max(Math.abs(lz) - 0.6 * r, 0))
  }
  for (const f of fish) {
    if (!f.radius) continue
    const Ld = drawnLen(f), cl = 0.34 * Ld, hy = 0.12 * Ld + 0.3 + 0.25 // body half-height + the ±0.3 m bob + a margin
    const c = Math.cos(f.rot || 0), s = Math.sin(f.rot || 0)
    const near = circles.filter((o) => Math.hypot(o.x - f.home[0], o.z - f.home[2]) < f.radius + o.r + cl + 15)
    const clash = (hx, y, hz, r) => near.some((o) => y + hy > o.y0 && y - hy < o.y1 && rectDist(o, hx, hz, c, s, r) < o.r + cl)
    const [x0, y0, z0] = f.home, r0 = f.radius, h0 = y0 - bedY(x0, z0)
    f.clear = 'ok'
    if (!clash(x0, y0, z0, r0)) continue
    const nearBottom = h0 < 3 // bottom fish keep their height above the bottom, the rest their depth
    const tryAt = (offsets, how) => {
      for (const [ox, oz] of offsets) {
        const hx = x0 + ox, hz = z0 + oz, bed = bedY(hx, hz)
        const y = nearBottom ? bed + h0 : Math.max(y0, bed + 0.6)
        for (const k of [1, 0.75, 0.55, 0.4, 0.3]) {
          const yk = Math.max(y, loopBedTop({ home: [hx, 0, hz], rot: f.rot }, bedY, r0 * k) + bottomGap(f)) // never onto the bottom
          if (yk > -0.9) continue
          if (!clash(hx, yk, hz, r0 * k)) { f.home = [hx, yk, hz]; f.radius = r0 * k; f.clear = ox || oz ? how : 'shrink'; return true }
        }
      }
      return false
    }
    if (tryAt(nearOffsets, 'move')) continue
    // lift over low structure (stumps, rocks, bushes) when that keeps it under water and not far from its layer
    const tops = near.filter((o) => rectDist(o, x0, z0, c, s, r0 * 0.55) < o.r + cl).map((o) => o.y1)
    const yl = tops.length ? Math.max(...tops) + hy + 0.05 : 0
    if (tops.length && yl < -0.9 && yl - y0 < 6 && !clash(x0, yl, z0, r0 * 0.55)) { f.home = [x0, yl, z0]; f.radius = r0 * 0.55; f.clear = 'lift'; continue }
    if (tryAt(farOffsets, 'move-far')) continue
    f.radius = r0 * 0.3; f.clear = 'hover' // last resort: a tight hover where it is
  }
}

// Simple wander around the home point; schools drift together via shared phase. On top of the loop a fish may be
// running a behaviour (stepBehaviours below): an offset that eases in and out (a chase, a dart, a flight) or a
// speed burst. Everything is a pure function of time, so the 3D fish and the sonar marks (which also read the pose
// 0.7 s back for the streak) always agree.
const smoothstep = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u))
// 0 → 1 → 0: out fast (u^0.7 front-loads the rise: it leaves quickly, then settles), a hold, then a slow return
function actEnv(act, t) {
  const u = t - act.t0
  if (u <= 0) return 0
  if (u < act.T1) return smoothstep(Math.pow(u / act.T1, 0.7))
  if (u < act.T1 + act.T2) return 1
  return 1 - smoothstep((u - act.T1 - act.T2) / act.T3)
}
// extra loop phase from a speed burst: the loop speed follows 1 + (k−1)·sin²(π·u/D), integrated in closed form
function burstPhase(b, t, w) {
  const u = Math.min(Math.max(t - b.t0, 0), b.D)
  return (b.k - 1) * w * (u / 2 - (b.D / (4 * Math.PI)) * Math.sin((2 * Math.PI * u) / b.D))
}
export function fishPose(f, t, out) {
  const w = f.speed
  const a = f.phase + t * w + (f.burst ? burstPhase(f.burst, t, w) : 0)
  const wk = f.burst && t > f.burst.t0 && t < f.burst.t0 + f.burst.D ? 1 + (f.burst.k - 1) * Math.sin((Math.PI * (t - f.burst.t0)) / f.burst.D) ** 2 : 1
  // an orbit in the fish's own frame, rotated by f.rot (schools share it)
  const ox = Math.cos(a) * f.radius, oz = Math.sin(a * 0.7) * f.radius * 0.6
  const vx = -Math.sin(a) * f.radius * w * wk, vz = Math.cos(a * 0.7) * f.radius * 0.6 * 0.7 * w * wk // derivative of the path
  const c = Math.cos(f.rot || 0), s = Math.sin(f.rot || 0)
  let x = f.home[0] + ox * c - oz * s
  let z = f.home[2] + ox * s + oz * c
  let y = f.home[1] + Math.sin(a * 1.3 + f.phase) * 0.3
  let dx = vx * c - vz * s, dz = vx * s + vz * c, dy = Math.cos(a * 1.3 + f.phase) * 0.39 * w * wk
  const act = f.act
  let hx = 0, hz = 0
  if (act) {
    // from the loop to the act's target and back: at the target the fish holds still in place (a small hover), so a
    // fish that came up into the sonar's thin slab stays in it instead of drifting out with its loop
    const e = actEnv(act, t), de = (e - actEnv(act, t - 0.05)) / 0.05
    const tx = act.tx + 0.12 * Math.sin(t * 2.1 + f.phase), ty = act.ty + 0.1 * Math.sin(t * 1.7 + f.phase), tz = act.tz
    dx = dx * (1 - e) + (tx - x) * de; dy = dy * (1 - e) + (ty - y) * de; dz = dz * (1 - e) + (tz - z) * de
    x += (tx - x) * e; y += (ty - y) * e; z += (tz - z) * e
    hx = Math.cos(act.h) * 0.4 * e; hz = -Math.sin(act.h) * 0.4 * e // while it holds, it keeps facing the way it came up
  }
  out.x = x; out.y = y; out.z = z
  out.speed = Math.hypot(dx, dy, dz) // m/s, drives the tail beat (Scene.jsx)
  out.heading = f.heading != null ? f.heading : Math.atan2(-(dz + hz), dx + hx)
  out.pitch = f.heading != null ? 0 : Math.max(-0.6, Math.min(0.8, Math.atan2(dy, Math.hypot(dx, dz) + 0.05))) // nose up on a rise
  return out
}

// ---------- behaviours (Jason 2026-09-25) ----------
// "LK沉底的可以在船靠近的时候从底部自然但是比较快的往上追饵 · 鲈鱼可以自然的偶尔有追吃饵鱼的感觉 · 三文速度也可以
// 偶尔快一点 · 船靠近可以作为一种触发 随机的可以顺着声纳扫的方向往上追 画面会比较有趣".
//  - boat nearby (the transducer within the species' radius, the fish within 7 m of the sonar's vertical plane):
//    lake trout often, salmon and bass sometimes, rise toward the boat into that plane, the way fish come up to a
//    jig on live sonar, then sink back to their loop;
//  - bass: now and then (30–80 s apart) a short dart at bait (smelt / crappie) within 8 m; the bait near the strike scatters;
//  - salmon: now and then a burst of speed along the loop.
// Every candidate path is sampled before it starts: no structure (the same obstacle circles as the loops), not into
// the bottom, not out of the water. If it would cross anything, a smaller version is tried, else nothing happens.
const CHASE = {
  laketrout:  { r: 16, maxLen: 10, speed: 3.5, pEnter: 0.75, pStay: 0.05, rise: [0.45, 0.7], toward: [0.25, 0.45], T1: [2.2, 3.2], T2: [1.0, 2.0], T3: [6, 9], cool: [25, 45] },
  salmon:     { r: 14, maxLen: 8, speed: 4.0, pEnter: 0.45, pStay: 0.025, rise: [0.3, 0.55], toward: [0.2, 0.4], T1: [1.8, 2.6], T2: [0.8, 1.5], T3: [5, 8], cool: [25, 50] },
  largemouth: { r: 12, maxLen: 5, speed: 3.0, pEnter: 0.35, pStay: 0.02, rise: [0.25, 0.5], toward: [0.2, 0.4], T1: [1.2, 1.8], T2: [0.6, 1.0], T3: [4, 6], cool: [20, 40] },
  smallmouth: { r: 12, maxLen: 5, speed: 3.0, pEnter: 0.35, pStay: 0.02, rise: [0.25, 0.5], toward: [0.2, 0.4], T1: [1.2, 1.8], T2: [0.6, 1.0], T3: [4, 6], cool: [20, 40] },
  pike:       { r: 0, maxLen: 0, speed: 4.0, pEnter: 0, pStay: 0, rise: [0, 0], toward: [0, 0], T1: [1, 1], T2: [1, 1], T3: [4, 6], cool: [30, 60] }, // no rises to the boat; darts only
}
const BAIT = new Set(['smelt', 'crappie', 'yellowperch'])
const DARTERS = new Set(['largemouth', 'smallmouth', 'pike']) // strike at bait now and then (pike: phase 3)
const pick = ([a, b]) => a + (b - a) * Math.random()
const actEnd = (a) => a.t0 + a.T1 + a.T2 + a.T3
// an act that moves the fish by (dx, dy, dz) from where it is at t0
function makeAct(f, kind, t0, T1, T2, T3, dx, dy, dz) {
  const p = fishPose(f, t0, {})
  return { kind, t0, T1, T2, T3, tx: p.x + dx, ty: p.y + dy, tz: p.z + dz, h: Math.atan2(-dz, dx) }
}

// would this act keep the fish clear of structure, bottom and surface for its whole run?
function pathClear(f, act, circles, bedY) {
  const keep = f.act; f.act = act
  const Ld = drawnLen(f), cl = 0.34 * Ld, hy = 0.12 * Ld + 0.25, gap = bottomGap(f) - 0.3
  const o = fishPose(f, act.t0, {}), reach = Math.hypot(act.tx - o.x, act.ty - o.y, act.tz - o.z) + 2 * f.radius + 2
  const near = circles.filter((c) => Math.hypot(c.x - o.x, c.z - o.z) < reach + c.r + cl) // only structure the run could reach
  const times = []
  for (let i = 1; i <= 40; i++) times.push(act.t0 + (act.T1 * i) / 40)               // the fast part, densely
  for (let i = 1; i <= 6; i++) times.push(act.t0 + act.T1 + (act.T2 * i) / 6)
  for (let i = 1; i <= 40; i++) times.push(act.t0 + act.T1 + act.T2 + (act.T3 * i) / 40)
  let ok = true
  for (const ti of times) {
    if (!ok) break
    fishPose(f, ti, o)
    if (o.y > -1.0 || o.y - bedY(o.x, o.z) < gap) ok = false
    else for (const c of near) if (o.y + hy > c.y0 && o.y - hy < c.y1 && Math.hypot(o.x - c.x, o.z - c.z) < c.r + cl) { ok = false; break }
  }
  f.act = keep
  return ok
}
function tryAct(f, t, make, circles, bedY) {
  for (const k of [1, 0.6, 0.35]) { const a = make(k); if (a && pathClear(f, a, circles, bedY)) { f.act = a; return true } }
  return false
}
// a rise toward the boat, into the sonar's vertical plane (x along the heading, the plane at the transducer's z)
// Capped at the species' reach (lake trout 10 m, salmon 8 m, bass 5 m) and a believable burst speed (3–4 m/s).
function riseAct(f, t, apex, cfg, k) {
  const p = fishPose(f, t, {})
  let dx = (apex.x - p.x) * pick(cfg.toward) * k, dy = (apex.y - p.y) * pick(cfg.rise) * k, dz = (apex.z - p.z) * Math.min(1, k + 0.3) // into the sonar plane
  const len = Math.hypot(dx, dy, dz), m = Math.min(1, cfg.maxLen / Math.max(len, 1e-3))
  dx *= m; dy *= m; dz *= m
  return makeAct(f, 'rise', t, Math.max(pick(cfg.T1), (len * m) / cfg.speed), pick(cfg.T2), pick(cfg.T3), dx, dy, dz)
}

export function stepBehaviours(pop, t, dt, apex, circles, bedY) {
  if (!apex || apex.y === 0) return
  const pose = {}
  for (const f of pop) {
    if (!f.radius) continue // dev test fish stay put
    if (f.act && t > actEnd(f.act)) { f.act = null; f.until = t + (f.coolNext || 0) }
    if (f.burst && t > f.burst.t0 + f.burst.D) { f.phase += burstPhase(f.burst, f.burst.t0 + f.burst.D, f.speed); f.burst = null }
    const cfg = CHASE[f.species]
    if (!cfg) continue // bait only ever flees (set by a bass strike below)
    fishPose(f, t, pose)
    const dH = Math.hypot(pose.x - apex.x, pose.z - apex.z)
    if (cfg) {
      const near = dH < cfg.r && Math.abs(pose.z - apex.z) < 7 && pose.y < apex.y - 2.5
      const entered = near && !f.near
      f.near = near
      const free = !f.act && !(f.until > t)
      if (free && near && Math.random() < (entered ? cfg.pEnter : cfg.pStay * dt)) {
        if (tryAct(f, t, (k) => riseAct(f, t, apex, cfg, k), circles, bedY)) f.coolNext = pick(cfg.cool)
        else f.until = t + 3
        continue
      }
      // salmon: a speed burst now and then (20–50 s apart)
      if (f.species === 'salmon' && !f.burst) {
        if (!f.nextBurst) f.nextBurst = t + pick([5, 40])
        if (t > f.nextBurst) { f.burst = { t0: t, D: pick([3, 5]), k: pick([2.2, 3.0]) }; f.nextBurst = t + f.burst.D + pick([20, 50]) }
      }
      // bass: a dart at bait within 8 m, now and then (15–40 s apart)
      if (DARTERS.has(f.species) && free) {
        if (!f.nextDart) f.nextDart = t + pick([5, 40])
        if (t > f.nextDart) {
          f.nextDart = t + pick([30, 80]) // now and then, not a feeding frenzy
          let prey = null, best = 8, q = {}
          for (const g of pop) {
            if (!BAIT.has(g.species) || !g.radius) continue
            fishPose(g, t, q)
            const d = Math.hypot(q.x - pose.x, q.y - pose.y, q.z - pose.z)
            if (d < best) { best = d; prey = { x: q.x, y: q.y, z: q.z } }
          }
          if (prey) {
            const L = Math.min(best, 5)
            const ok = tryAct(f, t, (k) => makeAct(f, 'dart', t, Math.max(pick([0.8, 1.2]), (L * k) / 4.5), 0.35, pick([2.5, 3.5]), // a bass bursts at ~4–5 m/s
              ((prey.x - pose.x) / best) * L * k, ((prey.y - pose.y) / best) * L * k, ((prey.z - pose.z) / best) * L * k), circles, bedY)
            if (ok) {
              f.coolNext = 2
              const hit = { x: f.act.tx, y: f.act.ty, z: f.act.tz }
              let scattered = 0
              for (const g of pop) { // the bait around the strike scatters away from it (at most 8, to keep the frame cheap)
                if (scattered >= 8) break
                if (!BAIT.has(g.species) || !g.radius || g.act) continue
                fishPose(g, t, q)
                const ex = q.x - hit.x, ey = q.y - hit.y, ez = q.z - hit.z, d = Math.hypot(ex, ey, ez)
                if (d > 2.5 || d < 1e-3) continue
                const m = pick([1.2, 2.0]) / d
                scattered++
                tryAct(g, t, (k) => makeAct(g, 'flee', t + f.act.T1 * 0.6, pick([0.35, 0.5]), 0.2, pick([2, 3]), ex * m * k, ey * m * 0.5 * k, ez * m * k), circles, bedY)
              }
            }
          }
        }
      }
    }
  }
}
// dev: force a boat-triggered rise on the nearest fish of a species (window.__chase in Scene.jsx)
export function forceRise(pop, t, apex, species, circles, bedY) {
  let best = null, bd = 30
  const o = {}
  for (const f of pop) {
    if (f.species !== species || !f.radius || f.act) continue
    fishPose(f, t, o)
    const d = Math.hypot(o.x - apex.x, o.z - apex.z)
    if (d < bd) { bd = d; best = f }
  }
  if (!best) return 'none within 30 m'
  const cfg = CHASE[species]
  return tryAct(best, t, (k) => riseAct(best, t, apex, cfg, k), circles, bedY) ? `rising (${bd.toFixed(1)} m away)` : 'blocked'
}
