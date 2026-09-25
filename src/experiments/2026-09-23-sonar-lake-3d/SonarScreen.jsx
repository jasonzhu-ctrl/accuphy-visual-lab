import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_FANS, sonarVertex, sonarFragment } from './sonarShader'
import { colormapTexture } from './colormaps'
import { depthAt } from './terrain'
import { bakeTerrain, makeMarksTexture, computeMarks } from './sonarMarks'
import { logoFrame, makeLogoSdf, LOGO_SDF_MAX, LOCKUP, LOCKUP_SVG } from './logo'

// CSS 3D pose of the phone (index.jsx applies the same transform to the DOM frame)
export const PHONE_POSE = { perspective: 1400, rotY: -16, rotX: 6 }

// How the app frames each view (measured on the tablet 2026-09-24, docs/app-chrome.md §2/§6).
// A box is {x0, y0, w, h} in metres with the apex at (0,0) and y growing with depth;
// the quad maps it onto the whole display, so each axis is stretched independently.
export function screenLayout(deviceId, mode, R, aspect, specs, depthM) {
  const half = specs[0] ? (specs[0].a1 - specs[0].a0) / 2 : 0.6
  const mini = deviceId === 'PLM'
  if (mode === 'forward') {
    if (mini) return { box0: { x0: 0, y0: 0, w: R, h: R / aspect }, apexU: 0, split: false }            // apex top-left, 1:1
    const D = depthM ?? 0.85 * R // PL Forward has its own depth-range axis (sonar-style.md §6.9) — AUTO on the page (index.jsx)
    // the app draws echoes over the whole box, also below the range (8 m range shows the bottom at 10.5 m, §6.9),
    // so the sound reaches the far corner of the box
    return { box0: { x0: -0.25 * R, y0: 0, w: 1.25 * R, h: D }, apexU: 0.2, split: false, reach: Math.hypot(R, D) } // apex 20 % in; axes independent
  }
  if (mode === 'down') {
    if (mini) { const hw = R * Math.tan(half) * 1.12; return { box0: { x0: -hw, y0: 0, w: 2 * hw, h: R }, apexU: 0.5, split: false, mottle: true } } // fan corners on the screen corners
    const w = R * aspect; return { box0: { x0: -w / 2, y0: 0, w, h: R }, apexU: 0.5, split: false }      // 1:1, the 135° fan runs off the sides
  }
  // Panoramic (app lake frames, §7.13): 1:1, apex just below the bottom edge, top edge = range; the data
  // runs out to the screen corners (no arc), only the two straight fan edges are drawn
  if (mode === 'panoramic') { const h = 0.9 * R, w = h * aspect; return { box0: { x0: -w / 2, y0: 0.1 * R, w, h }, apexU: 0.5, split: false } }
  // Combo (PLM): Forward panel upper-right (fan 1), Down panel lower-left (fan 0), shared apex at 20 %
  const fwd = { x0: -0.25 * R, y0: 0, w: 1.25 * R, h: 0.7 * R }
  const Rd = R / 3, wd = (Rd * aspect) / 2 // the Down panel is zoomed in and stretched ×2 like Live Down
  const down = { x0: -0.2 * wd, y0: 0, w: wd, h: Rd }
  return { box0: fwd, box1: down, apexU: 0.2, split: true, mottle: false }
}

// Takes over the frame loop (priority 1): renders a depth strip per fan from the transducer (Down /
// Forward) or a top-down depth map (Panoramic), then the main view, then the sonar screen as an
// overlay quad. Layers: 1 = water, beams, boat (never seen by the sonar); 2 = lakebed (seen by the
// vertical sonar cameras, not by the top-down map — the bottom comes from the baked terrain there);
// 3 = fish (never in the sonar passes: fish are drawn analytically, sonarMarks.js).
export const SONAR_HIDE_LAYER = 1
export const LAKEBED_LAYER = 2
export const FISH_LAYER = 3
export const LOGO_LAYER = 4 // the lakebed logo: main view + Panoramic top-down map; the side views draw it analytically
const TOP_N = 512 // top-down structure map for Panoramic (±range around the transducer)
const STRIP_W = 1024, STRIP_H = 128 // 128 rows across the 18–20° thickness ≈ 0.15°/row: a 5 cm bait fish at 12 m still lands on a row (was 32 → dotted small fish)

