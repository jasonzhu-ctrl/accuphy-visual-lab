---
name: sonar-qa
description: QA of the Accuphy Lab 3D sonar lake page (src/experiments/2026-09-23-sonar-lake-3d) — scale it to the change: full pass only after big changes, before sharing a link, or when Jason asks for an overall check. Checks 6 spots × 6 views, brightness histograms, console errors, units, sign-up gate, mobile, fish safety, production build and Safari-unsafe textures.
---

# Sonar Lab QA pass

**Scale it to the change** (it is expensive: dozens of snapshots and a simulation). A small edit → only the view it
touches plus the console. The full pass below → after big changes (shader, terrain, fish logic, build setup), before
sharing a link, or when Jason asks for an overall check.

Run all of it; report what failed and fix it. Details and history: `docs/lessons.md`, decisions #66–#68, #73.

1. **Build:** `npx vite build --outDir <scratchpad>/lab-build` must pass.
2. **Safari-unsafe textures:** `grep -rn "FloatType" src` — any FloatType texture with LinearFilter reads BLACK on
   iPad/iPhone/Mac Safari (#73). Allowed: float + NearestFilter, HalfFloat + Linear, 8-bit + Linear.
3. **Fish:** `node --import ./scripts/dev/node-register.mjs scripts/dev/fish-sim.mjs 15` → violations all 0,
   lowest gap ≥ ~0.35 m.
4. **Browser grid** (dev server, 1728×1000 viewport, `?bigphone`): for spots default (−6,4), shelf (−40,−5),
   hump (22,8), deep (4,−40), lockup (−14,−52.5), drop-off (−20,6) × views PL Down/Forward/Panoramic and PLM
   Down/Forward/Combo: move the boat via `__sonarState.boat/target`, wait ~1.7 s, `__sonarSnap()` → `/__snap`,
   `__sonarHist(10)`. Tile the snapshots with PIL and look at every tile. Targets: bottom scenes ~6–10 % white;
   nothing fully black unless physics says so (Mini Forward in deep water at short range).
5. **Controls:** Down greys the Range slider and shows AUTO; ft ↔ m toggle (e.g. 70 ft ↔ 22 m, readout right);
   device/view switching keeps the bottom height between Down and Forward.
6. **Reachability:** drive the boat by setting only `__sonarState.target` (clamped to ±58 m, like a drag) to the
   lockup line and the wreck; they must image.
7. **Gate + mobile:** tap `.ph-ctl` → sign-up gate opens, email focused, page inert (main page only; the share build
   has no gate). Resize to 375×812: layout intact, no console errors.
8. **Console:** `read_console_messages` onlyErrors after the whole run.
9. Record the result as a decision (re-read the last number first) and reset the viewport.
