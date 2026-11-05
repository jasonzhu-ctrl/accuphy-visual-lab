// Email sign-up behind the phone inset's (display-only) app controls — docs/signup-klaviyo-plan.md.
// Klaviyo "Create Client Subscription": POST https://a.klaviyo.com/client/subscriptions?company_id=<public key>
//
// TODAY: nothing leaves the browser. The address is only used to remember, in this browser, that the
// visitor signed up (so the gate never shows again). Before the page goes public, fill in KLAVIYO below:
// the form then subscribes the address to the Klaviyo list through Klaviyo's client-side Subscriptions
// API (public site key — safe to ship in the page; no private key ever goes into this code).
export const KLAVIYO = {
  publicKey: 'XWcjZ5', // Klaviyo "Public API key / Site ID" of the shop's account (website HQ, 2026-10-23; public by design)
  listId: /^[A-Za-z0-9]{6}$/.test(import.meta.env.VITE_BF_LIST_ID || '') ? import.meta.env.VITE_BF_LIST_ID : null, // W24Qdc, filled only by HQ's go-live build (VITE_BF_LIST_ID=W24Qdc, #213); test links leave it empty, so nothing is sent
  // Europe's double opt-in list (checklist §6.5; Jason 11-04 in Klaviyo HQ: “欧洲需要做两步的”): Klaviyo HQ builds it, the go-live build
  // fills VITE_BF_LIST_ID_EU. Empty: European visitors get the unfilled-build behaviour below — never W24Qdc.
  listIdEu: /^[A-Za-z0-9]{6}$/.test(import.meta.env.VITE_BF_LIST_ID_EU || '') ? import.meta.env.VITE_BF_LIST_ID_EU : null,
  // One list per country in North America + Australia (#244, Jason 11-04 in Klaviyo HQ: “不应该分开吗?” — prices differ): listId above is
  // Canada's (W24Qdc, “CA - Sonar Lab”); the go-live build fills US SPeeP6 and AU Scdcct. Empty: that country's visitors are refused on
  // the real hosts — never another country's list.
  listIdUs: /^[A-Za-z0-9]{6}$/.test(import.meta.env.VITE_BF_LIST_ID_US || '') ? import.meta.env.VITE_BF_LIST_ID_US : null,
  listIdAu: /^[A-Za-z0-9]{6}$/.test(import.meta.env.VITE_BF_LIST_ID_AU || '') ? import.meta.env.VITE_BF_LIST_ID_AU : null,
  // One double opt-in list per European country (#247, Jason 11-04 in Klaviyo HQ: per country, like CA/US/AU). The go-live build
  // fills VITE_BF_LISTS_EU = "key:ListID,key:ListID" — key = the country (signup_market: fr de at ch nl be lu pl lv ro…), or
  // country-language when one country has a list per language (be-nl, be-fr). Lookup: country-language first, then country.
  // A European country with no list is refused on the real hosts — never another country's list. listIdEu (one list for all of
  // Europe) is only the fallback if a build still sets it.
  listsEu: Object.fromEntries(String(import.meta.env.VITE_BF_LISTS_EU || '').split(',').map((x) => x.trim().split(':')).filter(([k, v]) => /^[a-z]{2}(-[a-z]{2})?$/.test(k || '') && /^[A-Za-z0-9]{6}$/.test(v || ''))),
  revision: '2026-07-15', // Klaviyo API revision (each is supported ~2 years; bump when Klaviyo retires it)
}

// The consent sent with each sign-up (#191). SUBSCRIBED is the only value Klaviyo's client endpoint takes.
const CONSENT = 'SUBSCRIBED'

