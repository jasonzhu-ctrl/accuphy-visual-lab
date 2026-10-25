// The "Shop" button (X-6L, 2026-10-25): the one link from the Lab to the store's product page for the device on screen.
// It opens the product page in the top window (out of the store's iframe) and reports `shop_click` (embed.js).
// Placement (Jason 2026-10-25 in the Lab HQ chat: "用方案 B 吧"): desktop a full-width button at the foot of the control
// panel; phones a pill docked on the phone frame's top edge. (Option A, a pill on the lake, was removed.)
import { DEVICES } from '../2026-09-23-sonar-beam/devices'
import { openShop } from './embed'

export default function ShopButton({ deviceId, placement, wide = false, className = '', style }) {
  const name = DEVICES[deviceId]?.name || 'PingLive'
  return (
    <button type="button" data-hint-avoid className={`ac-shop ${wide ? 'ac-shop-wide' : ''} ${className}`} style={style} aria-label={`Shop ${name}`}
      onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); openShop(deviceId, placement) }}>
      <span>Shop {name}</span>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  )
}
