// The ice-fishing Lab page (Jason 2026-10-16: 做一个冰钓的版本): the sonar lake experiment with scene="ice" — the same
// lake in mid-winter, the PingLive Mini in an auger hole, hole-hopping by tapping the ice, the app's Ice Fishing views.
// All the code lives in 2026-09-23-sonar-lake-3d (iceScene.js, iceSheet.js, iceProps.js, IceCamp.jsx, snow.js, iceSky.js);
// this folder only gives the page its own gallery card and URL. Dev aids: ?time=dusk|day|night, ?look=snow|mixed|glass.
import SonarLake3D from '../2026-09-23-sonar-lake-3d'

export const meta = {
  title: 'Sonar ice 3D — ice fishing',
  description: 'The same lake frozen over: the PingLive Mini in an auger hole, the flasher and Live Ice views, tap the ice to drill a new hole. Local only (not published).',
}

export default function SonarIce3D() { return <SonarLake3D scene="ice" /> }
