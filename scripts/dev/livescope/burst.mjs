// Capture a burst of the engine's flat sonar picture (window.__sonarFlat 2048x1024), one frame per interval.
// usage: PW_DIR=<dir with node_modules/playwright-core> node burst.mjs <outdir> <full url> <comma-separated button labels> [n=20] [interval ms=1000]
// e.g.  node burst.mjs /tmp/wreck "http://localhost:5173/?boat=-6,4&study=wreck&gain=0.4&contrast=0.47&noise=0.25&depth=80#2026-09-23-sonar-lake-3d" Down 20 1000
import { createRequire } from 'node:module'
import fs from 'node:fs'
const { chromium } = createRequire((process.env.PW_DIR || process.cwd()) + '/')('playwright-core')
const [out, url, clicks, n = '20', iv = '1000'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 200))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
await page.goto(url)
await page.waitForFunction(() => window.__sonarState && window.__sonarFlat, null, { timeout: 90000 })
await page.waitForTimeout(6000)
for (const c of clicks.split(',').filter(Boolean)) { await page.evaluate((l) => { const b = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === l); b && b.click() }, c); await page.waitForTimeout(1500) }
await page.waitForTimeout(4000)
console.log(JSON.stringify(await page.evaluate(() => ({ tune: window.__sonarTune ?? null, mode: window.__sonarState.mode, dev: window.__sonarState.deviceId, depthM: +window.__sonarState.depthM.toFixed(2), rangeM: +window.__sonarState.rangeM.toFixed(2), hist: window.__sonarHist(10) }))))
for (let i = 0; i < +n; i++) { const d = await page.evaluate(() => window.__sonarFlat(2048, 1024)); fs.writeFileSync(`${out}/f${String(i).padStart(2, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')); await page.waitForTimeout(+iv) }
if (errs.length) console.log('ERRORS', JSON.stringify(errs))
await browser.close()
