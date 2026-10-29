// BF ad v3 film (PingLive, 15 s, 9:16): records one shot pass on the virtual clock of ../rec.mjs. The shot plan is in
// README.md ("The 15 s film"). Times are film seconds; each pass records only its own stretch.
//   node film3.mjs <pass: open|pano|deep> <outDir> [port=5190] [fps=30]
// Lake passes (open, pano): 1080×1920 @1, frames from __lakeSnap(). Deep (with the end card's background): the phone
// layout 360×640 @3, frames from page.screenshot. Every frame also gets a line in frames.json (fan, read-out).
// Record from a clean checkout of the current lake commit (docs/versions.md), served by the "ad-lake" preview server.
// FILM=mini ASPECT=916|169: the PingLive Mini test film (#185, Jason 10-28 "用 Mini 的片子"; README "Mini US"), recorded from
// the Mini-only build ("ad-lake-mini", port 5191). 'pano' is then the Live Combo hero beat. ASPECT=169 records 1920×1080.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [pass, out, port = '5190', fpsArg = '30'] = process.argv.slice(2)
const MINI = process.env.FILM === 'mini', WIDE = process.env.ASPECT === '169', W = WIDE ? 1920 : 1080, H = WIDE ? 1080 : 1920
const FPS = +fpsArg
const SPAN = { open: [0, 3], pano: [3, 7.5], deep: [7.5, 15] }[pass]
if (!SPAN) throw new Error('pass: open | pano | deep')
fs.mkdirSync(out, { recursive: true })

const clamp = (u) => Math.min(1, Math.max(0, u))
const lerp = (a, b, u) => a + (b - a) * u
const lerp3 = (a, b, u) => a.map((x, i) => lerp(x, b[i], u))
const smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10)
const easeOutCubic = (u) => 1 - (1 - u) ** 3
const span = (t, t0, t1) => clamp((t - t0) / (t1 - t0))

