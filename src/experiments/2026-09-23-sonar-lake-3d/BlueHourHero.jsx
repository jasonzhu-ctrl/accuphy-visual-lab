import { Component, useEffect, useState } from 'react'
import LakeScene from './Scene'
import SonarChrome from './SonarChrome'
import NativeSonarViewport from './NativeSonarViewport'
import { useSceneSuspended, useReducedMotion } from './SceneLifecycle'
import './blue-hour.css'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? <p role="alert" className="bh-error">The interactive lake could not start. You can still explore PingLive Mini below.</p> : this.props.children }
}

export default function BlueHourHero({ mainRef, state, sonarRect, mount3d, glLost, layout, mode, rangeFt, depthFt, imperial, gain, autoDepth, setAutoDepth, autoRange, pickView, stepRange, stepDepth, setImperial, setGain, paused, setPaused, config = {} }) {
  const host = mainRef
  const [step, setStep] = useState(null), [message, setMessage] = useState('Choose a step, or move the boat to explore.'), [expanded, setExpanded] = useState(false)
  const suspended = useSceneSuspended(host), reduced = useReducedMotion()
  const [ready,setReady]=useState(false)
  const [nativeAspect,setNativeAspect]=useState(2.08)
  const [zoom,setZoom]=useState(1)
  const [failed,setFailed]=useState(false)
  const available=ready&&!glLost&&!failed
  state.current.blueHour = true
  state.current.reducedMotion = reduced
  state.current.flatDevice = true
  state.current.presentationAspect = nativeAspect
  state.current.blueZoom = zoom
  state.current.heroPaused = paused || suspended
  useEffect(()=>{if(ready)return;const id=setTimeout(()=>setFailed(true),30000);return()=>clearTimeout(id)},[ready])
  useEffect(()=>{if(reduced && ready)setPaused(true)},[reduced,ready,setPaused])
  useEffect(() => {
    const id = setInterval(() => {
      const s = state.current
      if (s.apex.y !== 0) setReady(true)
      if (s.blueVoyage && Math.hypot(s.boat.x-s.target.x,s.boat.z-s.target.z)<0.15) {
        s.blueVoyage = false; setMessage('Arrived. Continue exploring with the boat controls.')
        if(reduced)setPaused(true)
      }
      if (s.blueManualTakeover) { s.blueManualTakeover=false; s.blueVoyage=false; setStep(null); setMessage('Manual control. Your previous route has ended.') }
    },200)
    return () => clearInterval(id)
  },[state,reduced,setPaused])
  const select = i => {
    if (i === 2) { setMessage('Panoramic View is not available for PingLive Mini in this simulation. Your current view and boat position are unchanged.'); return }
    const s=state.current; if(paused) setPaused(false)
    setStep(i); pickView('PLM',i===0?'forward':'down','step')
    const p=i===0?[-40,-5]:[22,8]
    s.target.x=p[0]; s.target.z=p[1]; s.blueVoyage=true
    if(reduced){s.boat.x=p[0];s.boat.z=p[1]}
    setMessage(`Moving to the ${i===0?'shelf':'rock hump'}. The sonar follows the same underwater world.`)
  }
  const nudge=(dx,dz)=>{const s=state.current;s.blueVoyage=false;setStep(null);s.target.x=Math.max(-58,Math.min(58,s.boat.x+dx));s.target.z=Math.max(-58,Math.min(58,s.boat.z+dz));setMessage('Manual boat control.');}
  const productUrl=config.productUrl || 'https://shop.accuphy.com/en-us/products/pinglive-mini'
  return <section className={`bh-hero ${expanded?'bh-expanded':''}`} ref={host} aria-label="Blue Hour Lake interactive simulation">
    {config.poster && !available && <img className="bh-poster" src={config.poster} alt="Blue Hour Lake illustration"/>}
    <NativeSonarViewport onAspect={setNativeAspect}/>
    <div className="bh-canvas"><Boundary onError={()=>setFailed(true)}>{mount3d && !glLost && !failed && <LakeScene state={state} sonarRect={sonarRect} paused={paused || suspended} scene="lake" />}</Boundary></div>
    <div className="bh-shade" />
    <header className="bh-heading">
      <p className="bh-kicker">PINGLIVE MINI</p>
      <h1>{config.title || 'SEE BENEATH THE SURFACE.'}<span>{config.subtitle || 'BE PART OF THE ACTION.'}</span></h1>
      <p>Explore the connection between your position on the water and the view below.</p>
      <a className="bh-cta" href={productUrl}>{config.cta || 'Explore PingLive Mini'} <span aria-hidden="true">↗</span></a>
    </header>
    <nav className="bh-steps" aria-label="Explore the sonar">
      {['Beam','Down View','Panoramic View'].map((label,i)=><button key={label} type="button" disabled={!available && i<2} aria-pressed={step===i} onClick={()=>select(i)}><span className="bh-symbol" aria-hidden="true">{['◎','◇','△'][i]}</span><span><small>STEP {i+1}</small><strong>{label}</strong>{i===2&&<em>Mini: unavailable</em>}</span></button>)}
    </nav>
    <p className="bh-status" role="status">{glLost||failed?'The interactive lake is unavailable. Reload to try again, or explore PingLive Mini below.':paused?'Paused. Controls remain available; Resume continues from here.':ready?message:'Loading the interactive lake…'}</p>
    <div className="bh-device" aria-label="Landscape iPad mini">
      <div className="bh-device-bezel"><span className="bh-camera" />
        <div className="bh-display">
          <p className="bh-device-label">PINGLIVE MINI · {mode==='down'?'Down':mode==='combo'?'Combo':'Forward'} <span>Interactive simulation</span></p>
          <div className="bh-sonar-frame" style={{aspectRatio:nativeAspect}} ref={el=>{sonarRect.current.frame=el}}>
            <div className="bh-sonar-content" ref={el=>{sonarRect.current.el=el}}>
              {available && <SonarChrome layout={layout} deviceId="PLM" mode={mode} rangeFt={rangeFt} depthFt={depthFt} imperial={imperial} gain={gain} autoDepth={autoDepth} autoRange={autoRange} phone={false} waterTempC={21.8} depthRef={el=>{state.current.depthEl=el}} />}
            </div>
          </div>
          <p className="bh-example">Temperature and voltage are example values, not measurements.</p>
        </div>
      </div>
      <fieldset disabled={!available} className="bh-screen-controls" aria-label="Sonar controls">
        <label>View <select aria-label="Mini view" value={mode} onChange={e=>{setStep(null);pickView('PLM',e.target.value,'control')}}><option value="forward">Forward</option><option value="down">Down</option><option value="combo">Combo</option></select></label>
        <button type="button" onClick={()=>setImperial(v=>!v)}>{imperial?'ft → m':'m → ft'}</button>
        <button type="button" disabled={autoRange} onClick={()=>stepRange(-1)}>Range −</button><button type="button" disabled={autoRange} onClick={()=>stepRange(1)}>Range +</button>
        <button type="button" onClick={()=>stepDepth(-1)}>Depth −</button><button type="button" onClick={()=>stepDepth(1)}>Depth +</button>
        <button type="button" onClick={()=>setAutoDepth(v=>!v)} aria-pressed={autoDepth}>Auto depth</button>
        <button type="button" onClick={()=>setGain(g=>Math.max(.3,+(g-.01).toFixed(2)))}>Gain −</button><button type="button" onClick={()=>setGain(g=>Math.min(1,+(g+.01).toFixed(2)))}>Gain +</button>
        <button type="button" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{expanded?'Compact view':'Expand view'}</button>
      </fieldset>
    </div>
    <div className="bh-tools" aria-label="Boat and camera controls">
      <div className="bh-move"><span>Move boat</span>{[['←',-4,0,'left'],['→',4,0,'right'],['↑',0,-4,'forward'],['↓',0,4,'back']].map(([label,x,z,name])=><button type="button" key={name} disabled={!ready||paused} aria-label={`Move boat ${name}`} onClick={()=>nudge(x,z)}>{label}</button>)}</div>
      <button type="button" onClick={()=>setPaused(v=>!v)} aria-pressed={paused}>{paused?'Resume':'Pause'}</button>
      <button type="button" onClick={()=>setZoom(1)}>Reset camera</button>
      <button type="button" onClick={()=>setZoom(v=>Math.max(.75,v-.15))} aria-label="Zoom in">＋</button>
      <button type="button" onClick={()=>setZoom(v=>Math.min(1.6,v+.15))} aria-label="Zoom out">−</button>
    </div>
    <p className="bh-disclosure">Interactive simulation · Underwater reveal is an illustration, not a device capability.</p>
  </section>
}
