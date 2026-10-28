# Lab 优化报告与交付边界

日期：2026-10-28。结论置信度：源码和所列快照证据为高；真机性能、历史统计完整性与本轮新版本的 Shopify 端到端结果为未验证。

本轮在正式源码分支上改善夏季湖面的高光、学习入口、可操作控件和加载/恢复反馈，同时保留原有产品模型和分析口径。展示修正前的逐帧控制复测中，夏季 36 对、冰钓 12 对的场景、全部 272 条鱼状态、实例矩阵/游动属性和随机数状态逐值相同；43/48 对图像完全相同，其余最大单通道差 7。随后仅改三个展示文件，构建与专项 UI/SSR 已重核，未重跑 48 对或性能样本。先前的局部显隐在控制帧数与随机数流后未重现，测试修正证据保留。现有 Shopify preview 仍加载生产 Lab，因此本报告不宣称新版本已上线或通过 Shopify 集成验收；本机性能数据也不足以证明整体提速。

## 1. 版本、规范与授权范围

| 项目 | 本轮记录 |
|---|---|
| 原始正式源码基线 | `5c576fbc18cc13f979952393a97128b26c7b3ae8` |
| 工作分支 | `codex/lab-clarity-optics` |
| 先行契约提交 | `a3c44071f1af251d4a9f25aa80c3bfa5228c0072`：固定来源契约后再改视觉 |
| 独立水面提交 | `62190ac68822aa04ec5ebb20595a8309071119c8`：有界高光混合，决定 #183 |
| 独立生命周期提交 | `e226bc655e9db64213ab9b0169caaedb4f83c092`：暂停/挂起时钟与展示重绘隔离，决定 #184 |
| UI 提交 / 当前优化版本 | `d77ab73b213428c337b51941d841769f2c6c8a26`：学习/控件、ModeGuide 与展示修正，决定 #185；已完成下列本机浏览器操作验收。分支未部署，不能仅用 `a3c4407` 代表当前优化版本 |
| 最终展示修正与已测快照 | `index.jsx`、`i18n.js`、`SonarChrome.jsx` 修正 AUTO/手动标签与冰钓回退插图；49 项源文件中 46 项与逐帧快照 hash 相同，3 项差异逐文件记录在 `final-build-report.json`。最终六种构建于 12:14 UTC 通过；48 对与六轮性能仍对应修正前快照 |
| 本机证据根目录 | `D:/shopify/output/accuphy-baseline`；独立产物不作为正式应用源码提交 |

仓库内可随分支审阅的机器摘要见 [review/validation-summary.json](review/validation-summary.json)：包含固定场景比较、性能条件和统计、最终构建、截图状态、heap/GPU 计数及原始输入 SHA-256。85 个正式构建输入已逐项与构建记录和 `d77ab73` 核对一致（Git 文本比较只规范化 CRLF）；开发测试工具单独提交，不混称正式应用构建输入。[核心文件清单](review/core-files-final.json) 另记录 27 个产品、模型、回波、事件和链接文件与源基线的规范化内容 hash 完全相同；工作区 CRLF 与 Git LF 的原始字节 hash 不同，未将其伪报为字节相等。

已读 `CLAUDE.md`、`README.md`、`docs/backlog.md` 顶部状态栏、`docs/lake-canon.md`、`docs/lessons.md`、`docs/decisions.md` 原尾部（#179–#181）及本轮新增 #183–#185、`docs/versions.md`、`docs/embed-options.md`，并按 `.claude/skills/sonar-qa/SKILL.md`、`sonar-look-tuning/SKILL.md`、`lab-test-link/SKILL.md` 区分模型、视觉和发布。Shopify 的发现过程读取了本机 Shopify skill，执行只读主题 API 与公开 GET。

| 规范/线索 | 相关约束 | 本轮影响 |
|---|---|---|
| 会话 AGENTS 指令 | 准确性、来源、事实/推断区分优先；Git 跟踪树未见 AGENTS.md 文件 | 仍执行用户在会话给出的指令；不编造仓库内 AGENTS 来源，不把未测项标通过 |
| `CLAUDE.md` | Lab 与网站/Portal 边界；真实产品规格在网站项目；纯前端 | 修改正式 Lab 源码；Shopify 仅只读发现；不把仿真参数当新硬件声明 |
| `README.md` | Vite/React 项目启动、构建和实验入口 | 沿用既有构建链及独立入口，不引入新框架 |
| `docs/backlog.md` 顶部 | 当前进度与历史生产/测试状态 | 只追加本分支待审说明，不覆盖历史状态或冒称已发布 |
| `docs/lake-canon.md` | 单一湖面、产品模式/参数、冰钓共享引擎 | 保留 FFT、天空、圆形船迹、数据与扫描体积，夏季与冰钓均比较 |
| `docs/lessons.md` | 同位置/模式/范围的可复核 QA，避免捕获期间开发热更新扰动 | 使用静态 QA 包、独立 manifest、逐帧与 RNG 控制；保留失败方法和修正证据 |
| `docs/decisions.md` | 最新决定与历史取舍；本轮 #183/#184/#185 | 水面、生命周期、UI 独立提交，保留事件定义和回滚边界 |
| `.claude/skills/*`、`.claude/launch.json` | sonar QA / look tuning / test-link 工作流及本地启动配置 | 作为流程与启动经验读取；它们不是完整历史聊天记录，也不赋予店铺发布权限 |
| `docs/embed-options.md`、`docs/versions.md` | 嵌入方案与版本记录 | 用实际主题文件、HTTP 和 hash 核对现况，区分演示、生产与新工作区 |

