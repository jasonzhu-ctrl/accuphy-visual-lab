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
// The tree budget (Jason 2026-11-02, #210: "OK, auto-adjust"; reworked the same day with 界面设计 and HQ: the loading cover
// must not wait for it — ad visitors leave on the cover). The cover lifts as before on a conservative share of the trees
// (phones 35 %, larger screens 60 %); then the page measures its own frame rate and fills the forest in up to all of them, or
// thins it — never a lesser tree, nor any less shore, snow or sonar (#50, #205). Tiers: all, 60 %, 35 %, 20 %. Changes
// happen in the far rows first (a tree's rank mixes chance with its distance back from the water), each tree growing in or
// shrinking away over 0.6 s. 45 fps: below it a drag visibly stutters on a 60 Hz screen, and it leaves room for a phone
// that warms up; a step up needs ≥ 55 fps and is undone at once if the next measure falls under 45. Later, if the page falls
// under 30 fps for 6 s (heat), one more tier goes, once. ?trees=0.1 … 1 fixes the density on any build (testing).
const TIERS = [1, 0.6, 0.35, 0.2], FPS_OK = 45, FPS_UP = 55, FPS_HOT = 30, FADE_MS = 600
const startTier = () => (typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 600 ? 2 : 1)
// the order trees come and go in: mostly chance, partly how far back from the water (the far rows change first)
const order = (t) => 0.55 * t.rank + 0.45 * Math.min(1, Math.max(0, (t.d - 7) / 40))
const fixedDensity = () => { const m = /[?&]trees=([\d.]+)/.exec(typeof window !== 'undefined' ? window.location.search : ''); return m ? Math.min(1, Math.max(0.1, +m[1])) : null }
// dev: ?slowms=N adds N ms of work to every frame (a slow phone in the self-check; headless Chrome never slows its frame
// loop for a slow GPU), ?slowafter=S only from S seconds on (a phone warming up)
const SLOW = import.meta.env.DEV ? (() => { const q = typeof window !== 'undefined' ? window.location.search : ''; return { ms: +((/[?&]slowms=(\d+)/.exec(q) || [])[1] || 0), after: +((/[?&]slowafter=(\d+)/.exec(q) || [])[1] || 0) } })() : { ms: 0, after: 0 }
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] || 0 }

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

// the conifers by variant, each list sorted by order: a density shows a prefix of every list (mesh.count); trees coming or
// going grow in or shrink away over FADE_MS
function Trees({ geos, mat, groups, place, budget }) {
  const refs = useRef([])
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3() }), [])
  const upto = (items, d) => { let lo = 0, hi = items.length; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].o < d) lo = m + 1; else hi = m } return lo }
  const setAt = (mesh, it, i, k) => { place(it, tmp.p, tmp.e, tmp.s); tmp.s.multiplyScalar(Math.max(1e-3, k)); tmp.q.setFromEuler(tmp.e); tmp.m.compose(tmp.p, tmp.q, tmp.s); mesh.setMatrixAt(i, tmp.m) }
  useEffect(() => {
    groups.forEach((items, k) => { const mesh = refs.current[k]; if (!mesh) return; items.forEach((it, i) => setAt(mesh, it, i, 1)); mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); mesh.count = upto(items, budget.current.d) })
  }, [groups, place]) // eslint-disable-line react-hooks/exhaustive-deps
  const shown = useRef(-1)
  useFrame(() => {
    const b = budget.current
    if (b.from != null) {
      const f = Math.min(1, (performance.now() - b.t0) / FADE_MS), e = f * f * (3 - 2 * f), up = b.d > b.from, k = up ? e : 1 - e
      groups.forEach((items, g) => { const mesh = refs.current[g]; if (!mesh) return; const a = upto(items, Math.min(b.d, b.from)), z = upto(items, Math.max(b.d, b.from)); for (let i = a; i < z; i++) setAt(mesh, items[i], i, f < 1 ? k : 1); mesh.count = f < 1 ? z : upto(items, b.d); mesh.instanceMatrix.needsUpdate = true })
      if (f >= 1) { b.from = null; shown.current = b.d }
      return
    }
    if (shown.current === b.d) return
    shown.current = b.d
    groups.forEach((items, g) => { const mesh = refs.current[g]; if (mesh) mesh.count = upto(items, b.d) })
  })
  return geos.map((geo, k) => groups[k].length ? <instancedMesh key={k} ref={(el) => { refs.current[k] = el }} args={[geo, mat, groups[k].length]} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} /> : null)
}

