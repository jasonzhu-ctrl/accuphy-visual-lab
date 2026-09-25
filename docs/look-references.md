# Look references — for the premium / tech feel (decision #50)

Jason, 2026-09-24: "你找一些案例给我看看 或者网址啥的 基于你现在理解的 然后看我喜欢哪些 大致的偏好
你就懂了". Nineteen live sites in five groups, shown to him as five captioned contact
sheets (`reference/look/sheet-A…E.png`, gitignored; screenshots by headless Chrome,
six WebGL sites shown with their own Open Graph preview image because their loaders
never finish in headless Chrome). **His picks are recorded at the bottom.**

| # | Group | Site | Why it is here |
|---|---|---|---|
| 1 | A dark cinematic product pages | DJI Mavic 4 Pro — https://www.dji.com/mavic-4-pro | Jason's earlier reference brand (decision #23); photo hero, dark chrome |
| 2 | A | Apple MacBook Pro — https://www.apple.com/macbook-pro/ | black stage, one product, quiet type |
| 3 | A | Apple Vision Pro — https://www.apple.com/apple-vision-pro/ | premium, but light: tests whether "premium" needs dark |
| 4 | A | Hasselblad — https://www.hasselblad.com/ | black + gold restraint |
| 5 | A | GoPro — https://gopro.com/en/us/ | action-cam category peer, photo-led |
| 6 | B interactive WebGL: light, reveal, atmosphere | Hubtown (Unseen Studio) — https://hubtown.co.in/ | Awwwards SOTD 06/2026: one glowing object over dark water, mouse-reveal — closest to our beam-over-lake idea |
| 7 | B | Iventions — https://iventions.com/ | dark 3D with spotlight lighting, "atmosphere over spectacle" |
| 8 | B | Oryzo (Lusion, fictional) — https://oryzo.ai/ | one object, one light, inertial 3D; warm and light |
| 9 | B | IVRESS Spin a Tale — https://brand.ivress.co.jp/ | cinematic dark brand world, WebGPU/WebGL |
| 10 | B | Igloo Inc — https://igloo.inc/ | scroll-driven 3D, light grey |
| 11 | B | Lusion — https://lusion.co/ | studio behind several of these; bold 3D |
| 12 | C water / underwater, shader-only | three.js Ocean example — https://threejs.org/examples/webgl_shaders_ocean.html | a whole sea from one shader, zero assets |
| 13 | C | DeepSee Commerce — https://deepseecommerce.com/ | scroll descent with depth fog and light scattering, Awwwards HM |
| 14 | C | oimo.io Water3D — https://oimo.io/works/water3d/ | real-time interactive water |
| 15 | C | World Ocean Explorer — https://worldoceanexplorer.org/deep-sea.html | Unity WebGL, deep-sea mood (heavy — what we avoid technically) |
| 16 | D competitors (baseline) | Garmin LiveScope Plus — https://www.garmin.com/en-US/p/806410/ | white catalogue page, product photo |
| 17 | D | Humminbird MEGA Live 2 — https://humminbird.johnsonoutdoors.com/us/learn/imaging/mega-live | photo hero, yellow accents |
| 18 | E instrument UI | Linear — https://linear.app/ | dark, precise, hairline UI |
| 19 | E | teenage engineering — https://teenage.engineering/ | instrument-brand restraint (homepage currently an illustration) |