本次用户已明确授权实施并继续完成计划及后续，覆盖旧文档针对开始工作/原聊天归属的限制；不能据此删除仓库或修改设置，也不能把发现一个主题等同于确认具体发布对象。没有把公开压缩 HTML 当作源项目，没有为本轮另造声呐模型。以下保留项仍成立：

- 夏季湖面优先，冰钓共用引擎必须回归；保留 FFT 风浪、真实天空与圆形船迹，不恢复 Kelvin 船迹或夏季 jig。
- 保留设备配置、单位档位、AUTO 逻辑、鱼/地形/结构物数据以及成像算法；不把代码中的仿真配置写成新硬件承诺。
- 保留事件名、载荷语义、发送时机、去重和商品市场路径；历史 Shopify / Meta / Klaviyo 数据不迁移、不清空、不重置。
- 截至本报告的 Shopify 工作仅为只读发现，宿主和发布状态未改；后续接入需核对具体目标、可访问源文件和新构建版本。

## 2. 项目地图与实现范围

详细产品参数和逐项数据矩阵见 [lab-preservation-contract.md](lab-preservation-contract.md)。以下为本轮实现层次，而不是提交顺序。

| 层 | 位置 | 改动及保留关系 |
|---|---|---|
| 夏季水面 | `Scene.jsx` 的 Water fragment shader | 对最强太阳高光进行有界混合，减少不透明白色裁切；FFT、波面法线、原水色和圆形船迹保留，不进入声呐 pass |
| 学习与操作 | `index.jsx`、`LearningGuide.jsx`、`boatControls.js`、`labExperience.css` | 解释移动、扫描、回波关系；预设使用原有设备/模式/目标位置；方向操作与拖船共用 target 和边界 |
| 游戏式模式入口 | `ModeGuide.jsx`、`modeGuideCopy.js`、`mode-guide.css` | 英法文大字三档；PL 第三档 Panoramic、Mini 第三档 Combo；引导动画最多 4.2 s，暂停/减少动态效果设置下不播放 |
| 控件语义 | `SonarChrome.jsx`、`home/AppHome.jsx`、`controls-a11y.css` | 原生按钮、可访问名称、禁用状态及选择反馈；保留真实可用模式，不把展示按钮做成不存在的功能 |
| 加载与错误 | `labLifecycle.js`、`SceneBoundary.jsx`、`loadingCopy.js`、`build-share.mjs` | 遮罩展示与业务 ready 分离；保留上下文监听和错误后的说明/商品路径，英法文文案共用 |
| 动画生命周期 | `SceneLifecycle.jsx`、`labMotion.js` | 隐藏/离屏挂起与用户 Pause 分离，保留累计场景时间；暂停后的必要单帧更新不等于恢复连续播放；减少动态效果设置关闭视差 |
| 原有核心 | `devices.js`、`wedge.js`、`terrain.js`、`fish.js`、`SonarScreen.jsx`、`sonarShader.js`、`lakeMaterial.js`、`embed.js` | 作为保留与比较对象；未用重建的命中公式替代实际模块 |

学习预设会实际切换型号/模式/量程并移动目标船位，不是纯说明切换。新增方向操作不会上报 first_drag；原事件仍表示首次 pointerdown。桌面、手机、冰钓的能力不同，不能把手机 appCtl 的暂停/增益等能力扩写成所有布局都支持。

**用户追加的游戏式大字入口已实现并有本机浏览器操作证据：** `ModeGuide` 以英/法文展示 PL 的 Beam / Down View / Panoramic，Beam 对应既有 `forward`，Mini 第三档为 Combo（`combo`）。复用 `pickView` 与 `source: 'panel'`，保留首次手机 Home，不新增引擎模式、改变产品能力或另设分析事件。提示动画最多三个 1.4 s 周期，点击即结束；用户 Pause 或 `prefers-reduced-motion` 下不播放动画。该组件只选择模式，不像学习预设那样切换产品或船位。`mobile-modeguide-events-final.json` 记录 PL 面板 Down/Panoramic 与 Home 路径；补充 `range-label-and-mini-panel-final.json` 已实际点击 Mini 大字 Combo，并捕获 `product=pinglive-mini, view=combo, source=panel`。`reduced-motion-final.json` 确认模拟系统设置下动画为 none、过渡为 0 s。具体操作证据与声呐快照分层记录。

