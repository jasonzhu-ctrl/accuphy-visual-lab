import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shaders'

// Full-screen quad driven by uniforms. `state` is a mutable ref object owned by
// the page so pointer moves do not re-render React every frame.
function Quad({ state }) {
  const mat = useRef()
  const { size } = useThree()
  const uniforms = useMemo(
    () => ({
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

  useFrame(({ clock }) => {
    const s = state.current
    const u = uniforms
    const aspect = size.width / size.height
    const w = s.sceneWidthM
    const h = w / aspect
    u.uSceneSize.value.set(w, h)
    u.uSurfaceY.value = h / 3 // 1/3 sky, 2/3 water (brief)
    u.uDeviceX.value = s.deviceX01 * w
    u.uTime.value = clock.elapsedTime
    u.uFanA.value.set(s.fans[0][0], s.fans[0][1])
    if (s.fans[1]) u.uFanB.value.set(s.fans[1][0], s.fans[1][1])
    u.uFanCount.value = s.fans.length
    u.uRange.value = s.rangeM
    u.uShowScene.value = s.showScene ? 1 : 0
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
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Quad state={state} />
    </Canvas>
  )
}
