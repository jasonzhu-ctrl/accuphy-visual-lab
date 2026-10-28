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
console.log(fail ? `${fail} FAILED` : `all ${cases.length} passed`); process.exit(fail ? 1 : 0)
