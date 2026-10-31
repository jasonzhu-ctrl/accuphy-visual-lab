// White share (top LUT decile) and black share of the flat picture in seven named scenes, plus the flat PNGs.
// usage: PW_DIR=<dir with node_modules/playwright-core> node white.mjs <outdir> <base url, e.g. http://localhost:5173>
// Sets localStorage accuphy_sonar_signup_v1=1 so the subscribe lock (#191) does not stop the Combo picks.
import { createRequire } from 'node:module'
import fs from 'node:fs'
const { chromium } = createRequire((process.env.PW_DIR || process.cwd()) + '/')('playwright-core')
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const base = process.argv[3]
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] })
const runs = [
  ['pl-forward-default', { w: 1728, h: 1000 }, `${base}/?bigphone#2026-09-23-sonar-lake-3d`, ['Forward'], null],
  ['plm-combo-default', { w: 1728, h: 1000 }, `${base}/?bigphone#2026-09-23-sonar-lake-3d`, ['PingLive Mini', 'Combo'], null],
  ['plm-combo-hump', { w: 1728, h: 1000 }, `${base}/?bigphone#2026-09-23-sonar-lake-3d`, ['PingLive Mini', 'Combo'], [22, 8]],
  ['pl-pano-deep', { w: 1728, h: 1000 }, `${base}/?bigphone#2026-09-23-sonar-lake-3d`, ['Panoramic'], [4, -40]],
  ['pl-pano-lockup', { w: 1728, h: 1000 }, `${base}/?bigphone#2026-09-23-sonar-lake-3d`, ['Panoramic'], [-14, -52.5]],
  ['ice-forward', { w: 1728, h: 1000 }, `${base}/?scene=ice#2026-10-16-sonar-ice-3d`, ['Forward'], null],
  ['phone-pl-forward', { w: 375, h: 812 }, `${base}/#2026-09-23-sonar-lake-3d`, ['TILE:Forward View'], null],
]
const res = []
for (const [name, vp, url, clicks, boat] of runs) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.w < 500 ? 2 : 1, hasTouch: vp.w < 500 })
  const page = await ctx.newPage(); await page.addInitScript(() => { try { localStorage.setItem('accuphy_sonar_signup_v1', '1') } catch (e) {} }); const errs = []
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 150))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)) })
  await page.goto(url); await page.waitForFunction(() => window.__sonarState && window.__sonarSnap, null, { timeout: 90000 }); await page.waitForTimeout(3000)
  for (const c of clicks) {
    if (c.startsWith('TILE:')) await page.getByText(c.slice(5), { exact: true }).first().click()
    else await page.evaluate((l) => { const b = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === l); b && b.click() }, c)
    await page.waitForTimeout(1000)
  }
  if (boat) await page.evaluate(([x, z]) => { const s = window.__sonarState; s.boat.x = s.target.x = x; s.boat.z = s.target.z = z }, boat)
  await page.waitForTimeout(2500)
  const h = await page.evaluate(() => window.__sonarHist(10)); const st = await page.evaluate(() => ({ mode: window.__sonarState.mode, dev: window.__sonarState.deviceId }))
  const d = await page.evaluate(() => window.__sonarSnap(768, 384)); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(d.split(',')[1], 'base64'))
  const big = await page.evaluate(() => window.__sonarFlat(2048, 1024)); fs.writeFileSync(`${out}/${name}-big.png`, Buffer.from(big.split(',')[1], 'base64'))
  res.push({ name, ...st, black: +h.black.toFixed(3), white: h.hist[9], top3: +(h.hist[7] + h.hist[8] + h.hist[9]).toFixed(3), errs }); await ctx.close()
}
console.log(JSON.stringify(res, null, 1)); await browser.close()
