// The PingLive ad film, r1 (HQ's script docs/2026-11-04-pinglive-ad-script.md; Jason 11-04 in Lab HQ: pinglive要比mini的更精彩 …
// 船的定位的位置特别重要). A copy of film-base.mjs for PingLive with its own passes and cameras; film-base.mjs is unchanged.
// Records one pass on the virtual clock of ../rec.mjs from the frozen lake served by "ad-lake-base" (port 5192,
// reference/ads/lake-base-96fdc22; PingLive is the default device there).
//   node film-pl.mjs <pass> <outDir> [port=5192] [fps=30]
// The beats come from beats-pl.json (BEATS=<file> to override). Passes:
//   lake    hook + drag  1080×1920 lake context (__lakeSnap). Hook: low behind the boat on the timber flat, the 135° Forward fan
//                        opens from a slit (fanOpen) while the camera cranes up and round to the side. Drag: the boat is dragged
//                        bow-first toward the island timber, the web's thin reticle rides with it, the camera follows so the whole
//                        Forward curtain stays in frame.
//   phone   Forward View on the phone at the drag's end point (phone layout 360×640 @3, page.screenshot): the phone slides up,
//           the camera pulls back and drifts round; out at the end
//   down    the small wreck: side view, the Down fan straight under the boat over the sunken workboat; then the phone with Down View
//   pano    the shelf: the camera climbs to almost top-down while the flat 135° Panoramic fan sweeps open; then the phone
//   reveal  Forward at the cargo ship, 140 ft: the camera pulls back and up to reveal the whole wreck in the curtain; the phone
//           with the ship for the last beat (cut to the end card)
// Every boat move is bow-first (+x): the hull never turns (#166), so the boat sits WEST of what each view looks at.
// Frames are named by the 30 fps frame number; frames.json logs the boat on screen, the depth read-out, the fish in the beam
// (__beamFish) and the active fan's corners on screen per frame (for the position sheet and the in-frame check).
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
const [pass, out, port = '5192', fpsArg = '30'] = process.argv.slice(2)
const FPS = +fpsArg
const B = JSON.parse(fs.readFileSync(process.env.BEATS || path.join(path.dirname(new URL(import.meta.url).pathname), 'beats-pl.json'), 'utf8'))
const SPAN = { lake: [B.hook[0], B.drag[1]], phone: B.phone, down: B.down, pano: B.pano, reveal: B.reveal }[pass]
if (!SPAN) throw new Error('pass: lake | phone | down | pano | reveal')
fs.mkdirSync(out, { recursive: true })
const clamp = (u) => Math.min(1, Math.max(0, u)), lerp = (a, b, u) => a + (b - a) * u, lerp3 = (a, b, u) => a.map((x, i) => lerp(x, b[i], u))
const smoother = (u) => u * u * u * (u * (u * 6 - 15) + 10), easeOut = (u) => 1 - (1 - u) ** 3, easeIn = (u) => u * u * u, easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)
const span = (t, a, b) => clamp((t - a) / (b - a))
const C = JSON.parse(process.env.CAMS || '{}') // per-pass overrides while fitting
const camLerp = (A, Z, u) => ({ pos: lerp3(A.pos, Z.pos, u), look: lerp3(A.look, Z.look, u), fov: lerp(A.fov, Z.fov, u) })
const add3 = (a, b) => a.map((x, i) => x + b[i])

// ---- boat positions (scouted 11-04 on the frozen lake; docs/2026-11-05-pinglive-ad-r1-positions.md) ----
const DRAG0 = C.drag0 || [0, 12], DRAG1 = C.drag1 || [14, 11]   // the timber flat, 31 → 21 ft; trees + bass in the Forward picture at the end
const WRECK_BOAT = C.wreckBoat || [14, -26]                      // the transducer (boat + 2.1 m) over the 10 m workboat (wreck.js SMALL_WRECK 16, −26), 64 ft
const PANO_BOAT = C.panoBoat || [-44, 6], PANO_RANGE = C.panoRange || 60 // the west shelf, 18 ft; the fan east over the crappie, bass, rock and timber
const SHIP_BOAT = C.shipBoat || [24, -46], SHIP_RANGE = C.shipRange || 140 // 30 m west of the cargo ship (BIG_WRECK 58, −47), 78 ft

