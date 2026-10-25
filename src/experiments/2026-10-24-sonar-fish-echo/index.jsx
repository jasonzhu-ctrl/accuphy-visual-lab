// The fish-echo test page (decision #153; Jason 2026-10-24: 弄到本地来开个版本，然后本地先尝试吧): the sonar lake with the fish
// drawn as the transducer sees them — the 3D bodies lit from the apex like a camera, only the surfaces facing the sound
// returning (far: a sliver of back and flank, smeared by the beam into an arc; near and under the boat: the whole body) —
// and a speckle that drifts from one ping into the next instead of jumping. The code lives in 2026-09-23-sonar-lake-3d
// behind lab="fish"; the lake and ice pages are unchanged. On this page: ?fish=marks shows today's fish marks (A/B),
// ?fishsize=1.6 draws the sonar fish 1.6× larger. Vertical views only (Panoramic keeps the marks). Local only, not published.
import SonarLake3D from '../2026-09-23-sonar-lake-3d'

export const meta = {
  title: 'Sonar lake — fish echo test',
  description: 'Test version: fish drawn from their 3D bodies as the transducer sees them, smooth from ping to ping. ?fish=marks for the current look, ?fishsize=1.6 for bigger fish. Local only (not published).',
}

export default function SonarFishEcho() { return <SonarLake3D lab="fish" /> }
