// The two e01 email animations, re-recorded from the standard Base 86bf80e ("ad-lake-base", port 5192; Jason 11-03 via the
// BF funnel chat, HQ's brief in the cross-session message). PingLive Mini, the desktop layout at 1600×900 (the phone at its
// own place bottom right, the panel / badges / buttons / hint hidden), frames on the virtual clock, 10 fps.
//   node e01.mjs step1 <outDir> [port=5192] [frames=36]   the Forward zoom-out of the 10-30 GIF (cap8.mjs 'rec': cameras kept),
//                                                        the boat dragged toward the timber, the finger cue drawn by e01-comp.mjs
//   node e01.mjs step2 <outDir> [port=5192] [frames=40]   looking back at the boat along the beam over the drop-off (cap8.mjs
//                                                        's3' angle), the boat dragged along the edge; the phone clear of the beam
//   node e01.mjs probe2 <outDir>                         stills of the step-2 camera candidates
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [mode, out, port = '5192', nArg] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const FPS = 10, N = +(nArg || (mode === 'step1' ? 36 : 40))
const clamp = (u) => Math.min(1, Math.max(0, u)), lerp = (a, b, u) => a + (b - a) * u, sstep = (u) => u * u * (3 - 2 * u), smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10)
const CAM = JSON.parse(process.env.CAMS || '{}')
// step 1 (cap8.mjs 'rec', the move Jason likes): bx 8, bz 5; pos [bx+6+(k−1)·3, 11k, bz+26k], look [bx+13, −7, bz], fov 42, k 1 → 1.6
const bx = 8, bz = 5
const step1 = (u) => { const k = 1 + 0.6 * sstep(u); return { cam: { pos: [bx + 6 + (k - 1) * 3, 11 * k, bz + 26 * k], look: [bx + 13, -7, bz], fov: 42 }, target: [lerp(8, 15, smoother(clamp((u - 0.08) / 0.84))), 5] } }
// step 2 (cap8.mjs 's3' R1, the angle of the 10-30 still, mirrored to the −z side so the beam opens bottom-left, away from the
// phone bottom right): the boat on the edge at x 31 → 37, the camera following
const S2 = CAM.s2 || { dx: 26, y: 9, dz: -14, lx: -4, ly: -9, lz: 2, fov: 40 }
const step2 = (u, x) => ({ cam: { pos: [x + S2.dx, S2.y, 8 + S2.dz], look: [x + S2.lx, S2.ly, 8 + S2.lz], fov: S2.fov }, target: [lerp(31, 37, smoother(clamp((u - 0.05) / 0.9))), 8] })

const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal', '--enable-gpu-rasterization'] })
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
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
const boat0 = mode === 'step1' ? '8,5' : '31,8'
await p.goto(`http://localhost:${port}/?boat=${boat0}&tour=off#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(7000)
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 4000 })
await click('PingLive Mini'); await p.waitForTimeout(600); await click('Forward'); await p.waitForTimeout(2500)
await p.evaluate(() => { // only the lake and the phone: the panel, the badges, the back link, the replay link and the hint hidden
  const s = window.__sonarState; s.hasDragged = true; s.dragging = true; s.adClean = true; s.adBeam = { line: 0.6, face: 0.22 }; s.fanOpen = 1
  if (s.hintEl) s.hintEl.style.visibility = 'hidden'
  if (s.panelEl) s.panelEl.style.visibility = 'hidden'
  for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$|Replay tour|Skip tour/.test(t)) el.style.visibility = 'hidden' }
  for (const el of document.querySelectorAll('img[alt*="App Store"],img[alt*="Google Play"]')) { let q = el; for (let i = 0; i < 3 && q.parentElement; i++) q = q.parentElement; q.style.visibility = 'hidden' }
})
const apply = (st) => p.evaluate(([st]) => { const s = window.__sonarState; s.camOverride = { ...st.cam, noLogo: true }; if (st.target) { s.target.x = st.target[0]; s.target.z = st.target[1] } }, [st])
const boatOnScreen = () => p.evaluate(() => { const s = window.__sonarState, cam = window.__camera; const v = new cam.position.constructor(s.boat.x, 0.2, s.boat.z).project(cam); return [+((v.x + 1) / 2 * 1600).toFixed(1), +((1 - v.y) / 2 * 900).toFixed(1)] })
if (mode === 'probe2') {
  const cands = { R1: { dx: 26, y: 9, dz: 14, lx: -4, ly: -9, lz: -2, fov: 40 }, R1m: { dx: 26, y: 9, dz: -14, lx: -4, ly: -9, lz: 2, fov: 40 }, R3: { dx: 30, y: 6, dz: 2, lx: -6, ly: -9, lz: 0, fov: 42 }, R3m: { dx: 30, y: 7, dz: -8, lx: -6, ly: -9, lz: 3, fov: 42 } }
  await p.evaluate(() => { const s = window.__sonarState; s.target.x = 33; s.target.z = 8 }); await p.waitForTimeout(4000)
  for (const [k, c] of Object.entries(cands)) { const x = 33; await apply({ cam: { pos: [x + c.dx, c.y, 8 + c.dz], look: [x + c.lx, c.ly, 8 + c.lz], fov: c.fov } }); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/probe-${k}.jpg`, type: 'jpeg', quality: 90 }); console.log(k, await boatOnScreen()) }
  await b.close(); process.exit(0)
}
const shot = mode === 'step1' ? (u) => step1(u) : async (u) => step2(u, await p.evaluate(() => window.__sonarState.boat.x))
await apply(await shot(0)); await p.waitForTimeout(2500)
if (mode === 'step1') await p.evaluate(() => window.__chase('largemouth'))
const log = []
await p.evaluate(() => window.__vtStart())
for (let i = 0; i < N; i++) {
  const u = i / (N - 1)
  await apply(await shot(u))
  await p.evaluate((ms) => window.__vtStep(ms), 1000 / FPS)
  await p.screenshot({ path: `${out}/f${String(i).padStart(3, '0')}.png` })
  log.push({ i, u: +u.toFixed(3), boat: await boatOnScreen() })
}
fs.writeFileSync(`${out}/frames.json`, JSON.stringify(log))
console.log(mode, N, 'frames →', out)
await b.close()
