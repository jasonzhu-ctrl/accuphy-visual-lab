# Lite section plan — the sonar visualizer as a light section of accuphy.ca

**Status: planning only.** Jason, 2026-09-24: "我们只是做计划不要动哦". Nothing in this
document gets built until he says go. Claude reminds him of the open decision (§9)
when he is back on this project.

**The ask (Jason, 2026-09-24):** "现在这个项目基本都是3D的 你学习了非常多的东西 我们现在重新利用
你学习了解到的 重新思考最早的事如何坐在一个网页的section里 是不是更加轻量化一点比较好 包括网页
加载速度这些都很重要 他应该是一个一眼明了的东西 直接有互动 不要那么多选项的" — take everything
learned while building the 3D Lab and rethink the original idea: the visualizer as a
light section inside a web page. Fast to load, understood at a glance, interactive at
once, few options.

## 1. Where we are

The 3D Lab (`src/experiments/2026-09-23-sonar-lake-3d/`) grew into a full-screen
landing experience: a 3D lake with ~300 fish of 8 species, timber, two wrecks, the
ACCUPHY monument, beam curtains, an iPhone inset with the app's chrome, a glass control
panel, a three-step guide and a sign-up gate. It is the right thing for the dedicated
"Accuphy Lab" page, on desktop and — along the principles of decision #47 — on
phones. Measured on 2026-09-24 (memory note
`sonar-page-real-device-perf`, backlog "Mobile + Meta ads readiness"), it is the wrong
shape for a section of a product page:

| | 3D Lab today | What a page section needs |
|---|---|---|
| First-visit download | ~976 KB (JS 417 KB gz, fonts 430 KB, logo PNG 144 KB) | under 100 KB |
| Time to the first picture | 2.8 s on 4G, 4.4 s on a slow connection, then a 1.8 s freeze | something visible on the first paint, alive within 1 s |
| Cheap phone (V10, Mali-G57) | 10–24 fps, GPU-bound | 50+ fps |
| Controls | Device, View, Range + 3 guide cards + phone-inset buttons that open a gate | one or two |
| Touch | the whole page is a drag surface (`touch-none`) | vertical swipes must still scroll the page |
| Fixed cost before our own code | three.js core 288 KB gz + react-dom 112 KB + framer-motion 66 KB (measured in `node_modules`) | none |

## 2. The idea in one sentence

**The original brief (`docs/sonar-beam-visualizer-brief.md`), built with what we know
now:** a side-view lake; the boat follows your finger or mouse along the surface;
inside the beam the lake turns into the sonar picture. The fish and timber you see
outside the beam become the amber marks inside it — the same objects, in place, at the
same scale. *What you see is what the sonar sees.*

Why the side view is the right form now, not a compromise:

- **Down and Forward views are vertical slices** (the photograph model,
  `docs/sonar-style.md` §7). In a side view the beam plane *is* the screen plane, so
  the sonar picture can be drawn inside the fan, 1:1 in metres, and nothing needs
  explaining. The 3D Lab needed the phone inset because its curtain is seen at an
  angle; the section needs no inset because the fan *is* the screen. (The real app
  stretches its two axes independently, §6.1; the section draws in place. The section
  answers *what* the sonar sees; the full Lab shows *how the phone frames it*.)
- **The look is already known.** Every rule the inset follows was measured on the real
  app and confirmed by Jason: palette, tone curve, bottom band, fish dashes, shadows,
  near-field rays, noise floor. All of them are per-pixel rules in (angle, range) —
  nothing about them is 3D — so they move into one 2D shader unchanged (§4).
- **The beam difference becomes obvious.** In a side view PingLive's 135° fan spans
  the whole scene (it runs off both sides, exactly as the app's Down view does at
  1:1) and the Mini's 39° cone is a narrow slice; switching the device morphs one into
  the other. The 3D curtain never showed this as clearly.
