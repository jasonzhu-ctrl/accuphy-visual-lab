// The shore round the lake, on both pages (shoreModels.js has the why). Hidden from the sonar (SONAR_HIDE_LAYER): the sonar sees
// only the rising lakebed (terrain.js). In the ice page's section view it is cut at the wall like the lake (uClip there;
// a clipping plane here).
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SONAR_HIDE_LAYER } from './SonarScreen'
import { SECTION_CAM } from './iceScene'
import { bedY } from './terrain'
import { t } from './i18n'
import { placeTrees, makeGround, makeShoreIce, makeConifer, makeNeedleTexture, makeTuft, placeTufts, ROCK_GEOS, placeShoreRocks, makeGroundMaterial, makeShoreIceMaterial, makeTreeMaterial, makeRockMaterial, makeTuftMaterial, landY } from './shoreModels'

const VARIANTS = 4
const phoneLike = () => typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 600
// tree density: phones 60 % of a desktop's (#50: fewer trees, each as fine). ?trees=0.3 … 1 sets it on any build, so the
// same test link can be compared on a real phone at two densities (HQ 11-02, before go-live)
const treeDensity = () => { const m = /[?&]trees=([\d.]+)/.exec(typeof window !== 'undefined' ? window.location.search : ''); return m ? Math.min(1, Math.max(0.1, +m[1])) : phoneLike() ? 0.6 : 1 }

function Instances({ geo, mat, items, place, clip }) {
  const ref = useRef()
  useEffect(() => {
    const mesh = ref.current; if (!mesh) return
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3()
    items.forEach((it, i) => { place(it, p, e, s); q.setFromEuler(e); m.compose(p, q, s); mesh.setMatrixAt(i, m) })
    mesh.count = items.length; mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items, place])
  if (!items.length) return null
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
}

export default function Shore({ state, winter = false }) {
  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e5)], [])
  const built = useMemo(() => {
    const trees = placeTrees(treeDensity())
    const tex = makeNeedleTexture()
    const mats = { ground: makeGroundMaterial(winter), tree: makeTreeMaterial(tex, winter), rock: makeRockMaterial(winter), grass: makeTuftMaterial('grass', winter), reed: makeTuftMaterial('reed', winter), ice: winter ? makeShoreIceMaterial() : null }
    for (const k in mats) if (mats[k]) mats[k].clippingPlanes = clip
    const tufts = placeTufts()
    return {
      trees, mats,
      ground: makeGround(trees, winter),
      shoreIce: winter ? makeShoreIce() : null,
      conifers: Array.from({ length: VARIANTS * 2 }, (_, k) => makeConifer(k % VARIANTS, k >= VARIANTS)),
      rocks: ROCK_GEOS(), rockItems: placeShoreRocks(),
      grass: makeTuft('grass'), reed: makeTuft('reed'), tufts: winter ? { grass: [], reed: tufts.reed.filter((_, i) => i % 3 === 0) } : tufts,
    }
  }, [winter, clip])
  useEffect(() => () => { for (const k in built.mats) built.mats[k]?.dispose(); built.ground.dispose(); built.shoreIce?.dispose(); built.conifers.forEach((g) => g.dispose()) }, [built])
  // the section view's wall (the lake's own cut, Scene.jsx SectionCut): keep what lies behind it
  useFrame(() => { const s = state.current; clip[0].constant = s.ice && s.view === 'section' ? s.boat.z + SECTION_CAM.cutZ : 1e5 })

  const byVariant = useMemo(() => Array.from({ length: VARIANTS * 2 }, (_, k) => built.trees.filter((t) => Math.floor(t.k * VARIANTS) === k % VARIANTS && (t.d >= 24) === (k >= VARIANTS))), [built])
  const placeTree = useMemo(() => (it, p, e, s) => { p.set(it.x, landY(it.d, it.t, winter) - 0.06 * it.h, it.z); e.set(it.lean[0], it.rot, it.lean[1]); s.set(it.h * it.w, it.h, it.h * it.w * 0.95) }, [winter])
  const placeRock = useMemo(() => (it, p, e, s) => { const y = it.d < 0 ? bedY(it.x, it.z) : landY(it.d, it.t, winter); p.set(it.x, y - it.s * (winter ? 0.32 : 0.18), it.z); e.set(it.tilt, it.rot, it.tilt * 0.6); s.set(it.s * 1.1, it.s * 0.62, it.s) }, [winter])
  const placeTuft = useMemo(() => (it, p, e, s) => { const y = it.d < 0 ? bedY(it.x, it.z) : landY(it.d, it.t, winter); p.set(it.x, y - 0.02, it.z); e.set(0, it.rot, 0); s.set(it.s, it.s * (winter ? 0.6 : 1), it.s) }, [winter])
  const rocksBy = useMemo(() => built.rocks.map((_, k) => built.rockItems.filter((r) => r.k === k)), [built])
  return (
    <group>
      <mesh geometry={built.ground} material={built.mats.ground} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
      {built.shoreIce && <mesh geometry={built.shoreIce} material={built.mats.ice} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />}
      {built.conifers.map((g, k) => <Instances key={'t' + k} geo={g} mat={built.mats.tree} items={byVariant[k]} place={placeTree} />)}
      {built.rocks.map((g, k) => <Instances key={'r' + k} geo={g} mat={built.mats.rock} items={rocksBy[k]} place={placeRock} />)}
      <Instances geo={built.grass} mat={built.mats.grass} items={built.tufts.grass} place={placeTuft} />
      <Instances geo={built.reed} mat={built.mats.reed} items={built.tufts.reed} place={placeTuft} />
    </group>
  )
}

