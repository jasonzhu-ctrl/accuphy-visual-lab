# Decisions — Accuphy Visual Lab

Numbered log. Newest at the bottom.

1. **2026-09-24** — Repo created as a standalone project separate from
   `accuphy-rma-portal`; plain HTML/CSS first, framework to be decided.

2. **2026-09-23** — Stack chosen for interactive design work: **Vite + React +
   Tailwind CSS 4 + Framer Motion** (plain JS, no backend). Replaces the
   "plain HTML first" placeholder from #1. Rationale: fast hot-reload for
   trying ideas, real interactivity/animation, and same React+Tailwind basis
   as the Partner Portal so approved designs can be ported without rewriting.
   Experiments now live at `src/experiments/<date>-<slug>/index.jsx` and are
   auto-listed on a gallery page. GSAP / Three.js can be added per experiment;
   migrating to Next.js/Astro is a later decision if the lab becomes the real
   site.

3. **2026-09-23** — First real experiment: **Sonar Beam Visualizer** for
   PingLive / PingLive Mini (marketing page for accuphy.com / Shopify).
   Full brief in `docs/sonar-beam-visualizer-brief.md` (carried over from
   Jason's Chat discussion). Key locked-in facts: beam angles (PingLive 135°,
   Mini 39°, Mini Combo 78°), hybrid procedural sonar rendering with ray-cast
   acoustic shadows, WebGL (PixiJS or three.js — pick at Phase 2/3), single
   embeddable HTML output, desktop + touch. Reference recordings and product
   images go under `reference/` (gitignored if large).