// ---- cameras ----
// hook: low behind-left of the boat, the curtain's plane facing the camera more as it cranes up and round (the fan opening reads
// in its own plane); its look point is the drag camera's (boat + LOOK_AHEAD) so the drag starts from it without a jump
const LOOK_AHEAD = [7, -6, 3.5] // r1 fit: the whole hull (stern x ≥ 162) and the curtain's far end (x ≤ 1013) in frame from the hook's end through the drag
const H0 = C.h0 || { pos: [DRAG0[0] - 22, 6, DRAG0[1] + 12], look: add3([DRAG0[0], 0, DRAG0[1]], [6, -5, 0]), fov: 50 } // low and close behind-left: the hull big, the slit fan under it
const H1 = C.h1 || { pos: [DRAG0[0] - 17.9, 27.6, DRAG0[1] + 46.5], look: add3([DRAG0[0], 0, DRAG0[1]], LOOK_AHEAD), fov: 50 }  // craned up and round: the opened curtain's face (y 594–1188), 34° down (at 20° the sun's glitter washed the curtain out)
const F_OFF = C.fOff || [-22, 38, 52] // the drag camera's offset from its look point once it has risen (whole curtain + timber in frame)
const dragCam = (boat, u) => { const look = add3([boat[0], 0, boat[1]], LOOK_AHEAD); const off = lerp3(H1.pos.map((x, i) => x - H1.look[i]), F_OFF, u); return { pos: add3(look, off), look, fov: 50 } }
// The cameras below are fitted for the positions above (a grid search of three.js's projection, checked against the recorder's
// own log): in a phone beat the boat and its beam sit in the strip y 645–745 between the caption and the phone (top ~755);
// lake-only moments keep them inside the Reels band (269–1248) below the caption (~620).
// phone: from the drag's end camera up to a high one; a slow drift to the right while the phone is up
const BACK = C.back || { pos: [16.4, 131.7, 120.9], look: [23.8, -4, 36.4], fov: 48 }
const BACK2 = C.back2 || { pos: [26, 131.1, 122.2], look: [26, -4, 36.5], fov: 48 }
// down: the Down fan lies along the keel (±28 m at the 90 ft AUTO range). Close on the boat with the workboat 64 ft under it → back
// and up until the whole fan is in frame (its ends at x 23 / 1000) → up for the phone
const D0 = C.d0 || { pos: [4.1, 28.6, 18.4], look: [16, -10, -26], fov: 50 }
const D1 = C.d1 || { pos: [-19.5, 50, 71.7], look: [16, -10, -26], fov: 46 }
const D2 = C.d2 || { pos: [16, 171.3, 88.5], look: [16, -10, 4], fov: 48 }
// pano: low behind the boat (the flat fan a sliver ahead) → almost straight down, the bow up the screen as the phone draws Panoramic
// (boat ~y 1156, the fan's far edge ~650, its sides x 119–945) → up and round to the south-west for the phone (fan y ~600–748)
const P0 = C.p0 || { pos: [-61.2, 8.8, 19.9], look: [-38, -2, 6.5], fov: 54 }
const P1 = C.p1 || { pos: [-48.1, 66.9, 6], look: [-36, -2, 6.4], fov: 58 }
const P2 = C.p2 || { pos: [-130.5, 72.6, 103], look: [-55.2, -2, 27.7], fov: 48 } // swung round to the south-west and up; kept over the modelled terrain (a camera further west showed its streaky edge)
// reveal: close and low over the ship's stern quarter → back and up, the boat (x ~130) and the whole ship inside the 140 ft curtain → up
const R0 = C.r0 || { pos: [SHIP_BOAT[0] + 22, 9, SHIP_BOAT[1] + 18], look: [SHIP_BOAT[0] + 32, -14, SHIP_BOAT[1]], fov: 50 }
const R1 = C.r1 || { pos: [3.6, 43, 44.9], look: [43.9, -12, -41.5], fov: 50 }
const R2 = C.r2 || { pos: [46, 258.5, 66.5], look: [46, -12, -6], fov: 48 }

