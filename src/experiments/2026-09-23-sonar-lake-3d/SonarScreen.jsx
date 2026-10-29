import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_FANS, sonarVertex, sonarFragment } from './sonarShader'
import { colormapTexture } from './colormaps'
import { depthAt } from './terrain'
import { bakeTerrain, makeMarksTexture, computeMarks } from './sonarMarks'
import { logoFrame, makeLogoSdf, LOGO_SDF_MAX, LOCKUP, LOCKUP_SVG } from './logo'
import { niceStep } from './SonarChrome'
import { FT } from '../2026-09-23-sonar-beam/devices'

// CSS 3D pose of the phone (index.jsx applies the same transform to the DOM frame)
export const PHONE_POSE = { perspective: 1400, rotY: -16, rotX: 6 }
// phones (< 640 px wide): nearly flat, so the frame can fill the width (Jason 2026-10-03: 手机能否保留边框 合理安排一下空间)
export const PHONE_POSE_PHONE = { perspective: 1400, rotY: -4, rotX: 2 }
export const isPhoneLayout = () => typeof window !== 'undefined' && window.innerWidth < 640
// a phone held sideways (#140, Jason 2026-10-24: 手机横屏还是用以前的方案好了 在屏幕上有磨砂块点击选): the phone IS the app —
// no drawn phone, the app's Home with its frosted tiles, then the sonar full-screen with the app's own controls and the
// lake as a small inset that taps to swap (index.jsx). Lake page only; the ice page keeps its own layout.
export const isLandscapePhone = () => typeof window !== 'undefined' && window.innerWidth > window.innerHeight && window.innerHeight < 500
export const PHONE_POSE_FLAT = { perspective: 1400, rotY: 0, rotX: 0 }
export const ICE_SPLIT = 0.42 // the flasher panel's share of the display width in the ice views
export const phonePose = () => (isPhoneLayout() ? PHONE_POSE_PHONE : PHONE_POSE)

// How the app frames each view (measured on the tablet 2026-09-24, docs/app-chrome.md §2/§6).
// A box is {x0, y0, w, h} in metres with the apex at (0,0) and y growing with depth;
// the quad maps it onto the whole display, so each axis is stretched independently.
// PLM Combo, Forward panel depth (m) for range R and water depth D (both m); index.jsx uses it for the 3D curtain too
export const comboFwdDepth = (R, D) => Math.min(0.7 * R, Math.sqrt(0.7 * R * 1.3 * D))

export function screenLayout(deviceId, mode, R, aspect, specs, depthM) {
  const half = specs[0] ? (specs[0].a1 - specs[0].a0) / 2 : 0.6
  const mini = deviceId === 'PLM'
  if (mode === 'forward') {
    // PLM: apex top-left; the depth axis is the page's AUTO depth range (Jason 2026-09-25), the sound reaching the far corner
    if (mini) { const D = depthM ?? R / aspect; return { box0: { x0: 0, y0: 0, w: R, h: D }, apexU: 0, split: false, reach: Math.hypot(R, D) } }
    const D = depthM ?? 0.85 * R // PL Forward has its own depth-range axis (sonar-style.md §6.9) — AUTO on the page (index.jsx)
    // the app draws echoes over the whole box, also below the range (8 m range shows the bottom at 10.5 m, §6.9),
    // so the sound reaches the far corner of the box
    return { box0: { x0: -0.25 * R, y0: 0, w: 1.25 * R, h: D }, apexU: 0.2, split: false, reach: Math.hypot(R, D) } // apex 20 % in; axes independent
  }
  // the Mini's ice views (2026-10-16, reference/product-images/PingLive Mini Views.png): the flasher dial fills the left
  // ICE_SPLIT of the display; the right panel is the Live Down fan (liveice) or the scrolling 2D history (ice), drawn
  // over the panel's own width, so the fan geometry is the Live Down one with the panel's aspect
  if (mode === 'liveice' || mode === 'ice') { const hw = R * Math.tan(half) * 1.12 * 0.8; return { box0: { x0: -hw, y0: 0, w: 2 * hw, h: R }, apexU: 0.5, split: false, mottle: true, ice: mode === 'ice' ? 2 : 1, iceSplit: ICE_SPLIT } }
  if (mode === 'down') {
    if (mini) { const hw = R * Math.tan(half) * 1.12; return { box0: { x0: -hw, y0: 0, w: 2 * hw, h: R }, apexU: 0.5, split: false, mottle: true } } // fan corners on the screen corners
    const w = R * aspect; return { box0: { x0: -w / 2, y0: 0, w, h: R }, apexU: 0.5, split: false, reach: Math.hypot(w / 2, R) } // 1:1, the 135° fan runs off the sides; echoes fill the lower corners (§6.9)
  }
  // Panoramic (app lake frames, §7.13): 1:1, apex just below the bottom edge, top edge = range; the data
  // runs out to the screen corners (no arc), only the two straight fan edges are drawn
  if (mode === 'panoramic') { const h = 0.9 * R, w = h * aspect; return { box0: { x0: -w / 2, y0: 0.1 * R, w, h }, apexU: 0.5, split: false } }
  // Combo (PLM): Forward panel upper-right (fan 1), Down panel lower-left (fan 0), shared apex at 20 %. Each panel has
  // its own scale, as in the app: Forward 0.7 × range deep; Down on the AUTO depth range (the app frame: 4.1 m of water,
  // Down panel 0–5.5 m). It used R / 3, which matched that one frame by chance and in 54 ft of water at 80 ft range
  // left the bottom off the Down panel (2026-09-25 QA). The sound reaches each panel's far corner.
  const Dd = depthM ?? R / 3
  // the Forward panel's depth axis: the app's 0.7 × range at short range; at long range it no longer grows with the
  // range alone but meets the water halfway — the geometric mean of 0.7 × range and 1.3 × the water depth — so the bottom
  // is not squeezed into the top strip, yet rises only gently (Jason 2026-10-23: 方案 A 更好 但抬高的再少一点 曲度跟原来相近)
  const fwd = { x0: -0.25 * R, y0: 0, w: 1.25 * R, h: comboFwdDepth(R, Dd) }
  const wd = (Dd * aspect) / 2 // the Down panel is stretched ×2 like Live Down
  const down = { x0: -0.2 * wd, y0: 0, w: wd, h: Dd }
  return { box0: fwd, box1: down, apexU: 0.2, split: true, mottle: false, reach: Math.max(Math.hypot(R, 0.7 * R), Math.hypot(0.8 * wd, Dd)) }
}

