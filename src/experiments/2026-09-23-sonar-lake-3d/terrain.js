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

// depth (positive metres) at world x,z
export function depthAt(x, z) {
  // Jason 2026-09-24: deep water share +10 % → deeper base, smaller shelf, bigger basin
  let d = 17 + 5 * (fbm(x * 0.035 + 3, z * 0.035 + 7) - 0.5) * 2 + 1.2 * (fbm(x * 0.15, z * 0.15) - 0.5)
  // shallow shelf on the west (x < -25) with a drop-off around x = -22..-12
  const shelf = 5 + 1.5 * fbm(x * 0.1, z * 0.1)
  d = d + (shelf - d) * (1 - smooth(-30, -16, x))
  // a hump at (30, 12) rising to ~7 m
  const hr = Math.hypot(x - 30, z - 12)
  d = d + (7 - d) * (1 - smooth(6, 16, hr)) * 0.9
  // deep basin around (15, -28)
  const br = Math.hypot(x - 15, z + 28)
  d = d + (24 - d) * (1 - smooth(10, 30, br)) * 0.85
  // Jason 2026-09-24: the drop-off to 40 m runs across the middle of the screen
  // (camera looks from +z toward -z, so "up" on screen = -z). The edge sits
  // around z ≈ -4 at screen centre, slightly angled, with a noisy outline.
  const along = (-z - 4) * 0.92 + (x - 3) * 0.22 + 7 * (fbm(x * 0.05 + 11, z * 0.05 + 3) - 0.5)
  d = d + (40 - d) * smooth(2, 38, along)
  // small rock humps (Jason): gentle 1.5 m mounds the rocks sit on
  for (const [hx, hz, hr] of ROCK_HUMPS) { const q = Math.hypot(x - hx, z - hz); d -= 1.5 * (1 - smooth(hr * 0.4, hr, q)) }
  // beyond the play area the bed sinks smoothly into the deep so no edge shows
  const rim = Math.max(Math.abs(x), Math.abs(z))
  d = d + (42 - d) * smooth(70, 130, rim)
  return d
}
export function bedY(x, z) { return -depthAt(x, z) }
