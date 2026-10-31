// Fake store page + built Lab in headless Chrome. See README.md. Usage: node run.mjs [distDir] [scenario ...]
import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import zlib from 'node:zlib'; import { spawn } from 'node:child_process'
const dist = path.resolve(process.argv[2] && !/^(shop|share)-/.test(process.argv[2]) ? process.argv[2] : 'dist-share/pages')
const wanted = process.argv.slice(2).filter((a) => /^(shop|share)-/.test(a))
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT_DBG = 9333
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- the fake store page (a stand-in for sections/lab-embed.liquid + the bridge) ----
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'store-frame-'))
fs.writeFileSync(path.join(tmp, 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>fake store page</title>
<style>html,body{margin:0;height:100%;background:#0f3b44}iframe{width:100%;height:100%;border:0}</style>
<script>
const q = new URLSearchParams(location.search), mode = q.get('mode') || 'none'
window.__log = []
window.addEventListener('message', (e) => {
  if (!e.data || e.data.source !== 'accuphy-lab') return
  window.__log.push({ event: e.data.event, data: e.data.data })
  if (e.data.event !== 'shop_click') return
  const lab = document.getElementById('lab').contentWindow
  if (mode === 'ack') lab.postMessage({ type: 'shop_click_ack' }, e.origin)
  if (mode === 'badtype') lab.postMessage({ type: 'something_else' }, e.origin)
  if (mode === 'wrong') document.getElementById('sib').contentWindow.postMessage({ cmd: 'ack-the-lab', origin: e.origin }, '*') // a sibling frame answers: wrong source
})
document.write('<iframe id="lab" src="/lab/?shop=' + (q.get('shop') || '/de-de') + (q.get('lang') ? '&lang=' + q.get('lang') : '') + '"' + (q.get('allow') ? ' allow="clipboard-write; web-share"' : '') + '></iframe><iframe id="sib" src="sibling.html" style="width:1px;height:1px;position:absolute"></iframe>')
</script>`)
fs.writeFileSync(path.join(tmp, 'sibling.html'), `<!doctype html><script>window.addEventListener('message', (e) => { if (e.data && e.data.cmd === 'ack-the-lab') parent.frames[0].postMessage({ type: 'shop_click_ack' }, e.data.origin) })</script>`)
fs.symlinkSync(dist, path.join(tmp, 'lab'))
const types = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.json': 'application/json' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html'
  const f = path.join(tmp, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end() }
  const body = fs.readFileSync(f), ext = path.extname(f), gz = /\.(html|js|json)$/.test(ext)
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store', ...(gz ? { 'Content-Encoding': 'gzip' } : {}) })
  res.end(gz ? zlib.gzipSync(body) : body)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

// ---- Chrome over CDP ----
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT_DBG}`, `--user-data-dir=${path.join(tmp, 'profile')}`, '--no-first-run', '--use-angle=metal', '--enable-unsafe-swiftshader', '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' })
for (let i = 0; i < 40; i++) { try { await fetch(`http://127.0.0.1:${PORT_DBG}/json/version`); break } catch { await sleep(250) } }
async function openTab(width, height) {
  const t = await (await fetch(`http://127.0.0.1:${PORT_DBG}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r))
  let id = 0; const waiting = new Map(); const navs = []
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id) } else if (d.method === 'Network.requestWillBeSent' && d.params.type === 'Document') navs.push({ url: d.params.request.url, t: Date.now() }) }
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; waiting.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: width < 600 ? 2 : 1, mobile: width < 600 })
  const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value
  // run `expr` inside the Lab iframe (d = its document, w = its window)
  const lab = (expr) => ev(`(() => { const d = document.getElementById('lab').contentDocument; const w = document.getElementById('lab').contentWindow; try { return (${expr}) } catch (e) { return 'ERR ' + e.message } })()`)
  const waitFor = async (expr, ms = 90000) => { for (let i = 0; i < ms / 500; i++) { if ((await lab(expr)) === true) return true; await sleep(500) } return false }
  const tap = async (sel) => { // a trusted mouse click on an element inside the iframe
    const r = JSON.parse(await lab(`JSON.stringify((() => { const b = d.querySelector('${sel}').getBoundingClientRect(); const f = document.getElementById('lab').getBoundingClientRect(); return { x: f.left + b.left + b.width / 2, y: f.top + b.top + b.height / 2 } })())`))
    for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left', clickCount: 1 })
  }
  const esc = async () => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }) }
  const open = async (query) => { await send('Page.navigate', { url: `${base}/?${query}` }); return waitFor("!!d.querySelector('.ac-shop')") }
  const close = async () => { await send('Target.closeTarget', { targetId: t.id }).catch(() => {}); ws.close() }
  return { ev, lab, waitFor, tap, esc, open, close, navs }
}

// ---- scenarios ----
const scenarios = {}
for (const mode of ['ack', 'none', 'wrong', 'badtype']) {
  scenarios[`shop-${mode === 'wrong' ? 'wrong-source' : mode}`] = async () => {
    const tab = await openTab(1280, 800)
    if (!(await tab.open(`mode=${mode}`))) return { ok: false, detail: 'Lab did not start' }
    const t0 = Date.now()
    await tab.lab("(d.querySelector('.ac-shop').click(), true)"); await sleep(120)
    const label = await tab.lab("d.querySelector('.ac-shop').textContent")
    const log = JSON.parse((await tab.ev('JSON.stringify(window.__log)')) || '[]'); await sleep(1800)
    const nav = tab.navs.find((n) => /\/de-de\/products\//.test(n.url)); const ms = nav ? nav.t - t0 : null
    const click = log.find((l) => l.event === 'shop_click')
    await tab.close()
    const shouldNav = mode !== 'ack'
    const ok = label === 'Opening the store…' && !!click?.data?.url && /\/de-de\/products\/pinglive-sonar$/.test(click.data.url) && (shouldNav ? ms > 900 && ms < 1400 : !nav)
    return { ok, detail: `label="${label}" url=${click?.data?.url} navigated=${!!nav}${ms ? ` at ${ms} ms` : ''}` }
  }
}
for (const [name, w, h] of [['share-desktop', 1280, 800], ['share-phone', 390, 844]]) {
  scenarios[name] = async () => {
    const tab = await openTab(w, h)
    if (!(await tab.open('mode=none'))) return { ok: false, detail: 'Lab did not start' }
    const phone = w < 600, btn = phone ? '.ac-share.is-compact' : '.ac-share'
    if (phone) { // phones start on the app Home: pick a view so the Shop pill and Share appear
      await tab.waitFor("!!d.querySelector('.ph-tile')")
      for (let i = 0; i < 40; i++) { await tab.lab("(() => { const t = [...d.querySelectorAll('.ph-tile')].find(b => /Forward View/.test(b.getAttribute('aria-label') || b.textContent)); t && t.click(); return true })()"); if (await tab.lab(`!!d.querySelector('${btn}')`)) break; await sleep(1000) }
    }
    await tab.lab("(w.__evs = [], w.addEventListener('accuphy-lab', e => { if (e.detail.event === 'share') w.__evs.push(e.detail.data.channel) }), true)")
    await tab.tap(btn); await sleep(600)
    const o = JSON.parse(await tab.lab("JSON.stringify((() => { const p = d.querySelector('.ac-share-pop'); if (!p) return { pops: 0 }; const r = p.getBoundingClientRect(); const pill = d.querySelector('.ac-shop:not(.ac-shop-wide)'); return { pops: d.querySelectorAll('.ac-share-pop').length, qr: Math.round(p.querySelector('.ac-share-qr svg').getBoundingClientRect().width), clearOfPill: pill ? r.bottom <= pill.getBoundingClientRect().top : true, field: p.querySelector('.ac-share-field').value } })())"))
    await tab.tap('.ac-share-copy'); await sleep(300)
    const label = await tab.lab("d.querySelector('.ac-share-copy').textContent"); const evs = await tab.lab('JSON.stringify(w.__evs)')
    await tab.esc(); await sleep(400); const after = await tab.lab("d.querySelectorAll('.ac-share-pop').length")
    await tab.close()
    const ok = o.pops === 1 && o.qr >= 160 && o.clearOfPill && /\/de-de\/pages\/lab\?utm_source=lab_share&utm_medium=referral&utm_content=copy/.test(o.field || '') && label === 'Copied ✓' && after === 0 && /qr_shown/.test(evs) && /copy/.test(evs)
    return { ok, detail: `popover=${o.pops} qr=${o.qr}px clearOfShopPill=${o.clearOfPill} copy→"${label}" events=${evs} afterEsc=${after}` }
  }
}
let failed = 0
for (const [name, fn] of Object.entries(scenarios)) {
  if (wanted.length && !wanted.includes(name)) continue
  let r; try { r = await fn() } catch (e) { r = { ok: false, detail: 'threw: ' + e.message } }
  if (!r.ok) failed++
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${name}  ${r.detail}`)
}
chrome.kill(); await sleep(800); server.close(); try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }) } catch { /* the temp folder is the OS's to clean */ }
console.log(failed ? `${failed} FAILED` : 'all passed'); process.exit(failed ? 1 : 0)
