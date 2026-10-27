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
// beat 0: the sonar alone, Forward at the timber flat with a fish rising (and Panoramic, as briefed, to compare)
await click('PingLive'); await click('Forward'); await p.waitForTimeout(1500)
console.log(await p.evaluate(() => window.__chase('largemouth')))
await p.waitForTimeout(1600); await save('bg0-fwd', () => window.__sonarFlat(2600, 1250))
await click('Panoramic'); await p.waitForTimeout(1500); await save('bg0-pano', () => window.__sonarFlat(2600, 1250))
// beat 1: the lake, the Panoramic fan fully open (135°), from behind the boat
await p.evaluate(() => { window.__sonarState.camOverride = { pos: [-2, 22, 13], look: [30, 0, 11] }; window.__sonarState.fanOpen = 1 }); await p.waitForTimeout(1200)
await save('bg1-lake-pano', () => window.__lakeSnap())
// beat 2: Forward at 230 ft from the shelf; the beam up the right half
await p.evaluate(() => { const s = window.__sonarState; s.boat.x = s.target.x = -34; s.boat.z = s.target.z = 6 })
await click('Forward'); await p.waitForTimeout(800); await setRange(230); await p.waitForTimeout(2500)
for (const [k, c] of Object.entries({ f: { pos: [-10, 36, 6], look: [72, -30, 6] } })) {
  await p.evaluate((c) => { window.__sonarState.camOverride = c }, c); await p.waitForTimeout(900); await save('bg2-lake-fwd-' + k, () => window.__lakeSnap())
}
await save('bg3-fwd230', () => window.__sonarFlat(2600, 1250))
await b.close()
