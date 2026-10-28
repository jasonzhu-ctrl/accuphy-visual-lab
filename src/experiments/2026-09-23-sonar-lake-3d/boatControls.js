// Pointer and keyboard controls share the lake's existing target and drag boundary.
// The simulation still interpolates boat -> target in Scene.jsx; no second motion model.
export function setBoatTarget(state, x, z) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false
  state.target.x = Math.min(58, Math.max(-58, x))
  state.target.z = Math.min(58, Math.max(-58, z))
  return true
}

export function nudgeBoat(state, dx, dz) {
  const moved = setBoatTarget(state, state.target.x + dx, state.target.z + dz)
  if (moved) state.hasDragged = true // dismiss the visual cue; first_drag still means pointerdown only
  return moved
}
