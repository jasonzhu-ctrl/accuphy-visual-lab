// Prototype of the three-stop entry tour (Jason 2026-11-01 in Lab HQ: 动，先做小样 — "进入到这个页面以后，好像先要教学一样 …
// 很大的字 … fading effect … 引导它去点击 … 第一个 fade out，第二个 fade in"). A wrapper page like the ice page (#94): the
// sonar lake as it is, with the tour laid over it. The default page (2026-09-23-sonar-lake-3d) is not changed; the tour
// hooks into what the page already emits (the `accuphy-lab` window events `ready`, `view`) and its panel's buttons.
// ?tour=pl runs the PingLive script (Down → Forward → Panoramic); otherwise the Mini's (Combo → Forward → Down).
import { useEffect, useState } from 'react'
import SonarLake3D from '../2026-09-23-sonar-lake-3d'
import TourProto from './TourProto'

export const meta = {
  title: 'Entry tour — prototype',
  description: 'The sonar lake as the lock-free base (no store buttons, Combo open) with a three-stop guided start: big titles that fade in and out, one action per stop, the panel locked until the tour is done. ?tour=pl for the PingLive script.',
}

const variant = /[?&]tour=pl\b/.test(window.location.search) ? 'pl' : 'mini'
// The prototype shows the lock-free base (Jason 11-01: 基础版先行): Combo open from the start through the page's own
// lab_unlock=sub switch (signup.js), and the store pieces hidden by this page's CSS (tour.css) — nothing in the page itself
// changes. Done inside the component, so the gallery's eager import of this folder touches no other page.
const unlockBase = () => { try { const u = new URL(window.location.href); if (u.searchParams.get('lab_unlock') !== 'sub') { u.searchParams.set('lab_unlock', 'sub'); window.history.replaceState(null, '', u) } } catch { /* no history API: the card would show for Combo */ } return true }

export default function TourProtoPage() {
  useState(unlockBase) // before the lake reads isSignedUp() on its first render
  useEffect(() => { document.body.classList.add('lab-tour-page'); return () => document.body.classList.remove('lab-tour-page') }, [])
  return (<>
    <SonarLake3D />
    <TourProto variant={variant} />
  </>)
}