// Takes over the frame loop (priority 1): renders a depth strip per fan from the transducer (Down /
// Forward, and Panoramic with its fan laid flat, #171/#178), then the main view, then the sonar screen as an
// overlay quad. Layers: 1 = water, beams, boat (never seen by the sonar); 2 = lakebed (seen by the
// sonar cameras); 3 = fish (drawn from their bodies into the fish image, pass 4, #153).
export const SONAR_HIDE_LAYER = 1
export const LAKEBED_LAYER = 2
export const FISH_LAYER = 3
export const LOGO_LAYER = 4 // the lakebed logo: main view + Panoramic's strips (seen as structure); the side views draw it analytically
const FISH_H = 256 // the fish image, rows per fan (#153): about a pulse per row at 30 m (sonarShader fishImg)
// Panoramic as a sound picture (#171, the only Panoramic since #178): the strip camera looks PANO_TILT below the horizon and covers
// ±PANO_HALF, i.e. 5°–65° — the 5°–25° slab plus the sidelobe that finds the bottom from the boat outward (sonar-style
// §7.12); the rows are weighted by depression in the shader (rowWeight). The sound reaches the screen corners (1.45 × range).
const PANO_TILT = THREE.MathUtils.degToRad(35), PANO_HALF = THREE.MathUtils.degToRad(30), PANO_REACH = 1.45
const STRIP_W = 1024, STRIP_H = 128, ECHO_H = 512 // 128 rows across the 18–20° thickness ≈ 0.15°/row: a 5 cm bait fish at 12 m still lands on a row (was 32 → dotted small fish)

