// The ice-fishing scene (Jason 2026-10-16: 做一个冰钓的版本 … 视觉效果要好): the same lake in mid-winter. The water is
// under half a metre of ice, the PingLive Mini hangs in an auger hole, and the visitor hole-hops: a tap on the ice
// drills a new hole. Everything under the ice (terrain, timber, wrecks, fish, the sonar engine) is the summer Lab's;
// this file holds the scene constants and the look presets. Nothing here runs for the boat scene.
import * as THREE from 'three'

export const ICE_T = 0.5            // ice thickness (m): mid-January on a prairie lake
export const HOLE_R = 0.127         // a 10" auger hole
export const HOLE_SCALE = 2.4       // drawn bigger, like the fish (×2.6): a real 10" hole is a 2 px dot from this camera
export const HOLE_DRAW_R = HOLE_R * HOLE_SCALE
export const MINI_SCALE = 2.6       // the Mini is drawn at the fishes' display scale (a 12 cm device is invisible at true size)
export const MINI_DROP = 0.45       // the Mini hangs this far below the ice bottom
export const APEX_Y = -(ICE_T + MINI_DROP)
export const MAX_HOLES = 8          // open + old holes the ice remembers (the oldest skins over and is forgotten)
export const WIND = new THREE.Vector2(0.86, 0.5).normalize() // where the drifts and the snow blow

// Camera: closer than the boat scene (its 90 m framed a 6.6 m boat; here the hole kit is 0.3–2 m), and on phones
// ~30 m of ice across the screen instead of 50.
export const ICE_CAM_T = new THREE.Vector3(-1.5, -5, 0) // the first hole sits right of centre, clear of the control panel
export const ICE_CAMP = [-8, 5] // the shelter and sled, from the first hole: left and toward the camera — clear of the step cards, outside the Down pool (7 m) and never in the Forward strip (which opens to +x)
export const ICE_CAM_D = new THREE.Vector3(-9, 28, 33)
export const ICE_LAKE_W = 30
export const ICE_START = [1, 1] // the first hole: 36 ft of water on the gentle middle slope, walleye and perch within reach
export const ICE_FOG = { near: 110, far: 300, cam: 1600 } // the sky dome needs the far plane

// Time of day — the biggest look choice (for Jason to pick). ?time=dusk|day|night; dusk is the default.
export const TIMES = {
  dusk: { // blue hour after a clear day: the last warm light low in the west, snow going blue, the shelter lamp on
    bg: '#3b4a66', fogDensity: 0.0038,
    hemi: ['#5f73a8', '#1c2130', 1.05], sun: { dir: [-0.62, 0.16, -0.35], color: '#ffd6bd', i: 0.42 },
    zenith: '#1a2746', horizon: '#7d82a6', glow: '#e08a5e', glowDir: [-0.8, 0, -0.45], stars: 0.55, aurora: 0,
    lamp: 1.0, water: '#0e3240', snowfall: 0.6,
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
// Snow cover — the second look choice. ?look=snow|mixed|glass
//   cover: how much of the ice the drifts bury (0–1) · clear: how see-through the bare ice is · window: how strongly
//   the beam's reach opens a window in the snow (decision #55: wherever the device goes, what its beam reaches lights up)
// cut: the cutaway (Jason 2026-10-16 on the first version: 水里的画面和冰面的关系有点confusing) — an ice island round the hole,
// a pool opened in the ice round it as far as the beam reaches, the slab's thickness showing at the cut. 0 = no cut.
export const LOOKS = {
  snow:  { cover: 0.78, clear: 0.55, window: 0, cut: 1 },
  mixed: { cover: 0.5, clear: 0.6, window: 0, cut: 1 },
  glass: { cover: 0.27, clear: 0.85, window: 1, cut: 0 }, // window: the snow thins over the beam so the coverage shows (Jason 2026-10-16) // black ice with broad blown-snow patches: the whole surface is see-through, like the summer water (the default)
}
export const CUT_R = 7.0    // the pool's radius round the hole (m); the beam's footprint stretches it
export const ISLAND_R = 1.9 // the ice island the kit stands on

export function iceParams() {
  const q = typeof window !== 'undefined' ? window.location.search : ''
  const time = (/[?&]time=(dusk|day|night)/.exec(q) || [])[1] || 'dusk'
  const look = (/[?&]look=(snow|mixed|glass)/.exec(q) || [])[1] || 'glass' // Jason 2026-10-16: 图像关系我偏好最后一个 (the black ice)
  return { time, look, T: TIMES[time], L: LOOKS[look] }
}

export const col = (hex) => new THREE.Color(hex)
export const dir = (a) => new THREE.Vector3(...a).normalize()