// listId must be W24Qdc before lab.accuphy.ca goes live with the Combo lock (#191, #213: only through VITE_BF_LIST_ID). Until it is set nothing is
// sent: on the Lab's real hosts the card refuses (no fake success, Combo stays shut); on test links and localhost it unlocks,
// and the card says "Test mode".
const LIVE_HOST = /(^|\.)(accuphy\.ca|accuphy\.com|vercel\.app|myshopify\.com)$/
// Which list (§6.5): 'na' (Canada, US, Australia → W24Qdc, single opt-in) only when every signal the store page gives points there and
// at least one is given; anything else is 'eu' (double opt-in), so an unknown visitor never lands in the single opt-in list.
//   market: the 2-letter `market` the store's bridge passes (null if none); shop: shopRoot() ('' = "/", null if none); lang: the Lab's language.
// de / nl / pl / lv are European whatever the root says (a Polish or Latvian ad link opened on the "/" root before the store's redirect).
const NA_MARKETS = ['ca', 'us', 'au'], NA_ROOTS = ['', '/fr', '/en-us', '/en-au']
export function listRegion({ market = null, shop = null, lang = 'en' } = {}) {
  if (['de', 'nl', 'pl', 'lv'].includes(lang)) return 'eu'
  if (market == null && shop == null) return 'eu'
  if (market != null && !NA_MARKETS.includes(market)) return 'eu'
  if (shop != null && !NA_ROOTS.includes(shop)) return 'eu'
  return 'na'
}
// 'na' → the country's own list by signup_market (shareMarket(): ca for / and /fr, us for /en-us, au for /en-au, or the bridge's market);
// a market outside ca / us / au gets no list (refused), never Canada's.
const NA_LISTS = () => ({ ca: KLAVIYO.listId, us: KLAVIYO.listIdUs, au: KLAVIYO.listIdAu })
const euList = (market, lang) => (market && (KLAVIYO.listsEu[`${market}-${lang}`] || KLAVIYO.listsEu[market])) || KLAVIYO.listIdEu || null
export const listFor = (region, market, lang = 'en') => (region === 'na' ? NA_LISTS()[market] || null : euList(market, lang))
const signupReady = (region, market, lang) => !!(KLAVIYO.publicKey && listFor(region, market, lang))
const onLiveHost = () => { try { return LIVE_HOST.test(window.location.hostname) } catch { return true } }
export const signupTestMode = (region = 'eu', market = null, lang = 'en') => !signupReady(region, market, lang) && !onLiveHost()

const FLAG = 'accuphy_sonar_signup_v1'

// Existing subscribers come from Klaviyo emails with ?lab_unlock=sub (#191, Jason via Klaviyo HQ): unlocked, no card, and no `signup`
// event, or they would count as new Meta Leads. The store's bridge passes the parameter into the iframe; shareUrl never carries it.
const fromEmail = () => { try { return new URLSearchParams(window.location.search).get('lab_unlock') === 'sub' } catch { return false } }

export function isSignedUp() {
  if (fromEmail()) { rememberSignedUp(); return true }
  try { return localStorage.getItem(FLAG) === '1' } catch { return false }
}
function rememberSignedUp() {
  try { localStorage.setItem(FLAG, '1') } catch { /* private mode: the card may show again next visit */ }
}

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim())

// Klaviyo sometimes answers 5xx (HQ 11-05, Jason in Lab HQ: retry automatically). A 5xx or a network error is tried again,
// SEND_TRIES in all, after a short, growing wait the visitor does not notice; a 4xx (a wrong list, a refusal, 429) is not retried.
// Still failing: 'send_failed' — the card says so, nothing unlocks, no `signup` event. The same request body every time.
export const SEND_TRIES = 3
const RETRY_WAIT_MS = [600, 1500]
// Success only when Klaviyo itself answered 2xx (HQ 11-05: a 503 once showed success): a real response object, status 200–299,
// not opaque (status 0), not redirected (an anti-bot or captcha page answering 200 after a redirect is not Klaviyo). Klaviyo's
// client subscription answers 202 with an empty body, so an empty body is fine.
const sent = (res) => !!res && typeof res.status === 'number' && res.status >= 200 && res.status < 300 && res.ok !== false && !res.redirected && res.type !== 'opaque' && res.type !== 'opaqueredirect'
async function sendWithRetry(args) {
  for (let i = 0; i < SEND_TRIES; i++) {
    if (i) await new Promise((r) => setTimeout(r, RETRY_WAIT_MS[i - 1] ?? 1500))
    let res
    try { res = await fetch(...args) } catch { continue } // network error: try again
    if (sent(res)) return
    if (res && res.status >= 400 && res.status < 500) break // 4xx: a refusal, no retry
    // anything else (5xx, status 0, an opaque or redirected answer, no answer object) is tried again
  }
  throw new Error('send_failed')
}

export async function submitSignup({ email, language = 'en', market, view, product, region = 'eu', source = 'Accuphy Lab' }) {
  const addr = String(email).trim()
  if (!isEmail(addr)) throw new Error('bad_email')
  if (!signupReady(region, market, language) && onLiveHost()) throw new Error('not_ready')
  if (signupReady(region, market, language)) {
    const args = [`https://a.klaviyo.com/client/subscriptions?company_id=${encodeURIComponent(KLAVIYO.publicKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/vnd.api+json', revision: KLAVIYO.revision },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: source,
            profile: { data: { type: 'profile', attributes: {
              email: addr,
              properties: { signup_page: 'accuphy-lab', signup_channel: 'lab_unlock', signup_language: language, signup_market: market, lab_scene: view, lab_product: product }, // here because the Lab's email never passes the store page, so the bridge's klaviyo.identify cannot record it
              subscriptions: { email: { marketing: { consent: CONSENT } } }, // the list's single/double opt-in setting still applies
            } } },
          },
          relationships: { list: { data: { type: 'list', id: listFor(region, market, language) } } },
        },
      }),
    }]
    await sendWithRetry(args)
  }
  rememberSignedUp()
  return true
}