// ---- the shots ----
const F5 = { pos: [-2, 26, 60], look: [28, -6, 8], fov: 48 } // the board's opening
const OPEN0 = { pos: [-6, 25, 64], look: [26, -6, 8], fov: 48 }
const T = JSON.parse(process.env.T || 'null') || { pos: [31, 201, 11.4], look: [31, -10, 5.4], fov: 48 } // straight down on the fan: open, it fills y 780–1266, under the type (HQ 10-27)
const S8 = { pos: [22, 80, 92], look: [27, -10, 0], fov: 48 } // the board's 135° landing
// the 135° pull-down (HQ 10-27: bigger and lower, still landing on s8): from straight above, the camera swings down past
// s8's height to a low side view close to the water (elevation LOW_EL at 60 % of the move, distance LOW_R at 50 %), drifting
// out to the west behind the boat and back (SWING_AZ, peak at 50 %), then rises into s8. Spherical about the look point.
const LOW_EL = 26, LOW_R = 92, SWING_AZ = 30, LOOK_LIFT = +(process.env.LOOK_LIFT ?? 15) // lower than 26° the water mirrors the sky and hides the block (tried 16°)
const sph = (c) => { const o = c.pos.map((x, i) => x - c.look[i]), r = Math.hypot(...o); return { r, el: Math.asin(o[1] / r) * 180 / Math.PI, az: Math.atan2(o[2], o[0]) * 180 / Math.PI } }
const sstep = (u) => u * u * (3 - 2 * u)
const swing = (a, b, u, o = { lowEl: LOW_EL, lowR: LOW_R, az: SWING_AZ, lift: LOOK_LIFT }) => {
  const A = sph(a), B = sph(b), rad = Math.PI / 180, lowEl = o.lowEl ?? (A.el + B.el) / 2, lowR = o.lowR ?? (A.r + B.r) / 2
  const el = u < 0.6 ? lerp(A.el, lowEl, sstep(u / 0.6)) : lerp(lowEl, B.el, sstep((u - 0.6) / 0.4))
  const r = u < 0.5 ? lerp(A.r, lowR, sstep(u / 0.5)) : lerp(lowR, B.r, sstep((u - 0.5) / 0.5))
  const az = lerp(A.az, B.az, u) + o.az * Math.sin(Math.PI * u)
  const look = lerp3(a.look, b.look, u); look[1] += o.lift * Math.sin(Math.PI * u) // keeps the block under the type on the way down
  const d = [Math.cos(el * rad) * Math.cos(az * rad), Math.sin(el * rad), Math.cos(el * rad) * Math.sin(az * rad)]
  return { pos: look.map((x, i) => x + d[i] * r), look, fov: lerp(a.fov, b.fov, u) }
}
// the Mini test film's cameras, per format (README "Mini US"); MINI_CAMS=<json> overrides them while fitting
const MC = { ...({
  916: { open0: { pos: [-6, 25, 64], look: [26, -6, 8], fov: 48 }, open1: F5, c1: { pos: [-14, 12, 16], look: [24, -2, 10], fov: 46 }, c2: { pos: [19, 22, 58], look: [19, -1, 11], fov: 44 },
    deep: { dx: 11, py: 52, pz: [55, 52], ly: -25, fov: 42 } },
  169: { open0: { pos: [-14, 18, 50], look: [12, -6, 8], fov: 32 }, open1: { pos: [-10, 19, 46], look: [14, -6, 8], fov: 32 }, c1: { pos: [-14, 10, 16], look: [18, -8, 6], fov: 34 }, c2: { pos: [16, 16, 50], look: [12, -9, 11], fov: 32 },
    deep: { dx: 6, py: 34, pz: [16, 12], ly: -6, fov: 36 } },
})[WIDE ? 169 : 916], ...JSON.parse(process.env.MINI_CAMS ? fs.readFileSync(process.env.MINI_CAMS, 'utf8') : '{}') }
const miniShot = {
  open: (t) => { const u = t < 0.4 ? (t * t) / 0.8 / 2.8 : (t - 0.2) / 2.8; return { cam: { pos: lerp3(MC.open0.pos, MC.open1.pos, clamp(u)), look: lerp3(MC.open0.look, MC.open1.look, clamp(u)), fov: MC.open1.fov }, target: [lerp(16, 18.5, span(t, 0.2, 3)), 11] } },
  // Live Combo: both curtains open together (3.15–4.3 s), then the camera swings from behind the boat round to the side
  pano: (t) => ({ cam: swing(MC.c1, MC.c2, smoother(span(t, 4.6, 6.9)), { az: 0, lift: 0 }), fanOpen: lerp(0.05, 1, easeOutCubic(span(t, 3.15, 4.3))) }),
  // Live Down over the 110 ft hole: bow-first −33 → −25, the read-out 96 → 110 ft, the lake trout near the bottom
  deep: (t, s) => { const D = MC.deep, bx = s.boatX; return { cam: { pos: [bx + D.dx, D.py, lerp(D.pz[0], D.pz[1], smoother(span(t, 7.5, 9.4)))], look: [bx + D.dx, D.ly, -47], fov: D.fov }, target: [lerp(-33, -25, smoother(span(t, 7.5, 9.3))), -47.2] } },
}
const shot = MINI ? miniShot[pass] : {
  open: (t) => {
    const u = t < 0.4 ? (t * t) / 0.8 / 2.8 : (t - 0.2) / 2.8 // a soft start (0–0.4 s), then steady; 1 at 3 s
    const cam = { pos: lerp3(OPEN0.pos, F5.pos, clamp(u)), look: lerp3(OPEN0.look, F5.look, clamp(u)), fov: 48 }
    return { cam, target: [lerp(16, 18.5, span(t, 0.2, 3)), 11] }
  },
  pano: (t) => {
    const fanOpen = lerp(0.02, 1, easeOutCubic(span(t, 3.15, 4.6)))
    return { cam: swing(T, S8, smoother(span(t, 4.9, 7.1))), fanOpen }
  },
  deep: (t, s) => {
    // camera h (HQ 10-27): the boat just under the line, the block's top between the line and the lifted phone
    const bx = s.boatX, k = smoother(span(t, 7.5, 9.4))
    return { cam: { pos: [bx + 11, 52, lerp(55, 52, k)], look: [bx + 11, -25, -47], fov: 42 }, target: [lerp(-40, -32, smoother(span(t, 7.5, 9.3))), -47.2] }
  },
}[pass]
const calls = { open: [[0.3, 'largemouth']], pano: [[5.6, 'largemouth']], deep: [] }[pass] // a lake trout at ~100 ft answers __chase with 'blocked'; they swim on their own

