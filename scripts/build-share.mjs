// Builds the sonar lake as one HTML file (code, styles, fonts and logo inlined; since load plan B 2026-10-27 the app Home's
// thumbnails are files in pages/home/ — the one-file accuphy-lab.html for the private Artifact preview still inlines them), in the shape the
// claude.ai Artifact page expects: no <!doctype>/<html>/<head>/<body> of its own, a <title> first, nothing loaded
// from other hosts. Usage: node scripts/build-share.mjs [outDir]   (default dist-share/, gitignored)
import { build } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve(process.argv[2] || 'dist-share')
const variant = process.env.VITE_LAB === 'tour' ? 'tour' : process.env.VITE_LAB === 'fish' ? 'fish' : process.env.VITE_SCENE === 'ice' ? 'ice' : process.env.VITE_DEVICES === 'PLM' ? 'mini' : 'both' // pages (Jason 2026-10-16): PingLive + Mini, Mini only, and the ice-fishing page; tour = the entry-tour prototype (2026-11-01), with VITE_DEVICES=PLM for the Mini script
const title = variant === 'tour' ? 'Accuphy Lab · Tour' : variant === 'fish' ? 'Accuphy Lab · Fish test' : variant === 'ice' ? 'Accuphy Lab · Ice' : variant === 'mini' ? 'Accuphy Lab · PingLive Mini' : 'Accuphy Lab'
const tmp = path.join(outDir, 'vite')
await build({ configFile: 'vite.share.config.js', logLevel: 'warn', build: { outDir: tmp, emptyOutDir: true } })

const htmlRel = variant === 'tour' ? 'src/experiments/2026-11-01-tour-proto/share/index.html' : 'share/index.html' // the tour page has its own entry (vite.share.config.js)
const html = fs.readFileSync(path.join(tmp, htmlRel), 'utf8')
const jsRel = /<script[^>]*src="([^"]+\.js)"/.exec(html)[1], cssRel = /<link[^>]*href="([^"]+\.css)"/.exec(html)[1]
const fromHtml = (rel) => path.resolve(path.dirname(path.join(tmp, htmlRel)), rel)
let js = fs.readFileSync(fromHtml(jsRel), 'utf8'), css = fs.readFileSync(fromHtml(cssRel), 'utf8')
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join('public', file)).toString('base64')}`

// fonts and the white logo are referenced as public-folder paths; inline them
// Vite writes them relative to the CSS file (url(../brand/fonts/…)) or absolute; accept both
css = css.replace(/url\(["']?(?:\.\.?\/|\/)+(brand\/fonts\/[^"')]+)["']?\)/g, (_, f) => `url(${dataUri(decodeURIComponent(f), f.endsWith('.woff2') ? 'font/woff2' : f.endsWith('.otf') ? 'font/otf' : 'font/ttf')})`)
const logo = '/brand/logo/accuphy-white.svg' // the brand SVG (2 KB); the source still names the 147 KB PNG, which the dev server shows (load plan B, 2026-10-27)
const logoRe = /(["'`])\/brand\/logo\/White Accuphy Logo\.png\1/g // string literals in the minified code, any quote
const logoCount = (js.match(logoRe) || []).length
js = js.replace(logoRe, 'globalThis.__acLogo') // one copy of the image, defined before the app runs
// The app Home's 12 thumbnails are files beside the page, not inlined (load plan B, 2026-10-27; vite.share.config.js keeps every
// other image inline). Vite emits them next to the code as new URL('<name>-<hash>.jpg', import.meta.url); in the page the code
// is an inline module script, so import.meta.url is the page itself — rewrite to a plain relative path under home/ and copy
// the files there (hashed names, cached for good). The single-file page (the private Artifact preview) inlines them instead.
const thumbRe = /new URL\((["'`])([\w.-]+\.(?:jpe?g|png|webp))\1,\s*import\.meta\.url\)\.href/g
const findFile = (dir, name) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const f = path.join(dir, e.name); if (e.isDirectory()) { const r = findFile(f, name); if (r) return r } else if (e.name === name) return f } return null }
const thumbs = [...new Set([...js.matchAll(thumbRe)].map((m) => m[2]))].map((name) => { const f = findFile(tmp, name); if (!f) throw new Error('thumbnail not emitted: ' + name); return { name, file: f } })
const mime = (n) => n.endsWith('.png') ? 'image/png' : n.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
const jsOne = js.replace(thumbRe, (_, q, name) => JSON.stringify(`data:${mime(name)};base64,${fs.readFileSync(thumbs.find((t) => t.name === name).file).toString('base64')}`))
js = js.replace(thumbRe, (_, q, name) => JSON.stringify('./home/' + name))
if (/import\.meta\.url/.test(js)) throw new Error('a file reference the build does not handle (new URL(…, import.meta.url)) is left in the code')
const left = [...js.matchAll(/["'`](?:\.\.?\/|\/)*brand\/[^"'`]+/g), ...js.matchAll(/["'`][^"'`\s]*\/assets\/[^"'`\s]+\.(?:jpe?g|png|webp|hdr)["'`]/g), ...css.matchAll(/url\((?!["']?data:)[^)]+\)/g)].map((m) => m[0]) // any file reference left (an imported image left as a file, e.g. the lake's sky and ripple maps, #162, would be missing)
if (left.length) throw new Error('unresolved absolute asset paths: ' + left.join(', '))
// a literal </script> or </style> inside the code would end the inline tag early
js = js.replace(/<\/script/gi, '<\\/script'); css = css.replace(/<\/style/gi, '<\\/style')

