// The Base Mini film (#225, Jason's round-1 feedback): records one pass on the virtual clock of ../rec.mjs, from the clean
// 86bf80e checkout served by "ad-lake-base" (port 5192; no VITE_DEVICES: the Mini is picked with the device switch).
//   node film-base.mjs <pass> <outDir> [port=5192] [fps=30]
// Passes (film seconds), 9:16 only for now:
//   open   0–4      the whole lake, a slow cinematic push toward the boat (lake context 1080×1920, __lakeSnap frames)
//   drag   4–8.5    the boat dragged bow-first, the Forward beam over the timber; the finger cue is drawn by the comp from
//                   the boat's screen position logged here (lake context)
//   phone  8.5–13.5 the phone slides up from below while the camera pulls back and tilts down (phone layout 360×640 @3,
//                   page.screenshot); Live Forward, fish light up; the phone slides out at the end
//   angle  13.5–18  3D only, low camera: Forward 39°, then Combo opens to 78° (fanOpen); the number is drawn by the comp
//   combo  18–21.5  the phone alone: Live Combo (phone layout, lifted into the safe band)
//   ice    21.5–29  the ice page, Combo, an orbit round the hole from left to right (placeholder until Base's shelter/fish
//                   switches; see docs/2026-11-03-ad-base-feedback-round1.md)
// The end card (29–33) is drawn by the comp over black. Frames are named by the 30 fps frame number.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [pass, out, port = '5192', fpsArg = '30'] = process.argv.slice(2)
const FPS = +fpsArg
const SPAN = { open: [0, 4], drag: [4, 8.5], phone: [8.5, 13.5], angle: [13.5, 18], combo: [18, 21.5], ice: [21.5, 29] }[pass]
if (!SPAN) throw new Error('pass: open | drag | phone | angle | combo | ice')
fs.mkdirSync(out, { recursive: true })
const clamp = (u) => Math.min(1, Math.max(0, u)), lerp = (a, b, u) => a + (b - a) * u, lerp3 = (a, b, u) => a.map((x, i) => lerp(x, b[i], u))
const smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10), easeOut = (u) => 1 - (1 - u) ** 3, easeIn = (u) => u * u * u
const span = (t, a, b) => clamp((t - a) / (b - a))
const CAM = JSON.parse(process.env.CAMS || '{}') // per-pass camera overrides while fitting
// ---- cameras ----
const WIDE = CAM.wide || { pos: [-40, 95, 150], look: [10, -10, 0], fov: 48 }        // the whole lake (storyboard shot 1)
const OPEN1 = CAM.open1 || { pos: [-12, 40, 84], look: [22, -8, 8], fov: 48 }        // the push lands here: the boat and the beam readable
const F5 = CAM.f5 || { pos: [-2, 26, 60], look: [28, -6, 8], fov: 48 }               // the drag framing (the v3 opening)
const BACK = CAM.back || { pos: [-4, 82, 92], look: [22, -8, 30], fov: 48 }          // the pull-back as the phone comes up: higher, looking more down; the boat and beam end up at y ~560–720, above the phone (748)
const LOW1 = CAM.low1 || { pos: [0, 12, 24], look: [28, -6, 8], fov: 52 }            // the angle beat: low beside the boat (el ~29°: lower, the water mirrors the sky), the beam big in the frame
const LOW2 = CAM.low2 || { pos: [10, 16, 32], look: [26, -5, 10], fov: 50 }          // ...rising a little as Combo opens
const TOP = CAM.top || { pos: [24, 95, 46], look: [24, -10, 22], fov: 40 }            // the combo phone beat (storyboard shot 4)
// the orbit round the hole, left to right, near → far, at the page's own Section elevation. Base's c8ace42 turns the Section
// cut to face the camera every frame (adIce.cutAz = 'cam'); the shelter is not cut, so it is kept 8 m on the far side of the
// hole from the camera, a little to the side (adIce.shelter set per frame). az 90 = the +z side the page looks from.
const ICE = CAM.ice || { r0: 19, r1: 30, el: 17, az0: 30, az1: 150, lookY: -4, shelterR: 8, shelterSide: 3 }
const shot = {
  open: (t) => { const u = smoother(span(t, 0, 4)); return { cam: { pos: lerp3(WIDE.pos, OPEN1.pos, u), look: lerp3(WIDE.look, OPEN1.look, u), fov: lerp(WIDE.fov, OPEN1.fov, u) } } },
  drag: (t) => { const u = smoother(span(t, 4, 8.5)); return { cam: { pos: lerp3(OPEN1.pos, F5.pos, u * 0.9), look: lerp3(OPEN1.look, F5.look, u * 0.9), fov: 48 }, target: [lerp(16, 23, smoother(span(t, 4.4, 7.6))), 11] } },
  phone: (t) => { const u = easeOut(span(t, 8.6, 9.5)); const A = { pos: lerp3(OPEN1.pos, F5.pos, 0.9), look: lerp3(OPEN1.look, F5.look, 0.9), fov: 48 }
    return { cam: { pos: lerp3(A.pos, BACK.pos, u), look: lerp3(A.look, BACK.look, u), fov: 48 }, lift: lerp(720, -215, easeOut(span(t, 8.6, 9.3))) + lerp(0, 900, easeIn(span(t, 12.9, 13.5))) } },
  angle: (t) => { const u = smoother(span(t, 15.0, 18)); return { cam: { pos: lerp3(LOW1.pos, LOW2.pos, u), look: lerp3(LOW1.look, LOW2.look, u), fov: lerp(LOW1.fov, LOW2.fov, u) }, view: t < 15.0 ? 'Forward' : 'Combo', fanOpen: t < 15.0 ? 1 : lerp(0.03, 1, easeOut(span(t, 15.0, 16.3))) } },
  combo: (t) => { const u = span(t, 18, 21.5); return { cam: { pos: [TOP.pos[0], TOP.pos[1] - 6 * u, TOP.pos[2] + 2 * u], look: TOP.look, fov: TOP.fov }, lift: -215 } },
  ice: (t, s) => { const u = smoother(span(t, 21.8, 28.5)), az = lerp(ICE.az0, ICE.az1, u) * Math.PI / 180, el = ICE.el * Math.PI / 180, r = lerp(ICE.r0, ICE.r1, u)
    const shelter = [-ICE.shelterR * Math.cos(az) - ICE.shelterSide * Math.sin(az), -ICE.shelterR * Math.sin(az) + ICE.shelterSide * Math.cos(az)]
    return { cam: { pos: [s.hole[0] + r * Math.cos(el) * Math.cos(az), r * Math.sin(el) + 0.5, s.hole[1] + r * Math.cos(el) * Math.sin(az)], look: [s.hole[0], ICE.lookY, s.hole[1]], fov: 46 }, shelter } },
}[pass]
const calls = { open: [], drag: [[4.5, 'largemouth'], [6.3, 'largemouth']], phone: [[8.9, 'largemouth'], [10.6, 'largemouth']], angle: [[14.0, 'largemouth'], [16.4, 'largemouth']], combo: [[18.3, 'largemouth']], ice: [] }[pass]

