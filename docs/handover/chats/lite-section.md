# Handover: lite section (window "网页section轻量化设计")

Written 2026-10-31 at Lab HQ's request. Everything is **as of 2026-10-04**, when this window went idle. Nothing was
re-planned and nothing was re-checked against the 25 days of Lab work since then. Where I name a file that has probably
changed, I say so.

## 1. Lane

- **Mine:** planning the **lite section** (decision #48): the original side-view idea of the visualizer, built light, as
  a web component `<accuphy-sonar>` that sits as one section inside a web page. Also mine: the look research for it
  (`docs/look-references.md`, the Lusion study, the wordmark mock).
- **Not mine, never touch:**
  - the 3D lake scene and the sonar imaging: one owner, the window "冰钓版本视觉效果" (#176, canon `docs/lake-canon.md`);
  - the Shopify store: this lab never touches it (#69). Anything for shop.accuphy.com goes through
    `accuphy-website/handoffs/`;
  - the phone web page ("手机网页端") and the ad films ("广告视频制作", #183 and #185).
- **Do not confuse two words.** The "section view / 剖面版" in decisions #100–#116, #123 and #126 is a camera of the
  ice page (a cut through the lake). It has nothing to do with the lite section, which is a section of a web page.
- **Go-ahead rule:** nothing is built until Jason says go (his "我没说动不要动", 2026-09-24). This window changed **no
  file under `src/`**; every commit of mine is docs only.

## 2. State now

- **Nothing is live, nothing is on a test link, no code exists for the lite section.** The plan and the look research are
  all there is.
- **My commits** (all docs): `ffb6562` plan (#48) · `c1fd652` premium look is a hard requirement (#50) · `f2973bf` dark
  cinematic mood (#51) · `9ab9c01` 19 look references · `118b2bb` Jason's picks and the lamp concept (#54) · `6a1ffa6`
  Jason's concept in his words (#55) · `373546d` Seascape · `5fcd994` verdicts on his three finds · `a87c335` Lusion
  study · `5945a44` wordmark mock (#58) · `9988270` no giant wordmark (#59, my last lite-section commit) · `339b818`
  and `6738310` (site audit, moved to the website project; `docs/site-audit.md` is only a pointer now).
- **What the plan says** (`docs/lite-section-plan.md`, ~330 lines; §1 where we were, §2 idea, §3 what the visitor sees,
  §3b the look, §4 what carries over from the 3D work, §5 left out, §6 technical plan, §7 where it sits, §8 build order,
  §9 questions for Jason):
  - a side-view lake, device cursor, the fan *is* the sonar screen (no phone inset), two controls (view pills + device
    toggle), no three.js / React / framer-motion, one 2D shader, a poster on the first paint, targets ≤ 90 KB first
    visit and ≥ 50 fps on the V10, vertical swipes keep scrolling the page, Panoramic out of v1, the 3D Lab stays and
    is linked from the section;
  - the look is the gate (#50): nothing ships until Jason has reviewed a prototype's look against the references.
  - **The numbers in §1 and §6 are the 2026-09-24 baseline** (3D Lab ~976 KB, 10–24 fps on the V10, 2.8 s to 3D on 4G).
    Re-measure before quoting them.
- **Decisions of mine** (`docs/decisions.md`): #48 plan · #50 look is a hard requirement · #51 dark cinematic water ·
  #54 Jason's taste picks (groups A and B) and the "dark lakebed lit up" lamp concept · #55 his three rules ·
  #58 the wordmark mock · #59 no giant product wordmark (the section serves both devices). Backlog: section "Lite
  section (planning only — decision #48)", around line 330.
- **Local only, not in git, no backup** (`reference/**` is gitignored; local ACCUPHY has no backup):
  `reference/look/` (17 MB):
  - `sheet-A.png … sheet-E.png` — the 19 reference sites as contact sheets (numbers match `docs/look-references.md`);
  - `shots/`, `og/` — the screenshots and the sites' own Open Graph images behind them;
  - `jason-clip/` — 35 frames of Jason's recording, `contact.jpg`, `closeup.jpg`;
  - `mock/` — `gen.py` (draws the mock as SVG + CSS), `shot.py` (renders with headless Chrome), `mock-wordmark.png`,
    `mock-plain.png`, `pl-head.png` (the real PingLive transducer head cut from the product photo);
  - `shoot.sh`, `list-*.txt` — the screenshot scripts; `shoot-cdp.mjs` **does not work** (see §5).
  Jason's original recording: `~/Downloads/ScreenRecording_09-25-2026 00-11-55_1.MP4` (75 MB). The mock generator is
  the one thing worth copying into `scripts/dev/` if HQ wants it kept safe; I did not, to stay inside "only your own
  note".
- **Memory notes** (outside git, `~/.claude/projects/-Users-jason-zhujishuaihotmail-com-Documents-WORK-ACCUPHY-IT-accuphy-visual-lab/memory/`):
  `visual-premium-tech-feel.md` (his top look rule and his confirmed taste), `pending-reminders.md` (item 1 is the
  lite-section go / no-go), `accuphy-site-audit.md` (where the site facts live).

## 3. In flight

Nothing is running and nothing is half done. To pick it up, only after Jason says go: plan §8 step 1, a prototype in
`src/experiments/<date>-sonar-section-lite/` (a new dated folder, per the one-experiment-one-folder rule), then his look
review, then packaging and measuring.

- The reusable pieces named in plan §4 are `devices.js` (fan spans, forward-tilt rule), the colour map and tone curve,
  `computeMarks` in `sonarMarks.js`, and the picture rules in `docs/sonar-style.md` §6–§7. **The code files changed a lot
  after 10-04 (decisions up to #194 and beyond). Read the current versions; do not trust anything in the plan that
  points at a line or a function name.**
- To re-make the mock: `cd reference/look/mock && python3 gen.py && python3 shot.py mock-wordmark mock-plain`.
  It needs Google Chrome at `/Applications/Google Chrome.app`, Pillow is not needed for it, and `shot.py` already
  passes `--allow-file-access-from-files` (the mock loads the brand fonts and the logo from `public/brand/`). It worked
  on 2026-09-25. Fish, trees and the wreck in it are placeholder silhouettes.

## 4. Waiting on Jason

1. **Go / no-go on the direction: "a light section next to the full 3D Lab, not instead of it."** Asked at the end of my
   first reply on 2026-09-24, and again on 2026-09-25 ("这份计划的方向你认可了吗？认可也不会开工"). Raised in this window;
   recorded in plan §9 item 1 and in the backlog. **He never answered it directly**; he kept adding taste input instead.
   Treat it as open.
2. **Four smaller questions, plan §9 items 2–5** (views in v1: Down + Forward, Combo on the Mini, Panoramic later;
   controls: view pills + device toggle, with the device preset on product pages; first placement; fish tags on the first
   reveal, yes or no). They exist only in the document; I never put them to him one at a time. **"First placement" in the
   plan (the PingLive product page) is out of date:** the US now leads with the Mini (#57), the Lab's front door became a
   store page (#133–#134), and hosting was chosen (#102, Vercel at `lab.accuphy.com`). Re-ask it with those facts.
3. **Device pictures.** The backlog still lists "device side-view cutouts" as owed by Jason. The mock uses a crop of the
   real head from `reference/product-images/Transparent PingLive Shaft Mount.png` (box 422,0 → 1544,880). For the Mini,
   `Transparent PingLive Mini.png` (15000 × 15000) is a three-quarter front view of the Mini with Router One, not a
   side view.
4. **His verdict on the plain mock** (`mock-plain.png`): not explicit. He rejected the wordmark variant (#59) and I went
   on with the plain one. The look-review gate (#50) is therefore still unmet; there is no prototype to review.

## 5. Know-how that is not in the repo

- **Reading Jason's saved finds (Xiaohongshu).** Search pages render nothing under automation. His **favourites** page
  works in a Claude-in-Chrome tab, which uses his logged-in browser:
  `https://www.xiaohongshu.com/user/profile/5bfd6fa4e299a100010e6839?tab=fav&subTab=note`. A click opens a note as a
  modal; a carousel advances with clicks. Close the tab when done.
- **Screenshots of WebGL sites.** Headless Chrome with `--virtual-time-budget` never gets past a WebGL loader (Lusion and
  Hubtown stay on the loader). The built-in browser pane has a real GPU: Lusion rendered after about 10 s. Call
  `resize_window` 1440 × 900 first; take a screenshot before any `hover` (the coordinate frame is the scaled 800 × 500).
  A site's own `og:image` (a `curl` of the HTML) is a good fallback for a preview. **`reference/look/shoot-cdp.mjs`
  failed** (`Target.createTarget` returned no `targetId`; cause not diagnosed). Do not reuse it.
- **Pillow.** `Transparent PingLive Mini.png` raises `DecompressionBombError`; shrink it first with
  `sips -Z 1500 <file> --out <small.png>`. A Chinese font that works for Pillow:
  `/System/Library/Fonts/Hiragino Sans GB.ttc` (the PingFang path failed).
- **Lusion.** The clip Jason saved is `lusion.co/about` (a particle cloud in a monochrome planet), not the homepage. What
  the section takes from it is in `docs/look-references.md` ("Lusion study").
- **Verdicts on his three finds** (in the same file): the Lusion clip is a look bar, not a tool; the "20 liquid-glass"
  prompt pack is low value and risks the template look he rejected (#22); the Codex tutorial changes nothing, and
  React Bits is a fine library for micro-interactions on the full Lab page only (the section has no React by design).
- **Fonts.** The mock uses `public/brand/fonts/Eurostile-Heavy.otf`. Its licence for web use is unverified (memory note
  `brand-visual-system-website-v1.md`); use the website project's kit for anything public.
- **"Plan B" means different things** in different documents (the mobile plan B, the desktop plan B in #84, the Lab
  tidy-up plan B). Check which one before acting on it.
- **Decision numbers collide.** My first entry was written as #46 and had to be renumbered to #48. Re-read the last number
  right before appending (CLAUDE.md rule).
- **Ownership mix-up, for the tidy-up.** This window was opened in the RMA folder on 2026-09-25, moved to the Lab, moved
  to the website folder when the website project was created, and moved back on 2026-10-03/04 when Jason asked
  "我没搞懂这个整个项目的归属 到底哪个是哪个". It belongs to the Lab; the website facts I gathered live in
  `accuphy-website/docs/site-audit.md` and are not mine to keep.

## 6. Jason's preferences I learned (quotes, with dates)

- 2026-09-24, the task: "现在这个项目基本都是3D的 … 重新思考最早的事如何坐在一个网页的section里 是不是更加轻量化一点比较好
  包括网页加载速度这些都很重要 他应该是一个一眼明了的东西 直接有互动 不要那么多选项的 … 我们只是做计划不要动哦"
- 2026-09-24, the look: "视觉的高级感科技感非常非常重要!!!!!" Mood: "深色电影感".
- 2026-09-25, taste: "A B 都喜欢的 我们不说技术因为技术和最后的呈现效果最有关系" (groups A and B of the reference sheets;
  judge the final look, not the technique). Later: "这个我也是喜欢的忘记说了" (Shadertoy Seascape). On sharing finds:
  "我希望你还是保持开放态度关于工具和你的协作方式我很开放的".
- 2026-09-25, the concept: "就是湖归湖的画面 他是半暗的或者是有逻辑的暗和半暗 然后鼠标是声纳探头的缩小版本 但是真实图形
  然后探头到了哪里 对应的声纳波束能触达的地方就亮了" — his own reference was a swinging lamp in a black room.
- 2026-09-25, the wordmark: first "可以试试呀看看好了反正没事", then "我感觉网站首页大字的不合适 毕竟还有mini呢".
- Standing rules that apply here (from the global instructions and the project memory, not said to this window):
  - "我没说动不要动" (2026-09-24): a plan is not a go-ahead;
  - "我不着急 时间不是问题" (2026-09-24, mobile chat, #47): optimise for the best result, never recommend something
    "because it is faster";
  - "问我 问我 问我" (2026-10-25): when it gets complicated, stop and ask;
  - "问题一定要用卡片" (2026-10-30): every question goes in a clickable card, and anything needing his confirmation
    gets the `### 等你确认` heading.
- He wants things explained in plain Chinese, one question at a time. He is happy to see a still before a build.

## 7. Read first, in this order

1. this note;
2. `docs/lite-section-plan.md` (§2, §3, §3b, §6, §8, §9);
3. `docs/look-references.md`;
4. `docs/decisions.md` #48, #50, #51, #54, #55, #58, #59, then #69 (boundary with the website project), #102, #133, #134,
   #138 (hosting and embedding, decided after my plan);
5. `docs/backlog.md`, section "Lite section";
6. `docs/shopify-embed-feasibility.md` and `docs/embed-options.md` (written after my plan). They found that Shopify cannot
   hold the 2.3 MB WebGL Lab page. I did not check whether the same limits apply to a ≤ 90 KB component; test before
   relying on either answer;
7. `docs/lake-canon.md` (the section's world must match the canon; the owner is "冰钓版本视觉效果");
8. `docs/sonar-style.md` §6–§7 (the picture rules a 2D shader has to reproduce);
9. the current `src/experiments/2026-09-23-sonar-beam/devices.js`, and `sonarShader.js` and `sonarMarks.js` in
   `2026-09-23-sonar-lake-3d/`;
10. `docs/mobile-marketing-plan.md` (the plan lines up with its principles; the section's 2D engine is proposed there
    as a better fallback than video for phones that cannot run the 3D).
