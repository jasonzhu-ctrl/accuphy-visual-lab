// Embed bridge (decision #134, 2026-10-23; #142 2026-10-24; X-6L 2026-10-25). The public Lab sits inside a page of the
// store (shop.accuphy.com/pages/lab) — mounted into the page itself (#142) or in the full-screen iframe (#134). The Lab
// tells that page what the visitor did; the page publishes it as the Shopify customer event `accuphy:lab` (the name
// agreed with the website project, X-6L; was `accuphy_lab` before), and a Custom Pixel forwards it to Meta
// (handoff: accuphy-website/handoffs/2026-10-23-lab-store-page.md). Never personal data in `data`.
// Without a parent window (the Lab opened on its own) nothing is sent.
export const EVENT_NAME = 'accuphy:lab'
const sent = new Set()

export function labEvent(event, data = {}, { once = false } = {}) {
  if (once) { if (sent.has(event)) return; sent.add(event) }
  try {
    // theme-mounted (#142): the Lab runs inside the store page itself and publishes the customer event directly —
    // payload { event, ...data }, e.g. { event: 'view', view: 'forward', product: 'pinglive-sonar', source: 'home' }
    const publish = window.Shopify?.analytics?.publish
    if (typeof publish === 'function') publish(EVENT_NAME, { event, ...data })
    // the iframe path (#134): the parent page's section publishes it — this message shape is fixed, the section checks it
    else if (window.parent && window.parent !== window) window.parent.postMessage({ source: 'accuphy-lab', event, data }, '*')
  } catch { /* a page that refuses events: nothing to do */ }
  if (import.meta.env.DEV) console.debug('[lab event]', event, data)
}

export function isEmbedded() {
  try { return window.self !== window.top } catch { return true }
}

// ---- the "Shop" button (X-6L, 2026-10-25; Lab HQ's interface note, agreed with the website) ---------------------
// Product handles per device (decision #134). No market prefix: the store's own domain keeps the visitor's market
// (handoffs/2026-10-25-lab-page-interface-from-website.md). The store's origin is taken from the page that frames the
// Lab — ancestorOrigins, else the referrer — and falls back to shop.accuphy.com. The Lab's own URL may carry utm_*,
// fbclid and such from the ad; they are never read here except to pass along when the Lab is opened on its own.
const STORE = 'https://shop.accuphy.com'
export const PRODUCT = { PL: 'pinglive-sonar', PLM: 'pinglive-mini' }

export function storeOrigin() {
  try {
    // theme-mounted: the Lab runs on the store's own page, so the page's origin IS the store (the referrer there is
    // the visitor's previous site — facebook.com, google.com — never the store; Lab HQ 2026-10-25)
    if (!isEmbedded()) return window.location.origin
    const anc = window.location.ancestorOrigins?.[0]
    if (anc && /^https?:/.test(anc)) return anc
    if (document.referrer) { const o = new URL(document.referrer).origin; if (o !== window.location.origin) return o }
  } catch { /* fall through */ }
  return STORE
}

// Inside the store (iframe or theme-mounted) the link carries NO utm_*: the visitor's own ad tags are already on the
// store's visit, and a second set would overwrite the ad source — shop_click records the click instead (HQ's rule).
// Opened on its own (lab.accuphy.ca) the visitor's utm_* are passed along as they are; none → the Lab's own referral tags.
const DEFAULT_UTM = { utm_source: 'accuphy_lab', utm_medium: 'referral', utm_campaign: 'bf2026_lab_ca' }

export function inStore() {
  return isEmbedded() || typeof window.Shopify?.analytics?.publish === 'function'
}

export function shopUrl(deviceId) {
  const product = PRODUCT[deviceId] || PRODUCT.PLM
  const url = new URL('/products/' + product, inStore() ? storeOrigin() : STORE)
  if (!inStore()) {
    let own = []
    try { own = [...new URLSearchParams(window.location.search)].filter(([k]) => k.startsWith('utm_')) } catch { own = [] }
    for (const [k, v] of own.length ? own : Object.entries(DEFAULT_UTM)) url.searchParams.set(k, v)
  }
  return url.href
}

// Opens the product page in the top window (out of the iframe), after reporting the click. The navigation waits a
// moment so the click reaches the store page (postMessage is delivered as a later task) and its pixel before unload.
export function openShop(deviceId, placement) {
  const href = shopUrl(deviceId)
  labEvent('shop_click', { product: PRODUCT[deviceId] || PRODUCT.PLM, placement }) // no `device`: the website uses that field for phone/desktop (Lab HQ 2026-10-25)
  const go = () => { try { window.top.location.href = href } catch { window.location.href = href } }
  setTimeout(go, 150)
}
