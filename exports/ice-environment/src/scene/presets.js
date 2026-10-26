// The frozen lake in mid-winter: constants and the look presets. Units are metres; y = 0 is the top of the ice,
// the lakebed lies below (terrain.js: 3–24 m of water, deepest toward −z).
import * as THREE from 'three'

export const ICE_T = 0.5 // ice thickness (m): mid-January on a prairie lake
export const WIND = new THREE.Vector2(0.86, 0.5).normalize() // where the drifts and the snow blow
export const CENTER = new THREE.Vector3(1, 0, 1) // the spot the scene is framed around: 36 ft of water on the gentle middle slope

// Time of day — the biggest look choice. dusk is the default.
export const TIMES = {
  dusk: { // blue hour after a clear day: the last warm light low in the west, snow going blue, the shelter lamp on
    bg: '#3b4a66', fogDensity: 0.0038,
    hemi: ['#5f73a8', '#1c2130', 1.05], sun: { dir: [-0.62, 0.16, -0.35], color: '#ffd6bd', i: 0.42 },
    zenith: '#1a2746', horizon: '#7d82a6', glow: '#e08a5e', glowDir: [-0.8, 0, -0.45], stars: 0.55, aurora: 0,
    lamp: 1.0, water: '#061a24', snowfall: 0.6,
  },
  day: { // bright overcast noon: white-out, soft shadowless light
    bg: '#d9e0e7', fogDensity: 0.0032,
    hemi: ['#eef2f6', '#a7afb7', 1.15], sun: { dir: [0.35, 0.7, 0.2], color: '#fff5ea', i: 0.55 },
    zenith: '#9db0c2', horizon: '#e3e8ec', glow: '#e3e8ec', glowDir: [0, 0, -1], stars: 0, aurora: 0,
    lamp: 0.25, water: '#12343d', snowfall: 1.0,
  },
  night: { // clear, cold, moonlit, the aurora out — Manitoba in January
    bg: '#0c1424', fogDensity: 0.0042,
    hemi: ['#1d2c4e', '#04060c', 0.45], sun: { dir: [0.3, 0.72, -0.45], color: '#a9bcff', i: 0.2 },
    zenith: '#04070f', horizon: '#15203a', glow: '#2a3f66', glowDir: [0.3, 0, -1], stars: 1, aurora: 1,
    lamp: 1.3, water: '#061a22', snowfall: 0.35,
  },
}
// Snow cover — the second look choice.
//   cover: how much of the ice the drifts bury (0–1) · clear: how see-through the bare ice is
export const LOOKS = {
  glass: { cover: 0.2, clear: 0.85 }, // black ice with thin, wind-swept snow: the surface is see-through (the default)
  mixed: { cover: 0.5, clear: 0.6 },
  snow:  { cover: 0.78, clear: 0.55 },
}
// The cutaway: the lake is cut open along a wall CUT_Z in front of CENTER (toward +z, the default camera side), so the
// ice slab, the water column and the soil show in section like a diorama. SLAB = the slab's edge as drawn (0.5 m real,
// a little taller to read from 25 m away).
export const CUT_Z = 6.5
export const SLAB = 0.8
// Where the camp stands, from CENTER: the shelter, its door toward CENTER, the sled beside it
export const CAMP = [7.5, -3.0]

export const col = (hex) => new THREE.Color(hex)
export const dir = (a) => new THREE.Vector3(...a).normalize()
