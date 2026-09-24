import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders'

// Full-screen quad driven by uniforms. `state` is a mutable ref object owned by
// the page so pointer moves do not re-render React every frame.
function Quad({ state }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uResolution: { value: new THREE.Vector2(1, 1) },
      uSceneSize: { value: new THREE.Vector2(60, 40) },
      uSurfaceY: { value: 13 },
      uDeviceX: { value: 30 },
      uTime: { value: 0 },
      uFanA: { value: new THREE.Vector2(-19.5, 19.5) },
      uFanB: { value: new THREE.Vector2(0, 0) },
      uFanCount: { value: 1 },
      uRange: { value: 20 },
      uShowScene: { value: 1 },
    }),
    [],
  )

  if (import.meta.env.DEV) window.__sonarU = uniforms // debug only
  const time = useRef(0)
  useFrame(({ size, gl }, delta) => {
    // read `size` from the frame state, not from the render closure: the
    // closure can hold a stale size and then everything is NaN → black canvas
    const s = state.current
    // R3F copies plain-object uniforms when it applies the `uniforms` prop, so
    // scalar `{ value }` entries in our memoised object are NOT the material's.
    // Always write through the material's own uniforms.
    const u = mat.current?.uniforms
    if (!u || !size.width || !size.height) return
    const aspect = size.width / size.height
    gl.setViewport(0, 0, size.width, size.height) // belt and braces: keep viewport = canvas
    u.uResolution.value.set(gl.domElement.width, gl.domElement.height)
    time.current += Math.min(delta, 0.1)
    // fixed visible HEIGHT in metres so phones (portrait) still show the lake
    const h = s.sceneHeightM
    const w = h * aspect
    u.uSceneSize.value.set(w, h)
    u.uSurfaceY.value = h / 3 // 1/3 sky, 2/3 water (brief)
    u.uDeviceX.value = s.deviceX01 * w
    u.uTime.value = time.current
    u.uFanA.value.set(s.fans[0][0], s.fans[0][1])
    if (s.fans[1]) u.uFanB.value.set(s.fans[1][0], s.fans[1][1])
    u.uFanCount.value = s.fans.length
    u.uRange.value = s.rangeM
    u.uShowScene.value = s.showScene ? 1 : 0
    if (s.debugEl) {
      s.debugEl.textContent = `size ${size.width}×${size.height} dpr ${gl.getPixelRatio()} buf ${gl.domElement.width}×${gl.domElement.height} | scene ${w.toFixed(1)}×${h.toFixed(1)} m | x01 ${s.deviceX01.toFixed(3)} devX ${u.uDeviceX.value.toFixed(1)} | fanA ${s.fans[0][0]},${s.fans[0][1]}`
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthTest={false} depthWrite={false} />
    </mesh>
  )
}

export default function SonarScene({ state }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: import.meta.env.DEV }}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      resize={{ scroll: false, debounce: 0 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Quad state={state} />
    </Canvas>
  )
}
