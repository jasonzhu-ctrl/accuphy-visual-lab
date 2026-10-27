// Renders overlay.html over the clip's frames: one JPEG per frame at 1080×1920, 30 fps.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [base, outDir, nStr] = process.argv.slice(2)
const N = +nStr, FPS = 30
fs.mkdirSync(outDir, { recursive: true })
const b = await chromium.launch({ headless: true })
const page = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
await page.goto(`${base}/overlay.html`, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
for (let i = 1; i <= N; i++) {
  await page.evaluate(([i, t]) => { window.setFrame(i); window.setT(t) }, [i, (i - 1) / FPS])
  await page.evaluate(() => new Promise((r) => { const im = document.getElementById('bg'); if (im.complete) r(); else im.onload = r }))
  await page.screenshot({ path: `${outDir}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 })
  if (i % 30 === 0) console.log(i)
}
await b.close()
