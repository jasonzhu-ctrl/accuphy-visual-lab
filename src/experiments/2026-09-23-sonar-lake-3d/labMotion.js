// R3F 9.8 resets Clock.elapsedTime when changing frameloop. Keep the elapsed
// active simulation time without sampling an extra delta or changing its speed.
// The clock is shared by fish, beam/echo rendering and the ice history.
export function createActiveClock() {
  let elapsed = null
  let hidden = false
  return {
    step(clock, delta) {
      elapsed = elapsed === null ? clock.elapsedTime : elapsed + delta
      clock.elapsedTime = elapsed
      return elapsed
    },
    visibility(clock, isHidden, canRun) {
      if (isHidden === hidden) return
      hidden = isHidden
      const saved = elapsed ?? clock.elapsedTime
      if (isHidden) {
        // stop() samples the wall clock. Do not advance the simulated frame to
        // that sample: all fish and echoes must resume from the last drawn frame.
        clock.stop()
        clock.elapsedTime = saved
      } else if (canRun) {
        // A browser may suspend RAF before React applies frameloop='never'.
        // Restart only a running loop, excluding the hidden wall-clock interval.
        // A user-paused ('never') loop is left for its existing control to resume.
        clock.start()
        clock.elapsedTime = saved
      }
    },
  }
}

// R3F 9.8's global loop also renders a 'never' root when internal.frames > 0.
// A queued invalidation then supplies RAF milliseconds to the manual seconds
// clock. Drain that queue synchronously with the store transition, before any
// browser RAF can run; a React layout effect alone is too late for this race.
export function guardPausedFrames(store, activeClock) {
  const sync = () => {
    const state = store.getState()
    if (state.frameloop !== 'never') return
    state.internal.frames = 0
    activeClock.step(state.clock, 0)
  }
  const unsubscribe = store.subscribe(sync)
  sync()
  return unsubscribe
}
