# Lab 视觉优化：产品、状态、事件与链接保留契约

本契约的源码基线为 `5c576fbc18cc13f979952393a97128b26c7b3ae8`（2026-10-28）。本轮优化夏季湖面光学观感；产品模型、声呐成像逻辑、交互状态和既有埋点口径保持不变，冰钓作为共享引擎回归项。本文记录当前实现与验收边界，不替代 [lake-canon.md](lake-canon.md)、[decisions.md](decisions.md) 或真实产品规格来源。

分支：`codex/lab-clarity-optics`。交付范围、公开版本、Shopify 宿主证据及完整验收边界见 [lab-optimization-report.md](lab-optimization-report.md)。下表区分原有模型和本轮增加的展示/操作层，不把“保持原数据”解释成“界面代码完全不动”。

## 1. 源码地图与改动边界

以下 `lake/` 指 `src/experiments/2026-09-23-sonar-lake-3d/`。

| 层 | 入口与职责 | 本轮保留要求 |
|---|---|---|
| 产品与扫描体积 | `2026-09-23-sonar-beam/devices.js`；`2026-09-23-beam-shapes-3d/wedge.js` | 型号、模式、角度、上下限、单位与几何不变；湖景使用 `wedgeSpecs`，不要把旧 2D `fanSpans` 当作湖景的运行路径 |
| 页面状态 | `lake/index.jsx`：`SonarLake3D`、`pickView`、`autoDepthFt`、共享 `state.current` | 保留船位、探头 apex、specs、rangeM/depthM、模式、增益和状态联动 |
| 学习与无障碍操作 | `lake/LearningGuide.jsx`、`boatControls.js`、`controls-a11y.css`、`labExperience.css` | 课程调用既有 `pickView` 和预设；方向按钮/键盘写入同一个 target，沿用 ±58 m 边界及原船位插值，不建立第二套移动模型 |
| 大字模式选择 | `lake/ModeGuide.jsx`、`modeGuideCopy.js`、`mode-guide.css` | Beam 对应 `forward`；PL 第三档 Panoramic、Mini 第三档 Combo；只调用原选择路径，不冒出新的引擎模式 |
| 场景与水面 | `lake/Scene.jsx`、`lake/lakeFFT.js` | 可调整夏季视觉分支；保留 FFT 风浪和圆形船迹（#165、#175），不得恢复 Kelvin 船迹或夏季 jig |
| 场景材质与声呐通道 | `lake/lakeMaterial.js`、`lake/SonarScreen.jsx`、`lake/sonarShader.js` | `uSonarPass` 在多个成像通道间切换；水面/空气视角调色不得进入声呐通道或改变鱼体回波、深度/遮挡关系 |
| 地形与生态 | `lake/terrain.js`、`fish.js`、`fishGeometry.js`、结构物模块 | 不改地形、鱼种/数量/尺寸/轨迹、沉船、石头、110 ft 深坑等模型数据 |
| 设备显示与入口 | `lake/SonarChrome.jsx`、`lake/home/AppHome.jsx` | 保留每个型号和模式的真实可用操作；Mini Forward 不显示大深度读数（#181） |
| 加载与运行生命周期 | `lake/labLifecycle.js`、`SceneLifecycle.jsx`、`labMotion.js`、`SceneBoundary.jsx`、`loadingCopy.js` | 加载遮罩、上下文丢失提示、隐藏/离屏挂起与用户暂停分离；局部展示完成条件不得重定义或补发业务 `ready` |
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

本轮新增的学习预设会显式改变既有型号、模式、量程与目标船位，并给出反馈；它不是只换说明文字。新方向操作只改变共享 target、收起拖动提示，不产生 `first_drag`。隐藏/离屏挂起也不写用户的暂停开关。新增 UI 路径的浏览器验收与旧模型数据保留应分别报告。

**追加入口已实现并有本机浏览器操作证据：** 游戏式大字模式入口 `ModeGuide` 提供英/法文，PL 为 Beam / Down View / Panoramic；Beam 映射已有 `forward`，Mini 第三档使用已有 `combo`。它复用 `pickView(..., 'panel')`，不新增名为 beam 的引擎模式或事件值，首次手机 Home 选择流程保留。引导动画最多 4.2 s，点击后停止，Pause / reduced-motion 下无动画。`mobile-modeguide-events-final.json` 记录 PL 面板路径；补充 `range-label-and-mini-panel-final.json` 已捕获 Mini 大字 Combo 的 source=panel。CDP reduced-motion 检查的模式动画为 none、过渡 0 s。测试范围和投影后触控尺寸限制见报告，不把声呐快照当完整 UI 验收。

