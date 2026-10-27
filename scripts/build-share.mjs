// Builds the sonar lake as ONE self-contained HTML file (code, styles, fonts and logo inlined), in the shape the
// claude.ai Artifact page expects: no <!doctype>/<html>/<head>/<body> of its own, a <title> first, nothing loaded
// from other hosts. Usage: node scripts/build-share.mjs [outDir]   (default dist-share/, gitignored)
import { build } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve(process.argv[2] || 'dist-share')
const variant = process.env.VITE_LAB === 'fish' ? 'fish' : process.env.VITE_SCENE === 'ice' ? 'ice' : process.env.VITE_DEVICES === 'PLM' ? 'mini' : 'both' // pages (Jason 2026-10-16): PingLive + Mini, Mini only, and the ice-fishing page
const title = variant === 'fish' ? 'Accuphy Lab · Fish test' : variant === 'ice' ? 'Accuphy Lab · Ice' : variant === 'mini' ? 'Accuphy Lab · PingLive Mini' : 'Accuphy Lab'
const tmp = path.join(outDir, 'vite')
await build({ configFile: 'vite.share.config.js', logLevel: 'warn', build: { outDir: tmp, emptyOutDir: true } })

const html = fs.readFileSync(path.join(tmp, 'share/index.html'), 'utf8')
const jsRel = /<script[^>]*src="([^"]+\.js)"/.exec(html)[1], cssRel = /<link[^>]*href="([^"]+\.css)"/.exec(html)[1]
const fromHtml = (rel) => path.resolve(path.join(tmp, 'share'), rel)
let js = fs.readFileSync(fromHtml(jsRel), 'utf8'), css = fs.readFileSync(fromHtml(cssRel), 'utf8')
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join('public', file)).toString('base64')}`

// fonts and the white logo are referenced as public-folder paths; inline them
// Vite writes them relative to the CSS file (url(../brand/fonts/…)) or absolute; accept both
css = css.replace(/url\(["']?(?:\.\.?\/|\/)+(brand\/fonts\/[^"')]+)["']?\)/g, (_, f) => `url(${dataUri(decodeURIComponent(f), f.endsWith('.otf') ? 'font/otf' : 'font/ttf')})`)
const logo = '/brand/logo/White Accuphy Logo.png'
const logoRe = /(["'`])\/brand\/logo\/White Accuphy Logo\.png\1/g // string literals in the minified code, any quote
const logoCount = (js.match(logoRe) || []).length
js = js.replace(logoRe, 'globalThis.__acLogo') // one copy of the image, defined before the app runs
const left = [...js.matchAll(/["'`](?:\.\.?\/|\/)*brand\/[^"'`]+/g), ...js.matchAll(/["'`][^"'`\s]*\/assets\/[^"'`\s]+\.(?:jpe?g|png|webp|hdr)["'`]/g), ...css.matchAll(/url\((?!["']?data:)[^)]+\)/g)].map((m) => m[0]) // any file reference left (an imported image left as a file, e.g. the lake's sky and ripple maps, #162, would be missing)
if (left.length) throw new Error('unresolved absolute asset paths: ' + left.join(', '))
// a literal </script> or </style> inside the code would end the inline tag early
js = js.replace(/<\/script/gi, '<\\/script'); css = css.replace(/<\/style/gi, '<\\/style')

// The cover (BF funnel handoff 2026-10-26, item 3): pure HTML/CSS, painted as soon as the file has arrived, long before
// the 3D is built (docs/2026-10-26-lab-load-time.md: the page lands at ~1.0 s on 4G, the lake at ~3.7 s). index.jsx fades it
// out after the lake's first frames. The logo is the brand SVG, white.
const logoSvg = fs.readFileSync(path.join('public', 'brand/logo/Untitled-1.svg'), 'utf8').replace('<svg ', '<svg fill="#fff" aria-label="Accuphy" ').replace('viewBox="0 0 1966.1816 971.3172"', 'viewBox="0 0 1966.1816 485.66"') // the file stacks the logo twice; show the top one
const cover = `<div id="lab-cover" aria-live="polite"><div class="lab-cover-logo">${logoSvg}</div><div class="lab-cover-text">${variant === 'ice' ? 'Loading the ice' : 'Loading the lake'}…</div><div class="lab-cover-bar"><i></i></div></div>`
const coverCss = `#lab-cover{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:${variant === 'ice' ? '#1a2335' : '#0f3b44'};color:#fff;font:600 14px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.02em;transition:opacity .45s}#lab-cover.is-done{opacity:0;pointer-events:none}.lab-cover-logo svg{width:min(44vw,180px);height:auto;display:block;filter:drop-shadow(0 2px 8px rgba(0,0,0,.25))}.lab-cover-text{opacity:.85}.lab-cover-bar{width:min(44vw,180px);height:3px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}.lab-cover-bar i{display:block;height:100%;width:40%;border-radius:3px;background:#0d8fdb;animation:lab-cover-slide 1.4s ease-in-out infinite}@keyframes lab-cover-slide{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}`
const page = `<title>${title}</title>
<style>html,body{height:100%;margin:0;background:${variant === 'ice' ? '#1a2335' : '#0f3b44'};overscroll-behavior:none}#root{height:100%}${coverCss}</style>
<style>${css}</style>
<div id="root"></div>
${cover}
<script>globalThis.__acLogo=${JSON.stringify(dataUri(logo.slice(1), 'image/png'))}</script>
<script type="module">${js}</script>
`
fs.writeFileSync(path.join(outDir, 'accuphy-lab.html'), page)
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
] }, null, 2) + '\n')
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`${path.join(outDir, 'accuphy-lab.html')} [${variant}]: ${(page.length / 1e6).toFixed(2)} MB (logo inlined ${logoCount}×)`)
