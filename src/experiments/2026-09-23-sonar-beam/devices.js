// Device data — numbers come from Jason (docs/decisions.md #5). Nothing here
// is hard-coded in shaders; the scene reads these at runtime.
export const FT = 0.3048 // metres per foot

export const DEVICES = {
  PL: {
    id: 'PL',
    name: 'PingLive',
    beamDeg: 135,
    maxRangeFt: 240,
    maxDepthFt: 240,
    modes: ['down', 'forward'],
  },
  PLM: {
    id: 'PLM',
    name: 'PingLive Mini',
    beamDeg: 39,
    maxRangeFt: 200,
    maxDepthFt: 200,
    modes: ['down', 'forward', 'combo'],
  },
}

export const MODE_LABELS = {
  down: 'Down View',
  forward: 'Forward View',
  combo: 'Combo View',
}

// Forward-view tilt rule — CONFIRMED by Jason 2026-09-23 on the PLM Combo View
// (he tuned the slider to 71°, i.e. the forward fan's leading edge lies on the
// water surface): forward fan = [90° − beam, 90°] from straight-down. So its
// upper edge is horizontal and it extends downward by one beam width.
//   PLM 39°  → tilt 70.5° → [51.5°, 90°]  (gap of 32° to the down fan)
//   PL  135° → tilt 22.5° → [−45°, 90°]
export function forwardTiltDeg(beamDeg) {
  return 90 - beamDeg / 2
}

// Angular spans, in degrees measured from straight-down, positive = forward
// (to the right). Returns a list of [start, end] pairs.
export function fanSpans(device, mode, tiltOverrideDeg) {
  const half = device.beamDeg / 2
  const tilt = tiltOverrideDeg ?? forwardTiltDeg(device.beamDeg)
  const down = [-half, half]
  const forward = [-half + tilt, half + tilt]
  if (mode === 'down') return [down]
  if (mode === 'forward') return [forward]
  return [down, forward] // combo
}