**生命周期修复的具体范围（#184）：** 实际 R3F 9.8 store 在切换 frameloop 时会重置 clock；尚未完成的 invalidation 还可能让全局 RAF 的毫秒时间戳进入期望秒的 never 路径。仅靠 React layout effect 无法可靠阻止这个竞态。`guardPausedFrames` 在 store 状态改变时同步清掉待运行帧并恢复累计场景时间，用户暂停与隐藏/离屏原因分别保留。可见的暂停页面因 resize/设置变化只进行一次零 delta 展示重绘；它更新必要显示而不推进鱼随机行为、钻孔或 jig。

## 3. 问题分级与处理边界

目前**没有已确认的 P0 故障**。P1 表示需要独立跟进的行为或兼容问题，P2 表示体验和表达改进。发布证据是否齐备另列为验收门槛，不把未完成的测试或假设中的数据风险标成 P0。

| 等级 | 问题/风险 | 本轮状态 |
|---|---|---|
| P1 既有口径 | 切换设备时可能先发送不支持的 view，再由 effect 纠正为 Down | before/after 均捕获 Mini/Panoramic 请求、最终 Down；本轮不悄悄修复或清洗历史口径 |
| P1 生命周期 | R3F 时钟重置与 pending-frame 竞态；暂停展示可能意外推进仿真 | 已在 `e226bc6` 修复；实际 store/回调回归及本机浏览器暂停转屏通过，真机覆盖仍单独验收 |
| P1 宿主漂移 | Lab preview 的法语与 lead 表单配置落后于生产 | 已保存差异；不复制主题、不补配置、不改变分析接收端 |
| P2 学习与操作 | 首次进入缺少明确操作顺序、展示控件与真实操作难区分 | 说明、预设反馈、方向控制、可访问按钮及 ModeGuide 已实现；本机浏览器键盘/拖动/模式及控件操作已核，实际触控命中区域仍有下述限制 |
| P2 湖面观感 | 太阳强高光裁切影响水面细节 | 仅调整夏季水面混合；已有前后图与声呐保留证据，具体审阅图见下方 |

分析风险的证据在 `gpu-final/records.json`，早期 `gpu-grid/records.json` 也记录到同一现象。其中 events 是累积列表，不能把每帧列表直接相加做事件计数，也不能把 view 请求无条件当最终画面。

先前“局部回波显隐待定位”的 P1 项已在逐帧控制复测后解除，改记为已纠正的 QA 方法问题：旧测试只固定时钟，未锁定首帧前的随机数流和实际回调次数。最终 48 对鱼状态及实例属性相同，明显显隐未重现；仍保留 5 对非零像素差，不把结果写成全部图像零差。

**独立的发布验收门槛：**

- 新工作区版本尚未装入已核实的 Shopify 宿主；已有生产 iframe 运行正常不能替代新版本验收。
- 模型、范围/裁剪、事件和商品路径已有分层证据；48 对逐帧复测对应展示修正前的保存快照，最终提交的三处展示差异和专项验证另行列明，不能把旧 manifest 当最终源码逐文件完全相同的证明。
- 历史统计未对账，真机、完整 TTI、持续性能与受控内存证据未齐；这些是本报告的未验证边界，不是已确认的数据损坏或性能故障。

## 4. 公开页面与正式源码的区别

以下是 2026-10-28 的快照，不保证之后线上仍停留在这些版本。

| 对象 | 已确认的字节来源 | 源码追溯边界 |
|---|---|---|
| `jasonzhu-ctrl.github.io/accuphy-lab-test/` | 等于公开构建提交 `bb1aa317c80f502cd210776c909340879f0ce2e3` 的 index；SHA-256 `2f3a42d9dbeb1cdb624904e69ee800c10637e21d6a904c1a3c61fddcc3681d71` | 提交说明称源为 `1fc1678`，未通过本轮完整重建证明来源 |
| `lab.accuphy.ca/` | 等于公开构建提交 `ccac5831e77f5a6f70fc8471f5139591376b34de` 的 index；SHA-256 `f8b3d29262186bac8b6102f8657b7a3d923aed6aabbfb4c93509e1b4ad5aca84` | 提交说明称源为 `9ed9341`，不能称与本轮 `5c576fb` 工作区相同 |
| Shopify `/pages/lab` | 生产主题 `188593668269`，iframe 指向 `lab.accuphy.ca` | 宿主模板、子页面构建和分析接收器是不同层 |

原始响应、hash、仓库元数据及离线复核脚本在证据根目录的 `public/`、`public-baseline.json`、`public-evidence.json`、`public-audit.mjs`。当前文档的旧描述若与这些快照不同，应注明时间和层次，不能用版本号相近推导字节相同。

## 5. Shopify 宿主只读发现

