# One shoreline for the summer lake and the ice page: design handover to Base (界面设计, 11-02)

Jason approved the layout in Lab HQ on 11-02 ("OK, lock it in"): the curve, the distance, and the trees small in front and
tall behind, as in `docs/2026-11-02-shoreline-options.jpg` (9d0a147). He asked "isn't it the same lake?", so there is one
shore on both pages; winter only adds snow. The detail is to be done properly when Base builds it.

| File | What it is |
|---|---|
| `docs/2026-11-02-shoreline-options.jpg` | The approved look: summer lake desktop and phone, ice page in three cameras at day and dusk, close-ups, edge cues |
| `docs/2026-11-02-shoreline/shore-mock.js` | The mock that drew it: three.js geometry added to a scratch copy of the page. **Reference for positions, sizes and colours only, not production code.** |

## 0. The quality bar (Jason 11-02, a standing rule for every new model in the base version)

"Every new model in the base version must be optimised, more premium and better looking." For this shore that means:

- **Forbidden:**
  - cone-stack trees;
  - flat-colour ground;
  - anything low-poly, cardboard-like, repetitive or game-like.

  The mock has all of these. It only fixes the layout.
- **Ground:** fine texture on the sand, grass, soil and snow, so it never reads as one flat colour. Add a few grass tufts or
  reeds at the waterline in summer and snow-surface detail in winter: drift ripples, a little sparkle in low sun.
- **Trees:** real conifer silhouettes. Uneven, drooping branch layers, see-through gaps at the edges, a hint of trunk,
  no two alike. Use 3–5 variants, instanced, with random scale, lean and rotation. In winter, snow sits on the upper
  surfaces of the branches, not as a white tint over the whole tree.
- **Light:** soft shadows or ambient occlusion where trees meet the ground and around rocks. Distance haze through the
  page's own fog.
- **Waterline:** a wet, darker, glossy band at the summer waterline. In winter, a visible snow thickness on the bank and a
  rim of shore ice.
- **Against what's there:** it must not look worse than the lake, the boat or the camp next to it. If it does, it doesn't
  ship.
