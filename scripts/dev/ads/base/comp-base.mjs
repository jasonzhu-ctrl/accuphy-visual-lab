// The Base Mini film: the type layer (overlay-base.html) over the graded frames, one JPEG per frame, plus the end card
// frames over black. usage: node comp-base.mjs <dir> <out> [fps=30] [clean]
// <dir> holds overlay-base.html, fonts/InstrumentSans-Variable.ttf, logo.png, finger.svg, bg/ (the graded frames of every
// pass, named by the 30 fps frame number) and info.json (the passes' frames.json merged: boat on screen, fan, lift).
// STYLE=A|B|C picks the caption style (A until Jason picks); AD_LINES_FILE the lines (default lines-base.json beside this).
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
const [dir, out, fpsArg = '30', mode] = process.argv.slice(2)
const FPS = +fpsArg, STYLE = process.env.STYLE || 'A', END = [30, 34]
fs.mkdirSync(out, { recursive: true })
const lines = JSON.parse(fs.readFileSync(process.env.AD_LINES_FILE || path.join(path.dirname(new URL(import.meta.url).pathname), 'lines-base.json'), 'utf8'))
const info = Object.fromEntries((fs.existsSync(`${dir}/info.json`) ? JSON.parse(fs.readFileSync(`${dir}/info.json`, 'utf8')) : []).map((f) => [f.name, f]))
const frames = fs.readdirSync(`${dir}/bg`).filter((f) => f.endsWith('.jpg')).sort()
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } })
await p.goto(`file://${path.resolve(dir)}/overlay-base.html`)
await p.evaluate(() => Promise.all([document.fonts.load("800 100px 'Eurostile Heavy'"), document.fonts.load("600 70px 'Instrument Sans'")]))
if (!(await p.evaluate(() => document.fonts.check("800 100px 'Eurostile Heavy'")))) throw new Error('Eurostile Heavy did not load: is Creative Cloud running?')
for (const f of frames) {
  const name = f.replace('.jpg', ''), t = +name.slice(1) / 30
  await p.evaluate((a) => window.setFrame(a), { bg: `bg/${f}`, t, info: info[name] || null, lines, style: STYLE, type: mode !== 'clean' })
  await p.screenshot({ path: `${out}/${f}`, type: 'jpeg', quality: 94 })
}
for (let i = 0; i < Math.round((END[1] - END[0]) * FPS); i++) { // the end card over black
  const t = END[0] + i / FPS, name = `f${String(Math.round(t * 30)).padStart(5, '0')}`
  await p.evaluate((a) => window.setFrame(a), { bg: null, t, info: null, lines, style: STYLE, type: mode !== 'clean', endLayout: process.env.END_LAYOUT || 'stack' }) // r10: END_LAYOUT=stack|inline
  await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 94 })
}
console.log(frames.length, 'frames + end card →', out)
await b.close()
