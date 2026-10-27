// The real app's Home — its view-selection page — drawn inside the phone display (Jason 2026-10-16: 不同的 view
// option 可以模拟在手机上的 app 的官方版本的选择页面进入吗 … 显示首页选视图 而且应该必须先选才能开始). Layout from
// reference/app-study/home*.jpg: a dark page, one section per device — "PingLive" (Panoramic / Forward / Down),
// "PingLive Mini" (all seven of the app's tiles; Jason 2026-10-23: only Live Forward, Live Down, Live Ice Fishing and Live
// Combo are open, every other tile is frosted) and
// Live Combo sits in the Mini's row (2026-10-23; the app has a separate Combo section) — rounded dark panels, labels under the
// tiles, and the Setting · Home · Map tab bar. The thumbnails are crops of the app's own tiles.
// Tiles the Lab can show are live. The others are shown under a frosted layer (Jason: 其他的用那种我们也有的雾蒙蒙的一层)
// and a tap only shows "Available with Accuphy PingLive Mini". Sizes are in cqh of the display, like SonarChrome.
import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n' // English / French (?lang=fr); the French is the real app's own (website review 2026-10-26)
// the thumbnails are files beside the page, not inlined (load plan B, 2026-10-27): fetched only when the Home page is shown — never on desktop
import plPanoramic from './pl-panoramic.jpg'
import plForward from './pl-forward.jpg'
import plDown from './pl-down.jpg'
import plmPanoramic from './plm-panoramic.jpg'
import plmForward from './plm-forward.jpg'
import plmDown from './plm-down.jpg'
import plmDownscan from './plm-downscan.jpg'
import plmChirp from './plm-chirp.jpg'
import plmLiveIce from './plm-liveice.jpg'
import plmIceFishing from './plm-icefishing.jpg' // the app 2.0.0 tile (reference/app-study/2026-10-23)
import plmCombo from './plm-combo.jpg'

// The ice views live on the separate ice page (VITE_SCENE=ice); on the lake page their tiles are frosted like the rest

const SECTIONS = {
  PL: { title: 'PingLive', tiles: [
    { mode: 'panoramic', label: t('tile_panoramic'), img: plPanoramic, fan: true },
    { mode: 'forward', label: t('tile_forward'), img: plForward, fan: true },
    { mode: 'down', label: t('tile_down'), img: plDown, fan: true },
  ] },
  PLM: { title: 'PingLive Mini', tiles: [
    { label: t('tile_live_panoramic'), img: plmPanoramic },
    { mode: 'forward', label: t('tile_live_forward'), img: plmForward },
    { mode: 'down', label: t('tile_live_down'), img: plmDown },
    { mode: 'combo', label: t('tile_live_combo'), img: plmCombo }, // in the Mini's row, not a separate Combo section (Jason 2026-10-23: 不要单独再放一栏了 这样人家搞不懂)
    { label: t('tile_downscan'), img: plmDownscan },
    { label: t('tile_chirp'), img: plmChirp },
    { label: t('tile_ice'), img: plmIceFishing }, // frosted: Jason 2026-10-23 keeps only Live Ice Fishing, Live Forward, Live Down, Live Combo
    { id: 'liveice', label: t('tile_live_ice'), img: plmLiveIce }, // frosted on the lake page (its link to the ice page never worked in public builds; Jason 2026-10-24: 去掉); a view on the ice page
  ] },
}

