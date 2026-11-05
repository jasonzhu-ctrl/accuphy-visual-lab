// MKT locked copy only (#244: Canada / US / Australia each their own list by signup_market; checklist §6.5, Jason 11-04: “欧洲需要做两步的”): which Klaviyo list the lock card sends to, by market.
// node scripts/dev/mkt-list-route-test.mjs
// Canada (/, /fr), US (/en-us), Australia (/en-au) → VITE_BF_LIST_ID (W24Qdc, single opt-in); Europe and anything unknown →
// VITE_BF_LIST_ID_EU (double opt-in). A European visitor must never reach W24Qdc; with the EU id empty, Europe behaves like an
// unfilled build (refused on the real hosts, test mode on test links).
import fs from 'fs'
import os from 'os'
import path from 'path'
const DIR = '2026-11-03-sonar-lake-bf'
let fail = 0, n = 0
const check = (ok, line) => { if (!ok) fail++; console.log(`${ok ? 'OK  ' : 'FAIL'} ${line}`) }

// 1. the whole chain as the page runs it: the store page's ?shop= / ?market= / ?lang= → embed.js → listRegion
const signupSrc = fs.readFileSync(new URL(`../../src/experiments/${DIR}/signup.js`, import.meta.url), 'utf8').replaceAll('import.meta.env', 'globalThis.__LAB_ENV')
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mkt-route-')); let k = 0
globalThis.__LAB_ENV = {}
const loadSignup = () => { const f = path.join(TMP, `signup-${++k}.mjs`); fs.writeFileSync(f, signupSrc); return import(f) }
const routes = [
  // North America + Australia
  { q: '?shop=/', want: 'na', mk: 'ca', note: 'Canada EN' },
  { q: '?shop=/fr&lang=fr', want: 'na', mk: 'ca', note: 'Canada FR' },
  { q: '?shop=/en-us&market=us', want: 'na', mk: 'us', note: 'US' },
  { q: '?shop=/en-au&market=au', want: 'na', mk: 'au', note: 'Australia' },
  { q: '?shop=/&market=ca', want: 'na', mk: 'ca', note: 'Canada with market' },
  { q: '?market=us', want: 'na', mk: 'us', note: 'market only' },
  { q: '?shop=/&market=us', want: 'na', mk: 'us', note: 'US visitor on the main-store root, bridge says us → US list' },
  { q: '?shop=/en-au', want: 'na', mk: 'au', note: 'Australia root, no market' },
  // Europe
  { q: '?shop=/fr-fr&lang=fr&market=fr', want: 'eu', note: 'France' },
  { q: '?shop=/nl-benelux&lang=nl&market=nl', want: 'eu', note: 'Benelux NL' },
  { q: '?shop=/fr-benelux&lang=fr&market=be', want: 'eu', note: 'Benelux FR' },
  { q: '?shop=/de-de&lang=de&market=de', want: 'eu', note: 'Germany' },
  { q: '?shop=/de-de&lang=de&market=at', want: 'eu', note: 'Austria on /de-de' },
  { q: '?shop=/en-pl&lang=pl&market=pl', want: 'eu', note: 'Poland after the 302' },
  { q: '?shop=/&lang=pl', want: 'eu', note: 'Poland link on the root, before the 302' },
  { q: '?shop=/ro-ro&lang=lv&market=lv', want: 'eu', note: 'Latvia on /ro-ro' },
  { q: '?shop=/en-ro&lang=lv', want: 'eu', note: 'Latvia on /en-ro (#238)' },
  { q: '?shop=/&lang=lv', want: 'eu', note: 'Latvia link on the root' },
  { q: '?shop=/de-de', want: 'eu', note: 'German root, no lang' },
  // unknown or contradictory → Europe's rule
  { q: '', want: 'eu', note: 'opened on its own: nothing passed' },
  { q: '?lang=fr', want: 'eu', note: 'only ?lang=fr (France or Quebec unknown)' },
  { q: '?shop=/&market=gb', want: 'eu', note: 'a market not on the list' },
  { q: '?shop=/de-de&market=ca', want: 'eu', note: 'market and root disagree' },
  { q: '?shop=/en-us&lang=de', want: 'eu', note: 'a European language on a US root' },
  { q: '?shop=javascript:alert(1)', want: 'eu', note: 'bad root, nothing else' },
]
const sig = await loadSignup()
for (const c of routes) {
  const w = { location: { search: c.q, origin: 'https://shop.accuphy.com', href: 'https://shop.accuphy.com/pages/sonarlab-mktbf2026' + c.q, hostname: 'lab.accuphy.ca' }, addEventListener() {}, dispatchEvent() {} }
  w.self = w; w.top = {}; w.parent = {}
  globalThis.window = w; globalThis.document = { referrer: '' }
  const e = await import(`../../src/experiments/${DIR}/embed.js?case=${++n}`)
  const lang = (new URLSearchParams(c.q).get('lang') || 'en')
  const got = sig.listRegion({ market: e.passedMarket(), shop: e.shopRoot(), lang: ['en', 'fr', 'de', 'nl', 'pl', 'lv'].includes(lang) ? lang : 'en' })
  const sm = e.shareMarket() // signup_market = the country list (#244)
  check(got === c.want && (!c.mk || sm === c.mk), `${(c.q || '(nothing)').padEnd(44)} → ${got}${got === 'na' ? ' ' + sm : ''}   · ${c.note}`)
}

