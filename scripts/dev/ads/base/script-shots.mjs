// Storyboard frames for the Base ad script (2026-11-03, docs/2026-11-03-ad-base-script.md): Mini and PingLive, 9:16.
// From "ad-lake-base" (port 5192): a clean git archive of 86bf80e with no VITE_DEVICES (PingLive by default, the Mini through
// the device switch / the phone's app tiles); the ice shot is the ice page of the same checkout (#2026-10-16-sonar-ice-3d).
// usage: node script-shots.mjs <outDir> <shot,...> [port=5192]; env CAMS='{"<shot>":{pos,look,fov}}' overrides cameras
// shots: m1 m2 m3a m3b m4 m5 p1 p2 p3a p3b p4 p5 (a = the phone about to pop up, b = the phone up)
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [out, list, port = 5192] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const OVR = process.env.CAMS ? JSON.parse(process.env.CAMS) : {}
const F5 = { pos: [-2, 26, 60], look: [28, -6, 8], fov: 48 }
const WIDE = { pos: [-40, 95, 150], look: [10, -10, 0], fov: 48 }
// lake = canvas only at 1080×1920; phone = the phone layout 360×640 @3 with everything but the lake and the phone hidden
const SHOTS = {
  m1: { ctx: 'lake', dev: 'mini', view: 'Forward', cam: WIDE },
  m2: { ctx: 'lake', dev: 'mini', view: 'Forward', cam: F5, chase: 1 },
  m3a: { ctx: 'phone', tile: 'Live Forward', cam: F5, lift: 130, chase: 1 },
  m3b: { ctx: 'phone', tile: 'Live Forward', cam: F5, lift: -215, chase: 1 },
  m4: { ctx: 'phone', tile: 'Live Combo', cam: { pos: [24, 95, 46], look: [24, -10, 22], fov: 40 }, lift: -215, fan: 1 },
  m5: { ctx: 'phone', ice: 1, tile: 'Down', lift: -215 },
  p1: { ctx: 'lake', dev: 'pl', view: 'Forward', cam: WIDE },
  p2: { ctx: 'lake', dev: 'pl', view: 'Forward', cam: F5, chase: 1 },
  p3a: { ctx: 'phone', tile: 'Forward View', cam: F5, lift: 130, chase: 1 },
  p3b: { ctx: 'phone', tile: 'Forward View', cam: F5, lift: -215, chase: 1 },
  p4: { ctx: 'phone', tile: 'Panoramic View', cam: { pos: [31, 230, 64], look: [31, -10, 36], fov: 40 }, lift: -215, fan: 1 },
  p5: { ctx: 'phone', tile: 'Panoramic View', cam: { pos: [22, 90, 136], look: [26, -10, 31], fov: 44 }, lift: -215, chase: 1 },
}
const b = await chromium.launch({ headless: true, args: ['--ignore-gpu-blocklist', '--use-angle=metal'] })
for (const name of list.split(',')) {
  const S = { ...SHOTS[name], ...(OVR[name] ? { cam: OVR[name] } : {}) }
  const ctx = await b.newContext(S.ctx === 'phone' ? { viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 200)))
  await p.goto(`http://localhost:${port}/?boat=16,11&tour=off#${S.ice ? '2026-10-16-sonar-ice-3d' : '2026-09-23-sonar-lake-3d'}`); await p.waitForTimeout(7000)
  // a tile the phone layout keeps in the hidden desktop panel (the ice page's views) is pressed through the DOM
  const click = async (n) => {
    const l = p.getByRole('button', { name: n, exact: true })
    if ((await l.count()) && (await l.first().isVisible())) return l.first().click({ timeout: 4000 })
    const ok = await p.evaluate((n) => { const el = [...document.querySelectorAll('button')].find((e) => (e.textContent || '').trim() === n); if (el) el.click(); return !!el }, n)
    if (!ok) console.log(name, 'no button', n)
  }
  if (S.ctx === 'lake') { await click(S.dev === 'mini' ? 'PingLive Mini' : 'PingLive'); await p.waitForTimeout(600); await click(S.view) } else await click(S.tile)
  await p.waitForTimeout(2500)
  await p.evaluate(([S, phone]) => {
    const s = window.__sonarState; s.hasDragged = true; s.adClean = true; s.adBeam = { line: 0.55, face: 0.18 }; if (!phone) s.dragging = true
    if (S.fan) s.fanOpen = 1
    if (S.cam) s.camOverride = { ...S.cam, noLogo: true }
    if (phone) {
      // only the lake and the phone (as film3.mjs): everything off the phone frame's ancestor line, except the canvas, hidden
      const fr = document.querySelector('[data-hint-avoid][style*="aspect-ratio"]')
      for (let el = fr; el.parentElement && el !== document.body; el = el.parentElement)
        for (const sib of el.parentElement.children) if (sib !== el && sib.tagName !== 'CANVAS' && !sib.querySelector('canvas')) sib.style.visibility = 'hidden'
      for (const el of document.querySelectorAll('a,button')) { const t = (el.textContent || '').trim(); if (/^←?\s*Lab$|Replay tour|Learn More|Share to a|Back to the lake/.test(t)) el.style.visibility = 'hidden' }
      if (s.hintEl) s.hintEl.style.visibility = 'hidden'
      const st = document.createElement('style'); st.textContent = `[data-hint-avoid][style*="aspect-ratio"]{transform:translateY(${S.lift}px)}`; document.head.appendChild(st)
    }
  }, [S, S.ctx === 'phone'])
  if (S.chase) await p.evaluate(() => window.__chase('largemouth'))
  await p.waitForTimeout(S.chase ? 3500 : 2500)
  if (S.ctx === 'lake') { const url = await p.evaluate(() => window.__lakeSnap()); fs.writeFileSync(`${out}/${name}.png`, Buffer.from(url.split(',')[1], 'base64')) }
  else await p.screenshot({ path: `${out}/${name}.png` })
  console.log(name, await p.evaluate(() => window.__sonarState.depthEl?.textContent || ''))
  await ctx.close()
}
await b.close()