// The edge cue (handover §6): when the boat is dragged into the shore (once per drag) or a tap lands past it (ice), one line
// in the Lab's dark glass over the stop, kept 16 px inside the screen; on the ice, also a faint dashed ring where the finger
// was and a dotted line to the stop. In 0.2 s, 2.5 s up, out 0.4 s.
const CUE_IN = 200, CUE_HOLD = 2500, CUE_OUT = 400
export function ShoreCue({ state }) {
  const { camera, gl } = useThree()
  const el = useMemo(() => {
    const d = document.createElement('div')
    d.className = 'ac-shore-cue'; d.setAttribute('role', 'status'); d.textContent = t('shore_edge')
    d.style.cssText = "position:fixed;left:0;top:0;z-index:55;pointer-events:none;opacity:0;padding:6px 12px;border-radius:999px;background:rgba(14,28,36,0.86);border:1px solid rgba(255,255,255,0.16);box-shadow:0 8px 20px rgba(2,20,30,0.35);color:#fff;font:600 12.5px/1.2 'Instrument Sans',system-ui,sans-serif;letter-spacing:0.01em;white-space:nowrap;will-change:transform,opacity"
    return d
  }, [])
  useEffect(() => { document.body.appendChild(el); return () => el.remove() }, [el])
  const ghost = useMemo(() => {
    const g = new THREE.Group()
    const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false, depthTest: false, side: THREE.DoubleSide }) // seen on the bank too
    const ring = new THREE.Group()
    for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; ring.add(new THREE.Mesh(new THREE.RingGeometry(1.07, 1.13, 4, 1, a, (Math.PI * 2) / 36).rotateX(-Math.PI / 2), mat)) } // 5 / 5 dashes
    const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.05, 8).rotateX(-Math.PI / 2), mat, 80)
    g.add(ring, dots); g.userData = { ring, dots, mat }; g.visible = false; g.renderOrder = 4
    return g
  }, [])
  const v = useMemo(() => new THREE.Vector3(), [])
  const m4 = useMemo(() => new THREE.Matrix4(), [])
  useFrame(() => {
    const s = state.current, c = s.shoreCue
    const age = c ? performance.now() - c.t0 : 1e9
    if (age > CUE_IN + CUE_HOLD + CUE_OUT) { if (c) s.shoreCue = null; el.style.opacity = '0'; ghost.visible = false; return }
    const a = age < CUE_IN ? age / CUE_IN : age < CUE_IN + CUE_HOLD ? 1 : 1 - (age - CUE_IN - CUE_HOLD) / CUE_OUT
    // the line over the stop
    v.set(c.x, s.ice ? 0.03 : 0.6, c.z).project(camera)
    const r = gl.domElement.getBoundingClientRect()
    let x = r.left + ((v.x + 1) / 2) * r.width, y = r.top + ((1 - v.y) / 2) * r.height - 26
    const w = el.offsetWidth, h = el.offsetHeight
    x = Math.min(window.innerWidth - 16 - w / 2, Math.max(16 + w / 2, x)); y = Math.min(window.innerHeight - 16, Math.max(16 + h, y))
    el.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - h).toFixed(1)}px)`
    el.style.opacity = String(Math.max(0, a))
    // the ghost ring and the dotted line (ice)
    ghost.visible = !!c.ring
    if (c.ring) {
      const { ring, dots, mat } = ghost.userData
      const yy = s.view === 'under' ? -0.52 : 0.03
      ring.position.set(c.gx, yy, c.gz); mat.opacity = 0.35 * a
      const L = Math.hypot(c.gx - c.x, c.gz - c.z), n = Math.min(80, Math.max(0, Math.floor((L - 2.4) / 0.45)))
      for (let i = 0; i < n; i++) { const f = (1.25 + 0.45 * (i + 0.5)) / L; m4.makeTranslation(c.x + (c.gx - c.x) * f, yy, c.z + (c.gz - c.z) * f); dots.setMatrixAt(i, m4) }
      dots.count = n; dots.instanceMatrix.needsUpdate = true
    }
  })
  return <primitive object={ghost} onUpdate={(o) => o.traverse((q) => q.layers.set(SONAR_HIDE_LAYER))} />
}
