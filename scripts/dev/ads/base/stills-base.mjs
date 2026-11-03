// Base ad stills (2026-11-03, brief docs/2026-11-03-ad-base-brief.md): raw frames from the standard Base 86bf80e
// ("ad-lake-base", port 5192, a clean git archive). Round 1 ran it Mini-only (VITE_DEVICES=PLM in the checkout's .env.local,
// like /mini/); that file was removed for the storyboard (script-shots.mjs), so set it again before re-running this.
// usage: node stills-base.mjs <outDir> <shot> [port=5192]; shot = open | combo | wide | tour | deep | desk
// env CAM='{"pos":[..],"look":[..],"fov":..}' overrides a lake camera; BOAT='x,z' the boat; WAIT=ms before the shot
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [out, shot, port = 5192] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const phone = shot === 'tour' || shot === 'deep', desk = shot === 'desk'
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const ctx = await b.newContext(phone ? { viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : desk ? { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } : { viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
const p = await ctx.newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)))
const BOAT = process.env.BOAT || { deep: '-25,-47.2', tour: '16,11' }[shot] || '16,11'
await p.goto(`http://localhost:${port}/?boat=${BOAT}&tour=${shot === 'tour' ? 1 : 'off'}#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(7000)
const click = async (...names) => { for (const n of names) { const l = p.getByRole('button', { name: n, exact: true }); if (await l.count()) { await l.first().click({ timeout: 4000 }); return n } } console.log('no button', names) }
const cam = (c) => p.evaluate((c) => { window.__sonarState.camOverride = { ...c, noLogo: true } }, c)
const ENV_CAM = process.env.CAM ? JSON.parse(process.env.CAM) : null
const lake = async (name) => { const url = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')); console.log(name) }
// the server runs the Mini-only build of 86bf80e (VITE_DEVICES=PLM in the checkout's .env.local, like /mini/), so no device switch
if (shot === 'open' || shot === 'combo' || shot === 'wide') {
  await click(shot === 'open' ? 'Forward' : 'Combo'); await p.waitForTimeout(2000)
  await p.evaluate((sh) => { const s = window.__sonarState; s.dragging = true; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: sh === 'open' ? 0.2 : 0.16 }; if (sh !== 'open') s.fanOpen = 1 }, shot)
  await p.evaluate(() => window.__chase('largemouth'))
  await cam(ENV_CAM || { open: { pos: [-2, 26, 60], look: [28, -6, 8], fov: 48 }, combo: { pos: [19, 22, 58], look: [19, -1, 11], fov: 44 }, wide: { pos: [-40, 95, 150], look: [10, -10, 0], fov: 48 } }[shot])
  await p.waitForTimeout(+(process.env.WAIT || 2500)); await lake(shot)
} else if (shot === 'deep') {
  // Jason 11-03: the phone must not cover the beam. The phone is lifted 215 CSS px (y 748–1233 of 1920, real size) and the
  // camera looks almost straight down, so the boat (~y 400) and the whole Down beam (to ~y 710) sit between the line and
  // the phone. The page's other buttons are hidden (the tour shot shows them).
  await click('Live Down', 'Down'); await p.waitForTimeout(2500)
  await p.evaluate(() => {
    const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.16 }; if (s.hintEl) s.hintEl.style.visibility = 'hidden'
    for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$|Replay tour|Learn More|Share to a/.test(t)) el.style.visibility = 'hidden' }
    const st = document.createElement('style'); st.textContent = '[data-hint-avoid][style*="aspect-ratio"]{transform:translateY(-215px)}'; document.head.appendChild(st)
  })
  const bx = await p.evaluate(() => window.__sonarState.boat.x)
  const C = ENV_CAM || { dx: 0, py: 100, pz: -16, ly: -10, lz: -26, fov: 42 }
  await cam({ pos: [bx + C.dx, C.py, C.pz], look: [bx + C.dx, C.ly, C.lz], fov: C.fov })
  await p.waitForTimeout(+(process.env.WAIT || 4000))
  console.log(await p.evaluate(() => window.__sonarState.depthEl?.textContent))
  await p.screenshot({ path: `${out}/deep.png` })
} else if (shot === 'tour') {
  await p.waitForTimeout(+(process.env.WAIT || 2500)); await p.screenshot({ path: `${out}/tour.png` })
} else if (shot === 'desk') {
  await click('Combo'); await p.waitForTimeout(+(process.env.WAIT || 4000)); await p.screenshot({ path: `${out}/desk.png` })
}
await b.close()
