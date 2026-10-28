# Lab 视觉优化：产品、状态、事件与链接保留契约

本契约的源码基线为 `5c576fbc18cc13f979952393a97128b26c7b3ae8`（2026-10-28）。本轮优化夏季湖面光学观感；产品模型、声呐成像逻辑、交互状态和既有埋点口径保持不变，冰钓作为共享引擎回归项。本文记录当前实现与验收边界，不替代 [lake-canon.md](lake-canon.md)、[decisions.md](decisions.md) 或真实产品规格来源。

## 1. 源码地图与改动边界

以下 `lake/` 指 `src/experiments/2026-09-23-sonar-lake-3d/`。

| 层 | 入口与职责 | 本轮保留要求 |
|---|---|---|
| 产品与扫描体积 | `2026-09-23-sonar-beam/devices.js`；`2026-09-23-beam-shapes-3d/wedge.js` | 型号、模式、角度、上下限、单位与几何不变；湖景使用 `wedgeSpecs`，不要把旧 2D `fanSpans` 当作湖景的运行路径 |
| 页面状态 | `lake/index.jsx`：`SonarLake3D`、`pickView`、`autoDepthFt`、共享 `state.current` | 保留船位、探头 apex、specs、rangeM/depthM、模式、增益和状态联动 |
| 场景与水面 | `lake/Scene.jsx`、`lake/lakeFFT.js` | 可调整夏季视觉分支；保留 FFT 风浪和圆形船迹（#165、#175），不得恢复 Kelvin 船迹或夏季 jig |
| 场景材质与声呐通道 | `lake/lakeMaterial.js`、`lake/SonarScreen.jsx`、`lake/sonarShader.js` | `uSonarPass` 在多个成像通道间切换；水面/空气视角调色不得进入声呐通道或改变鱼体回波、深度/遮挡关系 |
| 地形与生态 | `lake/terrain.js`、`fish.js`、`fishGeometry.js`、结构物模块 | 不改地形、鱼种/数量/尺寸/轨迹、沉船、石头、110 ft 深坑等模型数据 |
| 设备显示与入口 | `lake/SonarChrome.jsx`、`lake/home/AppHome.jsx` | 保留每个型号和模式的真实可用操作；Mini Forward 不显示大深度读数（#181） |
| 冰钓 | `2026-10-16-sonar-ice-3d/index.jsx` → 同一个 `SonarLake3D scene="ice"`；`lake/ice*`、`IceCamp.jsx` | 保留 Mini、打孔/换孔、jig、`signal` 与声呐同步；不得把夏季视觉设置无条件用于冰钓 |
| 事件及商品链接 | `lake/embed.js` | `labEvent`、`shopUrl`、`openShop` 均在此文件，无独立 `shopUrl.js` |
| 发布入口 | `share/main.jsx`、`share/embed.jsx`；`scripts/build-share.mjs`、`scripts/build-embed.mjs` | public share 与原生 mount 是不同产物；部署时保留 `pages/home/` 图片目录；不得把压缩公开 HTML 作为正式源码修改 |

## 2. 产品与物理状态基线

这些是源码中的仿真配置，不是重新核实过的硬件性能声明。真实规格仍按 `CLAUDE.md` 指向的网站项目规格维护。

| 型号 | beamDeg / displayBeamDeg | 厚度 | 最大 range / depth | 夏季可用模式 |
|---|---|---|---|---|
| PL / PingLive | 135° / 未单列 | 20° | 240 / 240 ft | Down、Forward、Panoramic |
| PLM / PingLive Mini | 39° / 43° | 18° | 200 / 200 ft | Down、Forward、Combo |

- Mini 的真实/显示角度差异是既有设计，不得在视觉清理中统一。冰钓说明文字可能显示 20°，引擎 18° 不随文字变化；以代码和决定区分显示与模型。
- 世界坐标单位为米，`FT = 0.3048`；x 向前、y 向上、z 向侧面。船拖动目标限制为 x/z 各 ±58 m，场景、探头与声呐共用该状态。
- Down 使用 AUTO depth 作为实际量程；Forward 使用手动横向范围与共享 AUTO depth；Panoramic 不参与 AUTO depth；Mini Combo 使用既有 40–160 ft 档位算法。Forward AUTO 是否继续保留在 canon 中仍为 OPEN，本轮保持现状。
- AUTO 按探头下方 `depthAt(apex.x, apex.z)` 选档，让湖底约占显示高度 80%；每 200 ms 更新，变深立即更新，变浅稳定超过 1.5 s 后更新。
- 英制和公制各有自己的深度档位。因此切换 ft/m 可改变实际显示范围，不只是标签；不得以“物理范围必须完全相同”误判原行为。
- `wedgeSpecs` 的 Forward 上缘贴近水面，Mini Combo 是 Down/Forward 两个扇体；Live Ice 与引擎保留的 Ice 使用 Mini Down 扇体。后续 `index.jsx` 按声呐画面范围裁剪几何，这层不能因重做水面而删除。

