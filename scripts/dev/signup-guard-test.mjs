// The Combo lock's sign-up (#191): without a Klaviyo list id no real host may unlock. node scripts/dev/signup-guard-test.mjs
const store = {}
globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v } }
const posts = []; globalThis.fetch = async (u) => { posts.push(u); return { ok: true } }
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
console.log(fail ? `${fail} FAILED` : `all ${cases.length} passed`); process.exit(fail ? 1 : 0)