现有连接确认商店为 `shop.accuphy.com`（`bhuekt-nw.myshopify.com`）。完整主题列表中，**`189709156525` / X-6W preview (Lab page, delete after use) 是 UNPUBLISHED**。可复核链接：[现有 Lab 宿主 preview](https://shop.accuphy.com/pages/lab?preview_theme_id=189709156525)。只读 GET 返回 200，HTML 的 Shopify.theme.id 与该主题一致，含 Lab iframe 和消息桥接。

候选确有 `layout/lab.liquid`、`sections/lab-embed.liquid`、`templates/page.lab.json`。与 MAIN `188593668269` 比较：

- layout 相同；两者 iframe 都指向 `https://lab.accuphy.ca/`，没有装入本轮新构建。
- 候选 section 缺生产的法语市场 `lang=fr` 注入；候选模板的 `lead_form_ids` 为空，生产已配置。
- CA 英文渲染桥接的差异只有 LEAD_FORMS 配置；协议为 `accuphy:lab`，来源标记为 `accuphy-lab`，保留准确 origin/iframe window 检查。
- 生产桥接 SHA-256 `85a93198dcfa41e5a43f0cfe2e8301a64769c82d20e06eed1aad982a020ae041`，与同日较早公开快照逐字节相同。候选为 `4a2967b896684a88569c1e8404b84fa2234d54f9f9daed5fa2a4b9ccf9ab68ba`。

历史文档出现过的 `189488890029` 当前也是 UNPUBLISHED，但上述三个 Lab 文件逐项返回 NOT_FOUND；其 `/pages/lab` GET 未出现该 iframe/桥接。不能因为浏览器曾打开它就把它认作本轮 Lab 主题。

网站源项目在 `docs/site-audit.md:4–5` 记为 `jasonzhu-ctrl/accuphy-website` 及 Jason 的 Mac 路径。旧名和 `accuphy-marketing/accuphy-website` 通过当前 connector/Git 访问均不可用（404 / Repository not found）；这不证明仓库不存在。`D:/shopify` 顶层未找到网站 checkout。CLI 无现有认证，`--no-input` 返回需认证后停止，未登录新店；Admin pages 查询因权限被拒，不能宣称读到页面 templateSuffix。

来源快照、API MD5、HTTP theme ID、三份 diff 和离线校验位于 `host-discovery/`。六份主题文件中五份与 API MD5 直接相同；候选 page.lab.json 的 API 文本有前置生成注释，移除该注释后的 JSON 才与 API MD5 相同，原返回文本完整保留。此处没有把部署主题快照冒称完整 Git 仓库。

## 6. 已有验证与证据含义

| 验证 | 来源与结果 | 覆盖边界 |
|---|---|---|
| 产品/事件/链接契约 | `node --test scripts/dev/lab-contract-test.mjs`：22/22 通过 | 直接导入实际模块，假 window/计时器；不代表 React 事件时机或真实送达 |
| Node 综合回归 | 主任务最终执行：50/50 通过，其中 contracts 22、controls 3、lifecycle 12、fish pause 5、ice pause 4、motion 文件级子测试 1、chrome SSR 3 | motion 内部另有 7 个检查，不再加到 50 中；上行 22 项已包含在总数内 |
| 鱼/冰实际回调 | 从当前源码及 `git show 5c576fb` 解析实际 useFrame 回调；IceCamp 正常运行 100 帧逐值相同，FishGroup 正常路径 6 个 dt 样本及 Fish 初始随机调用与基线一致 | 使用实际 Three 矩阵和鱼函数、受控夹具；不是 100 帧 GPU 图片对比 |
| 暂停展示保留 | 鱼、行为与 IceCamp 暂停重复回调检查，含初始暂停、钻孔阶段边界和 jig | 不推进游动平滑/RNG/钻孔/jig；必要切面/beam 展示仍可更新 |
| 本机暂停转屏 | `paused-rotation-final.json`、`landscape-paused-final.jpg`：竖屏与横屏均 t=0、船位 (16,11)、Forward；横屏声呐仍有绘制 | 浏览器视口旋转，不是真实手机旋转或性能测量 |
| 本机 WebGL 恢复 | `context-restore-final.json`：主动触发 `WEBGL_lose_context` 后 main inert、焦点为 Reload Lab；恢复后 mode/device/range/boat 保持，canvas 为 1，ready 累积仍为 1 | 实际本机 WebGL context 丢失/恢复；不代表 Safari、Meta 内置浏览器或全部 GPU 驱动 |
| 无 WebGL 回退 | `no-webgl-final.json` / `no-webgl-ice-final.json`：canvas=0、cover 移除、main inert、焦点 Reload Lab；冰钓显示冰孔说明图和 Mini CTA | 测试 HTML 将 WebGL getContext 返回值置空；是功能回退测试，不是真实不支持 WebGL 设备的普查 |
| 鱼安全模拟 | 主任务运行 `node --import ./scripts/dev/node-register.mjs scripts/dev/fish-sim.mjs 15`：结构/湖底/出水违规均为 0，最低间隙 0.41 m | 15 分钟模拟样本，不是穷尽所有随机轨迹 |
| 市场链接 | `node scripts/dev/shop-url-test.mjs`：16/16 通过 | URL 规则，不是实际结账或广告归因 |
| 公开宿主桥接 | `shopify/runs/2026-10-28T08-48-42.683Z/summary.json`：19/19 通过 | VM 捕获调用，禁止网络；测试的是已保存生产桥接，不是后台报表 |
| 控件 SSR | `ui-a11y/ssr-check.json`：7 项通过 | 原生/禁用按钮、Home 隐藏及 Mini Forward 标记；不是浏览器命中区或键盘视觉验收 |
| Home 与模式操作 | `mobile-modeguide-events-final.json` 及 `range-label-and-mini-panel-final.json`：PL Home/面板路径与 Mini Combo 的 source=panel 均有实际记录 | 实际本机浏览器路径与本地事件；不等于每个型号每个按钮均有独立事件截图 |
| 手动/AUTO 标签 | `range-label-and-mini-panel-final.json`：手动 Down 深度 9.144 m，HUD/反馈为 Manual；最新正式 share 的 `manual-down-app-final.json` 确认 App AUTO 数为 0、两 range 按钮仍 disabled；另有真实组件 SSR 3 项 | 改显示标签，不改变 AUTO 算法、range 按钮禁用条件或 Mini Forward 无深度控件的既有能力 |
| 手机控件操作 | `mobile-controls-final.json`：Mini Forward 的 gain=0.41、range=30.48 m、imperial=false；切至 PL 后手动 depth=22 m | PL 手动深度关闭 AUTO；Mini Forward 仍无大深度控制/读数；未改变其产品语义 |
| 键盘及拖动收尾 | `keyboard-move-final.json`：target (16,11)→(18,11)，焦点保留方向按钮；`drag-cancel-final.json`：pointer 操作后 blur 结束 dragging，目标保留，first_drag 仅一次 | CDP pointer 加模拟 window blur；键盘方向操作没有生成 first_drag，不是真实手机失焦测试 |
| 学习预设 | `preset-final.json`：PL Forward、target (16,11)、range=18.288 m，显示已载入反馈并产生 source=step | 预设确实改变状态，不是只换说明文案；这里只记录实际测试案例 |
| 减少动态效果 | `reduced-motion-final.json`：媒体查询匹配，模式动画 none、transition 0 s | CDP 系统偏好模拟；不等同真实系统设置或全部动画路径普查 |
| 本地 iframe 生命周期/消息 | `iframe-lifecycle-final.json`：离屏两次采样 frameCount 不增长；回可见仍保留用户 Resume 状态，canvas=1，父页面收到 ready/view/shop_click | localhost 同源 iframe，CTA 测试阻止延迟导航，未转发 Shopify/营销平台；不是实际店铺跨域集成 |
| 独立 Mini / ice 入口 | `independent-entries-final.json`：Mini 仅显示 PLM、Forward/Down/Combo 和 Mini CTA；冰钓默认 PLM Live Ice、Mini CTA，两者 canvas=1、cover 已移除 | 实际构建入口 DOM/加载状态；不代表全部镜头/钻孔/商品跳转均被该记录覆盖 |
| Gallery 注册门 | `gallery-gate-final.json`：对话框启用、main inert、焦点 email、canvas=1 | 未填写或提交注册；不宣称 signup/后台订阅链路已经送达 |
| 实际函数基线 | `scene-contract/comparison.json`：0 项数据差异、重跑一致、依赖锁一致 | 272 条鱼的基础轨道、实际地形与 80 ft 标准扇体；108 是引用案例，不是独立命中测试 |
| 最终逐帧语义 | `lockstep-grid/records.json`、`comparison.json`：96 条记录配成 48 对，scene、fish、fishMeshes、RNG calls/seed、sonarTime 全部逐值相同 | 每例 272 条鱼全部捕获字段、全部 instanceMatrix/aSwim；冰钓含 holes/jig/drill/signal，scene 不含 specs/box；不覆盖所有异步 AUTO 时序 |
| 最终夏季 GPU 图像 | `lockstep-grid/comparison.json`：34/36 对解码 RGB/PNG 字节完全相同 | 2 对非零差异，最大单通道差 7；不等于所有像素或所有设备均相同 |
| 最终冰钓 GPU 图像 | 同文件：9/12 对 RGB/PNG 字节完全相同 | 3 对非零差异，最大单通道差 5；先前 deep Down/Live Ice 的局部显隐未重现 |
| 帧数混淆定位 | `frame-count-drift.json`：真实回调以 2/30/100 个零 delta 帧比较 | 不同帧数会改变 aSwim，冰钓还会改变行为状态/RNG；相同帧数下新旧一致，不是旧每个差异像素的因果重放 |
| 宿主归属 | `host-discovery/verify.mjs`：保存文件及 HTTP 证据校验通过 | 当前已有宿主，不包含本轮新 Lab 的 Shopify 集成 |
| 最终本机构建 | `final-build-report.json`：qa-after、normal、share-both、share-mini、share-ice、embed 六项通过，构建期间源文件 hash 未变；编译 CSS 规则检查通过 | 2026-10-28 12:14 UTC 的三文件展示修正后工作区；编译/打包不等于重新执行全部浏览器、性能或真机验证 |

最终 GPU 比较使用 `scripts/dev/build-lab-qa.mjs` 的 `?qa=lockstep` 私有 QA 包。它在应用第一个 RAF 前接管队列，全部案例在 `ready` 时 `frameCount=0`；随后重置随机数流，调用真实 R3F `advance`，保持正常 `always` 分支，按 `step(0)`、`step(6)` 及每个模式选择后 `drainUI(2)`、`step(0)` 推进。没有把正式应用换成另一套模型或独立命中算法。

`lockstep-grid/` 保存新 before/after manifest：11:28:53Z 构建的 revision `5c576fb`、11:29:01Z 构建的 revision `WORKTREE`（HEAD `e226bc6`），包含当时未提交的 UI。`compare-lockstep.py` 仅在完整 96 条记录和 96 张图到齐时执行，保存两份 manifest、records、每张 PNG 和每组语义数据的 hash；初始化/捕获时钟、frameCount、RAF 队列、启动随机消耗与订阅数量单列为 QA 元数据，不伪报模型差异。实际元数据差异只有 pendingRAF 和新增生命周期订阅者数量；捕获帧数与时钟也相同。与上一批 after manifest 比较，编译后的应用 JS/CSS hash 均相同，变化的是含 QA harness 的 HTML。此包用于语义/图像比较，不用于正式性能结论。

夏季位置为 default (−6,4)、shelf (−40,−5)、hump (22,8)、deep (4,−40)、lockup (−14,−52.5)、dropoff (−3,−14)，交叉 PL Down/Forward/Panoramic 和 PLM Down/Forward/Combo；冰钓 start、deep、timber 交叉 Mini Live Ice / Forward / Down / Combo，全部声呐时间 t=6。新的 scene 捕获包含实际船位、apex、模式、range/depth、gain 等；运行时 specs/box 的相同比较另由先前 `gpu-final` 状态证据提供，不能说新记录包含未存字段。

最终数值来自 768×384 原始图，RGB 通道 0–255，拼图仅供审阅。没有用容差把非零差异改记为完全相同：

| 最终逐帧快照 | 全部语义字段相同 | RGB / PNG 字节完全相同 | 最大平均绝对 RGB 差 | 最大单通道差 | 单例变化像素比例最大 | 单例任一通道差 >8 的像素比例最大 |
|---|---:|---:|---:|---:|---:|---:|
| 夏季 6×6 | 36/36 | 34/36 | 0.0001469364873 | 7 | 0.017293294% | 0% |
| 冰钓 3×4 | 12/12 | 9/12 | 0.00006555627894 | 5 | 0.009833442% | 0% |

四张最终 before/after contact sheet 已逐 tile 审阅：湖底、树/石/沉船、lockup 字样、模式分区和冰钓圆盘/扇体均保持布局，没有重现先前 deep 的局部亮点显隐。仍有非零差异的五例为夏季 deep Mini Combo、dropoff PL Panoramic，以及冰钓 deep Combo、timber Forward/Combo；不据此推断全部 GPU 或真机均逐像素一致。

**保留测试方法修正记录：** 早期水面 `gpu-grid` 为 22/36 图像相同；后续仅固定时钟的 `gpu-final` 为 12/36、`ice-grid` 为 7/12，曾出现局部显隐（夏季最大通道差 170、冰钓 255）。对应 `difference-locations.json` 和局部图完整保留，不删除不利记录。这些批次没有锁定首帧前的随机数流和实际回调次数，不能据其归因产品回归，也不能把它们当最终保留结论。

`frame-count-drift.json` 用真实 Fish/FishGroup 回调隔离 2/30/100 个零 delta 帧：夏季位置/矩阵不变，但尾相位最大分别相差约 0.080736 / 0.282577 rad；冰钓还出现 RNG 调用 160/189/258 及行为字段差异。相同帧数的新旧比较则 population/pose/matrices/aSwim 全相同。它确认“只固定时钟不足以锁定完整场景状态”的混淆因素，但不是旧浏览器每个像素原因的完整重放。最终逐帧和随机流均控制后，48 对语义一致且明显显隐未重现，所以解除旧 P1 待定位项。5 对低幅像素差的具体 GPU 原因未单独确定；本轮未为取得一致而修改模型。

综合命令为 `node --test scripts/dev/lab-contract-test.mjs scripts/dev/lab-controls-test.mjs scripts/dev/lab-lifecycle-test.mjs scripts/dev/lab-fish-pause-test.mjs scripts/dev/lab-ice-pause-test.mjs scripts/dev/lab-motion-test.mjs`。motion 的 7 项内部检查包括正常连续时钟、100 次挂起循环、暂停零 delta 展示与实际 R3F 全局循环竞态；不把内部检查数与 Node 文件级测试数相加。

最终综合命令还加入 `scripts/dev/lab-chrome-test.mjs`，故在原 47 项上增加 3 项至 50 项。它在 Node 内编译并 SSR 实际 SonarChrome：手动 Down 不显示 AUTO 且 range 按钮仍 disabled、自动 Down 显示 AUTO、Mini Forward 没有大深度读数/控制；不镜像另造一个 UI 实现。

逐帧夏季 36 对与冰钓 12 对浏览器比较已完成，使用同批保存的 manifest；其后仅三处展示文件变化，未重跑这批比较，旧测试记录继续保留。UI 的模式、控件、键盘、拖动、预设及恢复证据见上表。六种构建已有通过证据，本轮未增加依赖；包体的原始字节或计算 gzip 大小不等于实际网络传输或加载耗时。

`mobile-touch-final.json` 测了投影后的实际命中区域，不能只凭 CSS 伪元素 ±12 px 宣称全部达到 44×44 px：Home 为 26×38，Range/Gain 多为 44×38，Pause 为 48×40，Depth shallower 为 44×42，Depth deeper 为 44×44。外部 Home/切换入口和 Pause 提供了较大替代操作区，但原 App 投影控件的采样仍有不足；不把“能点击”和“所有目标均达到尺寸目标”合并成一个通过结论。

最终正常 share 导航的控制台日志见 `console-final.json`：所捕获的三个新版导航没有 error，均有既有 THREE.Clock 弃用 warning。主动禁止 WebGL 的测试路径另外保留其预期初始化 error，没有把降级测试错误混入正常页面结果，也没有为消除 warning 更换引擎依赖。

## 7. 本机性能与尚未覆盖的验收

`performance-runs.json`、`performance-conditions.json`、`performance-summary.json` 与 `performance-report.zh-CN.md` 保存原始样本、条件、统计方法和输入 hash。结论是**满足本轮三个短窗口本机预算，没有证明整体提速**。Windows / Ryzen 7 9700X / 31.1 GiB RAM、Codex IAB Chromium 156、ANGLE NVIDIA RTX 5070 Direct3D11，1440×900、DPR 1；localhost HTTP/1.1 不压缩、不限速、no-store，浏览器进程与驱动缓存已热。场景是默认船位 PL Forward、80 ft、gain 40%、AUTO depth，真实时钟。

before/after 各 3 轮，分组采集而非随机交错；每组首轮 navigate、其余 reload。每轮在遮罩移除后测 120 个 RAF 间隔（约 2.1 s）。下表是三个轮次的中位数（最小–最大），单位 ms，不把 360 帧当成 360 次独立实验：

| 指标 | Before | After | 中位数差值 after−before |
|---|---:|---:|---:|
| FCP | 104.0（96.0–156.0） | 120.0（100.0–128.0） | +16.0 |
| ready 事件 | 896.6（885.3–969.8） | 912.6（909.0–949.5） | +16.0 |
| 遮罩移除 | 1622.3（1612.7–1703.0） | 1656.9（1650.8–1684.8） | +34.6 |
| 初始化长任务合计 | 852.0（844.0–875.0） | 870.0（846.0–882.0） | +18.0 |
| 初始化最长任务 | 739.0（738.0–764.0） | 761.0（741.0–770.0） | +22.0 |
| RAF 间隔 p50 | 17.6（17.4–17.7） | 17.7（17.5–17.8） | +0.1 |
| RAF 间隔 p95 | 18.1（18.0–18.1） | 18.1（18.0–18.1） | 0.0 |
| pointerdown → view 事件 | 12.4（12.2–12.7） | 13.0（12.7–15.4） | +0.6 |
| pointerdown → 两次 RAF | 47.1（45.9–48.1） | 47.0（47.0–48.6） | −0.1 |

已测新版三个轮次的 RAF p95≤20 ms、模式点击到两次 RAF≤100 ms、本机 FCP≤250 ms；采样版本分享 HTML 增量 29,305 bytes（1.56%），也在 65,536 bytes 包体预算内。最终展示修正后 HTML 为 1,912,366 bytes，比采样版多 409 bytes、比源基线多 29,714 bytes（1.58%）；这版没有重采性能，不能把前表表述为其新实测值。主要时间指标的中位数差未超过两组中较大的组内极差，样本区间重叠；这不是显著性或等价性证明。FCP/ready 和初始化长任务增加的数值如实保留。约 0.74–0.77 s 的初始化长任务仍存在，没有调用栈证据将其归因某个模块。

RAF 是回调调度间隔，不是 GPU 帧耗时或 60 fps 保证；交互每轮仅一次 Forward→Down，发生在热运行阶段，两次 RAF 不是校准过的 input-to-photon。ready 仍仅代表 Canvas 创建，遮罩移除不是完整 TTI。compileShader/linkProgram 每轮调用数均为 64/32，所测同步 JS API 时间不能代表 GPU 编译完成。实际加载的是相同大小测量脚本附加后的无压缩 HTML，不能拿计算 gzip 大小代替网络实测。

JS heap used 的未受控快照中位数（范围）为 **50.6（43.6–55.1）→66.0（60.6–66.6）MiB**，新版样本均更高。这是需要保留的资源信号；GC、取样时刻和预热未锁定，不足以宣称泄漏，也不足以宣称资源占用已优化。

补充 `heap-cycles-final.json` 对两版正常 production 构建进行了各 30 轮切换（每操作间隔 100 ms，每轮结束于 Forward，预热至少 5 s）。`HeapProfiler.collectGarbage` 接口不支持，因此**没有完成受控 GC 或 retained-size 验收**。0/10/20/30 轮的 used heap 分别为 before 50.5/62.0/62.8/73.9 MiB、after 70.5/62.5/51.5/76.4 MiB。两次导航位于同一 isolate，预热时长也不同；这组非单调快照不能诊断长期泄漏、证明新旧资源等价，或抹去前一组 after 更高的观察。

`gpu-resource-cycles-final.json` 另以真实时钟静态 QA 包检查 30 轮 PL Down/Panoramic/Forward：两版 geometry 始终 83，programs 从 32 到 40 后稳定，textures 则 before 始终 21、after 始终 22。新版多 1 个 texture 的原因未确认；这些 Three renderer 计数不是 GPU 显存字节或 retained heap，不支持“内存已优化”或“无泄漏”的结论。长期资源和显存字节仍未测。

布局审阅图已归档：[桌面对照](review/desktop-before-after.jpg)、[手机 Home / Active 对照](review/mobile-before-after.jpg)，采样条件和源图 hash 见 [review/README.md](review/README.md)。它们来自各自 `source-before/source-after` 的真实 release 构建，真实时钟运行且无 QA hooks；桌面实际 1440×900，手机实际 390×845，两版加载遮罩均移除、面板 opacity=1、品牌与 Home 图片均加载。桌面显式船位 (-6,4)，手机不加 boat 参数以保留原有 PHONE_START (16,11) 和 frameX=15 取景；PL Forward、range 80 ft、gain 40% 配对，桌面 AUTO depth 45 ft、手机 Active 25 ft，Home 背景在首次入口时为 70 ft。实时鱼/波浪/时钟独立，所以这些图证明布局差别，不证明回波像素等价。

本批图替换此前不适合公平布局比较的 QA 截图：旧 QA 的 Tailwind 候选收集范围、资源路径和手机显式 boat 参数会干扰旧布局或默认取景。严格模型证据仍由独立 lockstep 数据承担。横屏已有暂停转屏功能截图，未建立匹配状态的横屏 before/after 图；所有本机图片均不能替代真机结论。

- 横屏匹配状态的 before/after 布局对照：**未完成**；已有 `landscape-paused-final.jpg` 仅覆盖上述暂停重绘案例。
- 完整 TTI、冷进程/冷 GPU、4G/真实互联网、10 s 以上稳态/热降频、拖动延迟、GPU 完成时间、长期显存/资源计数与受控 GC：**未完成上述样本外的测量**。历史文档的 60 fps、加载秒数不能当作本轮结果。
- 真实 iPhone Safari、Meta 内置浏览器、V10 平板：**未验证**。本机 Chrome 的主动 WebGL 丢失/恢复与视口转屏已有上述证据，不能替代这些真机项目。
- 新构建装入 Shopify 宿主后的各市场、父子通信、购物路径和 consent/事件送达：**未验证**。现有候选指向旧生产构建，不能填通过。
- 历史 Shopify / Meta / Klaviyo 统计完整性和新旧口径对账：**未读取、未核实**；本轮没有写入或重置这些后台。

## 8. 回滚与后续接入

当前没有远端部署，因此不存在需要本轮执行的线上回滚。源码回退应以明确的优化提交做反向提交或在独立 checkout 从 `5c576fb` 重建，保留契约/证据记录；不要对共享工作区直接 hard reset，也不要把公开压缩 HTML 覆盖回正式源码。

水面、生命周期、UI 分别隔离为 `62190ac`、`e226bc6`、`d77ab73`。先审查依赖，再对所需提交作反向提交；只撤回一个提交不等于已撤回全部优化。保留先行契约提交和原始证据，避免重置无关改动。

需要对照时优先使用已保存的 `source-before/`、`source-mini-before/`、`source-ice-before/` 及带 manifest 的 `qa-before/`；QA 包含 DEV hooks，只作本地比较，不能当作正式发布文件。后续正式发布必须确定唯一源提交，重新构建所需变体并记录 hash。

后续把新构建接入选定 Shopify 测试宿主时，先保存该宿主当时的三文件和配置，再核对实际 iframe/原生入口加载的构建；失败时只回退本次改动及原地址，不迁移或重置分析历史。现有 `189709156525` 是证据充分的候选，仍需确认归属与当时状态，不能依据名称推定它就是发布对象。当前网站源码访问和新版本宿主测试尚未补齐，宿主未编辑、线上未发布。
