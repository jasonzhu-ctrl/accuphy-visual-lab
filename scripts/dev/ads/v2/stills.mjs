import { chromium } from 'playwright-core'
const dir = process.argv[2], out = process.argv[3]
const stills = [
  ['still-0s', { bg: 'bg0.png', top: 1010, line: "This is what's under your boat." }],
  ['still-0s-panoramic', { bg: 'bg0-pano.png', top: 1350, line: "This is what's under your boat." }],
  ['still-135', { bg: 'bg1.png', top: 370, grad: true, num: '135', unit: '°', line: 'See the whole bay in one look.' }],
  ['still-230ft', { bg: 'bg2.png', top: 330, grad: true, num: '230', unit: 'FT', line: "See what's ahead before you cast." }],
]
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } })
await p.goto(`file://${dir}/overlay2.html`); await p.evaluate(() => document.fonts.ready)
for (const [name, c] of stills) { await p.evaluate((c) => window.setStill(c), c); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); await p.screenshot({ path: `${out}/${name}.png` }); console.log(name) }
await b.close()
