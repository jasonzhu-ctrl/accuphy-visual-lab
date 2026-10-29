# CLAUDE.md — Accuphy Visual Lab

## What this is

A **website visual lab**: design and interaction experiments for the public
**accuphy.ca** website (layouts, typography, colour, motion, component ideas).

It is **NOT** the RMA portal and **NOT** the Distributor Portal
(`.../ACCUPHY/IT/Partner Portal/`). Nothing here ships to partner.accuphy.ca,
and nothing from those projects should be copied in here. Keep the two worlds
separate.

## Boundary with the website project (decision #69, Jason 2026-09-25)

- This lab makes **designs and prototypes only**. It never touches the Shopify store.
- Everything that must land on shop.accuphy.com (a section, a page, a form, a pixel, a
  tracking tag, copy, translations) goes through the website project
  `.../ACCUPHY/IT/accuphy-website` — the "Shopify landing platform". When a design is
  final, write a handoff into `accuphy-website/handoffs/` (its `CLAUDE.md` has the format)
  and stop; that project puts it into the theme, translates it, measures it and publishes.
- Facts about the live site (markets, tools, weight, traffic) live in
  `accuphy-website/docs/site-audit.md`; product specs only in `accuphy-website/docs/specs.md`.
  Do not keep copies here; `docs/site-audit.md` is just a pointer.
- Sidebar group = folder name. A lab chat runs in this folder; the chat
  "网页section轻量化设计" was opened in the website folder by mistake — when the lite section
  is resumed, open a new chat here.

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
- `src/experiments/2026-10-16-sonar-ice-3d/` — the **ice-fishing page** (decision #94): a one-line wrapper that opens the
  sonar lake with `scene="ice"`. The ice code lives in the lake folder (`iceScene.js`, `iceSheet.js`, `iceProps.js`,
  `IceCamp.jsx`, `snow.js`, `iceSky.js`). Dev aids: `?time=dusk|day|night`, `?look=snow|mixed|glass`, `?icelut=amber`.
  Local only until Jason says publish (`VITE_SCENE=ice` is the build variant).
- `docs/decisions.md` — numbered log of design/tooling decisions. Any decision
  made in any Claude session must be written back here.
- `docs/sonar-beam-visualizer-brief.md` — brief for the first real experiment
  (Sonar Beam Visualizer). **Read it before touching that experiment.**
- `reference/` — recordings + product images used as design input (see its README
  and `reference/clips.md`).
- `docs/sonar-style.md` — how the real app draws things (Phase 1 output).
- `docs/research.md` — tools/approach research and the reasons behind decision #5.
- `docs/users-and-market.md` — round 0 of the market research (personas, first principles).
- `docs/market/` — market learning: who buys, competitors, metrics, experiments, learning log
  (decision #82). **Read `docs/market/README.md` before giving sales or marketing advice**, and
  write new learnings back there.

## Lessons and skills (2026-09-26)

Small, clear edits (a colour, a label, moving one object): just do them and check the one affected view — no need to
read `docs/lessons.md` or run a skill. Read `docs/lessons.md` only for bigger work on the sonar picture, terrain, fish
or sharing. Repeatable procedures are project skills: `sonar-qa` (full QA pass), `sonar-look-tuning` (changing the
picture), `lab-test-link` (updating the public test link), `ad-video` (ad stills and films). Node checks live in `scripts/dev/`.

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

## Several chats, one repo (Jason 2026-09-24: 本地文件协同一下相关对话 … 不要再和rma的混合在一起)

This is a separate project from the RMA portal. Several Claude chats work on it at the same
time, all in this one working copy, and they coordinate through the files here, not through
anyone's memory.

- **Folder:** every visual-lab chat runs with THIS folder as its working folder. A chat that
  was started elsewhere (the RMA folder, an RMA worktree) must not do visual-lab work there: it
  hands over through this repo and stops. Nothing from this project goes into RMA files or
  RMA memory.
- **Shared state lives in files:** decisions in `docs/decisions.md`, open work and open
  questions in `docs/backlog.md`, and what Jason must be reminded of in the project memory
  (`pending-reminders`). Write before you finish a turn; a decision that isn't written down
  doesn't exist.
- **Decision numbers:** re-read the last number in `docs/decisions.md` right before appending, and again
  after `git fetch` just before the commit (renumber if another chat took it meanwhile). Two chats wrote #69
  twice and #102 twice (Jason 2026-10-18: 以后注意避免).
- **One lake, one owner (#176, Jason 2026-10-27):** only "冰钓版本视觉效果" changes the lake scene and the sonar imaging
  (ice included). Other chats send it what they need. The canon is `docs/lake-canon.md`; every link is built from one commit.
- **The colleague 孙英杰 (GitHub AJ-nb, #183, Jason 2026-10-28):** works on his own branch and opens a pull request that
  Jason reviews before it is merged into main. He may change and optimize the lake scene, and pick scenes and sonar pictures
  for videos. He must not touch the sonar imaging engine or its logic. He is optimizing the ad films. **No ad language
  versions** (#185, Jason 2026-10-28): at most one film, only to run the funnel and ad tests (vertical and horizontal OK).
  Jason decides what goes live.
- **Lake and ice share code (#94):** the ice page lives in the lake folder. Any change there for the ice page is
  checked on the summer lake (desktop and phone, a sonar-qa grid against the last commit) before it is merged, and
  any lake change is checked on the ice page (Jason 2026-10-18: 这个确实要非常注意).
- **Git in a shared working copy:** run `git status` before editing. Leave files alone that
  another chat has uncommitted changes in. Stage only your own files by path, never
  `git add -A`. Commit with `git commit -- <your paths>` (a plain `git commit` also sweeps in files another chat has
  staged; Lab HQ did that in 914c570 on 2026-10-26). Commit and push right after each change. For multi-file work, tell the other
  chats which files you are taking (cross-session message) and free them when done.
- **Go-ahead:** build only after Jason explicitly says to start ("我没说动不要动"). Plans,
  proposals and options are not approval; offer them, then wait.
- **Chats as of 2026-10-25** (three layers, Jason 2026-10-25; rules in
  `IT/CHIEF Agent/docs/protocol.md`):
  - "accuphy-visual-lab HQ" (session id `local_1022478a-b63a-4fff-8403-7c58646dab95`; message it by this id, not by name) — the Lab's lead: keeps `docs/backlog.md` and its status bar,
    dispatches work, checks what comes back, reports to "项目总管 | CHIEF Agent". Live changes
    need Jason's "动" said in the HQ chat.
  - "冰钓版本视觉效果" — the working chat for the sonar picture, the lake and the ice page.
  - "手机网页端" — the phone web page.
  - "广告视频制作" (#179; narrowed by #183 and #185 on 10-28) — paused. No ad versions; at most the ONE film Jason names,
    only to run the funnel and ad tests (vertical + horizontal), with the `ad-video` skill. It never changes the lake or
    the sonar.
  - "LiveScope 研究" — the LiveScope reference study (`docs/livescope-study.md`).
  - "案例工具调研" — research on case studies and tools.
- **The name:** "visual lab" and "Accuphy Lab" are the same project; Jason dropped "visual"
  because the Lab is more than visuals. The folder keeps its name.

