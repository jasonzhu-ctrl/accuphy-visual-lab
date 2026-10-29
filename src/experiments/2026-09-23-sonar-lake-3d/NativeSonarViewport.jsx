import { useLayoutEffect, useRef } from 'react'

// The original desktop/portrait frame in index.jsx uses these exact dimensions.
// Keep its integer DOM layout aspect as input to the existing sonar projection;
// the visible tablet may be smaller, but must not change the represented range.
export default function NativeSonarViewport({ onAspect }) {
  const inner=useRef(null)
  useLayoutEffect(()=>{
    const update=()=>{const el=inner.current;if(el?.offsetHeight)onAspect(el.offsetWidth/el.offsetHeight)}
    update();const observer=new ResizeObserver(update);observer.observe(inner.current)
    return()=>observer.disconnect()
  },[onAspect])
  return <div className="bh-native-viewport" aria-hidden="true"><div ref={inner} style={{position:'absolute',inset:'2.6%'}} /></div>
}
