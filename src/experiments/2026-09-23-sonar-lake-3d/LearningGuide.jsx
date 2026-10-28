import { t } from './i18n'

export default function LearningGuide({ steps, step, onStep, onNudge, paused, mobile = false }) {
  return <div className={`lab-guide ${mobile ? 'lab-guide-mobile' : ''}`}>
    <p className="lab-eyebrow">{t('learn_heading')}</p>
    <ol className="lab-learning-path" aria-label={t('learn_path')}>
      {['learn_move', 'learn_reveal', 'learn_echo'].map((key, i) => <li key={key}><span aria-hidden="true">{i + 1}</span>{t(key)}</li>)}
    </ol>
    <p className="lab-guide-copy">{t('learn_observe')}</p>
    <details className="lab-lessons">
      <summary>{t('learn_presets')}</summary>
      <p className="lab-guide-copy">{t('learn_preset_note')}</p>
      <div className="lab-lesson-list">{steps.map((st, i) => <button type="button" key={st.n} aria-pressed={step === i} className="lab-lesson" onClick={() => onStep(i)}>
        <span className="lab-lesson-number" aria-hidden="true">0{st.n}</span>
        <span><strong>{st.title}</strong><small>{t('learn_preset_state', { product: st.device === 'PL' ? 'PingLive' : 'PingLive Mini', mode: t('mode_' + st.mode) })}</small>{step === i && <small>{st.text}</small>}</span>
      </button>)}</div>
    </details>
    {onNudge && <details className="lab-move-controls">
      <summary>{t('learn_keyboard')}</summary>
      <p className="lab-guide-copy">{t('learn_keyboard_hint')}</p>
      <div className="lab-direction-pad" role="group" aria-label={t('learn_keyboard')} onKeyDown={(e) => {
        const delta = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key]
        if (delta && !paused) { e.preventDefault(); onNudge(...delta) }
      }}>
        {[[0, -2, '↑', 'move_away'], [-2, 0, '←', 'move_left'], [0, 2, '↓', 'move_near'], [2, 0, '→', 'move_right']].map(([x, z, icon, key]) => <button type="button" disabled={paused} key={key} aria-label={t(key)} title={t(key)} onClick={() => onNudge(x, z)}>{icon}</button>)}
      </div>
    </details>}
  </div>
}
