状态：DONE（Lab HQ 核对 + 改法，2026-10-31；改动等 Jason）
From：项目总管 | CHIEF Agent（IT/CHIEF Agent）   To：accuphy-visual-lab HQ（local_1022478a）   创建：2026-10-31   编号：X-27

# 夏天面板的 Mini 波束写成了 39° × 18°，冰面写的是 39° × 20°

## 背景

Klaviyo HQ 10-31 晚只读核线上 Lab（e01 要录线上版动图）时发现：夏天面板写 Mini 39° × 18°，冰面面板写 39° × 20°（Klaviyo 提交 7783e43）。

总管查了：
- `accuphy-website/docs/specs.md` 第 29 行：Mini 波束 `39° (live view) × 20°`。规矩是数字只从 specs.md 取。
- `src/experiments/2026-09-23-sonar-lake-3d/index.jsx:443`：文字用 `${ICE ? 20 : device.thickDeg}°`，夏天走 `devices.js` 的 `thickDeg: 18`。旁边注释写的是“text only: specs say 39° × 20° for the Mini; the engine's 18° stays (Jason 2026-09-23)”，也就是说本意是文字都写 20°、画面里的波束形状保持 18°，但夏天那一支漏了。

## 补充（10-31 晚，总管）

Klaviyo HQ 提醒：10-31 下午另一套的 Lab HQ 回过一句“真实是 18°，specs 写 20°”。所以到底是 18° 还是 20° 还没定，**总管在问 Jason**。改法两种都写（A 全写 20°，B 全写 18° 并请网站改 specs），先不选。

## 任务

1. 核一下上面说的对不对（线上两个面板、代码）。
2. 写改法（只写，不改）：文字两边都显示 specs 的 39° × 20°，引擎 18° 不动。顺便看 `beam-shapes-3d` 的描述（写 39°×18°）线上有没有用到。
3. 写进 backlog，回报总管。上线照旧等 Jason 在 Lab HQ 说“动”。

## 不要做

- 不改引擎里 18° 的波束形状（Jason 2026-09-23 定的）。
- 没有 Jason 的“动”不上线。

## 回报

`X-27 | 结果 | 文件路径 + 提交号 | 需要谁做什么`，用 SendMessage 发给“项目总管 | CHIEF Agent”（local_88265dd9-3ef4-4076-8fbb-0aa0c44e209a）。

## 结果

Lab HQ 2026-10-31：
1. **核对属实。** `index.jsx:443` 的面板说明用 `${device.beamDeg}° × ${ICE ? 20 : device.thickDeg}°`，夏天湖走 `devices.js` 的 `thickDeg: 18`（PLM），所以夏天 Mini 显示 39° × 18°，冰面写死 20° 显示 39° × 20°。线上 lab.accuphy.ca/mini/ 的打包里同时有 `thickDeg:20`（PL）和 `thickDeg:18`（PLM），和代码一致。specs.md 第 29 行：39° (live view) × 20°。
2. **改法（只写，没改）：** 只改那一行文字，引擎不动：`beam: \`${device.beamDeg}° × ${device.id === 'PLM' ? 20 : device.thickDeg}°\``（PingLive 本来就是 20°，等于两边文字都按 specs 写 20°；冰面那支一起统一掉，不再单写 `ICE ? 20`）。`devices.js` 的 `thickDeg: 18` 和画面里的波束形状不碰（Jason 2026-09-23）。
3. **`beam-shapes-3d` 的描述（“PLM 39°×18°”）**：是开发用的实验目录说明（`meta.description`），线上打包的三页里搜不到，不对外显示。不用改；要改也可以顺手改成“39°×20° (drawn 18°)”。
4. **谁改：** `index.jsx` 这一行是面板文字，归“界面设计”（共用文件，先告诉对接和 Base）。随下一次测试版一起做，上线等 Jason 在 Lab HQ 说“动”。已记进 `docs/backlog.md`。
