// The Panoramic test page (decision #171; Jason 2026-10-26: "我发现我们 panoramic view 的在手机上面的显示效果非常的糟糕 …
// 我觉得是画面逻辑的根源问题", then "全景用方案 A：重做成声音的图，先做测试页我手机上对比"). Panoramic drawn as a sound picture —
// the vertical views' pipeline with the fan laid flat: for every bearing and range, what the beam's thickness hits, the
// arcGrain texture and the #153 fish — instead of the plan-view photograph of the 3D models (docs/2026-10-26-panoramic-rethink.md).
// The code lives in 2026-09-23-sonar-lake-3d behind lab="pano"; the lake and ice pages are unchanged. A switch on the page
// (全景：现在 / 全景：声音的图) compares the two; ?pano=old opens on today's. Local only until Jason says.
import SonarLake3D from '../2026-09-23-sonar-lake-3d'

export const meta = {
  title: 'Sonar lake — Panoramic as a sound picture (test)',
  description: 'Test version: Panoramic drawn from what the flat beam hears per bearing and range, like Forward, instead of a photograph from above. A switch compares it with today’s. Local only.',
}

export default function SonarPanoEcho() { return <SonarLake3D lab="pano" /> }
