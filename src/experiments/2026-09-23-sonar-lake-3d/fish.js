// Fish species — real North American sizes (metres). Jason 2026-09-23.
// Jason 2026-09-24: at this camera distance real sizes are invisible, so fish are
// DRAWN at FISH_DISPLAY_SCALE × their true length. Data stays true.
export const FISH_DISPLAY_SCALE = 2.6
export const SPECIES = {
  largemouth: { name: 'Largemouth bass', len: [0.38, 0.55], color: '#5d7a3a', belly: '#c9d3a8', school: false },
  smallmouth: { name: 'Smallmouth bass', len: [0.33, 0.45], color: '#7a6a3a', belly: '#d8cfa8', school: false },
  walleye:    { name: 'Walleye',         len: [0.45, 0.70], color: '#8a8a3c', belly: '#e6e2b8', school: false },
  crappie:    { name: 'Crappie',         len: [0.25, 0.35], color: '#8c98a0', belly: '#e8eef0', school: true },
  smelt:      { name: 'Smelt',           len: [0.12, 0.20], color: '#9fb2bd', belly: '#eef4f6', school: true },
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
