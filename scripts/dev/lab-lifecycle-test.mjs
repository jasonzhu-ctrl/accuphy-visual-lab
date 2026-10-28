import test from 'node:test'
import assert from 'node:assert/strict'
import { startCanvasLifecycle } from '../../src/experiments/2026-09-23-sonar-lake-3d/labLifecycle.js'

class Events {
  listeners = new Map()
  added = new Map()
  hidden = false
  addEventListener(name, callback) {
    const listeners = this.listeners.get(name) ?? new Set()
    listeners.add(callback)
    this.listeners.set(name, listeners)
    this.added.set(name, (this.added.get(name) ?? 0) + 1)
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback) }
  count(name) { return this.listeners.get(name)?.size ?? 0 }
  emit(name, fields = {}) {
    const event = { currentTarget: this, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true }, ...fields }
    for (const callback of [...(this.listeners.get(name) ?? [])]) callback(event)
    return event
  }
}

class Clock {
  nextId = 0
  now = 0
  rafs = new Map()
  timers = new Map()
  timerCalls = 0
  requestAnimationFrame(callback) { const id = this.nextId++; this.rafs.set(id, callback); return id }
  cancelAnimationFrame(id) { this.rafs.delete(id) }
  setTimeout(callback, delay) { const id = this.nextId++; this.timers.set(id, { callback, due: this.now + delay }); return id }
  clearTimeout(id) { this.timers.delete(id) }
  frame() {
    const pending = [...this.rafs]
    for (const [id, callback] of pending) {
      if (!this.rafs.delete(id)) continue
      callback(this.now)
    }
  }
  advance(ms) {
    const target = this.now + ms
    let count = 0
    while (true) {
      const next = [...this.timers].filter(([, timer]) => timer.due <= target).sort((a, b) => a[1].due - b[1].due)[0]
      if (!next) break
      if (++count > 1000) throw new Error('Timer callback runaway')
      const [id, timer] = next
      this.now = timer.due
      this.timers.delete(id)
      this.timerCalls++
      timer.callback()
    }
    this.now = target
  }
}

function setup({ ready = false, canvasPresent = true, hidden = false, coverPresent = true } = {}) {
  const clock = new Clock()
  const events = new Events()
  const visibility = new Events()
  visibility.hidden = hidden
  const initialCanvas = new Events()
  const state = { canvas: canvasPresent ? initialCanvas : null, ready, losses: 0, restorations: 0 }
  const classes = new Set()
  const cover = { classList: { add: value => classes.add(value) }, attributes: {}, setAttribute(name, value) { this.attributes[name] = value }, removals: 0, remove() { this.removals++ } }
  const stop = startCanvasLifecycle({
    getCanvas: () => state.canvas, cover: coverPresent ? cover : null, readySeen: () => state.ready,
    onLost: () => { state.losses++ }, onRestored: () => { state.restorations++ },
    scheduler: clock, eventTarget: events, visibilityTarget: visibility,
  })
  return { clock, events, visibility, initialCanvas, state, cover, classes, stop }
}

test('Binds canvas loss/restored immediately and only once, before ready', () => {
  const h = setup()
  assert.equal(h.initialCanvas.count('webglcontextlost'), 1)
  assert.equal(h.initialCanvas.count('webglcontextrestored'), 1)
  for (let i = 0; i < 12; i++) h.clock.frame()
  assert.equal(h.initialCanvas.added.get('webglcontextlost'), 1)
  assert.equal(h.initialCanvas.added.get('webglcontextrestored'), 1)
  h.stop()
})

test('Already-seen ready still waits two real RAF callbacks; removal waits another 600 ms', () => {
  const h = setup({ ready: true })
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), true)
  assert.equal(h.cover.inert, true, 'fading cover must leave the keyboard focus order immediately')
  assert.equal(h.cover.attributes['aria-hidden'], 'true')
  assert.equal(h.clock.rafs.size, 0)
  assert.equal(h.clock.timers.size, 1)
  h.clock.advance(599)
  assert.equal(h.cover.removals, 0)
  h.clock.advance(1)
  assert.equal(h.cover.removals, 1)
  assert.equal(h.clock.timers.size, 0)
  h.stop()
})

test('Late canvas is discovered by timer, but timers and ready events do not count as frames', () => {
  const h = setup({ canvasPresent: false })
  h.clock.advance(1200)
  h.state.canvas = h.initialCanvas
  h.clock.advance(400)
  assert.equal(h.initialCanvas.count('webglcontextlost'), 1)
  h.events.emit('accuphy-lab', { detail: { event: 'view' } })
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.events.emit('accuphy-lab', { detail: { event: 'ready' } })
  h.clock.advance(2400)
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), true)
  h.stop()
})

