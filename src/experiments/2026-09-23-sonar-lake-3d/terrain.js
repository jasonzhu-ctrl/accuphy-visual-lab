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
// 3D view, Panoramic met no bottom within range and Mini Forward saw it only 46 m ahead. 24 m (~80 ft) keeps a
// real drop-off below the middle (17 m then, 6–9 m since #91) and is true lake-trout water. The edge line does not move.
export const DEEP_M = 24
// The middle of the lake, between the west shelf and the island (Jason 2026-10-04, decision #91: 左边是浅水 右边是岛屿
// 我想把中间的部分做自然过渡 最深的地方做30ft深): it was a 17 m (55 ft) plateau with steep walls up to the shelf and
// the island. Now a shallow valley: the bottom eases from the 5–6 m shelf down to ~9 m on a line between the shelf
// and the island (x ≈ -2, slightly angled), never deeper than 30 ft, then climbs the island, which tops out at
// ~4.6 m (15 ft; ~8 m before) so it still stands out. East of the island the bed settles at ~7 m. The deep floor past
// the drop-off (lake trout, wrecks, the lockup) is unchanged.
const MIDDLE_MAX_M = 9.1 // 30 ft
function middleValley(x, z) {
  const xc = -2 + 0.12 * z // the valley line
  const d = 5.6 + 3.05 * Math.exp(-(((x - xc) / 17) ** 2)) + 1.6 * smooth(34, 56, x)
    + 0.45 * (fbm(x * 0.035 + 3, z * 0.035 + 7) - 0.5) * 2 + 0.3 * (fbm(x * 0.15, z * 0.15) - 0.5)
  return Math.min(d, MIDDLE_MAX_M)
}
// the 17 m middle the lake had before #91 (layout only, below)
const middle1009 = (x, z) => 17 + 5 * (fbm(x * 0.035 + 3, z * 0.035 + 7) - 0.5) * 2 + 1.2 * (fbm(x * 0.15, z * 0.15) - 0.5)
// depth (positive metres) at world x,z
export function depthAt(x, z) { return depthProfile(x, z, DEEP_M, middleValley(x, z), 4.5) }
// The depth the timber, bushes and rocks were laid out against (the 40 m lake with the 17 m middle and the 7 m
// island). Placement weights only (vegetation.js): the seeded rejection sampling would otherwise reshuffle the whole
// layout whenever a depth crosses a placement band (#64, #91). Heights still follow the real bottom (bedY).
export function layoutDepth(x, z) { return depthProfile(x, z, 40, middle1009(x, z), 7) }
function depthProfile(x, z, deep, middle, island) {
  // Jason 2026-09-24: deep water share +10 % → deeper base, smaller shelf, bigger basin (the 17 m middle, until #91)
  let d = middle
  // shallow shelf on the west (x < -25) with a drop-off around x = -22..-12
  const shelf = 5 + 1.5 * fbm(x * 0.1, z * 0.1)
  d = d + (shelf - d) * (1 - smooth(-30, -16, x))
  // the island: a hump at (30, 12) rising to ~4.6 m (~8 m before #91)
  const hr = Math.hypot(x - 30, z - 12)
  d = d + (island - d) * (1 - smooth(6, 16, hr)) * 0.9
  // deep basin around (15, -28)
  const br = Math.hypot(x - 15, z + 28)
  d = d + (24 - d) * (1 - smooth(9, 26, br)) * 0.85
  // Jason 2026-09-24: the drop-off to the deep floor runs across the middle of the screen
  // (camera looks from +z toward -z, so "up" on screen = -z). The edge sits
  // around z ≈ -4 at screen centre, slightly angled, with a noisy outline.
  // (2026-09-24 second pass: deep share trimmed ~10 % — edge moved 6 m north)
  const along = (-z - 10) * 0.92 + (x - 3) * 0.22 + 7 * (fbm(x * 0.05 + 11, z * 0.05 + 3) - 0.5)
  d = d + (deep - d) * smooth(3, 40, along)
  // small rock humps (Jason): gentle 1.5 m mounds the rocks sit on
  for (const [hx, hz, hr] of ROCK_HUMPS) { const q = Math.hypot(x - hx, z - hz); d -= 1.5 * (1 - smooth(hr * 0.4, hr, q)) }
  // beyond the play area the bed sinks smoothly into the deep so no edge shows
  const rim = Math.max(Math.abs(x), Math.abs(z))
  d = d + (deep + 2 - d) * smooth(70, 130, rim)
  return d
}
export function bedY(x, z) { return -depthAt(x, z) }
