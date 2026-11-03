// Renders the three caption styles of styles.html on the same frames, for Jason to pick (#225 step 1).
// usage: node styles-render.mjs <dir with styles.html, fonts/, logo.png and the frames> <outDir>
// The frames (graded jpg) and the lines are listed in CASES below. Stops if Eurostile Heavy did not load from Creative Cloud.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
const [dir, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const CASES = [
  { key: 'open', bg: 'm1.jpg', head: 'Forward-facing sonar,', sub: 'explained in 2 minutes.', top: 330 },
  { key: 'drag', bg: 'm2.jpg', head: 'Drag the boat.', sub: 'See what the beam finds for you in the timber.', top: 330 },
  { key: 'ice', bg: 'm5.jpg', head: 'No black box.', sub: 'No heavy battery and plotter.', top: 330 },
]
const b = await chromium.launch({ headless: true })
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage()
await p.goto('file://' + path.resolve(dir, 'styles.html'))
for (const name of ['A', 'B', 'C']) for (const c of CASES) {
  const r = await p.evaluate((o) => window.setStyle(o), { name, bg: c.bg, head: c.head, sub: c.sub, top: c.top })
  if (!r.eurostile) { console.error('Eurostile Heavy did not load — is Creative Cloud running?'); process.exit(1) }
  await p.waitForTimeout(150)
  await p.screenshot({ path: `${out}/${name}-${c.key}.png` })
  console.log(name, c.key, 'caption bottom', Math.round(r.bottom))
}
await b.close()