test('Long background waits keep one bounded RAF/timer pair and never reveal the cover', () => {
  const h = setup({ ready: true, hidden: true })
  h.clock.advance(100000)
  assert.equal(h.clock.timerCalls, 250)
  assert.equal(h.clock.rafs.size, 1)
  assert.equal(h.clock.timers.size, 1)
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.visibility.hidden = false
  h.visibility.emit('visibilitychange')
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), true)
  h.stop()
})

test('Mixed frame/timer turns cannot fork the scheduling chain while waiting for ready', () => {
  const h = setup()
  for (let i = 0; i < 100; i++) {
    h.clock.frame()
    h.clock.advance(400)
    assert.equal(h.clock.rafs.size, 1)
    assert.equal(h.clock.timers.size, 1)
  }
  assert.equal(h.clock.timerCalls, 100)
  assert.equal(h.classes.has('is-done'), false)
  h.stop()
})

test('Hiding between frames resets the reveal count; duplicate ready events do not add frames', () => {
  const h = setup()
  h.events.emit('accuphy-lab', { detail: { event: 'ready' } })
  h.clock.frame()
  h.events.emit('accuphy-lab', { detail: { event: 'ready' } })
  h.visibility.hidden = true
  h.visibility.emit('visibilitychange')
  h.visibility.hidden = false
  h.visibility.emit('visibilitychange')
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), true)
  h.stop()
})

test('Cleanup cancels an initial RAF with ID zero, all timers and all listeners; it is idempotent', () => {
  const h = setup()
  assert.ok(h.clock.rafs.has(0))
  h.stop()
  h.stop()
  assert.equal(h.clock.rafs.size, 0)
  assert.equal(h.clock.timers.size, 0)
  assert.equal(h.events.count('accuphy-lab'), 0)
  assert.equal(h.visibility.count('visibilitychange'), 0)
  assert.equal(h.initialCanvas.count('webglcontextlost'), 0)
  assert.equal(h.initialCanvas.count('webglcontextrestored'), 0)
  h.clock.advance(1000)
  h.events.emit('accuphy-lab', { detail: { event: 'ready' } })
  h.initialCanvas.emit('webglcontextlost')
  assert.equal(h.state.losses, 0)
})

test('Cleanup during fade cancels the separate removal timeout', () => {
  const h = setup({ ready: true })
  h.clock.frame()
  h.clock.frame()
  h.stop()
  h.clock.advance(1000)
  assert.equal(h.cover.removals, 0)
  assert.equal(h.clock.timers.size, 0)
})

test('Early context loss is prevented and reported once; retained canvas can restore', () => {
  const h = setup({ ready: true })
  h.clock.frame()
  const event = h.initialCanvas.emit('webglcontextlost')
  h.initialCanvas.emit('webglcontextlost')
  assert.equal(event.defaultPrevented, true)
  assert.equal(h.state.losses, 1)
  assert.equal(h.clock.rafs.size, 0)
  assert.equal(h.clock.timers.size, 0)
  assert.equal(h.initialCanvas.count('webglcontextrestored'), 1)
  h.clock.advance(2000)
  assert.equal(h.classes.has('is-done'), false)
  h.initialCanvas.emit('webglcontextrestored')
  h.initialCanvas.emit('webglcontextrestored')
  assert.equal(h.state.restorations, 1)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), true)
  h.stop()
})

test('Context handlers remain after cover removal and observe each distinct loss/restoration', () => {
  const h = setup({ ready: true })
  h.clock.frame()
  h.clock.frame()
  h.clock.advance(600)
  for (let i = 0; i < 2; i++) {
    assert.equal(h.initialCanvas.emit('webglcontextlost').defaultPrevented, true)
    h.initialCanvas.emit('webglcontextrestored')
  }
  assert.equal(h.state.losses, 2)
  assert.equal(h.state.restorations, 2)
  assert.equal(h.clock.rafs.size + h.clock.timers.size, 0)
  h.stop()
})

test('Canvas replacement while waiting detaches the old node and restarts two-frame count', () => {
  const h = setup({ ready: true })
  h.clock.frame()
  const replacement = new Events()
  h.state.canvas = replacement
  h.clock.frame()
  assert.equal(h.initialCanvas.count('webglcontextlost'), 0)
  assert.equal(replacement.count('webglcontextlost'), 1)
  assert.equal(h.classes.has('is-done'), false)
  h.clock.frame()
  assert.equal(h.classes.has('is-done'), true)
  h.stop()
  assert.equal(replacement.count('webglcontextrestored'), 0)
})

test('A page without a cover still binds context handlers and stops startup scheduling', () => {
  const h = setup({ ready: true, coverPresent: false })
  h.clock.frame()
  h.clock.frame()
  assert.equal(h.clock.rafs.size + h.clock.timers.size, 0)
  assert.equal(h.initialCanvas.count('webglcontextlost'), 1)
  h.stop()
})
