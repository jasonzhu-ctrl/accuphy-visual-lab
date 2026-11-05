// The Combo lock's sign-up (#191): without a Klaviyo list id no real host may unlock. node scripts/dev/signup-guard-test.mjs
const DIR = process.env.LAB_DIR || '2026-09-23-sonar-lake-3d' // the lake folder under test; the BF locked copy: LAB_DIR=2026-11-03-sonar-lake-bf (#213)
import fs from 'fs'
import os from 'os'
import path from 'path'
// signup.js may read the build's environment (the BF copy takes its list id from VITE_BF_LIST_ID, #213), which plain node lacks:
// load a copy of the file with import.meta.env swapped for globalThis.__LAB_ENV (signup.js imports nothing, so a copy runs as is)
const SRC = fs.readFileSync(new URL(`../../src/experiments/${DIR}/signup.js`, import.meta.url), 'utf8').replaceAll('import.meta.env', 'globalThis.__LAB_ENV')
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'signup-guard-')); let k = 0
globalThis.__LAB_ENV = {}
const load = () => { const f = path.join(TMP, `signup-${++k}.mjs`); fs.writeFileSync(f, SRC); return import(f) }
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v } }
const posts = [], bodies = []; globalThis.fetch = async (u, o) => { posts.push(u); bodies.push(JSON.parse(o.body)); return { ok: true, status: 202 } }
const cases = [
  { host: 'lab.accuphy.ca', list: null, refuses: true },
  { host: 'accuphy-lab.vercel.app', list: null, refuses: true },
  { host: 'shop.accuphy.com', list: null, refuses: true },
  { host: 'accuphy.myshopify.com', list: null, refuses: true },
  { host: 'jasonzhu-ctrl.github.io', list: null, refuses: false, test: true },
  { host: 'localhost', list: null, refuses: false, test: true },
  { host: 'lab.accuphy.ca', list: 'W24Qdc', refuses: false, sends: true },
]
let fail = 0, n = 0
for (const c of cases) {
  for (const k in store) delete store[k]; posts.length = 0
  globalThis.window = { location: { hostname: c.host } }
  const m = await load()
  m.KLAVIYO.listId = c.list
  let refused = false
  try { await m.submitSignup({ email: 'a@example.com', market: 'ca', region: 'na' }) } catch (e) { refused = e.message === 'not_ready' } // a Canadian visitor (W24Qdc is Canada's list, #244)
  const ok = refused === c.refuses && m.isSignedUp() === !c.refuses && m.signupTestMode() === !!c.test && posts.length === (c.sends ? 1 : 0)
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.host} list=${c.list} → ${refused ? 'refused' : 'unlocked'}${m.signupTestMode() ? ' (test mode)' : ''}${posts.length ? ' (sent)' : ''}`)
}
// what Klaviyo receives (#191)
{
  globalThis.window = { location: { hostname: 'lab.accuphy.ca', search: '' } }; bodies.length = 0
  const m = await load()
  m.KLAVIYO.listId = 'W24Qdc'
  // a copy that sends each country to its own list (#244: the BF copy) sends a US visitor to the US list, never Canada's
  const want = typeof m.listFor === 'function' ? (m.KLAVIYO.listIdUs = 'SPeeP6') : 'W24Qdc'
  await m.submitSignup({ email: 'a@example.com', language: 'fr', market: 'us', view: 'combo', product: 'pinglive-mini', region: 'na' })
  const a = bodies[0].data.attributes, pr = a.profile.data.attributes.properties
  const ok = a.custom_source === 'Accuphy Lab' && pr.signup_channel === 'lab_unlock' && pr.signup_language === 'fr' && pr.signup_market === 'us' && pr.lab_scene === 'combo' && pr.lab_product === 'pinglive-mini' && bodies[0].data.relationships.list.data.id === want
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} Klaviyo body ${JSON.stringify(pr)}`)
}
// the email link (#191): unlocks without a sign-up, and only with the exact value
for (const c of [{ q: '?lab_unlock=sub', want: true }, { q: '?market=us&lab_unlock=sub', want: true }, { q: '?lab_unlock=1', want: false }, { q: '', want: false }]) {
  for (const k in store) delete store[k]; posts.length = 0
  globalThis.window = { location: { hostname: 'lab.accuphy.ca', search: c.q } }
  const m = await load()
  const got = m.isSignedUp()
  globalThis.window.location.search = ''
  const kept = m.isSignedUp() // remembered once the parameter is gone
  const ok = got === c.want && kept === c.want && posts.length === 0
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} email link ${JSON.stringify(c.q)} → ${got}, then ${kept}`)
}
// the list id as built: never in the source. The base has no way to set it (always null); the BF copy takes it only from the
// build's VITE_BF_LIST_ID, and only a 6-character Klaviyo id (#213)
{
  globalThis.window = { location: { hostname: 'localhost', search: '' } }
  const usesEnv = SRC.includes('globalThis.__LAB_ENV.VITE_BF_LIST_ID')
  for (const [env, want] of [[{}, null], [{ VITE_BF_LIST_ID: 'W24Qdc' }, usesEnv ? 'W24Qdc' : null], [{ VITE_BF_LIST_ID: 'not an id' }, null]]) {
    globalThis.__LAB_ENV = env
    const got = (await load()).KLAVIYO.listId
    const ok = got === want; if (!ok) fail++
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${DIR}/signup.js built with ${JSON.stringify(env)} → listId=${JSON.stringify(got)}${ok ? '' : '   expected ' + JSON.stringify(want)}`)
  }
  globalThis.__LAB_ENV = {}
}
// one list per country (#244 Canada / US / Australia, #247 Europe by VITE_BF_LISTS_EU; Klaviyo handoff 2026-11-05): only in copies that
// route by country (the BF copy). Region and market as UnlockCard passes them: listRegion({ market, shop, lang }) and shareMarket().
// The ids below stand in for the go-live build's environment; the build string itself belongs to "Lab 营销版".
if (SRC.includes('export const listFor')) {
  const EU = 'de:VGcbFE,at:VGcbFE,ch:VGcbFE,fr:Usa6sq,ch-fr:Usa6sq,nl:XpYNQK,be-nl:XpYNQK,lu-nl:XpYNQK,be:XpYNQK,be-fr:TzfgMB,lu-fr:TzfgMB,lu:TzfgMB,be-de:TzfgMB,lu-de:TzfgMB,pl:R9NkEv,ro:RGc8VJ,lv:RGc8VJ,ee:RGc8VJ'
  const FULL = { VITE_BF_LIST_ID: 'W24Qdc', VITE_BF_LIST_ID_US: 'SPeeP6', VITE_BF_LIST_ID_AU: 'Scdcct', VITE_BF_LISTS_EU: EU }
  const route = [
    // [what, env, { market, shop, lang } as the store page gives them, list it must go to (null = refused, nothing sent, Combo stays shut)]
    ['Canada', FULL, { market: 'ca', shop: '' }, 'W24Qdc'],
    ['Canada, French', FULL, { market: 'ca', shop: '/fr', lang: 'fr' }, 'W24Qdc'],
    ['US', FULL, { market: 'us', shop: '/en-us' }, 'SPeeP6'],
    ['Australia', FULL, { market: 'au', shop: '/en-au' }, 'Scdcct'],
    ['Germany', FULL, { market: 'de', shop: '/de-de', lang: 'de' }, 'VGcbFE'],
    ['Austria', FULL, { market: 'at', lang: 'de' }, 'VGcbFE'],
    ['Switzerland, French', FULL, { market: 'ch', lang: 'fr' }, 'Usa6sq'],
    ['France', FULL, { market: 'fr', lang: 'fr' }, 'Usa6sq'],
    ['Belgium, French', FULL, { market: 'be', lang: 'fr' }, 'TzfgMB'],
    ['Belgium, Dutch', FULL, { market: 'be', lang: 'nl' }, 'XpYNQK'],
    ['Belgium, English', FULL, { market: 'be' }, 'XpYNQK'],
    ['Netherlands', FULL, { market: 'nl', lang: 'nl' }, 'XpYNQK'],
    ['Poland', FULL, { market: 'pl', lang: 'pl' }, 'R9NkEv'],
    ['Latvia', FULL, { market: 'lv', lang: 'lv' }, 'RGc8VJ'],
    ['Romania', FULL, { market: 'ro' }, 'RGc8VJ'],
    ['no market at all', FULL, {}, null],
    ['no market, "/" root', FULL, { shop: '' }, null],
    ['European country with no list (Italy)', FULL, { market: 'it' }, null],
    ['German text on the Canadian market', FULL, { market: 'ca', shop: '', lang: 'de' }, null],
    ['US with the US list missing', { ...FULL, VITE_BF_LIST_ID_US: '' }, { market: 'us', shop: '/en-us' }, null],
    ['Germany with the European lists missing', { ...FULL, VITE_BF_LISTS_EU: '' }, { market: 'de', lang: 'de' }, null],
    ['bad entries in VITE_BF_LISTS_EU are dropped', { ...FULL, VITE_BF_LISTS_EU: 'DE:VGcbFE,de:not-an-id,pl' }, { market: 'de', lang: 'de' }, null],
  ]
  for (const [what, env, given, want] of route) {
    for (const k in store) delete store[k]; posts.length = 0; bodies.length = 0
    globalThis.__LAB_ENV = env
    globalThis.window = { location: { hostname: 'lab.accuphy.ca', search: '' } }
    const m = await load()
    const lang = given.lang || 'en', region = m.listRegion({ market: given.market ?? null, shop: given.shop ?? null, lang })
    let refused = false
    try { await m.submitSignup({ email: 'a@example.com', language: lang, market: given.market, region }) } catch (e) { refused = e.message === 'not_ready' }
    const got = bodies[0]?.data.relationships.list.data.id ?? null
    const ok = got === want && refused === !want && posts.length === (want ? 1 : 0) && m.isSignedUp() === !!want
    if (!ok) fail++
    console.log(`${ok ? 'OK  ' : 'FAIL'} list for ${what} (${region}) → ${got ?? 'refused'}${ok ? '' : '   expected ' + (want ?? 'refused')}`)
  }
  globalThis.__LAB_ENV = {}
}
// retries (Jason 11-05 via HQ): a Klaviyo 5xx or a network error is retried twice in the background; if all three tries fail, no
// success, no unlock (and the card sends no `signup`, it only fires after submitSignup resolves). A 4xx is not retried. Only in a
// copy that declares `export const SEND_TRIES` (the BF copy, written by "Lab 营销版"); the waits between tries are skipped here.
if (/export const SEND_TRIES\b/.test(SRC)) {
  const realTimeout = globalThis.setTimeout
  globalThis.setTimeout = (fn) => { fn(); return 0 }
  const answer = (r) => r === 'net' ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve({ ok: r < 400, status: r })
  const retry = [
    // [what, Klaviyo's answers in order, tries it must make, unlocked]
    ['503 then OK', [503, 202], 2, true],
    ['network error then OK', ['net', 202], 2, true],
    ['503, 503, then OK', [503, 503, 202], 3, true],
    ['503 three times', [503, 503, 503], 3, false],
    ['network error three times', ['net', 'net', 'net'], 3, false],
    ['500, network error, 502', [500, 'net', 502], 3, false],
    ['400: not retried', [400, 202], 1, false],
    ['429: not retried', [429, 202], 1, false],
  ]
  globalThis.__LAB_ENV = { VITE_BF_LIST_ID: 'W24Qdc' }
  for (const [what, answers, tries, unlocked] of retry) {
    for (const k in store) delete store[k]; posts.length = 0; bodies.length = 0
    globalThis.window = { location: { hostname: 'lab.accuphy.ca', search: '' } }
    const m = await load()
    const queue = [...answers]
    globalThis.fetch = async (u, o) => { posts.push(u); bodies.push(JSON.parse(o.body)); return answer(queue.shift()) }
    let err = null
    try { await m.submitSignup({ email: 'a@example.com', market: 'ca', region: 'na' }) } catch (e) { err = e.message }
    const same = bodies.every((b) => JSON.stringify(b) === JSON.stringify(bodies[0])) // each try sends the same sign-up
    const ok = posts.length === tries && same && (unlocked ? err === null : err === 'send_failed') && m.isSignedUp() === unlocked
    if (!ok) fail++
    console.log(`${ok ? 'OK  ' : 'FAIL'} retry: ${what} → ${posts.length} tries, ${err ? 'failed (' + err + ')' : 'unlocked'}${ok ? '' : `   expected ${tries} tries, ${unlocked ? 'unlocked' : 'failed (send_failed), still locked'}`}`)
  }
  globalThis.setTimeout = realTimeout
  globalThis.fetch = async (u, o) => { posts.push(u); bodies.push(JSON.parse(o.body)); return { ok: true, status: 202 } }
  globalThis.__LAB_ENV = {}
}
fs.rmSync(TMP, { recursive: true, force: true })
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0)
