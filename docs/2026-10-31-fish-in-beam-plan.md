# Fish in the beam: findings and proposal (not built)

Lab HQ, 2026-10-31. Jason asked for a conclusion on how to make sure a reasonable number of fish is in the beam when the
transducer looks at a spot, for PingLive and Mini and each view, without changing fish that are already there.
Nothing is built. The owner is the lake chat (#176), and building waits for Jason's "动".

## 方案（中文版，Jason 2026-10-31 确认的规则）

**目标：** 探头照到哪里，用户都能在波束里看到合理数量的鱼。PingLive 和 Mini 的每个视图都适用，夏天湖和冰面都适用。

**每个视图的鱼数：**

| 视图 | 波束里的鱼 |
|---|---|
| Mini Down | 3–5 条 |
| Mini Combo 的 Down | 至少 3 条（上限先按 5 条） |
| Mini Forward（Combo 同样） | 3–5 条 |
| PingLive Down | 4–8 条 |
| PingLive Forward | 4–8 条 |
| Mini Panoramic | 4–8 条 |
| PingLive Panoramic | 6–10 条 |

**规则：**

1. 已经在波束里的鱼完全不动，继续按原来的方式游或停。
2. 鱼不够时，附近的鱼自己游过来，约 10 秒到位。
3. 游过来要自然：慢慢加速，快到时减速，走缓弯线，先转头再游，不能冲进来。
4. 够数就不再叫鱼，超过上限也不赶走。
5. 拖船时不叫鱼，船停下才开始。
6. 页面打开时，开场位置就先有够数的鱼。
7. 不加鱼，不加宽波束，不改鱼的种类和大小，不改声纳成像。

**已知限制：** Down 波束附近的鱼少，第一条约 10 秒到，3 条到齐可能要 20 秒以上，以测试版实测为准。

**影响：** 夏天湖和冰面共用这段代码，两边都要检查；之后新录的广告鱼会更多，已录好的片子不变。

**状态：** 还没做。Jason 说“动”后，由“冰钓版本视觉效果”做测试版；线上要 Jason 在 Lab HQ 另说“动”。

## What the lake does today

- There is no logic that brings nearby fish to the beam. Fish loop around fixed home points in `fish.js`.
- What exists: in summer, lake trout, salmon and bass within 12–16 m of the transducer and 7 m of the sonar plane may rise
  toward it for about 6–14 s, with a 20–50 s cooldown. Under the ice, the jig draws fish. Both are short reactions.

## Measured: fish in the beam (135 fish, smelt excluded)

Node model on the current fish code, 3 minutes per spot, positions only. Boat-triggered rises are not included.
Grid: 64 spots across the lake.

| View | Default desktop spot | Grid: spots with fish under half the time | Fish within 20 m (median) |
|---|---|---|---|
| Mini Down | 0, never | 86 % | 12 |
| Mini Forward (80 ft) | 0, never | 69 % | 16 |
| Mini Combo Down | 0, never | 86 % | 12 |
| Mini Combo Forward (150 ft) | 1, always | 39 % | 19 |
| PingLive Down | 0, 45 % of the time | 67 % | 11 |
| PingLive Forward (80 ft) | 0, 5 % of the time | 48 % | 15 |
| PingLive Panoramic | 2, always | 33 % | 15 |
| Mini Panoramic | 0, never | 70 % | 16 |

Conclusion: the lake has enough fish close by. They are just rarely inside the beam. The fix is to move a few nearby fish,
not to add fish or widen the beam.

## Proposal

**Target per view** (Jason 2026-10-31):

| View | Target |
|---|---|
| Mini Down | 3–5 |
| Mini Combo Down | at least 3 (upper limit taken as 5) |
| Mini Forward, Combo Forward | 3–5 |
| PingLive Down | 4–8 |
| PingLive Forward | 4–8 |
| Mini Panoramic | 4–8 |
| PingLive Panoramic | 6–10 |

**How it works:**

1. Every 2–3 s while the boat is still, count the fish in the active beam, excluding smelt.
2. Below the target's minimum: pick the 1–2 nearest free fish at a suitable depth, nearest first, and let them cruise in,
   clear of structure, using the existing path checks. Jason 2026-10-31: about 10 s, natural, no darting in: speed about
   1 m/s at most, eased in and out, on a gentle curve, the nose turning first. Fish from further away take longer.
3. A visiting fish stays around for 30–60 s in its normal loop, then may wander off, only if the count stays at the minimum.
4. Fish already in the beam are never touched.
5. At or above the minimum nothing happens. Nothing is pushed out above the maximum.
6. While the boat is dragged nothing is called. It starts when the boat stops, and the first fish arrives in about 10 s.
7. On page load, before anyone sees the lake, the opening spot starts with fish already at the minimum, so the first view is not empty.

Keeps: fish species, sizes, behaviours and rises, the jig under the ice, true beam angles, the sonar imaging.

## Risks

- Lake and ice share this code (#94), so both need a QA pass.
- If it runs too often, fish look like they follow the boat. The slow speed, the 25 m limit and the small numbers guard against that.
- New ad captures would show more fish. Finished films do not change.
- Within 10 m of the Down beam the median is only 2 fish, so the first fish comes in about 10 s and the rest of a minimum of 3 takes longer.
- Jason judges them by eye on a test link.
