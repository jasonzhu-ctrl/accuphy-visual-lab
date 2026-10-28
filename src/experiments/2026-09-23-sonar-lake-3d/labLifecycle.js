// Watch the existing canvas without creating a context or publishing a ready event.
// A fallback timer discovers it in background tabs; only visible RAF callbacks count as frames.
export function startCanvasLifecycle({
  getCanvas,
  cover = null,
  readySeen = () => false,
  onLost = () => {},
  onRestored = () => {},
  onSettled = () => {},
  eventTarget = globalThis.window,
  visibilityTarget = globalThis.document,
  scheduler = globalThis,
}) {
  let canvas = null
  let ready = false
  let frames = 0
  let lost = false
  let settled = false
  let disposed = false
  let raf = null
  let pollTimer = null
  let removalTimer = null

  function cancelPending() {
    if (raf !== null) scheduler.cancelAnimationFrame(raf)
    if (pollTimer !== null) scheduler.clearTimeout(pollTimer)
    raf = null
    pollTimer = null
  }

  function handleLost(event) {
    if (disposed) return
    event.preventDefault()
    if (lost) return
    lost = true
    frames = 0
    cancelPending()
    onLost(event)
  }

  function handleRestored(event) {
    if (disposed || !lost) return
    lost = false
    frames = 0
    onRestored(event)
    if (!disposed && !settled) step(false)
  }

  function detachCanvas() {
    canvas?.removeEventListener('webglcontextlost', handleLost)
    canvas?.removeEventListener('webglcontextrestored', handleRestored)
  }

  function findCanvas() {
    const next = getCanvas() || null
    if (next === canvas) return
    detachCanvas()
    canvas = next
    frames = 0
    lost = false
    // Listen as soon as the DOM node exists, including before ready or the first render.
    canvas?.addEventListener('webglcontextlost', handleLost)
    canvas?.addEventListener('webglcontextrestored', handleRestored)
  }

  function schedule() {
    if (disposed || lost || settled || raf !== null || pollTimer !== null) return
    raf = scheduler.requestAnimationFrame(() => step(true))
    pollTimer = scheduler.setTimeout(() => step(false), 400)
  }

  function step(fromFrame) {
    // RAF and timeout race for one turn. The winner cancels its sibling before scheduling again.
    cancelPending()
    if (disposed || settled) return
    findCanvas()
    if (!ready && readySeen()) ready = true
    if (lost) return
    if (visibilityTarget?.hidden) frames = 0
    else if (fromFrame && canvas && ready) frames++
    if (frames >= 2) {
      settled = true
      onSettled() // local presentation milestone; never publish or redefine the business ready event
      if (cover) {
        cover.inert = true
        cover.setAttribute('aria-hidden', 'true')
        cover.classList.add('is-done')
        removalTimer = scheduler.setTimeout(() => {
          removalTimer = null
          if (!disposed) cover.remove()
        }, 600)
      }
      return
    }
    schedule()
  }

  function handleReady(event) {
    if (disposed || ready || event.detail?.event !== 'ready') return
    ready = true
    step(false)
  }

  function handleVisibility() {
    if (disposed || settled || lost) return
    if (visibilityTarget?.hidden) frames = 0
    step(false)
  }

  eventTarget?.addEventListener('accuphy-lab', handleReady)
  visibilityTarget?.addEventListener('visibilitychange', handleVisibility)
  step(false)

  return () => {
    if (disposed) return
    disposed = true
    cancelPending()
    if (removalTimer !== null) scheduler.clearTimeout(removalTimer)
    removalTimer = null
    eventTarget?.removeEventListener('accuphy-lab', handleReady)
    visibilityTarget?.removeEventListener('visibilitychange', handleVisibility)
    detachCanvas()
    canvas = null
  }
}
