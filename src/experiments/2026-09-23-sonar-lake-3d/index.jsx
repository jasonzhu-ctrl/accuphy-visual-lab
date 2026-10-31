import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import LakeScene from './Scene'
import { DEVICES, FT, ICE_MODES } from '../2026-09-23-sonar-beam/devices'
import { iceParams, ICE_START, VIEWS } from './iceScene'
import { wedgeSpecs } from '../2026-09-23-beam-shapes-3d/wedge'
import { phonePose, isPhoneLayout, isLandscapePhone, PHONE_POSE_FLAT, comboFwdDepth } from './SonarScreen'
import { COLORMAP_NAMES } from './colormaps'
import SonarChrome from './SonarChrome'
import { screenLayout } from './SonarScreen'
import UnlockCard, { LockIcon } from './UnlockCard'
import AppHome, { isLocked, viewThumb, VIEW_IMG } from './home/AppHome'
import ViewIcon from './ViewIcon'
import GlassLayer, { GLASS } from './GlassLayer' // the app's Home (view selection) page inside the phone, phones only (2026-10-16)
import { isSignedUp } from './signup'
import { iceUrl, labEvent, miniOnly, PRODUCT, sentEvents } from './embed'
import ShopButton from './ShopButton' // the one link to the store (X-6L, 2026-10-25; placement B, Jason)
import { t } from './i18n' // every visitor-visible string, English or French (?lang=fr; X-6L-fr)
import ShareButton from './ShareButton'
import AppBadges from './AppBadges'
// BF funnel items 1–2 (handoff 2026-10-26): two placements for Jason to pick (HQ: 先出 2 个样子，不直接定); off until he does
import { depthAt } from './terrain'
import { panoHalfWidth } from './sonarMarks'
// dev: ?bigphone makes the phone huge so the sonar picture can be inspected in screenshots
const BIG_PHONE = import.meta.env.DEV && window.location.search.includes('bigphone')
// Build variant (Jason 2026-10-16): VITE_DEVICES='PLM' makes a PingLive Mini-only page — no device switch, the
// Mini is the device, the step presets use its views. Unset: both devices (the default Lab).
const LOCKED_NAME = { combo: 'tile_live_combo', panoramic: 'tile_live_panoramic', ice: 'tile_ice' }
const ONLY_ENV = import.meta.env.VITE_DEVICES === 'PLM' ? 'PLM' : null
// Scene (Jason 2026-10-16: 做一个冰钓的版本): 'lake' = the boat; 'ice' = the frozen lake with the PingLive Mini in an auger hole
// (IceCamp.jsx). The ice page is its own gallery entry (2026-10-16-sonar-ice-3d) and a build variant, VITE_SCENE=ice.
const SCENE_ENV = import.meta.env.VITE_SCENE === 'ice' ? 'ice' : null
// The page is for people who have never used live sonar (Jason 2026-09-24): only Device / View / Range are
// public. Colour map, gain, contrast, noise reject and the depth-range axis are calibration tools — dev only (?dev).
const DEV_TOOLS = import.meta.env.DEV && window.location.search.includes('dev')

// AUTO depth range (PL Forward), as the app does it (Jason 2026-09-24: 声纳是根据他垂直往下的深度来判断深度的
// 然后auto depth是根据这个数字去调节画面depth range的): AUTO follows the depth READOUT — the water straight below
// the transducer, the big number on the screen — and sets the depth range so that bottom sits at ~80 % of the
// screen height, in the app's depth-range steps (8 · 9 · 10 · 12 · 14 · 16 · 18 m …, docs/app-chrome.md).
// A deeper bottom ahead may run off the screen, like in the app. (The first version took the deepest bottom
// anywhere in the picture; over a drop-off that counted water hidden behind the shelf edge, 80 ft over 18 ft.)
const DEPTH_STEPS_M = [6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 25, 30, 35, 40, 45, 50, 60, 70]
const DEPTH_STEPS_FT = [20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 200, 220, 240]
const RANGE_STEPS_FT = [20, 30, 40, 50, 60, 70, 80, 100, 120, 150, 180, 200, 240]
// PLM Combo: the range is AUTO, like the app (its Live Combo has no range control at all) — about three times the AUTO
// depth, on the range steps, 40–160 ft. Jason 2026-10-23: dragging the Lab's slider to 200 ft squeezed the Forward
// panel's bottom into the top strip; a beginner should never be able to do that, and the picture should just read.
const comboAutoRangeFt = (depthFt, maxFt) => { const want = Math.min(Math.min(maxFt, 160), Math.max(40, 3 * depthFt)); const steps = RANGE_STEPS_FT.filter((v) => v <= want); return steps[steps.length - 1] ?? 40 }
// Down view is fully AUTO on both devices (Jason 2026-09-25, PL Down at 145 ft over 61 ft of water: 像这种情况 auto
// depth就好像没用一样 自动调整了以后有效画面应该在屏幕上会更大). In Down the depth axis IS the range, so the range
// follows the AUTO depth (bottom at ~80 % of the height) instead of only rising when the bottom would leave the screen
// (#52, which let a visitor's long range leave half the screen empty). The Range slider is greyed out there.
function autoDepthFt(s, maxFt) {
  const readoutM = depthAt(s.apex.x, s.apex.z) // the same number as the depth readout on the phone
  const needM = readoutM / 0.8
  const steps = s.imperial ? DEPTH_STEPS_FT.map((ft) => ft * FT) : DEPTH_STEPS_M
  const m = steps.find((v) => v >= needM - 1e-6) ?? steps[steps.length - 1]
  return Math.min(maxFt, m / FT)
}

export const meta = {
  title: 'Sonar lake 3D — Phase 3/4',
  description: '3D lake with real-scale structure and NA fish; PL/PLM beam volumes reveal the bottom; the app screen (computed from the scene) on an iPhone. Drag the boat.',
}

