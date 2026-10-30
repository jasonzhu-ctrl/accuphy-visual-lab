// "Send to a friend" (#188): the share link by market, and the QR decodes to exactly that link. node scripts/dev/share-url-test.mjs
import jsQR from 'jsqr'
import qrcode from 'qrcode-generator'
const cases = [
  { shop: '/', expect: 'https://shop.accuphy.com/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_ca' },
  { shop: '/fr', expect: 'https://shop.accuphy.com/fr/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_ca' },
  { shop: '/en-us', expect: 'https://shop.accuphy.com/en-us/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_us' },
  { shop: '/de-de', expect: 'https://shop.accuphy.com/de-de/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_de' },
  { shop: '/fr-benelux', expect: 'https://shop.accuphy.com/fr-benelux/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_be' },
  { shop: '/fr-fr', expect: 'https://shop.accuphy.com/fr-fr/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_fr', note: 'France' },
  { shop: '/nl-benelux', expect: 'https://shop.accuphy.com/nl-benelux/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_be' },
  { shop: '/en-ro', expect: 'https://shop.accuphy.com/en-ro/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_ro' },
  { shop: '/ro-ro', expect: 'https://shop.accuphy.com/ro-ro/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_ro' },
  { shop: '/en-pl', expect: 'https://shop.accuphy.com/en-pl/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_pl', note: 'from the root' },
  { shop: '/fr', market: 'us', expect: 'https://shop.accuphy.com/fr/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_us', note: 'the bridge market param wins' },
  { shop: '/en-pl', market: 'pl', expect: 'https://shop.accuphy.com/en-pl/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_pl' },
  { shop: null, lang: 'fr', expect: 'https://shop.accuphy.com/fr/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_ca', note: 'no shop, ?lang=fr' },
  { shop: null, expect: 'https://shop.accuphy.com/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=qr&utm_campaign=bf2026_lab_ca', note: 'nothing: Canada' },
  { shop: '/en-us', medium: 'copy', expect: 'https://shop.accuphy.com/en-us/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=copy&utm_campaign=bf2026_lab_us' },
]
const decode = (text, s = 4) => { // the same encoder as the page, rendered to pixels with a 4-module quiet zone, read back with jsQR
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make(); const n = qr.getModuleCount(), q = 4 * s, w = n * s + 2 * q
  const px = new Uint8ClampedArray(w * w * 4).fill(255)
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const i = ((q + r * s + y) * w + q + c * s + x) * 4; px[i] = px[i + 1] = px[i + 2] = 0 }
  return jsQR(px, w, w)?.data
}
let fail = 0, n = 0
for (const c of cases) {
  const search = '?x=1' + (c.shop != null ? `&shop=${encodeURIComponent(c.shop)}` : '') + (c.market ? `&market=${c.market}` : '') + (c.lang ? `&lang=${c.lang}` : '')
  const w = { location: { search, origin: 'https://shop.accuphy.com' }, addEventListener() {}, dispatchEvent() {} }; w.self = w; w.top = w; w.parent = w
  globalThis.window = w; globalThis.document = { referrer: '' }
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/embed.js?share=${++n}`)
  const got = m.shareUrl(c.medium || 'qr'); const dec = c.medium ? null : decode(got)
  const onScreen = c.medium ? true : [3, 2, 1].every((s) => decode(got, s) === got) // the page shows the code at 168 CSS px ≈ 3–4 px per module; 1 px/module is the harsh case
  const ok = got === c.expect && (c.medium || dec === c.expect) && onScreen; if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} shop=${JSON.stringify(c.shop)}${c.market ? ' market=' + c.market : ''}${c.lang ? ' lang=' + c.lang : ''}${c.medium ? ' ' + c.medium : ''} → ${got}${c.medium ? '' : dec === got ? '  (QR decodes to the same, down to 1 px/module)' : '  QR DECODED TO ' + dec}${ok ? '' : '   expected ' + c.expect}${c.note ? '   · ' + c.note : ''}`)
}
// the subscribers' email link never spreads through a share (#191)
{
  const w = { location: { search: '?shop=/en-us&market=us&lab_unlock=sub', origin: 'https://shop.accuphy.com' }, addEventListener() {}, dispatchEvent() {} }; w.self = w; w.top = w; w.parent = w
  globalThis.window = w
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/embed.js?share=${++n}`)
  const ok = !m.shareUrl('copy').includes('lab_unlock'); if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} lab_unlock stays out of the share link`)
}
console.log(fail ? `${fail} FAILED` : `all ${cases.length + 1} passed`); process.exit(fail ? 1 : 0)
