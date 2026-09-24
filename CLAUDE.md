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

## Rules

- One experiment = one folder; don't edit an old experiment to make a new
  idea — copy it into a new dated folder.
- Keep each experiment self-contained (its own components/assets in its folder).
- Jason is not comfortable with git/terminal: Claude drives git (commit, push),
  starts the dev server, and explains in plain language.
