import { chromium } from 'playwright-core'
import fs from 'node:fs'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
const save = async (name, js) => { const url = await p.evaluate(js); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')) }
const click = (n) => p.getByRole('button', { name: n, exact: true }).first().click({ timeout: 4000 })
const setRange = (v) => p.locator('input[type=range]').first().evaluate((el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })) }, v)
await p.goto('http://localhost:5173/?boat=-40,-5#2026-09-23-sonar-lake-3d'); await p.waitForTimeout(6000)
await p.evaluate(() => { const s = window.__sonarState; s.dragging = true; s.hasDragged = true; s.adClean = true })
await click('PingLive'); await click('Forward'); await p.waitForTimeout(800); await setRange(70); await p.waitForTimeout(2000)
console.log(await p.evaluate(() => [window.__chase('largemouth'), window.__chase('smallmouth')].join(' / ')))
for (let i = 0; i < 6; i++) { await p.waitForTimeout(300); await save(`f${String(i).padStart(2, '0')}`, () => window.__sonarFlat(2600, 1250)) }
await b.close()
