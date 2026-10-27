# Ad captions as numbers (draft, 2026-10-26)

Jason 2026-10-26: no caption bubbles — a view name, one big animated number, a tracked small label, bullet points.
`overlay.html` is the typography and choreography of the Panoramic beat (`setT(seconds)`, `setFrame(i)`);
`render.mjs` screenshots it over the clip's frames at 1080×1920, 30 fps. Plan: `docs/2026-10-26-ad-draft-pinglive-plan.md`.

Rebuild the sample (frames from the clean clip, fonts copied beside the page, playwright-core available):
  ffmpeg -i reference/ads/2026-11-bf/boat-916-clean.mp4 -t 6.5 -vf fps=30 -q:v 2 <work>/frames/%04d.jpg
  node render.mjs http://localhost:<port serving work> <work>/out 195
  ffmpeg -framerate 30 -i <work>/out/%04d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 <out>.mp4
Sample: reference/ads/2026-11-bf/draft/pinglive-panoramic-sample.mp4 (not in git); still: docs/2026-10-26-ad-draft-pinglive-still.jpg.
