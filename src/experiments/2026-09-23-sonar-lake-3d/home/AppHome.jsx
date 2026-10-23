// The real app's Home — its view-selection page — drawn inside the phone display (Jason 2026-10-16: 不同的 view
// option 可以模拟在手机上的 app 的官方版本的选择页面进入吗 … 显示首页选视图 而且应该必须先选才能开始). Layout from
// reference/app-study/home*.jpg: a dark page, one section per device — "PingLive" (Panoramic / Forward / Down),
// "PingLive Mini" (all seven of the app's tiles; Jason 2026-10-23: only Live Forward, Live Down, Live Ice Fishing and Live
// Combo are open, every other tile is frosted) and
// "Combo" (Live Combo) — rounded dark panels, labels under the
// tiles, and the Setting · Home · Map tab bar. The thumbnails are crops of the app's own tiles.
// Tiles the Lab can show are live. The others are shown under a frosted layer (Jason: 其他的用那种我们也有的雾蒙蒙的一层)
// and a tap only shows "Available with Accuphy PingLive Mini". Sizes are in cqh of the display, like SonarChrome.
import { useEffect, useRef, useState } from 'react'
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

// The ice views live on the separate ice page (VITE_SCENE=ice); a tile can open it when the page has an address
// (dev: the gallery entry; public: VITE_ICE_URL once the ice page is published). Otherwise they are "available with".
const ICE_URL = import.meta.env.VITE_ICE_URL || (import.meta.env.DEV ? '#2026-10-16-sonar-ice-3d' : null)

const SECTIONS = {
  PL: { title: 'PingLive', tiles: [
    { mode: 'panoramic', label: 'Panoramic View', img: plPanoramic, fan: true },
    { mode: 'forward', label: 'Forward View', img: plForward, fan: true },
    { mode: 'down', label: 'Down View', img: plDown, fan: true },
  ] },
  PLM: { title: 'PingLive Mini', tiles: [
    { label: 'Live Panoramic', img: plmPanoramic },
    { mode: 'forward', label: 'Live Forward', img: plmForward },
    { mode: 'down', label: 'Live Down', img: plmDown },
    { label: 'Down Scan', img: plmDownscan },
    { label: 'Chirp Sonar', img: plmChirp },
    { label: 'Ice Fishing', img: plmIceFishing }, // frosted: Jason 2026-10-23 keeps only Live Ice Fishing, Live Forward, Live Down, Live Combo
    { label: 'Live Ice Fishing', img: plmLiveIce, href: ICE_URL },
  ] },
}
const COMBO = { title: 'Combo', tiles: [{ device: 'PLM', mode: 'combo', label: 'Live Combo', img: plmCombo }] }

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

export default function AppHome({ devices, deviceId, mode, onPick }) {
  const sections = devices.map((d) => ({ id: d.id, ...SECTIONS[d.id] })).filter((s) => s.tiles)
  if (devices.some((d) => d.id === 'PLM')) sections.push({ id: 'PLM', ...COMBO })
  const [toast, setToast] = useState('')
  const toastT = useRef(0)
  useEffect(() => () => clearTimeout(toastT.current), [])
  const notAvailable = () => { setToast('Available with Accuphy PingLive Mini'); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200) }
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
                const live = !!t.mode, link = !t.mode && !!t.href
                const active = live && dev === deviceId && t.mode === mode
                const onClick = live ? () => onPick(dev, t.mode) : link ? () => { window.location.hash = t.href.replace(/^#/, '') } : notAvailable
                return (
                  <button key={t.label} type="button" className={`ph-tile ${live || link ? '' : 'is-off'}`} onClick={onClick} aria-label={t.label} aria-current={active || undefined} aria-disabled={live || link ? undefined : 'true'} style={{ flex: '0 0 44cqh', textAlign: 'center' }}>
                    <span style={{ position: 'relative', display: 'block', borderRadius: t.fan ? 0 : '1.8cqh', overflow: 'hidden', boxShadow: active && !t.fan ? `0 0 0 0.6cqh ${BLUE}` : 'none' }}>
                      <img src={t.img} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '22cqh', objectFit: t.fan ? 'contain' : 'cover' }} />
                      {!(live || link) && <span className="ph-frost" aria-hidden="true" />}
                    </span>
                    <div style={{ fontSize: '4cqh', fontWeight: 500, marginTop: '1.8cqh', color: active ? BLUE : live || link ? '#fff' : 'rgba(255,255,255,0.55)' }}>{t.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: '0 0 17cqh', background: '#161616', borderTop: '0.3cqh solid #262626', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Tab label="Setting" icon="gear" />
        <Tab label="Home" icon="home" active />
        <Tab label="Map" icon="map" />
      </div>
      <div role="status" aria-live="polite" className="ph-toast glass" style={{ opacity: toast ? 1 : 0 }}>{toast}</div>
    </div>
  )
}
