import { chromium } from 'playwright-core'
import fs from 'node:fs'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
const save = async (name, js) => { const url = await p.evaluate(js); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')); console.log(name) }
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 4000 })
const setInput = (i, v) => p.locator('input[type=range]').nth(i).evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
await p.goto(`http://localhost:5173/?boat=-34,6${process.env.DEPTH ? '&depth=' + process.env.DEPTH : ''}#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(6000)
await p.evaluate(() => { const s = window.__sonarState; s.dragging = true; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0, face: 0 } })
await click('PingLive'); await click('Forward'); await p.waitForTimeout(800); await setInput(0, 230); await p.waitForTimeout(1500)
console.log('inputs', await p.locator('input[type=range]').count(), 'depth', await p.evaluate(() => window.__sonarState.depthM.toFixed(1)))
for (const d of [process.env.DEPTH || null]) {
  for (const [k, c] of Object.entries({ g: { pos: [-46, 13, 6], look: [14, -8, 6], fov: 46 } })) {
    await p.evaluate((c) => { window.__sonarState.camOverride = c; window.__sonarState.adFlash = [0, 30, 60] }, c); await p.waitForTimeout(800)
    await save(`d${d || 'auto'}-${k}-off`, () => window.__lakeSnap())
    await p.evaluate(() => { window.__sonarState.adFlash = [2.6, 36, 62] }); await p.waitForTimeout(500)
    await save(`d${d || 'auto'}-${k}-on`, () => window.__lakeSnap())
  }
}
await b.close()
