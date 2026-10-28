import { useEffect, useId, useRef, useState } from 'react'
import { LANG } from './i18n'
import { MODE_GUIDE_COPY } from './modeGuideCopy'
import './mode-guide.css'

const copy = (key) => MODE_GUIDE_COPY['mode_guide_' + key][LANG]

// This is a view selector, not a scene preset. The parent owns mode validation,
// product/state changes and the existing view event; this component only calls onPick.
export default function ModeGuide({ deviceId, mode, onPick, compact = false, paused = false }) {
  const id = useId()
  const [hintActive, setHintActive] = useState(true)
  const [confirmed, setConfirmed] = useState(null)
  const confirmationTimer = useRef(null)
  useEffect(() => {
    // At most three 1.4 s cycles per mounted guide. A click ends them immediately.
    const timer = setTimeout(() => setHintActive(false), 4200)
    return () => clearTimeout(timer)
  }, [])
  useEffect(() => () => clearTimeout(confirmationTimer.current), [])

  const views = [
    { mode: 'forward', label: copy('beam'), detail: copy('forward') },
    { mode: 'down', label: copy('down') },
    deviceId === 'PLM'
      ? { mode: 'combo', label: copy('combo') }
      : { mode: 'panoramic', label: copy('panoramic') },
  ]
  const nextHint = views.find((view) => view.mode !== mode)?.mode
  const pick = (nextMode) => {
    onPick(nextMode)
    setHintActive(false)
    clearTimeout(confirmationTimer.current)
    setConfirmed(nextMode)
    confirmationTimer.current = setTimeout(() => setConfirmed(null), 650)
  }

  return (
    <div className={`mode-guide${compact ? ' mode-guide--compact' : ''}${paused ? ' is-paused' : ''}`}
      role="group" aria-labelledby={`${id}-heading`} aria-describedby={`${id}-hint`}>
      <p id={`${id}-heading`} className="mode-guide__heading">{copy('heading')}</p>
      <p id={`${id}-hint`} className="mode-guide__hint">{copy(paused ? 'paused' : 'hint')}</p>
      <div className="mode-guide__views">
        {views.map((view) => {
          const selected = mode === view.mode
          const cue = hintActive && !paused && !selected && nextHint === view.mode
          return (
            <button key={view.mode} type="button" aria-pressed={selected}
              aria-label={view.label + (view.detail ? ` · ${view.detail}` : '')}
              className={`mode-guide__button${selected ? ' is-selected' : ''}${cue ? ' is-hinting' : ''}${selected && confirmed === view.mode ? ' is-confirmed' : ''}`}
              onPointerDown={(event) => event.stopPropagation()} onClick={() => pick(view.mode)}>
              <span className="mode-guide__copy">
                <span className="mode-guide__title">{view.label}</span>
                <span className="mode-guide__subline">
                  {view.detail && <span className="mode-guide__detail">{view.detail}</span>}
                  <span className="mode-guide__state">
                    {selected ? copy('current') : <>
                      <span className="mode-guide__click">{copy('click')}</span>
                      <span className="mode-guide__tap">{copy('tap')}</span>
                      <span aria-hidden="true"> →</span>
                    </>}
                  </span>
                </span>
              </span>
              <span className="mode-guide__mark" aria-hidden="true">
                {selected
                  ? <svg width="20" height="20" viewBox="0 0 20 20"><path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : <span className="mode-guide__arrow">→</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
