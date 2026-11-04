// r10 end card stills for Jason to pick a layout (HQ 11-03): renders overlay-base.html's end card at t = 33 s (after the
// entrance) in both layouts, plus a check copy with the Reels safe band (y 269–1248) drawn in red.
// usage: node endcard-stills.mjs <comp dir with overlay-base.html, logo.png, fonts/> <out dir>
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
const [dir, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch({ headless: true }), p = await b.newPage({ viewport: { width: 1080, height: 1920 } })
await p.goto(`file://${path.resolve(dir)}/overlay-base.html`)
await p.evaluate(() => document.fonts.load("800 100px 'Eurostile Heavy'"))
if (!(await p.evaluate(() => document.fonts.check("800 100px 'Eurostile Heavy'")))) throw new Error('Eurostile Heavy did not load')
for (const layout of ['stack', 'inline']) {
  await p.evaluate((l) => window.setFrame({ bg: null, t: 33, info: null, lines: {}, endLayout: l }), layout)
  await p.screenshot({ path: `${out}/endcard-${layout}.png` })
  const box = await p.evaluate(() => { const r = document.querySelector('#end .lock').getBoundingClientRect(); const kids = [...document.querySelectorAll('#end .lock > *')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.getBoundingClientRect()); return { top: Math.min(...kids.map((k) => k.top)), bottom: Math.max(...kids.map((k) => k.bottom)), left: Math.min(...kids.map((k) => k.left)), right: Math.max(...kids.map((k) => k.right)) } })
  console.log(layout, JSON.stringify(box))
  await p.evaluate(() => { const g = document.createElement('div'); g.id = 'guide'; g.innerHTML = '<div style="position:absolute;left:0;width:1080px;top:269px;height:3px;background:#e33"></div><div style="position:absolute;left:0;width:1080px;top:1248px;height:3px;background:#e33"></div>'; g.style.cssText = 'position:absolute;inset:0;pointer-events:none'; document.querySelector('#stage').appendChild(g) })
  await p.screenshot({ path: `${out}/endcard-${layout}-safe.png` })
  await p.evaluate(() => document.querySelector('#guide').remove())
}
await b.close()
