import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_FANS, sonarVertex, sonarFragment } from './sonarShader'

// CSS 3D pose of the phone (index.jsx applies the same transform to the DOM frame)
export const PHONE_POSE = { perspective: 1400, rotY: -16, rotX: 6 }

// Takes over the frame loop (priority 1): renders a depth strip per fan from the
// transducer, then the main view, then the sonar screen as an overlay quad.
// Objects on layer 1 (water, beams, boat) are invisible to the sonar cameras.
export const SONAR_HIDE_LAYER = 1
const STRIP_W = 1024, STRIP_H = 32

export default function SonarScreen({ state, rect, lakeMats }) {
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
        uColor0: { value: targets[0].texture }, uColor1: { value: targets[1].texture },
        uFanCount: { value: 0 }, uFan: { value: [new THREE.Vector4(), new THREE.Vector4()] },
        uNearFar: { value: new THREE.Vector2(0.3, 150) }, uRange: { value: 20 },
        uScreenMin: { value: new THREE.Vector2(-20, 0) }, uScreenSize: { value: new THREE.Vector2(40, 30) }, uTime: { value: 0 }, uUnitM: { value: 0.3048 }, uFlat: { value: 0 }, uDebug: { value: window.location.search.includes('sonardebug') ? 1 : 0 },
      },
    })
    const overlay = new THREE.Scene()
    // a 4-vertex quad whose corners are set every frame in CLIP space (x*w, y*w) with w per vertex,
    // so the picture gets the same perspective as the CSS-transformed phone and stays perspective-correct
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2))
    geo.setAttribute('aW', new THREE.Float32BufferAttribute(new Float32Array([1, 1, 1, 1]), 1))
    geo.setIndex([0, 2, 1, 1, 2, 3])
    const quad = new THREE.Mesh(geo, mat)
    quad.frustumCulled = false
    overlay.add(quad)
    const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    if (import.meta.env.DEV) window.__sonar = { targets, cams, mat }
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

    // 1) depth strips from the transducer (materials flag the pass so alpha = fish mask)
    lakeMats.forEach((m) => { m.userData.uniforms.uSonarPass.value = 1 })
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
    lakeMats.forEach((m) => { m.userData.uniforms.uSonarPass.value = 0 })
    if (s.debugEl) s.debugEl.textContent = `sonar fans ${specs.length} flat ${flat ? 1 : 0} fan0 ${u.uFan.value[0].toArray().map((v) => v.toFixed(2)).join(',')} apex ${s.apex.toArray().map((v) => v.toFixed(1)).join(',')}`

    // 2) main view
    gl.autoClear = true
    gl.render(scene, camera)

    // 3) sonar screen overlay in the bottom-right corner
    // the screen area is a DOM element inside the CSS-3D-transformed phone. Take its
    // LAYOUT rect (offset*, unaffected by transforms) relative to the phone's centre,
    // apply the same rotateX → rotateY → perspective maths as the CSS, and place the
    // quad corners in clip space with per-vertex w for perspective-correct sampling.
    const el = rect.current.el, frame = rect.current.frame
    if (!el || !frame) return
    const cr = gl.domElement.getBoundingClientRect(), fr = frame.getBoundingClientRect()
    if (fr.width < 8) return
    const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2
    const { perspective: P, rotY, rotX } = PHONE_POSE
    const ay = (rotY * Math.PI) / 180, ax = (rotX * Math.PI) / 180
    const corners = [[el.offsetLeft, el.offsetTop], [el.offsetLeft + el.offsetWidth, el.offsetTop], [el.offsetLeft, el.offsetTop + el.offsetHeight], [el.offsetLeft + el.offsetWidth, el.offsetTop + el.offsetHeight]]
    const pos = res.quad.geometry.attributes.position, aW = res.quad.geometry.attributes.aW
    corners.forEach(([lx, ly], i) => {
      let x = lx - fr.width / 2, y = ly - fr.height / 2, z = 0
      // rotateX (CSS y down, z toward the viewer)
      let y1 = y * Math.cos(ax) - z * Math.sin(ax), z1 = y * Math.sin(ax) + z * Math.cos(ax)
      // rotateY
      let x2 = x * Math.cos(ay) + z1 * Math.sin(ay), z2 = -x * Math.sin(ay) + z1 * Math.cos(ay)
      const w = (P - z2) / P
      const sx = cx + x2 / w, sy = cy + y1 / w // projected screen position (CSS px)
      const nx = ((sx - cr.left) / cr.width) * 2 - 1, ny = 1 - ((sy - cr.top) / cr.height) * 2
      pos.setXYZ(i, nx * w, ny * w, 0); aW.setX(i, w)
    })
    pos.needsUpdate = true; aW.needsUpdate = true
    const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight)
    if (w < 8 || h < 8) return
    gl.autoClear = false
    gl.setViewport(0, 0, size.width, size.height)
    gl.render(res.overlay, res.ortho)
    gl.autoClear = true
  }, 1)
  return null
}
