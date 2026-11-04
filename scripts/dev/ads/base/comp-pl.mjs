// The PingLive ad (r1): the type layer (overlay-pl.html) over the graded frames, one JPEG per frame, plus the end card frames over
// black. A copy of comp-base.mjs (the Mini's, unchanged) that reads the beats from beats-pl.json. usage: node comp-pl.mjs <dir> <out> [fps=30] [clean]
// <dir> holds overlay-pl.html, fonts/InstrumentSans-Variable.ttf, logo.png, finger.svg, bg/ (the graded frames of every
// pass, named by the 30 fps frame number) and info.json (the passes' frames.json merged: boat on screen, fan, lift).
// STYLE=A|B|C (A, as the Mini); AD_LINES_FILE the lines (default lines-pl.json beside this), BEATS the beats (default beats-pl.json).
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'
const [dir, out, fpsArg = '30', mode] = process.argv.slice(2)
const HERE = path.dirname(new URL(import.meta.url).pathname)
const beats = JSON.parse(fs.readFileSync(process.env.BEATS || path.join(HERE, 'beats-pl.json'), 'utf8'))
const FPS = +fpsArg, STYLE = process.env.STYLE || 'A', END = beats.end
fs.mkdirSync(out, { recursive: true })
const lines = JSON.parse(fs.readFileSync(process.env.AD_LINES_FILE || path.join(HERE, 'lines-pl.json'), 'utf8'))
const info = Object.fromEntries((fs.existsSync(`${dir}/info.json`) ? JSON.parse(fs.readFileSync(`${dir}/info.json`, 'utf8')) : []).map((f) => [f.name, f]))
const frames = fs.readdirSync(`${dir}/bg`).filter((f) => f.endsWith('.jpg')).sort()
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } })
await p.goto(`file://${path.resolve(dir)}/overlay-pl.html`)
await p.evaluate(() => Promise.all([document.fonts.load("800 100px 'Eurostile Heavy'"), document.fonts.load("600 70px 'Instrument Sans'")]))
if (!(await p.evaluate(() => document.fonts.check("800 100px 'Eurostile Heavy'")))) throw new Error('Eurostile Heavy did not load: is Creative Cloud running?')
for (const f of frames) {
  const name = f.replace('.jpg', ''), t = +name.slice(1) / 30
  await p.evaluate((a) => window.setFrame(a), { bg: `bg/${f}`, t, info: info[name] || null, lines, beats, style: STYLE, type: mode !== 'clean' })
  await p.screenshot({ path: `${out}/${f}`, type: 'jpeg', quality: 94 })
}
for (let i = 0; i < Math.round((END[1] - END[0]) * FPS); i++) { // the end card over black
  const t = END[0] + i / FPS, name = `f${String(Math.round(t * 30)).padStart(5, '0')}`
  await p.evaluate((a) => window.setFrame(a), { bg: null, t, info: null, lines, beats, style: STYLE, type: mode !== 'clean', endLayout: process.env.END_LAYOUT || 'stack' })
  await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 94 })
}
console.log(frames.length, 'frames + end card →', out)
await b.close()
