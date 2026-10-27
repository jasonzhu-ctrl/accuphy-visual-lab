import { chromium } from 'playwright-core'
import fs from 'node:fs'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
const save = async (name, js) => { const url = await p.evaluate(js); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')); console.log(name) }
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 4000 })
const setRange = (v) => p.locator('input[type=range]').first().evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
await p.goto('http://localhost:5173/?boat=16,11#2026-09-23-sonar-lake-3d'); await p.waitForTimeout(6000)
await p.evaluate(() => { const s = window.__sonarState; s.dragging = true; s.hasDragged = true; s.adClean = true })
await click('PingLive'); await click('Panoramic'); await p.waitForTimeout(800); await setRange(50); await p.waitForTimeout(1500)
for (const [k, c] of Object.entries({ g: { pos: [-4, 64, 11], look: [36, -2, 11], fov: 42 } })) {
  await p.evaluate((c) => { window.__sonarState.camOverride = c; window.__sonarState.adBeam = { line: 0, face: 0.06 } }, c); await p.waitForTimeout(900)
  await save('pano-' + k, () => window.__lakeSnap())
  // the fan on the water: apex at the transducer, edges at ±67.5° out to the range, the arc between — projected to the screen
  const pts = await p.evaluate(() => {
    const s = window.__sonarState, cam = window.__camera, V = cam.position.constructor
    const R = s.rangeM, ax = s.apex.x, az = s.apex.z, h = (135 / 2) * Math.PI / 180, W = 1080, H = 1920
    const pr = (x, z) => { const v = new V(x, 0.05, z).project(cam); return [+((v.x + 1) / 2 * W).toFixed(1), +((1 - v.y) / 2 * H).toFixed(1)] }
    const arc = []; for (let i = 0; i <= 48; i++) { const a = -h + (2 * h * i) / 48; arc.push(pr(ax + R * Math.cos(a), az + R * Math.sin(a))) }
    return { apex: pr(ax, az), arc }
  })
  fs.writeFileSync(`${out}/pano-${k}.json`, JSON.stringify(pts)); console.log(k, JSON.stringify(pts.apex), JSON.stringify(pts.arc[0]), JSON.stringify(pts.arc[48]))
}
await p.evaluate(() => { const s = window.__sonarState; s.boat.x = s.target.x = -34; s.boat.z = s.target.z = 6 })
await click('Forward'); await p.waitForTimeout(800); await setRange(230); await p.waitForTimeout(2500)
await p.evaluate(() => { window.__sonarState.camOverride = { pos: [-46, 13, 6], look: [14, -6, 6], fov: 46 }; window.__sonarState.adBeam = { line: 0, face: 0 } })
if (!process.env.SKIPFWD) for (const [m, flash] of [['off', [0, 30, 60]], ['on', [4.5, 36, 62]]]) { await p.evaluate((f) => { window.__sonarState.adFlash = f }, flash); await p.waitForTimeout(700); await save('fwd-' + m, () => window.__lakeSnap()) }
await b.close()
