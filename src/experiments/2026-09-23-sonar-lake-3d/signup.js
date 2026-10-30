// Email sign-up behind the phone inset's (display-only) app controls — docs/signup-klaviyo-plan.md.
// Klaviyo "Create Client Subscription": POST https://a.klaviyo.com/client/subscriptions?company_id=<public key>
//
// TODAY: nothing leaves the browser. The address is only used to remember, in this browser, that the
// visitor signed up (so the gate never shows again). Before the page goes public, fill in KLAVIYO below:
// the form then subscribes the address to the Klaviyo list through Klaviyo's client-side Subscriptions
// API (public site key — safe to ship in the page; no private key ever goes into this code).
export const KLAVIYO = {
  publicKey: 'XWcjZ5', // Klaviyo "Public API key / Site ID" of the shop's account (website HQ, 2026-10-23; public by design)
  listId: null,     // the list id for "Accuphy Lab sign-ups" — the Klaviyo project is creating the list; until it is set nothing is sent
  revision: '2026-07-15', // Klaviyo API revision (each is supported ~2 years; bump when Klaviyo retires it)
}

// The consent sent with each sign-up (#191). SUBSCRIBED is the only value Klaviyo's client endpoint takes.
const CONSENT = 'SUBSCRIBED'

// listId must be W24Qdc before lab.accuphy.ca goes live with the Combo lock (#191, docs/versions.md). Until it is set nothing is
// sent: on the Lab's real hosts the card refuses (no fake success, Combo stays shut); on test links and localhost it unlocks,
// and the card says "Test mode".
const LIVE_HOST = /(^|\.)(accuphy\.ca|accuphy\.com|vercel\.app|myshopify\.com)$/
const signupReady = () => !!(KLAVIYO.publicKey && KLAVIYO.listId)
const onLiveHost = () => { try { return LIVE_HOST.test(window.location.hostname) } catch { return true } }
export const signupTestMode = () => !signupReady() && !onLiveHost()

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

export async function submitSignup({ email, language = 'en', market, view, product, source = 'Accuphy Lab' }) {
  const addr = String(email).trim()
  if (!isEmail(addr)) throw new Error('bad_email')
  if (!signupReady() && onLiveHost()) throw new Error('not_ready')
  if (signupReady()) {
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
          relationships: { list: { data: { type: 'list', id: KLAVIYO.listId } } },
        },
      }),
    })
    if (!res.ok) throw new Error('send_failed')
  }
  rememberSignedUp()
  return true
}
