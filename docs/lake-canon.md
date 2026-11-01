# The lake: the one standard version (canon)

Jason, 2026-10-27: the lake scene (boat and lake), its effects, the sonar picture and the imaging logic behind it exist as
**one version only**. The ice scene is separate but runs on the same engine (#94). Decision #176.

- **Owner:** the chat "Lab 场景和声纳画面Base" is the only chat that changes the lake scene or the sonar imaging. Other chats
  (Lab HQ, 手机网页端, 电脑端完整版, ad work) send it what they need. They never edit the lake folder themselves.
- **This list is the canon.** One line per element, with the decision behind it. A change to the lake updates its line in the
  same commit. An element marked **OPEN** waits for Jason.
- **Every link is built from one commit.** `docs/versions.md` holds one "current lake" line. lab.accuphy.ca follows that
  commit only when Jason says 动 in Lab HQ.
- Code: `src/experiments/2026-09-23-sonar-lake-3d/`. Test pages are one-line wrappers. They add no lake code of their own.

## Lake scene

| Element | Canon | Decisions |
|---|---|---|
| Water surface | FFT wind-sea spectrum, ABYSSAL look | #165 (after #162–#164) |
| Sky in the water | real photographed sky, sun glitter path, clouds | #161, #162 |
| Boat wake | **round rings** spreading from the hull while it moves (in, 2026-10-27) | #175 (replaces #166's wake) |
| Drag cue | reticle on the water, ripple every 2.6 s, back once the boat stops | #132, #160, #166 |
| Water column from above | tints the bottom with depth | #156 |
| Terrain | deep floor 24 m (79 ft); a 110 ft hole at (−22, −45) | #64, #172, #174 |
| Rocks | Shield boulders, six shapes | #131 |
| Wrecks | small wreck = workboat with three decks and a wheelhouse | #155 |
| Fish | bodies by species, spread realistically (#173 round 3: between rounds 1 and 2); bass drawn 1.5×; three lake trout at ~92–99 ft in the 110 ft hole; nearby fish swim into a beam below its minimum, in by about 10 s (test version; the yellow perch and one crappie group moved from the west shelf to the empty east flat) | #170, #173, #174, #193, #198 |
| Lake jig | **none** on the summer lake | #174 |

## Sonar imaging

| Element | Canon | Decisions |
|---|---|---|
| Echo texture | every return is a short arc across the beam (`arcGrain`) | #148 |
| Structure | echo splat of every surface; bright cores, orange rims, solid targets hide the bottom | #135, #143–#147, #149 |
| Bottom | one filled band; far bottom softer and weaker, never gone | #140, #152, #154 |
| Fish in the sonar | drawn from the fish bodies, as the transducer hears them; far fish at long range held at a steady middle size | #153, #170, #177 |
| Panoramic | **the sound picture**, the only one (Jason 10-27): the vertical views' pipeline with the fan laid flat. Hot rocks, soft dark-crimson shadows instead of black lanes, no rings, fish as smooth dashes (`uPanoK`). The plan view and `/pano/` are deleted | #171, #178 |
| Forward AUTO depth | **OPEN** | #154 |
| Mini views | four views, the rest frosted; Combo has two ranges moved on their own (Forward, Down), AUTO until moved; Forward shows no depth readout | #121, #124, #181, #189 (replaces #125) |

## Known second copies (to remove)

- **Panoramic:** done. The plan view (`panoMode`, `topRT`, its marks and shadows) is deleted (#178).
- **Old fish marks (#120):** kept only for the ice page's jig. That is the ice scene, so it may stay, but only on the ice
  path.
- **Kelvin wake (#166):** removed with its wake map (#175).
- **Lake jig (#172):** removed by #174.

## 中文摘要（给 Jason）

- 湖景和声纳成像只有一个标准版，就是这张清单。只有“Lab 场景和声纳画面Base”（原冰钓聊天，#195）能改湖和声纳，别的聊天要改就告诉它。
- 已定：风浪水面、真实天空倒影、**圆形水纹**、110 ft 深坑、新鱼、夏天湖面不放 jig、**全景用声音的图**（旧画法已删）。
- 还等你定：Forward 的 AUTO 深度留不留。
- 所有链接都从同一次提交打包；lab.accuphy.ca 要你说“动”才跟上。
