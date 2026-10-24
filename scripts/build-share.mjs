// Builds the sonar lake as ONE self-contained HTML file (code, styles, fonts and logo inlined), in the shape the
// claude.ai Artifact page expects: no <!doctype>/<html>/<head>/<body> of its own, a <title> first, nothing loaded
// from other hosts. Usage: node scripts/build-share.mjs [outDir]   (default dist-share/, gitignored)
import { build } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve(process.argv[2] || 'dist-share')
const variant = process.env.VITE_SCENE === 'ice' ? 'ice' : process.env.VITE_DEVICES === 'PLM' ? 'mini' : 'both' // pages (Jason 2026-10-16): PingLive + Mini, Mini only, and the ice-fishing page
const title = variant === 'ice' ? 'Accuphy Lab · Ice' : variant === 'mini' ? 'Accuphy Lab · PingLive Mini' : 'Accuphy Lab'
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
const left = [...js.matchAll(/["'`](?:\.\.?\/|\/)*brand\/[^"'`]+/g), ...css.matchAll(/url\((?!["']?data:)[^)]+\)/g)].map((m) => m[0]) // any file reference left
if (left.length) throw new Error('unresolved absolute asset paths: ' + left.join(', '))
// a literal </script> or </style> inside the code would end the inline tag early
js = js.replace(/<\/script/gi, '<\\/script'); css = css.replace(/<\/style/gi, '<\\/style')

const page = `<title>${title}</title>
<style>html,body{height:100%;margin:0;background:#0f3b44;overscroll-behavior:none}#root{height:100%}</style>
<style>${css}</style>
<div id="root"></div>
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
