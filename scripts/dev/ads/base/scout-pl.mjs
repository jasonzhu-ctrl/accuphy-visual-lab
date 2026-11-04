// Scouting boat positions for an ad (PingLive r1, 2026-11-04): per job, the lake still (__lakeSnap), the flat sonar picture (__sonarFlat),
// the depth read-out and __beamFish sampled for a few seconds. Jobs: [{ id, boat:[x,z], view, range, cam:{pos,look,fov}, fanOpen, secs, chase:[species] }].
// Run a copy from a folder whose parent links playwright-core. Dev hooks only (port 5192 = the frozen lake).
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [jobsFile, out, port = '5192'] = process.argv.slice(2)
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'))
fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal', '--enable-gpu-rasterization'] })
const res = []
for (const j of jobs) {
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 } }); const p = await ctx.newPage()
  p.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)))
  await p.goto(`http://localhost:${port}/?boat=${j.boat[0]},${j.boat[1]}&tour=off#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(7000)
  await p.evaluate((n) => { const el = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim() === n); el?.click() }, j.view || 'Forward'); await p.waitForTimeout(1500)
  if (j.range) await p.locator('input[type=range]').first().evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, j.range)
  await p.evaluate((j) => { const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.18 }; if (s.hintEl) s.hintEl.style.visibility = 'hidden'; if (j.cam) s.camOverride = { ...j.cam, noLogo: true }; if (j.fanOpen != null) s.fanOpen = j.fanOpen; for (const c of j.chase || []) window.__chase(c) }, j)
  const samples = []
  for (let k = 0; k < (j.secs || 5) * 2; k++) { await p.waitForTimeout(500); samples.push(await p.evaluate(() => window.__beamFish?.())) }
  const depth = await p.evaluate(() => window.__sonarState.depthEl?.textContent)
  const rng = await p.evaluate(() => [...document.querySelectorAll('input[type=range]')].map((e) => e.value).join('/'))
  const lake = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${j.id}-lake.png`, Buffer.from(lake.split(',')[1], 'base64'))
  const son = await p.evaluate(() => window.__sonarFlat(1040, 500)); fs.writeFileSync(`${out}/${j.id}-sonar.png`, Buffer.from(son.split(',')[1], 'base64'))
  // the active fan's corners on screen, to check it is in frame
  const fan = await p.evaluate(() => { const s = window.__sonarState, cam = window.__camera; const sp = s.specs[0]; if (!sp || !cam) return null
    const pts = []; const V = cam.position.constructor
    const R = sp.box ? Math.min(sp.R, sp.box.xMax * 1.05) : sp.R
    for (const a of [sp.a0, (sp.a0 + sp.a1) / 2, sp.a1]) { const c = sp.frame.c, h = sp.frame.h; const d = new V(c.x, c.y, c.z).multiplyScalar(Math.cos(a)).add(new V(h.x, h.y, h.z).multiplyScalar(Math.sin(a))).multiplyScalar(R); const w = d.add(s.apex); w.y = Math.max(w.y, -40); const v = w.clone().project(cam); pts.push([Math.round((v.x + 1) / 2 * 1080), Math.round((1 - v.y) / 2 * 1920)]) }
    const v = s.apex.clone().project(cam); pts.push([Math.round((v.x + 1) / 2 * 1080), Math.round((1 - v.y) / 2 * 1920)]); return pts })
  const r = { id: j.id, boat: j.boat, view: j.view, depth, range: rng, fish: samples.map((s) => (s || []).join('+')).join(' '), min: Math.min(...samples.map((s) => (s || [0]).reduce((a, b) => a + b, 0))), max: Math.max(...samples.map((s) => (s || [0]).reduce((a, b) => a + b, 0))), fan }
  console.log(JSON.stringify(r)); res.push(r)
  await ctx.close()
}
fs.writeFileSync(`${out}/scout.json`, JSON.stringify(res, null, 1))
await b.close()