- **It fits a scrolling page.** The boat moves only along the surface, so a horizontal
  drag steers it and a vertical swipe still scrolls the page. No scroll trap, no
  rotate wall, works inside Instagram's in-app browser.

## 3. What the visitor sees and does (one glance, one gesture)

```
┌────────────────────────────────────────────────────────────────┐
│  See what PingLive sees.                       (headline, HTML) │
│ ░░░░░░░░░░ sky / far shore silhouette ░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ~~~~~~~~~~~~~~~~~~~~~~~~~ ⛵ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │
│   dim teal water         ╱  ╲   inside the fan: black water +   │
│   fish silhouettes      ╱amber╲ amber sonar picture — the same  │
│   timber, a wreck      ╱ marks ╲ fish, timber and bottom        │
│ ▁▂▃ bottom ▃▂▁▂▃▄▅▆▇▇▆▅▄▃▂▁▂▃▄▅▆▇▇▇▆▅▄▃▂▁▁▂▃▄▅▆▇███████▇▆▅▄▃▂▁ │
├────────────────────────────────────────────────────────────────┤
│   [ Down ]  [ Forward ]           PingLive ◉  ○ PingLive Mini   │
│   Forward View looks ahead of the boat. Drag the boat.          │
└────────────────────────────────────────────────────────────────┘
```

- **Layout:** full-width section, about 16:9 on desktop and 4:3 on phones (the look
  itself is specified in §3b). Roughly a
  fifth sky (a shoreline silhouette, no art to load), the rest water: bottom, standing
  timber, rocks, a small wreck and a few schools of fish swimming fixed loops.
  Everything is drawn procedurally; nothing is downloaded except the poster (§6).
  Desktop shows ~24 m of water; phones show ~15 m so a bass is still a visible shape.
  A fish's silhouette and its sonar mark share one display scale, so they always
  match (exact numbers are settled in the prototype).
- **The boat** sits on the surface at the pointer. Desktop: it follows the mouse the
  moment the pointer enters the section — no click, as in the Phase-2 prototype.
  Phone: drag left/right, or tap on the water and the boat glides there. Before the
  first touch the boat cruises slowly on its own, so the section is alive while the
  page scrolls past (off when the visitor prefers reduced motion).
- **The fan** hangs from the transducer with the exact geometry from `devices.js`:
  PL 135°, PLM 39° (drawn 43°), Forward = leading edge on the surface, Combo = both
  fans. Switching view or device morphs the fan over ~0.4 s, so the difference is
  seen rather than read. A small distance label sits on the fan's far edge (`80 ft`);
  it is a readout, not a control.
- **Inside the fan** is the sonar picture at the approved look (garmin_amber, gain 57 /
  contrast 40 / noise 30): black water with a trace of floor, a thick hot-edged bottom
  band with its tail, bright structure faces with black acoustic shadows behind them,
  fish as tangential dashes with a bright core toward the transducer that grow with
  range, the Mini Forward blind zone (nothing nearer than 1.26 × depth). Outside the
  fan the same scene stays dim and realistic. The mapping is literal: a bass swims
  into the fan and its dash appears where its body is.
- **Controls, exactly two:** a row of view pills (PL: Down · Forward; PLM: Down ·
  Forward · Combo) and a device toggle. 44 px targets. Nothing else: no range slider
  (range fixed per device), no colour map, gain or contrast (baked), no guide cards,
  no phone frame, no sign-up gate. On a product page the device can be preset by an
  attribute, so the toggle disappears and one row of pills is the whole UI.
