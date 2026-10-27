import { chromium } from 'playwright-core'
const dir = process.argv[2], out = process.argv[3]
const stills = [
  ['v3-still-open', { bg: 'v3-open.png', top: 360, grad: true, line: "This is what's under your boat." }],
  ['v3-still-135', { bg: 'v3-pano.png', top: 330, grad: true, num: '135', unit: '°', line: 'See the whole bay in one look.' }],
  ['v3-still-jig-pl', { bg: 'v3-jig-pl.png', top: 360, grad: true, line: 'Watch your jig all the way down.' }],
  ['v3-still-jig-plm', { bg: 'v3-jig-plm.png', top: 360, grad: true, line: 'Watch your jig all the way down.' }],
]
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } })
await p.goto(`file://${dir}/overlay2.html`); await p.evaluate(() => document.fonts.ready)
for (const [name, c] of stills) { await p.evaluate((c) => window.setStill(c), c); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); await p.screenshot({ path: `${out}/${name}.png` }); console.log(name) }
await b.close()
