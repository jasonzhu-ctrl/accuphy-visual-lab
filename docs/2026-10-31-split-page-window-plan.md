# 把“手机网页端”拆成两个窗口：规划（Lab HQ，2026-10-31，等 Jason 说“动”）

Jason 2026-10-31：“我觉得有必要拆，但是规划一定要规划好，他们各自的 context，然后各自的记忆、内容、技术、代办事项等等等等，你觉得重要的都可以调研一遍，然后我们再做这一个动作好了。然后名字的话，我觉得一个是叫界面设计，另外一个是叫营销和外部系统对接。”

依据：`docs/handover/chats/mobile-web.md`（旧窗口的完整交接）、代码文件和 git 记录（10-15 以来）、`docs/backlog.md` 的待办清单、决定 #180–#195。

## 一、拆完以后 Lab 的窗口

| 窗口 | 一句话 |
|---|---|
| Lab HQ | 统筹、上线、和总管 / 网站 / Klaviyo 打交道 |
| **Lab 场景和声纳画面Base** | 湖、鱼、冰钓场景、声纳画面（#176、#195） |
| **界面设计**（新） | 访客看到、点到的那层：面板、按钮、视图格、手机首页、动画、加载速度 |
| **营销和外部系统对接**（新） | 把访客带去商店、留下邮箱、记下数据的那层：去商店、分享、订阅、Klaviyo、追踪、店铺页连接、多市场、多语言 |

三个干活窗口都由 HQ 开、挂在 HQ 下。旧的“手机网页端”在两个新窗口都接手后归档。

## 二、怎么分：看得见的归界面，带走访客和数据的归对接

### 界面设计 管的文件（只有它改）
- `index.jsx` 的界面部分：面板、行、按钮、步骤卡、手机 dock、视图切换的样子
- `ViewIcon.jsx`、`SonarFan.jsx`（选中格的小声纳）、`GlassLayer.jsx`（玻璃试验）
- `home/AppHome.jsx` 和 `home/*.jpg`（手机上的 App 首页和缩略图）
- `logo.js`、`public/brand/`（logo、字体）、`src/index.css`
- `scripts/build-share.mjs`（打包页面：字体子集、图片外置，跟加载速度有关）
- `SonarChrome.jsx` 的按钮样子（刻度、range、深度逻辑归 Base）

### 营销和外部系统对接 管的文件（只有它改）
- `embed.js`：和店铺页的连接、事件名、市场规则、去商店地址、分享地址、美国只出 Mini
- `signup.js`：Klaviyo 订阅、同意文字、测试模式守卫、`lab_unlock=sub`
- `share/embed.jsx`、`share/main.jsx`、`share/index.html`，`scripts/build-embed.mjs`、`vite.embed.config.js`
- `i18n.js`：全部访客看到的文字，英文和法文（法文要网站核，网站交接都走它）
- 测试：`scripts/dev/shop-url-test.mjs`、`share-url-test.mjs`、`signup-guard-test.mjs`、`scripts/dev/store-frame/`
- 追踪方案、和网站、Klaviyo 的交接单（Lab 这边的起草）

### 两边都会碰的文件（规矩：先说一声再改，同一时间只一个改）
| 文件 | 样子归 | 行为归 |
|---|---|---|
| `ShareButton.jsx` | 界面（弹窗、按钮、预览卡排版） | 对接（链接、二维码内容、复制、发什么事件） |
| `UnlockCard.jsx` | 界面（卡片样子、锁、动画） | 对接（提交、Klaviyo、失败提示、事件） |
| `ShopButton.jsx`、`AppBadges.jsx` | 界面（位置、大小、样式） | 对接（跳去哪、等 1 秒、utm、徽章链接） |
| `index.jsx` | 界面（大部分） | 对接只改发事件、锁和美国只出 Mini 的那几行 |
| `i18n.js` | 界面要加新字时交给对接写 | 对接 |

10-15 以来改的次数：`embed.js` 19 次、`ShareButton` 6、`ShopButton` 5、`UnlockCard` 5、`signup.js` 4、`AppBadges` 2。共用的这几个改得不多，撞车风险小。

