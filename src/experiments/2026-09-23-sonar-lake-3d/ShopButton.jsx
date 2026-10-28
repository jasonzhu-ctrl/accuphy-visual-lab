// The "Shop" button (X-6L, 2026-10-25): the one link from the Lab to the store's product page for the device on screen.
// It opens the product page in the top window (out of the store's iframe) and reports `shop_click` (embed.js).
// Placement (Jason 2026-10-25 in the Lab HQ chat: "用方案 B 吧"): desktop a full-width button at the foot of the control
// panel; phones a pill docked on the phone frame's top edge. (Option A, a pill on the lake, was removed.)
import { useEffect, useState } from 'react'
import { DEVICES } from '../2026-09-23-sonar-beam/devices'
import { openShop, isOpeningShop, onOpeningShop } from './embed'
import { t } from './i18n'

// After the click the page waits 1 s before leaving (embed.js SHOP_DELAY_MS, website #228): the label turns into "Opening the
// store…" at once and further clicks do nothing — on every placement, since the state lives in embed.js. Coming back from the
// store through the bfcache resets it (pageshow).
export default function ShopButton({ deviceId, placement, wide = false, className = '', style }) {
  const name = DEVICES[deviceId]?.name || 'PingLive'
  const [opening, setOpening] = useState(isOpeningShop)
  useEffect(() => onOpeningShop(setOpening), [])
  const label = opening ? t('shop_opening') : t('shop', { name })
  return (
    <button type="button" data-hint-avoid className={`ac-shop ${wide ? 'ac-shop-wide' : ''} ${opening ? 'is-opening' : ''} ${className}`} style={style} aria-label={label} aria-busy={opening || undefined} aria-disabled={opening || undefined}
      onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (!opening) openShop(deviceId, placement) }}>
      <span>{label}</span>
      {!opening && <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  )
}