- **Performance:** never trade the look for speed (#50). If it gets heavy, cut density or sample counts first, never the
  quality of a single tree or rock.

## 1. The shoreline

- **The shape (changed 11-02, Jason chose A via HQ):** a rounded square, about 62 m from the centre along the sides and
  about 78 m at the corners, with the wreck's corner bulging out. A round shore would have put the big wreck on land and
  pushed the lakebed lettering and the deep hole into the shallows. Base owns the exact outline. My mock's round curve,
  `R(t) = 59.5 + 1.4·sin(3t + 0.7) + 0.7·sin(7t + 2.1)`, no longer applies. Keep a little irregularity along the sides,
  a few metres of wobble at long wavelengths, so the sides don't read as ruled lines.
- **The same outline** serves both pages. Everything below is measured from it (d = distance from the waterline), so
  the profile, trees, rocks and cue values carry over unchanged.
- **The stop:** the boat (summer) and the hole or aim ring (ice) stop 1.5 m inside this curve. This replaces the ±58 m
  square on both pages. The drag target, the drill hop and any tap clamp all use the same curve.
- **The land** reaches from the curve out into the fog (beyond about 190 m), so no water or ice shows behind the trees.

## 2. The profile across the shore

d is the distance from the waterline in metres (negative means under the water or the ice). The heights are the mock's
values, with gentle noise along the shore so no stretch repeats.

| d (m) | Summer | Winter |
|---|---|---|
| −12 … 0 | The lakebed rises to the shore, to about −0.1 m at the waterline. **Build this into the lakebed terrain (`terrain.js`), not as a separate mesh** (see §5). | The same rise under the ice, seen from the Under-the-ice camera |
| −0.35 … 0.85 | Wet edge: darker sand (≈ #685E4C), glossy (roughness ≈ 0.2), a few reeds | Shore ice: a slightly raised, cracked rim, d −1.2 … 0.5, pale blue-white (≈ #C4D6E6 → #E2ECF6), roughness ≈ 0.3 |
| 0 … 2.2 | Beach: dry sand ≈ #B2A484, rising 0.16 m per metre, capped at 0.36 m | Snow over the beach, with 0.22 m of snow thickness |
| 2.2 … 6.5 | Bank: grass ≈ #566E40 / #687A48 mixed, rising about 1.25 m (±0.45 m along the shore) | Snowbank ≈ #ECF1F7, shadowed sides ≈ #C8D4E6 |
| 6 … 190 | Land: grass going to forest floor ≈ #3A4630 under the trees, rising slowly, with ±0.45 m rolls | Snow, shading a little bluer under the trees |

## 3. Trees and rocks

- **Trees:**
  - Placed 7–47 m behind the waterline, denser further back.
  - Size: front 2.2–5 m, back 5–13 m, blending between d = 7 and d = 22 m.
  - Width 0.7–1.3 × a normal conifer.
  - Groups with clearings: drop the trees where a slow noise along the shore is low. The mock skipped about 45 %.
  - Mock counts: about 1,260 trees around the whole lake, which is the visual density to match.
  - Colours: summer needles go from dark inside (≈ #1A2E22) to lighter tips (≈ #3A583A). Winter needles are a little
    greener (≈ #1E302C → #3E5648), with snow on top.
- **Rocks:**
  - Along the waterline, d −1.4 … 2.2. In places, not as a continuous wall: the mock used noise along the shore.
  - Sizes 0.2–1.1 m, mostly small, flattened (height ≈ 0.6 × width), partly sunk into the sand or water.
  - Summer: wet and darker near the water (≈ #464848), dry above (≈ #767470).
  - Winter: snow caps on the tops.

## 4. Where it must look right

These are the frames in the approved image. Base checks the same ones, and I check them after the build:

- **Summer lake:**
  - desktop, home view: the shore along the top of the frame;
  - phone portrait, boat at the shore.
- **Ice page:**
  - Section at the camp: a ring of snowy shore and trees on the horizon;
  - Section 16 m from the shore;
  - Under the ice: the bottom rising to the shore;
  - Top, following the hole, near the shore;
  - day and dusk.
- **Nothing covers the UI or the sonar.** The shore stays behind the panel and the phone frame (it is scene geometry, so
  this is automatic). It must not block the camp, the hole or the beams.

## 5. The sonar

- **Keep the shore models out of the sonar picture:** trees, rocks, bank, shore ice and the wet edge. In the mock the
  phone screen turned solid yellow near the shore, because the sonar picked up the new meshes. Put them on a layer the
  sonar renderer does not see, the same way the camp and boat are handled.
- **The rising bottom is part of the lakebed terrain,** so the sonar sees the real shallows at the shore. Check the
  sonar-qa grid before and after: away from the shore the picture must not change.

## 6. The edge cue

- **Ice page, a tap past the shore:**
  - The aim ring stops 1.5 m inside the shore.
  - A faint dashed ring (white 35 %, 1.5 px, 5/5 dash) stays where the finger was, with a dotted line between the two.
  - One line appears above the ring: "Shore — the lake ends here".
- **Summer lake, a boat dragged into the shore:** the boat stops 1.5 m inside it. The same line appears once per drag,
  above the boat, with no rings.
- **The line:**
  - Lab dark glass: rgba(14, 28, 36, 0.86), a 1 px white border at 16 %, radius 999 px, padding 6 × 12.
  - Text: Instrument Sans 600 12.5 px, white.
  - It fades in 0.2 s, stays 2.5 s and fades out 0.4 s.
  - **It always sits at least 16 px inside the screen.** In the mock it ran off the left edge on the phone; clamp its
    position.
  - The words belong to 对接 (an i18n key), with French via the website.
- **The ring** is the page's own aim ring, unchanged. It just stops at the shore.

## How 界面设计 will check

On a clean build of Base's commit, I'll shoot the frames from §4 plus a close-up 2× crop near the shore, and compare
them with the approved image and the quality bar in §0. I'll also confirm that the sonar picture no longer flashes near
the shore and that the hint line stays inside the screen on a phone. Then I'll report to HQ.
