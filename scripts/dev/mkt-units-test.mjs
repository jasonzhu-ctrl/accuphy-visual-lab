// MKT locked copy only (#245, Jason 11-04): which store pages open in metres. node scripts/dev/mkt-units-test.mjs
// French in Europe (/fr-fr, /fr-benelux, or a European market) → metres; Canada's French (/fr) and English stay in feet.
const DIR = '2026-11-03-sonar-lake-bf'
let fail = 0, n = 0
const cases = [
  ['?shop=/fr-fr&market=fr&lang=fr', true, 'France'],
  ['?shop=/fr-benelux&market=be&lang=fr', true, 'Belgium FR'],
  ['?shop=/fr-benelux&market=lu&lang=fr', true, 'Luxembourg FR'],
  ['?shop=/fr&market=ca&lang=fr', false, 'Canada FR'],
  ['?shop=/fr&lang=fr', false, 'Canada FR, no market'],
  ['?shop=/&market=ca', false, 'Canada EN'],
  ['?shop=/en-us&market=us', false, 'US'],
  ['?shop=/en-au&market=au', false, 'Australia'],
  ['?lang=fr', false, 'only ?lang=fr (not the store): feet as before'],
]
for (const [q, want, note] of cases) {
  const w = { location: { search: q, origin: 'https://lab.accuphy.ca', href: 'https://lab.accuphy.ca/mktbf2026/' + q, hostname: 'lab.accuphy.ca' }, addEventListener() {}, dispatchEvent() {} }
  w.self = w; w.top = {}; w.parent = {}
  globalThis.window = w; globalThis.document = { referrer: '' }
  const e = await import(`../../src/experiments/${DIR}/embed.js?case=${++n}`)
  const got = e.euFrench(); if (got !== want) fail++
  console.log(`${got === want ? 'OK  ' : 'FAIL'} ${q.padEnd(40)} metres=${got}   · ${note}`)
}
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0)