// lab="fish": the fish-echo test page (2026-10-24-sonar-fish-echo, #153). Since #170 every page draws the fish from their
// 3D bodies as the transducer sees them (#153 round 3, true size); dev only: ?fish=marks shows the old #120 marks for A/B,
// ?fishsize=1.6 enlarges the sonar fish, and the test page shows its two switches
export default function SonarLake3D({ scene: sceneProp, lab }) {
  const scene = sceneProp || SCENE_ENV || (/[?&]scene=ice/.test(window.location.search) ? 'ice' : 'lake')
  const ICE = scene === 'ice'
  const ONLY = ICE || miniOnly() ? 'PLM' : ONLY_ENV // on the ice the Mini is the device: the app's ice views are the Mini's; the store's US market too (#190)
  const SHOWN_DEVICES = ONLY ? [DEVICES[ONLY]] : Object.values(DEVICES)
  const [deviceId, setDeviceId] = useState(ONLY || 'PL')
  const [mode, setMode] = useState(ICE ? (/[?&]view=ice\b/.test(window.location.search) && isSignedUp() ? 'ice' : 'liveice') : 'forward') // ?view=ice: the Ice Fishing tile from the lake (#191)
  const [view, setView] = useState(ICE ? iceParams().view : 'top') // ice page cameras: top / under the ice / section (docs/ice-relationship-study.md)
  // the ice page: the step cards stack under the control panel, so the ice band across the top stays open for taps
  const panelRef = useRef(null)
  const [cardsTop, setCardsTop] = useState(340)
  useEffect(() => {
    if (!ICE) return
    const m = () => { const el = panelRef.current; if (el) setCardsTop(el.offsetTop + el.offsetHeight + 12) }
    m(); const id = setTimeout(m, 400); window.addEventListener('resize', m)
    return () => { clearTimeout(id); window.removeEventListener('resize', m) }
  }, [ICE, view, mode])
  const [rangeFt, setRangeFt] = useState(80)       // the visitor's own range (slider)
  // dev: ?gain=0.4&contrast=0.47&noise=0.25&depth=80 set the calibration knobs from the URL (like-for-like comparisons
  // with app recordings, 2026-10-23); production ignores them
  const devNum = (k) => (import.meta.env.DEV ? +((new RegExp(`[?&]${k}=([\\d.]+)`).exec(window.location.search) || [])[1] || NaN) : NaN)
  const [depthFt, setDepthFt] = useState(Number.isFinite(devNum('depth')) ? devNum('depth') : 70) // depth range (PL Forward; every PLM view) — driven by AUTO below
  const [autoDepth, setAutoDepth] = useState(!Number.isFinite(devNum('depth'))) // off only when the dev Depth slider is touched (or ?depth=)
  const [unlock, setUnlock] = useState(null)       // the subscribe card is open: { d, m, name, source } of the pick it holds, or { ice } (#191)
  const [unlocked, setUnlocked] = useState(isSignedUp) // the locked views open after subscribing, remembered on this device (signup.js)
  // In-app browsers (BF funnel handoff 2026-10-26, item 3). (1) The 3D mounts one frame AFTER the page so the static cover
  // (#lab-cover, share build) is on screen while the scene builds; the cover fades after the lake's first frames.
  // (2) A lost WebGL context (Meta's browser drops it when memory is short) shows a tap-to-reload card instead of a frozen
  // page; a restored context remounts the scene. (3) The page's height follows window.innerHeight, not only 100vh/dvh.
  const [mount3d, setMount3d] = useState(false)
  const [glLost, setGlLost] = useState(false)
  const [glKey, setGlKey] = useState(0)
  const mainRef = useRef(null)
  useEffect(() => { let a = requestAnimationFrame(() => { a = requestAnimationFrame(() => setMount3d(true)) }); const t = setTimeout(() => setMount3d(true), 120); return () => { cancelAnimationFrame(a); clearTimeout(t) } }, []) // frames do not run in a background tab: the timeout mounts anyway
  useEffect(() => {
    if (!mount3d) return
    let raf = 0, canvas = null, frames = 0, ready = false, timer = 0
    const cover = document.getElementById('lab-cover')
    const onLost = (e) => { e.preventDefault(); setGlLost(true) }
    const onRestored = () => { setGlLost(false); setGlKey((k) => k + 1) }
    const onEvent = (e) => { if (e.detail?.event === 'ready') ready = true } // `ready` = the WebGL context exists; the scene
    window.addEventListener('accuphy-lab', onEvent)                        // then builds in one blocking task, so the next
    const tick = () => {                                                   // two frames come after the first render
      if (!canvas) canvas = mainRef.current?.querySelector('canvas')
      if (!ready && sentEvents.has('ready')) ready = true // `ready` can fire before this listener exists (R3F's onCreated timing)
      if (canvas && ready && ++frames >= 2) {
        if (cover) { cover.classList.add('is-done'); setTimeout(() => cover.remove(), 600) }
        canvas.addEventListener('webglcontextlost', onLost); canvas.addEventListener('webglcontextrestored', onRestored)
        return
      }
      raf = requestAnimationFrame(tick); timer = setTimeout(tick, 400) // the timeout keeps it going in a background tab
    }
    tick()
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); window.removeEventListener('accuphy-lab', onEvent); canvas?.removeEventListener('webglcontextlost', onLost); canvas?.removeEventListener('webglcontextrestored', onRestored) }
  }, [mount3d, glKey])
  useEffect(() => {
    const set = () => document.documentElement.style.setProperty('--lab-h', `${window.innerHeight}px`)
    set(); window.addEventListener('resize', set); window.addEventListener('orientationchange', set); window.visualViewport?.addEventListener('resize', set)
    return () => { window.removeEventListener('resize', set); window.removeEventListener('orientationchange', set); window.visualViewport?.removeEventListener('resize', set) }
  }, [])
  const [toast, setToast] = useState(false)
  // Phones (lake scene) open ON the app's Home page and nothing starts until a view is picked (Jason 2026-10-16:
  // 显示首页选视图 而且应该必须先选才能开始): no beam, no sonar picture, no capsules until the first pick.
  const homeFirst = (isPhoneLayout() || isLandscapePhone()) && !ICE
  const [home, setHome] = useState(homeFirst)      // the app's Home page is open inside the phone display
  const [started, setStarted] = useState(!homeFirst) // a view has been picked (always true on desktop and on the ice page)
  const toastT = useRef(0)
  const [imperial, setImperial] = useState(true)
  const [colormap, setColormap] = useState('accuphy_mid') // halfway between the app 2.0.0 'orange' map measured on its own recording and the LiveScope amber (Jason 2026-10-23: 折中); 'garmin_amber' was the LiveScope-measured amber (§7.7)
  const [gain, setGain] = useState(Number.isFinite(devNum('gain')) ? devNum('gain') : 0.40) // 40 %: the app's own recordings run at 40–50; the look is the one the old 57 % gave (sonarShader toneIdx)
  const [contrast, setContrast] = useState(Number.isFinite(devNum('contrast')) ? devNum('contrast') : 0.4)    // demo look (sonar-style.md §6.5): floor mostly gone, a trace of noise stays
  const [noise, setNoise] = useState(Number.isFinite(devNum('noise')) ? devNum('noise') : 0.3)          // noise reject (inset cleaner than real use, decision #28): the smaller of the two, used last
  const [, tick] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => tick(1)); return () => cancelAnimationFrame(id) }, [])
  // phone layout and phone pose follow the window width (rotate / resize)
  useEffect(() => { const on = () => tick((n) => n + 1); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])
  // the sonar picture is drawn by the GL canvas into the phone's screen element (lake: the sideways phone's lake inset)
  const sonarRect = useRef({ el: null, frame: null, lake: null })
  // a phone held sideways (#140): the phone is the app itself — Home, then the sonar full-screen with the app's controls,
  // the lake a small inset; a tap on the inset swaps them (lakeBig). The lake page only: the ice page keeps its layout.
  const land = isLandscapePhone() && !ICE
  const phone = isPhoneLayout() || land
  const [lakeBig, setLakeBig] = useState(false)
  // the fish-echo test page (#153): two switches on the page itself (Jason opens it from a link, not with URL flags)
  const [fishNew, setFishNew] = useState(!(import.meta.env.DEV && /[?&]fish=marks/.test(window.location.search)))
  const [fishBig, setFishBig] = useState(import.meta.env.DEV && /[?&]fishsize=1\.6/.test(window.location.search))
  // the display's real aspect when sideways (the screen minus the safe areas); everywhere else the phone frame's 2.08
  const [landAspect, setLandAspect] = useState(2.08)
  useEffect(() => {
    const el = sonarRect.current.el
    if (!land || !el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => { if (el.offsetHeight > 0) setLandAspect(+(el.offsetWidth / el.offsetHeight).toFixed(3)) })
    ro.observe(el); return () => ro.disconnect()
  }, [land])
  const dispAspect = land ? landAspect : 2.08
  // the gallery's "← Lab" link would sit on the app's depth readout and Home title (dev gallery only; the public build has none)
  useEffect(() => { document.body.classList.toggle('lab-land', land); return () => document.body.classList.remove('lab-land') }, [land])

  const device = DEVICES[deviceId]
  const modes = ICE ? [...ICE_MODES, 'ice'] : deviceId === 'PLM' ? [...device.modes, 'panoramic'] : device.modes // the Mini's Panoramic: behind the subscribe card (#191)
  const maxFt = device.maxRangeFt
  useEffect(() => {
    if (!modes.includes(mode)) setMode(ICE ? 'liveice' : 'down')
    if (rangeFt > maxFt) setRangeFt(maxFt)
  }, [deviceId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Down and Forward run on AUTO depth, on both devices (PL Forward #41, PingLive Mini #60, PL Down #65). Down and
  // Forward share ONE depth range, so the bottom under the boat sits at the same height (~80 %) in both and does not
  // jump when the view changes (Jason 2026-09-25: 他们的底能不能尽量align一点呢). In Down the depth axis is the range,
  // so Down's range is that AUTO value. Combo keeps the app's own two scales (SonarScreen.jsx screenLayout).
  const autoDepthOn = autoDepth && mode !== 'panoramic' // Down, Forward and Combo's Down panel
  const downLike = mode === 'down' || mode === 'ice' || mode === 'liveice' // the ice views are the Down fan (+ the flasher): AUTO range too
  // the range everything uses: Down's is the AUTO depth range; Forward and Panoramic use the visitor's range
  // PLM Combo: two ranges, each moved on its own (Jason 2026-10-29: forward 的 range 跟 down 的 range 可以分别的调, #189;
  // was one AUTO range, #125). Until the visitor moves one it follows the water: Forward the old AUTO range, Down the AUTO
  // depth. Entering Combo starts on AUTO again.
  const combo = mode === 'combo'
  const [comboFwdFt, setComboFwdFt] = useState(null), [comboDownFt, setComboDownFt] = useState(null)
  useEffect(() => { setComboFwdFt(null); setComboDownFt(null) }, [mode, deviceId])
  const comboFwd = comboFwdFt ?? comboAutoRangeFt(depthFt, maxFt), comboDown = comboDownFt ?? depthFt
  const effRangeFt = downLike ? depthFt : combo ? comboFwd : rangeFt
  const specs = useMemo(() => {
    const rangeFt = effRangeFt
    const sp = wedgeSpecs(device, mode, rangeFt * FT)
    // PL Forward: the sound covers the whole picture box (range ahead × depth range down, sonar-style.md §6.9);
    // the curtain in the lake is that box, so it touches exactly what the phone shows
    if (deviceId === 'PL' && mode === 'forward' && sp[0]) { const R = rangeFt * FT, D = depthFt * FT; sp[0] = { ...sp[0], R: Math.hypot(R, D) * 1.001, box: { xMin: -0.25 * R, xMax: R, yMax: D } } }
    // Panoramic: the picture runs to its corners (range ahead × half-width sideways), so the curtain does too;
    // with the 5°–25° slab it then covers exactly what the screen shows (Jason 2026-09-24: coverage 错位)
    if (mode === 'panoramic' && sp[0]) { const R = rangeFt * FT; sp[0] = { ...sp[0], R: 1.6 * R, box: { xMin: -1e5, xMax: R, yMax: 1e5, zMax: panoHalfWidth * R } } }
    // PLM Forward: range ahead × AUTO depth down, the sound reaching the box's far corner like PL Forward, so the
    // bottom stays on the picture however deep the water is
    // PL Down: the app draws echoes over the whole 1:1 box (its lower corners too, sonar-style.md §6.9), so the sound
    // reaches the box corners and the bottom runs across the full width
    if (deviceId === 'PL' && mode === 'down' && sp[0]) { const D = rangeFt * FT, w = D * 2.08; sp[0] = { ...sp[0], R: Math.hypot(w / 2, D) * 1.001, box: { xMin: -w / 2, xMax: w / 2, yMax: D } } }
    // PLM Combo: the Down fan reaches its AUTO-depth panel, the Forward fan its 0.7 × range panel (SonarScreen.jsx)
    if (deviceId === 'PLM' && mode === 'combo' && sp[1]) {
      const R = rangeFt * FT, D = comboDown * FT, wd = (D * 2.08) / 2
      // the Down fan's beam is drawn whole in the lake (Jason 2026-10-23: 三角形不够完整 … 左边缺了一个角 补完整): the app's
      // Combo panel still crops its left side (the apex sits 20 % in), but the coverage in the water is the full fan
      sp[0] = { ...sp[0], R: Math.hypot(0.8 * wd, D) * 1.001 }
      const hF = comboFwdDepth(R, depthFt * FT); sp[1] = { ...sp[1], R: Math.hypot(R, hF) * 1.001, box: { xMin: -0.25 * R, xMax: R, yMax: hF } } // the Forward panel's depth (SonarScreen.jsx)
    }
    if (deviceId === 'PLM' && mode === 'forward' && sp[0]) { const R = rangeFt * FT, D = depthFt * FT; sp[0] = { ...sp[0], R: Math.hypot(R, D) * 1.001, box: { xMin: -0.25 * R, xMax: R, yMax: D } } }
    return sp
  }, [device, deviceId, mode, effRangeFt, depthFt, comboDown])
  // Before the first pick on a phone there are no fans at all. The gate is tied to the CURRENT layout, not only to the
  // `started` flag: if the page mounted narrow (Home first) and then became wide (phone rotated to landscape, a resized
  // window, or a browser pane that grew), desktop has no Home page to pick from, so it must run as started.
  const live = started || !phone
  const liveSpecs = live ? specs : []
  const specKey = `${deviceId}-${mode}-${effRangeFt}-${live ? 1 : 0}`
  const layout = useMemo(() => screenLayout(deviceId, mode, effRangeFt * FT, dispAspect, specs, (combo ? comboDown : depthFt) * FT, depthFt * FT), [deviceId, mode, effRangeFt, depthFt, combo, comboDown, specs, dispAspect]) // display aspect = phone frame aspect (sideways: the screen's)

  const b0 = (/boat=(-?[\d.]+),(-?[\d.]+)/.exec(window.location.search) || []).slice(1).map(Number) // dev: ?boat=x,z
  // Phones open on the standing-timber flat (18 ft; bass, walleye and pike 8–15 m ahead), so the 50 m-wide phone view
  // shows structure and fish at once (Jason 2026-10-16: 手机版本这块地方没什么结构和鱼 … 只是改手机). Desktop keeps
  // (-6, 4) and the ice scene keeps its own start; ?boat= overrides all of them.
  const PHONE_START = [16, 11]
  const START = b0.length === 2 ? b0 : ICE ? ICE_START : phone ? PHONE_START : [-6, 4]
  const state = useRef({
    boat: { x: START[0], z: START[1] }, target: { x: START[0], z: START[1] }, apex: new THREE.Vector3(), dragging: false,
    frameX: phone && !ICE && b0.length !== 2 ? PHONE_START[0] - 1 : undefined, // phones: boat left, timber right, and the ACCUPHY LAB lockup (x −1…31 at z −52) fully in view (Jason 2026-10-16: 把 Accuphy Lab 露出来)
    parallax: { x: 0, y: 0 }, specs: liveSpecs, specKey,
    closeCam: window.location.search.includes('cam=boat'), wreckCam: /cam=wreck/.test(window.location.search), logoCam: /cam=logo/.test(window.location.search),
    rocksCam: import.meta.env.DEV && /cam=rocks/.test(window.location.search) ? (/cam=rocks:(\w+)/.exec(window.location.search) || [, 'pile'])[1] : null, // dev aid ?cam=rocks[:hump]
    workboatCam: import.meta.env.DEV && /cam=workboat/.test(window.location.search) ? +((/cam=workboat:(-?\d+)/.exec(window.location.search) || [, 30])[1]) : null, // dev aid ?cam=workboat[:deg] — the small wreck from that bearing
    fishCam: (/cam=fish:(\w+)/.exec(window.location.search) || [])[1],
    fishCamIndex: +((/cam=fish:\w+:(\d+)/.exec(window.location.search) || [])[1] || 0),
    rigCam: import.meta.env.DEV && /rigcam/.test(window.location.search), // ice: the hole kit up close
  })
  state.current.specs = liveSpecs
  state.current.ice = ICE
  state.current.specKey = specKey
  state.current.rangeM = effRangeFt * FT
  state.current.depthM = depthFt * FT
  state.current.panelDepthM = (combo ? comboDown : depthFt) * FT // Combo: the Down panel's own range (#189); the Forward panel's depth still follows the water (depthM)
  state.current.imperial = imperial
  state.current.colormap = colormap
  state.current.gain = gain
  state.current.contrast = contrast
  state.current.noise = noise
  state.current.mode = mode
  state.current.deviceId = deviceId
  state.current.view = view
  state.current.land = land
  state.current.fishMode = fishNew ? 'echo' : 'marks' // #170 (Jason 2026-10-26: 把第 3 轮这一版的鱼搬进正式页面); Panoramic always draws them from their bodies (SonarScreen)
  state.current.fishSize = fishBig ? 1.6 : 1
  state.current.hintOff = land && !lakeBig // sideways with the sonar full-screen: no drag caption over the sonar

  // AUTO depth: deeper at once (the bottom never drops off the screen), shallower only after 1.5 s
  // so the axis does not pump while the boat crosses uneven bottom
  useEffect(() => {
    if (!autoDepthOn) return
    let lowSince = 0, lowMax = 0
    const id = setInterval(() => {
      const s = state.current
      if (s.apex.y === 0) return // the boat is not placed yet (first frame still compiling)
      const want = autoDepthFt(s, device.maxDepthFt), cur = s.depthM / FT, now = performance.now()
      if (want > cur + 0.01) { lowSince = 0; setDepthFt(want) }
      else if (want < cur - 0.01) {
        if (!lowSince) { lowSince = now; lowMax = want } else lowMax = Math.max(lowMax, want)
        if (now - lowSince > 1500) { lowSince = 0; setDepthFt(lowMax) }
      } else lowSince = 0
    }, 200)
    return () => clearInterval(id)
  }, [autoDepthOn, device, imperial])


  // embed bridge (#134): the store page learns which view the visitor picked — on a real pick only (Home tile, panel
  // button, guide step), never for the default view on load (#139); `source` says where the pick came from
  const showView = (d, m, source) => { setDeviceId(d); setMode(m); labEvent('view', { view: m, product: PRODUCT[d] || PRODUCT.PLM, source }) }
  // every pick passes here, so nothing reaches Combo before subscribing (#191): the card opens and the view stays as it was
  const pickView = (d, m, source, name) => {
    if (isLocked(d, m) && !unlocked) { setUnlock({ d, m, source, name: name || t(LOCKED_NAME[m]) }); return false }
    showView(d, m, source); return true
  }
  const goIce = (view) => { window.location.href = iceUrl(view) }
  const onIce = (view, name) => { if (unlocked) goIce(view); else setUnlock({ d: 'PLM', m: view, ice: true, source: 'home', name }) }
  const onUnlocked = () => {
    const { d, m, ice, source } = unlock
    setUnlocked(true); setUnlock(null)
    if (ice) { goIce(m); return }
    showView(d, m, source)
    if (source === 'home') { setHome(false); setStarted(true) }
  }

  // the app's buttons are display-only: only a short hint (Jason 2026-10-24: no sign-up gate on them)
  const onLocked = () => {
    setToast(true); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(false), 2400)
  }

  const onMove = (e) => {
    const s = state.current
    s.parallax.x = (e.clientX / window.innerWidth - 0.5) * 2
    s.parallax.y = (e.clientY / window.innerHeight - 0.5) * 2
  }
  const fmt = (ft) => (imperial ? `${Math.round(ft)} ft` : `${(ft * FT).toFixed(1)} m`)
  // phones: the range is changed with the app's own −/+ on the phone screen (Jason 2026-10-03), in steps
  const [paused, setPaused] = useState(false)
  const stepDepth = (dir) => { // the app's depth-range −/+ : manual steps, AUTO off
    const steps = (imperial ? DEPTH_STEPS_FT : DEPTH_STEPS_M.map((m) => m / FT)).filter((v) => v <= device.maxDepthFt + 0.01)
    const i = dir > 0 ? steps.findIndex((v) => v > depthFt + 0.5) : steps.findLastIndex((v) => v < depthFt - 0.5)
    if (i >= 0) { setAutoDepth(false); setDepthFt(steps[i]) }
  }
  const appCtl = phone && !ICE ? { paused, onPause: () => setPaused((v) => !v), onGain: (d) => setGain((g) => Math.min(1, Math.max(0.3, +(g + d * 0.01).toFixed(2)))), onDepth: stepDepth } : undefined // no image settings on the phone: the ⋯ button is greyed (Jason 2026-10-17/18)
  const stepRange = (dir) => {
    const steps = RANGE_STEPS_FT.filter((v) => v <= maxFt)
    const i = dir > 0 ? steps.findIndex((v) => v > rangeFt + 0.5) : steps.findLastIndex((v) => v < rangeFt - 0.5)
    if (i >= 0) setRangeFt(steps[i])
  }
  // Combo on phones (#189): each panel's own −/+, the Forward panel on Live Forward's range steps, the Down panel on Live
  // Down's depth steps (in the visitor's unit)
  const stepComboFwd = (dir) => {
    const steps = RANGE_STEPS_FT.filter((v) => v <= maxFt)
    const i = dir > 0 ? steps.findIndex((v) => v > comboFwd + 0.5) : steps.findLastIndex((v) => v < comboFwd - 0.5)
    if (i >= 0) setComboFwdFt(steps[i])
  }
  const stepComboDown = (dir) => {
    const steps = (imperial ? DEPTH_STEPS_FT : DEPTH_STEPS_M.map((m) => m / FT)).filter((v) => v <= device.maxDepthFt + 0.01)
    const i = dir > 0 ? steps.findIndex((v) => v > comboDown + 0.5) : steps.findLastIndex((v) => v < comboDown - 0.5)
    if (i >= 0) setComboDownFt(steps[i])
  }

  // the three-step guide (docs/3d-beam-reference.md §3): each step is a preset
  const [step, setStep] = useState(0)
  const STEPS = ICE ? [
    { n: 1, title: t('i1_title'), text: t('i1_text'), device: 'PLM', mode: 'liveice', range: 60, boat: ICE_START },
    { n: 2, title: t('i2_title'), text: t('i2_text'), device: 'PLM', mode: 'liveice', range: 60, boat: [-8, -10] },
    { n: 3, title: t('i3_title'), text: t('i3_text'), device: 'PLM', mode: 'forward', range: 60, boat: [16, 11] },
  ] : [
    { n: 1, title: t('s1_title', { device: device.name }), text: t('s1_text'), device: 'PL', mode: 'down', range: 80, boat: [-20, 6] },
    { n: 2, title: t('s2_title'), text: t('s2_text', { device: device.name }), device: 'PL', mode: 'forward', range: 60, boat: [16, 11] }, // standing timber + bass 8–15 m ahead on the 7 m flat
    { n: 3, title: t('s3_title'), text: t('s3_text'), device: 'PL', mode: 'panoramic', range: 70, boat: [-50, 8] }, // on the 5 m shelf, scanning toward the drop-off: the flat fan paints the bottom
  ].map((st) => (ONLY ? { ...st, device: ONLY, ...(st.mode === 'panoramic' ? (unlocked ? { mode: 'combo', text: t('s3_text_combo') } : { mode: 'forward', text: t('s3_text_locked') }) : {}) } : st)) // before subscribing step 3 stays out of Combo (#191)
  const goStep = (i) => {
    const st = STEPS[i]; setStep(i); pickView(st.device, st.mode, 'step'); setRangeFt(st.range)
    state.current.target.x = st.boat[0]; state.current.target.z = st.boat[1]
    state.current.frameX = st.boat[0] + 14 // phones: re-centre the zoomed-out view on the preset (boat left, beam right)
  }

  return (
    <>
    <main ref={mainRef} inert={!!unlock} aria-hidden={unlock ? true : undefined} className="font-brand fixed inset-x-0 top-0 select-none overflow-hidden bg-[#9cc1cf] text-white" style={{ height: 'var(--lab-h, 100%)', ...(ICE ? { background: iceParams().T.bg } : null) }} onPointerMove={onMove}>
      <div className="absolute inset-0 touch-none">
        {mount3d && !glLost && <LakeScene key={glKey} state={state} sonarRect={sonarRect} paused={paused} scene={scene} />}
      </div>
      {ICE && /[?&]from=lake\b/.test(window.location.search) && <button type="button" className="ac-back-lake" onClick={() => window.history.back()}>← {t('back_to_lake')}</button>}
      {/* the store badges on phones (Jason 2026-10-28: store style, decision #185): top left over the lake, 40 px (Apple's minimum) */}
      {phone && !land && started && !home && <AppBadges height={40} className="absolute z-20 items-end" style={{ right: 12, top: 'calc(12px + env(safe-area-inset-top))' }} />}
      {glLost && (
        <div role="alert" className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(3,18,26,0.55)' }}>
          <button type="button" className="ac-card px-5 py-4 text-left" onClick={() => window.location.reload()}>
            <div className="text-[15px] font-semibold">{t('gl_lost_title')}</div>
            <div className="ac-body mt-1 text-[12.5px]">{t('gl_lost_text')}</div>
          </button>
        </div>
      )}

      {/* ---- control panel — Apple-style frosted glass over the lake (Jason 2026-09-24) ---- */}
      <motion.div ref={(el) => { panelRef.current = el; state.current.panelEl = el }} data-hint-avoid initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="ac-panel pointer-events-auto absolute flex flex-col gap-3 max-sm:hidden sm:left-4 sm:top-14 sm:w-[400px] sm:p-4" style={land ? { display: 'none' } : undefined}>
        <div className="flex items-center gap-2.5 px-1 pt-0.5">
          <img src="/brand/logo/White Accuphy Logo.png" alt="Accuphy" className="h-[21px] w-auto" draggable={false} />
          <span className="ac-lab-title">Lab</span>
        </div>
        <div className="ac-divider" />
        <Row label={t('device')}>
          <div className="ac-seg">{SHOWN_DEVICES.map((d) => <button key={d.id} className={`ac-btn ${deviceId === d.id ? 'is-active' : ''}`} onClick={() => pickView(d.id, isLocked(d.id, mode) && !unlocked ? 'down' : mode, 'panel')}>{d.name}</button>)}</div>
        </Row>
        <div>
          <span className="ac-label">{t('view')}</span>
          <div className={`ac-views is-${modes.length}`}>{modes.map((m) => {
            const locked = isLocked(deviceId, m) && !unlocked, active = mode === m
            return (
              <button key={m} type="button" className={`ac-view ${active ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`} aria-pressed={active} aria-label={locked ? t('unlock_locked', { view: t(LOCKED_NAME[m]) }) : undefined} onClick={() => pickView(deviceId, m, 'panel')}>
                {locked && <span className="ac-view-lock"><LockIcon size={10} /></span>}
                <ViewIcon view={m} deg={device.beamDeg} active={active} live={!phone} />
                <span className="ac-view-name">{t('mode_' + m)}</span>
              </button>
            )
          })}</div>
        </div>
        {ICE && (
          <Row label={t('camera')}>
            <div className="ac-seg">{VIEWS.map((v) => <button key={v} className={`ac-btn ${view === v ? 'is-active' : ''}`} onClick={() => setView(v)}>{{ top: t('cam_top'), under: t('cam_under'), section: t('cam_section') }[v]}</button>)}</div>
          </Row>
        )}
        {combo ? (<>
          {/* PLM Combo (#189): each panel's range on its own, like the app's Live Forward and Live Down settings */}
          <Row label={t('range_fwd')} wide>
            <input type="range" min={20} max={maxFt} step={5} value={comboFwd} onChange={(e) => setComboFwdFt(+e.target.value)} className="ac-range w-28" style={{ '--fill': `${((comboFwd - 20) / (maxFt - 20)) * 100}%` }} />
            <button className="ac-value" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(comboFwd)}</button>
          </Row>
          <Row label={t('range_down')} wide>
            <input type="range" min={20} max={device.maxDepthFt} step={5} value={Math.round(comboDown)} onChange={(e) => setComboDownFt(+e.target.value)} className="ac-range w-28" style={{ '--fill': `${((comboDown - 20) / (device.maxDepthFt - 20)) * 100}%` }} />
            <button className="ac-value" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(comboDown)}</button>
          </Row>
        </>) : (
          <Row label={t('range')}>
            {/* Down: the range is the AUTO depth range, so the slider only shows it */}
            <input type="range" min={20} max={maxFt} step={5} value={effRangeFt} disabled={downLike} title={downLike ? 'AUTO: follows the water depth' : undefined} onChange={(e) => setRangeFt(+e.target.value)} className="ac-range w-36" style={{ '--fill': `${((effRangeFt - 20) / (maxFt - 20)) * 100}%`, opacity: downLike ? 0.45 : 1 }} />
            <button className="ac-value" onClick={() => setImperial((v) => !v)} title="ft / m">{fmt(effRangeFt)}</button>
            {downLike && <span className="ac-soft text-[11px]">{t('auto_follows')}</span>} {/* no "max …" hint (website review 2026-10-26: specs say 230 ft, the app's steps go to 240) */}
          </Row>
        )}
        {DEV_TOOLS && deviceId === 'PL' && mode === 'forward' && (
          <Row label="Depth">
            <input type="range" min={20} max={device.maxDepthFt} step={5} value={Math.round(depthFt)} onChange={(e) => { setAutoDepth(false); setDepthFt(+e.target.value) }} className="ac-range w-36" style={{ '--fill': `${((depthFt - 20) / (device.maxDepthFt - 20)) * 100}%` }} />
            <span className="ac-value">{fmt(depthFt)}</span>
            <button className={`ac-btn ${autoDepth ? 'is-active' : ''}`} onClick={() => setAutoDepth((v) => !v)}>auto</button>
          </Row>
        )}
        {DEV_TOOLS && (<>
        <Row label="Screen">
          <select value={colormap} onChange={(e) => setColormap(e.target.value)} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11.5px] text-white/90">
            {COLORMAP_NAMES.map((n) => <option key={n} value={n} className="bg-[#0f1216]">{n}</option>)}
          </select>
          <span className="ac-label">gain</span>
          <input type="range" min={0.3} max={1} step={0.05} value={gain} onChange={(e) => setGain(+e.target.value)} className="ac-range w-20" style={{ '--fill': `${((gain - 0.3) / 0.7) * 100}%` }} />
          <span className="ac-value text-[13px]">{Math.round(gain * 100)}%</span>
        </Row>
        <Row label="Tune">
          <span className="ac-label">contrast</span>
          <input type="range" min={0} max={1} step={0.05} value={contrast} onChange={(e) => setContrast(+e.target.value)} className="ac-range w-20" style={{ '--fill': `${contrast * 100}%` }} />
          <span className="ac-value text-[13px]">{Math.round(contrast * 100)}%</span>
          <span className="ac-label">noise</span>
          <input type="range" min={0} max={1} step={0.05} value={noise} onChange={(e) => setNoise(+e.target.value)} className="ac-range w-20" style={{ '--fill': `${noise * 100}%` }} />
          <span className="ac-value text-[13px]">{Math.round(noise * 100)}%</span>
        </Row>
        </>)}
        <div className="ac-soft hidden px-1 text-[11.5px] leading-snug sm:block">
          {t(ICE ? 'desc_ice' : 'desc_lake', { device: device.name, beam: `${device.beamDeg}° × ${ICE ? 20 : device.thickDeg}°` })} {/* text only: specs say 39° × 20° for the Mini; the engine's 18° stays (Jason 2026-09-23) */}
        </div>
        <ShopButton deviceId={deviceId} placement="panel" wide />
        <AppBadges height={40} className="pt-2" />
        <div className="pt-1"><ShareButton thumb={viewThumb(deviceId, mode)} /></div>
      </motion.div>
      {/* B: a glass strip top-right (desktop: under the step cards' row; phones: under the safe area) with share + badges */}

      {/* ---- the cue caption, shown until the first drag / tap (position set by the render loop). The ice page: under the
           reticle on the ice (IceCamp.jsx, #123); the lake: above the water reticle round the boat (Scene.jsx Boat, #132).
           Plain text, no glass pill, no dot (Jason 2026-10-23: 看着太 AI 了) ---- */}
      <div ref={(el) => { state.current.hintEl = el }} className="pointer-events-none absolute left-0 top-0 whitespace-nowrap" style={{ opacity: 0, transition: 'opacity .6s', color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 500, letterSpacing: '0.01em', textShadow: '0 1px 2px rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.45)' }}>{t(ICE ? 'hint_ice' : 'hint_boat')}</div>

      {/* ---- iPhone Pro Max, landscape, turned slightly in 3D (same pose as the GL picture).
           Proportions from the 15/16 Pro Max: body 2.08:1, corner radius ≈ 14 % of the short side,
           thin uniform bezel, Dynamic Island on the left in landscape, volume/action buttons on top,
           power button below; brushed titanium band; faint glass reflection over the display. ---- */}
      <div ref={(el) => { sonarRect.current.frame = el }} data-hint-avoid className={land ? 'pointer-events-none absolute inset-0' : `pointer-events-none absolute inset-x-3 bottom-[calc(14px+env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-[28px] sm:bottom-[24px] ${BIG_PHONE ? 'sm:w-[min(88vw,1400px)]' : 'sm:w-[min(42vw,clamp(440px,34vw,560px),83.2vh)]'}`} style={land ? undefined : { aspectRatio: '2.08 / 1' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', transform: land ? undefined : `perspective(${phonePose().perspective}px) rotateY(${phonePose().rotY}deg) rotateX(${phonePose().rotX}deg)` }}>
          {!land && (<>
          {/* side buttons (on the top edge in landscape: action + volume; power on the bottom edge) */}
          <div className="ph-btn" style={{ left: '14%', top: '-1.2%', width: '2.2%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '19.5%', top: '-1.2%', width: '4.6%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '25.5%', top: '-1.2%', width: '4.6%', height: '1.6%' }} />
          <div className="ph-btn" style={{ left: '22%', bottom: '-1.2%', width: '7%', height: '1.6%' }} />
          {/* titanium band (ring), inner black bezel (ring), display hole */}
          <div className="ph-band" style={{ ...ring('1.35%'), borderRadius: '6.6% / 13.8%', boxShadow: '16px 26px 44px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 0 0 2px rgba(0,0,0,0.12)' }} />
          <div style={{ ...ring('1.25%'), inset: '1.35%', borderRadius: '6.1% / 12.7%', background: '#040404' }} />
          </>)}
          {/* the display. Sideways phones (#140): the whole screen inside the safe areas (no drawn phone — the visitor's
              phone is the device), or, with the lake enlarged, a small sonar box top-right that taps back */}
          <div ref={(el) => { sonarRect.current.el = el }} style={land ? (lakeBig ? { ...LAND_SMALL, height: `${(34 / landAspect).toFixed(2)}vw` } : LAND_FULL) : { position: 'absolute', inset: '2.6%', borderRadius: '5.4% / 11.3%', containerType: 'size', overflow: 'hidden' }}>
            <SonarChrome layout={layout} deviceId={deviceId} mode={mode} rangeFt={effRangeFt} depthFt={depthFt} imperial={imperial} gain={gain} autoDepth={autoDepth} autoRange={downLike} onRange={phone ? stepRange : undefined} combo={combo ? { fwdFt: comboFwd, downFt: comboDown, onFwd: phone ? stepComboFwd : undefined, onDown: phone ? stepComboDown : undefined, fwdLabel: t('combo_fwd'), downLabel: t('combo_down') } : undefined} onHome={phone ? () => { setHome(true); setLakeBig(false) } : undefined} phone={phone && !land} noMark={land && !lakeBig && !home && started} waterTempC={ICE ? 1.6 : 21.8} app={appCtl} onLocked={phone ? undefined : onLocked} depthRef={(el) => { state.current.depthEl = el }} />
            {phone && home && <AppHome ice={ICE} devices={SHOWN_DEVICES} deviceId={started ? deviceId : null} mode={started ? mode : null} locked={!unlocked} onIce={onIce} onPick={(d, m, name) => { if (pickView(d, m, 'home', name)) { setHome(false); setStarted(true) } }} />}
            {/* sideways: the lake inset (drawn by SonarScreen.jsx into this button's rectangle); a tap swaps lake and sonar.
                Top-right, clear of the rulers and the depth-range −/+; Combo keeps its readout top-right, so there top-left */}
            {land && !lakeBig && !home && started && (
              <button ref={(el) => { sonarRect.current.lake = el }} type="button" className="ph-lake" aria-label="Show the lake" onPointerDown={(e) => e.stopPropagation()} onClick={() => setLakeBig(true)}
                style={{ top: '5.5cqh', width: '21%', ...(layout.split ? { left: '4.5%' } : { right: '4.5%' }) }}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}
            {land && lakeBig && <button type="button" className="ph-lake-back" aria-label="Show the sonar full-screen" onPointerDown={(e) => e.stopPropagation()} onClick={() => setLakeBig(false)} />}
            {!land && <div className="ph-glass" />}
          </div>
          {!land && (<>
          {/* antenna lines in the titanium band (two per long edge, like the Pro Max) */}
          {[['16%', 'top'], ['84%', 'top'], ['16%', 'bottom'], ['84%', 'bottom']].map(([l, side]) => (
            <div key={l + side} style={{ position: 'absolute', left: l, [side]: 0, width: '0.35%', height: '1.35%', background: 'rgba(0,0,0,0.55)', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.15)' }} />
          ))}
          {/* Dynamic Island: vertical pill on the left in landscape */}
          <div style={{ position: 'absolute', left: '4.1%', top: '50%', width: '2.4%', height: '20%', transform: 'translateY(-50%)', borderRadius: 999, background: '#000', boxShadow: '0 0 0 1px #0a0a0a' }} />
          </>)}
        </div>
        {/* phones: the View capsule sits on the phone frame's top edge (Jason 2026-10-03) — the big panel is gone */}
        {/* Shop button on phones: docked on the frame's top edge (the dock also feeds the camera's view offset) */}
        {phone && !land && started && !home && (
          <div ref={(el) => { sonarRect.current.dock = el }} className="pointer-events-auto absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 items-center gap-2">
            <ShopButton deviceId={deviceId} placement="frame-top" />
            <ShareButton compact thumb={viewThumb(deviceId, mode)} />
          </div>
        )}
        {/* after sign-up the app buttons stay display-only: a short hint above the phone instead of the gate */}
        <div role="status" aria-live="polite" className={`ac-hint absolute bottom-full right-0 mb-3 max-sm:mb-16 whitespace-nowrap px-3.5 py-2 text-[12px] font-medium transition-opacity duration-300 ${toast ? 'opacity-100' : 'opacity-0'}`}>
          {t(phone ? 'toast_phone' : 'toast_desktop')}
        </div>
      </div>

      {/* ---- phones: device switch, top right (the panel is hidden there) ---- */}
      {false && phone && !ONLY && started && (
        <div className="pointer-events-auto absolute right-3 top-4">
          <div className="ac-seg">{Object.values(DEVICES).map((d) => <button key={d.id} className={`ac-btn ${deviceId === d.id ? 'is-active' : ''}`} onClick={() => setDeviceId(d.id)}>{d.name}</button>)}</div>
        </div>
      )}

      {/* ---- the fish-echo test page's switches (#153; dev only since #170): top centre on phones, bottom left on wider screens ---- */}
      {lab === 'fish' && import.meta.env.DEV && (
        <div className="pointer-events-auto absolute left-1/2 top-3 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 sm:bottom-6 sm:left-4 sm:top-auto sm:translate-x-0 sm:items-start" style={{ fontFamily: 'system-ui, sans-serif' }}>
          <div className="ac-seg">
            <button className={`ac-btn ${!fishNew ? 'is-active' : ''}`} onClick={() => setFishNew(false)}>鱼：现在</button>
            <button className={`ac-btn ${fishNew ? 'is-active' : ''}`} onClick={() => setFishNew(true)}>鱼：新画法</button>
          </div>
          {fishNew && (
            <div className="ac-seg">
              <button className={`ac-btn ${!fishBig ? 'is-active' : ''}`} onClick={() => setFishBig(false)}>真实大小</button>
              <button className={`ac-btn ${fishBig ? 'is-active' : ''}`} onClick={() => setFishBig(true)}>放大 1.6 倍</button>
            </div>
          )}
        </div>
      )}

      {/* ---- guide strip ---- */}
      <div data-hint-avoid className={ICE ? 'pointer-events-auto absolute hidden flex-col gap-2 md:flex' : 'pointer-events-auto absolute right-[28px] top-4 hidden w-[min(620px,44vw)] items-stretch gap-2.5 md:flex'} style={ICE ? { left: 16, top: cardsTop, width: 400 } : land ? { display: 'none' } : undefined}>
        {STEPS.map((st, i) => (
          <button key={st.n} onClick={() => goStep(i)} className={`ac-card flex-1 text-left ${ICE ? 'px-3.5 py-2.5' : 'px-3.5 py-3'} ${step === i ? 'is-active' : ''} ${GLASS ? 'is-glass' : ''}`}>
            {GLASS && <GlassLayer kind={GLASS} />}
            <div className="flex items-center gap-2"><span className="ac-num">0{st.n}</span><span className="ac-label">{t('step')}</span></div>
            <div className="mt-1.5 text-[13.5px] font-semibold leading-tight">{st.title}</div>
            {step === i && <div className="ac-body mt-1.5 text-[11.5px] leading-snug">{st.text}</div>}
          </button>
        ))}
      </div>
      {import.meta.env.DEV && window.location.search.includes('debug') && (
        <pre ref={(el) => { state.current.debugEl = el }} className="pointer-events-none absolute left-2 top-1/2 rounded bg-black/60 p-1 text-[10px] text-lime-300" />
      )}
    </main>
    <AnimatePresence>{unlock && <UnlockCard key="unlock" name={unlock.name} img={VIEW_IMG[unlock.m]} product={PRODUCT[unlock.d] || PRODUCT.PLM} view={unlock.m} onClose={() => setUnlock(null)} onDone={onUnlocked} />}</AnimatePresence>
    </>
  )
}

// sideways phones (#140): the display fills the screen inside the safe areas (pointer events on, so a drag on the sonar
// never moves the boat hidden behind it); with the lake enlarged it is a small box top-right (its height from the aspect)
const LAND_FULL = { position: 'absolute', top: 'env(safe-area-inset-top)', right: 'env(safe-area-inset-right)', bottom: 'env(safe-area-inset-bottom)', left: 'env(safe-area-inset-left)', containerType: 'size', overflow: 'hidden', pointerEvents: 'auto' }
const LAND_SMALL = { position: 'absolute', top: 'calc(env(safe-area-inset-top) + 10px)', right: 'calc(env(safe-area-inset-right) + 10px)', width: '34vw', containerType: 'size', overflow: 'hidden', pointerEvents: 'auto', borderRadius: 4, boxShadow: '0 0 0 1px rgba(255,255,255,0.6), 0 8px 24px rgba(0,0,0,0.45)' }
// a filled box with a rectangular hole the size of its content box (CSS mask-composite)
function ring(pad) {
  return { position: 'absolute', inset: 0, padding: pad, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', mask: 'linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)' }
}
function Row({ label, children, wide = false }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={`ac-label ${wide ? 'w-24' : 'w-14'}`}>{label}</span>
      {children}
    </div>
  )
}
function Btn({ active, children, ...rest }) {
  return (
    <button {...rest} className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${active ? 'bg-[#0d8fdb] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)]' : 'bg-white/8 text-white/85 hover:bg-white/15'}`}>
      {children}
    </button>
  )
}