export default function SonarScreen({ state, rect, lakeMats }) {
  const { gl, scene, camera, size } = useThree()
  if (import.meta.env.DEV) {
    window.__sonarGL = gl; window.__sonarState = state.current
    window.__lakeSnap = () => { gl.setRenderTarget(null); gl.render(scene, camera); return gl.domElement.toDataURL('image/png') } // dev: the 3D view alone as a PNG
  }
  const res = useMemo(() => {
    const targets = [0, 1].map(() => {
      // NEAREST: the colour target's alpha is a TAG (1 fish, 0.5 structure, 0 bottom); linear filtering
      // blended fish edges into 'structure' values and speckled every small fish (2026-09-24)
      const rt = new THREE.WebGLRenderTarget(STRIP_W, STRIP_H, { depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
      rt.depthTexture = new THREE.DepthTexture(STRIP_W, STRIP_H, THREE.UnsignedIntType)
      return rt
    })
    const cams = [0, 1].map(() => new THREE.PerspectiveCamera(20, 1, 0.3, 150))
    cams.forEach((c) => { c.layers.set(0); c.layers.enable(LAKEBED_LAYER) })
    // Panoramic: top-down orthographic depth map of the structures (trees, rocks, wrecks) around the transducer
    const topRT = new THREE.WebGLRenderTarget(TOP_N, TOP_N, { depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
    topRT.depthTexture = new THREE.DepthTexture(TOP_N, TOP_N, THREE.FloatType)
    const topCam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 70)
    topCam.layers.set(0); topCam.layers.enable(LOGO_LAYER)
    topCam.up.set(1, 0, 0) // image up = forward (+x), image right = starboard (+z)
    const bake = bakeTerrain()
    const marks = makeMarksTexture()
    const logo = logoFrame()
    const mat = new THREE.ShaderMaterial({
      vertexShader: sonarVertex, fragmentShader: sonarFragment, depthTest: false, depthWrite: false,
      uniforms: {
        uDepth0: { value: targets[0].depthTexture }, uDepth1: { value: targets[1].depthTexture },
        uColor0: { value: targets[0].texture }, uColor1: { value: targets[1].texture },
        uFanCount: { value: 0 }, uFan: { value: [new THREE.Vector4(), new THREE.Vector4()] },
        uNearFar: { value: new THREE.Vector2(0.3, 150) }, uRange: { value: 20 }, uReach: { value: 20 },
        uBox0: { value: new THREE.Vector4(-20, 0, 40, 30) }, uBox1: { value: new THREE.Vector4(-20, 0, 40, 30) }, uSplit: { value: 0 }, uApexU: { value: 0.5 },
        uTime: { value: 0 }, uFlat: { value: 0 }, uStreak: { value: 1 }, uDebug: { value: window.location.search.includes('sonardebug') ? 1 : 0 },
        uMarks: { value: marks.tex }, uMarkCount: { value: 0 }, uPulse: { value: 0.05 }, uBeamHalf: { value: 0.012 },
        uTerrain: { value: bake.tex }, uTerrainHalf: { value: bake.H },
        uTop: { value: topRT.depthTexture }, uTopR: { value: 10 }, uTopCamY: { value: 2 }, uTopNearFar: { value: new THREE.Vector2(0.1, 70) },
        uApexXZ: { value: new THREE.Vector2() }, uApexDepth: { value: 0.9 },
        uLogoB: { value: logo.B }, uLogoU: { value: logo.U }, uLogoV: { value: logo.V },
        uLogoSdf: { value: makeLogoSdf() }, uLogoMap: { value: new THREE.Vector4(1 / logo.s, LOCKUP_SVG.cx, LOCKUP_SVG.bottom, LOGO_SDF_MAX) },
        uLogoSvg: { value: new THREE.Vector2(LOCKUP_SVG.w, LOCKUP_SVG.h) }, uLogoExt: { value: new THREE.Vector2(LOCKUP.width / 2 + 0.3, LOCKUP_SVG.bottom * logo.s + 0.3) },
        uLUT: { value: colormapTexture('garmin_amber') }, uGain: { value: 0.57 }, uDynRange: { value: 0.85 }, uContrast: { value: 0.4 }, uNoise: { value: 0.3 }, uGamma: { value: 0.75 }, // calibrated 2026-09-24 against the two confirmed frames (sonar-style.md §6.11)
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
    if (import.meta.env.DEV) window.__sonar = { targets, cams, mat, topRT, marks }
    // dev: window.__sonarHist(bins) — render the sonar picture flat into an offscreen target and
    // return the histogram of LUT index (nearest LUT entry per pixel) so the engine's brightness
    // distribution can be compared number-for-number with the app's reference frames
    if (import.meta.env.DEV) {
      const histRT = new THREE.WebGLRenderTarget(768, 384)
      window.__sonarHist = (bins = 10) => {
        const pos = quad.geometry.attributes.position, aW = quad.geometry.attributes.aW
        const savedP = pos.array.slice(), savedW = aW.array.slice()
        const corners = [[-1, 1], [1, 1], [-1, -1], [1, -1]]
        corners.forEach(([x, y], i) => { pos.setXYZ(i, x, y, 0); aW.setX(i, 1) })
        pos.needsUpdate = true; aW.needsUpdate = true
        const gl = window.__sonarGL
        gl.setRenderTarget(histRT); gl.render(overlay, ortho); gl.setRenderTarget(null)
        const px = new Uint8Array(768 * 384 * 4); gl.readRenderTargetPixels(histRT, 0, 0, 768, 384, px)
        pos.array.set(savedP); aW.array.set(savedW); pos.needsUpdate = true; aW.needsUpdate = true
        const lut = mat.uniforms.uLUT.value.image.data // 256×4 (rgba bytes)
        const hist = new Array(bins).fill(0); let black = 0, lit = 0
        for (let i = 0; i < px.length; i += 16) { // every 4th pixel
          const r = px[i], g = px[i + 1], b = px[i + 2]
          if (r + g + b < 24) { black++; continue }
          let best = 0, bd = 1e9
          for (let k = 0; k < 256; k++) { const dr = r - 255 * lut[k * 4], dg = g - 255 * lut[k * 4 + 1], db = b - 255 * lut[k * 4 + 2]; const d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = k } }
          hist[Math.min(bins - 1, Math.floor((best / 255) * bins))]++; lit++
        }
        return { black: black / (black + lit), lit, hist: hist.map((h) => +(h / lit).toFixed(3)) }
      }
      // dev: window.__sonarSnap() — the same flat render as a PNG data URL (for side-by-side files)
      window.__sonarSnap = () => {
        const pos = quad.geometry.attributes.position, aW = quad.geometry.attributes.aW
        const savedP = pos.array.slice(), savedW = aW.array.slice()
        ;[[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([x, y], i) => { pos.setXYZ(i, x, y, 0); aW.setX(i, 1) })
        pos.needsUpdate = true; aW.needsUpdate = true
        const gl = window.__sonarGL
        gl.setRenderTarget(histRT); gl.render(overlay, ortho); gl.setRenderTarget(null)
        const px = new Uint8Array(768 * 384 * 4); gl.readRenderTargetPixels(histRT, 0, 0, 768, 384, px)
        pos.array.set(savedP); aW.array.set(savedW); pos.needsUpdate = true; aW.needsUpdate = true
        const c = document.createElement('canvas'); c.width = 768; c.height = 384
        const ctx = c.getContext('2d'); const img = ctx.createImageData(768, 384)
        for (let y = 0; y < 384; y++) img.data.set(px.subarray((383 - y) * 768 * 4, (384 - y) * 768 * 4), y * 768 * 4) // GL rows are bottom-up
        for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255
        ctx.putImageData(img, 0, 0)
        return c.toDataURL('image/png')
      }
    }
    return { targets, cams, mat, overlay, quad, ortho, topRT, topCam, bake, marks }
  }, [])
  useEffect(() => { [SONAR_HIDE_LAYER, LAKEBED_LAYER, FISH_LAYER, LOGO_LAYER].forEach((l) => camera.layers.enable(l)) }, [camera])
  useEffect(() => () => { res.targets.forEach((t) => t.dispose()); res.topRT.dispose(); res.mat.dispose() }, [res])

  const tmpUp = useMemo(() => new THREE.Vector3(), [])
  useFrame((root, dt) => {
    const s = state.current
    const specs = s.specs.slice(0, MAX_FANS)
    const u = res.mat.uniforms
    u.uTime.value += dt
    u.uRange.value = s.rangeM
    if (s.colormap !== u.uLUT.name) { u.uLUT.value.dispose?.(); u.uLUT.value = colormapTexture(s.colormap); u.uLUT.name = s.colormap }
    u.uGain.value = s.gain ?? 0.57
    u.uContrast.value = s.contrast ?? 0.4
    u.uNoise.value = s.noise ?? 0.3
    u.uFanCount.value = specs.length
    const flat = specs[0] && specs[0].frame.n.y !== 0 // panoramic: thickness normal is vertical
    u.uFlat.value = flat ? 1 : 0
    // screen box(es) in metres — the app fills the screen and scales each axis on its own
    {
      const el0 = rect.current.el
      const aspect = el0 && el0.offsetHeight > 0 ? el0.offsetWidth / el0.offsetHeight : 2
      const lay = screenLayout(s.deviceId, s.mode, s.rangeM, aspect, specs, s.depthM)
      u.uBox0.value.set(lay.box0.x0, lay.box0.y0, lay.box0.w, lay.box0.h)
      const b1 = lay.box1 ?? lay.box0
      u.uBox1.value.set(b1.x0, b1.y0, b1.w, b1.h)
      u.uSplit.value = lay.split ? 1 : 0
      u.uApexU.value = lay.apexU
      u.uStreak.value = lay.mottle ? 0 : 1
      u.uReach.value = lay.reach ?? s.rangeM
      s.layout = lay // for the DOM chrome (rulers)
    }

    // 1) sonar passes (materials flag the pass so alpha = structure tag)
    lakeMats.forEach((m) => { m.userData.uniforms.uSonarPass.value = 1 })
    if (flat) {
      // Panoramic: one top-down depth map of the structures around the transducer (plan-view photograph)
      const R = s.rangeM * 1.02, cam = res.topCam
      cam.left = -R; cam.right = R; cam.top = R; cam.bottom = -R
      cam.near = 0.1; cam.far = 70
      cam.position.set(s.apex.x, 2, s.apex.z)
      cam.lookAt(s.apex.x, -60, s.apex.z)
      cam.updateProjectionMatrix()
      gl.setRenderTarget(res.topRT)
      gl.clear()
      gl.render(scene, cam)
      u.uTopR.value = R; u.uTopCamY.value = 2; u.uTopNearFar.value.set(cam.near, cam.far)
      const sp = specs[0]
      u.uFan.value[0].set(0, (sp.a1 - sp.a0) / 2, Math.tan((sp.a1 - sp.a0) / 2), Math.tan(sp.theta))
      u.uPulse.value = 0.04; u.uBeamHalf.value = 0.006
    } else {
      specs.forEach((sp, k) => {
        const cam = res.cams[k]
        const half = (sp.a1 - sp.a0) / 2
        const thickHalf = Math.abs(sp.s1 - sp.s0) === 2 ? sp.theta : sp.theta / 2
        const tanH = Math.tan(half), tanV = Math.tan(thickHalf)
        cam.fov = THREE.MathUtils.radToDeg(thickHalf) * 2
        cam.aspect = tanH / tanV
        cam.updateProjectionMatrix()
        cam.position.copy(s.apex)
        tmpUp.copy(sp.frame.n).negate() // so NDC +x = +wide angle (see docs)
        cam.up.copy(tmpUp)
        const c = sp.frame.c
        cam.lookAt(s.apex.x + c.x, s.apex.y + c.y, s.apex.z + c.z)
        gl.setRenderTarget(res.targets[k])
        gl.clear()
        gl.render(scene, cam)
        // screen-plane centre angle: the tilt of the fan centre from straight-down
        u.uFan.value[k].set(Math.atan2(c.x, -c.y), half, tanH, tanV)
      })
      u.uPulse.value = 0.05; u.uBeamHalf.value = 0.004 // the vertical fan's formed beams are fine (app: far fish stay thin dashes)
    }
    gl.setRenderTarget(null)
    lakeMats.forEach((m) => { m.userData.uniforms.uSonarPass.value = 0 })
    u.uApexXZ.value.set(s.apex.x, s.apex.z); u.uApexDepth.value = -s.apex.y
    // fish marks: every fish in the beam, projected into the view (sonarMarks.js)
    u.uMarkCount.value = computeMarks({ pop: s.pop, t: root.clock.elapsedTime, specs, apex: s.apex, flat, bake: res.bake, rangeM: flat ? s.rangeM : u.uReach.value }, res.marks)
    // the app's depth readout: water depth under the transducer, in the user's unit
    if (s.depthEl) {
      const d = depthAt(s.apex.x, s.apex.z)
      const txt = s.imperial ? `${(d / 0.3048).toFixed(1)} ft` : `${d.toFixed(1)} m`
      if (s.depthEl.textContent !== txt) s.depthEl.textContent = txt
    }
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
