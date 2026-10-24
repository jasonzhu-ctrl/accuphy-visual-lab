// Embed bridge (decision #134, 2026-10-23). The public Lab will sit inside a page of the store
// (shop.accuphy.com/pages/lab, a full-screen iframe). The Lab tells that page what the visitor did; the page's
// section publishes it as the Shopify customer event `accuphy_lab`, and a Custom Pixel forwards it to Meta
// (handoff: accuphy-website/handoffs/2026-10-23-lab-store-page.md). Never personal data in `data`.
// Without a parent window (the Lab opened on its own) nothing is sent.
const sent = new Set()

export function labEvent(event, data = {}, { once = false } = {}) {
  if (once) { if (sent.has(event)) return; sent.add(event) }
  try {
    if (window.parent && window.parent !== window) window.parent.postMessage({ source: 'accuphy-lab', event, data }, '*')
  } catch { /* a parent that refuses messages: nothing to do */ }
  if (import.meta.env.DEV) console.debug('[lab event]', event, data)
}

export function isEmbedded() {
  try { return window.self !== window.top } catch { return true }
}