## 3. 实际支持的操作路径

| 场景/布局 | 当前入口与操作 | 不能宣称已有的能力 |
|---|---|---|
| 夏季桌面 | 面板 Device / View / Range、ft/m、三步引导、拖船、商品 CTA | 仿手机内部的按钮不是全部可操作；部分只进入提示或开发入口 |
| 夏季手机竖屏/横屏 | 先在 Home 选可用型号/模式；开始后声呐与波束出现；暂停、增益 ±、深度 ±、适用模式的范围 ±；横屏支持湖面/声呐大小切换 | 磨砂 Home tile 不等于可用模式；夏季 Live Ice tile 不会跳转冰钓页 |
| 冰钓 | 固定 Mini；Live Ice、Forward、Down、Combo；冰钓镜头/孔位/jig 逻辑 | `ice`（2D Ice Fishing）仍有引擎分支，但不在 `ICE_MODES` 和公开 Home 可用集合中；夏季手机 appCtl 不适用于冰钓 |
| 构建差异 | 开发工具仅在 DEV + 对应参数时出现；public share/embed 设置 `VITE_NO_GATE` | 开发页注册门行为不能作为正式 share 页面行为；内嵌 signup 代码存在不证明订阅链路启用 |

手机 gain 当前从 40% 开始，范围 30%–100%；手动 depth ± 会关闭 AUTO。这些属于交互数据契约，不能被界面调整覆盖。暂停不等于清空状态或重建场景。

## 4. 埋点契约与历史口径

`embed.js` 的公开通道保持如下形状，数据不包含个人信息：

- 原生主题：`Shopify.analytics.publish('accuphy:lab', { event, ...data })`。
- iframe：父窗口 `postMessage({ source: 'accuphy-lab', event, data }, '*')`。来源验证由网站父页面承担；生产父页面当前检查准确的 iframe window 和 origin。
- 两种路径都另发本地 `CustomEvent('accuphy-lab', { detail: { event, data } })`，供加载遮罩等使用。独立页面没有上述接收者时只保留本地事件。

| 事件 | 源码载荷/调用入口 | 既有含义 |
|---|---|---|
| `ready` | `{}`；`Scene.jsx` Canvas `onCreated`；once | WebGL context 已创建，不代表画面稳定或性能达标 |
| `first_drag` | `{}`；`Scene.jsx` 拖动层 `onPointerDown`；once | 首次按下/轻触，无位移阈值，不代表已完成一次拖动 |
| `view` | `{ view, product, source }`；`index.jsx` `pickView` | 用户 Home / panel / step 选择；不为初始默认视图上报；重复点同一项仍可上报 |
| `shop_click` | `{ product, placement, lang }`；`openShop` | 先记录商品跳转意图，再等待 150 ms 导航；无 variant/cart 操作 |
| `share` | `{ channel }`；`ShareButton.jsx` | 系统分享或复制等路径；受 extras 开关控制 |
| `app_badge` | `{ store }`；`AppBadges.jsx` | 应用商店图标点击；受 extras 开关控制 |
| `signup` | `{ source: 'gate' }`；`SignupGate.jsx`；once | Lab 门的成功回调；不是网站 Klaviyo 表单的 `lead` |

`product` 是 `pinglive-sonar` / `pinglive-mini`。网站桥接中的 `device` 表示访问者 mobile/desktop，不能再用它携带声呐型号。当前生产父页面白名单只含 ready、first_drag、view、shop_click、signup；share/app_badge 的源码调用存在不等于有后端统计。父页面还会筛选字段，不能以子页面 payload 推断报表全部维度。

