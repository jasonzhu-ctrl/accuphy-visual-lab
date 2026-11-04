// MKT locked copy only: which views are behind the subscribe card, by store market. node scripts/dev/mkt-lock-rule-test.mjs
// #191 Combo / ice / Mini Panoramic; #240 PingLive Panoramic; #241 the US store page (in the store, market us = Mini only, #190): the
// Mini's Combo is free there, Panoramic and ice stay locked. Every other market, and the Lab opened on its own, keeps Combo locked.
const DIR = '2026-11-03-sonar-lake-bf'
let fail = 0, n = 0
const VIEWS = [['PL', 'down'], ['PL', 'forward'], ['PL', 'panoramic'], ['PLM', 'down'], ['PLM', 'forward'], ['PLM', 'combo'], ['PLM', 'panoramic'], ['PLM', 'ice'], ['PLM', 'liveice']]
const LOCK_ALL = ['PL:panoramic', 'PLM:combo', 'PLM:panoramic', 'PLM:ice']
const LOCK_US = ['PL:panoramic', 'PLM:panoramic', 'PLM:ice'] // PL is never shown on the US page (#190); Combo free (#241)
const cases = [
  { q: '?shop=/en-us&market=us', store: true, want: LOCK_US, mini: true, note: 'US store page' },
  { q: '?shop=/en-us', store: true, want: LOCK_US, mini: true, note: 'US root, no market' },
  { q: '?market=us', store: true, want: LOCK_US, mini: true, note: 'market us only' },
  { q: '?shop=/en-us&market=us', store: false, want: LOCK_ALL, mini: false, note: 'opened on its own: not in the store' },
  { q: '?shop=/&market=ca', store: true, want: LOCK_ALL, mini: false, note: 'Canada' },
  { q: '?shop=/fr&market=ca&lang=fr', store: true, want: LOCK_ALL, mini: false, note: 'Canada FR' },
  { q: '?shop=/&market=us', store: true, want: LOCK_US, mini: true, note: 'US visitor on the main-store root (bridge says us)' },
  { q: '?shop=/', store: true, want: LOCK_ALL, mini: false, note: 'US visitor on the main-store root (bridge says ca or nothing): the Canadian version' },
  { q: '?shop=/en-au&market=au', store: true, want: LOCK_ALL, mini: false, note: 'Australia' },
  { q: '?shop=/de-de&market=de&lang=de', store: true, want: LOCK_ALL, mini: false, note: 'Germany' },
  { q: '?shop=/fr-fr&market=fr&lang=fr', store: true, want: LOCK_ALL, mini: false, note: 'France' },
]
for (const c of cases) {
  const w = { location: { search: c.q, origin: 'https://lab.accuphy.ca', href: 'https://lab.accuphy.ca/mktbf2026/' + c.q, hostname: 'lab.accuphy.ca' }, addEventListener() {}, dispatchEvent() {} }
  w.self = w; w.top = c.store ? {} : w; w.parent = w.top // in the store = inside the store page's iframe
  globalThis.window = w; globalThis.document = { referrer: '' }
  const k = ++n
  const e = await import(`../../src/experiments/${DIR}/embed.js?case=${k}`)
  // locks.js imports './embed' — load a copy that points at this case's embed.js instance
  const fs = await import('fs'), os = await import('os'), path = await import('path')
  const src = fs.readFileSync(new URL(`../../src/experiments/${DIR}/locks.js`, import.meta.url), 'utf8').replace("from './embed'", `from ${JSON.stringify(new URL(`../../src/experiments/${DIR}/embed.js?case=${k}`, import.meta.url).href)}`)
  const f = path.join(os.tmpdir(), `mkt-locks-${process.pid}-${k}.mjs`); fs.writeFileSync(f, src)
  const { isLocked } = await import(f); fs.rmSync(f)
  const got = VIEWS.filter(([d, m]) => isLocked(d, m)).map(([d, m]) => `${d}:${m}`)
  const ok = got.join() === c.want.join() && e.miniOnly() === c.mini
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${(c.q + (c.store ? '' : ' (own)')).padEnd(40)} miniOnly=${e.miniOnly()} locked=${got.join(' ')}   · ${c.note}${ok ? '' : '   expected ' + c.want.join(' ')}`)
}
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0)
