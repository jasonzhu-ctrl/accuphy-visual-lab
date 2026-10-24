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

const FLAG = 'accuphy_sonar_signup_v1'

export function isSignedUp() {
  try { return localStorage.getItem(FLAG) === '1' } catch { return false }
}
function rememberSignedUp() {
  try { localStorage.setItem(FLAG, '1') } catch { /* private mode: the gate may show again next visit */ }
}

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim())

export async function submitSignup({ email, source = 'Accuphy Lab' }) {
  const addr = String(email).trim()
  if (!isEmail(addr)) throw new Error('Please enter a valid email address.')
  if (KLAVIYO.publicKey && KLAVIYO.listId) {
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
              properties: { signup_page: 'accuphy-lab' },
              subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } }, // the list's single/double opt-in setting still applies
            } } },
          },
          relationships: { list: { data: { type: 'list', id: KLAVIYO.listId } } },
        },
      }),
    })
    if (!res.ok) throw new Error('Sign-up failed — please try again.')
  }
  rememberSignedUp()
  return true
}
