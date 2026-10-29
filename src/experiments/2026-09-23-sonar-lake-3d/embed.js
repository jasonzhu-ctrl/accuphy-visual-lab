// Embed bridge (decision #134, 2026-10-23; #142 2026-10-24; X-6L 2026-10-25). The public Lab sits inside a page of the
// store (shop.accuphy.com/pages/lab) — mounted into the page itself (#142) or in the full-screen iframe (#134). The Lab
// tells that page what the visitor did; the page publishes it as the Shopify customer event `accuphy:lab` (the name
// agreed with the website project, X-6L; was `accuphy_lab` before), and a Custom Pixel forwards it to Meta
// (handoff: accuphy-website/handoffs/2026-10-23-lab-store-page.md). Never personal data in `data`.
// Without a parent window (the Lab opened on its own) nothing is sent.
export const EVENT_NAME = 'accuphy:lab'
const sent = new Set()
export const sentEvents = sent // the page checks whether `ready` already went out (it may fire before a listener exists)

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
  try { window.dispatchEvent(new CustomEvent('accuphy-lab', { detail: { event, data } })) } catch { /* old browsers */ } // the page itself listens (the cover waits for `ready`)
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
const LANG = (() => { try { return new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en' } catch { return 'en' } })() // ?lang=fr → the store's French pages (/fr/products/…), X-6L-fr
export const LANG_PATH = LANG === 'fr' ? '/fr' : ''

// The market root (website #228, handoffs/2026-10-28-lab-shop-prefix-from-website.md; Jason 2026-10-28 to the website HQ: "修复"):
// the store's bridge passes `shop` = Liquid routes.root_url — "/" (Canada, English), "/fr", "/en-us", "/de-de", "/fr-benelux",
// "/en-pl", "/en-ro" — on the iframe URL (?shop=…) or, theme-mounted, as data-shop on the mount element (share/embed.jsx →
// setEmbedOptions). A value that does not look like a root is ignored, and the link falls back to the ?lang rule above.
// Without it German and US visitors landed on the Canadian product page.
const SHOP_ROOT = /^\/([a-z]{2}(-[a-z]{2,})?)?$/
const embedOpts = {}
export function setEmbedOptions(o = {}) { Object.assign(embedOpts, o) }
export function shopRoot() {
  let s = embedOpts.shop
  if (s == null) { try { s = new URLSearchParams(window.location.search).get('shop') } catch { s = null } }
  if (typeof s !== 'string') return null
  s = s.trim().toLowerCase()
  return SHOP_ROOT.test(s) ? (s === '/' ? '' : s) : null
}

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

// "Send to a friend" (#188, Jason 2026-10-29 in Lab HQ): the STORE page of the visitor's own market — before, everyone shared
// the Canadian page. Root = shopRoot() (the store's `shop`), else the ?lang rule. Tags follow Klaviyo's D5 scheme (HQ confirms
// the names): ref=share, utm_source=lab_share, utm_medium = qr | copy | native | whatsapp | sms, utm_campaign=bf2026_lab_<market>.
export function shareMarket() {
  const m = (embedOpts.market ?? (() => { try { return new URLSearchParams(window.location.search).get('market') } catch { return null } })())
  if (typeof m === 'string' && /^[a-z]{2}$/i.test(m.trim())) return m.trim().toLowerCase()
  const root = shopRoot()
  if (root === null || root === '') return LANG === 'fr' ? 'fr' : 'ca'
  if (root === '/fr') return 'fr'
  const region = root.split('-')[1] || ''
  return region === 'benelux' ? 'be' : region.slice(0, 2) || 'ca'
}
export function shareUrl(medium) {
  const root = shopRoot(); const path = (root !== null ? root : LANG_PATH) + '/pages/lab'
  const u = new URL(path, STORE)
  u.searchParams.set('ref', 'share'); u.searchParams.set('utm_source', 'lab_share'); u.searchParams.set('utm_medium', medium); u.searchParams.set('utm_campaign', 'bf2026_lab_' + shareMarket())
  return u.href
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
  const root = shopRoot()
  const url = new URL((root !== null ? root : LANG_PATH) + '/products/' + product, inStore() ? storeOrigin() : STORE)
  if (!inStore()) {
    let own = []
    try { own = [...new URLSearchParams(window.location.search)].filter(([k]) => k.startsWith('utm_')) } catch { own = [] }
    for (const [k, v] of own.length ? own : Object.entries(DEFAULT_UTM)) url.searchParams.set(k, v)
  }
  return url.href
}

// Opens the product page in the top window (out of the iframe), after reporting the click. The navigation waits ONE SECOND
// so the click reaches the store page and its pixels before unload: GA4's gtag queues events for ~5 s and only flushes the
// queue on unload, so at 150 ms `lab_shop_click` was never queued and was lost; the website's 00 measured that 1000 ms
// delivers both GA4 and Meta (website #228, accuphy-website/backups/2026-10-28-d228b-shopclick-events/README.md; Jason
// 2026-10-28: "修复"). The button shows "Opening the store…" meanwhile and repeat clicks do nothing (ShopButton.jsx).
export const SHOP_DELAY_MS = 1000
let opening = false
const openingListeners = new Set()
export function isOpeningShop() { return opening }
export function onOpeningShop(fn) { openingListeners.add(fn); return () => openingListeners.delete(fn) }
function setOpening(v) { opening = v; for (const fn of openingListeners) fn(v) }
// back from the store with the back button (bfcache keeps the page alive): the button must work again
try { window.addEventListener('pageshow', (e) => { if (e.persisted) setOpening(false) }) } catch { /* no window */ }
// Website #229 (handoffs/2026-10-29-lab-shop-nav-by-store.md; Jason 2026-10-29 to the website HQ: "好的"): in the store's iframe
// the STORE PAGE does the jump, not the Lab — a jump made by the Lab counted as a visit from lab.accuphy.ca (French visitors
// 302'd to English by their browser language, the GA4 source wrong). `shop_click` now carries `url`; the store's bridge
// answers { type: 'shop_click_ack' } and navigates itself ~1 s later. The Lab waits up to SHOP_ACK_MS for that receipt:
// with it, it never navigates (the label and the repeat-click block stay); without it (opened on its own, an old bridge)
// it navigates itself after SHOP_DELAY_MS as before. Only a receipt from the parent window at the store's origin counts.
// Theme-mounted (no iframe, no parent) nothing changes: the Lab navigates itself.
export const SHOP_ACK_MS = 400
export function openShop(deviceId, placement) {
  if (opening) return false
  setOpening(true)
  const href = shopUrl(deviceId)
  let acked = false
  if (isEmbedded()) {
    const storeOrg = storeOrigin()
    const onAck = (e) => {
      if (e.source !== window.parent || e.origin !== storeOrg || !e.data || e.data.type !== 'shop_click_ack') return
      acked = true; window.removeEventListener('message', onAck)
    }
    window.addEventListener('message', onAck)
    setTimeout(() => window.removeEventListener('message', onAck), SHOP_ACK_MS) // a late receipt no longer counts
  }
  labEvent('shop_click', { product: PRODUCT[deviceId] || PRODUCT.PLM, placement, lang: LANG, url: href }) // no `device`: the website uses that field for phone/desktop (Lab HQ 2026-10-25); `url` for the store page's own jump (#229)
  const go = () => { if (acked) return; try { window.top.location.href = href } catch { window.location.href = href } }
  setTimeout(go, SHOP_DELAY_MS)
  return true
}