- **Copy:** one headline and one caption that changes with the view (first drafts:
  "See what PingLive sees." / "Down View looks straight below the boat." / "Forward
  View looks ahead of the boat — cast at what you see." / "Combo shows both at
  once."). Plus a small link: "Open the full Accuphy Lab ↗".
- **Optional, Jason's call (§9):** when a fish enters the fan for the first time, a
  small tag next to its mark ("bass · 12 ft") for a second or two — the cheapest
  possible explanation of "this dash is that fish".

## 3b. The look: premium and technical (hard requirement)

Jason, 2026-09-24, on this plan: "视觉的高级感科技感非常非常重要!!!!!" — the premium,
high-tech look comes first. **Light never means plain.** The weight targets in §6 are
met by *computing* the picture, not by simplifying it: everything below is per-pixel
maths and CSS and costs no download. Where the 3D Lab spends bytes and GPU on
geometry, the section spends them on light.

**The guiding image (Jason, decision #54): a dark lakebed lit up.** Like a swinging lamp
in a black room (his reference: the HTML Light Demo, `docs/look-references.md`): the
beam is the only light, whatever it sweeps over is revealed, the rest stays dark, and
the light has physical weight — it lags, sways and settles when the boat is dragged.
Taste confirmed on the reference sheets: groups A (dark cinematic product pages) and
B (one light source revealing a dark world).

Jason's three rules (decision #55): the lake stays a realistic lake picture, half-dark
with a logic to its darkness; the cursor is a small but real image of the transducer;
wherever it goes, everything its beam can reach lights up. (This refines §3: "the
boat" becomes the device itself; the boat, if shown at all, is scenery.)

**Where the feel comes from**

1. **Light in the water** (mood decided: dark cinematic, decision #51). Lit from the
   surface: brightness falls with depth, slow
   light shafts drift through the water column, a caustic shimmer plays on the
   shallow bottom, the surface is a thin bright line with a specular glint, and a
   soft depth fog swallows the far bottom. A dusk palette — deep teal → navy → near
   black — so the amber sonar picture glows against it. This is the water of
   Garmin's LVS34 film and of Accuphy's own mode animations
   (`docs/3d-beam-reference.md`).
2. **The beam as a volume, not a triangle.** Translucent cyan fill with a fresnel-like
   edge glow and thin white edge lines (the measured Garmin look), brighter where it
   meets the bottom (the lit footprint), a faint ping pulse travelling out along the
   fan every ~0.8 s, and a second, fainter outline offset by the slab's thickness so
   the fan reads as the 20° slab it is (2.5D).
3. **Depth without a 3D engine.** Three or four parallax layers — far shore, deep
   water, the fan plane, drifting particles in front ("marine snow") — that shift by
   different amounts with the cursor and with the page scroll. The fan plane itself
   never moves, so the 1:1 "what you see is what the sonar sees" mapping holds.
4. **Materials, not clip-art.** Fish and timber are silhouettes lit from above with a
   rim highlight and depth fog, never flat cartoon shapes; the bottom is a soft,
   textured slope under the caustic light; the boat is a clean dark silhouette with
   one specular edge (or a real side-view cutout of the device, if Jason supplies
   one — still owed, `docs/backlog.md`).
5. **The sonar picture, faithful and glowing.** garmin_amber, the filament texture,
   the hot bottom edge, dashes with cores — plus a cheap bloom on the hot pixels (a
   quarter-resolution blur pass) so marks glow like a real display. The app's own
   readouts, not invented ones (decision #18): the big white depth number at the
   transducer and the thin italic depth numbers along the fan's edge.
6. **Motion.** 60 fps; the boat eases and leaves a wake ripple; the fan morphs with
   easing on every device or view change; fish swim with natural body cycles; the
   readout numbers tick; nothing snaps. Reduced-motion visitors get a still boat.
7. **UI restraint.** The approved Apple-style frosted glass (decision #37) for the
   pills and the readout: gradient hairline edge, one accent (brand blue `#028cdf`),
   sentence-case labels, small uppercase tracked captions for the instrument
   readouts. Brand typography is inherited from the theme for free — Eurostile Heavy
   headings and Instrument Sans body are already on shop.accuphy.com. No default
   widgets, no white cards, no drop-shadow soup.
8. **Finishing.** A subtle vignette and film grain, a slow colour drift in the
   water, cinematic 16:9 framing on desktop.
9. **Learned from Lusion's About page** (`docs/look-references.md`, Lusion study):
   a near-monochrome world with one light source; alive before touch (idle breathing),
   pointer = parallax, drag = reveal; foreground debris parallax for depth; bloom on
   bright points; (a huge product wordmark was tried and dropped, decision #59 — the section serves both devices);
   upright + italic caption lines; corner marks and one tiny hint line.

**Cost and the phone rule.** Desktop gets everything. Phones get the *same look* with
fewer samples (light-shaft samples 24 → 8, bloom at 1/8 resolution, half the
particles) — never a different, plainer look. Every effect is switchable, so the
frame-time governor sheds them in a fixed order (grain → bloom → light shafts →
parallax) while the picture, the beam and the fish always stay.

**Avoid (from Jason's earlier reviews):** the "very AI" white-card look (decision
#22), panels so dark they lose the glass feel (#37), blurry or cartoon marks (#33),
invented rings and grids on the sonar (#18), anything that reads as a diagram.

**References for the look pass:** the LVS34 frames
(`reference/app-study/livescope-lvs34/`), Accuphy's mode animations
(`reference/animations/`), the 3D Lab's approved glass UI, and Apple / DJI product
pages for spacing and restraint.

**Gate.** Step 1 of §8 ends with a look review by Jason on the desktop and on his
phone, side by side with those references, before anything is packaged. If the look
does not reach the 3D Lab's level, the section does not ship.

## 4. What carries over from the 3D work

Nothing learned is thrown away; it changes form.

| Learned | Where it lives today | In the section |
|---|---|---|
| Beam data: angles, thickness, max range, forward-tilt rule, fan spans per view | `2026-09-23-sonar-beam/devices.js` (`fanSpans`, `forwardTiltDeg`) | used as is — plain data, no three.js |
| Colour: garmin_amber measured from LVS34 (§7.7); the app's tone curve (log compression → gain / dynamic-range window → LUT, γ 0.75) | `colormaps.js`, `sonarShader.js` | one 256×1 LUT texture + the same six lines of GLSL |
| The picture's rules (§6–§7): floor 90–95 % removed with a trace, radial streaks, thick bottom band with hot leading edge + tail + faint second echo, near-field rays (2.4 m), TVG in shallow water, structure ×0.8 with a black shadow, marks 7–20 cm along the ray | `sonarShader.js` (side-view branch) | the same formulas, evaluated once per pixel instead of over 24 thickness rows; the band width keeps the range-dependent sigma the shader already uses |
| Fish marks: tangential dash = body ∪ beam footprint, radial = pulse, bright core toward the transducer, 0.7 s persistence, big-fish bloom, head-on wink | `sonarMarks.js` `computeMarks` (CPU, analytic) | the same function without the three.js texture and the Panoramic branch (the fish already live in the plane) |
| Fish are the most important element; species sizes; schools as parallel streaks | `fish.js` | ~40 fish on fixed loops: bass by the timber, a crappie school, a bait ball, one musky — real sizes |
| AUTO depth follows the depth under the boat (decision #41) | `index.jsx` | not needed: the section draws in place, there are no screen axes to rescale; the range is fixed per device (PL 80 ft, PLM 60 ft) as a readout |
| The app's own scene proportions: 60–80 ft ranges, 10–25 m water, a ~10 m wreck, standing timber | recordings + app study | the section's scene is built to the same scale |
| Real-device method (adb + Chrome DevTools) and the V10 baseline | memory `sonar-page-real-device-perf` | the acceptance test for §6's targets |
| The brightness/orange histogram check (§6.11) | `window.__sonarHist` | rerun once on the 2D picture against the same two reference frames |
| Public UI = as few controls as possible (decision #34); brand blue `#028cdf` | `index.jsx`, `index.css` | two controls; brand colour only, no brand fonts loaded |

The Phase-2 prototype (`2026-09-23-sonar-beam/`, 2026-09-23) already has this layout —
side view, cursor = device, fans, ft/m, touch drag — with a placeholder scene and a
crude yellow look on three.js. The section is that layout with the Phase-4 look and
the real scene rules, minus three.js. It is not a start from zero.

## 5. Left out on purpose (it all still lives in the full Lab)

3D lake and camera, the Ranger boat model, species colours and markings, the two wrecks
and the ACCUPHY monument, the iPhone frame and app chrome, the guide steps, the sign-up
gate, the range slider and dev tuning. The section links to the full Lab for all of that.

**Panoramic** is out of v1, as the original brief said. Seen from the side the flat fan
is a 5°–25° sliver and shows nothing useful; Panoramic needs a picture from above.
Option for later: a small "from above" panel that appears only when Panoramic is chosen
(the plan-view renderer of §7.13 is 2D already).

## 6. Technical plan — light by construction

- **No three.js, no React, no framer-motion in the section.** One WebGL 1 fragment
  shader on a canvas the size of the section, about 300 lines of plain JavaScript and
  100 lines of CSS, packaged as a **web component** `<accuphy-sonar>` with a shadow
  DOM (the shop theme's CSS cannot leak in, and it can be dropped into any page).
- **Per frame:**
  1. CPU (< 1 ms): ease the boat toward the target, advance the fish loops, run the 2D
     `computeMarks`, upload the marks as a small uniform array.
  2. GPU pass A — the polar shadow map (`docs/research.md` §3): a 1 × 512 texture; for
     each angle across the fan, march the scene (bottom as a 1-D height texture, ≤ 24
     primitives: capsules for trunks and logs, circles for rocks, a box for the wreck,
     strands for weeds) to the first hit.
  3. GPU pass B — the picture: outside the fan the dim scene (sky gradient, shore
     silhouette, water, bottom, structures and fish from the same primitives); inside
     the fan (angle, range) → echo = bottom band + structure face + fish mark + floor,
     black where range > first-hit(angle), then the tone curve and the LUT.
  Cost: one fan lookup and a few dozen operations per pixel. The Phase-2 prototype was
  already a single full-screen shader of this shape, and the inspiration site runs a
  comparable one on phones (`docs/research.md` §1). Expected 60 fps on the V10 —
  measured before anything ships, never assumed.
- **Resolution governor:** canvas = section size × min(dpr, 1.5); if a frame takes
  more than 20 ms, drop to dpr 1; cap at 30 fps when the battery is low.
- **Loading:** the section's HTML carries a **poster** (a 20–40 KB WebP of the scene
  with the fan, rendered from the component itself at build time), so something is
  there on the first paint. The script (`defer`, ≤ 40 KB gz) initialises only when the
  section comes within one screen of the viewport (IntersectionObserver), compiles
  the shader (< 100 ms) and fades the canvas in over the poster. Rendering pauses when
  the section is off-screen or the tab is hidden.
- **No fonts, no PNG:** system font stack or the theme's own font; the wordmark, if used
  at all, as an inline SVG (4 KB).
- **Fallback:** no WebGL, or a phone that still cannot hold 30 fps → the poster plus a
  short looping video of the section (recorded from itself), with the same pills
  switching between three clips. No dead ends.
- **Accessibility:** the pills are real buttons; ← → move the boat; the canvas carries
  an `aria-label`; the caption is real text (indexable).
- **Build:** a second Vite entry (library mode) in this repo → `dist-section/
  accuphy-sonar.js` (+ the poster), separate from the Lab's build. The prototype gets
  its own dated folder in the gallery (`src/experiments/<date>-sonar-section-lite/`) —
  one folder per experiment, as always.

**Targets (the acceptance test, measured with the existing real-device method):**

| | 3D Lab (measured) | Section (target) |
|---|---|---|
| First-visit download | ~976 KB | ≤ 90 KB (JS ≤ 40 KB gz, CSS ≤ 5 KB, poster ≤ 40 KB) |
| Something on screen | 2.8–4.4 s | first paint (the poster) |
| Interactive | ~3–5 s | ≤ 1.5 s on 4G |
| V10 frame rate | 10–24 fps | ≥ 50 fps at dpr 1.5, never under 30 |
| Controls | 3 + cards + inset buttons | 2 (or 1 with the device preset) |
| Page scroll | blocked over the scene | vertical swipes scroll, horizontal drags steer |
| Look | approved glass UI + the 3D lake | at least the 3D Lab’s level; Jason’s sign-off (§3b) |

Risks, stated plainly: (1) the 2D picture must match the approved inset — one
calibration round with the histogram check is planned, not assumed; (2) phone fps is
an estimate until measured; (3) the shop theme's JavaScript could interfere — the
shadow DOM should isolate it, and an iframe is plan B; (4) in-app browsers (Facebook,
Instagram) have their own quirks — tested in step 2 of §8.

## 7. Where it sits

- **Shopify (Online Store 2.0):** a Custom Liquid section — or an app block — with two
  lines: the script tag and `<accuphy-sonar device="PL" view="forward" poster="…webp">`.
  The script is hosted either as a theme asset (Shopify's CDN) or on Cloudflare Pages
  next to the Lab. No iframe; a web component is lighter and scrolls with the page. An
  iframe stays as plan B if the theme's own JavaScript interferes.
- **Placement (Jason's call, §9):** the PingLive product page under the hero with
  `device="PL"`; the PingLive Mini page with `device="PLM"`; the home page with the
  toggle visible. Each page can also preset the view.
- **The full Accuphy Lab** stays a separate page (for example `lab.accuphy.com`,
  decision #43) and is linked from the section.
- **The mobile Lab page** (`docs/mobile-marketing-plan.md`, decision #47) keeps the full
  interactive 3D experience as its core; the section does not replace it. Where the two
  meet: the section's 2D engine is a better fallback than video for phones that cannot
  run the 3D (still interactive, same look), and the section uses the same touch rules
  and callouts as the mobile principles (drag anywhere in the water, "Bass · 12 ft"),
  so behaviour and wording stay consistent across both.

## 8. Build order (only when Jason says go) — every step ends with something to look at

1. **Prototype in the lab** — `src/experiments/<date>-sonar-section-lite/`: side
   view, boat, fan, the sonar picture inside, raw WebGL. Side by side with the 3D
   inset on the same scene rules, and the §6.11 histogram against the two reference
   frames. Ends with the look review of §3b (Jason, desktop and phone, against the
   references) — the gate before packaging.
2. **Section packaging** — the web component, poster, lazy init, pills and toggle,
   auto-cruise, touch rules; a test page that fakes a long product page with the
   section in the middle, to prove scrolling and the in-app browsers.
3. **Measure** on the V10 and an iPhone: KB, first paint, interactive time, fps; tune
   the governor until §6's targets hold.
4. **Shopify** — an unpublished test page of the store with the Custom Liquid section
   → Jason reviews on his phone → the real page.
5. **Later options:** fish tags, the Panoramic top-down panel, the video fallback,
   analytics events (first touch, view switch, "Open the full Lab").

Steps 1–3 are about two working sessions; step 4 is an hour plus Jason's review.

## 9. Decisions for Jason (one at a time, none needed today)

1. **Go / no-go** on this direction: a light side-view section that lives *next to*
   the full 3D Lab, not instead of it. (Recommended: go — it is the piece that fits
   product pages, phones and ads.)
2. **Views in v1:** Down + Forward, plus Combo on the Mini; Panoramic later as a
   top-down panel. (Recommended.)
3. **Controls:** view pills + device toggle on the home page, device preset on the
   product pages. (Recommended.)
4. **First placement:** the PingLive product page. (Recommended.)
5. **Fish tags** on the first reveal: yes or no.
6. ~~Mood~~: decided on 2026-09-24 (decision #51) — dark cinematic water (Jason: 深色电影感),
   the dusk palette of §3b; a dark block inside the light shop page.

Wording of the headline and captions comes after the prototype, so Jason judges it on
the real thing.
