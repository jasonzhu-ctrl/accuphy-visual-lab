import { chromium } from 'playwright-core'
import fs from 'node:fs'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
const save = async (name) => { const url = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')); console.log(name) }
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 4000 })
const setRange = (v) => p.locator('input[type=range]').first().evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
const cam = async (c) => { await p.evaluate((c) => { window.__sonarState.camOverride = c }, c); await p.waitForTimeout(900) }
await p.goto('http://localhost:5173/?boat=16,11#2026-09-23-sonar-lake-3d'); await p.waitForTimeout(6000)
await p.evaluate(() => { const s = window.__sonarState; s.dragging = true; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.2 } })
// (1) opening: low, from the side (south, +z), the boat on the water, the Forward beam glowing below with fish in it
await click('PingLive'); await click('Forward'); await p.waitForTimeout(1500)
await p.evaluate(() => window.__chase('largemouth'))
for (const [k, c] of Object.entries({ f: { pos: [0, 9, 28], look: [24, -6, 8], fov: 44, noLogo: true } })) { await cam(c); await save('open-' + k) }
// (2) 135° landing: Panoramic 80 ft, the whole block in the lake from the side
await click('Panoramic'); await p.waitForTimeout(1500)
await p.evaluate(() => { window.__sonarState.adBeam = { line: 0.5, face: 0.16 } })
for (const [k, c] of Object.entries({ s3: { pos: [19, 36, 66], look: [23, -4, 6], fov: 46, noLogo: true } })) { await cam(c); await save('pano-' + k) }
await b.close()
