// Frame-exact screen recordings of the Lab for ads: the page runs on a virtual clock (rAF, performance.now and Date.now
// are stepped 1/30 s per frame), a finger dot shows each touch, every frame is a JPEG. usage:
//   node rec.mjs <clip: ice|boat|mini> 916 <outDir> [seconds=15]   (record 9:16 only: at 4:5 the page lays out wide and
//   the boat sits at the edge; to45.py makes the 4:5 frames from the 9:16 ones)
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [clip, aspect, out, secs = '15'] = process.argv.slice(2)
const FPS = 30, N = Math.round(+secs * FPS)
const VP = aspect === '45' ? { width: 432, height: 540, deviceScaleFactor: 2.5 } : { width: 360, height: 640, deviceScaleFactor: 3 }
const URL = clip === 'ice' ? 'http://localhost:5173/#2026-10-16-sonar-ice-3d' : 'http://localhost:5173/#2026-09-23-sonar-lake-3d'
fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal', '--enable-gpu-rasterization'] })
const ctx = await b.newContext({ viewport: { width: VP.width, height: VP.height }, deviceScaleFactor: VP.deviceScaleFactor, isMobile: true, hasTouch: true })
await ctx.addInitScript(() => {
  const realNow = performance.now.bind(performance), realDate = Date.now, raf = window.requestAnimationFrame.bind(window)
  const V = (window.__vt = { on: false, t: 0, d0: 0, q: [] })
  performance.now = () => (V.on ? V.t : realNow())
  Date.now = () => (V.on ? V.d0 + V.t : realDate())
  window.requestAnimationFrame = (cb) => { if (V.on) { V.q.push(cb); return V.q.length } return raf(cb) }
  window.__vtStart = () => { V.t = realNow(); V.d0 = realDate() - V.t; V.on = true }
  window.__vtStep = (ms) => { V.t += ms; const q = V.q.splice(0); for (const cb of q) { try { cb(V.t) } catch (e) { console.error(e) } } return q.length }
})
const page = await ctx.newPage()
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)))
page.on('console', (m) => { if (m.type() === 'error') console.log('[err]', m.text().slice(0, 300)) })
await page.goto(URL, { waitUntil: 'load' }); await page.waitForTimeout(7000)
const cdp = await ctx.newCDPSession(page)
// recording chrome: no "← Lab" back button, no cue caption (the ad carries its own subtitle); a finger dot
await page.evaluate(() => {
  for (const el of document.querySelectorAll('a,button')) if (/^\s*←?\s*Lab\s*$/.test(el.textContent || '')) el.style.visibility = 'hidden'
  if (window.__sonarState?.hintEl) window.__sonarState.hintEl.style.visibility = 'hidden'
  const f = document.createElement('div'); f.id = '__finger'
  Object.assign(f.style, { position: 'fixed', left: '0', top: '0', width: '46px', height: '46px', marginLeft: '-23px', marginTop: '-23px', borderRadius: '50%', background: 'rgba(255,255,255,0.32)', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 10px rgba(0,0,0,0.35)', zIndex: 99999, pointerEvents: 'none', opacity: '0', transition: 'none' })
  document.body.appendChild(f)
})
const finger = (x, y, o, down) => page.evaluate(([x, y, o, d]) => { let f = document.getElementById('__finger'); if (!f) { f = document.createElement('div'); f.id = '__finger'; Object.assign(f.style, { position: 'fixed', width: '46px', height: '46px', marginLeft: '-23px', marginTop: '-23px', borderRadius: '50%', background: 'rgba(255,255,255,0.32)', border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 10px rgba(0,0,0,0.35)', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(f); console.error('finger re-added') } f.style.left = x + 'px'; f.style.top = y + 'px'; f.style.opacity = String(o); f.style.transform = `scale(${d ? 0.82 : 1})` }, [x, y, o, down])
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1, radiusX: 8, radiusY: 8 }] })
const tapEl = async (label) => { const l = page.getByRole('button', { name: label, exact: true }).first(); await l.click({ timeout: 5000 }) }
const ease = (u) => u * u * (3 - 2 * u)
const W = VP.width, H = VP.height
// where the boat is on screen before the first drag: the (hidden) cue caption sits just above it
const boatAt = async () => page.evaluate(() => { const r = window.__sonarState.hintEl.getBoundingClientRect(); return [r.left + r.width / 2, r.bottom + 34] })

// ---- the choreography: a list of { t0, t1, fn(u) } per clip, in seconds; plus calls at given times ----
let track = [], calls = []
if (clip === 'boat' || clip === 'mini') {
  await tapEl(clip === 'boat' ? 'Panoramic View' : 'Live Forward'); await page.waitForTimeout(2500)
  // a shorter range so the fish read larger on the small phone screen (their true size is unchanged, #170): 80 → 60 ft
  // Panoramic, 80 → 50 ft Live Forward
  for (let k = 0; k < (clip === 'boat' ? 2 : 3); k++) { await tapEl('Range shorter'); await page.waitForTimeout(300) }
  await page.waitForTimeout(2000)
  await page.evaluate(() => { if (window.__sonarState?.hintEl) window.__sonarState.hintEl.style.visibility = 'hidden' })
  const [bx, by] = await boatAt()
  const p1 = [bx + W * 0.12, by], p2 = [p1[0] + W * 0.09, p1[1] - H * 0.015] // short drags, bow first (the hull points +x)
  track = [
    { t0: 0.0, t1: 0.35, fn: (u) => ({ x: bx, y: by, o: u, d: false }) },
    { t0: 0.35, t1: 0.45, fn: () => ({ x: bx, y: by, o: 1, d: true, ev: 'start' }) },
    { t0: 0.45, t1: 2.2, fn: (u) => ({ x: bx + (p1[0] - bx) * ease(u), y: by + (p1[1] - by) * ease(u), o: 1, d: true, ev: 'move' }) },
    { t0: 2.2, t1: 2.3, fn: () => ({ x: p1[0], y: p1[1], o: 1, d: false, ev: 'end' }) },
    { t0: 2.3, t1: 2.7, fn: (u) => ({ x: p1[0], y: p1[1], o: 1 - u, d: false }) },
    { t0: 7.6, t1: 7.9, fn: (u) => ({ x: p1[0], y: p1[1], o: u, d: false }) },
    { t0: 7.9, t1: 8.0, fn: () => ({ x: p1[0], y: p1[1], o: 1, d: true, ev: 'start' }) },
    { t0: 8.0, t1: 9.6, fn: (u) => ({ x: p1[0] + (p2[0] - p1[0]) * ease(u), y: p1[1] + (p2[1] - p1[1]) * ease(u), o: 1, d: true, ev: 'move' }) },
    { t0: 9.6, t1: 9.7, fn: () => ({ x: p2[0], y: p2[1], o: 1, d: false, ev: 'end' }) },
    { t0: 9.7, t1: 10.1, fn: (u) => ({ x: p2[0], y: p2[1], o: 1 - u, d: false }) },
  ]
  calls = [[2.3, '__chase', 'largemouth'], [5.0, '__chase', 'smallmouth'], [9.8, '__chase', 'largemouth'], [11.5, '__chase', 'pike']]
} else {
  const [hx, hy] = await page.evaluate(() => { const a = window.__sonarState.hintAnchor; const r = window.__sonarState.hintEl.getBoundingClientRect(); return [r.left + r.width / 2, r.top - 18] })
  // a fish is already on its way to the lure when the clip starts (lit from the first second)
  for (let k = 0; k < 12; k++) { const r = await page.evaluate(() => window.__jig()); console.log('pre', r); if (/coming/.test(r)) break; await page.waitForTimeout(500) }
  await page.waitForTimeout(2200)
  const tx = hx + W * 0.30, ty = hy + H * 0.012 // the new hole: open ice right of the camp
  track = [
    { t0: 0.5, t1: 0.85, fn: (u) => ({ x: tx, y: ty, o: u, d: false }) },
    { t0: 0.85, t1: 1.05, fn: () => ({ x: tx, y: ty, o: 1, d: true, ev: 'start' }) },
    { t0: 1.05, t1: 1.15, fn: () => ({ x: tx, y: ty, o: 1, d: false, ev: 'end' }) },
    { t0: 1.15, t1: 1.55, fn: (u) => ({ x: tx, y: ty, o: 1 - u, d: false }) },
  ]
  calls = [[5.2, '__jig'], [10.5, '__jig']]
}
await page.evaluate(() => window.__vtStart())
const fired = new Set(); let lastEv = null
for (let i = 0; i < N; i++) {
  const t = i / FPS
  const seg = track.find((s) => t >= s.t0 && t < s.t1)
  if (seg) {
    const u = Math.min(1, (t - seg.t0) / Math.max(1e-6, seg.t1 - seg.t0)), r = seg.fn(u)
    await finger(r.x, r.y, r.o, r.d)
    const key = seg.t0 + r.ev
    if (r.ev === 'start' && !fired.has(key)) { await touch('touchStart', r.x, r.y); fired.add(key) }
    else if (r.ev === 'move') await touch('touchMove', r.x, r.y)
    else if (r.ev === 'end' && !fired.has(key)) { await touch('touchEnd', r.x, r.y); fired.add(key) }
  } else await finger(0, 0, 0, false)
  for (const c of calls) {
    const [ct, fn, arg] = c
    if (c.done || t < ct || (c.next && t < c.next)) continue
    const r = await page.evaluate(([f, a]) => { try { const r = window[f]?.(a); return typeof r === 'object' ? 'ok' : String(r) } catch (e) { return 'ERR ' + e.message } }, [fn, arg])
    c.tries = (c.tries || 0) + 1; c.next = t + 0.5
    if (/coming|rising/.test(r) || c.tries >= 8) c.done = true
    console.log(t.toFixed(2), fn, arg || '', r)
  }
  await page.evaluate(() => window.__vtStep(1000 / 30))
  for (let k = 0; ; k++) { try { await page.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 94, timeout: 60000 }); break } catch (e) { if (k >= 2) throw e; console.log('screenshot retry', i) } }
  if (i % 90 === 0) console.log('frame', i)
}
await b.close()
