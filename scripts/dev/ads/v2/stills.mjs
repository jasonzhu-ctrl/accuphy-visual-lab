import { chromium } from 'playwright-core'
const dir = process.argv[2], out = process.argv[3]
const stills = [
  ['still-0s', { bg: 'bg0.png', top: 1430, line: "This is what's under your boat." }],
  ['still-135', { bg: 'bg1.png', top: 370, grad: true, num: '135', unit: '°', line: 'See the whole bay in one look.', fan: {"apex": [557.6, 1466.5], "arc": [[51.1, 1265.3], [64.5, 1242.9], [78.8, 1221.2], [94, 1200.2], [110.2, 1180.1], [127.2, 1160.8], [145, 1142.3], [163.6, 1124.7], [182.9, 1108], [203, 1092.3], [223.6, 1077.4], [244.9, 1063.5], [266.7, 1050.6], [289, 1038.7], [311.8, 1027.8], [335, 1017.9], [358.5, 1009], [382.5, 1001.1], [406.7, 994.3], [431.1, 988.5], [455.8, 983.7], [480.6, 980], [505.6, 977.4], [530.7, 975.8], [555.8, 975.3], [580.9, 975.8], [606, 977.4], [630.9, 980], [655.8, 983.7], [680.5, 988.5], [705, 994.3], [729.3, 1001.1], [753.3, 1009], [776.9, 1017.9], [800.2, 1027.8], [823, 1038.7], [845.5, 1050.6], [867.4, 1063.5], [888.7, 1077.4], [909.5, 1092.3], [929.6, 1108], [949.1, 1124.7], [967.8, 1142.3], [985.8, 1160.8], [1003, 1180.1], [1019.3, 1200.2], [1034.7, 1221.2], [1049.1, 1242.9], [1062.6, 1265.3]]} }],
  ['still-230ft', { bg: 'bg2.png', top: 330, grad: true, num: '230', unit: 'FT', line: "See what's ahead before you cast." }],
]
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } })
await p.goto(`file://${dir}/overlay2.html`); await p.evaluate(() => document.fonts.ready)
for (const [name, c] of stills) { await p.evaluate((c) => window.setStill(c), c); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); await p.screenshot({ path: `${out}/${name}.png` }); console.log(name) }
await b.close()
