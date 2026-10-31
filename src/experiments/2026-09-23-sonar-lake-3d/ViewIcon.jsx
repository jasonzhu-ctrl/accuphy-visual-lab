// The view icons of the desktop panel (Jason 2026-10-30: "icon里声呐的形状有点丑 重新想一想"): a boat and its beam, so a beginner sees where the
// sonar looks. Drawn for the Lab, copied from no one. Sound leaves the transducer as a fan that fades out, with three thin arcs travelling
// through it; nothing is cut off. The angle is the device's own (specs.md: PingLive 135°, Mini 39°), and Forward's leading edge lies on the
// surface as in the lake (wedge.js, #7). Colours come from index.css: quiet by default, Accuphy blue with a slow ping on the selected tile.
import { useId } from 'react'

const W = 88, H = 56, SEA = 12
const rad = (a) => (a * Math.PI) / 180
const at = (x, y, a, r) => [+(x + r * Math.cos(rad(a))).toFixed(2), +(y + r * Math.sin(rad(a))).toFixed(2)]
const arc = (x, y, aim, deg, r) => { const [a, b] = at(x, y, aim - deg / 2, r), [c, d] = at(x, y, aim + deg / 2, r); return `M${a} ${b}A${r} ${r} 0 0 1 ${c} ${d}` }
const fan = (x, y, aim, deg, r) => `${arc(x, y, aim, deg, r)}L${x} ${y}Z`

function Beam({ x, y, aim, deg, R }) {
  const id = useId().replace(/\W/g, '')
  return (<>
    <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={R}>
      <stop offset="0" style={{ stopColor: 'var(--beam-hot)', stopOpacity: 'var(--beam-a0)' }} />
      <stop offset="0.6" style={{ stopColor: 'var(--beam)', stopOpacity: 'var(--beam-a1)' }} />
      <stop offset="1" style={{ stopColor: 'var(--beam)', stopOpacity: 0 }} />
    </radialGradient>
    <path className="ac-beam" d={fan(x, y, aim, deg, R)} fill={`url(#${id})`} />
    {[0.45, 0.72, 1].map((k, i) => <path key={k} className={`ac-arc ac-arc-${i}`} d={arc(x, y, aim, deg, +(R * k).toFixed(2))} />)}
  </>)
}

const Boat = ({ x }) => (<>
  <path d={`M${x - 13} ${SEA - 5.5}H${x + 9}Q${x + 14} ${SEA - 5.5} ${x + 16} ${SEA - 7}L${x + 11} ${SEA - 0.3}H${x - 11.5}Z`} fill="currentColor" />
  <path d={`M${x - 5} ${SEA - 5.5}V${SEA - 9}H${x + 1}L${x + 2.5} ${SEA - 5.5}`} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
</>)
const Sea = () => <path d={`M4 ${SEA}H${W - 4}`} stroke="currentColor" strokeWidth="1" strokeOpacity="0.38" strokeLinecap="round" />
const IceHole = ({ x }) => (<>
  <path d={`M4 10H${x - 4}M${x + 4} 10H${W - 4}`} stroke="currentColor" strokeWidth="3" strokeOpacity="0.6" strokeLinecap="round" />
  <path d={`M${x} 2V14`} stroke="currentColor" strokeWidth="1" />
  <rect x={x - 2.5} y="13" width="5" height="4" rx="1.2" fill="currentColor" />
</>)

export default function ViewIcon({ view, deg }) {
  const wide = deg > 90
  let art
  if (view === 'panoramic') art = (<>
    <Beam x={wide ? 34 : 26} y={28} aim={0} deg={deg} R={wide ? 29 : 56} />
    <path d={`M${wide ? 11 : 5} 22.5H${wide ? 24 : 18}Q${wide ? 30 : 24} 23 ${wide ? 34 : 28} 28Q${wide ? 30 : 24} 33 ${wide ? 24 : 18} 33.5H${wide ? 11 : 5}Q${wide ? 9.5 : 3.5} 28 ${wide ? 11 : 5} 22.5Z`} fill="currentColor" />
  </>)
  else if (view === 'liveice') art = (<><Beam x={44} y={17} aim={90} deg={deg} R={38} /><IceHole x={44} /></>)
  else if (view === 'ice') art = (<><circle className="ac-ring" cx={44} cy={36} r={14} /><Beam x={44} y={17} aim={90} deg={deg} R={13} /><IceHole x={44} /></>)
  else {
    const x = view === 'down' ? 44 : wide ? 32 : 18
    art = (<>
      <Sea />
      {view !== 'forward' && <Beam x={view === 'down' ? x : x + 8} y={SEA + 1} aim={90} deg={deg} R={wide ? 38 : view === 'combo' ? 41 : 42} />}
      {view !== 'down' && <Beam x={x + 8} y={SEA + 1} aim={deg / 2 + 1} deg={deg} R={wide ? 42 : 58} />}
      <Boat x={x} />
    </>)
  }
  return <svg className="ac-view-icon" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">{art}</svg>
}
