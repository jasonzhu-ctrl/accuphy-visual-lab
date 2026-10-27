import { chromium } from 'playwright-core'
import fs from 'node:fs'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const p = await (await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })).newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto('http://localhost:5173/?boat=-22.9,-47.2#2026-09-23-sonar-lake-3d'); await p.waitForTimeout(6000)
await p.getByRole('button', { name: process.env.TILE || 'Down View', exact: true }).first().click({ timeout: 4000 }); await p.waitForTimeout(2500)
await p.evaluate(() => {
  const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.16 }
  for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$/.test(t) || /^Shop /.test(t)) el.style.visibility = 'hidden' }
  if (s.hintEl) s.hintEl.style.visibility = 'hidden'
  s.jigDrop = { y0: -29.2 }
})
const cams = { c: { pos: [-40, 14, -30], look: [-21, -1, -46], fov: 46, noLogo: true }, d: { pos: [-42, 16, -28], look: [-21, 1, -47], fov: 48, noLogo: true } }
for (const [k, c] of Object.entries(cams)) {
  await p.evaluate((c) => { const s = window.__sonarState; s.camOverride = c; s.jigYw = -29.2; s.jigTrail = -29.0 }, c)
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); if ((await p.evaluate(() => window.__sonarState.jigYw)) <= -30.4) break }
  console.log(k, JSON.stringify(await p.evaluate(() => ({ jig: +(-window.__sonarState.jigYw / 0.3048).toFixed(0), depth: window.__sonarState.depthEl?.textContent }))))
  await p.screenshot({ path: `${out}/jig-${k}.png` })
}
await b.close()