累计时间由 #184 的 `labMotion.js` / `SceneLifecycle.jsx` 保留：R3F 切换 frameloop 的时钟重置及未消耗帧把毫秒时间戳传入秒路径的竞态均有回归；挂起时同步清空待运行帧，暂停展示只执行零 delta 更新。鱼和冰钻孔的实际回调在暂停展示时不演化或消耗 RNG，必要显示 uniforms 仍更新；正常路径与基线的比较和真机验收分开记录。

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

2026-10-28 的 `gpu-final/records.json` 在 **before 和 after** 都记录到 `{ event: 'view', data: { view: 'panoramic', product: 'pinglive-mini', source: 'panel' } }`，相应最终状态为 `mode: 'down'`。因此这不是本轮引入的新组合，也不能称其已被修复。日志中的 `view` 当前表示选择请求；分析实际有效视图时不能无条件把它当最终渲染状态。该文件的 events 是累积记录，不应直接把各快照列表相加当事件总数。

## 5. 商品与嵌入接口

- 映射在 `embed.js` 的 `PRODUCT`：PL → `pinglive-sonar`；PLM → `pinglive-mini`；未知 id 当前回退 Mini。
- `shopUrl` 使用挂载设置 `shop`，缺省时读取 `?shop=`；规范化空白和大小写，只接受市场根路径（如 `/`、`/fr`、`/en-us`、`/fr-benelux`）。缺失或无效时按导入时的 `?lang=fr` 回退 `/fr`，否则无语言前缀。
- iframe origin 优先 ancestorOrigins、其次异于子页面的 referrer origin，最后 `https://shop.accuphy.com`；原生主题用当前 origin。原生/iframe 内不添加 UTM，避免覆盖原广告归因。
- 独立 Lab 只转传已有 `utm_*`，没有时才使用既有 Lab referral 标签；不是复制 URL 中所有广告参数。`openShop` 先事件、后 150 ms 跳顶层窗口；顶层拒绝时退回当前窗口。
- `share/embed.jsx` 导出 `mount(el) → { unmount() }`。`data-shop/data-market/data-lang` 被传入 `setEmbedOptions`，当前链接实际使用 `shop`；语言仍来自模块导入时的 URL。不能宣称 data-lang 已动态切换语言。
- 当前原生 loader 使用 `data-lab-mounted` 防止重复挂载，但不会负责主题 section unload/load 重挂载。这是将来原生 Shopify 接入的独立事项，不能用离线模块测试宣称已完成主题编辑器兼容。

只读核实的现有 Shopify 候选为未发布主题 `189709156525`，含 `layout/lab.liquid`、`sections/lab-embed.liquid`、`templates/page.lab.json`。其 `/pages/lab?preview_theme_id=189709156525` 确实返回该主题与 iframe，但 iframe 仍加载生产 `https://lab.accuphy.ca/`。候选缺生产的法语参数注入，`lead_form_ids` 为空；它不是本轮新构建或完整生产配置的验收环境。`189488890029` 的这三个文件明确不存在，不因旧文档或浏览器标签中的 ID 就把它选作 Lab 写入目标。

## 6. 数据保留矩阵

“通过”只对应证据列明的样本、环境和检查，不代表最后一列的扩大结论。48 对逐帧和性能样本来自最后三处展示修正之前；最终 `index.jsx` / `i18n.js` / `SonarChrome.jsx` 的差异、专项验收及未重跑范围见优化报告和构建 hash 表。

