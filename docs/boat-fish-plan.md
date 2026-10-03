# Boat + fish plan: a real bass boat, fish that swim naturally (proposal, 2026-10-03)

Status: boat decided (#83); fish decided (#85); **phase 1 built (#86)**; **phase 2 built (#88)**, waiting for Jason's
look. Phases 3–4 wait for Jason's go (CLAUDE.md: "我没说动不要动").

## 中文摘要（给 Jason）

你说的两件事：船太简陋、要更像 bass boat；鱼游动时身体的摆动要更自然。另外让我自己找问题。

**现在的问题（看过代码和近景截图）**
- **船**：船身是把一个平面轮廓直接往上拉高做出来的，所以船舷是竖直的、船底是平的，没有 V 形底，船头也没有上翘。座椅、操作台、马达都是方块。拖动时船不会转向，只是横着滑，也不随波浪起伏。
- **鱼**：鱼的身体完全不弯，是一整块硬的。现在唯一的"摆尾"其实是整条鱼上下点头（转轴写错了），而且所有鱼不分大小、不分游速，都是同一个节奏。鱼没有眼睛。湖里只有 6 条 walleye（加拿大最重要的鱼），却有 205 条小银鱼；黄鲈和北方狗鱼一条都没有。
- **别的**：近景能看到湖的边界；整个湖是一片均匀的青绿色，没有"浅处亮、深处暗"，湖底也没有光斑；水草像一团团白色爆米花；每一帧要画约 88 万个三角形，其中鱼占约 22 万（每条小银鱼都用了和大鱼一样多的面）。便宜安卓机本来就只有 10–24 帧。

**资料（都核实过授权，可以商用）**
- 鱼的摆动：游戏 ABZÛ（GDC 2017 演讲）用的是"顶点着色器"方法：不用骨骼，在显卡上让身体按一条从头到尾越来越大的波浪摆动。照这个思路写的开源实现有 Fish-shader（MIT）和 Google 的 WebGL Aquarium（BSD）。另外有 6 个开源鱼项目没写授权，只能参考思路，不能抄代码。
- 真鱼的数据（论文）：身体波长约 0.95 个身长；摆幅头部很小，尾部约 0.1 个身长；尾巴每摆一次，鱼向前约 0.65 个身长；Strouhal 数 0.2–0.4。
- 船：主流 20–22 尺 bass boat（Ranger Z521R、Phoenix 921、Bass Cat Puma 等）宽都是 96 寸（8 尺），配 200–300 马力舷外机。前置探头一般装在船头电动马达的杆子上，比船底低一点点；钓 walleye 的人也常用单独的杆装支架。three.js 自带 `LoftGeometry`，可以按横截面把真正的 V 形船体"蒙皮"做出来。另外有一个免费的 bass boat 模型（BoatUS 基金会在 Sketchfab 上发布，CC-BY），但从这里打不开 Sketchfab，面数和质量还没确认。

**建议分四步，每步做完给你看，你点头再做下一步**
1. **鱼游自然**（约半天到一天）：在显卡上让身体按波浪弯曲。尾摆频率跟着游速走，转弯时身体弯成 C 形，冲刺后滑行，悬停时只轻轻摆，顺便修好"上下点头"的错。小银鱼减面，总面数反而下降。声纳屏幕上的鱼回波是另外算的，不受影响。
2. **新船**（约 1.5 天）：用代码重新做一条低调的 21 尺 bass boat：真正的 V 形船底、几乎平直的船体线条、前后钓鱼甲板、双操作台加环绕挡风玻璃、桶形座椅、舷外机。按你 2026-10-03 的决定（#83）：船头不抬、不要 Power-Pole、电动马达和 PingLive 探头先保持原样、船身用暗色哑光，不抢眼。再让船随浪轻轻起伏，加上船边白沫和行驶时的尾浪；远处自动换成省面版本。
3. **鱼的样子和品种**（约 1 天）：加眼睛（walleye 那种反光大眼）、两段背鳍、正确的尾形、半透明带鳍条的鳍；加黄鲈和北方狗鱼，多放些 walleye。
4. **湖的整体感**（可选，约 1 天）：遮住湖的边界，浅处亮深处暗，浅水湖底加光斑，重做水草。

**需要你拍板的**
1. ~~船型~~ 已定（#83）：低调的 bass boat，船头不抬，不要 Power-Pole，电动马达和探头先不动。
2. ~~船怎么来~~ 已定（#87）：用代码自己做。第 2 步已经开始。
3. ~~鱼的品种~~ 已定（#85）：现有的鱼都保留，第 3 步加黄鲈和北方狗鱼；数量（多放 walleye、少放小银鱼）到第 3 步给你看了再定。
4. ~~鱼的大小~~ 已定（#85）：按鱼种分别定。musky 保持现在的大小或再小一点（给你看对比图再选），其他鱼保持现在的 2.6 倍。声纳屏幕不受影响。
5. ~~先做第 1 步~~ 已定（#85）：第 1 步（鱼游自然）已做好（#86），等你看效果。musky 的大小请从对比图里选。

## Context (for Claude)

Jason, 2026-10-03: "UI先不说吧，先说这艘船的模型吧，看着太简陋了。我希望它能够稍微精美一点，更像Bassboat……我希望鱼游动的时候，身体的这个摆动是更自然的。你可以到网上GitHub也好……开源的可以商用的……另外，我要你自己找找问题跟我说。"
Then: "你就接着做这个Bassboat跟这个鱼油的那个开源资料接着去找 然后把方案全部搞完了跟我说".

Code state: main `a912ba5` (phone camera #77 and layout #78 included). Files: `src/experiments/2026-09-23-sonar-lake-3d/`
`boat.js`, `fishGeometry.js`, `fish.js`, `Scene.jsx` (`Boat`, `FishGroup`), `lakeMaterial.js` (fish vertex shader).
UI and layout are out of scope here (Jason: "UI先不说"; the phone plan is `docs/mobile-phone-layout-plan.md`).

## 1. What is wrong today

**Boat** (`boat.js`, `Scene.jsx` `Boat`):
- The hull is the planform outline extruded straight up (`ExtrudeGeometry`), twice. That gives vertical slab sides and a flat
  bottom, with no deadrise, pad, strakes or chines. The deck runs flat from bow to stern (no sheer) and the bow has no rake or flare.
- The decks, consoles, seats, outboard and Power-Poles are boxes and rounded boxes. The decals are white boxes and the
  windshields are open cylinder slices.
- The PingLive transducer is a 0.16 × 0.12 × 0.2 m box on the trolling-motor shaft. `TRANSDUCER_OFFSET` is the apex of
  the beams.
- Every frame sets `position.set(x, 0.02, z)`:
  - no bob, roll or pitch on the waves, even though the water surface moves about ±0.14 m;
  - no heading, so a dragged boat slides sideways like a puck;
  - no foam line, contact shadow or reflection.

**Fish** (`fishGeometry.js`, `Scene.jsx:204`, `lakeMaterial.js`):
- **No body bending.** The vertex shader passes `position` through unchanged.
- **The "tail wag" is on the wrong axis.** `Scene.jsx:204` sets Euler z = sin(6t + phase) · 0.08 + pitch. The body runs
  along x with height along y, so a z rotation is PITCH. The result is the whole rigid fish rocking nose-up/down by ±4.6°
  at a fixed ~1 Hz, for every species, size and speed.
- Bodies are procedural tubes (26 rings × 14 segments) with flat, opaque fin cards. They are merged NON-indexed:
  about 740 triangles and 2,200 vertices per fish.
- **Anatomy gaps:**
  - no eyes;
  - walleye uses the salmonid body: one dorsal fin, no big eye, no white tip on the lower tail lobe;
  - the bass tail is drawn round, where a real one is slightly emarginate.
- **Population (298):** smelt 205, crappie 46, salmon 14, largemouth 11, lake trout 9, walleye 6, smallmouth 4, musky 3.
  - There is no yellow perch, northern pike or whitefish/cisco, the Canadian ice staples.
  - Walleye is the Prairie money fish (`docs/market/learning-log.md` L2).
- Paths are fixed Lissajous loops, a pure function of time so that the 3D fish and the sonar marks agree (lessons §3).
- The sonar fish marks are analytic (`sonarMarks.js`), and fish are not drawn in the sonar passes. **Body bending will not
  change the sonar picture.**

**Scene and performance:**
- Each frame (desktop, default view) has 95 draw calls and ≈ 0.88 M triangles, counted by wrapping the WebGL draw calls.
  - Fish are ≈ 0.22 M of that; smelt alone are ≈ 0.15 M.
  - Budget Android runs at 10–24 fps (lessons §4).
- The lakebed ends at ±160 m, and close views show the edge at the horizon.
- The whole lake is one flat teal murk:
  - no depth darkening (decision #55 asks for "a logic to what is dark and half-lit");
  - no caustics in the shallows;
  - weeds read as white popcorn clusters.
- Fish are drawn 2.6× true length (`FISH_DISPLAY_SCALE`), so a 1.3 m musky is drawn 3.4 m long. Next to a realistic 6.6 m
  boat it reads as a shark.

## 2. Research: natural fish swimming

**Technique.** ABZÛ's fish (Matt Nava, GDC 2017, "Creating the Art of ABZÛ") have no bones. The vertex shader moves each
vertex with a few cheap motions weighted along the body:
- side-to-side translation;
- a yaw pivot;
- a panning sine wave (the undulation);
- a roll/twist.

That is the standard way to animate thousands of fish, and the approach the Godot docs teach ("Animating thousands of fish with
MultiMeshInstance3D"; the docs are CC-BY 3.0).

**Usable open source (licence read from the repository files, 2026-10-03):**

| Resource | Licence | What it is | Use for us |
|---|---|---|---|
| frankiezafe/Fish-shader (Godot) | MIT | ABZÛ-style vertex shader. Twist (roll) + S-wave + yaw + translate, each weighted by a head→tail gradient; uniforms per fish | Reference for the motion mix |
| Fish-shader's "Fish Perch" model (BlendSwap #67777, holmen) | CC0 | Perch mesh. Its texture is from a third-party site with no licence: **do not use the texture** | Shape reference for perch/walleye |
| Google webglsamples, WebGL Aquarium | BSD-3-Clause | Instanced fish. `mult` = distance from the centre (tail ×2); `offset = mult² · sin(time + mult · waveLength) · bendAmount`; orientation from current→next position | Proven, minimal bend formula |
| three.js examples (webgl_gpgpu_birds, _gltf) | MIT | GPU flocking + per-vertex animation | Only if we ever move fish to GPGPU |
| wayneyip/fishtank, franky-adl/threejs-fish-simulation, albertomelladoc/Fish-Animation, elvismd/vertex_displacement_fish_shader, normal-man-0807 (three.js fish instancing + data texture), BCWalters/AiBoids, souranyp-stack/koi-pond-garden, stas4000/luminous-lake | MIT | Small fish/boids demos | Ideas only; nothing better than the above |
| Khronos glTF-Sample-Assets "BarramundiFish" | CC0 + CC-BY 4.0 | High-quality PBR fish (a perch-like barramundi) | Look reference (not a local species) |
| martinRenou/threejs-caustics · evanw/webgl-water · jbouny/ocean | BSD-3 · MIT · MIT | Caustics / water | Phase 4 ideas |

**Not usable (no licence file = all rights reserved; read for ideas only):** ErencanPelin/3D-Boids-Ocean-Simulation,
EricBallard/Fishjs, hafewa/UnityFishAnimation, imokya/threejs-fish, steveimm/unity-fish-wiggle, thebuggeddev/koi-fish.
jungdu/webgl-aquarium declares MIT only in `package.json`.

**Biomechanics numbers (published):**

| Quantity | Value | Source |
|---|---|---|
| Lateral amplitude envelope, z = 0 nose → 1 tail | a(z) = 0.02 − 0.0825 z + 0.1625 z² (in body lengths). Head 0.02, minimum ≈ 0.0095 at z ≈ 0.25, tail 0.10 (= 0.2 L peak-to-peak) | Videler & Hess 1984 (mackerel), as used by Borazjani & Sotiropoulos 2010 |
| Body wavelength | λ ≈ 0.95 L (carangiform). Subcarangiform species (trout, bass, perch, walleye, pike) use a somewhat shorter wave with more of the body flexing, ≈ 0.8–0.9 L (to tune by eye) | Videler & Hess 1984; Breder's classification |
| Efficiency window | Strouhal St = f · A / U in 0.2–0.4 (0.25–0.35 optimal); tail amplitude A/L 0.1–0.3 | Taylor, Nudds & Thomas 2003 (Nature); Triantafyllou 1993; Saadat et al. 2017 |
| Speed vs beat | Speed rises linearly with tail-beat frequency at a fairly constant amplitude | Bainbridge 1958 (J. Exp. Biol. 35:109) |
| ⇒ Frequency rule | St 0.3 with A = 0.2 L gives f ≈ 1.5 · U / L, a stride of ≈ 0.65 L per beat | derived |

Behaviour notes (standard fish locomotion):
- Fish bend into turns (a C-shape).
- Salmonids and pike burst and then glide.
- Pike and musky hold still, then launch with a C-start.
- Bass and crappie hover on their pectoral fins at low speed.

## 3. Fish plan

### 3a. Swimming (phase 1)

Work in the fish's local space: x is the body axis (nose +0.5 → peduncle −0.5, one unit = body length L), y is up and z is
lateral. Let s = 0.5 − x (0 at the nose, 1 at the peduncle; the caudal fin reaches s ≈ 1.2).

**Vertex shader** (`lakeMaterial.js`, `#ifdef FISH`):
- **Lateral wave:** z += k · a(s) · sin(2π · s / λ − Φ), where a(s) is the envelope above.
  - k is the activity: slow cruise ≈ 0.6, burst 1.0, glide easing toward 0.
  - λ by body type: bass/panfish 0.95, salmonid/bait 0.85, pike 0.8.
- **Turn bend:** z += β · (s − 0.3)², a C-curve toward the turn, with β from the yaw rate.
- **Normals:** rotate the normal about y by atan(∂z/∂x), using the analytic derivative.

**Per-instance attribute** `aSwim` = (Φ, k, β), written each frame from `fishPose`:
- Φ is integrated on the CPU (Φ += 2π f dt), so a change of f never makes the tail jump.
- f = 1.5 · U / L_drawn, clamped to 0.6–8 Hz. Using the DRAWN length keeps the stride on the drawn body (no treadmill look).

**Other changes:**
- `Scene.jsx:204`: drop the rigid sin(6t) term. Keep pitch only from vertical velocity.
- Glide: salmon after a burst, and trout now and then.
- Hover: bass and crappie at very low U (small k plus a pectoral flutter in phase 3).
- Pike and musky: k ≈ 0 while holding, and a sharp C-bend at the start of a rise.

**Cost and constraints:**
- About 30 ALU per vertex. Index the fish geometry again (today it is merged non-indexed) to cut vertex work about 5×.
- Bait LOD: smelt 10 × 8 rings (≈ 160 triangles). Net change ≈ −0.13 M triangles per frame.
- The sonar is unchanged.
- `scripts/dev/fish-sim.mjs` must still report 0 hits (the bend stays within ±0.1 L).
- Per-frame JS stays tiny: 298 × 3 floats.

**Built (#86) — where it differs from the above** (tuned after simulating speed, beat and bend for every fish):
- Turn bend β = −0.3 × turn rate (rad/s), clamped to ±0.25, instead of following the path's curvature. The curvature
  version held 30–50 % of the fish in a permanent C, because the loops are tight for fish drawn 2.6× long.
- Activity k = 0.35 + 0.65 · smoothstep(0.05, 1, U/L); 0.3 × that while slowing hard (coast). Tail beat
  f = max(1/√L, 1.5 · U/L), at most 6 Hz (L = drawn length). Most big fish swim at 0.1–0.4 body lengths per second, and
  the plan's values left them almost rigid.
- Not built yet: random glides for trout, the hover flutter, the pike's C-start (musky have no rises).

### 3b. Anatomy (phase 3)

- **Eyes:** a dark disc with a light ring; walleye gets a glassy, reflective eye.
- **Fins:** a two-part dorsal (spiny + soft) for bass, walleye and perch. Tails:
  - bass: shallow fork;
  - walleye: forked, white lower tip;
  - pike/musky: forked, dorsal far back (as today).
- Fins semi-transparent with rays (alpha by vertex attribute) and slightly thinner at the edge.
- More segments around big bodies (smoother silhouette); fewer on bait.
- New bodies:
  - `percid` for walleye and yellow perch (CC0 perch mesh as a shape reference; yellow perch has 6–8 dark vertical bars);
  - a northern pike pattern (light oval spots on a green body).

### 3c. Species mix (proposal, phase 3)

Make Canada's fish visible:
- walleye 6 → ~16;
- add yellow perch (~25) and northern pike (~4);
- smelt 205 → ~140, so bait stays dense but cheaper.

Keep the fish-sim and structure checks.

## 4. Research: bass boats

**Current 20–22 ft tournament boats** (specs from search excerpts; deadrise not published in what we could read):

| Boat | Length | Beam | Power |
|---|---|---|---|
| Ranger Z521R Cup | 21'9" (6.63 m) | 96" | Mercury 250 Pro XS class |
| Phoenix 921 Pro XP | 21'6" | 96" | 200–250 hp; rod storage for twelve 8' rods |
| Bass Cat Puma STS | 20'7" | 96" | 200–300 hp; draft 1'8" |
| Nitro Z21 Pro, Skeeter FXR21 Apex, Triton TRX 21 | ≈ 21 ft | 96" | 250 hp class (not re-verified) |

96" (8 ft) is the standard beam: the trailer width limit.

**Visual signature, as seen from above and from the side at distance:**
- Long and low:
  - beam ≈ 0.37 L, carried far forward, so the bow deck is wide;
  - squared transom;
  - low freeboard;
  - sheer rising toward a sharp, raked, flared bow.
- Hull: a modified V with a pad keel, about 20–22° deadrise at the transom (typical; not verified for these models),
  running strakes and chine spray rails.
- Decks:
  - a big flat bow casting deck, ≈ 1/3 of L;
  - dual consoles near mid-ship (driver starboard, passenger port) with wraparound windshields and a walk-through between;
  - a rear deck, ≈ 1/6 of L, with livewell hatches;
  - flush lockers and a centre rod locker;
  - grey/charcoal marine carpet.
- Seats: a bucket bench behind the consoles, plus bow and stern pedestal seats.
- Finish: bold metalflake gelcoat with a contrasting multi-colour side graphic, and a stainless rub rail.
- Stern:
  - a 250 hp outboard (large black cowling) on a hydraulic jack plate;
  - two shallow-water anchors (Power-Pole Pro/Blade) on the transom corners, vertical black arms.
- Bow:
  - a trolling motor (Minn Kota Ultrex/QUEST, Garmin Force, MotorGuide Tour) on the starboard bow; stowed flat on the deck
    when running, shaft vertical when fishing;
  - a 12–16" display on a bow bracket, and two flush-mounted displays at the console.

**Forward-facing sonar mounting:**
- On the trolling-motor shaft (Garmin LiveScope shaft mount; Humminbird MEGA Live TargetLock on Ultrex), facing forward.
  Installers put it just below the hull bottom ("barely below the boat hull, like 3/8 in").
- Or on a separate pole mount at the bow, popular with walleye anglers who troll, vertical-jig or spot-lock.

Our `TRANSDUCER_OFFSET` (x = bow − 0.33 m, y = −0.95 m) is consistent with this.

**Bass boat vs 16–18 ft aluminium deep-V (Lund Pro-V class, decision #56):**
- The deep-V has higher sides and deeper cockpits, made for big, rough water.
- Its deck area is smaller, with seats inside the hull rather than on top.
- It is painted aluminium, with no metalflake gel.
- It often has a tiller or side console with a full walk-through windshield, and a small kicker motor beside the main engine
  for trolling.
- It is slower and more utilitarian. The bass boat reads "tournament / fast / low / glitter".

**Model sources:**

| Source | Licence | Notes |
|---|---|---|
| Build in code with three.js `LoftGeometry` | three.js MIT (already a dependency, r186) | Skins the hull through station cross-sections (any shape per section) |
| "Bass Boat" by BoatUS Foundation, Sketchfab (`3d-models/bass-boat-147d601e20514b2a877cbf99005c4000`) | CC-BY (per search listing) | Sketchfab is blocked from this cloud session. Polycount, format and quality **unverified**. Needs visible credit |
| vessel.js (shiplab) | MIT | Hulls from offset tables with three.js examples. No longer maintained; heavier than we need |
| Kenney Watercraft Kit / Quaternius | CC0 | Stylised low-poly; not a bass boat look (site blocked from here) |
| Paid (CGTrader / TurboSquid, typically US$20–150) | Royalty-free vs **Editorial** licences | Branded boats are usually Editorial-only (not allowed in marketing). Real-time/web use can carry anti-extraction terms that a WebGL page cannot meet. Check per model; strip logos |

## 5. Boat plan (phase 2)

**Decided (#83, 2026-10-03):**
- The bass boat stays.
- No raised bow, and the sheer is drawn almost flat.
- No Power-Poles.
- The trolling motor and transducer stay as they are.
- Low-key muted finish.

The spec below follows #83; struck items are out.

**Approach A, recommended: build it in code.** This means no licence risk, a few tens of KB, an exact PingLive transducer, and
easy LOD.

**Hull:** `LoftGeometry` through about 20 stations (6.6 × 2.44 m):
- V sections with about 21° deadrise at the transom, sharpening to the bow;
- a narrow pad keel aft, two strakes per side and a chine flat;
- ~~sheer rising about 0.15 m to the bow~~ an almost flat sheer (≤ 5 cm, Jason judges it on the first look); a pointed
  bow with a little flare;
- freeboard ≈ 0.55–0.65 m; waterline at ≈ 0.25 m draft.

**Topsides:**
- deck panels following the sheer;
- bow and stern casting decks with hatch seams;
- two consoles with lofted fronts and wraparound windshields (curved strips, tinted);
- bucket bench seats and pedestal seats from lathe/loft shapes, not boxes;
- a stainless rub rail.

**Stern:**
- the outboard cowl as a lofted shape (top cowl, a darker mid band, lower unit, prop), on a jack plate;
- ~~two Power-Pole arms on the transom corners~~ (out, #83).

**Bow:**
- the existing trolling motor and PingLive transducer, unchanged (#83), re-seated on the new deck;
- a bow display on its bracket.

**Materials:**
- hull: low-key (#83), a muted charcoal / dark grey `MeshPhysicalMaterial` with a soft clearcoat and no bold
  metalflake;
- at most a thin, subtle side line (no brand names or logos);
- carpet with a subtle noise.

**Water contact:**
- **Bob, roll and pitch.** Sample the same wave function the water shader uses, at about ±4 cm / ±1.5° / ±1°. Visual only:
  the beam apex stays fixed, so the sonar picture does not jitter.
- **Foam line** where the hull meets the water.
- **Contact darkening** under the hull.
- **Bow wave and a V wake** while moving (extend the existing `uWake` ring ripple).
- **Optional heading:** the boat yaws a little toward the drag direction. Today the beam always points the same way (the
  code has no heading); keep that unless Jason wants the transducer to turn with the boat.

**LOD and budget:** LOD0 about 15–25 k triangles for close views; LOD1 about 3 k for the default/phone camera (the boat is
small there since #77). Material count stays about 6–8.

**Built (#88) — where it differs from the above:**
- The water surface is flat: its shader moves vertices within the plane. So the bob is a gentle visual motion, not a
  sampled wave, and the wake is drawn as foam in the water's fragment shader.
- No bow display: a dedicated screen would contradict "no display to buy".
- LOD: about 9.4 k triangles near, about 4.4 k far (switch at 38 m).

**Approach B:** try the BoatUS CC-BY model. Check its polycount and quality, decimate, compress (meshopt/Draco + KTX2), add the
credit line, and swap in our own transducer.

**Approach C:** buy a royalty-free model with web-use terms checked and logos stripped.

## 6. Other problems found (my review, by priority)

1. The fish wag is on the wrong axis (pitch) and the body never bends (§1). Fixed in phase 1.
2. Fish anatomy: no eyes, walleye drawn as a trout, round bass tail, opaque card fins (phase 3).
3. Species mix is not Canadian: no perch or pike, walleye only 6, smelt 205 (phase 3).
4. The boat does not float: no bob or roll, no foam, wake or contact shading, and it slides sideways when dragged (phase 2).
5. The world edge shows in close views; fade or extend it (phase 4).
6. One flat murk: no depth logic (shallow brighter, deep darker), no caustics in the shallows, popcorn weeds (phase 4).
   This conflicts with the look rules of #55.
7. Performance:
   - 0.88 M triangles and 95 draw calls per frame, with fish at 0.22 M;
   - every new detail must come with LOD;
   - phases 1 and 3 should leave the triangle count lower than today.
8. Fish scale 2.6× next to a realistic boat (a 3.4 m musky). Decide: keep it, reduce it, or shrink fish near the boat.

## 7. Phases, effort, checks

| Phase | What | Rough effort | Checks |
|---|---|---|---|
| 1 | Fish swimming + axis fix + bait LOD + indexed geometry | ½–1 day | `?cam=fish:<sp>` clips per body type; fish-sim 0 hits; sonar-qa quick pass (sonar unchanged); triangle count down; WebKit texture rule (no new float+linear) |
| 2 | Bass boat in code (per #83) + water contact + LOD | ~1.5 days | `?cam=boat` stills from 4 angles for Jason; default + phone camera; beam apex unchanged; fps on the Android baseline |
| 3 | Fish anatomy + percid/pike bodies + species mix | ~1 day | Per-species close-ups; fish-sim; sonar marks per species still sized correctly |
| 4 (optional) | World edge, depth light logic, caustics, weeds | ~1 day | Look review against #51/#55; perf |

Each phase ends with a look and Jason's go before the next. Rebuild the public test link only when Jason asks (skill
`lab-test-link`).

## 8. Decisions for Jason

1. ~~Boat type~~ decided (#83): a low-key bass boat; no raised bow, no Power-Poles; the trolling motor stays.
2. ~~Boat source~~ decided (#87): A, built in code.
3. ~~Species~~ decided (#85): every species stays; yellow perch and northern pike join in phase 3. The counts (more
   walleye, fewer smelt) are shown in phase 3 for his look.
4. ~~Fish display scale~~ decided (#85): per species. The musky stays at today's size or a little smaller (side-by-side
   for Jason); every other species keeps 2.6×. Sonar marks keep the true length.
5. ~~Start with phase 1?~~ decided (#85): go; built (#86). Jason still picks the musky's size from the side-by-side.

## 9. Sources

- Matt Nava, "Creating the Art of ABZÛ", GDC 2017: https://www.gdcvault.com/play/1024409/Creating-the-Art-of-ABZ ·
  summary https://80.lv/articles/gdc-2017-creating-the-art-of-abzu
- Fish-shader (MIT): https://github.com/frankiezafe/Fish-shader · Godot asset https://godotengine.org/asset-library/asset/222
- Fish Perch (CC0): http://www.blendswap.com/blends/view/67777
- Google WebGL Aquarium (BSD-3): https://github.com/WebGLSamples/WebGLSamples.github.io (aquarium/)
- three.js (MIT), `LoftGeometry` in `examples/jsm/geometries/`: https://github.com/mrdoob/three.js
- Khronos BarramundiFish (CC0 / CC-BY 4.0): https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/BarramundiFish
- threejs-caustics (BSD-3): https://github.com/martinRenou/threejs-caustics · webgl-water (MIT): https://github.com/evanw/webgl-water ·
  ocean (MIT): https://github.com/jbouny/ocean
- Videler & Hess 1984, J. Exp. Biol. 109:209: https://cob.silverchair.com/jeb/article-pdf/109/1/209/2432345/jexbio_109_1_209.pdf
- Carangiform wavelength / envelope as used in CFD: https://ar5iv.labs.arxiv.org/html/2010.04748
- Bainbridge 1958, J. Exp. Biol. 35:109 (FishBase reference): https://www.fishbase.se/references/FBRefSummary.php?id=3499
- Saadat et al. 2017, "On the rules for aquatic locomotion", Phys. Rev. Fluids (St 0.2–0.4, A/L 0.1–0.3)
- Taylor, Nudds & Thomas 2003, Nature 425:707 (0.2 < St < 0.4)
- Ranger Z521R Cup specs: https://itboat.com/models/15124-ranger-boats-z521r-ranger-cup ·
  https://www.rangerboats.com/fiberglass/bass/z-comanche/z521r-cup.html
- Bass Cat Jaguar STS test: https://boatingmag.com/boats/2024-bass-cat-jaguar-sts-boat-test
- Garmin LiveScope 2 shaft mount and pole mounts (retailer listings); MEGA Live TargetLock: https://www.defender.com
- Bass boat vs walleye boat: https://www.boatnews.com/story/42260/bass-boat-or-walleye-boat-how-to-differentiate-them-and-what-to-choose ·
  https://www.crestliner.com/news/bass-boats-101-what-to-know-before-you-buy.html
- BoatUS Foundation "Bass Boat" (CC-BY, unverified details): https://sketchfab.com/3d-models/bass-boat-147d601e20514b2a877cbf99005c4000
- vessel.js (MIT): https://github.com/shiplab/vesseljs
- TurboSquid licence: https://www.turbosquid.com/licensing · CGTrader Royalty Free vs Editorial:
  https://help.cgtrader.com/hc/en-us/articles/360015193418-What-is-the-difference-between-Royalty-Free-and-Editorial-licenses