export default function Shore({ state, winter = false }) {
  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e5)], [])
  const built = useMemo(() => {
    const trees = placeTrees(1).map((t) => ({ ...t, o: order(t) })) // all of them; the budget shows those with order < density
    const d0 = fixedDensity() ?? TIERS[startTier()]
    const tex = makeNeedleTexture()
    const mats = { ground: makeGroundMaterial(winter), tree: makeTreeMaterial(tex, winter), rock: makeRockMaterial(winter), grass: makeTuftMaterial('grass', winter), reed: makeTuftMaterial('reed', winter), ice: winter ? makeShoreIceMaterial() : null }
    for (const k in mats) if (mats[k]) mats[k].clippingPlanes = clip
    const tufts = placeTufts()
    return {
      trees, mats,
      d0, ground: makeGround(trees.filter((t) => t.o < d0), winter),
      shoreIce: winter ? makeShoreIce() : null,
      conifers: Array.from({ length: VARIANTS * 2 }, (_, k) => makeConifer(k % VARIANTS, k >= VARIANTS)),
      rocks: ROCK_GEOS(), rockItems: placeShoreRocks(),
      grass: makeTuft('grass'), reed: makeTuft('reed'), tufts: winter ? { grass: [], reed: tufts.reed.filter((_, i) => i % 3 === 0) } : tufts,
    }
  }, [winter, clip])
  useEffect(() => () => { for (const k in built.mats) built.mats[k]?.dispose(); built.ground.dispose(); built.shoreIce?.dispose(); built.conifers.forEach((g) => g.dispose()) }, [built])
  // the section view's wall (the lake's own cut, Scene.jsx SectionCut): keep what lies behind it
  useFrame(() => { const s = state.current; clip[0].constant = s.ice && s.view === 'section' ? s.boat.z + SECTION_CAM.cutZ : 1e5 })

  const byVariant = useMemo(() => Array.from({ length: VARIANTS * 2 }, (_, k) => built.trees.filter((t) => Math.floor(t.k * VARIANTS) === k % VARIANTS && (t.d >= 24) === (k >= VARIANTS)).sort((a, b) => a.o - b.o)), [built])
  // the budget: { d: shown density, from: density being faded out (or null), t0 } — measured here, drawn by <Trees>
  const budget = useRef({ d: built.d0, from: null, t0: 0 })
  const probe = useRef({ phase: fixedDensity() != null ? 'fixed' : 'warm', t: 0, n: 0, dts: [], tier: startTier(), steps: 0, up: false, hot: [], dropped: 0, shade: null })
  useEffect(() => { const s = state.current; s.treesSettled = probe.current.phase === 'fixed'; s.treeDensity = built.d0; return () => { s.treesSettled = undefined } }, [state, built])
  const setTier = (tier) => {
    const P = probe.current, b = budget.current, d = TIERS[tier]
    P.tier = tier; state.current.treeDensity = d
    b.from = b.d; b.t0 = performance.now(); b.d = d // grown in or shrunk away over FADE_MS (<Trees>)
    P.shade = { i: 0, trees: built.trees.filter((t) => t.o < d) } // the contact shade follows, recoloured over a few frames
  }
  const tMount = useRef(performance.now())
  useFrame((_, dt) => {
    const P = probe.current, s = state.current
    if (SLOW.ms && performance.now() - tMount.current > SLOW.after * 1000) { const e = performance.now() + SLOW.ms; while (performance.now() < e) { /* dev: a slow device */ } }
    if (P.shade) { const i0 = P.shade.i, i1 = Math.min(1400, i0 + 70); makeGround(P.shade.trees, winter, undefined, 1400, built.ground, i0, i1); P.shade.i = i1 + 1; if (P.shade.i > 1400) P.shade = null }
    if (P.phase === 'fixed' || dt > 1 || dt <= 0) return // a hidden tab says nothing about this device's speed (a very slow one still counts)
    P.t += dt; P.n++
    if (P.phase === 'warm') { if (P.n > 6 && P.t > 0.4) { P.phase = 'probe'; P.t = 0; P.dts = [] } return } // shaders compiled, first frames past
    if (P.phase === 'probe') { // after the cover: 1.2 s, then 0.8 s after each step (a step's fade is left out of the measure)
      if (budget.current.from != null) { P.t = 0; return }
      P.dts.push(dt)
      if (P.t < (P.steps ? 0.8 : 1.2)) return
      const fps = 1 / median(P.dts), done = () => { P.phase = 'watch'; P.t = 0; P.dts = []; s.treesSettled = true }
      s.treeFps = Math.round(fps) // dev: what it measured
      P.t = 0; P.dts = []; P.steps++
      if (P.up && fps < FPS_OK) { setTier(P.tier + 1); done(); return } // the step up was one too many: back, and stay
      if (fps >= FPS_UP && P.tier > 0 && !(P.steps > 1 && !P.up)) { P.up = true; setTier(P.tier - 1); return } // room to spare: more trees
      if (fps >= FPS_OK) { done(); return }
      // too slow: 35 % (20 % under 15 fps) — where measuring from all the trees ended too (af9c80f); never more than now
      const to = fps < 15 ? 3 : 2
      if (to > P.tier) setTier(to)
      done()
      return
    }
    // watching: a phone that warms up and slows down loses one more tier, gently
    P.hot.push(dt); P.hotT = (P.hotT || 0) + dt
    if (P.hotT < 6) return // judged every 6 s
    const fpsNow = 1 / median(P.hot); P.hot = []; P.hotT = 0
    if (P.dropped < 1 && P.tier < TIERS.length - 1 && fpsNow < FPS_HOT) { P.dropped++; setTier(P.tier + 1); s.treeFps = Math.round(fpsNow) }
  })
  const placeTree = useMemo(() => (it, p, e, s) => { p.set(it.x, landY(it.d, it.t, winter) - 0.06 * it.h, it.z); e.set(it.lean[0], it.rot, it.lean[1]); s.set(it.h * it.w, it.h, it.h * it.w * 0.95) }, [winter])
  const placeRock = useMemo(() => (it, p, e, s) => { const y = it.d < 0 ? bedY(it.x, it.z) : landY(it.d, it.t, winter); p.set(it.x, y - it.s * (winter ? 0.32 : 0.18), it.z); e.set(it.tilt, it.rot, it.tilt * 0.6); s.set(it.s * 1.1, it.s * 0.62, it.s) }, [winter])
  const placeTuft = useMemo(() => (it, p, e, s) => { const y = it.d < 0 ? bedY(it.x, it.z) : landY(it.d, it.t, winter); p.set(it.x, y - 0.02, it.z); e.set(0, it.rot, 0); s.set(it.s, it.s * (winter ? 0.6 : 1), it.s) }, [winter])
  const rocksBy = useMemo(() => built.rocks.map((_, k) => built.rockItems.filter((r) => r.k === k)), [built])
  return (
    <group>
      <mesh geometry={built.ground} material={built.mats.ground} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />
      {built.shoreIce && <mesh geometry={built.shoreIce} material={built.mats.ice} onUpdate={(o) => o.layers.set(SONAR_HIDE_LAYER)} />}
      <Trees geos={built.conifers} mat={built.mats.tree} groups={byVariant} place={placeTree} budget={budget} />
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