`once` 按事件名保存在模块级 Set，发布前即记为已发送。接收端异常不会自动重试，也不会从原生发布再补发 iframe；重复 once 调用连本地事件也不再分发。这是现状，不是送达保证。原生卸载再挂载同一模块也不会自动清空该集合。

**已确认的语义风险，不在此次视觉改动中修复：** `pickView` 先上报请求模式，设备切换后的 effect 才把不支持的模式纠正为 Down。例如 PL Panoramic 切到 Mini，事件可先写 Mini/Panoramic，实际最终为 Down。将来修复需独立记录口径影响；不能静默重命名事件、改变 first_drag/ready 定义、加重试或改去重方式。

## 5. 商品与嵌入接口

- 映射在 `embed.js` 的 `PRODUCT`：PL → `pinglive-sonar`；PLM → `pinglive-mini`；未知 id 当前回退 Mini。
- `shopUrl` 使用挂载设置 `shop`，缺省时读取 `?shop=`；规范化空白和大小写，只接受市场根路径（如 `/`、`/fr`、`/en-us`、`/fr-benelux`）。缺失或无效时按导入时的 `?lang=fr` 回退 `/fr`，否则无语言前缀。
- iframe origin 优先 ancestorOrigins、其次异于子页面的 referrer origin，最后 `https://shop.accuphy.com`；原生主题用当前 origin。原生/iframe 内不添加 UTM，避免覆盖原广告归因。
- 独立 Lab 只转传已有 `utm_*`，没有时才使用既有 Lab referral 标签；不是复制 URL 中所有广告参数。`openShop` 先事件、后 150 ms 跳顶层窗口；顶层拒绝时退回当前窗口。
- `share/embed.jsx` 导出 `mount(el) → { unmount() }`。`data-shop/data-market/data-lang` 被传入 `setEmbedOptions`，当前链接实际使用 `shop`；语言仍来自模块导入时的 URL。不能宣称 data-lang 已动态切换语言。
- 当前原生 loader 使用 `data-lab-mounted` 防止重复挂载，但不会负责主题 section unload/load 重挂载。这是将来原生 Shopify 接入的独立事项，不能用离线模块测试宣称已完成主题编辑器兼容。

## 6. 版本证据、测试与未验证项

2026-10-28 的公开快照独立保存在本次工作区输出 `D:\shopify\output\accuphy-baseline`，不提交这些压缩产物作为应用源码。演示等于公开构建提交 `bb1aa317c80f502cd210776c909340879f0ce2e3`（其提交说明称源 `1fc1678`）；生产 `lab.accuphy.ca` 等于 `ccac5831e77f5a6f70fc8471f5139591376b34de`（说明称源 `9ed9341`）。字节相等已核实，私有源码来源仍未通过重建复现。此处正式源码基线 `5c576fb` 不应称为线上同一版本。`docs/versions.md` 的部分旧描述仍把所有链接写成 9ed9341；查版本时应结合其表格与独立 hash 证据，不以旧句子推翻现场证据。

离线语义回归：

```sh
node --test scripts/dev/lab-contract-test.mjs
node scripts/dev/shop-url-test.mjs
```

新测试直接导入产品、wedge、embed 模块。只在 Node loader 内把 Vite 的 `import.meta.env.DEV` 设为 false，文件和其余业务代码不变；window、计时器、事件接收器均是假对象，fetch 被禁止。测试覆盖扫描体积不变量、产品模式、原生/iframe 发布优先级与载荷、once/异常语义、origin/UTM 与延迟导航。既有 shop-url-test 的 16 个市场案例继续单独运行。

2026-10-28 本轮实际执行（Node v24.20.0）：新增语义测试 **22/22 通过**；既有商品链接测试 **16/16 通过**。测试未向 Shopify、Meta、Klaviyo 或其他网络目的地发送请求。

这些测试**不覆盖** React 的交互路径与事件时机、GPU 像素、AUTO 异步状态、真实手机或网站后台。视觉验收仍按 `.claude/skills/sonar-qa/SKILL.md` 与 lessons：锁定相同船位、型号、模式、实际 depth/range、时间和参考版本；夏季 6×6 与冰钓共享引擎回归、桌面/手机和适用的 Safari 检查。历史文档的帧率/亮度数字不是本轮测量结果。

历史 Shopify/Meta/Klaviyo 数据、事件送达、真实 consent 行为、真实设备性能尚不能由本契约证明。此次不迁移、删除或重置这些后台数据，也不改变接收目的地。
