// e01 step 1: the finger cue over the recorded frames (overlay-e01.html). usage: node e01-comp.mjs <dir> <out>
// <dir> holds overlay-e01.html, finger.svg and bg/ (the step-1 PNGs) and frames.json from e01.mjs.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
const [dir, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true })
const log = JSON.parse(fs.readFileSync(`${dir}/frames.json`, 'utf8'))
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1600, height: 900 } })
await p.goto(`file://${path.resolve(dir)}/overlay-e01.html`)
for (const f of log) {
  const name = `f${String(f.i).padStart(3, '0')}`
  await p.evaluate((a) => window.setFrame(a), { bg: `bg/${name}.png`, u: f.u, boat: f.boat, show: true })
  await p.screenshot({ path: `${out}/${name}.png` })
}
console.log(log.length, 'frames →', out)
await b.close()
