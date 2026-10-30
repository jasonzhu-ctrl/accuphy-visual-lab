// The view icons of the desktop panel (Jason 2026-10-30): a small boat and its beam, so a beginner sees where the sonar looks. Drawn for
// the Lab, copied from no one. Down, Forward and Combo are side views, Panoramic a top view. The beam's angle is the device's own
// (specs.md: PingLive 135°, Mini 39°); `active` fills it Accuphy blue. One stroke weight.
const W = 44, H = 26, SEA = 8

const rad = (a) => (a * Math.PI) / 180
// a fan from (x, y), aimed `aim` degrees (0 = right, 90 = down), `deg` wide
function fan(x, y, aim, deg, r) {
  const a0 = rad(aim - deg / 2), a1 = rad(aim + deg / 2)
  return `M${x} ${y}L${(x + r * Math.cos(a0)).toFixed(2)} ${(y + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(x + r * Math.cos(a1)).toFixed(2)} ${(y + r * Math.sin(a1)).toFixed(2)}Z`
}
const hull = (x) => `M${x - 6.5} ${SEA - 3}H${x + 7.5}L${x + 4.5} ${SEA}H${x - 5.5}Z`

export default function ViewIcon({ view, deg, active }) {
  const id = `ac-sea-${view}-${deg}`
  const beam = { fill: active ? '#028cdf' : 'currentColor', fillOpacity: active ? 0.95 : 0.24, stroke: active ? '#028cdf' : 'currentColor', strokeWidth: 1, strokeLinejoin: 'round' }
  if (view === 'panoramic') return (
    <svg className="ac-view-icon" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <path d={fan(13, 13, 0, deg, 25)} {...beam} />
      <path d="M1.5 10h8l4 3-4 3h-8z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
  const x = view === 'down' ? 22 : 10
  return (
    <svg className="ac-view-icon" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      <defs><clipPath id={id}><rect x="0" y={SEA} width={W} height={H - SEA} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {view !== 'forward' && <path d={fan(x, SEA, 90, deg, 17)} {...beam} />}
        {view !== 'down' && <path d={fan(x + 5, SEA, 24, deg, 30)} {...beam} />}
      </g>
      <path d={`M0.5 ${SEA}H${W - 0.5}`} fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      <path d={hull(x)} fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}
