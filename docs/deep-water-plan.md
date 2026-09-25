# Deep water shallower — plan (2026-09-25, planning only)

Jason: "我觉得是我们额深水太深了 你感觉呢 要不要规划把深水浅一点 先别动 思考 然后规划
尽可能避免错误". Nothing here is built until Jason says go.

## 1. Where the 40 m comes from

Jason asked for "a natural slope down to 40 m" (decisions #14–#16) for a dramatic drop-off.
`terrain.js` takes every point past the drop-off edge to 40.0 m (dead flat), with the rim
beyond the play area at 42 m. About 20 % of the ±60 m play area is deeper than 30 m. The
ACCUPHY LAB lockup (#61) and the big wreck (#62) both lie on that 40 m floor.

## 2. Why 40 m hurts the page

| Effect | At 40 m |
|---|---|
| AUTO depth scale on the phone | 180 ft (55 m): the wreck's 4.2 m hull is 8 % of the screen height (the app recording: ~31 %) |
| 3D view | the lockup and the wreck are faint through 40 m of water |
| Panoramic (PL) | the flat 5°–25° fan first meets a 40 m floor 86 m out, beyond most ranges: almost no bottom in the deep |
| Mini Forward | the bottom only enters the fan 46 m ahead (1.15 × depth) |
| Real use | the buyers are northern, portable, often ice anglers (`docs/users-and-market.md`): mostly 3–25 m, lake trout 15–30 m |
| Calibration | every app recording we match against was made in 5–18 m |

So yes: 40 m is too deep for a showcase.

## 3. What a shallower deep floor buys (computed, `terrain.js` with only the deep value changed)

| Deep floor | AUTO depth there | wreck hull on screen | Panoramic sees the floor from | Mini Forward sees it from |
|---|---|---|---|---|
| 40 m (now) | 180 ft | 8 % | 86 m | 46 m |
| 28 m | 120 ft | 11 % | 60 m | 32 m |
| **24 m (recommended)** | **100 ft** | **14 %** | **51 m** | **28 m** |
| 20 m | 90 ft | 15 % | 43 m | 23 m |

- 24 m (~80 ft) keeps a real drop-off below the 17 m plateau, is a true lake-trout depth, and
  gets most of the gain. Below 24 m little more is won (the plateau is already 17 m).
- **Honest limit:** no deep-floor value makes the wreck look like the tablet recording. That
  wreck lies in ~10 m, where the hull fills ~31 % of the height. For that, the wreck itself must
  lie in ~10–12 m (a separate decision, §6).
- The slope gets gentler: 17 → 24 m over the same width instead of 17 → 40 m. It stays fully
  on the screen instead of running off it.

## 4. The change (small)

`terrain.js`: one constant `DEEP_M = 24` replaces the 40 of the drop-off, and the rim becomes
`DEEP_M + 2`. The edge line, the shelf, the plateau, the hump and the basin positions do not
move, so the deep share of the lake stays the same.

## 5. Risks and how each is avoided

| Risk | What would go wrong | Guard |
|---|---|---|
| Vegetation reshuffles | timber, bushes and rocks are placed by seeded rejection sampling with depth bands (7–14 m trees, 5–30 m boulders, …). The new depths cross a band edge on ~3,500 of 14,600 grid points, so every later random draw shifts and the whole layout moves | keep the OLD depth function for the placement weights only (`layoutDepth`), so every item keeps its x/z; heights follow the new bottom |
| Logo / wreck not flat | they need level ground | both spots stay dead flat (they sit where the edge fade is complete); check the plinth and the hull sit right |
| Fish | lake trout "tight to the bottom", chinook through the column | depths are already relative to the local water depth; check no fish ends in the bottom, rerun the path check (0 crossings) |
| Calibration drift | the brightness tables in `sonar-style.md` §6.11 were measured on `?boat=4,-26` (now 27 m, would be 23 m) | rerun `__sonarHist(10)` on both standard scenes, compare with the table, retune only if a bin moves |
| Default first view | the opening picture changes (gentler slope) | before/after screenshots of the 3D view and the phone, for Jason |
| Dev aids | `?cam=wreck` uses absolute heights | update |
| Docs | #14–#16 say 40 m | a new decision records the change and supersedes them; backlog and handoff updated |

Also check: Panoramic and Mini in the deep (they should now show bottom), the ACCUPHY LAB
sonar check (`?boat=-14,-62.5`, range ≥ 140 ft), and no console errors.

## 6. Next question after this: the wreck's depth

Even at 24 m the wreck is a low shape on the phone (14 %). To look like the recording it needs
~10–12 m of water. The lake has no flat 10–12 m area (the plateau varies ±5 m), so it would need
a small flat bench shaped where it lies, or a spot on the plateau near the drop-off (wrecks often
rest on a drop-off). Jason's call, after §3.
