// The Base Mini film (#225, Jason's round-1 feedback): records one pass on the virtual clock of ../rec.mjs, from the clean
// checkout served by "ad-lake-base" (port 5192; rounds 1–4 86bf80e, round 5 on the latest base 96fdc22 — HQ 11-03, Jason: 都用最新版本;
// no VITE_DEVICES: the Mini is picked with the device switch).
//   node film-base.mjs <pass> <outDir> [port=5192] [fps=30]
// Passes (film seconds), 9:16 only for now:
//   open   0–4      the whole lake, a slow cinematic push toward the boat (lake context 1080×1920, __lakeSnap frames)
//   drag   4–9.5    the boat dragged bow-first along Jason's route toward the island's timber; the finger cue is drawn by the
//                   comp from the boat's screen position logged here (lake context); the hold's arc follows the boat's own progress
//   phone  8.5–13.5 the phone slides up from below while the camera pulls back and tilts down (phone layout 360×640 @3,
//                   page.screenshot); Live Forward, fish light up; the phone slides out at the end
//   angle  14.5–19  3D only, high behind the boat at the small wreck: Combo opens from a slit to its full width (fanOpen); the
//                   number is drawn by the comp (r3: no Forward opening any more)
//   combo  18–21.5  the phone alone: Live Combo (phone layout, lifted into the safe band)
//   ice    21.5–29  the ice page, Combo, an orbit round the hole from left to right (placeholder until Base's shelter/fish
//                   switches; see docs/2026-11-03-ad-base-feedback-round1.md)
// The end card (29–33) is drawn by the comp over black. Frames are named by the 30 fps frame number.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [pass, out, port = '5192', fpsArg = '30'] = process.argv.slice(2)
const FPS = +fpsArg
// round 2 (docs/2026-11-03-ad-base-feedback-round2.md): the drag is 1 s longer, so everything after it moves by +1 s
const SPAN = { open: [0, 4], drag: [4, 9.5], phone: [9.5, 14.5], angle: [14.5, 19], combo: [19, 22.5], ice: [22.5, 30] }[pass]
if (!SPAN) throw new Error('pass: open | drag | phone | angle | combo | ice')
fs.mkdirSync(out, { recursive: true })
const clamp = (u) => Math.min(1, Math.max(0, u)), lerp = (a, b, u) => a + (b - a) * u, lerp3 = (a, b, u) => a.map((x, i) => lerp(x, b[i], u))
const smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10), easeOut = (u) => 1 - (1 - u) ** 3, easeIn = (u) => u * u * u
const span = (t, a, b) => clamp((t - a) / (b - a))
const CAM = JSON.parse(process.env.CAMS || '{}') // per-pass camera overrides while fitting
// ---- cameras ----
const WIDE = CAM.wide || { pos: [-40, 95, 150], look: [10, -10, 0], fov: 48 }        // the whole lake (storyboard shot 1)
// r5 (Jason's own recording of the route, reference/ads/2026-11-bf/base/jason/2026-11-03-drag-route-jason.mov, 11-03): the drag
// runs from open water left of centre, 19.8 ft under the boat on the west shelf's edge, to 29.1 ft with the island's timber
// ahead — unprojected from his frames and matched on depth and the phone picture: (−21, 16) → (8, 14), 29 m; then both points
// 15 ft (4.6 m) back along the route on his word ("再往回一点", 11-03): (−25.6, 16.3) → (3.4, 14.3). This replaces the round 2/3
// rule (2× round 2's distance, 15 ft back: 4.4 → 18.4). The cameras sit farther back for the longer path and moved with it.
const DRAG0 = CAM.drag0 || [-25.6, 16.3], DRAG1 = CAM.drag1 || [3.4, 14.3]             // the boat's path on the drag (bow-first, +x)
const OPEN1 = CAM.open1 || { pos: [-40.6, 40, 86.3], look: [-12.6, -8, 16.3], fov: 48 } // the push lands here: the boat at the start and its beam readable (look = boat + AHEAD)
// r6 (Jason on r5: 镜头最后没有跟着船, the beam ran out of frame): the drag camera follows the boat — its look point rides 13 m ahead
// of the boat (the boat left of centre, the 80 ft beam to the right) and the camera keeps OPEN1's offset, easing to a slightly
// lower, closer one (F5_OFF) as the boat goes; the phone beat starts from the same camera (dragCam at the end point)
const AHEAD = [13, 0, 0], F5_OFF = CAM.f5off || [-30, 42, 73]
const dragCam = (boat, u) => { const look = [boat[0] + AHEAD[0], lerp(-8, -6, u), boat[1] + AHEAD[2]]; const off = lerp3([OPEN1.pos[0] - OPEN1.look[0], OPEN1.pos[1] - OPEN1.look[1], OPEN1.pos[2] - OPEN1.look[2]], F5_OFF, u * 0.9); return { pos: [look[0] + off[0], look[1] + off[1], look[2] + off[2]], look, fov: 48 } }
const BACK = CAM.back || { pos: [-26, 130, 124.3], look: [0, -8, 36.3], fov: 48 }    // r2: the pull-back as the phone comes up, higher still: the boat and beam sit in y ~600–740, between the caption and the phone (748); r5: moved with the end point
// r3 (Jason): the angle beat and the combo phone sit at the SMALL wreck of the reference (wreck.js SMALL_WRECK x 16, z −26, the
// 10 m workboat; docs/2026-11-03-ad-r2-shot4-reference.webp): the boat at WRECK_BOAT facing +x with the wreck ~30 m ahead inside the
// forward fan, Combo with forward 155 ft / down 100 ft, the camera high behind-left of the boat looking along the beam as in
// the reference, pulled back so the whole coverage block is in the frame (the forward curtain is ~47 m long)
const WRECK_BOAT = CAM.wreckBoat || [-14, -22]
const LOW1 = CAM.low1 || { pos: [-46, 52, 30], look: [10, -8, -24], fov: 50 }          // high to the side and behind the boat (the reference's angle), the boat lower left, the block across the frame
const LOW2 = CAM.low2 || { pos: [-38, 64, 22], look: [10, -8, -24], fov: 48 }           // ...rising a little as Combo opens; the whole 155 ft block in the frame, the wreck under its middle
const TOP = CAM.top || { pos: [-4, 150, 1], look: [-4, -10, -5], fov: 40 }              // the combo phone beat over the wreck: the boat in the band above the phone, the wreck on the phone's Forward panel
// the orbit round the hole, left to right, near → far, at the page's own Section elevation. Base's c8ace42 turns the Section
// cut to face the camera every frame (adIce.cutAz = 'cam'); the shelter is not cut, so it is kept 8 m on the far side of the
// hole from the camera, a little to the side (adIce.shelter set per frame). az 90 = the +z side the page looks from.
const ICE = CAM.ice || { r0: 21, r1: 44, el0: 25, el1: 32, az0: 30, az1: 150, lookY: -3, shelterR: 8, shelterSide: -9, pull0: 0.2 } // r2: higher all through (the hole kit sits under the caption band), the second half pulls higher and farther; the shelter to the right, clear of the caption. r3: the pull starts earlier (u 0.2) so it blends into the orbit instead of kicking in
const shot = {
  open: (t) => { const u = smoother(span(t, 0, 4)); return { cam: { pos: lerp3(WIDE.pos, OPEN1.pos, u), look: lerp3(WIDE.look, OPEN1.look, u), fov: lerp(WIDE.fov, OPEN1.fov, u) } } },
  // r3 (Jason): the boat must move the moment the hold's arc starts, so the target leaves at once (sine ease-out from 4.4 s; the
  // boat closes on it at 4/s, Scene.jsx) instead of the slow smoother start; the comp's arc follows the boat's own x (bx)
  drag: (t, s) => { const u = smoother(span(t, 4, 9.5)); return { cam: dragCam(s.boat || DRAG0, u), target: lerp3(DRAG0, DRAG1, Math.sin(span(t, 4.4, 8.7) * Math.PI / 2)) } },
  phone: (t) => { const u = easeOut(span(t, 9.6, 10.5)); const A = dragCam(DRAG1, 1)
    return { cam: { pos: lerp3(A.pos, BACK.pos, u), look: lerp3(A.look, BACK.look, u), fov: 48 }, lift: lerp(720, -215, easeOut(span(t, 9.6, 10.3))) + lerp(0, 900, easeIn(span(t, 13.9, 14.5))) } },
  // r3: no Forward opening; Combo from the first frame, its fans a slit that opens over 14.8–16.1 s while the camera rises
  angle: (t) => { const u = smoother(span(t, 14.5, 19)); return { cam: { pos: lerp3(LOW1.pos, LOW2.pos, u), look: lerp3(LOW1.look, LOW2.look, u), fov: lerp(LOW1.fov, LOW2.fov, u) }, fanOpen: lerp(0.03, 1, easeOut(span(t, 14.8, 16.1))) } },
  combo: (t) => { const u = span(t, 19, 22.5); return { cam: { pos: [TOP.pos[0], TOP.pos[1] - 6 * u, TOP.pos[2] + 2 * u], look: TOP.look, fov: TOP.fov }, lift: -215 } },
  ice: (t, s) => { const u = smoother(span(t, 22.8, 29.5)), az = lerp(ICE.az0, ICE.az1, u) * Math.PI / 180, el = lerp(ICE.el0, ICE.el1, smoother(span(u, ICE.pull0, 1))) * Math.PI / 180, r = lerp(ICE.r0, ICE.r1, smoother(span(u, ICE.pull0, 1)))
    const shelter = [-ICE.shelterR * Math.cos(az) - ICE.shelterSide * Math.sin(az), -ICE.shelterR * Math.sin(az) + ICE.shelterSide * Math.cos(az)]
    return { cam: { pos: [s.hole[0] + r * Math.cos(el) * Math.cos(az), r * Math.sin(el) + 0.5, s.hole[1] + r * Math.cos(el) * Math.sin(az)], look: [s.hole[0], ICE.lookY, s.hole[1]], fov: 46 }, shelter } },
}[pass]
const calls = { open: [], drag: [[4.5, 'largemouth'], [6.3, 'largemouth'], [7.8, 'largemouth']], phone: [[9.9, 'largemouth'], [11.6, 'largemouth']], angle: [[14.8, 'largemouth'], [16.6, 'largemouth']], combo: [[19.3, 'largemouth']], ice: [] }[pass]

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
const boat0 = pass === 'open' || pass === 'drag' ? `${DRAG0[0]},${DRAG0[1]}` : pass === 'phone' ? `${DRAG1[0]},${DRAG1[1]}` : pass === 'angle' || pass === 'combo' ? `${WRECK_BOAT[0]},${WRECK_BOAT[1]}` : '16,11' // r3: the open lands on the drag's start
await p.goto(`http://localhost:${port}/?boat=${boat0}&tour=off#${ice ? '2026-10-16-sonar-ice-3d' : '2026-09-23-sonar-lake-3d'}`); await p.waitForTimeout(7000)
const click = async (n) => { // the Mini's tiles sit in the hidden desktop panel on the phone layout: press through the DOM then
  const l = p.getByRole('button', { name: n, exact: true })
  if ((await l.count()) && (await l.first().isVisible())) return l.first().click({ timeout: 4000 })
  const ok = await p.evaluate((n) => { const el = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim() === n); if (el) el.click(); return !!el }, n)
  if (!ok) console.log('no button', n)
}
if (!ice) { await click('PingLive Mini'); await p.waitForTimeout(600) }
await click({ open: 'Forward', drag: 'Forward', phone: 'Live Forward', angle: 'Combo', combo: 'Live Combo', ice: 'Combo' }[pass]); await p.waitForTimeout(2500)
const setRange = (i, v) => p.locator('input[type=range]').nth(i).evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
if (pass === 'combo' || pass === 'angle') { await setRange(0, 155); await setRange(1, 100); await p.waitForTimeout(1500) } // the reference's ranges
await p.evaluate(([phone, cueKeep]) => {
  const s = window.__sonarState; s.hasDragged = true; s.adClean = true; if (cueKeep) { s.adClean = false; s.adCueKeep = true }; s.adBeam = { line: 0.55, face: 0.18 }; if (!phone) s.dragging = true // r17 (Jason: the ad's ring was too heavy): the web's own thin reticle rides with the boat on the drag
  if (s.hintEl) s.hintEl.style.visibility = 'hidden'
  if (phone) { // only the lake and the phone (as v3/film3.mjs); the phone frame is moved per frame through #__lift
    const fr = document.querySelector('[data-hint-avoid][style*="aspect-ratio"]')
    for (let el = fr; el.parentElement && el !== document.body; el = el.parentElement)
      for (const sib of el.parentElement.children) if (sib !== el && sib.tagName !== 'CANVAS' && !sib.querySelector('canvas')) sib.style.visibility = 'hidden'
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$|Replay tour|Learn More|Share to a|Back to the lake/.test(t)) el.style.visibility = 'hidden' }
    const st = document.createElement('style'); st.id = '__lift'; document.head.appendChild(st)
  }
}, [phone, pass === 'drag' && process.env.CUE !== 'ring'])
const hole = ice ? await p.evaluate(() => [window.__sonarState.boat?.x ?? 0, window.__sonarState.boat?.z ?? 0]) : null
if (ice) { // Base's #225 hooks (322f47f + c8ace42, "ad-lake-ice" port 5193): the shelter and sled on the far side of the hole, 2 + 3 fish held
  // in the Combo beam; the fish need ~15 s to swim in before rolling (Base's measurement)
  await p.evaluate((a) => { window.__sonarState.adIce = a }, JSON.parse(process.env.ADICE || '{"cutAz":"cam","shelter":[-3,-9],"sled":[1.5,-11,20],"fish":[2,3]}'))
  await p.waitForTimeout(+(process.env.ICE_WAIT || 15000))
  console.log('beam fish', JSON.stringify(await p.evaluate(() => (window.__beamFish ? window.__beamFish() : null))))
}
let view = null
const apply = async (t) => {
  const boat = pass === 'drag' ? await p.evaluate(() => [window.__sonarState.boat.x, window.__sonarState.boat.z]) : null // the drag camera follows the boat
  const st = shot(t, { hole, boat })
  if (st.view && st.view !== view) { view = st.view; await click(view); await p.waitForTimeout(50); if (view === 'Combo') { await setRange(0, 155); await setRange(1, 100) } }
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
  const info = await p.evaluate(([W, H, D0, D1]) => { // the boat on screen (for the finger cue) and the read-out
    const s = window.__sonarState, cam = window.__camera
    let boat = null
    if (cam && s.boat) { const v = new cam.position.constructor(s.boat.x, 0.2, s.boat.z).project(cam); boat = [+((v.x + 1) / 2 * W).toFixed(1), +((1 - v.y) / 2 * H).toFixed(1)] }
    // beam: the Forward beam's far corners (80 ft = 24.4 m ahead, ±19.5°, surface and ~9 m down) on screen, to check the beam stays in frame
    let beam = null
    if (cam && s.boat) { const R = 24.4, w = R * Math.tan(19.5 * Math.PI / 180); beam = [[R, 0, w], [R, 0, -w], [R, -9, w], [R, -9, -w]].map(([dx, dy, dz]) => { const v = new cam.position.constructor(s.boat.x + dx, dy, s.boat.z + dz).project(cam); return [+((v.x + 1) / 2 * W).toFixed(0), +((1 - v.y) / 2 * H).toFixed(0)] }) }
    return { depth: s.depthEl?.textContent || null, boat, beam, bx: s.boat ? +s.boat.x.toFixed(2) : null, prog: s.boat ? +((s.boat.x - D0) / (D1 - D0)).toFixed(4) : null, fan: s.fanOpen ?? null } // prog: the boat's progress along the drag path, for the comp's arc
  }, [1080, 1920, DRAG0[0], DRAG1[0]])
  log.push({ name, t: +t.toFixed(4), lift: st.lift ?? null, view, ...info })
  if (i % 30 === 0) console.log(pass, name, t.toFixed(2), info.depth || '', info.boat ? `boat ${info.boat}` : '')
}
fs.writeFileSync(`${out}/frames.json`, JSON.stringify(log))
await b.close()
