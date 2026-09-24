// The real app's screen chrome, drawn over the GL picture inside the phone display
// (measured on the tablet 2026-09-24 — docs/app-chrome.md). All sizes are in
// container-query units of the display, so it scales with the phone frame.
// Decorative: the buttons do not work (the panel on the left is the control).
import { FT } from '../2026-09-23-sonar-beam/devices'

const num = 'font-brand-body tabular-nums'

function niceStep(span) { // ruler step for ~5–8 labels over `span` display units
  const raw = span / 6
  const p = Math.pow(10, Math.floor(Math.log10(raw)))
  const m = raw / p
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p
}
function ticks(from, to, step) {
  const out = []
  for (let v = Math.ceil(from / step) * step; v <= to + 1e-6; v += step) out.push(+v.toFixed(6))
  return out
}

export default function SonarChrome({ layout, deviceId, mode, rangeFt, imperial, gain, depthRef }) {
  const unit = imperial ? FT : 1 // metres per display unit
  const box = layout.box0
  const rangeLabel = imperial ? `${Math.round(rangeFt)}ft` : `${Math.round(rangeFt * FT)}m`
  const flat = mode === 'panoramic'
  const split = layout.split
  // rulers (display units)
  const hx0 = box.x0 / unit, hx1 = (box.x0 + box.w) / unit
  const hStep = niceStep(Math.abs(hx1 - hx0))
  const top = ticks(hx0, hx1, hStep).filter((v) => v !== 0 || true)
  const vStep = niceStep(box.h / unit)
  const side = ticks(0, box.h / unit, vStep).filter((v) => v > 0)
  const leftBox = split ? layout.box1 : box
  const lStep = niceStep(leftBox.h / unit)
  const left = ticks(0, leftBox.h / unit, lStep).filter((v) => v > 0)
  const mini = deviceId === 'PLM'
  const showDepthRange = !mini && mode === 'forward'
  const label = (v) => `${Math.abs(Math.round(v * 100) / 100)}`
  const Ring = ({ children, style }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '7cqh', height: '7cqh', borderRadius: '50%', border: '0.55cqh solid #fff', fontSize: '5.5cqh', lineHeight: 1, ...style }}>{children}</span>
  )
  return (
    <div className="absolute inset-0 select-none text-white" style={{ fontFamily: 'var(--font-body, "Instrument Sans", system-ui, sans-serif)' }}>
      {/* rulers: italic numbers, no lines (orange mode has no grid) */}
      {top.map((v) => { const x = ((v - hx0) / (hx1 - hx0)) * 100; if (x < 1.5 || x > 98.5) return null; return <span key={`t${v}`} className={num} style={{ position: 'absolute', top: '1.5cqh', left: `${x}%`, transform: 'translateX(-50%)', fontSize: '3.2cqh', fontStyle: 'italic', opacity: 0.9 }}>{label(v)}</span> })}
      {side.map((v) => { const y = (v * unit / box.h) * 100; const yy = flat ? 100 - y : y; if (yy < 4 || yy > 96) return null; return <span key={`r${v}`} className={num} style={{ position: 'absolute', right: '0.6%', top: `${yy}%`, transform: 'translateY(-50%)', fontSize: '3.2cqh', opacity: 0.9 }}>{label(v)}</span> })}
      {left.map((v) => { const y = (v * unit / leftBox.h) * 100; const yy = flat ? 100 - y : y; if (yy < 4 || yy > 96) return null; return <span key={`l${v}`} className={num} style={{ position: 'absolute', left: '0.6%', top: `${yy}%`, transform: 'translateY(-50%)', fontSize: '3.2cqh', opacity: 0.9 }}>{label(v)}</span> })}

      {/* depth readout + water temp + voltage (top-left; Combo: top-right) */}
      <div style={{ position: 'absolute', top: '11cqh', ...(split ? { right: '5%', textAlign: 'left' } : { left: '4%' }) }}>
        <div ref={depthRef} className={num} style={{ fontSize: '12cqh', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.01em' }}>— —</div>
        <div className={num} style={{ fontSize: '4.2cqh', marginTop: '3cqh', lineHeight: 1.5 }}>21.8 °C<br />12.6 V</div>
      </div>

      {/* wordmark + resolution tag (top-right) — not in Combo, where the readout sits there */}
      {!split && (
        <div style={{ position: 'absolute', right: '3%', top: '6cqh', textAlign: 'right' }}>
          <img src="/brand/logo/White Accuphy Logo.png" alt="" style={{ height: '4.2cqh', width: 'auto', opacity: 0.55, display: 'inline-block' }} draggable={false} />
          <div className={num} style={{ fontSize: '2.8cqh', fontStyle: 'italic', opacity: 0.45, marginTop: '0.6cqh' }}>1440p (QHD)</div>
        </div>
      )}

      {/* depth-range control on the right edge (PL Forward only) */}
      {showDepthRange && (
        <div style={{ position: 'absolute', right: '5.5%', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2cqh' }}>
          <Ring>−</Ring>
          <span className={num} style={{ fontSize: '4.6cqh', fontWeight: 500 }}>{rangeLabel}</span>
          <Ring>+</Ring>
        </div>
      )}

      {/* bottom bar: back · range −/+ · pause · gain −/+ · ⋯ */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '2.5cqh', height: '9cqh' }}>
        <span style={{ position: 'absolute', left: '2.5%', top: '50%', transform: 'translateY(-50%)', fontSize: '7cqh', lineHeight: 1 }}>↶</span>
        {!split && (
          <div style={{ position: 'absolute', left: '19%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '2.2cqh' }}>
            <Ring>−</Ring><span className={num} style={{ fontSize: '4.8cqh', fontWeight: 500 }}>{rangeLabel}</span><Ring>+</Ring>
          </div>
        )}
        <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}><Ring style={{ width: '9cqh', height: '9cqh', gap: '0.9cqh' }}><i style={{ display: 'block', width: '0.9cqh', height: '3.6cqh', background: '#fff', borderRadius: '0.3cqh' }} /><i style={{ display: 'block', width: '0.9cqh', height: '3.6cqh', background: '#fff', borderRadius: '0.3cqh' }} /></Ring></span>
        {!split && (
          <div style={{ position: 'absolute', left: '75%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '2.2cqh' }}>
            <Ring>−</Ring><span className={num} style={{ fontSize: '4.8cqh', fontWeight: 500 }}>{Math.round(gain * 100)}%</span><Ring>+</Ring>
          </div>
        )}
        <span style={{ position: 'absolute', right: '2.5%', top: '50%', transform: 'translateY(-50%)', fontSize: '7cqh', lineHeight: 0.6, letterSpacing: '-0.05em' }}>•••</span>
      </div>
    </div>
  )
}
