// Fish species — real North American sizes (metres). Jason 2026-09-23.
// Jason 2026-09-24: at this camera distance real sizes are invisible, so fish are
// DRAWN at FISH_DISPLAY_SCALE × their true length. Data stays true.
export const FISH_DISPLAY_SCALE = 2.6
// body: which instanced mesh shape to use. pattern: 0 none, 1 vertical bars,
// 2 light spots, 3 dark spots, 4 dark lateral stripe. back/belly colours.
export const SPECIES = {
  largemouth: { name: 'Largemouth bass', len: [0.38, 0.55], body: 'bass',     back: '#3f5a2a', belly: '#dfe3c8', pattern: 4 },
  smallmouth: { name: 'Smallmouth bass', len: [0.33, 0.45], body: 'bass',     back: '#6b5a2e', belly: '#e2d8b8', pattern: 1 },
  walleye:    { name: 'Walleye',         len: [0.45, 0.70], body: 'salmonid', back: '#7d7a3a', belly: '#f0ecd0', pattern: 1 },
  crappie:    { name: 'Crappie',         len: [0.25, 0.35], body: 'panfish',  back: '#7f8d95', belly: '#eef2f4', pattern: 3 },
  smelt:      { name: 'Smelt',           len: [0.12, 0.20], body: 'bait',     back: '#8fa6b4', belly: '#f2f6f8', pattern: 0 },
  musky:      { name: 'Muskellunge',     len: [0.75, 1.30], body: 'pike',     back: '#566b3c', belly: '#e6e8d2', pattern: 1 },
  laketrout:  { name: 'Lake trout',      len: [0.60, 0.90], body: 'salmonid', back: '#4f5d55', belly: '#d8ddd6', pattern: 2 },
  salmon:     { name: 'Chinook salmon',  len: [0.70, 1.00], body: 'salmonid', back: '#6f7f8c', belly: '#eceff1', pattern: 3 },
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
  add('laketrout', 8, -34, 1.5, 4, 14)
  add('salmon', 20, -30, 12.0, 4, 14)
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
  out.x = x; out.y = y; out.z = z; out.heading = Math.atan2(-dz, dx)
  return out
}