export default function SonarScreen({ state, rect, lakeMats }) {
  const { gl, scene, camera, size } = useThree()
  if (import.meta.env.DEV) {
    window.__sonarGL = gl; window.__sonarState = state.current; window.__scene = scene
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
    // the far side of structure (2026-10-23, decision #135): the same strips rendered with BACK faces and only structure
    // writing (lakeMaterial uSonarPass = 2), so each row knows where it leaves a hull or a trunk — the section between
    // the two is drawn lit-through (wood) or dark (timber, rock) and the shadow starts behind the far face
    const targetsB = [0, 1].map(() => { const rt = new THREE.WebGLRenderTarget(STRIP_W, STRIP_H, { depthBuffer: true, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }); rt.depthTexture = new THREE.DepthTexture(STRIP_W, STRIP_H, THREE.UnsignedIntType); return rt })
    // the echo splat (pass 3): (angle across the fan × range) per fan, every structure surface added up — sampled by
    // fanEcho as the structure echo (sonarShader uEcho0/1)
    // 512 rows (was 256) and 4× MSAA: a thin branch covers part of a cell, and without coverage each cell came out all or
    // nothing, so crowns drew as a mosaic of blocks (Jason 2026-10-24: 树枝 … 类似于像马赛克一样的这种, 这是不对的)
    const echoRTs = [0, 1].map(() => new THREE.WebGLRenderTarget(STRIP_W, ECHO_H, { depthBuffer: false, samples: 4, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }))
    const cams = [0, 1].map(() => new THREE.PerspectiveCamera(20, 1, 0.3, 150))
    cams.forEach((c) => { c.layers.set(0); c.layers.enable(LAKEBED_LAYER) })
    const bake = bakeTerrain()
    const marks = makeMarksTexture()
    const logo = logoFrame()
    const mat = new THREE.ShaderMaterial({
      vertexShader: sonarVertex, fragmentShader: sonarFragment, depthTest: false, depthWrite: false,
      uniforms: {
        uDepth0: { value: targets[0].depthTexture }, uDepth1: { value: targets[1].depthTexture },
        uDepthB0: { value: targetsB[0].depthTexture }, uDepthB1: { value: targetsB[1].depthTexture },
        uEcho0: { value: echoRTs[0].texture }, uEcho1: { value: echoRTs[1].texture }, uEchoTex: { value: new THREE.Vector2(1 / STRIP_W, 1 / ECHO_H) }, uFanR: { value: new THREE.Vector2(30, 30) },
        uColor0: { value: targets[0].texture }, uColor1: { value: targets[1].texture },
        uFanCount: { value: 0 }, uFan: { value: [new THREE.Vector4(), new THREE.Vector4()] },
        uNearFar: { value: new THREE.Vector2(0.3, 150) }, uRange: { value: 20 }, uReach: { value: 20 },
        uBox0: { value: new THREE.Vector4(-20, 0, 40, 30) }, uBox1: { value: new THREE.Vector4(-20, 0, 40, 30) }, uSplit: { value: 0 }, uApexU: { value: 0.5 },
        uTime: { value: 0 }, uFlat: { value: 0 }, uBedGain: { value: 1 }, uCapDepth: { value: new THREE.Vector3(5.5, 7.5, 1) }, uStreak: { value: 1 }, uDebug: { value: window.location.search.includes('sonardebug') ? 1 : 0 },
        uMarks: { value: marks.tex }, uMarkCount: { value: 0 }, uPulse: { value: 0.05 }, uBeamHalf: { value: 0.012 },
        uTerrain: { value: bake.tex }, uTerrainHalf: { value: bake.H },
        uFishTex: { value: null }, // the fish image (fishRT, made on first use)
        uApexXZ: { value: new THREE.Vector2() }, uApexDepth: { value: 0.9 },
        uLogoB: { value: logo.B }, uLogoU: { value: logo.U }, uLogoV: { value: logo.V },
        uLogoSdf: { value: makeLogoSdf() }, uLogoMap: { value: new THREE.Vector4(1 / logo.s, LOCKUP_SVG.cx, LOCKUP_SVG.bottom, LOGO_SDF_MAX) },
        uLogoSvg: { value: new THREE.Vector2(LOCKUP_SVG.w, LOCKUP_SVG.h) }, uLogoExt: { value: new THREE.Vector2(LOCKUP.width / 2 + 0.3, LOCKUP_SVG.bottom * logo.s + 0.3) },
        uLUT: { value: colormapTexture('accuphy_mid') }, uGain: { value: 0.40 }, uDynRange: { value: 0.85 }, uContrast: { value: 0.4 }, uNoise: { value: 0.3 }, uGamma: { value: 0.75 }, uTune: { value: new THREE.Vector4(1, 1, 1, 1) }, uTune2: { value: new THREE.Vector4(1, 1, 1, 1) }, uTune3: { value: new THREE.Vector4(1, 1, 1, 1) }, uTune4: { value: new THREE.Vector4(1, 1, 1, 1) }, uTune5: { value: new THREE.Vector4(1, 1, 1, 1) }, uTune6: { value: new THREE.Vector4(1, 1, 1, 1) }, // the app's orange map and gain scale, measured on its 2.0.0 recording (2026-10-23; before: garmin_amber, calibrated 2026-09-24 against the two confirmed frames, sonar-style.md §6.11)
        // the Mini's ice views (2026-10-16): flasher + Live Down (1) or flasher + 2D history (2); the app draws them in its jet map
        uIce: { value: 0 }, uIceSplit: { value: ICE_SPLIT }, uAspect: { value: 2.08 }, uTicks: { value: 5 }, uLUT2: { value: colormapTexture('jet') },
        uHist: { value: null }, uHistPrev: { value: null }, uHistPass: { value: 0 }, uHistFill: { value: 0 }, uIceAmber: { value: /icelut=amber/.test(window.location.search) ? 1 : 0 },
        uSignal: { value: 1 }, // the ice page's signal gate (IceCamp.jsx s.signal); 1 on the summer lake
        uFishMode: { value: 0 }, // fish from their bodies (#153; every page since #170)
        uPanoTilt: { value: PANO_TILT }, uPanoK: { value: new THREE.Vector4(0.75, 0.15, 1.3, 0.75) }, // Panoramic: the strip camera's tilt, and its tuning (#178: hard targets, the field's floor, their ceiling, the floor steep under the boat)
      },
    })
    // the 2D history (Ice Fishing View): 384 pings × 256 depth cells, ping-ponged — each ping shifts the record one
    // column left and draws the newest column at the right edge (sonarShader.js, uHistPass)
    const hist = [0, 1].map(() => new THREE.WebGLRenderTarget(384, 256, { depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }))
    const histGeo = new THREE.BufferGeometry()
    histGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]), 3))
    histGeo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2))
    histGeo.setAttribute('aW', new THREE.Float32BufferAttribute(new Float32Array([1, 1, 1, 1]), 1))
    histGeo.setIndex([0, 2, 1, 1, 2, 3])
    const histScene = new THREE.Scene()
    const histQuad = new THREE.Mesh(histGeo, mat); histQuad.frustumCulled = false; histScene.add(histQuad)
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
    if (import.meta.env.DEV) window.__sonar = { targets, targetsB, echoRTs, cams, mat, marks }
    // dev: window.__sonarHist(bins) — render the sonar picture flat into an offscreen target and
    // return the histogram of LUT index (nearest LUT entry per pixel) so the engine's brightness
    // distribution can be compared number-for-number with the app's reference frames
    if (import.meta.env.DEV) {
      const histRT = new THREE.WebGLRenderTarget(768, 384)
      // dev: window.__sonarFlat(w, h) — the sonar picture flat (no phone perspective) as a PNG data URL, for pixel
      // comparisons with app frames at the same scale (2026-10-23)
      window.__sonarFlat = (w = 2048, h = 1024) => {
        const rt = new THREE.WebGLRenderTarget(w, h)
        const pos = quad.geometry.attributes.position, aW = quad.geometry.attributes.aW
        const savedP = pos.array.slice(), savedW = aW.array.slice()
        const corners = [[-1, 1], [1, 1], [-1, -1], [1, -1]]
        corners.forEach(([x, y], i) => { pos.setXYZ(i, x, y, 0); aW.setX(i, 1) })
        pos.needsUpdate = true; aW.needsUpdate = true
        const gl = window.__sonarGL
        gl.setRenderTarget(rt); gl.render(overlay, ortho); gl.setRenderTarget(null)
        const px = new Uint8Array(w * h * 4); gl.readRenderTargetPixels(rt, 0, 0, w, h, px); rt.dispose()
        pos.array.set(savedP); aW.array.set(savedW); pos.needsUpdate = true; aW.needsUpdate = true
        const c = document.createElement('canvas'); c.width = w; c.height = h
        const ctx = c.getContext('2d'); const img = ctx.createImageData(w, h)
        for (let y = 0; y < h; y++) img.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4)
        for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255
        ctx.putImageData(img, 0, 0)
        return c.toDataURL('image/png')
      }
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
        const lut = mat.uniforms.uLUT.value.image.data // 256×4 RGBA, 0–255 (8-bit LUT since 2026-09-26)
        const hist = new Array(bins).fill(0); let black = 0, lit = 0
        for (let i = 0; i < px.length; i += 16) { // every 4th pixel
          const r = px[i], g = px[i + 1], b = px[i + 2]
          if (r + g + b < 24) { black++; continue }
          let best = 0, bd = 1e9
          for (let k = 0; k < 256; k++) { const dr = r - lut[k * 4], dg = g - lut[k * 4 + 1], db = b - lut[k * 4 + 2]; const d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; best = k } }
          hist[Math.min(bins - 1, Math.floor((best / 255) * bins))]++; lit++
        }
        return { black: black / (black + lit), lit, hist: hist.map((h) => +(h / lit).toFixed(3)) }
      }
      // dev: window.__sonarSnap(w, h) — the same flat render as a PNG data URL (for side-by-side files); a bigger
      // size samples the same picture box more finely (measurements in sonar-style §7.20)
      window.__sonarSnap = (W = 768, H = 384) => {
        const pos = quad.geometry.attributes.position, aW = quad.geometry.attributes.aW
        const savedP = pos.array.slice(), savedW = aW.array.slice()
        ;[[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([x, y], i) => { pos.setXYZ(i, x, y, 0); aW.setX(i, 1) })
        pos.needsUpdate = true; aW.needsUpdate = true
        const gl = window.__sonarGL
        const rt = W === 768 && H === 384 ? histRT : new THREE.WebGLRenderTarget(W, H)
        gl.setRenderTarget(rt); gl.render(overlay, ortho); gl.setRenderTarget(null)
        const px = new Uint8Array(W * H * 4); gl.readRenderTargetPixels(rt, 0, 0, W, H, px)
        if (rt !== histRT) rt.dispose()
        pos.array.set(savedP); aW.array.set(savedW); pos.needsUpdate = true; aW.needsUpdate = true
        const c = document.createElement('canvas'); c.width = W; c.height = H
        const ctx = c.getContext('2d'); const img = ctx.createImageData(W, H)
        for (let y = 0; y < H; y++) img.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4) // GL rows are bottom-up
        for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255
        ctx.putImageData(img, 0, 0)
        return c.toDataURL('image/png')
      }
    }
    return { targets, targetsB, echoRTs, fishRT: null, cams, mat, overlay, quad, ortho, bake, marks, hist, histScene, histCur: 0, lastPing: -1 }
  }, [])
  useEffect(() => { [SONAR_HIDE_LAYER, LAKEBED_LAYER, FISH_LAYER, LOGO_LAYER].forEach((l) => camera.layers.enable(l)) }, [camera])
  useEffect(() => () => { res.targets.forEach((t) => t.dispose()); res.targetsB.forEach((t) => t.dispose()); res.echoRTs.forEach((t) => t.dispose()); res.fishRT?.dispose(); res.mat.dispose(); res.hist.forEach((t) => t.dispose()) }, [res])

  const tmpUp = useMemo(() => new THREE.Vector3(), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const inset = useMemo(() => ({ cam: new THREE.PerspectiveCamera(38, 1.6, 0.5, 400), dir: new THREE.Vector3(), look: new THREE.Vector3(), clear: new THREE.Color() }), [])
  useFrame((root, dt) => {
    const s = state.current
    const specs = s.specs.slice(0, MAX_FANS)
    const u = res.mat.uniforms
    // ice: while the visitor hole-hops the Mini is out of the water. The app stays on — the fans keep their shape and
    // the dial its ring — but nothing echoes (sonarShader.js uSignal); the depth strips are not even rendered then
    const sig = s.signal ?? 1, wet = sig >= 0.02
    u.uSignal.value = sig
    u.uTime.value += dt
    u.uRange.value = s.rangeM
    if (s.colormap !== u.uLUT.name) { u.uLUT.value.dispose?.(); u.uLUT.value = colormapTexture(s.colormap); u.uLUT.name = s.colormap }
    u.uGain.value = s.gain ?? 0.40
    u.uContrast.value = s.contrast ?? 0.4
    u.uNoise.value = s.noise ?? 0.3
    if (import.meta.env.DEV && window.__sonarTune) { const t = window.__sonarTune; if (t.gamma != null) u.uGamma.value = t.gamma; if (t.dyn != null) u.uDynRange.value = t.dyn; if (t.k) u.uTune.value.fromArray(t.k); if (t.k2) u.uTune2.value.fromArray(t.k2); if (t.k3) u.uTune3.value.fromArray(t.k3); if (t.k4) u.uTune4.value.fromArray(t.k4); if (t.k5) u.uTune5.value.fromArray(t.k5); if (t.k6) u.uTune6.value.fromArray(t.k6); if (t.kp) u.uPanoK.value.fromArray(t.kp); if (t.kb) lakeMats.forEach((m) => m.userData.uniforms.uSplatBig?.value.fromArray(t.kb)) } // dev: tone-curve knobs for like-for-like fits (2026-10-23)
    u.uFanCount.value = specs.length
    const flat = specs[0] && specs[0].frame.n.y !== 0 // panoramic: thickness normal is vertical
    u.uFlat.value = flat ? 1 : 0
    // screen box(es) in metres — the app fills the screen and scales each axis on its own
    let lay
    {
      const el0 = rect.current.el
      const aspect = s.presentationAspect ?? (el0 && el0.offsetHeight > 0 ? el0.offsetWidth / el0.offsetHeight : 2)
      lay = screenLayout(s.deviceId, s.mode, s.rangeM, aspect, s.specs.slice(0, MAX_FANS), s.depthM)
      // the ice views: which panels, the display aspect for the dial, one tick per ruler step round the ring
      u.uIce.value = lay.ice || 0; u.uIceSplit.value = lay.iceSplit ?? ICE_SPLIT; u.uAspect.value = aspect
      if (lay.ice) { const unit = s.imperial ? FT : 1, span = s.rangeM / unit; u.uTicks.value = span / niceStep(span) }
      u.uBox0.value.set(lay.box0.x0, lay.box0.y0, lay.box0.w, lay.box0.h)
      const b1 = lay.box1 ?? lay.box0
      u.uBox1.value.set(b1.x0, b1.y0, b1.w, b1.h)
      u.uSplit.value = lay.split ? 1 : 0
      u.uApexU.value = lay.apexU
      u.uStreak.value = lay.mottle ? 0 : 1
      u.uReach.value = lay.reach ?? s.rangeM
      if (flat) u.uReach.value = PANO_REACH * s.rangeM // the data runs out to the screen corners
      u.uBedGain.value = s.deviceId === 'PLM' ? 0.95 : 1 // PLM near-range gain (sonarShader.js); 0.62 → 0.95 (2026-10-24): the thin band no longer burns white in shallow water, and 0.62 left the Mini's bottoms faint and thin
      if (s.deviceId === 'PLM') u.uCapDepth.value.set(7.5, 9.5, 0.8); else u.uCapDepth.value.set(5.5, 7.5, 1) // the bottom's soft cap by depth (#91, #92, sonarShader.js)
      s.layout = lay // for the DOM chrome (rulers)
    }

    // fish from their 3D bodies (#153 round 3; every page since #170, index.jsx fishMode; ?fish=marks keeps the old marks in
    // the vertical views). Panoramic is a sound picture (#171, the only one since #178): the vertical views' pipeline with
    // the fan laid flat — what the beam's thickness hits per bearing and range, arcGrain, the #153 fish; shadows and
    // coverage follow from the rays
    const fishEcho = s.fishMode === 'echo' || flat
    // its target is made on first use: the fish bodies drawn from the apex into (angle × range), MAX-blended, 4× MSAA like
    // the structure splat. ONE target for both fans (fan k in rows k/2 … (k+1)/2): the picture shader already uses 16
    // textures, the most an iPhone allows
    if (fishEcho && !res.fishRT) res.fishRT = new THREE.WebGLRenderTarget(STRIP_W, 2 * FISH_H, { depthBuffer: false, samples: 4, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter })
    u.uFishMode.value = fishEcho ? 1 : 0
    u.uFishTex.value = fishEcho ? res.fishRT.texture : null
    // 1) sonar passes (materials flag the pass so alpha = structure tag)
    lakeMats.forEach((m) => { m.userData.uniforms.uSonarPass.value = 1 })
    specs.forEach((sp, k) => {
      const cam = res.cams[k]
      const half = (sp.a1 - sp.a0) / 2
      const thickHalf = flat ? PANO_HALF : Math.abs(sp.s1 - sp.s0) === 2 ? sp.theta : sp.theta / 2
      const tanH = Math.tan(half), tanV = Math.tan(thickHalf)
      cam.fov = THREE.MathUtils.radToDeg(thickHalf) * 2
      cam.aspect = tanH / tanV
      cam.updateProjectionMatrix()
      cam.position.copy(s.apex)
      const c = sp.frame.c
      cam.layers.set(0); cam.layers.enable(LAKEBED_LAYER)
      if (flat) {
        // the flat fan: look along its heading, PANO_TILT down; world up keeps NDC +x = starboard = the screen's right
        cam.up.set(0, 1, 0)
        const hl = Math.hypot(c.x, c.z) || 1, ct = Math.cos(PANO_TILT), st = Math.sin(PANO_TILT)
        cam.lookAt(s.apex.x + (c.x / hl) * ct, s.apex.y - st, s.apex.z + (c.z / hl) * ct)
        cam.layers.enable(LOGO_LAYER) // the lakebed lockup is seen as structure here (the side views draw it analytically)
      } else {
        tmpUp.copy(sp.frame.n).negate() // so NDC +x = +wide angle (see docs)
        cam.up.copy(tmpUp)
        cam.lookAt(s.apex.x + c.x, s.apex.y + c.y, s.apex.z + c.z)
      }
      const R = flat ? PANO_REACH * s.rangeM : sp.R
      if (wet) {
        gl.setRenderTarget(res.targets[k]); gl.clear(); gl.render(scene, cam)
        // the far-face strip: back faces, structure only (the first frame compiles the flipped programs once)
        lakeMats.forEach((m) => { m.userData.side0 ??= m.side; m.side = THREE.BackSide; m.userData.uniforms.uSonarPass.value = 2 })
        gl.setRenderTarget(res.targetsB[k]); gl.clear(); gl.render(scene, cam)
        lakeMats.forEach((m) => { m.side = m.userData.side0; m.userData.uniforms.uSonarPass.value = 1 })
        // the echo splat: both faces, additive, no depth test, clear to black (restore the clear colour after)
        const cc = gl.getClearColor(tmpColor), ca = gl.getClearAlpha()
        lakeMats.forEach((m) => { const mu = m.userData.uniforms; if (!mu.uSplat) return; mu.uSplat.value.set(tanH, tanV, R); mu.uSonarPass.value = 3; m.userData.blend0 ??= [m.blending, m.transparent, m.depthTest, m.depthWrite]; m.blending = THREE.CustomBlending; m.blendSrc = m.blendSrcAlpha = THREE.OneFactor; m.blendDst = m.blendDstAlpha = THREE.OneFactor; m.blendEquation = m.blendEquationAlpha = THREE.AddEquation; m.transparent = true; m.depthTest = false; m.depthWrite = false; m.side = THREE.DoubleSide })
        const bg = scene.background; scene.background = null // the scene's background colour would fill the echo target (it is additive: it must start black)
        gl.setRenderTarget(res.echoRTs[k]); gl.setClearColor(0x000000, 0); gl.clear(); gl.render(scene, cam) // plain sums in all four channels (rgb echo and material shares, a the large-scale factor), cleared to zero
        scene.background = bg; gl.setClearColor(cc, ca)
        lakeMats.forEach((m) => { const mu = m.userData.uniforms; if (!mu.uSplat) return; const b = m.userData.blend0; m.blending = b[0]; m.transparent = b[1]; m.depthTest = b[2]; m.depthWrite = b[3]; m.side = m.userData.side0; mu.uSonarPass.value = 1 })
        // the fish-echo test page (#153): the fish bodies as the transducer sees them (lakeMaterial pass 4), MAX-blended
        if (fishEcho) {
          const fm = lakeMats.find((m) => m.defines && m.defines.FISH), mu = fm.userData.uniforms
          const b0 = [fm.blending, fm.transparent, fm.depthTest, fm.depthWrite, fm.blendEquation, fm.blendSrc, fm.blendDst, fm.blendEquationAlpha, fm.blendSrcAlpha, fm.blendDstAlpha]
          fm.blending = THREE.CustomBlending; fm.blendEquation = fm.blendEquationAlpha = THREE.MaxEquation; fm.blendSrc = fm.blendDst = fm.blendSrcAlpha = fm.blendDstAlpha = THREE.OneFactor
          fm.transparent = true; fm.depthTest = false; fm.depthWrite = false
          mu.uSplat.value.set(tanH, tanV, R); mu.uSonarPass.value = 4; mu.uFishEchoSize.value = s.fishSize || 1
          mu.uPanoLobe.value.set(flat ? 1 : 0, PANO_TILT)
          const mask = cam.layers.mask; cam.layers.set(FISH_LAYER)
          const bgF = scene.background; scene.background = null
          const fr = res.fishRT; fr.viewport.set(0, k * FISH_H, STRIP_W, FISH_H); fr.scissor.copy(fr.viewport); fr.scissorTest = true // this fan's half
          gl.setRenderTarget(fr); gl.setClearColor(0x000000, 0); gl.clear(); gl.render(scene, cam)
          fr.scissorTest = false
          scene.background = bgF; gl.setClearColor(cc, ca); cam.layers.mask = mask
          ;[fm.blending, fm.transparent, fm.depthTest, fm.depthWrite, fm.blendEquation, fm.blendSrc, fm.blendDst, fm.blendEquationAlpha, fm.blendSrcAlpha, fm.blendDstAlpha] = b0
          mu.uSonarPass.value = 1
        }
        u.uFanR.value.setComponent(k, R)
      }
      // screen-plane centre angle: the tilt of the fan centre from straight-down
      u.uFan.value[k].set(flat ? 0 : Math.atan2(c.x, -c.y), half, tanH, tanV) // Panoramic: the fan's centre is straight up the screen
    })
    u.uPulse.value = 0.05; u.uBeamHalf.value = 0.014
    if (flat) { u.uPulse.value = 0.07; u.uBeamHalf.value = 0.03 } // the flat fan's beams are wider (app: 0.4–1 m streaks along the arc at 5–10 m, §7.13) // app: far fish are 0.3–0.5 m needles along the arc at 11–17 m (sonar-style §6.8)
    gl.setRenderTarget(null)
    lakeMats.forEach((m) => { m.userData.uniforms.uSonarPass.value = 0 })
    u.uApexXZ.value.set(s.apex.x, s.apex.z); u.uApexDepth.value = -s.apex.y
    // fish marks: every fish in the beam, projected into the view (sonarMarks.js). With the fish drawn from their bodies
    // (fishEcho, #170) only the ice page's jig is a mark — #170 had dropped it from the ice sonar and the dial
    u.uMarkCount.value = computeMarks({ jig: s.jig, pop: fishEcho ? [] : s.pop, t: root.clock.elapsedTime, specs: sig < 0.6 ? [] : specs, apex: s.apex, flat, rangeM: flat ? s.rangeM : u.uReach.value }, res.marks)
    // the 2D history: one new column per ping (8 a second), after the depth strips and the marks are current
    if (lay.ice === 2) {
      const now = root.clock.elapsedTime
      const fill = !res.histFilled && sig > 0.95 // first open with a live signal: write the whole record at once
      if (fill || now - res.lastPing >= 0.125) {
        res.lastPing = now
        const cur = res.histCur, prev = 1 - cur
        u.uHistPass.value = 1; u.uHistFill.value = fill ? 1 : 0; u.uHistPrev.value = res.hist[prev].texture
        gl.setRenderTarget(res.hist[cur]); gl.render(res.histScene, res.ortho); gl.setRenderTarget(null)
        u.uHistPass.value = 0; u.uHistFill.value = 0; u.uHist.value = res.hist[cur].texture
        if (fill) res.histFilled = true
        res.histCur = prev
      }
    }
    // the app's depth readout: water depth under the transducer, in the user's unit
    if (s.depthEl) {
      const d = depthAt(s.apex.x, s.apex.z)
      const txt = sig < 0.5 ? (s.imperial ? '-- ft' : '-- m') : s.imperial ? `${(d / 0.3048).toFixed(1)} ft` : `${d.toFixed(1)} m` // no signal: no depth
      if (s.depthEl.textContent !== txt) s.depthEl.textContent = txt
    }
    if (s.debugEl) s.debugEl.textContent = `sonar fans ${specs.length} flat ${flat ? 1 : 0} fan0 ${u.uFan.value[0].toArray().map((v) => v.toFixed(2)).join(',')} apex ${s.apex.toArray().map((v) => v.toFixed(1)).join(',')}`

    // 2) main view. A sideways phone with the sonar full-screen (#140): the lake is only the small inset drawn in 4), so
    // the full-screen lake is not rendered at all — the screen is cleared to black (the safe-area margins stay black)
    const lakeEl = rect.current.lake, lakeInset = !!lakeEl && lakeEl.offsetWidth > 8
    gl.autoClear = true
    if (lakeInset) {
      gl.getClearColor(inset.clear); const a = gl.getClearAlpha()
      gl.setClearColor(0x000000, 1); gl.clear(); gl.setClearColor(inset.clear, a)
    } else gl.render(scene, camera)

    // 3) sonar screen overlay in the bottom-right corner
    // the screen area is a DOM element inside the CSS-3D-transformed phone. Take its
    // LAYOUT rect (offset*, unaffected by transforms) relative to the phone's centre,
    // apply the same rotateX → rotateY → perspective maths as the CSS, and place the
    // quad corners in clip space with per-vertex w for perspective-correct sampling.
    const cr = gl.domElement.getBoundingClientRect()
    drawOverlay(cr)
    // 4) the sideways phone's lake inset: the lake from closer in, round the boat, into the inset's rectangle (#140)
    if (lakeInset) {
      const lr = lakeEl.getBoundingClientRect(), x = lr.left - cr.left, y = cr.bottom - lr.bottom
      const c = inset.cam
      camera.getWorldDirection(inset.dir) // the main view's direction, so the inset is the same lake seen closer
      inset.look.set(s.boat.x + 5, -4, s.boat.z)
      c.position.copy(inset.look).addScaledVector(inset.dir, -30); c.lookAt(inset.look)
      c.aspect = lr.width / lr.height; c.far = camera.far; c.layers.mask = camera.layers.mask; c.updateProjectionMatrix()
      gl.setViewport(x, y, lr.width, lr.height); gl.setScissor(x, y, lr.width, lr.height); gl.setScissorTest(true)
      gl.autoClear = true
      gl.render(scene, c)
      gl.setScissorTest(false); gl.setViewport(0, 0, size.width, size.height)
    }
  }, 1)
  function drawOverlay(cr) {
    const s = state.current
    const el = rect.current.el, frame = rect.current.frame
    if (!el || !frame) return
    const fr = frame.getBoundingClientRect()
    if (fr.width < 8) return
    const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2
    const { perspective: P, rotY, rotX } = s.land || s.flatDevice ? PHONE_POSE_FLAT : phonePose()
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
  }
  return null
}