// ---- the page ----
const phone = pass === 'deep'
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal', '--enable-gpu-rasterization'] })
const ctx = await b.newContext(phone ? (WIDE ? { viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 } : { viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }) : { viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await ctx.addInitScript(() => { // the virtual clock of ../rec.mjs
  const realNow = performance.now.bind(performance), realDate = Date.now, raf = window.requestAnimationFrame.bind(window)
  const V = (window.__vt = { on: false, t: 0, d0: 0, q: [] })
  performance.now = () => (V.on ? V.t : realNow())
  Date.now = () => (V.on ? V.d0 + V.t : realDate())
  window.requestAnimationFrame = (cb) => { if (V.on) { V.q.push(cb); return V.q.length } return raf(cb) }
  window.__vtStart = () => { V.t = realNow(); V.d0 = realDate() - V.t; V.on = true }
  window.__vtStep = (ms) => { V.t += ms; const q = V.q.splice(0); for (const cb of q) { try { cb(V.t) } catch (e) { console.error(e) } } return q.length }
})
const p = await ctx.newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)))
const boat = phone ? (MINI ? '-33,-47.2' : '-40,-47.2') : '16,11'
await p.goto(`http://localhost:${port}/?boat=${boat}#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(7000)
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 5000 })
if (MINI) {
  await click(phone ? (WIDE ? 'Down' : 'Live Down') : pass === 'open' ? 'Forward' : 'Combo'); await p.waitForTimeout(2500)
  if (phone) await p.evaluate((wide) => {
    // only the lake and the phone: everything off the phone frame's ancestor line, except the canvas, is hidden
    const fr = document.querySelector('[data-hint-avoid][style*="aspect-ratio"]')
    for (let el = fr; el.parentElement && el !== document.body; el = el.parentElement)
      for (const sib of el.parentElement.children) if (sib !== el && sib.tagName !== 'CANVAS' && !sib.querySelector('canvas')) sib.style.visibility = 'hidden'
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$/.test(t) || /^Shop /.test(t)) el.style.visibility = 'hidden' }
    const s = window.__sonarState; if (s.hintEl) s.hintEl.style.visibility = 'hidden'
    // 9:16: lifted out of the Reels bottom zone as in v3 (y 748–1233). 16:9: up out of YouTube's Skip button and bottom
    // bar, to y ~330–718 of 1080 at the right. Real size; the sonar is drawn into the frame's on-screen rect.
    const st = document.createElement('style'); st.textContent = `[data-hint-avoid]{transform:translateY(-${wide ? 157 : 215}px)}`; document.head.appendChild(st)
  }, WIDE)
} else if (phone) {
  await click('Forward View'); await p.waitForTimeout(2500)
  await p.evaluate(() => { // as v3deep.mjs: no page buttons, no hint
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$/.test(t) || /^Shop /.test(t)) el.style.visibility = 'hidden' }
    const s = window.__sonarState; if (s.hintEl) s.hintEl.style.visibility = 'hidden'
    // the phone lifted out of the Reels bottom zone (HQ 10-27): 215 CSS px up, so it fills y 748–1233 of 1920 at its real
    // size. The page draws the sonar into the phone frame's on-screen rect every frame, so the picture moves with it.
    const st = document.createElement('style'); st.textContent = '[data-hint-avoid]{transform:translateY(-215px)}'; document.head.appendChild(st)
  })
} else {
  await click('PingLive'); await click(pass === 'open' ? 'Forward' : 'Panoramic'); await p.waitForTimeout(2500)
}
await p.evaluate(([phone, pass]) => {
  const s = window.__sonarState; s.hasDragged = true; s.adClean = true
  if (!phone) s.dragging = true
  s.adBeam = pass === 'open' ? { line: 0.55, face: 0.2 } : phone ? { line: 0.55, face: 0.16 } : { line: 0.5, face: 0.16 }
}, [phone, pass])
// the state of film time t, applied before the clock steps to it
const apply = (t) => p.evaluate(([st]) => {
  const s = window.__sonarState
  s.camOverride = { ...st.cam, noLogo: true }
  if (st.target) { s.target.x = st.target[0]; s.target.z = st.target[1] }
  if (st.fanOpen != null) s.fanOpen = st.fanOpen
}, [shot(t, { boatX: boatX })])
let boatX = await p.evaluate(() => window.__sonarState.boat.x)
await apply(SPAN[0]); await p.waitForTimeout(1500) // settle on the first frame's state (fan, camera) on the real clock
const N = Math.round((SPAN[1] - SPAN[0]) * FPS), log = []
await p.evaluate(() => window.__vtStart())
for (let i = 0; i < N; i++) {
  const t = SPAN[0] + i / FPS
  boatX = await p.evaluate(() => window.__sonarState.boat.x)
  await apply(t)
  for (const c of calls) if (!c.done && t >= c[0]) { const r = await p.evaluate((sp) => { const r = window.__chase(sp); return typeof r === 'object' ? 'ok' : String(r) }, c[1]); c.tries = (c.tries || 0) + 1; if (/ok|rising|coming/.test(r) || c.tries >= 8) c.done = true; console.log(t.toFixed(2), '__chase', c[1], r) }
  await p.evaluate((ms) => window.__vtStep(ms), 1000 / FPS)
  const name = `f${String(Math.round(t * 30)).padStart(5, '0')}` // named by the 30 fps frame number, so previews and finals line up
  if (phone) await p.screenshot({ path: `${out}/${name}.png`, timeout: 60000 })
  else { const url = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')) }
  const info = await p.evaluate(async ([W, H]) => {
    const s = window.__sonarState, cam = window.__camera, V = cam.position.constructor
    let fan = null
    if (s.fanOpen != null && s.specs) { // the outline of the 3D coverage block on screen: the 135° fan clipped to the phone's box
      // (the lake's own wedgeGeometry, narrowed by fanOpen as Scene.jsx's fanned(); read-only), as the convex hull of its
      // projected vertices. From straight above that is the block's footprint.
      window.__wedgeMod ||= await import('/src/experiments/2026-09-23-beam-shapes-3d/wedge.js')
      const pts = []
      for (const sp of s.specs) {
        const m = (sp.a0 + sp.a1) / 2, h = ((sp.a1 - sp.a0) / 2) * Math.max(0.01, s.fanOpen)
        const g = window.__wedgeMod.wedgeGeometry({ ...sp, a0: m - h, a1: m + h }), a = g.attributes.position.array
        for (let k = 0; k < a.length; k += 3) { const v = new V(a[k] + s.apex.x, a[k + 1] + s.apex.y, a[k + 2] + s.apex.z).project(cam); pts.push([(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]) }
        g.dispose()
      }
      pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]) // monotone-chain hull
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []
      for (const q of pts) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q) }
      for (const q of pts.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q) }
      const hull = lo.slice(0, -1).concat(up.slice(0, -1)).map((q) => [+q[0].toFixed(1), +q[1].toFixed(1)])
      fan = { apex: hull[0], arc: hull.slice(1), open: s.fanOpen }
    }
    return { depth: s.depthEl?.textContent || null, boat: [+s.boat.x.toFixed(2), +s.boat.z.toFixed(2)], fan }
  }, [W, H])
  log.push({ name, t: +t.toFixed(4), ...info })
  if (i % 30 === 0) console.log(pass, name, t.toFixed(2), info.depth || '', info.fan ? 'fan ' + info.fan.open.toFixed(2) : '')
}
fs.writeFileSync(`${out}/frames.json`, JSON.stringify(log))
await b.close()
