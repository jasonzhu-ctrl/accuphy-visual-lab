// The Combo lock's sign-up (#191): without a Klaviyo list id no real host may unlock. node scripts/dev/signup-guard-test.mjs
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v } }
const posts = [], bodies = []; globalThis.fetch = async (u, o) => { posts.push(u); bodies.push(JSON.parse(o.body)); return { ok: true } }
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
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/signup.js?case=${++n}`)
  m.KLAVIYO.listId = c.list
  let refused = false
  try { await m.submitSignup({ email: 'a@example.com' }) } catch (e) { refused = e.message === 'not_ready' }
  const ok = refused === c.refuses && m.isSignedUp() === !c.refuses && m.signupTestMode() === !!c.test && posts.length === (c.sends ? 1 : 0)
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.host} list=${c.list} → ${refused ? 'refused' : 'unlocked'}${m.signupTestMode() ? ' (test mode)' : ''}${posts.length ? ' (sent)' : ''}`)
}
// what Klaviyo receives (#191)
{
  globalThis.window = { location: { hostname: 'lab.accuphy.ca', search: '' } }; bodies.length = 0
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/signup.js?case=${++n}`)
  m.KLAVIYO.listId = 'W24Qdc'
  await m.submitSignup({ email: 'a@example.com', language: 'fr', market: 'us', view: 'combo', product: 'pinglive-mini' })
  const a = bodies[0].data.attributes, pr = a.profile.data.attributes.properties
  const ok = a.custom_source === 'Accuphy Lab' && pr.signup_channel === 'lab_unlock' && pr.signup_language === 'fr' && pr.signup_market === 'us' && pr.lab_scene === 'combo' && pr.lab_product === 'pinglive-mini' && bodies[0].data.relationships.list.data.id === 'W24Qdc'
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} Klaviyo body ${JSON.stringify(pr)}`)
}
// the email link (#191): unlocks without a sign-up, and only with the exact value
for (const c of [{ q: '?lab_unlock=sub', want: true }, { q: '?market=us&lab_unlock=sub', want: true }, { q: '?lab_unlock=1', want: false }, { q: '', want: false }]) {
  for (const k in store) delete store[k]; posts.length = 0
  globalThis.window = { location: { hostname: 'lab.accuphy.ca', search: c.q } }
  const m = await import(`../../src/experiments/2026-09-23-sonar-lake-3d/signup.js?case=${++n}`)
  const got = m.isSignedUp()
  globalThis.window.location.search = ''
  const kept = m.isSignedUp() // remembered once the parameter is gone
  const ok = got === c.want && kept === c.want && posts.length === 0
  if (!ok) fail++
  console.log(`${ok ? 'OK  ' : 'FAIL'} email link ${JSON.stringify(c.q)} → ${got}, then ${kept}`)
}
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0)
