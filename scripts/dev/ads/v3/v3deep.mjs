// The deep-water beat (#174): PingLive (Down by default; the still uses Forward) over the 110 ft hole, the lake trout at ~92–100 ft on the phone, no jig.
// Phone layout (360×640 @3) with the page's own phone screen; the other page buttons hidden. Takes N frames a second
// apart and logs the depth read-out and the trout's depths, so the best moment can be picked.
// usage: node v3deep.mjs <outDir> [port=5173] [frames=8]; env TILE='Forward View', BOAT='x,z', CAM='{"dx","py","ly","pz"}'
// (camera m4 of the v3 stills, shifted with the boat). The still: BOAT='-32,-47.2' TILE='Forward View'
// CAM='{"dx":11,"py":38,"ly":-8,"pz":30}', frame 1
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [out, port = 5173, N = 8] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
const p = await (await b.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })).newPage()
p.on('pageerror', (e) => console.log('[pageerror]', e.message))
await p.goto(`http://localhost:${port}/?boat=${process.env.BOAT || '-22.9,-47.2'}#2026-09-23-sonar-lake-3d`); await p.waitForTimeout(6000)
await p.getByRole('button', { name: process.env.TILE || 'Down View', exact: true }).first().click({ timeout: 4000 }); await p.waitForTimeout(2500)
await p.evaluate((cam) => {
  const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.16 }
  for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$/.test(t) || /^Shop /.test(t)) el.style.visibility = 'hidden' }
  if (s.hintEl) s.hintEl.style.visibility = 'hidden'
  const bx = s.boat.x, C = cam || { dx: 0, py: 24, ly: -16 }; s.camOverride = { pos: [bx + C.dx, C.py, C.pz ?? 20], look: [bx + C.dx, C.ly, -47], fov: 42, noLogo: true } // camera m4 of the v3 stills, over the boat
}, process.env.CAM ? JSON.parse(process.env.CAM) : null)
for (let i = 0; i < +N; i++) {
  await p.waitForTimeout(1000)
  const info = await p.evaluate(() => {
    const s = window.__sonarState
    const trout = (s.pop || []).filter((f) => f.species === 'laketrout' && Math.hypot(f.home[0] + 22, f.home[2] + 45) < 6)
    return { depth: s.depthEl?.textContent, apex: [s.apex?.x?.toFixed(1), s.apex?.z?.toFixed(1)], trout: trout.map((f) => (-f.home[1] / 0.3048).toFixed(0)).join('/') }
  })
  console.log(i, JSON.stringify(info))
  await p.screenshot({ path: `${out}/deep-${i}.png` })
}
await b.close()
