# CLAUDE.md — Accuphy Visual Lab

## What this is

A **website visual lab**: design and visual experiments for the public
**accuphy.ca** website (layouts, typography, colour, motion, component ideas).

It is **NOT** the RMA portal and **NOT** the Distributor Portal
(`.../ACCUPHY/IT/Partner Portal/`). Nothing here ships to partner.accuphy.ca,
and nothing from those projects should be copied in here. Keep the two worlds
separate.

## Layout

- `experiments/` — every experiment lives in **its own folder**:
  `experiments/<yyyy-mm-dd>-<slug>/index.html` (see `experiments/README.md`).
- `docs/decisions.md` — numbered log of design/tooling decisions. Any decision
  made in any Claude session must be written back here.

## Rules

- **Plain HTML / CSS / JS, no build step** — until a framework/tooling choice is
  recorded in `docs/decisions.md`. Each experiment must open directly in a
  browser by double-clicking its `index.html`.
- One experiment = one folder; don't edit an old experiment to make a new
  idea — copy it into a new dated folder.
- Jason is not comfortable with git/terminal: Claude drives git (commit, push)
  and explains in plain language.
