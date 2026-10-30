// The Shop link by market (website #228): node scripts/dev/shop-url-test.mjs
// Stubs the browser globals embed.js reads, then builds the link for each market root the store can pass.
const cases = [
  { shop: '/', lang: '', expect: 'https://shop.accuphy.com/products/pinglive-sonar' },
  { shop: '/fr', lang: '', expect: 'https://shop.accuphy.com/fr/products/pinglive-sonar' },
  { shop: '/en-us', lang: '', expect: 'https://shop.accuphy.com/en-us/products/pinglive-sonar' },
  { shop: '/de-de', lang: '', expect: 'https://shop.accuphy.com/de-de/products/pinglive-sonar' },
  { shop: '/fr-benelux', lang: '', expect: 'https://shop.accuphy.com/fr-benelux/products/pinglive-sonar' },
  { shop: '/en-pl', lang: '', expect: 'https://shop.accuphy.com/en-pl/products/pinglive-sonar' },
  { shop: '/en-ro', lang: '', expect: 'https://shop.accuphy.com/en-ro/products/pinglive-sonar' },
  { shop: '/de-de', lang: 'fr', expect: 'https://shop.accuphy.com/de-de/products/pinglive-sonar', note: 'shop wins over ?lang' },
  { shop: 'javascript:alert(1)', lang: '', expect: 'https://shop.accuphy.com/products/pinglive-sonar', note: 'bad value → today\'s rule' },
  { shop: '/en-us/products/x', lang: 'fr', expect: 'https://shop.accuphy.com/fr/products/pinglive-sonar', note: 'bad value + ?lang=fr → /fr' },
  { shop: null, lang: '', expect: 'https://shop.accuphy.com/products/pinglive-sonar', note: 'missing' },
  { shop: null, lang: 'fr', expect: 'https://shop.accuphy.com/fr/products/pinglive-sonar', note: 'missing + ?lang=fr' },
  { shop: '/de-de', lang: '', mount: true, expect: 'https://shop.accuphy.com/de-de/products/pinglive-sonar', note: 'data-shop via mount (theme-mounted)' },
  { shop: '/EN-US', lang: '', expect: 'https://shop.accuphy.com/en-us/products/pinglive-sonar', note: 'upper case accepted' },
  { shop: '/en-us', lang: '', device: 'PLM', expect: 'https://shop.accuphy.com/en-us/products/pinglive-mini' },
  { shop: '/de-de', lang: '', standalone: true, expect: 'https://shop.accuphy.com/de-de/products/pinglive-sonar?utm_source=accuphy_lab&utm_medium=referral&utm_campaign=bf2026_lab_ca', note: 'opened on its own: default utm' },
]
let fail = 0, n = 0
for (const c of cases) {
  const search = (c.shop != null && !c.mount ? `?shop=${encodeURIComponent(c.shop)}` : '?x=1') + (c.lang ? `&lang=${c.lang}` : '')
  const w = { location: { search, origin: 'https://shop.accuphy.com', href: 'https://shop.accuphy.com/pages/lab' + search }, addEventListener() {}, dispatchEvent() {} }
  w.self = w; w.top = w; w.parent = w
  if (!c.standalone) w.Shopify = { analytics: { publish() {} } } // theme-mounted = in the store, no utm
  globalThis.window = w; globalThis.document = { referrer: '' }
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/embed.js?case=${++n}`)
  if (c.mount) m.setEmbedOptions({ shop: c.shop })
  const got = m.shopUrl(c.device || 'PL')
  const ok = got === c.expect; if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} shop=${JSON.stringify(c.shop)}${c.lang ? ' lang=' + c.lang : ''}${c.mount ? ' (mount)' : ''}${c.standalone ? ' (standalone)' : ''}${c.device ? ' ' + c.device : ''} → ${got}${ok ? '' : '   expected ' + c.expect}${c.note ? '   · ' + c.note : ''}`)
}
// Mini only in the store's US market (#190): the iframe path, the theme-mounted path, and everything that must stay as it was
const only = [
  { q: '?shop=/en-us&market=us', framed: true, expect: true, note: 'iframe, US' },
  { q: '?shop=/en-us', framed: true, expect: true, note: 'iframe, root only' },
  { q: '?shop=/fr&market=us', framed: true, expect: true, note: 'iframe, French page in the US' },
  { q: '?shop=/&market=ca', framed: true, expect: false, note: 'iframe, Canada' },
  { q: '?shop=/de-de&market=de', framed: true, expect: false, note: 'iframe, Germany' },
  { q: '', framed: true, expect: false, note: 'iframe, nothing passed' },
  { q: '', mount: { shop: '/en-us', market: 'us' }, expect: true, note: 'theme-mounted, US' },
  { q: '', mount: { shop: '/', market: 'ca' }, expect: false, note: 'theme-mounted, Canada' },
  { q: '?shop=/en-us&market=us', expect: false, note: 'opened on its own: never changes' },
  { q: '', expect: false, note: 'opened on its own, no params' },
]
for (const c of only) {
  const w = { location: { search: c.q, origin: 'https://lab.accuphy.ca', href: 'https://lab.accuphy.ca/' + c.q }, addEventListener() {}, dispatchEvent() {} }
  w.self = w; w.top = c.framed ? {} : w; w.parent = w.top
  if (c.mount) w.Shopify = { analytics: { publish() {} } }
  globalThis.window = w; globalThis.document = { referrer: '' }
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/embed.js?case=${++n}`)
  if (c.mount) m.setEmbedOptions(c.mount)
  const got = m.miniOnly()
  if (got !== c.expect) fail++
  console.log(`${got === c.expect ? 'OK  ' : 'FAIL'} miniOnly ${JSON.stringify(c.q)} ${c.note} → ${got}`)
}
console.log(fail ? `${fail} FAILED` : `all ${cases.length + only.length} passed`); process.exit(fail ? 1 : 0)
