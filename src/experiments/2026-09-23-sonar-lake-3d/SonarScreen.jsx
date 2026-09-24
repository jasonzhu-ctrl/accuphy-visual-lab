import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_FANS, sonarVertex, sonarFragment } from './sonarShader'

// Takes over the frame loop (priority 1): renders a depth strip per fan from the
// transducer, then the main view, then the sonar screen as an overlay quad.
// Objects on layer 1 (water, beams, boat) are invisible to the sonar cameras.
export const SONAR_HIDE_LAYER = 1
const STRIP_W = 1024, STRIP_H = 32

export default function SonarScreen({ state, rect }) {
  const { gl, scene, camera, size } = useThree()
  const res = useMemo(() => {
    const targets = [0, 1].map(() => {
      const rt = new THREE.WebGLRenderTarget(STRIP_W, STRIP_H, { depthBuffer: true })
      rt.depthTexture = new THREE.DepthTexture(STRIP_W, STRIP_H, THREE.UnsignedIntType)
      return rt
    })
    const cams = [0, 1].map(() => new THREE.PerspectiveCamera(20, 1, 0.3, 150))
    cams.forEach((c) => c.layers.set(0))
    const mat = new THREE.ShaderMaterial({
      vertexShader: sonarVertex, fragmentShader: sonarFragment, depthTest: false, depthWrite: false,
      uniforms: {
        uDepth0: { value: targets[0].depthTexture }, uDepth1: { value: targets[1].depthTexture },
        uFanCount: { value: 0 }, uFan: { value: [new THREE.Vector4(), new THREE.Vector4()] },
        uNearFar: { value: new THREE.Vector2(0.3, 150) }, uRange: { value: 20 },
        uScreenMin: { value: new THREE.Vector2(-20, 0) }, uScreenSize: { value: new THREE.Vector2(40, 30) }, uTime: { value: 0 }, uUnitM: { value: 0.3048 }, uFlat: { value: 0 },
      },
    })
    const overlay = new THREE.Scene()
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
    quad.frustumCulled = false
    overlay.add(quad)
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    return { targets, cams, mat, overlay, quad, ortho }
  }, [])
  useEffect(() => { camera.layers.enable(SONAR_HIDE_LAYER) }, [camera])
  useEffect(() => () => { res.targets.forEach((t) => t.dispose()); res.mat.dispose() }, [res])

  const tmpUp = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const s = state.current
    const specs = s.specs.slice(0, MAX_FANS)
    const u = res.mat.uniforms
    u.uTime.value += dt
    u.uRange.value = s.rangeM
    u.uUnitM.value = s.imperial ? 0.3048 : 1
    u.uFanCount.value = specs.length
    const flat = specs[0] && specs[0].frame.n.y !== 0 // panoramic: thickness normal is vertical
    u.uFlat.value = flat ? 1 : 0

    // 1) depth strips from the transducer
    specs.forEach((sp, k) => {
      const cam = res.cams[k]
      const half = (sp.a1 - sp.a0) / 2, thickHalf = Math.abs(sp.s1 - sp.s0) === 2 ? sp.theta : sp.theta / 2
      const tanH = Math.tan(half), tanV = Math.tan(thickHalf)
      cam.fov = THREE.MathUtils.radToDeg(thickHalf) * 2
      cam.aspect = tanH / tanV
      cam.updateProjectionMatrix()
      cam.position.copy(s.apex)
      // for one-sided thickness (panoramic: s0=0, s1=1) aim the camera at the middle of the slab
      const c = sp.frame.c.clone()
      if (sp.s0 === 0) c.addScaledVector(sp.frame.n, Math.tan(sp.theta) * 0.5).normalize()
      tmpUp.copy(sp.frame.n).negate() // so NDC +x = +wide angle (see docs)
      cam.up.copy(tmpUp)
      cam.lookAt(s.apex.x + c.x, s.apex.y + c.y, s.apex.z + c.z)
      gl.setRenderTarget(res.targets[k])
      gl.clear()
      gl.render(scene, cam)
      // screen-plane centre angle: for vertical fans it is the tilt (angle of c from straight-down)
      const centreAngle = flat ? 0 : Math.atan2(sp.frame.c.x, -sp.frame.c.y)
      u.uFan.value[k].set(centreAngle, half, tanH, tanV)
    })
    gl.setRenderTarget(null)

    // 2) main view
    gl.autoClear = true
    gl.render(scene, camera)

    // 3) sonar screen overlay in the bottom-right corner
    const r = rect.current
    const w = Math.round(size.width * r.w), h = Math.round(w * r.aspect)
    const x = Math.round(size.width - w - r.margin), y = Math.round(r.margin)
    const R = s.rangeM
    // fit the fans like the app does: apex at the top, forward wedges start at the left
    let xmin = 0, xmax = 0, ymax = 0
    for (let k = 0; k < specs.length; k++) {
      const f = u.uFan.value[k]
      const lo = f.x - f.y, hi = f.x + f.y
      xmin = Math.min(xmin, R * Math.sin(Math.max(lo, -Math.PI / 2))); xmax = Math.max(xmax, R * Math.sin(Math.min(hi, Math.PI / 2)))
      ymax = Math.max(ymax, lo <= 0 && hi >= 0 ? R : R * Math.cos(Math.min(Math.abs(lo), Math.abs(hi))))
    }
    const m = R * 0.04
    let bx = xmin - m, by = -m, bw = xmax - xmin + 2 * m, bh = ymax + 2 * m
    const want = w / h
    if (bw / bh < want) { const nw = bh * want; bx -= (nw - bw) / 2; bw = nw } else { bh = bw / want }
    u.uScreenMin.value.set(bx, by); u.uScreenSize.value.set(bw, bh)
    gl.autoClear = false
    gl.setViewport(x, y, w, h)
    gl.setScissor(x, y, w, h)
    gl.setScissorTest(true)
    gl.render(res.overlay, res.ortho)
    gl.setScissorTest(false)
    gl.setViewport(0, 0, size.width, size.height)
    gl.autoClear = true
  }, 1)
  return null
}
