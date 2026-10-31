# Handover note — chat "案例工具调研" (slug: case-tools)

Written 2026-10-31 by the old-app chat (worktree `claude/case-study-tools-research-6d37d4`), for Lab HQ plan B. The chat is archived after this note;
its worktree is removed by HQ. Branch tip 05beff0 is an ancestor of main (verified 10-31): nothing is lost with it.

## 1. Lane
- A research chat: Jason's two references of 2026-10-03 (a 35 s screen recording of a Chinese "Three.js 今日案例&热点 186期" roundup + a screenshot of
  open-source links) → can the tools join our full web Lab, what is worth borrowing. Then, 10-23: feasibility of the phone Lab as a Shopify store page.
- Never: touch Shopify (decision #69 → handoffs to `accuphy-website/handoffs/`), build without Jason's "动", edit old experiments.

## 2. State now
- My commits, all in main: `docs/shopify-embed-feasibility.md`, decisions #133 + #134, `src/experiments/2026-09-23-sonar-lake-3d/embed.js`
  (event bridge) + `scripts/build-share.mjs` vercel.json headers (0b2ce64), Klaviyo public key `XWcjZ5` in `signup.js` (dfe8efc), backlog note (05beff0).
- Superseded by main since: #142 theme-mounted embed (`mount(el)`, `embed/lab.js`), Lab live on Vercel 10-25 (https://accuphy-lab.vercel.app/), the Shopify
  event is now `accuphy:lab` (not `accuphy_lab`). The iframe design of #134 is history; handoff Log in `accuphy-website/handoffs/2026-10-23-lab-store-page.md` says so.
- Nothing local-only, nothing running.

## 3. In flight
Nothing.

## 4. Waiting on
- **Cut-away diorama / section idea (Jason, since 2026-10-23, never answered):** Jason agreed to discuss first what a "沙盘" is worth to us. My answer:
  we already have the top-down "god view"; the new thing would be a vertical cut through the water whose section matches the phone's Down/Forward
  picture (both are the same kind of image). Open question I ended on: "是做固定的切块沙盘，还是做跟着船走的剖面？" (fixed slab vs a section that follows
  the boat). Honest cons I gave: a fixed cut does not match a boat that can be dragged anywhere; Panoramic gains little; risk of a toy-model look
  (keep dark cinematic, #51). The ice page already has a section camera (#94+, "Section" view) — compare with it before proposing anything. Not approved, not built.
  Lab HQ is turning it into a card for Jason.

## 5. Know-how not in the repo (case-study notes — from the research, 2026-10-03)
Source of the cases: the video frames (Swift AVAssetImageGenerator; no ffmpeg on this Mac) and two web-research passes. X.com blocks fetches (HTTP 402).
| # | Case | What it is / stack | Code & licence | Use for us |
|---|---|---|---|---|
| 1 | Marco Ludovico Perego (@mlperego), "Top 1" | Cut-away coastal diorama: terrain block with beach, rocks, grass, clear blue water box with visible side walls, waves on shore. Made "a few nights" with Claude + Three.js; he worked 5+ yrs at Lusion, freelance since 07/2026; GitHub `emmelleppi` (repos: threejs-challenge-0, r3f-cheers liquid-in-glass shader, LudoGL own WebGL2 renderer). **Water technique not confirmed.** | No demo/repo found | Idea only: the cut-away "glass tank" presentation |
| 2 | Garrett Johnson (@garrettkjohnson), "Top 2" | `closed-chain-ik-js`: IK solver for closed-loop mechanisms; crab-walking demo (added 2026-10-01) | Apache-2.0, npm `closed-chain-ik` | None (nothing with legs); skip |
| 3 | 洛克船长 (@slashui) → Ryan Sael's https://sael.net/internet/ , "Top 3" | WebGL 3D city; the ~0.5 s page load is slowed into a 4-act timeline (DNS, TCP/TLS, request, response); play/pause (space), `[` `]` chapters, click a building to jump, inspector panel per hop; one real DoH lookup. Framework not disclosed; a timeline player, not scroll-driven. | Not open yet ("becoming an open project") | Pattern: a slow-motion "what happens in one ping" (emit → spread → echo from fish/bottom → phone draws) with pause + chapters — as a guided tour for ad visitors |
| 4 | ハシモトタクマ / FunTech showreel, "Top 4" | https://experience2026.funtech.inc/ — ~50 s 174 BPM 3D piece, WebGPU or WebGL2; stack unconfirmed | Commercial, closed | Mood only |
| 5 | Majid Manzarpour (@majidmanzarpour), "Top 8" | Most likely `threejs-procedural-animals`: 24 animals built at runtime from SDFs, auto-rigged/skinned, procedural fur/feathers/scales, IK walking; 5 quality tiers 110k→5–8k vertices; Web Worker build 0.4–6 s or pre-baked `.animal` ~20 ms; ~0.1 ms/animal/frame. Other repos: threejs-game-skills (2.4k★), procedural-dungeon/spider, threejs-vfx | **MIT**; demo majidmanzarpour.github.io/threejs-procedural-animals | Possible source for nicer fish close-ups; lowest priority (our fish are marks, drawn 2.6× real size) |
| 6 | Berry Curvature (@berrycurvature), "Top 13" | Particle visual with ripples on water around a 3D object. **No public info found** | — | Idea: a visible expanding ping wavefront, cheap in the existing shader |
| 7 | Meng To (@MengTo), "Kage" | Single `index.html`, three.js r149 vendored, 5-chapter night walk through a Kyoto temple, scroll drives the camera, AI WebP layers on top; 922 KB (290 KB gzip) without images; mobile layout + reduced-motion. I found no device-mockup tool by him. | **No licence granted** (all rights reserved) | Pattern only: scroll-chapter storytelling (lite section, #48); do not copy code |
Open-source building blocks 2025–26 (a "tank with water" recipe): three.js examples `Water`, `Water2`, `webgl_gpgpu_water` (MIT); Evan Wallace's WebGL Water
(heightfield sim, refraction, caustics; MIT; three.js port by `jeantimex`); drei `MeshTransmissionMaterial`, `<Caustics>` (MIT); `three-custom-shader-material`.
Paid: Tidewater ($75, FFT+Gerstner, TSL), Three.js Water Pro (WebGPU). Scroll storytelling: drei `ScrollControls`, GSAP ScrollTrigger (free, own licence, not MIT),
Theatre.js (core Apache-2.0, Studio AGPL).
Our stack's limits for any of this (from the Lab review, 10-03): three 0.186 + R3F 9, **no drei/postprocessing, no WebGPU**, hand-written GLSL; the lake is open water
with sine-wave surface, no refraction/caustics; V10 budget tablet 10–24 fps (GPU-bound); Safari: never sample FloatType with LinearFilter (#73). So anything borrowed
must be a cheap addition to `lakeMaterial` / the water shader, not a new full-screen pass.
Shopify facts checked 2026-10-23 (for #133): theme limits JSON template ≤ 512 KB, Liquid file ≤ 256 KB, package ≤ 50 MB compressed, no `assets/` per-file cap listed
(shopify.dev/docs/storefronts/themes/architecture/limits); Lab public page 2.57 MB raw / 1.04 MB gzip; an ordinary store page carries ~20 external scripts.
Method notes: the browser pane renders only when a screenshot is taken; `preview_start {name:"lab"}` used port 5174 when 5173 was busy.

## 6. Jason's preferences learned
- 2026-10-03: "我想一个一个说" — one point at a time; and asks whether "开源" means code you can use: answer plainly (open source = published AND licensed; no licence = can look, not use).
- 2026-10-23: "按照最合理的、最有帮助的，包括像 tracking 啊、统计啊 … 都按照我们最好的这个方式去做吧" (go-ahead for the store-page design); "Globo Mega Menu 我们后面是肯定不会用了的".

## 7. Read first
1. `docs/shopify-embed-feasibility.md` (history; #102/#133/#134 context)
2. `docs/decisions.md` #102, #133, #134, #142 (newest wins)
3. `docs/lite-section-plan.md` §6–§7 (where scroll-chapter ideas would land)
4. `docs/ice-relationship-study.md` + ice "Section" camera (compare with the diorama idea)
5. `docs/mobile-marketing-plan.md` ("Principles for mobile", the "aha" question)
6. `accuphy-website/handoffs/2026-10-23-lab-store-page.md` Log (what the Shopify side did)
