import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFrame, useStore, useThree } from '@react-three/fiber'
import { createActiveClock, guardPausedFrames } from './labMotion'

// Mount inside Canvas, before the scene. Negative priority does not take over
// rendering; it restores time before fish (0) and the sonar renderer (1).
export default function SceneLifecycle({ allowPausedDraw = false }) {
  const store = useStore()
  const get = useThree((s) => s.get)
  const frameloop = useThree((s) => s.frameloop)
  useThree((s) => s.size) // a canvas resize clears its drawing buffer, even while paused
  const active = useRef(null)
  if (!active.current) active.current = createActiveClock()
  useFrame(({ clock }, delta) => active.current.step(clock, delta), -1000)
  useLayoutEffect(() => guardPausedFrames(store, active.current), [store])
  useLayoutEffect(() => {
    const sync = () => {
      const s = get()
      active.current.visibility(s.clock, document.hidden, s.frameloop !== 'never')
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [get])
  // A paused scene still needs a new picture after a view/unit/range commit or
  // a resize. Queue one frame per commit, never a continuous loop. No dependency
  // array is intentional: the state ref's contents do not change its identity.
  useLayoutEffect(() => {
    if (frameloop !== 'never') return
    active.current.step(get().clock, 0) // setFrameloop reset it; restore the frozen simulation time
    if (!allowPausedDraw || document.hidden) return
    const frame = requestAnimationFrame(() => {
      const s = get()
      if (s.frameloop !== 'never' || document.hidden) return
      // In R3F 9.8's never branch, timestamp is compared to elapsedTime in
      // seconds. Passing the same value yields delta=0 for every subscriber.
      // Skip global effects: this one-off update belongs only to this Canvas.
      active.current.step(s.clock, 0)
      s.advance(s.clock.elapsedTime, false)
    })
    return () => cancelAnimationFrame(frame)
  })
  return null
}

// This is a separate suspension reason, never a setter for the user's Pause.
// Combine it with userPaused/gate only when choosing Canvas.frameloop.
export function useSceneSuspended(elementRef) {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const [inViewport, setInViewport] = useState(true)
  useEffect(() => {
    const sync = () => setHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
  useEffect(() => {
    const element = elementRef.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    // The implicit root includes ancestor browsing-context clipping, so the
    // full Lab element can be observed inside its iframe without parent access.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setInViewport(entry.isIntersecting)
    }, { root: null, rootMargin: '0px', threshold: 0 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef])
  return hidden || !inViewport
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const sync = () => setReduced(query.matches)
    sync()
    if (query.addEventListener) query.addEventListener('change', sync)
    else query.addListener(sync)
    return () => {
      if (query.removeEventListener) query.removeEventListener('change', sync)
      else query.removeListener(sync)
    }
  }, [])
  return reduced
}
