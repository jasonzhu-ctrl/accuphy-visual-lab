// BF ad v3 film (PingLive, 15 s, 9:16): records one shot pass on the virtual clock of ../rec.mjs. The shot plan is in
// README.md ("The 15 s film"). Times are film seconds; each pass records only its own stretch.
//   node film3.mjs <pass: open|pano|deep> <outDir> [port=5190] [fps=30]
// Lake passes (open, pano): 1080×1920 @1, frames from __lakeSnap(). Deep (with the end card's background): the phone
// layout 360×640 @3, frames from page.screenshot. Every frame also gets a line in frames.json (fan, read-out).
// Record from a clean checkout of the current lake commit (docs/versions.md), served by the "ad-lake" preview server.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [pass, out, port = '5190', fpsArg = '30'] = process.argv.slice(2)
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
const T = JSON.parse(process.env.T || 'null') || { pos: [31, 125, 3.2], look: [31, -10, -2.8], fov: 48 } // straight down on the fan: it fills y 810–1594, under the type
const S8 = { pos: [22, 80, 92], look: [27, -10, 0], fov: 48 } // the board's 135° landing
// orbit from a to b about their look points: the offset direction is slerped, its length and the look point lerped
const orbit = (a, b, u) => {
  const oa = a.pos.map((x, i) => x - a.look[i]), ob = b.pos.map((x, i) => x - b.look[i])
  const la = Math.hypot(...oa), lb = Math.hypot(...ob), na = oa.map((x) => x / la), nb = ob.map((x) => x / lb)
  const om = Math.acos(clamp(na.reduce((s, x, i) => s + x * nb[i], 0))), so = Math.sin(om)
  const dir = so < 1e-6 ? na : na.map((x, i) => (Math.sin((1 - u) * om) * x + Math.sin(u * om) * nb[i]) / so)
  const look = lerp3(a.look, b.look, u), len = lerp(la, lb, u)
  return { pos: look.map((x, i) => x + dir[i] * len), look, fov: lerp(a.fov, b.fov, u) }
}
const shot = {
  open: (t) => {
    const u = t < 0.4 ? (t * t) / 0.8 / 2.8 : (t - 0.2) / 2.8 // a soft start (0–0.4 s), then steady; 1 at 3 s
    const cam = { pos: lerp3(OPEN0.pos, F5.pos, clamp(u)), look: lerp3(OPEN0.look, F5.look, clamp(u)), fov: 48 }
    return { cam, target: [lerp(16, 18.5, span(t, 0.2, 3)), 11] }
  },
  pano: (t) => {
    const fanOpen = lerp(0.02, 1, easeOutCubic(span(t, 3.15, 4.6)))
    return { cam: orbit(T, S8, smoother(span(t, 4.9, 6.9))), fanOpen }
  },
  deep: (t, s) => {
    const bx = s.boatX, pz = lerp(32, 30, smoother(span(t, 7.5, 9.4)))
    return { cam: { pos: [bx + 11, 38, pz], look: [bx + 11, -8, -47], fov: 42 }, target: [lerp(-40, -32, smoother(span(t, 7.5, 9.3))), -47.2] }
  },
}[pass]
const calls = { open: [[0.3, 'largemouth']], pano: [[5.6, 'largemouth']], deep: [] }[pass] // a lake trout at ~100 ft answers __chase with 'blocked'; they swim on their own

// ---- the page ----
const phone = pass === 'deep'
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal', '--enable-gpu-rasterization'] })
const ctx = await b.newContext(phone ? { viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
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
const boat = phone ? '-40,-47.2' : '16,11'
await p.goto(`http://localhost:${port}/?boat=${boat}#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(7000)
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 5000 })
if (phone) {
  await click('Forward View'); await p.waitForTimeout(2500)
  await p.evaluate(() => { // as v3deep.mjs: no page buttons, no hint
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$/.test(t) || /^Shop /.test(t)) el.style.visibility = 'hidden' }
    const s = window.__sonarState; if (s.hintEl) s.hintEl.style.visibility = 'hidden'
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
  const info = await p.evaluate(async () => {
    const s = window.__sonarState, cam = window.__camera, V = cam.position.constructor
    let fan = null
    if (s.fanOpen != null && s.specs) { // the outline of the 3D coverage block on screen: the 135° fan clipped to the phone's box
      // (the lake's own wedgeGeometry, narrowed by fanOpen as Scene.jsx's fanned(); read-only), as the convex hull of its
      // projected vertices. From straight above that is the block's footprint.
      window.__wedgeMod ||= await import('/src/experiments/2026-09-23-beam-shapes-3d/wedge.js')
      const W = 1080, H = 1920, pts = []
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
  })
  log.push({ name, t: +t.toFixed(4), ...info })
  if (i % 30 === 0) console.log(pass, name, t.toFixed(2), info.depth || '', info.fan ? 'fan ' + info.fan.open.toFixed(2) : '')
}
fs.writeFileSync(`${out}/frames.json`, JSON.stringify(log))
await b.close()