Not shown: Shadertoy "Seascape" (https://www.shadertoy.com/view/Ms2SD1, bot wall in
headless Chrome; open it live — one shader, no assets), Lowrance ActiveTarget 2
(https://www.lowrance.com/activetarget-2/, blocked), Insta360 (bot wall).

Sources used to find the 2026 examples: Utsubo "Best Three.js websites 2026", hontran.dev
"Best award-winning websites 2026", Awwwards WebGL collection.

## Jason's picks

2026-09-25 (decision #54): **groups A and B are the taste** — dark cinematic product
pages and interactive WebGL with one light source revealing a dark world. He did not
single out C, D or E. "We don't talk technique: judge the final look."
Added later the same day: he also likes **Shadertoy "Seascape"** (https://www.shadertoy.com/view/Ms2SD1)
— a whole cinematic sea from one shader with no assets: the water look he wants is
reachable procedurally, which is exactly the lite section's method.

His own reference clip (`reference/look/jason-clip/`, a screen recording of a short
video): **HTML Light Demo** — https://jinruozai.github.io/HTML-Light-Demo/ (source:
https://github.com/jinruozai/HTML-Light-Demo, a recreation of @kaolti's piece). A
near-black room, a hanging lamp on a physical pendulum, a warm soft-edged cone as the
only light; what it sweeps over is revealed, the rest stays dark; the lamp swings, has
inertia and settles. This is his "暗色湖底被点亮" (a dark lakebed lit up) concept: beam =
lamp, lakebed = wall, sonar picture = what the light reveals, water = dark room. Not a
limit, a direction: keep learning.

## Jason's shared finds (Xiaohongshu favourites, 2026-09-25) — read through his Chrome, with verdicts

| Find | What it really is | Verdict for us |
|---|---|---|
| "跪着看完！这大概就是网页交互的天花板吧" (Clara, 1113 likes) | A screen recording of **lusion.co**, the studio's own site (already #11 in the sheets; Lusion also made Oryzo, Everswap, Porsche Dream Machine, Devin AI). | **Yes, as a look reference.** Study it live (it needs a real GPU, headless Chrome only shows its loader). Cursor-driven, every pixel moves, dark, premium. Not a tool, a bar to reach. |
| "一个 Skill 20 种 Liquid Glass 动态背景网页" (小白的AI学习笔记) | A prompt pack: 20 "liquid glass" background prompts taken from **motionsites.ai** (a paid prompt marketplace for Lovable / Bolt / Cursor / Claude), wrapped as a skill that outputs a single HTML file or a Vite + React + Tailwind project. | **Low value, some risk.** It produces generic gradient-and-glass backgrounds — the "very AI" template look Jason rejected (decision #22). We already have the approved frosted-glass UI (#37) and the section's look comes from the lake and the beam, not a background. Keep for UI polish ideas only. |
| "Vibe Coding 自制设计师个人网站 — 用 Codex 搭建" (表哥懂设计) | A beginner tutorial for building a portfolio site with Codex. Its useful part is the three inspiration sources it recommends: **Motionsites** (whole-page motion references), **Pinterest** (layout / colour), **React Bits** (reactbits.dev — ready-made React animation components: text effects, cursor trails, card effects). | **Codex vs Claude Code: same class of tool, no change.** React Bits is a real, reliable open-source library, usable for micro-interactions on the full Lab page (React) — not in the lite section, which has no React by design. Motionsites: browse for layout rhythm, don't buy prompts. |

Method note: the notes were read in Jason's own logged-in Chrome (the Claude in Chrome
extension), so login-gated platforms are fine; his favourites page is
`xiaohongshu.com/user/profile/5bfd6fa4e299a100010e6839?tab=fav`. Search pages on
Xiaohongshu render nothing for automation; the profile/favourites page does.

## Lusion study (2026-09-25, live in the browser with a real GPU)

The clip Jason saved is Lusion's **About page** (lusion.co/about), not the homepage.

**What the About page does, in order**
1. **Loader**: black screen, a thin bar, a big counter 000 → 100 bottom-left, then the "L"
   mark, then the scene fades in. Several seconds — the cost of a heavy scene.
2. **Scene**: a monochrome dark planet at night. A cloud of thousands of glowing white
   particles hangs in the sky in the shape of a human figure; it drifts, breathes, breaks
   into a nebula and re-forms. Bloom on the particles is the only light source; it lights
   the ground below it. Haze and fog toward the horizon, fine grain, floating rock
   debris in the foreground. No colour at all — black, white, grey.
3. **Mouse**: the cloud and camera shift a little with the pointer (parallax), nothing
   more. The scene is alive before you touch it; the pointer only adds depth.
4. **Scroll drives the camera**: the huge "LUSION" wordmark that sits *in front of* the
   scene slides away; the camera tilts from the cloud down to a wide shot of the plain
   with a tiny astronaut; the copy fades in split left / right, mixing upright and
   italic lines ("WE ARE LUSION / A CREATIVE PRODUCTION STUDIO / CRAFTING UNIQUE DIGITAL
   EXPERIENCES"). Everything eases; nothing snaps.
5. **Chrome**: tiny "SCROLL TO EXPLORE", "+" corner marks, pill buttons "LET'S TALK" /
   "MENU". Very few words.

**Homepage, for contrast**: a light page with a framed, rounded 3D canvas of soft matte
objects (jacks in white / blue / black); a huge headline "Bold Ideas, Brought to Life"
with a blue ribbon that draws itself along the scroll; blue-duotone image tiles that
morph; a pinned "PLAY REEL" frame that swaps clips as you scroll.

**What we take (into `docs/lite-section-plan.md` §3b)**
- **One light source, near-monochrome world.** Their cloud is the only light and the
  world is grey; ours is the beam, and the lake should be desaturated deep teal so the
  amber picture is the only warm thing on screen.
- **Alive before touch.** Idle breathing (drifting particles, slow light shafts, the
  device bobbing on the surface) — then the pointer adds parallax, and the drag adds
  the reveal. Matches our auto-cruise rule.
- **Foreground debris parallax** sells depth cheaply: our "marine snow" in front of the
  fan plane, larger and slower than the far particles.
- **Bloom on bright points** — their particles, our sonar marks and the beam edge.
- **Type in the scene**: a huge wordmark partly behind the scene elements ("PINGLIVE"
  behind the water surface, cut by the boat and the beam) is a strong brand moment worth
  a try; upright + italic mixed lines for the caption.
- **Scroll as a camera move**: in a section, a small tilt or the caption fading in as the
  section scrolls into view — not a full scroll story.
- **Restraint in chrome**: corner marks, one tiny hint line, pills.
- **What we do not take**: the multi-second loader and the weight behind it. The look is
  the target, not the cost — our poster shows at the first paint.