// The cover (BF funnel handoff 2026-10-26, item 3): pure HTML/CSS, painted as soon as the file has arrived, long before
// the 3D is built (docs/2026-10-26-lab-load-time.md: the page lands at ~1.0 s on 4G, the lake at ~3.7 s). index.jsx fades it
// out after the lake's first frames. The logo is the brand SVG, white.
const logoSvg = fs.readFileSync(path.join('public', logo.slice(1)), 'utf8')
const cover = `<div id="lab-cover" aria-live="polite"><div class="lab-cover-logo">${logoSvg}</div><div class="lab-cover-text">${variant === 'ice' ? 'Loading the ice' : 'Loading the lake'}…</div><div class="lab-cover-bar"><i></i></div></div>`
const coverCss = `#lab-cover{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:${variant === 'ice' ? '#1a2335' : '#0f3b44'};color:#fff;font:600 14px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.02em;transition:opacity .45s}#lab-cover.is-done{opacity:0;pointer-events:none}.lab-cover-logo svg{width:min(44vw,180px);height:auto;display:block;filter:drop-shadow(0 2px 8px rgba(0,0,0,.25))}.lab-cover-text{opacity:.85}.lab-cover-bar{width:min(44vw,180px);height:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}.lab-cover-bar i{display:block;height:100%;width:40%;border-radius:3px;background:#0d8fdb;animation:lab-cover-slide 1.4s ease-in-out infinite}@keyframes lab-cover-slide{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}`
const makePage = (js) => `<title>${title}</title>
<style>html,body{height:100%;margin:0;background:${variant === 'ice' ? '#1a2335' : '#0f3b44'};overscroll-behavior:none}#root{height:100%}${coverCss}</style>
<style>${css}</style>
<div id="root"></div>
${cover}
<script>globalThis.__acLogo=${JSON.stringify(dataUri(logo.slice(1), 'image/svg+xml'))}</script>
<script type="module">${js}</script>
`
const page = makePage(js), pageOne = makePage(jsOne)
const thumbKB = thumbs.reduce((a, t) => a + fs.statSync(t.file).size, 0) / 1e3
fs.writeFileSync(path.join(outDir, 'accuphy-lab.html'), pageOne)
// the same page as a full document for an ordinary static host (GitHub Pages, decision #72): anyone with the link can
// open it, no login; kept out of search engines
fs.mkdirSync(path.join(outDir, 'pages'), { recursive: true })
fs.writeFileSync(path.join(outDir, 'pages/index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
${page}</head>
</html>
`.replace('</head>\n</html>', '</html>').replace(/(<\/style>\n)(<div id="root">)/, '$1</head>\n<body>\n$2').replace(/<\/html>\n$/, '</body>\n</html>\n'))
fs.mkdirSync(path.join(outDir, 'pages/home'), { recursive: true })
for (const t of thumbs) fs.copyFileSync(t.file, path.join(outDir, 'pages/home', t.name))
fs.writeFileSync(path.join(outDir, 'pages/robots.txt'), 'User-agent: *\nDisallow: /\n')
fs.writeFileSync(path.join(outDir, 'pages/.nojekyll'), '')
// Vercel headers (decision #134): only the store (and Shopify's theme editor) may frame the page; unlisted until launch.
// The embed build (#142, scripts/build-embed.mjs → embed/) is loaded cross-origin by the store page as a module script,
// so it needs CORS; its hashed builds are cached for good, the loader only briefly (a release = a new loader).
// GitHub Pages ignores this file.
fs.writeFileSync(path.join(outDir, 'pages/vercel.json'), JSON.stringify({ headers: [
  { source: '/(.*)', headers: [
    { key: 'Content-Security-Policy', value: 'frame-ancestors https://shop.accuphy.com https://*.myshopify.com https://admin.shopify.com' },
    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
  ] },
  { source: '/embed/(.*)', headers: [
    { key: 'Access-Control-Allow-Origin', value: '*' },
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
  ] },
  { source: '/embed/lab.js', headers: [{ key: 'Cache-Control', value: 'public, max-age=300' }] },
  { source: '/home/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }, // the Home thumbnails, hashed names
] }, null, 2) + '\n')
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`${path.join(outDir, 'pages/index.html')} [${variant}]: ${(page.length / 1e6).toFixed(2)} MB + ${thumbs.length} thumbnails in home/ (${thumbKB.toFixed(0)} KB); one-file accuphy-lab.html ${(pageOne.length / 1e6).toFixed(2)} MB (logo inlined ${logoCount}×)`)