// 2. which list is sent, with the go-live ids filled or not (fetch stubbed: nothing leaves this script)
const store = {}
globalThis.localStorage = { getItem: (x) => store[x] ?? null, setItem: (x, v) => { store[x] = v }, removeItem: (x) => { delete store[x] } }
const bodies = []; globalThis.fetch = async (u, o) => { bodies.push(JSON.parse(o.body)); return { ok: true, status: 202 } } // as Klaviyo answers: 202, empty body
const EU = 'de:DEtst1,fr:FRtst1,be-nl:BEnl01,be-fr:BEfr01,ee:ROtst1,lv:ROtst1,ro:ROtst1'
const ALL = { VITE_BF_LIST_ID: 'W24Qdc', VITE_BF_LIST_ID_US: 'SPeeP6', VITE_BF_LIST_ID_AU: 'Scdcct' }
const sends = [
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc' }, region: 'na', want: 'W24Qdc' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc' }, region: 'eu', want: 'refused', note: 'EU id empty: never W24Qdc' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc', VITE_BF_LIST_ID_EU: 'EUtst1' }, region: 'eu', want: 'EUtst1' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc', VITE_BF_LIST_ID_EU: 'EUtst1' }, region: 'na', want: 'W24Qdc' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID_EU: 'EUtst1' }, region: 'na', want: 'refused', note: 'NA id empty: never the EU list' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc', VITE_BF_LIST_ID_EU: 'not an id' }, region: 'eu', want: 'refused', note: 'bad EU id ignored' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc' }, region: undefined, want: 'refused', note: 'no region given → Europe' },
  // one list per country (#244): the market decides; a missing country id is refused, never another country's list
  { host: 'lab.accuphy.ca', env: ALL, region: 'na', market: 'ca', want: 'W24Qdc' },
  { host: 'lab.accuphy.ca', env: ALL, region: 'na', market: 'us', want: 'SPeeP6' },
  { host: 'lab.accuphy.ca', env: ALL, region: 'na', market: 'au', want: 'Scdcct' },
  { host: 'lab.accuphy.ca', env: ALL, region: 'na', market: 'gb', want: 'refused', note: 'not ca/us/au' },
  { host: 'lab.accuphy.ca', env: ALL, region: 'na', market: null, want: 'refused', note: 'no market' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc' }, region: 'na', market: 'us', want: 'refused', note: 'US id empty: never Canada' },
  { host: 'lab.accuphy.ca', env: { VITE_BF_LIST_ID: 'W24Qdc' }, region: 'na', market: 'au', want: 'refused', note: 'AU id empty: never Canada' },
  { host: 'lab.accuphy.ca', env: ALL, region: 'eu', market: 'us', want: 'refused', note: 'EU id empty: never a NA list' },
  // Europe: one list per country (#247); country-language first (Benelux), then the country; no list → refused, never another country's
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'de', lang: 'de', want: 'DEtst1' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'at', lang: 'de', want: 'refused', note: 'Austria has no list in this map' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'be', lang: 'nl', want: 'BEnl01' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'be', lang: 'fr', want: 'BEfr01' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'fr', lang: 'fr', want: 'FRtst1' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'ee', lang: 'lv', want: 'ROtst1', note: 'Latvian IP read as ee by Shopify' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'pl', lang: 'pl', want: 'refused', note: 'Poland not in this map' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: EU }, region: 'eu', market: 'us', lang: 'de', want: 'refused', note: 'never a NA list' },
  { host: 'lab.accuphy.ca', env: { ...ALL, VITE_BF_LISTS_EU: 'de:bad,xx' }, region: 'eu', market: 'de', lang: 'de', want: 'refused', note: 'bad entries ignored' },
  { host: 'jasonzhu-ctrl.github.io', env: {}, region: 'na', want: 'test' },
  { host: 'jasonzhu-ctrl.github.io', env: {}, region: 'eu', want: 'test' },
  { host: 'localhost', env: {}, region: 'eu', want: 'test' },
]
for (const c of sends) {
  for (const x in store) delete store[x]; bodies.length = 0
  globalThis.__LAB_ENV = c.env; globalThis.window = { location: { hostname: c.host, search: '' } }
  const m = await loadSignup()
  let got, mk
  try {
    mk = 'market' in c ? c.market : (c.region === 'na' ? 'ca' : 'de')
    await m.submitSignup({ email: 'a@example.com', language: c.lang || 'de', market: mk, view: 'combo', product: 'pinglive-mini', ...(c.region ? { region: c.region } : {}) })
    got = bodies.length ? bodies[0].data.relationships.list.data.id : (m.signupTestMode(c.region, mk, c.lang || 'de') ? 'test' : 'unlocked, nothing sent')
  } catch (e) { got = e.message === 'not_ready' ? 'refused' : 'error ' + e.message }
  const props = bodies[0]?.data.attributes.profile.data.attributes.properties
  const propsOk = !props || (props.signup_page === 'accuphy-lab' && props.signup_channel === 'lab_unlock' && props.signup_market === mk && props.signup_language === (c.lang || 'de'))
  check(got === c.want && propsOk && !(c.region !== 'na' && got === 'W24Qdc'), `${c.host.padEnd(24)} ${JSON.stringify(c.env).padEnd(56)} ${String(c.region).padEnd(9)} ${String(mk).padEnd(4)} → ${got}${c.note ? '   · ' + c.note : ''}`)
}
fs.rmSync(TMP, { recursive: true, force: true })
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0)