// the phone frame: below the screen → its bottom at y 1240 of 1920 (inside the Reels band 269–1248). Its resting place differs per view,
// so the lift is measured from the frame itself once the view is up (LIFT set below); film-base.mjs used a fixed −215 / 720
const LIFT = { off: 720, up: -215 }, PHONE_BOTTOM = 1240 / 3
const phoneLift = (t, a, b, outT) => lerp(LIFT.off, LIFT.up, easeOut(span(t, a, b))) + (outT ? lerp(0, 900, easeIn(span(t, outT, outT + 0.5))) : 0)
const [h0, h1] = B.hook, [d0, d1] = B.drag, [p0, p1] = B.phone, [q0, q1] = B.down, [r0, r1] = B.pano, [v0, v1] = B.reveal
const shot = {
  lake: (t, s) => {
    // the fan opens while the voice says "one hundred thirty-five degrees" (take 1: 2.2–3.3 s)
    if (t < d0) return { cam: camLerp(H0, H1, smoother(span(t, h0, d0))), fanOpen: lerp(0.03, 1, easeOut(span(t, h0 + 1.6, h0 + 3.4))), target: DRAG0, cue: false }
    return { cam: dragCam(s.boat || DRAG0, smoother(span(t, d0, d0 + 3.2))), target: lerp3(DRAG0, DRAG1, Math.sin(span(t, d0 + 0.35, d0 + 3.3) * Math.PI / 2)), fanOpen: 1, cue: true }
  },
  phone: (t) => { const A = dragCam(DRAG1, 1); const u = easeOut(span(t, p0 + 0.05, p0 + 1.0))
    return { cam: u < 1 ? camLerp(A, BACK, u) : camLerp(BACK, BACK2, easeInOut(span(t, p0 + 1.0, p1))), lift: phoneLift(t, p0 + 0.1, p0 + 0.75, p1 - 0.5) } },
  down: (t) => { const tp = q0 + 2.3
    return { cam: t < tp ? camLerp(D0, D1, smoother(span(t, q0, tp))) : camLerp(D1, D2, easeInOut(span(t, tp, tp + 0.9))), lift: phoneLift(t, tp + 0.15, tp + 0.8, q1 - 0.5) } },
  pano: (t) => { const tp = r0 + 3.0
    return { cam: t < tp ? camLerp(P0, P1, easeInOut(span(t, r0, tp))) : camLerp(P1, P2, easeInOut(span(t, tp, tp + 0.9))), fanOpen: lerp(0.04, 1, easeOut(span(t, r0 + 0.35, r0 + 2.0))), lift: phoneLift(t, tp + 0.15, tp + 0.8, r1 - 0.5) } },
  reveal: (t) => { const tp = v1 - 1.45
    return { cam: t < tp ? camLerp(R0, R1, easeInOut(span(t, v0, tp))) : camLerp(R1, R2, easeInOut(span(t, tp, tp + 0.8))), lift: phoneLift(t, tp + 0.1, tp + 0.7) } },
}[pass]
// fish brought up into the beam (the Lab's own dev hook, as the Mini film): a nearby fish of that species rises to the boat
const calls = { lake: [[h0 + 0.3, 'largemouth'], [d0 + 1.0, 'largemouth'], [d0 + 2.6, 'smallmouth'], [d0 + 3.4, 'largemouth'], [d0 + 3.8, 'smallmouth']], phone: [[p0 + 0.3, 'largemouth'], [p0 + 2.0, 'smallmouth']], down: [[q0 + 0.2, 'laketrout'], [q0 + 1.6, 'largemouth']], pano: [[r0 + 0.3, 'largemouth']], reveal: [[v0 + 0.2, 'laketrout'], [v0 + 1.8, 'laketrout']] }[pass]
const VIEW = { lake: 'Forward', phone: 'Forward View', down: 'Down View', pano: 'Panoramic View', reveal: 'Forward View' }[pass]
const BOAT0 = { lake: DRAG0, phone: DRAG1, down: WRECK_BOAT, pano: PANO_BOAT, reveal: SHIP_BOAT }[pass]
const RANGE = { pano: PANO_RANGE, reveal: SHIP_RANGE }[pass]