// ---- the page ----
const phone = pass === 'phone' || pass === 'combo', ice = pass === 'ice'
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
const boat0 = pass === 'drag' ? '16,11' : pass === 'phone' ? '23,11' : '16,11'
await p.goto(`http://localhost:${port}/?boat=${boat0}&tour=off#${ice ? '2026-10-16-sonar-ice-3d' : '2026-09-23-sonar-lake-3d'}`); await p.waitForTimeout(7000)
const click = async (n) => { // the Mini's tiles sit in the hidden desktop panel on the phone layout: press through the DOM then
  const l = p.getByRole('button', { name: n, exact: true })
  if ((await l.count()) && (await l.first().isVisible())) return l.first().click({ timeout: 4000 })
  const ok = await p.evaluate((n) => { const el = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim() === n); if (el) el.click(); return !!el }, n)
  if (!ok) console.log('no button', n)
}
if (!ice) { await click('PingLive Mini'); await p.waitForTimeout(600) }
await click({ open: 'Forward', drag: 'Forward', phone: 'Live Forward', angle: 'Forward', combo: 'Live Combo', ice: 'Combo' }[pass]); await p.waitForTimeout(2500)
await p.evaluate(([phone]) => {
  const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.18 }; if (!phone) s.dragging = true
  if (s.hintEl) s.hintEl.style.visibility = 'hidden'
  if (phone) { // only the lake and the phone (as v3/film3.mjs); the phone frame is moved per frame through #__lift
    const fr = document.querySelector('[data-hint-avoid][style*="aspect-ratio"]')
    for (let el = fr; el.parentElement && el !== document.body; el = el.parentElement)
      for (const sib of el.parentElement.children) if (sib !== el && sib.tagName !== 'CANVAS' && !sib.querySelector('canvas')) sib.style.visibility = 'hidden'
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$|Replay tour|Learn More|Share to a|Back to the lake/.test(t)) el.style.visibility = 'hidden' }
    const st = document.createElement('style'); st.id = '__lift'; document.head.appendChild(st)
  }
}, [phone])
const hole = ice ? await p.evaluate(() => [window.__sonarState.boat?.x ?? 0, window.__sonarState.boat?.z ?? 0]) : null
if (ice) { // Base's #225 hooks (322f47f + c8ace42, "ad-lake-ice" port 5193): the shelter and sled on the far side of the hole, 2 + 3 fish held
  // in the Combo beam; the fish need ~15 s to swim in before rolling (Base's measurement)
  await p.evaluate((a) => { window.__sonarState.adIce = a }, JSON.parse(process.env.ADICE || '{"cutAz":"cam","shelter":[-3,-9],"sled":[1.5,-11,20],"fish":[2,3]}'))
  await p.waitForTimeout(+(process.env.ICE_WAIT || 15000))
  console.log('beam fish', JSON.stringify(await p.evaluate(() => (window.__beamFish ? window.__beamFish() : null))))
}
let view = null
const apply = async (t) => {
  const st = shot(t, { hole })
  if (st.view && st.view !== view) { view = st.view; await click(view); await p.waitForTimeout(50) }
  await p.evaluate(([st]) => {
    const s = window.__sonarState
    s.camOverride = { ...st.cam, noLogo: true }
    if (st.target) { s.target.x = st.target[0]; s.target.z = st.target[1] }
    if (st.fanOpen != null) s.fanOpen = st.fanOpen
    if (st.lift != null) document.getElementById('__lift').textContent = `[data-hint-avoid][style*="aspect-ratio"]{transform:translateY(${st.lift}px)}`
    if (st.shelter && s.adIce) { s.adIce.shelter = st.shelter; s.adIce.sled = [st.shelter[0] + 2, st.shelter[1] - 1.5, 20] }
  }, [st])
  return st
}
await apply(SPAN[0]); await p.waitForTimeout(1500)
const N = Math.round((SPAN[1] - SPAN[0]) * FPS), log = []
await p.evaluate(() => window.__vtStart())
for (let i = 0; i < N; i++) {
  const t = SPAN[0] + i / FPS
  const st = await apply(t)
  for (const c of calls) if (!c.done && t >= c[0]) { const r = await p.evaluate((sp) => { const r = window.__chase(sp); return typeof r === 'object' ? 'ok' : String(r) }, c[1]); c.tries = (c.tries || 0) + 1; if (/ok|rising|coming/.test(r) || c.tries >= 8) c.done = true; console.log(t.toFixed(2), '__chase', c[1], r) }
  await p.evaluate((ms) => window.__vtStep(ms), 1000 / FPS)
  const name = `f${String(Math.round(t * 30)).padStart(5, '0')}`
  if (phone) await p.screenshot({ path: `${out}/${name}.png`, timeout: 60000 })
  else { const url = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')) }
  const info = await p.evaluate(([W, H]) => { // the boat on screen (for the finger cue) and the read-out
    const s = window.__sonarState, cam = window.__camera
    let boat = null
    if (cam && s.boat) { const v = new cam.position.constructor(s.boat.x, 0.2, s.boat.z).project(cam); boat = [+((v.x + 1) / 2 * W).toFixed(1), +((1 - v.y) / 2 * H).toFixed(1)] }
    return { depth: s.depthEl?.textContent || null, boat, fan: s.fanOpen ?? null }
  }, [1080, 1920])
  log.push({ name, t: +t.toFixed(4), lift: st.lift ?? null, view, ...info })
  if (i % 30 === 0) console.log(pass, name, t.toFixed(2), info.depth || '', info.boat ? `boat ${info.boat}` : '')
}
fs.writeFileSync(`${out}/frames.json`, JSON.stringify(log))
await b.close()
