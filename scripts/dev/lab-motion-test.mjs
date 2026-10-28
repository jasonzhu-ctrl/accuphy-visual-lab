// Clock/state checks against the installed R3F store; no DOM, WebGL or analytics.
import assert from 'node:assert/strict'
import { createRoot, _roots, addEffect, addAfterEffect } from '@react-three/fiber'
import { Clock } from 'three'
import { createActiveClock, guardPausedFrames } from '../../src/experiments/2026-09-23-sonar-lake-3d/labMotion.js'

const originalPerformance = globalThis.performance
let now = 0
globalThis.performance = { now: () => now }
const canvas = {}
createRoot(canvas)
const store = _roots.get(canvas).store
// The store's invalidation guard reads renderer.xr before checking active=false.
// No rendering is configured; this stub only permits exercising setFrameloop.
store.setState({ gl: { xr: { isPresenting: false } } })
const clock = store.getState().clock
const baseline = new Clock()
const active = createActiveClock()
const mode = (value) => store.getState().setFrameloop(value)
const frame = (ms) => { now += ms; const dt = clock.getDelta(); return { dt, time: active.step(clock, dt) } }
let checks = 0
try {
  clock.start(); baseline.start()
  let maxError = 0
  for (let i = 0; i < 10000; i++) {
    const next = frame([16, 17, 8, 33, 16.6667][i % 5])
    baseline.getDelta()
    maxError = Math.max(maxError, Math.abs(next.time - baseline.elapsedTime))
    assert.equal(next.time, baseline.elapsedTime)
  }
  checks++
  const beforePause = clock.elapsedTime
  mode('never')
  assert.equal(clock.elapsedTime, 0, 'installed R3F reproduces elapsed reset')
  now += 60000
  mode('always')
  const resumed = frame(16)
  assert.equal(resumed.time, beforePause + .016)
  assert.equal(resumed.dt, .016)
  checks++

  // The browser hides before React processes the Canvas prop. There must be no
  // large first delta, even if the store still says 'always' when it reappears.
  const beforeHide = clock.elapsedTime
  now += 5
  active.visibility(clock, true, true)
  assert.equal(clock.elapsedTime, beforeHide)
  now += 120000
  active.visibility(clock, false, true)
  const visible = frame(16)
  assert.equal(visible.dt, .016)
  assert.equal(visible.time, beforeHide + .016)
  checks++

  // Visibility restoration must not unpause a user's 'never' loop.
  const beforeUserPause = clock.elapsedTime
  mode('never')
  active.visibility(clock, true, false)
  now += 30000
  active.visibility(clock, false, false)
  assert.equal(store.getState().frameloop, 'never')
  assert.equal(clock.running, false)
  now += 30000
  mode('always')
  assert.equal(frame(17).time, beforeUserPause + .017)
  checks++

  // Repeated prop changes and repeated visibility notifications are harmless.
  let expected = clock.elapsedTime
  for (let i = 0; i < 100; i++) {
    active.visibility(clock, true, true)
    active.visibility(clock, true, false)
    mode('never'); now += 1000; mode('always')
    active.visibility(clock, false, true)
    active.visibility(clock, false, true)
    expected += .016
    assert.equal(frame(16).time, expected)
  }
  checks++

  // One explicit paused update must reach real R3F subscribers with delta=0,
  // without changing the frozen time, running global effects or scheduling RAF.
  mode('never')
  active.step(clock, 0)
  const frozen = clock.elapsedTime
  const originalRaf = globalThis.requestAnimationFrame
  let scheduled = 0, renders = 0, globalEffects = 0
  globalThis.requestAnimationFrame = () => { scheduled++; return scheduled }
  store.getState().gl.render = () => renders++
  const samples = []
  const unsubscribeClock = store.getState().internal.subscribe({ current: (state, dt) => active.step(state.clock, dt) }, -1000, store)
  const unsubscribeProbe = store.getState().internal.subscribe({ current: (state, dt) => samples.push({ time: state.clock.elapsedTime, dt }) }, 0, store)
  const removeBefore = addEffect(() => globalEffects++)
  const removeAfter = addAfterEffect(() => globalEffects++)
  try {
    now += 10000
    store.getState().advance(clock.elapsedTime, false)
    assert.deepEqual(samples, [{ time: frozen, dt: 0 }])
    assert.equal(clock.elapsedTime, frozen)
    assert.equal(clock.running, false)
    assert.equal(store.getState().frameloop, 'never')
    assert.equal(store.getState().internal.frames, 0)
    assert.equal(scheduled, 0)
    assert.equal(renders, 1)
    assert.equal(globalEffects, 0)
    checks++
  } finally {
    unsubscribeClock(); unsubscribeProbe(); removeBefore(); removeAfter()
    globalThis.requestAnimationFrame = originalRaf
  }
  // Reproduce the real global-loop race, not just advance(): invalidate while
  // running, switch to never before the pending browser RAF, then fire that RAF.
  const race = (guarded) => {
    const raceCanvas = {}
    const originalRaf = globalThis.requestAnimationFrame
    const originalCancel = globalThis.cancelAnimationFrame
    const pending = new Map()
    let nextId = 0, raceRenders = 0
    globalThis.requestAnimationFrame = callback => { const id = nextId++; pending.set(id, callback); return id }
    globalThis.cancelAnimationFrame = id => pending.delete(id)
    createRoot(raceCanvas)
    const raceStore = _roots.get(raceCanvas).store
    const raceClock = raceStore.getState().clock
    const activeClock = createActiveClock()
    raceStore.setState({ gl: { xr: { isPresenting: false }, render: () => raceRenders++ } })
    raceStore.getState().internal.active = true
    const seen = []
    const offClock = raceStore.getState().internal.subscribe({ current: (state, dt) => activeClock.step(state.clock, dt) }, -1000, raceStore)
    const offProbe = raceStore.getState().internal.subscribe({ current: (state, dt) => seen.push({ time: state.clock.elapsedTime, dt }) }, 0, raceStore)
    const unguard = guarded ? guardPausedFrames(raceStore, activeClock) : () => {}
    const fire = timestamp => {
      const callbacks = [...pending]
      for (const [id, callback] of callbacks) if (pending.delete(id)) callback(timestamp)
    }
    try {
      now = 10000
      raceClock.start()
      activeClock.step(raceClock, 0)
      raceStore.getState().invalidate()
      const pendingBeforePause = raceStore.getState().internal.frames
      assert(pendingBeforePause > 0)
      assert.equal(pending.size, 1)
      raceStore.getState().setFrameloop('never')
      fire(20046.6) // browser RAF milliseconds; performance.now remains frozen at 10000
      if (!guarded) {
        assert.equal(raceClock.elapsedTime, 20046.6, 'must reproduce the installed R3F bug without the guard')
        assert.equal(seen[0].dt, 20046.6)
      } else {
        assert.equal(raceClock.elapsedTime, 0)
        assert.deepEqual(seen, [], 'pending global RAF must not call paused subscribers')
        assert.equal(raceRenders, 0)
        assert.equal(pending.size, 0)
        raceStore.getState().advance(raceClock.elapsedTime, false)
        assert.deepEqual(seen, [{ time: 0, dt: 0 }])
        assert.equal(raceRenders, 1)
        assert.equal(pending.size, 0)
        raceStore.getState().setFrameloop('always')
        now += 16
        fire(21000)
        assert.deepEqual(seen.at(-1), { time: .016, dt: .016 })
      }
      return { pendingBeforePause, firstTime: seen[0]?.time, firstDelta: seen[0]?.dt }
    } finally {
      unguard(); offClock(); offProbe()
      raceStore.getState().internal.active = false
      _roots.delete(raceCanvas)
      fire(21016) // let the real global loop stop before restoring the scheduler
      globalThis.requestAnimationFrame = originalRaf
      globalThis.cancelAnimationFrame = originalCancel
    }
  }
  const unguardedRace = race(false)
  const guardedRace = race(true)
  checks++
  console.log(JSON.stringify({ checks, uninterruptedFrames: 10000, uninterruptedMaxErrorSeconds: maxError, repeatedSuspendCycles: 100, pausedRedrawDeltaSeconds: samples[0].dt, pausedRedraws: renders, scheduledContinuousFrames: scheduled, unguardedRace, guardedRace, result: 'PASS' }, null, 2))
} finally {
  _roots.delete(canvas)
  globalThis.performance = originalPerformance
}
