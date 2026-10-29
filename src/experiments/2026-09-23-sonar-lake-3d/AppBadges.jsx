// The official App Store and Google Play badges (BF funnel handoff 2026-10-26, item 2), black, English or French-Canadian.
// Jason 2026-10-28 ("太 AI 了" about the first look): store style, nothing invented — the badges as Apple and Google ship
// them, at least 40 px high (Apple's onscreen minimum, "legible but not dominant"), a quarter of their height of clear
// space, no rounding or glass of our own, and one short caption above them the way Strava and the store footer do
// ("Get the Accuphy Sonar app"; the badges already say Download / Get it on).
// Links are the store's own (shop.accuphy.com footer). Google Play carries utm_source=accuphy-lab in `referrer`; the
// App Store campaign parameter needs the provider token from App Store Connect (Lab HQ asks Jason) — none yet, so plain.
import appStoreEn from './badges/app-store-en.svg'
import appStoreFr from './badges/app-store-fr.svg'
import playEn from './badges/google-play-en.png'
import playFr from './badges/google-play-fr.png'
import { labEvent } from './embed'
import { LANG, t } from './i18n'

const APP_STORE = `https://apps.apple.com/ca/app/accuphy-sonar/id6743123048${LANG === 'fr' ? '?l=fr-CA' : ''}`
const PLAY = `https://play.google.com/store/apps/details?id=com.accuphy.sonar&hl=${LANG === 'fr' ? 'fr_CA' : 'en_CA'}&referrer=${encodeURIComponent('utm_source=accuphy-lab&utm_medium=referral')}`

export default function AppBadges({ height = 40, caption = true, className = '', style }) {
  const go = (store) => labEvent('app_badge', { store })
  return (
    <span className={`ac-badges-wrap ${className}`} style={style} onPointerDown={(e) => e.stopPropagation()}>
      {caption && <span className="ac-cap">{t('get_app')}</span>}
      <span className="ac-badges" style={{ '--h': `${height}px` }}>
        <a href={APP_STORE} target="_blank" rel="noopener" onClick={() => go('app_store')}><img src={LANG === 'fr' ? appStoreFr : appStoreEn} alt="Download on the App Store" /></a>
        <a href={PLAY} target="_blank" rel="noopener" onClick={() => go('google_play')}><img src={LANG === 'fr' ? playFr : playEn} alt="Get it on Google Play" /></a>
      </span>
    </span>
  )
}
