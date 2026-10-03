# Desktop: range on the phone, and the phone's size (proposal, 2026-10-03)

Planning only; waits for Jason's go. It is the desktop counterpart of #78/#79, which did this on phones.

## 中文摘要（给 Jason）

**你要的**：电脑版也像手机版一样，把操作面板里的 Range 去掉，改成直接按手机屏幕里 APP 自己的 −/+；评估电脑上的手机该多大；加减号适当放大，但不破坏整体协调。

**评估结果**
- **真手机有多大。** iPhone 16 Pro Max 横过来宽约 16.3 cm（6.4 英寸），在不同屏幕上：
  - 笔记本（MacBook 等，每英寸约 127 个网页像素）：约 815 像素宽，占屏幕宽 57%、高 44%，会挡住大半个声纳波束和湖面，太大了；
  - 24 寸显示器（1080p）：约 590 像素，正合适。
- **现在的大小**是 `min(38vw, 560px)`：笔记本上约为真机的 67%，24 寸显示器上约 95%。
- **建议**改成 `min(42vw, 600px, 屏幕高度的 40%)`：
  - 笔记本上约为真机的 74%（比现在大约 10%），湖面仍然看得清；
  - 24 寸显示器上基本就是真机大小（约 102%）；
  - 屏幕矮的时候不会超过屏幕高度的 40%。
- **加减号**：按 #79 手机版的做法，整组 APP 按钮（range、gain、暂停、返回、⋯）一起按比例放大，电脑上约 1.3 倍，这样 APP 的比例不变：
  - range 的圆圈从约 16 像素变成约 23 像素，点击范围约 44 像素，−/+ 之间拉开一些；
  - range 按钮全白、可以按；其他按钮保持变暗、只做展示（点了照旧弹注册框）；
  - Down 视图下 range 是 AUTO，加减号变灰，和现在一样；
  - Combo 视图里真实 APP 的屏幕上本来就没有 range 按钮，所以这里也不显示，沿用之前的 range（和手机版一致）。
- **面板**：只剩 Device 和 View 两行，更干净。

**工作量**：很小，大约 1 小时，加上桌面和手机两种尺寸的检查。这些文件和手机版（#78/#79）是同一批，本地那个对话正在改，所以建议由它来做；或者先把我这个分支合进 main，再由我做。

## Context (for Claude)

Jason, 2026-10-03: "把这个……现在电脑版我们的操作面板里面的 range 的设置的调整我们把它直接做进到手机里面来也就是还原到这个手机里的
APP 让 APP 的这个加减号……把这个还原回来然后这个手机的尺寸你也可以看一下对于电脑来说是不是有必要把它现在的尺寸更加还原的像真实的手机那个大小
当然可以小一点……你去评估一下什么尺寸最合适然后这两个加减号……可以适当调整一些大小在不破坏整体界面的协调跟美观上面".

**Code today** (main `1e1dbe3`):
- `index.jsx`: `onRange={phone ? stepRange : undefined}`. The frame class is `sm:w-[min(38vw,560px)]`. The desktop
  hint reads "use the panel to change the view".
- `SonarChrome.jsx`:
  - `const S = phone ? 1.55 : 1`;
  - `gapPM = phone ? '6cqh' : '2.2cqh'`;
  - the range group sits at `left: phone ? '23%' : '19%'`;
  - `LiveCtl` (live) vs `LockedCtl` (display-only, opens the sign-up gate, #38).
- Range steps (#78): 20 · 30 · 40 · 50 · 60 · 70 · 80 · 100 · 120 · 150 · 180 · 200 · 240 ft, up to the device maximum.
  They are greyed in Down (AUTO). Combo (`split`) shows no range controls, as in the real app
  (`docs/app-chrome.md`: Live Combo has only ⏸ and back/⋯).

**Measurement** (2026-10-03). The page was mocked with injected CSS only, and the frame measured with
`getBoundingClientRect`. A 16 Pro Max is 163 × 77.6 mm, which is 6.42 in wide in landscape.

| Viewport (assumed CSS px per inch) | A today: min(38vw, 560px) | B proposed: min(42vw, 600px, 83.2vh) | C true size |
|---|---|---|---|
| 1440×900 laptop (≈127) | 547×263 px: 67 % of real, 38 % of width | 600×288 px: 74 %, 42 % of width, 32 % of height | 815×392 px: 57 % of width, 44 % of height (covers the beam) |
| 1920×1080 24″ monitor (≈92) | 560×269 px: 95 % | 600×288 px: 102 % | ≈ 590 px |

Other common sizes under B:
- 1280×720 at 150 % (≈105 px/in): 538 px, ≈ 80 %;
- 1536×864 at 125 % (≈113 px/in): 600 px, ≈ 83 %;
- 1728×1117 MacBook Pro 16 (≈127 px/in): 600 px, ≈ 74 %;
- 2560×1440 27″ (≈109 px/in): 600 px, ≈ 86 %.

The height term (40 % of the viewport height × 2.08) only bites on short windows.

## Build (when Jason says go)

1. `index.jsx`:
   - pass `onRange={stepRange}` on every layout;
   - remove the Range row from the desktop panel (Device and View stay);
   - frame class `sm:w-[min(42vw,600px,83.2vh)]`;
   - desktop hint text: "the range −/+ work".
2. `SonarChrome.jsx`:
   - `const S = phone ? 1.55 : 1.3`, so the whole control set scales together (#79's rule: keep the app's proportions);
   - desktop `gapPM` ≈ `4cqh`, so − and + sit further apart;
   - keep `LiveCtl`'s ≥ 42 px hit area;
   - add a hover state on desktop (brighter ring, `cursor: pointer`).
3. Keep as they are:
   - Down greys the range buttons (AUTO);
   - Combo shows none;
   - the other app buttons stay `LockedCtl` and still open the sign-up gate;
   - the share build (no gate) keeps the hint behaviour.
4. **Checks:**
   - 1440×900, 1920×1080 and 1280×720: no overlap with the step cards or the panel; the beam footprint is still visible;
     range + steps 80 → 100 → 120 ft.
   - Down shows AUTO and greyed buttons; Combo shows no range controls.
   - 390×844 is unchanged (#78/#79).
   - No console errors, and the build passes. Rebuild the public link only on Jason's ask (`lab-test-link`).

**Coordination.** These are the files the local phone-layout chat edits (#77–#81). Either that chat builds this, or this
branch is merged into main first (PR on Jason's OK) and then built here, so the two never edit the same lines in
parallel.