// ---- the page ----
const phone = pass !== 'lake'
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
await p.goto(`http://localhost:${port}/?boat=${BOAT0[0]},${BOAT0[1]}&tour=off#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(7000)
const click = async (n) => { // phone layout: the Home tiles; desktop: the panel's view buttons (PingLive is the default device)
  const l = p.getByRole('button', { name: n, exact: true })
  if ((await l.count()) && (await l.first().isVisible())) return l.first().click({ timeout: 4000 })
  const ok = await p.evaluate((n) => { const el = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim() === n); if (el) el.click(); return !!el }, n)
  if (!ok) console.log('no button', n)
}
await click(VIEW); await p.waitForTimeout(2500)
const shop = await p.evaluate(() => [...document.querySelectorAll('button,a')].map((e) => (e.textContent || '').trim()).find((x) => /^Shop PingLive/.test(x)))
if (!/^Shop PingLive$/.test(shop || '')) throw new Error(`not on PingLive: ${shop}`) // the phone's "Live …" tiles are the Mini's
const setRange = (i, v) => p.locator('input[type=range]').nth(i).evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
if (RANGE) { await setRange(0, RANGE); await p.waitForTimeout(1500) }
await p.evaluate(([phone]) => {
  const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.18 }
  if (s.hintEl) s.hintEl.style.visibility = 'hidden'
  if (phone) { // only the lake and the phone (as film-base.mjs); the phone frame is moved per frame through #__lift
    const fr = document.querySelector('[data-hint-avoid][style*="aspect-ratio"]')
    for (let el = fr; el.parentElement && el !== document.body; el = el.parentElement)
      for (const sib of el.parentElement.children) if (sib !== el && sib.tagName !== 'CANVAS' && !sib.querySelector('canvas')) sib.style.visibility = 'hidden'
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$|Replay tour|Learn More|Share to a|Back to the lake/.test(t)) el.style.visibility = 'hidden' }
    const st = document.createElement('style'); st.id = '__lift'; document.head.appendChild(st)
  }
}, [phone])
if (phone) { const r = await p.evaluate(() => { const b = document.querySelector('[data-hint-avoid][style*="aspect-ratio"]').getBoundingClientRect(); return [b.top, b.bottom] }); LIFT.up = PHONE_BOTTOM - r[1]; LIFT.off = 650 - r[0]; console.log('phone frame', r.map((x) => Math.round(x * 3)), 'lift', LIFT) }
let cueOn = null
const apply = async (t) => {
  const boat = pass === 'lake' ? await p.evaluate(() => [window.__sonarState.boat.x, window.__sonarState.boat.z]) : null // the drag camera follows the boat
  const st = shot(t, { boat })
  await p.evaluate(([st, cueChange]) => {
    const s = window.__sonarState
    s.camOverride = { ...st.cam, noLogo: true }
    if (st.target) { s.target.x = st.target[0]; s.target.z = st.target[1] }
    if (st.fanOpen != null) s.fanOpen = st.fanOpen
    if (cueChange) { if (st.cue) { s.adClean = false; s.adCueKeep = true } else { s.adClean = true; s.adCueKeep = false } } // r17: the web's thin reticle rides with the boat on the drag only (adCueKeep alone keeps it; s.dragging is left off: it pauses the beam's fish, test 1 went 9 → 1)
    if (st.lift != null) document.getElementById('__lift').textContent = `[data-hint-avoid][style*="aspect-ratio"]{transform:translateY(${st.lift}px)}`
  }, [st, st.cue !== undefined && st.cue !== cueOn])
  if (st.cue !== undefined) cueOn = st.cue
  return st
}
await apply(SPAN[0]); await p.waitForTimeout(1500)
const N = Math.round((SPAN[1] - SPAN[0]) * FPS), log = []
await p.evaluate(() => window.__vtStart())
for (let i = 0; i < N; i++) {
  const t = SPAN[0] + i / FPS
  const st = await apply(t)
  for (const c of calls) if (!c.done && t >= c[0]) { const r = await p.evaluate((sp) => { try { const r = window.__chase(sp); return typeof r === 'object' ? 'ok' : String(r) } catch (e) { return 'ERR ' + e.message } }, c[1]); c.tries = (c.tries || 0) + 1; if (/ok|rising|coming/.test(r) || c.tries >= 8) c.done = true; console.log(t.toFixed(2), '__chase', c[1], r) } // (the lake's Down view throws inside forceRise for some fish: logged, not fatal)
  await p.evaluate((ms) => window.__vtStep(ms), 1000 / FPS)
  const name = `f${String(Math.round(t * 30)).padStart(5, '0')}`
  if (phone) await p.screenshot({ path: `${out}/${name}.png`, timeout: 60000 })
  else { const url = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')) }
  const info = await p.evaluate(([W, H, D0, D1]) => {
    const s = window.__sonarState, cam = window.__camera, V = cam?.position.constructor
    const scr = (x, y, z) => { const v = new V(x, y, z).project(cam); return [+((v.x + 1) / 2 * W).toFixed(1), +((1 - v.y) / 2 * H).toFixed(1)] }
    const boat = cam && s.boat ? scr(s.boat.x, 0.2, s.boat.z) : null
    // the active fan's outline on screen: apex, both edges and the middle at the fan's reach (clipped to its box), for the in-frame check
    let fan = null
    if (cam && s.specs?.length) {
      fan = []
      for (const sp of s.specs) {
        const c = sp.frame.c, h = sp.frame.h, half = (sp.a1 - sp.a0) / 2 * (s.fanOpen ?? 1), m = (sp.a0 + sp.a1) / 2
        for (const a of [m - half, m, m + half]) {
          let d = new V(c.x, c.y, c.z).multiplyScalar(Math.cos(a)).add(new V(h.x, h.y, h.z).multiplyScalar(Math.sin(a))), r = sp.R
          if (sp.box) { const bx = d.x > 1e-6 ? sp.box.xMax / d.x : d.x < -1e-6 ? sp.box.xMin / d.x : Infinity, by = d.y < -1e-6 ? sp.box.yMax / -d.y : Infinity, bz = sp.box.zMax && Math.abs(d.z) > 1e-6 ? sp.box.zMax / Math.abs(d.z) : Infinity; r = Math.min(r, bx, by, bz) }
          fan.push(scr(s.apex.x + d.x * r, Math.max(s.apex.y + d.y * r, -60), s.apex.z + d.z * r))
        }
      }
      fan.push(scr(s.apex.x, s.apex.y, s.apex.z))
    }
    const bf = window.__beamFish ? window.__beamFish() : null
    return { depth: s.depthEl?.textContent || null, boat, fan, fish: bf, bx: s.boat ? +s.boat.x.toFixed(2) : null, bz: s.boat ? +s.boat.z.toFixed(2) : null, prog: s.boat ? +((s.boat.x - D0) / (D1 - D0)).toFixed(4) : null, fanOpen: s.fanOpen ?? null }
  }, [1080, 1920, DRAG0[0], DRAG1[0]])
  log.push({ name, t: +t.toFixed(4), pass, lift: st.lift ?? null, cue: st.cue ?? null, ...info })
  if (i % 30 === 0) console.log(pass, name, t.toFixed(2), info.depth || '', 'fish', JSON.stringify(info.fish), info.boat ? `boat ${info.boat}` : '')
}
fs.writeFileSync(`${out}/frames.json`, JSON.stringify(log))
await b.close()