## 三、各自的待办（从 backlog 的等 Jason 清单分）

| 界面设计 | 营销和外部系统对接 |
|---|---|
| #192 新电脑面板：等 Jason 看、选玻璃（off / shu / rdev） | #191 订阅解锁上线配方：c91bf7e + 填 W24Qdc；法文等网站核；Klaviyo 文字等 Jason 看；关 Klaviyo 20 秒表单 VpD3CV；上线当天通知网站 03 复测 |
| Ice Fishing 小声纳格子太淡，要不要接受 | 追踪：CAPI A/B/C、app_badge、UTM、identify（网站 HQ 牵头） |
| #192 没测的：弱电脑、Firefox、真 Safari、真手机（手机分享弹窗离商店按钮只有 6 px） | “Send to a fishing buddy”预览卡两句英文选哪句（文案） |
| 冰钓页步骤卡在矮屏幕会出屏 | App Store provider token（徽章） |
| Mini Forward 的 1.0x 按钮（和 Base 一起） | #228 第 4 条：德 / 荷 / 波兰 / 拉脱维亚界面文字 |
| 加载提速 C（冻屏，和 Base 一起，黑五后） | 网站桥（#229/#233）上线后的复测；GA4 `lab_shop_click` 没抓到的查因 |
| 测试页 fx/ 上线后删 | 欧洲市场（X-14，黑五后）、美国只出 Mini 的复查 |

## 四、各自的记忆和窍门（从旧交接笔记拆）

| 界面设计 | 营销和外部系统对接 |
|---|---|
| 笔记 §3b（面板、视图格、玻璃、小声纳）、§5b 加载测量和字体配方、§5c 前三条坑 | 笔记 §3a（订阅）、§5a（店铺桥全套规则）、§5b 三个单元测试和假店铺页、§5c 后三条坑（文字要网站核、消息限流） |
| Jason 偏好：不要“太 AI”、店铺风格、高级感（#50）、手机菜单去掉 noise reject / color map | Jason 偏好：分享“丝滑顺畅无误”、手机也用二维码和 copy、去商店按市场、每家公司只看自己的价格、杭州不联系 |
| 先读：#180、#192，`docs/2026-10-30-panel-redesign-brief.md`、`docs/brand…`、`docs/2026-10-26-lab-load-time.md`、`visual-premium-tech-feel` 记忆 | 先读：#182、#184、#186–#188、#190、#191，`docs/2026-10-30-unlock-with-subscribe.md`、`docs/2026-10-30-tracking-plan.md`、网站交接单 4 份、`docs/market/README.md` 和 Drive 市场研究 README |

技术栈两边一样（Vite + React + three.js），但对接这边多了：Klaviyo 公开 API、Shopify customer events、GA4、Meta 像素、二维码库。

## 五、做法（Jason 说“动”后，约 1 小时，不碰线上、不改代码）

1. HQ 把 `mobile-web.md` 拆成两份交接笔记：`docs/handover/chats/ui-design.md`、`docs/handover/chats/marketing-integration.md`（原笔记不动，留作底稿）。
2. 两边的分工、共用文件规矩写进 `CLAUDE.md`，记成决定 #196。
3. HQ 在自己下面开“界面设计”“营销和外部系统对接”两个新窗口，各读自己的笔记，回报“我知道了什么、我管哪些文件、我的待办”。
4. HQ 核对两份回报，没有漏的再归档旧“手机网页端”。
5. Base 的换新（方案 B）同时做：开新的“Lab 场景和声纳画面Base”，读 `ice-lake.md`，回报后归档旧的。

**不掉东西的保证：** 旧笔记原样留着；新笔记由 HQ 逐条对照旧笔记拆，每一条都要落到一边；新窗口回报以后 HQ 再核一次；旧窗口只是归档，随时能打开。

## 六、要 Jason 定的（一次一件）

1. 这个分法可以吗？可以就说“动”。
2. `i18n.js`（全部文字）放在“营销和外部系统对接”，你同意吗？我推荐放这边：文字要翻译、要网站核，交接都在这边。
