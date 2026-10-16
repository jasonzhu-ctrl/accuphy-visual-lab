// Device data — numbers come from Jason (docs/decisions.md #5). Nothing here
// is hard-coded in shaders; the scene reads these at runtime.
export const FT = 0.3048 // metres per foot

export const DEVICES = {
  PL: {
    id: 'PL',
    name: 'PingLive',
    beamDeg: 135,      // wide angle of the fan (in the viewing plane)
    thickDeg: 20,      // thickness of the fan across the viewing plane (Jason 2026-09-23)
    maxRangeFt: 240,
    maxDepthFt: 240,
    modes: ['down', 'forward', 'panoramic'],
  },
  PLM: {
    id: 'PLM',
    name: 'PingLive Mini',
    beamDeg: 39,       // 78° in Combo (two fans) — the true value
    displayBeamDeg: 43, // drawn a little wider for visual effect (Jason 2026-09-23)
    thickDeg: 18,      // "18° 左右" (Jason 2026-09-23)
    maxRangeFt: 200,
    maxDepthFt: 200,
    modes: ['down', 'forward', 'combo'],
  },
}

export const MODE_LABELS = {
  down: 'Down View',
  forward: 'Forward View',
  combo: 'Combo View',
  panoramic: 'Panoramic View',
  // the Mini's two ice views (app home: PingLive Mini › Ice Fishing / Live Ice Fishing, reference/app-study/home-plm-row.jpg):
  // a flasher dial beside a scrolling 2D history, or beside the Live Down fan. Only the ice scene offers them (ICE_MODES).
  ice: 'Ice Fishing View',
  liveice: 'Live Ice View',
}
// the view pills of the ice scene (2026-10-16): Live Down is inside Live Ice, so it is not listed twice
export const ICE_MODES = ['liveice', 'ice', 'forward', 'combo']

// Forward-view tilt rule — CONFIRMED by Jason 2026-09-23 on the PLM Combo View
// (he tuned the slider to 71°, i.e. the forward fan's leading edge lies on the
// water surface): forward fan = [90° − beam, 90°] from straight-down. So its
// upper edge is horizontal and it extends downward by one beam width.
//   PLM 39°  → tilt 70.5° → [51.5°, 90°]  (gap of 32° to the down fan)
//   PL  135° → tilt 22.5° → [−45°, 90°]
export function forwardTiltDeg(beamDeg) { // pass the display angle where one exists
  return 90 - beamDeg / 2
}

// Angular spans, in degrees measured from straight-down, positive = forward
// (to the right). Returns a list of [start, end] pairs.
export function fanSpans(device, mode, tiltOverrideDeg) {
  const half = (device.displayBeamDeg ?? device.beamDeg) / 2
  const tilt = tiltOverrideDeg ?? forwardTiltDeg(device.beamDeg)
  const down = [-half, half]
  const forward = [-half + tilt, half + tilt]
  if (mode === 'down' || mode === 'ice' || mode === 'liveice') return [down] // the ice views ping straight down through the hole
  if (mode === 'forward') return [forward]
  // Panoramic (PL only): the fan lies flat just under the surface, so from the
  // side you only see its thickness — a thin wedge skimming down from horizontal.
  if (mode === 'panoramic') return [[85 - (device.thickDeg ?? 20), 85]] // installed 5° down, then the thickness
  return [down, forward] // combo
}
