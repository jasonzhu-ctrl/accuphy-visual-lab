// Fish species — real North American sizes (metres). Jason 2026-09-23.
// Jason 2026-09-24: at this camera distance real sizes are invisible, so fish are
// DRAWN at FISH_DISPLAY_SCALE × their true length. Data stays true.
export const FISH_DISPLAY_SCALE = 2.6
// Colours/markings researched per species (2026-09-24, Jason: "仔细研究, 现在有重复").
// back → side → belly gradient. pattern: 0 none · 1 dark vertical bars on the
// sides · 2 light spots · 3 dark speckle all over · 4 dark lateral band of
// blotches · 5 dark saddles on the back · 6 small black spots on the upper half
// · 7 bright silver lateral stripe · 8 broken, irregular dark vertical bars (musky).
export const SPECIES = {
  largemouth: { name: 'Largemouth bass', len: [0.38, 0.55], body: 'bass',     back: '#2f4a1f', side: '#6f8f3f', belly: '#e9e7cc', pattern: 4 }, // green, black lateral band
  smallmouth: { name: 'Smallmouth bass', len: [0.33, 0.45], body: 'bass',     back: '#4a3d1c', side: '#8a6d34', belly: '#dccfa5', pattern: 1 }, // bronze-brown, vertical bars
  walleye:    { name: 'Walleye',         len: [0.45, 0.70], body: 'salmonid', back: '#55582a', side: '#c49a3c', belly: '#f4efd8', pattern: 5 }, // golden-brass, dark saddles
  crappie:    { name: 'Crappie',         len: [0.25, 0.35], body: 'panfish',  back: '#4f5d5a', side: '#aab4b4', belly: '#f1f4f4', pattern: 3 }, // silver, dark mottling
  smelt:      { name: 'Smelt',           len: [0.12, 0.20], body: 'bait',     back: '#6a8a84', side: '#c7d6d8', belly: '#f4f8f8', pattern: 7 }, // translucent olive back, silver stripe
  musky:      { name: 'Muskellunge',     len: [0.75, 1.30], body: 'pike',     back: '#3f4a2c', side: '#8f9f6e', belly: '#e9e4cf', pattern: 8 }, // olive-brown back, silver-green/golden sides, broken dark bars
  laketrout:  { name: 'Lake trout',      len: [0.60, 0.90], body: 'salmonid', back: '#2f3b37', side: '#5c6a63', belly: '#d9ddd4', pattern: 2 }, // dark grey-green, light spots
  salmon:     { name: 'Chinook salmon',  len: [0.70, 1.00], body: 'salmonid', back: '#34485a', side: '#b3c0c9', belly: '#f2f4f5', pattern: 6 }, // steel-blue back, silver, black spots
}

let seed = 11
export const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
const range = ([a, b]) => a + (b - a) * rnd()

// Build the population: [{ species, len, home:[x,y,z], phase, radius, speed }]
// `bedY(x,z)` gives the lakebed height so fish sit at realistic heights.
export function makePopulation(bedY) {
  const fish = []
  const add = (species, x, z, offBottom, n = 1, spread = 0) => {
    for (let i = 0; i < n; i++) {
      const px = x + (rnd() - 0.5) * spread, pz = z + (rnd() - 0.5) * spread
      const y = bedY(px, pz) + offBottom + (rnd() - 0.5) * Math.min(spread, 3) * 0.5
      fish.push({ species, len: range(SPECIES[species].len), home: [px, y, pz], phase: rnd() * Math.PI * 2, radius: 1.5 + rnd() * 3, speed: 0.15 + rnd() * 0.2 })
    }
  }
  const addOne = (species, x, z, offBottom, len) => {
    const y = bedY(x, z) + offBottom
    fish.push({ species, len, home: [x, y, z], phase: rnd() * Math.PI * 2, radius: 4 + rnd() * 4, speed: 0.08 + rnd() * 0.06 })
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
  // dev: ?fishtest — fixed fish at known spots so the sonar marks can be compared with the app's
  // frames (docs/sonar-style.md §7.2). Boat at ?boat=28,11 → Down view; boat at ?boat=16,11 → PLM Forward.
  if (typeof window !== 'undefined' && /fishtest/.test(window.location.search)) {
    const T = (species, len, x, y, z, heading) => ({ species, len, home: [x, y, z], phase: 0, radius: 0, speed: 0, heading })
    fish.push(
      T('largemouth', 0.5, 28, -3, 11, 0),            // 3 m under the boat, broadside to the Down plane
      T('largemouth', 0.5, 29.5, -5, 11, Math.PI / 2), // head-on to the plane (only the cross-section)
      T('musky', 1.1, 26, -4.2, 11, 0),                // big fish, broadside
      T('largemouth', 0.5, 28, -6.5, 11, 0),           // 12 m ahead of (16,11) at 6.5 m: inside PLM Forward
      T('largemouth', 0.5, 25, -5, 11, Math.PI / 2),   // 9 m ahead, head-on
      T('musky', 1.1, 30, -4, 11, 0),                  // 14 m ahead, broadside
    )
  }
  return fish
}

// Simple wander around the home point; schools drift together via shared phase.
export function fishPose(f, t, out) {
  const w = f.speed
  const a = f.phase + t * w
  const x = f.home[0] + Math.cos(a) * f.radius
  const z = f.home[2] + Math.sin(a * 0.7) * f.radius * 0.6
  const y = f.home[1] + Math.sin(a * 1.3 + f.phase) * 0.3
  // heading = derivative of the path
  const dx = -Math.sin(a) * f.radius * w
  const dz = Math.cos(a * 0.7) * f.radius * 0.6 * 0.7 * w
  out.x = x; out.y = y; out.z = z; out.heading = f.heading != null ? f.heading : Math.atan2(-dz, dx)
  return out
}
