// The real app's Home — its view-selection page — drawn inside the phone display (Jason 2026-10-16: 不同的 view
// option 可以模拟在手机上的 app 的官方版本的选择页面进入吗). Layout from reference/app-study/home*.jpg: a dark page, one
// section per device ("PingLive", "PingLive Mini", and "Combo") with a rounded dark panel of thumbnail tiles and
// their labels, and a Setting · Home · Map tab bar. The thumbnails are crops of the app's own tiles. Tapping a tile
// enters that view; the app's ↶ button on the view brings Home back. Sizes are in cqh of the display, like SonarChrome.
import plPanoramic from './pl-panoramic.jpg'
import plForward from './pl-forward.jpg'
import plDown from './pl-down.jpg'
import plmForward from './plm-forward.jpg'
import plmDown from './plm-down.jpg'
import plmCombo from './plm-combo.jpg'

const SECTIONS = {
  PL: { title: 'PingLive', tiles: [
    { mode: 'panoramic', label: 'Panoramic View', img: plPanoramic, fan: true },
    { mode: 'forward', label: 'Forward View', img: plForward, fan: true },
    { mode: 'down', label: 'Down View', img: plDown, fan: true },
  ] },
  PLM: { title: 'PingLive Mini', tiles: [
    { mode: 'forward', label: 'Live Forward', img: plmForward },
    { mode: 'down', label: 'Live Down', img: plmDown },
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
  return (
    <div className="ph-home" role="dialog" aria-label="Home" onPointerDown={(e) => e.stopPropagation()}
      style={{ position: 'absolute', inset: 0, background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body, "Instrument Sans", system-ui, sans-serif)' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '4cqh 3.5cqh 3cqh' }}>
        {sections.map((sec, i) => (
          <div key={sec.title}>
            <div style={{ fontSize: '6.6cqh', fontWeight: 600, letterSpacing: '-0.01em', margin: i ? '5cqh 0 2.4cqh' : '0 0 2.4cqh' }}>{sec.title}</div>
            <div style={{ background: '#1c1c1c', borderRadius: '3cqh', padding: '3cqh', display: 'flex', gap: '3cqh' }}>
              {sec.tiles.map((t) => {
                const dev = t.device || sec.id, active = dev === deviceId && t.mode === mode
                return (
                  <button key={t.mode} type="button" className="ph-tile" onClick={() => onPick(dev, t.mode)} aria-label={t.label} aria-current={active || undefined} style={{ flex: '0 0 60cqh', textAlign: 'center' }}>
                    <img src={t.img} alt="" draggable={false} style={{ display: 'block', width: '100%', height: '30cqh', objectFit: t.fan ? 'contain' : 'cover', borderRadius: t.fan ? 0 : '1.8cqh', boxShadow: active && !t.fan ? `0 0 0 0.6cqh ${BLUE}` : 'none' }} />
                    <div style={{ fontSize: '4.4cqh', fontWeight: 500, marginTop: '2cqh', color: active ? BLUE : '#fff' }}>{t.label}</div>
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
    </div>
  )
}
