// BF ad v3 film: the type layer (overlay3.html) over the graded frames, one JPEG per frame.
//   node comp3.mjs <dir> <out> [clean]
// <dir> holds overlay3.html, fonts/InstrumentSans-Variable.ttf, logo.png, bg/ (the graded frames of all passes, named by
// the 30 fps frame number) and pano.json (film3.mjs's frames.json of the pano pass: the fan per frame).
// AD_LINES='{"open":…,"pano":…,"deep":…,"end1":…,"end2":…}' (or AD_LINES_FILE=<json>) replaces the English lines (the
// French version). Not LINES: zsh keeps that name for the terminal's height and refuses text in it.
// OVERLAY=overlay-mini.html ASPECT=916|169: the Mini test film's type layer (#185), at 1080×1920 or 1920×1080.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [dir, out, mode] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const lines = {
  open: "This is what's under your boat.", pano: 'See the whole bay in one look.', deep: 'Serious deep water ready.', // placeholders until Klaviyo HQ finals them
  end1: 'Play the free sonar demo', end2: 'Accuphy Lab', // final (Klaviyo HQ's BF caption, #168)
  ...JSON.parse(process.env.AD_LINES_FILE ? fs.readFileSync(process.env.AD_LINES_FILE, 'utf8') : process.env.AD_LINES || '{}'),
}
const fans = Object.fromEntries((fs.existsSync(`${dir}/pano.json`) ? JSON.parse(fs.readFileSync(`${dir}/pano.json`, 'utf8')) : []).map((f) => [f.name, f.fan]))
const frames = fs.readdirSync(`${dir}/bg`).filter((f) => f.endsWith('.jpg')).sort()
const WIDE = process.env.ASPECT === '169', OVERLAY = process.env.OVERLAY || 'overlay3.html'
const b = await chromium.launch({ headless: true })
const p = await b.newPage({ viewport: WIDE ? { width: 1920, height: 1080 } : { width: 1080, height: 1920 } })
await p.goto(`file://${dir}/${OVERLAY}`); await p.evaluate(() => document.fonts.ready)
// load the faces explicitly: a page that uses Eurostile only later (the Mini headline) would not have loaded it yet
await p.evaluate(() => Promise.all([document.fonts.load("800 100px 'Eurostile Heavy'"), document.fonts.load("600 70px 'Instrument Sans'")]))
if (!(await p.evaluate(() => document.fonts.check("800 100px 'Eurostile Heavy'")))) throw new Error('Eurostile Heavy did not load: is Creative Cloud running?')
for (const f of frames) {
  const name = f.replace('.jpg', ''), t = +name.slice(1) / 30
  await p.evaluate((a) => window.setFrame(a), { bg: `bg/${f}`, t, fan: fans[name] || null, lines, type: mode !== 'clean' })
  await p.screenshot({ path: `${out}/${f}`, type: 'jpeg', quality: 94 })
}
console.log(frames.length, 'frames →', out)
await b.close()