const BLUE = '#2f8fff'
function Icon({ name, active }) {
  const c = active ? BLUE : '#fff'
  const s = { width: '6cqh', height: '6cqh', display: 'block', margin: '0 auto 0.8cqh' }
  if (name === 'gear') return <svg viewBox="0 0 24 24" style={s} fill="none" stroke={c} strokeWidth="2.2" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
  if (name === 'home') return <svg viewBox="0 0 24 24" style={s} fill={c}><path d="M12 3 2.5 11.2h2.7V21h5.3v-6h3v6h5.3v-9.8h2.7z" /></svg>
  return <svg viewBox="0 0 24 24" style={s} fill="none" stroke={c} strokeWidth="2.2" strokeLinejoin="round"><path d="M3 6.5 9 4l6 2.5 6-2.5v13.5L15 20l-6-2.5-6 2.5z" /><path d="M9 4v13.5M15 6.5V20" /></svg>
}
function Tab({ label, icon, active }) {
  return (
    <div style={{ textAlign: 'center', fontSize: '3.8cqh', fontWeight: 500, color: active ? BLUE : '#fff', position: 'relative' }}>
      <Icon name={icon} active={active} />
      {icon === 'gear' && <span style={{ position: 'absolute', top: '-0.4cqh', left: 'calc(50% + 2.2cqh)', width: '1.6cqh', height: '1.6cqh', borderRadius: '50%', background: '#e53935' }} />}
      {label}
    </div>
  )
}

export default function AppHome({ devices, deviceId, mode, onPick, ice = false }) {
  // on the ice page the back button opens this Home too (2026-10-23): Live Ice Fishing is a view of this page there,
  // not a link to it
  const sections = devices.map((d) => ({ id: d.id, ...SECTIONS[d.id] })).filter((s) => s.tiles)
    .map((sec) => (ice ? { ...sec, tiles: sec.tiles.map((tile) => (tile.id === 'liveice' ? { ...tile, mode: 'liveice' } : tile)) } : sec))
  const [toast, setToast] = useState('')
  const toastT = useRef(0)
  useEffect(() => () => clearTimeout(toastT.current), [])
  const notAvailable = () => { setToast(t('not_available')); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200) }
  return (
    <div className="ph-home" role="dialog" aria-label="Home" onPointerDown={(e) => e.stopPropagation()}
      style={{ position: 'absolute', inset: 0, background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body, "Instrument Sans", system-ui, sans-serif)' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '4cqh 3.5cqh 3cqh' }}>
        {sections.map((sec, i) => (
          <div key={sec.title}>
            <div style={{ fontSize: '6.6cqh', fontWeight: 600, letterSpacing: '-0.01em', margin: i ? '5cqh 0 2.4cqh' : '0 0 2.4cqh' }}>{sec.title}</div>
            <div style={{ background: '#1c1c1c', borderRadius: '3cqh', padding: '3cqh', display: 'flex', flexWrap: 'wrap', gap: '3cqh' }}>
              {sec.tiles.map((t) => {
                const dev = t.device || sec.id
                const live = !!t.mode
                const active = live && dev === deviceId && t.mode === mode
                const onClick = live ? () => onPick(dev, t.mode) : notAvailable
                return (
                  <button key={t.label} type="button" className={`ph-tile ${live ? '' : 'is-off'}`} onClick={onClick} aria-label={t.label} aria-current={active || undefined} aria-disabled={live ? undefined : 'true'} style={{ flex: '0 0 44cqh', textAlign: 'center' }}>
                    <span style={{ position: 'relative', display: 'block', borderRadius: t.fan ? 0 : '1.8cqh', overflow: 'hidden', boxShadow: active && !t.fan ? `0 0 0 0.6cqh ${BLUE}` : 'none' }}>
                      <img src={t.img} alt="" draggable={false} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: '22cqh', objectFit: t.fan ? 'contain' : 'cover' }} />
                      {!live && <span className="ph-frost" aria-hidden="true" />}
                    </span>
                    <div style={{ fontSize: '4cqh', fontWeight: 500, marginTop: '1.8cqh', color: active ? BLUE : live ? '#fff' : 'rgba(255,255,255,0.55)' }}>{t.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: '0 0 17cqh', background: '#161616', borderTop: '0.3cqh solid #262626', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Tab label={t('tab_setting')} icon="gear" />
        <Tab label={t('tab_home')} icon="home" active />
        <Tab label={t('tab_map')} icon="map" />
      </div>
      <div role="status" aria-live="polite" className="ph-toast glass" style={{ opacity: toast ? 1 : 0 }}>{toast}</div>
    </div>
  )
}