| 数据/状态 | 状态 | 权威实现或接收位置 | 本轮可复核证据 | 仍不能推导的结论 |
|---|---|---|---|---|
| 型号、角度、支持模式、上下限、单位 | 通过 | `devices.js`、`wedge.js` | 直接导入契约测试；标准扇体配置/顶点 hash | 仿真参数等同重新验证过的硬件性能 |
| 地形、结构物布局、鱼种群与基础轨道 | 通过 | `terrain.js`、`obstacles.js`、`fish.js` | 实际函数基线相同；逐帧 48 对中 272 条鱼捕获状态、instanceMatrix/aSwim、RNG 相同，含冰钓 | 所有随机轨迹、所有时刻或独立命中列表均已覆盖 |
| 有效船位、apex、range/depth、gain、单位、specs/box | 通过 | `index.jsx` → Scene / SonarScreen | 逐帧 36+12 对 scene 相同；新 scene 不含 specs/box，旧夏季 36 对另有此证据 | 所有异步 AUTO 时序或输入组合均已覆盖 |
| 声呐图像的本地样本比较 | 通过 | SonarScreen / sonarShader / lakeMaterial | 34/36 夏季、9/12 冰钓图像完全相同，余 5 对最大通道差 7；旧明显显隐未重现 | 全部像素/命中完全一致、非零差已确认具体 GPU 原因、跨 GPU 一致 |
| 暂停、加载、挂起/恢复 | 通过 | labLifecycle / SceneLifecycle / labMotion / 实际回调 | R3F 竞态与回调测试；Node 综合 50/50；本机暂停转屏、无 WebGL、context 恢复 | 所有 Safari/Meta/真机恢复路径均通过 |
| 操作状态、标签和反馈 | 通过 | Home / ModeGuide / SonarChrome / LearningGuide / boatControls | 本机产品/模式、手机控件、方向 target、drag blur、预设；Manual 标签和 Mini Combo panel 事件；真实组件 SSR | Mini Forward 有深度控制、全部布局/组合均已测 |
| 桌面与手机竖屏布局对照 | 通过 | 各自 release 构建的真实时钟页面 | `layout-comparison-final.json` 和 `docs/review/`：1440×900 / 390×845，面板 opacity=1、图片加载、相同产品/模式/量程；手机保留默认取景 | 相同鱼位/模拟时刻、声呐像素等价、横屏成对布局或真机均已验证 |
| 投影后的触控目标尺寸 | 待验证 | 实际 DOM 命中区域 | 已测 Home 26×38、部分 Range/Gain 44×38 等，未全部达到 44×44 | 可将能点击等同全部触控尺寸通过；后续验收仍需处理这些不足 |
| 事件载荷、时机约定及去重 | 通过 | `embed.js` | 22 项契约、父桥接 19 项离线测试及本地事件记录 | 真实事件已送达 Shopify / Meta / Klaviyo |
| 商品 handle、市场路径与参数 | 通过 | `shopUrl` / `openShop` | 16 个 URL 案例、原生/iframe/独立页契约测试 | 真实跨市场结账或广告归因已核验 |
| 历史统计、用户画像与 consent | 待验证 | Shopify / Meta / Klaviyo 后台 | 未写入、迁移、清空或重置；未读取后台逐条对账 | 历史数据已盘点、备份或与新版本对账 |
| 现有宿主主题及 iframe 来源 | 通过 | Shopify 只读 API、公开 HTML | 候选/生产快照、MD5/SHA-256、HTTP theme ID | 候选已加载本轮新版本或已确认发布对象 |
| 本地 iframe 消息及挂起 | 通过 | postMessage / IntersectionObserver | 同源 iframe 收到 ready/view/shop_click，离屏帧数停止、用户暂停保留、canvas=1 | 真实 Shopify 跨域/CTA 导航/营销后台送达通过 |
| 新构建 Shopify 接入和真实事件送达 | 待验证 | 选定主题与分析接收端 | 当前候选仍为旧生产 iframe，未写主题或部署新构建 | 可用现有生产正常运行替代新版验收 |
| 原生主题迁移/编辑器重挂载 | 不适用 | `share/embed.jsx` 及原生 loader | 本轮现有宿主是 iframe，未执行原生迁移 | section unload/load 兼容已完成 |
| 真机与长期资源稳定性 | 待验证 | 实际设备、GPU/heap 诊断 | 本机短窗口及 30 轮计数；强制 GC 不可用，新版 texture 比旧版多 1 | iPhone/Meta/V10 通过、内存优化或无泄漏 |

## 7. 版本证据、测试与未验证项

