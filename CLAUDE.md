# CLAUDE.md — Accuphy Visual Lab

## What this is

A **website visual lab**: design and interaction experiments for the public
**accuphy.ca** website (layouts, typography, colour, motion, component ideas).

It is **NOT** the RMA portal and **NOT** the Distributor Portal
(`.../ACCUPHY/IT/Partner Portal/`). Nothing here ships to partner.accuphy.ca,
and nothing from those projects should be copied in here. Keep the two worlds
separate.

## Stack (decision #2, 2026-09-23)

**Vite + React 19 + Tailwind CSS 4 + Framer Motion.** Plain JavaScript/JSX,
no TypeScript. No backend, no database — front-end only.

- `npm run dev` → http://localhost:5173 (hot reload)
- `npm run build` → `dist/` (static; can be dropped on any host)
- Heavier libraries (GSAP, Three.js/react-three-fiber) may be added per
  experiment when needed; record it in `docs/decisions.md`.

## Layout

- `src/experiments/<yyyy-mm-dd>-<slug>/index.jsx` — **one folder per
  experiment**, auto-discovered and listed on the gallery page (see
  `src/experiments/README.md`). Opens at `#<folder-name>`.
- `src/App.jsx` — gallery + hash router. `src/experiments.js` — discovery.
- `docs/decisions.md` — numbered log of design/tooling decisions. Any decision
  made in any Claude session must be written back here.
- `docs/sonar-beam-visualizer-brief.md` — brief for the first real experiment
  (Sonar Beam Visualizer). **Read it before touching that experiment.**
- `reference/` — recordings + product images used as design input (see its README
  and `reference/clips.md`).
- `docs/sonar-style.md` — how the real app draws things (Phase 1 output).
- `docs/research.md` — tools/approach research and the reasons behind decision #5.

## Vocabulary

- **PL** = PingLive, **PLM** = PingLive Mini (Jason's shorthand).
- *Range* = horizontal distance, *depth range* = vertical (as in the app).
- **Units:** the Accuphy app can be metric or imperial. Only trust a unit that
  is printed on screen (`13.4 m`); bare axis numbers carry no unit. Engine
  works in metres internally, displays in the user's unit.

## Rules

- One experiment = one folder; don't edit an old experiment to make a new
  idea — copy it into a new dated folder.
- Keep each experiment self-contained (its own components/assets in its folder).
- **R3F gotcha (learned 2026-09-23):** React Three Fiber copies plain-object
  `uniforms` when applying the prop, so scalar `{ value }` entries in your own
  memoised object are not the material's. Update uniforms through the material
  ref (`mat.current.uniforms.x.value = …`), never through the memo. Symptom:
  vector uniforms update, scalars silently stay at their initial value.
- Dev aids on the sonar experiment: `?frame=375x812` renders it in a fake
  phone box; `?debug` shows live uniform values.
- Jason is not comfortable with git/terminal: Claude drives git (commit, push),
  starts the dev server, and explains in plain language.
