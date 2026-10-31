// The selected view's fan: a dithered sonar ripple (Jason 2026-10-30, trial A2: "频率应该更接近声呐 … 颗粒需要再细"). Paper Shaders' dithering shader
// (Apache-2.0, assets/LICENSES.md) with ripple, 8×8 and A2's numbers. The ripple's centre cannot be offset, so the canvas is twice the
// icon, centred on the transducer, and a mask of the fan cuts it out. One WebGL context, only on the selected tile, gone when the selection
// changes. No WebGL: a plain blue fan. Reduced motion: one still frame. Phones have no panel, so `live` is false and no context is made.
import { useEffect, useMemo, useRef } from 'react'
import { ShaderMount, ditheringFragmentShader, getShaderColorFromString } from '@paper-design/shaders'
import { fan } from './ViewIcon'

const UNIFORMS = {
  u_colorBack: getShaderColorFromString('#06243a'), u_colorFront: getShaderColorFromString('#4dbcff'),
  u_shape: 5, u_type: 4, u_pxSize: 0.5, // ripple, 8x8
  u_fit: 0, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
}
const SPEED = 4
// A2 used scale 0.25 on 170 px tiles, about three rings along the fan. The tiles are smaller here, so the scale follows the fan's length: same rings
const ringScale = (R, width) => Math.max(R, 30) / (2 * width) / 1.8

export default function DitherFan({ beams, live, width, height }) {
  const host = useRef(null)
  const mask = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${beams.map((b) => `<path d="${fan(b.x, b.y, b.aim, b.deg, b.R)}"/>`).join('')}</svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }, [beams, width, height])
  useEffect(() => {
    if (!live) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let mount = null
    const u_scale = ringScale(Math.max(...beams.map((b) => b.R)), width)
    try { mount = new ShaderMount(host.current, ditheringFragmentShader, { ...UNIFORMS, u_scale }, undefined, still ? 0 : SPEED, still ? 4000 : 0) } catch { /* no WebGL2: the plain fan underneath shows */ }
    return () => mount?.dispose() // also releases the context
  }, [live, mask]) // eslint-disable-line react-hooks/exhaustive-deps
  const { x, y } = beams[0] // Combo's two fans share one transducer
  return (
    <span className="ac-dither" aria-hidden="true" style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }}>
      <span ref={host} className="ac-dither-host" style={{ left: `${(x / width) * 100}%`, top: `${(y / height) * 100}%` }} />
    </span>
  )
}