2026-10-28 的公开快照独立保存在本次工作区输出 `D:\shopify\output\accuphy-baseline`，不提交这些压缩产物作为应用源码。演示等于公开构建提交 `bb1aa317c80f502cd210776c909340879f0ce2e3`（其提交说明称源 `1fc1678`）；生产 `lab.accuphy.ca` 等于 `ccac5831e77f5a6f70fc8471f5139591376b34de`（说明称源 `9ed9341`）。字节相等已核实，私有源码来源仍未通过重建复现。此处正式源码基线 `5c576fb` 不应称为线上同一版本。`docs/versions.md` 的部分旧描述仍把所有链接写成 9ed9341；查版本时应结合其表格与独立 hash 证据，不以旧句子推翻现场证据。

离线语义回归：

```sh
node --test scripts/dev/lab-contract-test.mjs
node scripts/dev/shop-url-test.mjs
```

新测试直接导入产品、wedge、embed 模块。只在 Node loader 内把 Vite 的 `import.meta.env.DEV` 设为 false，文件和其余业务代码不变；window、计时器、事件接收器均是假对象，fetch 被禁止。测试覆盖扫描体积不变量、产品模式、原生/iframe 发布优先级与载荷、once/异常语义、origin/UTM 与延迟导航。既有 shop-url-test 的 16 个市场案例继续单独运行。

2026-10-28 本轮实际执行（Node v24.20.0）：原语义测试 **22/22 通过**，已包含在最终综合 **50/50** 中；既有商品链接测试另为 **16/16 通过**。原 47 项加上实际 SonarChrome SSR 3 项为 50，motion 文件内 7 项检查的不同计数层级见优化报告，不能重复相加。测试未向 Shopify、Meta、Klaviyo 或其他网络目的地发送请求。

补充实际函数基线：`scripts/dev/lab-scene-baseline.mjs` 在隔离 Node 进程中从 `git show 5c576fb:<path>` 读取原模块，与工作区导入结果比较。`scene-contract/comparison.json` 记录 0 项数据差异、独立重跑一致、依赖锁文件一致；108 是 6 船位 × 6 视图 × 3 时钟的引用案例，不是 108 个命中测试。脚本只检查标准 80 ft 扇体/配置、地形与基础鱼姿态，不重写命中算法。

最终浏览器 GPU/语义证据见 `lockstep-grid/records.json`、`comparison.json` 及同目录两份构建 manifest。QA 在首个应用 RAF 前接管队列，ready 时 frameCount=0，再重置 RNG 并逐次调用真实 R3F advance；场景、全部鱼字段、实例矩阵/aSwim 和 RNG/sonarTime 比较共 48 对，逐值无差异。初始化/捕获时钟、帧计数、订阅数量与待运行 RAF 单列，不当作模型差异。新 scene 不含 specs/box；真实裁剪状态由旧夏季 `gpu-final` 另行补证，不伪称新记录包含未存字段。此受控 QA 不是自然交互时序或正式发布包性能测量。

`frame-count-drift.json` 的实际回调实验确认固定时钟但零 delta 帧数不同仍可改变尾相位，冰钓还可改变 RNG/行为字段；相同帧数下新旧一致。旧 `gpu-grid`、`gpu-final`、`ice-grid` 的差异图和数值保留为方法修正证据，不作为最终保留结论。逐帧复测有 43/48 对图像完全一致，余下最大通道差 7，旧明显显隐未重现；详见优化报告。

上述 Node 测试**不覆盖** React 的交互路径与事件时机、GPU 像素、AUTO 异步状态、真实手机或网站后台。浏览器快照及 `paused-rotation-final.json`、`context-restore-final.json` 是另一层证据，不与 Node 检查混为一谈。视觉验收仍按 `.claude/skills/sonar-qa/SKILL.md` 与 lessons：锁定相同船位、型号、模式、实际 depth/range、时间和参考版本；夏季 6×6 与冰钓共享引擎回归、桌面/手机和适用的 Safari 检查。历史文档的帧率/亮度数字不是本轮测量结果。

历史 Shopify/Meta/Klaviyo 数据、事件送达、真实 consent 行为、真实设备性能尚不能由本契约证明。此次不迁移、删除或重置这些后台数据，也不改变接收目的地。
