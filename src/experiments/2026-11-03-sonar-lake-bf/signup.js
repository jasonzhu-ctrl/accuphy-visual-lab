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
export const listFor = (region, market) => (region === 'na' ? NA_LISTS()[market] || null : KLAVIYO.listIdEu)
const signupReady = (region, market) => !!(KLAVIYO.publicKey && listFor(region, market))
const onLiveHost = () => { try { return LIVE_HOST.test(window.location.hostname) } catch { return true } }
export const signupTestMode = (region = 'eu', market = null) => !signupReady(region, market) && !onLiveHost()

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

export async function submitSignup({ email, language = 'en', market, view, product, region = 'eu', source = 'Accuphy Lab' }) {
  const addr = String(email).trim()
  if (!isEmail(addr)) throw new Error('bad_email')
  if (!signupReady(region, market) && onLiveHost()) throw new Error('not_ready')
  if (signupReady(region, market)) {
    const res = await fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${encodeURIComponent(KLAVIYO.publicKey)}`, {
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
          relationships: { list: { data: { type: 'list', id: listFor(region, market) } } },
        },
      }),
    })
    if (!res.ok) throw new Error('send_failed')
  }
  rememberSignedUp()
  return true
}
