// "Send to a friend" (#188): the share link by market, and the QR decodes to exactly that link. node scripts/dev/share-url-test.mjs
import jsQR from 'jsqr'
import qrcode from 'qrcode-generator'
const cases = [
  { shop: '/', expect: 'https://shop.accuphy.com/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_ca' },
  { shop: '/fr', expect: 'https://shop.accuphy.com/fr/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_fr' },
  { shop: '/en-us', expect: 'https://shop.accuphy.com/en-us/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_us' },
  { shop: '/de-de', expect: 'https://shop.accuphy.com/de-de/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_de' },
  { shop: '/fr-benelux', expect: 'https://shop.accuphy.com/fr-benelux/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_be' },
  { shop: '/en-pl', market: 'pl', expect: 'https://shop.accuphy.com/en-pl/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_pl' },
  { shop: null, lang: 'fr', expect: 'https://shop.accuphy.com/fr/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_fr', note: 'no shop, ?lang=fr' },
  { shop: null, expect: 'https://shop.accuphy.com/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr&utm_campaign=bf2026_lab_ca', note: 'nothing: Canada' },
  { shop: '/en-us', medium: 'copy', expect: 'https://shop.accuphy.com/en-us/pages/lab?ref=share&utm_source=lab_share&utm_medium=copy&utm_campaign=bf2026_lab_us' },
]
const decode = (text) => { // the same encoder as the page, rendered to pixels with a quiet zone, read back with jsQR
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make(); const n = qr.getModuleCount(), s = 4, q = 4 * s, w = n * s + 2 * q
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
  const ok = got === c.expect && (c.medium || dec === c.expect); if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} shop=${JSON.stringify(c.shop)}${c.market ? ' market=' + c.market : ''}${c.lang ? ' lang=' + c.lang : ''}${c.medium ? ' ' + c.medium : ''} → ${got}${c.medium ? '' : dec === got ? '  (QR decodes to the same)' : '  QR DECODED TO ' + dec}${ok ? '' : '   expected ' + c.expect}${c.note ? '   · ' + c.note : ''}`)
}
console.log(fail ? `${fail} FAILED` : `all ${cases.length} passed`); process.exit(fail ? 1 : 0)
