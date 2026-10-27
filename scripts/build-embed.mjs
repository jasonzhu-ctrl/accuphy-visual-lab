// Builds the Lab for mounting INSIDE a store page (decision #142, docs/embed-options.md Option 3) — no iframe.
// Writes into <outDir>/embed/ (default dist-share/pages, beside the standalone page, so one Vercel deploy serves both):
//   lab.js            the stable loader the store section loads (short cache): imports the current build, mounts it
//   lab-<hash>.js     the build: CSS (fonts inlined) injected once, the logo inlined, then the app (cached forever)
//   test.html         a stand-in store page for local checks
// Vercel's headers for these (CORS, cache) are written by scripts/build-share.mjs into vercel.json.
// Usage: node scripts/build-embed.mjs [outDir]
import { build } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { minify } from 'vite'

const outDir = path.resolve(process.argv[2] || 'dist-share/pages')
const tmp = path.resolve('dist-embed-tmp')
await build({ configFile: 'vite.embed.config.js', logLevel: 'warn', build: { outDir: tmp, emptyOutDir: true } })

let js = fs.readFileSync(path.join(tmp, 'lab-app.js'), 'utf8'), css = fs.readFileSync(path.join(tmp, 'lab-app.css'), 'utf8')
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join('public', file)).toString('base64')}`
// the same inlining as the share build: fonts in the CSS, the white logo (the brand SVG, 4 KB; was the 147 KB PNG until load plan B, 2026-10-27) as one shared data URI
css = css.replace(/url\(["']?(?:\.\.?\/|\/)+(brand\/fonts\/[^"')]+)["']?\)/g, (_, f) => `url(${dataUri(decodeURIComponent(f), f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.otf') ? 'font/otf' : 'font/ttf')})`)
js = js.replace(/(["'`])\/brand\/logo\/White Accuphy Logo\.png\1/g, 'globalThis.__acLogo')
js = (await minify('lab-app.js', js, { compress: true, mangle: true })).code // library mode keeps the ES output's whitespace
const left = [...js.matchAll(/["'`](?:\.\.?\/|\/)*brand\/[^"'`]+/g), ...css.matchAll(/url\((?!["']?data:)[^)]+\)/g)].map((m) => m[0])
if (left.length) throw new Error('unresolved asset paths: ' + left.join(', '))

const head = `// Accuphy Lab — embed build (decision #142). Loaded by embed/lab.js; do not link this file directly.
if (!document.getElementById('accuphy-lab-css')) { const s = document.createElement('style'); s.id = 'accuphy-lab-css'; s.textContent = ${JSON.stringify(css)}; document.head.appendChild(s) }
globalThis.__acLogo ??= ${JSON.stringify(dataUri('brand/logo/accuphy-white.svg', 'image/svg+xml'))};
`
const app = head + js
const hash = crypto.createHash('sha256').update(app).digest('hex').slice(0, 10)
const dir = path.join(outDir, 'embed')
fs.mkdirSync(dir, { recursive: true })
for (const f of fs.readdirSync(dir)) if (/^lab-[0-9a-f]{10}\.js$/.test(f)) fs.rmSync(path.join(dir, f)) // one build per deploy
fs.writeFileSync(path.join(dir, `lab-${hash}.js`), app)
fs.writeFileSync(path.join(dir, 'lab.js'), `// Accuphy Lab loader (decision #142). The store page loads this file from a stable URL:
//   <div id="accuphy-lab"></div><script type="module" src="https://<lab host>/embed/lab.js"></script>
// It imports the current build and mounts it into that element. A new Lab release only changes the file name below.
const el = document.getElementById('accuphy-lab')
if (el && !el.dataset.labMounted) {
  el.dataset.labMounted = '1'
  import(new URL('./lab-${hash}.js', import.meta.url).href)
    .then((m) => m.mount(el))
    .catch((err) => { el.dataset.labFailed = '1'; console.error('[accuphy-lab] could not load', err) })
}
`)
fs.writeFileSync(path.join(dir, 'test.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Store page stand-in · Accuphy Lab</title>
<style>html,body{height:100%;margin:0;overflow:hidden;overscroll-behavior:none;background:#0f3b44}</style>
<script>window.__labEvents = []; window.Shopify = { analytics: { publish: (name, data) => window.__labEvents.push([name, data]) } }</script>
</head>
<body>
<div id="accuphy-lab" data-market="CA"><p style="color:#fff;font:15px system-ui;padding:24px">Loading the Accuphy Lab…</p></div>
<script type="module" src="${process.env.EMBED_SRC || './lab.js'}"></script>
</body>
</html>
`)
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`${dir}: lab.js → lab-${hash}.js ${(app.length / 1e6).toFixed(2)} MB`)
