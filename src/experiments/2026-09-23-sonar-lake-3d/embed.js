// Embed bridge (decision #134, 2026-10-23; #142 2026-10-24). The public Lab will sit inside a page of the store
// (shop.accuphy.com/pages/lab) — mounted into the page itself (#142), the full-screen iframe kept as the fallback. The Lab tells that page what the visitor did; the page's
// section publishes it as the Shopify customer event `accuphy_lab`, and a Custom Pixel forwards it to Meta
// (handoff: accuphy-website/handoffs/2026-10-23-lab-store-page.md). Never personal data in `data`.
// Without a parent window (the Lab opened on its own) nothing is sent.
const sent = new Set()

export function labEvent(event, data = {}, { once = false } = {}) {
  if (once) { if (sent.has(event)) return; sent.add(event) }
  try {
    // theme-mounted (#142, the plan now): the Lab runs inside the store page itself and publishes the customer event
    // directly — payload { event, ...data }, e.g. { event: 'view', view: 'forward', device: 'PL', source: 'home' }
    const publish = window.Shopify?.analytics?.publish
    if (typeof publish === 'function') publish('accuphy_lab', { event, ...data })
    // the iframe fallback (#134): the parent page's section publishes it
    else if (window.parent && window.parent !== window) window.parent.postMessage({ source: 'accuphy-lab', event, data }, '*')
  } catch { /* a page that refuses events: nothing to do */ }
  if (import.meta.env.DEV) console.debug('[lab event]', event, data)
}

export function isEmbedded() {
  try { return window.self !== window.top } catch { return true }
}
