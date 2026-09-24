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

// Forward-view tilt rule (assumption, to be confirmed by Jason):
// the forward fan is the down fan rotated forward by one full beam width, so
// that Down + Forward are contiguous (matches the PLM Combo clips: 39° + 39°).
// It is clamped so the leading edge never rises above the water surface.
export function forwardTiltDeg(beamDeg) {
  const half = beamDeg / 2
  return Math.min(beamDeg, 90 - half)
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
