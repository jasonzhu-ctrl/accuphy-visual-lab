# The lake scene: one version or several? (Lab HQ research, 2026-10-27)

Jason, 2026-10-27: "我们现在的声纳画面，还有湖景的 effect，好像在不同的 agent 窗口下面版本是有不一样的……湖上的这个场景，船和湖……
effect 也好，声纳画面也好，声纳画面背后的成像逻辑，这些应该只拥有一个版本。冰钓的场景是另外一回事。" Research only; nothing changed.

## Finding 1: the code is one version

- There is one lake folder, `src/experiments/2026-09-23-sonar-lake-3d`, on one branch, `main`. Every page is built from it:
  the lake (`/`, `/mini/`), the ice page (`VITE_SCENE=ice`), and the test pages (`2026-10-24-sonar-fish-echo` = `lab="fish"`,
  `2026-10-26-sonar-pano-echo` = `lab="pano"`), which are one-line wrappers.
- No chat has its own copy of the lake code. The cloud chat "电脑端完整版" only pushed one backlog note
  (`origin/claude/modest-keller-ccfnhq`, merged). The other branches are old ice experiments from 10-16/10-17
  (`wip/ice-camera`, five `worktree-agent-*` folders) and the 10-23 case-study research. None of them is used by a page.

## Finding 2: the links show nine different moments of that one code

| Link | Who sees it | Built from | What it shows that the others don't |
|---|---|---|---|
| **lab.accuphy.ca** (the store page frames it) | customers | 50ad8ca, 10-25 | the oldest lake on a public link: before the new water (#161–#165), the new wake (#166), the new fish (#170) |
| friends' link `/`, `/mini/` | friends, Jason | 8449845 (3700815), 10-26 | FFT wind sea, Kelvin wake, new fish, old Panoramic |
| friends' link `/ice/` | friends, Jason | e436506, 10-26 | the ice page with the jig mark fixed |
| `/pano/` test page | Jason | 2d48393, 10-26 | the new Panoramic (sound picture) |
| `/jig/` test page | Jason | 218e483, 10-27 | the 110 ft hole and the jig drop |
| private preview `VxxnVnZr8cxQLXw3iizMdD` | Jason | 1c0ba1c, 10-24 | the lake at #156: **round wake rings**, the older sea. This is what "电脑端完整版" showed him |
| private preview `RnCBYTexY5vcEqJy2hAsN7` | Jason | ac67cb4, 10-24 | the lake at #152 |
| private ice preview `G5uZM8imcgsQNzoKfPkiMa` | Jason | ac67cb4, 10-24 | the ice page at #152 |
| local `main` | the chats | today | everything above, plus the ad-only dev hooks |

So "different versions in different windows" = different chats showed Jason links built on different days.

## Finding 3: inside the code, two things still exist twice

1. **Panoramic:** the old plan-view photo (all live pages) and the new sound picture (#171, `/pano/` only), chosen by
   `panoMode` in `index.jsx`.
2. **Fish in the sonar:** the new fish from the bodies (#153/#170) everywhere, but the old mark code (#120) is still there
   for the ice page's jig.
- The boat wake exists once (Kelvin, #166). The round rings Jason wants back (#156) were removed in #161; bringing them
  back is a change, not a switch.
- The ad recordings use dev-only hooks (`camOverride`, `adClean`, `adBeam`, `adFlash`). They never reach a built page.

## Plan (for Jason; nothing done)

1. **One owner of the lake scene and the sonar imaging:** "冰钓版本视觉效果". Other chats (phone page, 电脑端完整版, the
   ad work) ask it, they don't change the lake or the sonar themselves. The ice scene stays a separate scene on the same
   engine (#94), also owned by that chat.
2. **One written canon** of the lake, `docs/lake-canon.md`: one line per element and the decision behind it (water #165,
   wake, fish #170, Panoramic, terrain incl. the hole #172, colours, the sonar look #148). Open picks are marked as open.
3. **Remove the second copies** once Jason has picked: Panoramic keeps one drawing; the test-page switches go.
4. **One build for every link:** rebuild `/`, `/mini/`, `/ice/` from the same commit; retire `/pano/` and `/jig/`;
   update or delete the three old private previews; `docs/versions.md` shows one "current lake" line.
   lab.accuphy.ca follows the same commit only when Jason says 动 in Lab HQ.
5. Housekeeping: delete the stale ice worktrees and branches from 10-16/10-17 (nothing uses them).

Open picks that decide the canon: the new Panoramic (Jason's phone compare), the round wake rings (Jason said he likes
them; needs 动), the 110 ft hole (dig or 79 ft), how visitors drop a jig.

## 中文摘要（给 Jason）

- **代码只有一份。** 湖、船、声纳成像全在一个文件夹、一条主线上，没有哪个聊天自己另有一份。
- **不一样的是链接。** 9 个链接是在不同的日子打包的：顾客看到的 lab.accuphy.ca 是 10-25 的，最旧；“电脑端完整版”给你看的私人预览是 10-24 的（所以有圆形水纹、没有新风浪）；朋友链接是 10-26 的；/pano/、/jig/ 是今天的测试页。
- **代码里还有两样东西各有两份：** 全景（旧的拍照法 + 新的声音的图）、鱼的旧画法（只剩冰钓 jig 在用）。
- **方案：** 湖和声纳只归冰钓聊天一个人改；写一份“湖的标准版”清单；你定完全景、圆形水纹、深坑之后删掉旧的那份；所有链接从同一次提交打包，旧的预览和测试页收掉；lab.accuphy.ca 等你说“动”再跟上。
