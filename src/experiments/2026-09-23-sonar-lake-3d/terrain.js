// Lakebed heightfield in METRES. y = -depth. Lake spans x,z in [-HALF, HALF].
// centres + radius of the small rock humps (shared with vegetation.js)
export const ROCK_HUMPS = [[-8, 22, 6], [42, -6, 7], [-38, -18, 6]]
export const HALF = 160 // modelled lakebed half-size; detail lives within ±70 m
export const SEG = 160  // 2 m spacing

// small deterministic value-noise / fbm
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy
}
export function fbm(x, y, oct = 4) {
  let v = 0, amp = 0.5, f = 1
  for (let i = 0; i < oct; i++) { v += amp * vnoise(x * f, y * f); amp *= 0.5; f *= 2.1 }
  return v
}
const smooth = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t) }

// The deep floor past the drop-off (Jason 2026-09-25: 深水太深了 … 我赞成 — decision #64, docs/deep-water-plan.md).
// It was 40 m (decisions #14–#16): at that depth the wreck and the lockup were tiny on the phone and faint in the
// 3D view, Panoramic met no bottom within range and Mini Forward saw it only 46 m ahead. 24 m (~80 ft) is true
// lake-trout water. The middle used to sit on a 17 m plateau above it; since #92 it slopes down into it.
export const DEEP_M = 24
// The middle of the lake, between the west shelf and the island. Until #91 it was a 17 m (55 ft) plateau with steep
// walls up to the shelf and the island.
// #91 (Jason 2026-10-04: 左边是浅水 右边是岛屿 我想把中间的部分做自然过渡 最深的地方做30ft深): across, from the shelf to
// the island, the bottom eases down to ~9 m (30 ft) on a line at x ≈ -2 and back up the island, whose top is now
// ~4.6 m (15 ft; ~8 m before) — the valley below.
// #92 (Jason, same day: 中间一下子变得只有20ft左右 我要的是附件标记的大致的区域是相对缓慢得向深水过度): #91 left the whole
// middle at 20–29 ft and dropped to the deep floor late and steeply. Now the middle slopes gently north into the deep:
// ~30 ft by the shelf–island line, ~36 ft at the boat's start, ~60 ft by z ≈ -20, the 24 m floor from z ≈ -45
// (10–20° nearly everywhere). The shelf (x < -30) and the deep floor past the old edge (along ≥ 40) are as before.
const MIDDLE_MAX_M = 9.1 // 30 ft
function middleValley(x, z) {
  const xc = -2 + 0.12 * z // the valley line
  const d = 5.6 + 3.05 * Math.exp(-(((x - xc) / 17) ** 2)) + 1.6 * smooth(34, 56, x)
    + 0.45 * (fbm(x * 0.035 + 3, z * 0.035 + 7) - 0.5) * 2 + 0.3 * (fbm(x * 0.15, z * 0.15) - 0.5)
  return Math.min(d, MIDDLE_MAX_M)
}
// Toward the deep floor: grows to the north (camera looks from +z toward -z, so "up" on screen = -z), a little further
// south in the east, with a noisy outline (Jason 2026-09-24: the drop-off runs across the middle of the screen;
// second pass: deep share trimmed ~10 %, edge moved 6 m north)
const alongDeep = (x, z) => (-z - 10) * 0.92 + (x - 3) * 0.22 + 7 * (fbm(x * 0.05 + 11, z * 0.05 + 3) - 0.5)
// depth (positive metres) at world x,z
export function depthAt(x, z) {
  let d = middleValley(x, z)
  // shallow shelf on the west (x < -25) with its edge around x = -30..-16
  const shelf = 5 + 1.5 * fbm(x * 0.1, z * 0.1)
  d = d + (shelf - d) * (1 - smooth(-30, -16, x))
  // the island: a hump at (30, 12) rising to ~4.6 m
  const hr = Math.hypot(x - 30, z - 12)
  d = d + (4.5 - d) * (1 - smooth(6, 16, hr)) * 0.9
  // the long ramp into the deep (#92), eased in from the shelf edge and kept clear of the island so neither gets a wall;
  // the shelf's own drop to the deep (along 3–40) is the old one. It also replaces the old basin at (15, -28).
  const along = alongDeep(x, z)
  const ramp = smooth(-32, 40, along) * smooth(-30, -6, x) * smooth(10, 34, hr)
  d = d + (DEEP_M - d) * Math.max(smooth(3, 40, along), ramp)
  // the deep hole (#172; Jason 2026-10-26 for the ad: "深水那一拍 jig 从船上掉到 100 ft"): a bowl to ~110 ft in the
  // north-west of the deep floor (~70 ft there), clear of the lockup (x −1…31 at z −52), both wrecks and the ice camp;
  // its outline wanders a little so it reads as a natural hole, its walls ~25°
  const hq = Math.hypot(x - DEEP_HOLE.x, z - DEEP_HOLE.z) + 3 * (fbm(x * 0.08 + 21, z * 0.08 + 5) - 0.5)
  d = d + (DEEP_HOLE.depth - d) * (1 - smooth(DEEP_HOLE.r0, DEEP_HOLE.r1, hq))
  return humpsAndRim(x, z, d, DEEP_M)
}
export const DEEP_HOLE = { x: -22, z: -45, r0: 4, r1: 16, depth: 33.5 } // 33.5 m = 110 ft
// The depth the timber, bushes and rocks were laid out against: the lake before #91 (40 m floor, 17 m middle, 7 m
// island). Placement weights only (vegetation.js): the seeded rejection sampling would otherwise reshuffle the whole
// layout whenever a depth crosses a placement band (#64, #91, #92). Heights still follow the real bottom (bedY).
export function layoutDepth(x, z) {
  // Jason 2026-09-24: deep water share +10 % → deeper base, smaller shelf, bigger basin
  let d = 17 + 5 * (fbm(x * 0.035 + 3, z * 0.035 + 7) - 0.5) * 2 + 1.2 * (fbm(x * 0.15, z * 0.15) - 0.5)
  const shelf = 5 + 1.5 * fbm(x * 0.1, z * 0.1)
  d = d + (shelf - d) * (1 - smooth(-30, -16, x))
  const hr = Math.hypot(x - 30, z - 12)
  d = d + (7 - d) * (1 - smooth(6, 16, hr)) * 0.9
  // deep basin around (15, -28)
  const br = Math.hypot(x - 15, z + 28)
  d = d + (24 - d) * (1 - smooth(9, 26, br)) * 0.85
  d = d + (40 - d) * smooth(3, 40, alongDeep(x, z))
  return humpsAndRim(x, z, d, 40)
}
function humpsAndRim(x, z, d, deep) {
  // small rock humps (Jason): gentle 1.5 m mounds the rocks sit on
  for (const [hx, hz, hr] of ROCK_HUMPS) { const q = Math.hypot(x - hx, z - hz); d -= 1.5 * (1 - smooth(hr * 0.4, hr, q)) }
  // beyond the play area the bed sinks smoothly into the deep so no edge shows
  const rim = Math.max(Math.abs(x), Math.abs(z))
  return d + (deep + 2 - d) * smooth(70, 130, rim)
}
export function bedY(x, z) { return -depthAt(x, z) }
