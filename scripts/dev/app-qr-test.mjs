// #200 (A8): the desktop store badges' QR codes go straight to the stores (links: docs/2026-11-01-app-qr-plan.md "11-01 改").
// Reads the two link lines from AppBadges.jsx (the .jsx cannot be imported in node), builds them for en and fr, checks them
// against the plan, and decodes each QR (the page's encoder, qrcode-generator level M) at 3, 2 and 1 px per module.
// node scripts/dev/app-qr-test.mjs
const DIR = process.env.LAB_DIR || '2026-09-23-sonar-lake-3d' // the lake folder under test; the BF locked copy: LAB_DIR=2026-11-03-sonar-lake-bf (#213)
import fs from 'fs'
import jsQR from 'jsqr'
import qrcode from 'qrcode-generator'
const src = fs.readFileSync(new URL(`../../src/experiments/${DIR}/AppBadges.jsx`, import.meta.url), 'utf8')
const line = (name) => (src.match(new RegExp(`export const ${name} = (\`[^\\n]*\`)`)) || [])[1]
const build = (name, LANG) => Function('LANG', `return ${line(name)}`)(LANG)
const expect = {
  APP_STORE: { en: 'https://apps.apple.com/app/id6743123048', fr: 'https://apps.apple.com/app/id6743123048?l=fr-CA' },
  PLAY: {
    en: 'https://play.google.com/store/apps/details?id=com.accuphy.sonar&hl=en_CA&referrer=utm_source%3Daccuphy-lab%26utm_medium%3Dqr',
    fr: 'https://play.google.com/store/apps/details?id=com.accuphy.sonar&hl=fr_CA&referrer=utm_source%3Daccuphy-lab%26utm_medium%3Dqr',
  },
}
const decode = (text, s) => {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make(); const n = qr.getModuleCount(), q = 4 * s, w = n * s + 2 * q
  const px = new Uint8ClampedArray(w * w * 4).fill(255)
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const i = ((q + r * s + y) * w + q + c * s + x) * 4; px[i] = px[i + 1] = px[i + 2] = 0 }
  return { data: jsQR(px, w, w)?.data, n }
}
let fail = 0, count = 0
for (const name of ['APP_STORE', 'PLAY']) for (const lang of ['en', 'fr']) {
  count++
  let got; try { got = build(name, lang) } catch (e) { got = 'ERR ' + e.message }
  const reads = [3, 2, 1].map((s) => decode(got, s))
  const ok = got === expect[name][lang] && reads.every((r) => r.data === got) && !/apps\.apple\.com\/[a-z]{2}\//.test(got)
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name} ${lang} → ${got}  (${reads[0].n}×${reads[0].n} modules, ${reads.every((r) => r.data === got) ? 'decodes to the same down to 1 px/module' : 'QR DECODED TO ' + reads.map((r) => r.data).join(' | ')})${ok ? '' : '   expected ' + expect[name][lang]}`)
}
console.log(fail ? `${fail} FAILED` : `all ${count} passed`); process.exit(fail ? 1 : 0)
