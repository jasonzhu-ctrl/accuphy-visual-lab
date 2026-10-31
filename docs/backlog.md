# Backlog — Sonar Beam Visualizer (kept current every round)

> 状态（2026-10-31，Lab HQ；10-27～10-29 的长版原文在下面“明细”里）
> 阶段：X-6L Lab 上线后收尾，11-02 广告开投（加拿大 + 美国）；lab.accuphy.ca 现在是 5c2e69a（10-30 Jason 动）
> 进行中：#192 电脑版面板改版 + 分享改版 · d8b411c（视图格只留图标，选中格是动态小声纳图）、测试链接 ba71f8a、HQ 看过对比图 · 等 Jason 看；#191 模糊视图订阅后打开 · 测试版已看待定；上线前：填 W24Qdc、核法文、Klaviyo 文字、真机、Klaviyo 关 20 秒表单。注意：#191 若先于 #192 上线，要从 c91bf7e 构建
> 等 Jason：⓪a 确认提醒方案（mods 调研，推荐输入框上方横幅）· 10-30；⓪b 看 #191、#192 测试版、选玻璃（?glass=shu / rdev）· 10-30；⓪c 版本管理方案；⓪d 追踪：登录 Meta / GA4 / Shopify，CAPI 选 A/B/C，第 2、3 条说动（accuphy-website/docs/2026-10-30-lab-tracking-check.md）；① PR #30/#31；② LiveScope 7 问（LiveScope 聊天 10-31 建议：1–6 问的是别人视频里的东西，Jason 答不了，作废；第 7 问前提已过期，#137 已定中间色，除非 Jason 觉得颜色不对）；③ 旧事项
> 上线后要做：#191 解锁弹窗上线当天告诉网站 HQ（local_2f48043d-43bf-440c-ba78-2f53beaa0a5a），网站 03 再测真实弹窗（#233 桥已核 9a182111，真实流程没走过）。
> 等 Jason：看 #193 波束里鱼数测试版（5764b06，测试链接 7d52e0c），判断游动是否自然，是否接受未达标的位置（docs/2026-10-31-fish-in-beam-sheet.jpg，docs/decisions.md #193）· 10-31
> 卡住：无。同事 PR #30、#31 只作参考，不合并（Jason 10-30：不要拉进主线）；测试页 pr30/、pr31/ 等 Jason 看完删。待补：#228 第 4 条德/荷/波兰/拉脱维亚界面（不急）
> 本周做完：#190 美国只出 Mini · 线上 5c2e69a，网站 03 复查 310dedd1 · 已核（别的聊天）；#187/#188/#189 线上复查 · 网站 03 3dbfbec5（accuphy-website/docs/verification/2026-10-30-lab-a1fd3ee/result.md）· 已核（别的聊天）；#189 Mini Combo 前后 range + #188 分享改版 · lab.accuphy.ca a1fd3ee（docs/versions.md 10-30 行）· HQ 核过（md5 同测试链接、线上 Combo 两条滑杆、二维码弹框、0 报错）；#173 鱼群第 3 轮、#175 圆形水纹船迹、#178 新全景并进湖面 · 已在线上 8c15c20（/jig/、/pano/ 已下线）· 冰钓窗口核过；#182/#184/#186/#187 去商店按市场、GA4、分享徽章、商店页跳转 · lab.accuphy.ca 8c15c20 · HQ 核过；#185 Mini 测试片 · docs/2026-10-28-ad-mini-test-*-sheet.jpg · HQ 核过；#189 · docs/2026-10-29-plm-combo-two-ranges.jpg · HQ 核过

> **状态栏长版原文（10-27～10-29，整理前，没删）：**
> 状态（2026-10-27 更新）
> 阶段：X-6L Lab 上线执行，目标 10-30 做完、10-31～11-1 真机测，11/2 广告开投；域名定为 lab.accuphy.ca（Jason，经总管）
> 进行中：广告片角上不加 “Simulated demo”（Jason 10-29 经 Klaviyo HQ：“不加”）：烧字幕脚本不改，Mini 测试片照现在的用；广告文字里由 Klaviyo 写一句“视频和演示是模拟的”；其余视频问题在 Klaviyo 的 Campaigns/2026-11 Black Friday/视频问题清单.md，由 BF 营销漏斗窗口逐条问 Jason · 10-29；🔴 Mini Combo 的 range 动不了（Jason 10-29：“forward 的 range 跟 down 的 range 可以分别的调”，要抓紧修）→ 冰钓聊天做完（a1fd3ee，#189，图 docs/2026-10-29-plm-combo-two-ranges.jpg）：电脑两条滑杆 Forward range / Down range，手机每个半屏底下各有 −/+，湖里两道波束和刻度各跟各的，进 Combo 时先按水深自动给值；冰钓页也核过；HQ 看过图，测试链接已更新（84e65df），无头检查英法滑杆各动各的、PingLive 页不变、0 报错；lab.accuphy.ca 等 Jason“动”（会把分享改版一起带上去） · 10-29 起；鱼在波束里扎堆（Jason 10-27 截图 docs/2026-10-27-jason-fish-crowd.jpg）→ 冰钓聊天改好（557f1b2，#173：crappie/黄鲈鱼群散开，最挤的 8 m 格子 13→8 条，数量不变）；第 2 轮对着他截图那个位置（浅滩边往湖中间打 Forward，crappie + walleye + largemouth 一条线）再散开：他那个视角波束里 5–6 条→2 条，开局点船前 7–9→4–6 条（58ea10f）；已上测试链接 /jig/（2418a2d）；Jason 10-27 看后说“又太少了，鲈鱼体型大 1.5 倍”→ 第 3 轮做完（a3abfc4）：密度在第 1、2 轮中间（他那视角波束里平均 1.8 条、快照 3 条，3D 里看到约两倍；开局点 14 m 内 6.2 条），大口/小口黑鲈画大 1.5 倍、回波跟着变大，冰钓页核过；HQ 看过对比图 docs/2026-10-27-fish-round3.jpg，已上 /jig/（06630db，无报错）等 Jason 看；①广告第 3 版（10-27 起归新开的“广告视频制作”窗口，#179，skill ad-video；冰钓不再做广告；它已把工具跑通、深水定格重出和原图一致、15 秒分镜写进 scripts/dev/ads/v3/README.md（662fad9），HQ 看过分镜：4 个镜头，不需要改湖景；Jason 10-27 点头：“三张定格可以，做 15 秒成片”→ 广告视频窗口出了 10 fps 预览（0265bed，docs/2026-10-27-ad-v3-film-preview-sheet.jpg），HQ 核过：结构、节奏、字都对；要改：深水那拍手机在 Reels 底部遮挡区（往上挪）、俯视 135° 扇面太低、小 logo 进顶部遮挡区 7 px、镜头下拉可以更大；改完出 30 fps 竖版、4:5、无字版 → 已出（f8a64bf，reference/ads/2026-11-bf/v3/pinglive-{916,45}-{en,clean}.mp4，各 15–19 MB；HQ 看过 docs/2026-10-27-ad-v3-film-sheet.jpg：手机已在 Reels 安全区内，135° 下拉更大；竖版已发 Jason 看，等他点头；之后英文句子给 Klaviyo HQ 定稿、法文给网站 HQ）；⑥ Mini Forward 不显示大深度数字（Jason 10-27）→ 冰钓做完（#181，9ed9341，HQ 看过对比图）；加载提速 B 也做完（#180，7ae7c72：下载 1122→624 KB，首页出来 1.47→0.90 s）；测试链接已从 9ed9341 重打包（ccac583，11 张首页小图都能载，无报错）；Jason 10-27“动，lab.accuphy.ca 更新到最新版”→ ✅ lab.accuphy.ca 已是 9ed9341（和测试链接、商店页同一版，HQ 核过）；V10 平板测帧率：Jason 10-27“不测平板了先”，先放下；没做的：Mini Forward 右边的 1.0x 放大按钮、Combo 右上的 ACCUPHY 字标：Jason 在冰钓聊天直接给了意见（镜头拉远看全覆盖、别被手机挡、字太小、jig 拍改“Serious deep water ready.”），第 2 轮定格已改好，HQ 核过：四张覆盖范围都完整、字放大了；第 1 轮：定格做好（218e483，#172，docs/2026-10-26-ad-v3-stills.jpg），HQ 核过：开场和 135° 拉到侧面过了；jig 那拍在手机屏上只是坑底上方一个小点，PingLive 版更小、Mini 版大一些 · Jason 10-27 定（#174）：先只做 PingLive 版、做精当样板（Mini 等以后照着做）；110 ft 深坑保留；jig 下落从广告和湖景页面都拿掉（冰钓页的 jig 不动），深水那拍改成只看 90–100 ft 的鱼 → 冰钓聊天做完（9829174）：PingLive Forward 看 110 ft 深坑整个碗形，坑里加了 3 条湖鳟（92–99 ft），读数 101.5 ft，没 jig 没大数字；HQ 核过，三张定格拼成 docs/2026-10-27-ad-v3-stills-r3.jpg 给 Jason 看，等他点头再出 15 秒成片；④湖景统一成一个版本（Jason 10-27 说开始，#176）：规矩写进 CLAUDE.md、标准版清单 docs/lake-canon.md（HQ 起草，冰钓聊天改）、旧冰钓工作副本已存档删掉；冰钓聊天按顺序做：鱼第 3 轮（a3abfc4 ✓）→ 撤湖景 jig（d227262 ✓，HQ 查过湖景代码里没留下，冰钓页 jig 没动）→ 圆形水纹（c9f900b ✓，HQ 看过对比图）→ 广告深水定格（进行中）；HQ 已把 /、/mini/、/ice/、/pano/ 全部从 c9f900b 重打包（测试链接仓库 f297eab，四页都打开过、无报错），/jig/ 收掉、自动跳到 /；/pano/ 留到全景定了；旧私人预览 4 个已删（Jason 10-27：“如果是现在项目需要的话留一个就行了”，测试链接够用，一个不留）；⑤远处的鱼在大量程下又闪又小（Jason 10-27 截图：Forward、160 ft、手机横屏）→ 冰钓聊天做完（#177，26cb429 + 1abeedf）：远处鱼沿声波方向拉长到中间大小，闪烁大幅减少，80 ft 以内不变，全景没动；HQ 看过对比图 docs/2026-10-27-far-fish-flicker.jpg；所有链接已从 1abeedf 重打包（测试链接仓库 b642a6d，四页都打开过、无报错）等 Jason 看；他问波束是不是 135°×20°：是，specs.md 和 devices.js 都是 135°×20°；②全景“声音的图”测试页已上朋友测试链接 /pano/，等他手机对比；③湖景+声纳正式页上线（Jason 10-27：“先接着解决现在场景和声纳的 live page 部分，因为这是广告的基础”）清单：(1) ✅ 全景（283ecb9 换上、旧的和 /pano/ 删掉）：Jason 10-27 在 iPhone 看了 /pano/，定新画法（逻辑对了，#178），要再调画面：石头更亮、黑掉的地方少，照真机录屏学 → 冰钓聊天第 1 轮调好（e5a512c）：石头变亮黄白、硬黑放射条和一圈圈波纹没了、鱼是平滑短划；HQ 看过对比图 docs/2026-10-27-pano-tune-r1.jpg（比 App 录屏还略暗一点）；所有链接已从 e5a512c 重打包（测试链接仓库 08d8f83，四页无报错）→ Jason 10-27：“全景可以了，新画法替换所有页面，旧的删掉”→ 已交冰钓聊天：新画法成唯一全景、删旧拍照法代码和 /pano/ 测试页；做完 HQ 重打包、/pano/ 跳到 /；(2) Forward AUTO 深度（#154）留不留；(3) 真机：Jason 的 iPhone 看一遍测试链接（新水面用半精度渲染）+ V10 平板测帧率（平板要插上电脑，现在没插）；(4) 加载提速 B：Jason 10-27“没问题”→ 已交手机网页端做第 1–3 项（字体子集、SVG logo、缩略图不内联；拆冰钓代码那项归冰钓），build-share.mjs 等冰钓提交完再动；(5) ✅ Jason 10-27 说“动”；全景新画法换上后（283ecb9）HQ 已把 lab.accuphy.ca 更新到 283ecb9（和测试链接同一版，逐字节一致，/embed/ 正常，无报错；交接单 accuphy-website/handoffs/2026-10-27-lab-release-283ecb9.md 请网站 03 复查店铺页）；V10 帧率还没测（平板没插）；加载提速 B 做完后再上传一次；明细见下方“进行中明细”
> 等 Jason：全景新画法手机对比（/pano/）· 10-26 起；船迹：Jason 10-27 定用 #156 圆形水纹替换 #166 Kelvin（#175），跟统一一起做，等他说开始；加载提速怎么排（B 下载减半放 11/2 前，C 冻屏放 BF 后）· 10-26 起；App Store provider token · 10-26 起；Klaviyo 框挪左下角要他在 Klaviyo HQ 说“动” · 10-26 起；#153 新鱼正式页还是旧画法 · 10-26 起；#154 Forward AUTO 深度留不留 · 10-25 起
> 卡住：同事（AJ-nb / Codex）在 GitHub 上有两个没合并的分支和合并请求：PR #30 `codex/lab-clarity-optics`（10-28，操作引导、暂停计时、水面高光、无障碍；没动声纳核心文件；和 main 的 index.jsx 有冲突）、PR #31 `codex/blue-hour-lake`（10-29，Mini 的“蓝调黄昏”展示页，复用原声纳，只改显示比例；带一个商店 section 文件但没传 Shopify；私人预览在 chatgpt.site；docs/decisions.md 冲突）；都不在任何线上链接里；要 Jason 看过才合（HQ 10-29 查过，冰钓聊天也核对：它自己没有 main 以外的版本；“电脑端完整版”的云端分支只有一条备注，没有代码；广告录制的两个湖景副本分别停在 1abeedf 和 479ca21，声纳没另改；冰钓环境包不含声纳）· 10-29 起；分享按钮电脑上改成二维码 + 复制链接（Jason 10-29 提的，HQ 建议：电脑弹二维码和复制链接，手机保持系统分享菜单，链接带来源记号；二维码记不下朋友邮箱，朋友要自己在 Lab 留邮箱）· Jason 10-29“开搞 要做到丝滑 顺畅 无误 的”→ 已派手机网页端（电脑：二维码 + 复制链接弹框；手机：系统分享 + 备用；链接按市场、带 utm；框里复制的备用方案；二维码解码测试）；网站回：iframe 加 clipboard-write / web-share 和桥转发 share 到 Meta/GA4 由网站 HQ 一起问 Jason 要“动”；utm 改成 medium=referral、渠道放 utm_content（已转手机网页端），Klaviyo HQ 核过可以（/fr 记成 bf2026_lab_ca，语言另记；分享链接必须落在店铺页，已是）；手机网页端交了第一版（2abc936，#188，图 docs/2026-10-29-share-popover.jpg）；HQ 核：结构和备用方案对，要改：记号换成 referral + utm_content、/fr 记成 ca、二维码放大到 ≥168 px、链接框显示开头；记号已改好（d6399bb、af47ba6）；6 句法文网站核过（只改第 1 句 “Scannez…”，已转）；第 2 版（db19691）：二维码 168 px、链接框从头显示、去掉 ref=share（Klaviyo HQ 确认没人用，不用加回来），HQ 看过新图；法文已换（2408b81）；测试链接已更新（ae476ba），HQ 无头检查：美国/法文/加拿大三种地址和记号都对、复制一致、Esc 关、0 报错；Jason 10-29：“手机也用二维码和copy”→ 手机网页端做完（7390d39），测试链接已更新（2a9f871），HQ 手机尺寸无头检查英法都对；手机那句法文网站核过，改成 “Un ami peut scanner ce code avec l’appareil photo de son téléphone.”（已改进去 dfeef9f，测试链接 f83f012）；分享改版全部做完，lab.accuphy.ca 等 Jason 说“动”；iframe 权限和桥转发 share 在网站 HQ 等 Jason“动”；干净展示版（不带去商店、徽章、分享）：Jason 10-29“不用了” · 10-29 起；“去商店”改由商店页面跳转（网站 #229，Jason 10-29 在网站 HQ 说“好的”）：手机网页端做完（8c15c20，#187），HQ 核过、测试链接已更新（51ba917）；✅ Jason 10-29“动”→ lab.accuphy.ca 已是 8c15c20；网站的桥还没上（店铺对网站 00 限速 429，新版在预览副本里等），在那之前 Lab 照旧 1 秒后自己跳，访客不受影响；桥上线后网站 03 点一遍写进交接单 · 10-29 起；分享链接 + App 徽章（#186，手机网页端 9515f47，Jason 选了“方案一”店铺风格）：Jason 10-28 看图说“可以更新徽章”，“动”→ ✅ 已和“去商店”修复一起上 lab.accuphy.ca（1e32b6b）；Google 徽章已调到和苹果同高（ad8809b，HQ 看过新图，已发 Jason）；法文网站核过：小字改 “TÉLÉCHARGER L’APPLICATION ACCUPHY SONAR”，“Partager” 通过（已改进去，1e32b6b）；· 10-28 完成；“去商店”按市场（网站 #228，Jason 在网站 HQ 说“修复”）：手机网页端做完（1fc1678，#182，16 条测试全过）；HQ 核过、测试链接已重打包（bb1aa31），点按钮去 /de-de/products/…；✅ Jason 10-28“动，更新”→ lab.accuphy.ca 已是 1fc1678（HQ 核过：?shop=/en-us 点按钮去 /en-us/products/…）；等网站 03 在各市场商店页点一遍；#228 补：GA4 漏记 shop_click（openShop 只等 150 ms）→ 手机网页端做完（479ca21，#184），HQ 在测试链接上核过（连点 3 次只发 1 个点击，1 秒后跳，法文字变了）；测试链接已更新（0fd7281）；✅ Jason 10-28“动”→ lab.accuphy.ca 已是 1e32b6b；网站 03 复查（66375b91）：电脑英法徽章、Partager 都在；手机徽章要先点一个视图才出现（设计如此，HQ 已复现并回复）；GA4 lab_shop_click 英法都还没抓到（Meta、Shopify 有），网站 00 在查是测法还是真没发，先别改；法文“Ouverture de la boutique…”网站 10-28 核过（#198） · 10-28 起；X-14L 黑五扩到美国 + 欧洲 6 种语言（总管 10-28）：方案已写 docs/2026-10-28-bf-scope-expanded-plan.md；Jason 10-28 经总管定“先上加拿大和美国”（11-02），欧洲排后面、做好一个问一个；11-02 前 Lab 要赶：美国 Mini 广告片（只推 Mini；分镜已写 scripts/dev/ads/v3/README.md “Mini US”，d26ddd3，HQ 看过：4 拍，主打 Live Combo 前后两道波束同时打开“AHEAD + BELOW”，深水用 Live Down，不需要改湖景；等 Jason 说 PingLive 片的修改和开拍）+ 加拿大英法；Google Ads 也投（Jason 10-28 经总管：“也投 Google”），和 Meta、YouTube 一起 11-02 先投加美；Google/YouTube 要横版 16:9 和方图 1:1，我们现在只有竖版 9:16 和 4:5，Klaviyo HQ 会来要素材；总管 10-28：10-31 前要 16:9 横版（YouTube 插播）两条：加拿大 PingLive、美国只用 Mini → Jason 10-28：广告片交给同事孙英杰（GitHub AJ-nb）去优化（#183），HQ 不再问 v3 改哪里；广告视频窗口暂停；Jason 10-28 经总管：11-02 先用现有第 3 版上，孙英杰改好再换；Carl 10-30 送审；现有成片：v3 PingLive（9:16/4:5，英文+无字，没法文，只能投加拿大）+ #168 黑五短片 ice/boat/mini（18 个，英法齐，美国用 ice、mini；boat 是旧全景画面、mini 有大深度数字，Jason 没看过）；v3 法文版已做完（d6d7fb3，网站核过的法文）；之后 Jason 10-28 在广告视频窗口定 #185：广告片不再做各种版本（不做多语言、Mini 美国、1:1），最多一条片子跑通漏斗和投放测试（竖版横版可以），Jason 10-28：“用 Mini 的片子”→ 这一条 = PingLive Mini 测试片（加拿大、美国都能投），广告视频窗口已做完（reference/ads/2026-11-bf/mini-test/，9:16 + 16:9，各有英文和无字），HQ 看过两张样张（docs/2026-10-28-ad-mini-test-{916,169}-sheet.jpg）通过，已放共享盘 https://drive.google.com/drive/folders/1jNYiKwKVre8dh-Z8BP0HDhVGHiuLAJfZ（5bfe719）；竖版已发 Jason；法文版文件留着不往外推；Jason 10-28 定范围：所有广告片的单一语言母版（PingLive v3、美国 Mini、16:9/1:1）归孙英杰，Jason 和他商量改法；Lab 用定稿母版做各语言版本（#183，规矩已写进 CLAUDE.md 和 ad-video skill）；广告视频窗口算过（e613f71）：方图 1:1 从现有画面裁，每片 1–1.5 h；横版 16:9 要重录，每片 3–4 h；两片四种格式共 9–11 h；片子都没声音，YouTube 插播通常有声，要不要配音乐/声音待定（问 Klaviyo HQ/Jason）；预算/匈塞爱/波兰在哪买还在问；AJ-nb（孙英杰）规矩已写进 CLAUDE.md（#183，Jason 10-28 邮件原文）；main 要不要在 GitHub 上加保护未定 · 10-28 起；广告成片（黑五 v3 4 个、Mini 介绍片 v6）IT & HR 已放共享盘 Accuphy Public Drive → Marketing（草稿），以后新版本放同一位置：黑五 v3 https://drive.google.com/drive/folders/1qAXHSENYbUzx8SuMWsG_9Qa2xXxyb94h ，Mini v6 https://drive.google.com/drive/folders/15yVi_uxJ2nqoJUxNl_rsiy2lTVJtQ-SO ；仓库已转到公司组织 accuphy-marketing（IT & HR 10-28），本机地址还是旧的（会自动跳转，没坏）；Jason 10-28：“先不改”，继续用旧地址（GitHub 自动跳转，推送正常） · 10-28 起；无（网站在做店铺页 3 个文件和转交代码，交接单 `accuphy-website/handoffs/2026-10-23-lab-store-page.md`）
> 本周做完：X-6L Lab 上线 · https://lab.accuphy.ca 新版（按钮 B、accuphy:lab、/embed/）· docs/versions.md · HQ 自查（四个地址 200、头信息对、Vercel 显示配置正确），网站 HQ 也核过；网站预览里的框已经换成 lab.accuphy.ca；#102 Lab 上 Vercel · https://accuphy-lab.vercel.app（docs/versions.md）· HQ 自查（三页 200、头信息对、无报错），未经别的聊天核；#150–#156 · `docs/decisions.md` #150–#156 + 各自的提交 · 自称（还没别的聊天核过）

> **进行中明细（2026-10-27 整理前的原文，没删）：**
> 全景方案 A 测试页：全景“声音的图”测试页（方案 A，#171，2d48393）已上朋友测试链接 https://jasonzhu-ctrl.github.io/accuphy-lab-test/pano/（一打开就是 PingLive 全景、新画法默认开着；左下角按钮切“现在 / 声音的图”）· HQ 核过：页面无报错、开关能切、新全景能出；对比图 docs/2026-10-26-panoramic-sound-picture.jpg；他点头后才搬正式湖面；只动夏天湖面，冰钓页代码路径不走（uPano=0）；手机每帧 +0.75 ms，V10 没测 · 10-26 起
> 其余：调研 docs/2026-10-26-panoramic-rethink.md；广告第 2 版因此开场改用 Forward 声纳、“3 VIEWS”一拍改 Down（简报已改）；BF 广告改做法（Jason 10-26：不要对话框，用大号动效数字 + 要点）：方案 docs/2026-10-26-ad-draft-pinglive-plan.md，HQ 的 6 秒样片 Jason 看过，HQ 自评“广告 5 分”；Jason 10-26“做吧”→ 第 2 版（声纳全屏开场、数字落定对画面、无 UI）派给冰钓聊天；三张定格 HQ 核过后 Jason 10-26 看了说“还是不太行”：放大声纳开场糙、135° 要从上往下再拉到侧面看 coverage 块、230 ft 是理论值有过度宣传味道改成深水看 jig/鱼 → 第 3 版方向写在简报末尾（开场湖景侧面、135° 镜头大拉、深水 jig 掉到 100 ft 不打大数字）· Jason 10-26 定“做，jig 从船上掉到 100 ft”→ 第 3 版派给冰钓聊天（深坑 + 船上下饵 + 侧面开场 + 135° 镜头大拉），先交 3 张定格；估计：湖最深只有 79 ft，要挖一块 ~110 ft 的深坑（1–1.5 h，冰钓页共用地形，#94 两边 QA）+ 船上下饵移植冰钓的 jig（1.5–2 h）+ 两页 QA（1 h）≈ 半天，再加录这一拍 ；字体改用 Creative Cloud 激活的 URW Eurostile Heavy（local()，HQ 测过能取到），不再用没核过授权的 .otf；简报 docs/2026-10-26-ad-v2-pinglive-brief.md；旧的 18 条（5c15d73）先放着；新鱼（#153 第 3 轮，86e565c）搬进正式湖面和冰钓页 · Jason 10-26“对，把第 3 轮这一版的鱼搬进正式页面”· 冰钓聊天先做这个再录广告；BF 漏斗补充（Klaviyo 交接 handoffs/2026-10-26-bf-funnel-lab-extras.md）：录屏素材 10-30 → 冰钓聊天（修完 iPhone 问题后）；Meta 内置浏览器、分享按钮、App 徽章 → 手机网页端（加载查完后）；11/1 前带 Jason 真机测；iPhone 问题①②修好（afa047a，#166），已上朋友测试链接（19202b6）等 Jason 再看；③加载偏慢 → “手机网页端”先量再出方案；修好前不上 lab.accuphy.ca；湖面波纹 · ABYSSAL 版 Jason 10-26 说“可以”（#165，只在本地）；上线前必须：V10 实测帧率 + iPhone Safari 看一眼（用到半精度浮点渲染）；退路是第 3 版 1daaa8b；开源 ABYSSAL（MIT，GitHub API 核过）待定；湖面接免费的天空照片 + 水波法线图 · 做完（30c17d0，#162，只在本地，+154 kB，许可证在 assets/LICENSES.md），HQ 看过；湖面 B+C · 做完（e9505ae，#161，只在本地），HQ 看过对比图；真机帧率还没测（平板不在）；拖船提示停船后重新出现 · 做完（250016d，#160，只在本地），跟下一次上传一起上线；X-6L-fr Lab 法文版 · 网站核过的字表已搬进代码，HQ 核过（7ffb475）；上线后复查 frame-ancestors（网站要在 myshopify 预览和主题编辑器里测，所以留着 *.myshopify.com、admin.shopify.com；网站不再需要时再收紧）；X-6L-2/3/4 · 代码做完，HQ 核过（#157，0f74eb7…4991453），按钮方案 B 已做完，HQ 核过（afc9af3，docs/2026-10-25-shop-button-final.jpg）；等 Jason 说“动”再上传 Vercel；#153 鱼回波 · 私密预览；冰钓页 · “冰钓版本视觉效果”
> 等 Jason 原文：“电脑端完整版”（云端聊天，Lab HQ 看不到）做的版本要合并：要他同意 HQ 打开远程连接去问，或者他自己转告 · 10-26 起；加载提速怎么排（HQ 建议：11/2 前做 B 下载减半，C 冻屏 2.2 s 放 BF 后；封面 A 已在 #167 做了）· 10-26 起；只在测试页（lab=fish），正式页还是会抖的旧画法（#120）· 10-26 起；App Store 的 provider token（App 徽章用，没有就先不带）· Klaviyo 框挪左下角要他在 Klaviyo HQ 说“动” · 10-26 起；C 的船尾浪和 #91 去掉的“三条射线浪”要分清）· 10-26 起；做不做法文版（网站可以在框网址上加 ?lang=fr）· 10-26 起；#153 · 新鱼回波看法 · 10-24 起；#154 · Forward AUTO 深度留不留 · 10-25 起

> **电脑端完整版（云端聊天）→ HQ（2026-10-27，跨聊天消息发不过去，按惯例写在这里）：** HQ 已读（2026-10-27），已放进“等 Jason”。 Jason 在这个聊天说："你这里这种圆形往外散的这种水波纹，我觉得效果特别的好，是可以替代他那边那个方案的。" 他看的是私人预览 https://claude.ai/artifact/VxxnVnZr8cxQLXw3iizMdD（10-25 从 1c0ba1c 打的包，湖面停在 #156）。调研结果：#156 之后湖面在别的窗口又走了 #161–#166（照片天空、FFT 风浪、Kelvin 船迹），所以两边看起来不一样；#161 写了"The old round rings are gone"。他点名的就是 #156 的船迹：船移动时从船身往外一圈圈散开的圆形水纹（`Scene.jsx` Water 片元着色器，7ae1edd：`g += uWake * 0.35 * cos(dB * 2.0 - t * 5.0) * exp(-dB / 6.0) * rb / dB;`，dB = 到船的距离，uWake 跟船速、停下后约 1/3 s 淡出）——是改法线不是改颜色，所以在新的天空反射和 FFT 风浪上也能直接叠。拖船提示那圈"每 2.6 s 一次的涟漪"两边都有，不是区别。建议：用这个圆形散开的船迹替换 #166 的 Kelvin 船迹（或做成开关让他比），其余 #162–#165 的天空和风浪不动。请 HQ 定怎么派单；Jason 还需在 HQ 说"动"。
> **手机网页端 → HQ 的回报（2026-10-26，消息发不出去，按 HQ 说的写在这里）：** HQ 已读（2026-10-26）：发不出去的原因是那个聊天的跨聊天消息要 Jason 在它那里点同意；914c570 把它暂存的文件扫进去是 HQ 的错，已在 CLAUDE.md 加规矩。
> - `X-6L-fr 第 2 轮 | 网站核的 A–D 全部搬进代码，7ffb475，#159 补了"网站核过"一段 | docs/2026-10-26-lab-fr-screens.jpg，docs/2026-10-25-lab-fr-strings.md 每行标了出处；max 提示 en/fr 都删，冰钓 39° × 20° 只改文字，60 ft 去掉；"Pêche sur glace en direct" 折两行不出格，无报错 | 需要：Jason 说"动"后 HQ 上传，再请网站 03 看 /fr/pages/lab`
> - `LAB-load | 量完、写完、没改代码 | docs/2026-10-26-lab-load-time.md：两个链接一样快（4G 下载约 1.0 s）；首页 1.45 s、湖面第一帧 3.7–4.1 s，中间主线程冻 2.1–2.4 s（地形噪声、three.js 同步查着色器、logo 贴图、鱼/船/FFT）；1.05 MB 里代码 0.49、字体 0.31、logo 0.12、缩略图 0.19 | 需要：定 11/2 前做 A（封面）+B（下载减半）还是 11/2 后连 C 一起；A 的分帧和 C 要动 Scene.jsx`
> - `BF-3 Meta 内置浏览器 | 封面 + WebGL 掉线卡片 + innerHeight 高度，693f1e8，#167 | docs/2026-10-26-lab-cover.jpg；4G 模拟封面 0.64 s 出现、第一帧后 0.3 s 淡出；WEBGL_lose_context 实测卡片出现、恢复后重挂 | 提醒：HQ 的 914c570 把我暂存中的 4 个文件一起提交了（半成品，现已补全），请只 add 自己的文件；没做：便宜手机降 dpr（Scene.jsx，冰钓聊天）和"10 秒看到鱼"，请另派。接下来做分享按钮、App 徽章的两个样子`
> - `BF-1/2 分享按钮 + App 徽章 | 两个方案做好，默认不显示（?extras=a|b 才出），提交见 git log，决定 #169 | docs/2026-10-26-share-badges-options.jpg（A：面板里 / 手机框上；B：玻璃工具条）；分享走系统分享，没有就 WhatsApp / 短信 / 复制链接，发的是 shop.accuphy.com/pages/lab?ref=share，事件 share 带 channel；徽章 Google Play 带 utm_source=accuphy-lab，App Store 等 provider token | 需要：Jason 选 A 还是 B；法文字（Envoyer à un ami 等）请网站 HQ 核`
> - `手机二维码说明法文核稿（消息发不出去，按规矩写这里）| fr = “Un ami peut scanner ce code avec l’appareil photo de son téléphone.”，待核标记删了，i18n.js 已无待核 | 提交 dfeef9f | 需要：HQ 重打包`
> - `手机也用二维码 + 复制（Jason 10-29 在 HQ）| 手机的 Share 打开和电脑一样的弹窗（二维码 + 链接 + Copy），居中、不压去商店胶囊和徽章；系统分享和 WhatsApp/短信都去掉；手机说明“Let a friend scan this with their phone camera”，法文一句待网站核；#188 补记 | 开发页 390×844 英/法、打包页在类店铺框里真点（带/不带剪贴板权限）：弹窗 207–570 px、二维码 172 px、复制成功、点外面和 Esc 关；电脑和冰钓页不变、0 报错；图 docs/2026-10-29-share-popover-phone.jpg | 需要：网站核那一句法文；HQ 重打包；lab.accuphy.ca 等 Jason 说“动”`
> - `“发给钓友”重做（Jason 在 HQ：开搞）| 电脑：弹窗 = 二维码（页面内生成，qrcode-generator MIT）+ 说明 + 只读链接 + Copy link→Copied ✓ + 提示；×/Esc/点外面/再点关闭，焦点进出；电脑绝不调系统分享。手机：系统分享；没有或被拒→同一弹窗不带二维码（链接 + Copy + WhatsApp + 短信）。链接按市场：shop.accuphy.com<root>/pages/lab?ref=share&utm_source=lab_share&utm_medium=qr|copy|native|whatsapp|sms&utm_campaign=bf2026_lab_<市场>；事件 share {channel, market}；复制三级退路（clipboard→execCommand→选中文字提示 ⌘C）；#188 | share-url-test 9/9（每个市场的二维码用 jsQR 解回来一字不差）；开发页 Chrome 电脑英/法、手机系统分享和退路、冰钓页、无报错；打包页在类店铺框里真点：弹窗 + 二维码、复制成功；Safari / Firefox 没跑（机器上没有 Playwright）；包 +17.7 KB gzip；图 docs/2026-10-29-share-popover.jpg | 需要：HQ 看图、确认 utm 名字（Klaviyo / 网站）；网站核 6 句法文；网站给框加 allow="clipboard-write; web-share"；HQ 重打包；lab.accuphy.ca 等 Jason 说“动”`
> - `去商店改由店铺页面跳（网站 #229）| shop_click 多带 url；框里等店铺回执最多 400 ms（只认父窗口、店铺来源），收到就不自己跳；没收到照旧 1 秒后自己跳；主题内嵌和单独打开不变；#187 | 假店铺页 + 无头 Chrome 四种情况：有回执→不跳、字和防重复照旧；无回执→1020 ms 自己跳；兄弟框发的回执→不认、1018 ms 自己跳；别的类型消息→不认；shop-url-test 16/16 | 需要：网站的桥先上，再 HQ 重打包 Lab；lab.accuphy.ca 等 Jason 说“动”（最好 10-31 前）；上线后网站 03 按交接单在三个市场页点一遍`
> - `分享链接 + App 徽章重做（Jason 10-28：之前两版“太 AI 了”，定方案 1 店铺风格）| 玻璃条和胶囊都去掉：电脑在面板“去商店”下面放小字 GET THE ACCUPHY SONAR APP + 官方徽章 40 px + 文字链接 Send to a friend；手机徽章在右上角、Share 文字链接挨着去商店胶囊；默认显示，?extras 开关删了；#186 | docs/2026-10-28-share-badges-store-style.jpg 已发 Jason；电脑/手机、英/法、湖/冰都看过，无报错；查过苹果徽章规则（≥40 px、留白 1/4）和 Strava / 店铺页脚的写法 | 需要：Jason 看图点头；网站 HQ 核两句法文（Téléchargez l’application Accuphy Sonar、Partager）；HQ 重打包`
> - `去商店等 1 秒再跳 + “正在打开商店…”（网站 #228 第二部分）| embed.js 150 ms→1000 ms，跳转前再点无效，返回（bfcache）后复位；按钮两种位置都显示 Opening the store… / Ouverture de la boutique…（法文请网站 HQ 核）；#184 | 打包页无头 Chrome：点 1 次后字变了、点 3 次只发 1 个 shop_click、跳转在点后 1006–1030 ms；浏览器里手机胶囊点了真跳到店铺，返回后按钮恢复 | 需要：HQ 重打包（embed 也重打）；lab.accuphy.ca 等 Jason 说“动”；网站核法文；提醒网站：?lang=fr 时 Lab 请求的是 /fr/products/…，店铺给了英文页（店铺自己的语言跳转）`
> - `去商店按市场（网站 #228）| embed.js 的 shopUrl 认店铺传的 shop（页面网址 ?shop= 或挂载元素 data-shop），匹配 ^/([a-z]{2}(-[a-z]{2,})?)?$ 就按它拼，否则照旧（fr→/fr）；店里仍不加 utm；#182 | scripts/dev/shop-url-test.mjs 16 条全过（/、/fr、/en-us、/de-de、/fr-benelux、/en-pl、/en-ro、坏值 2 种、缺省 2 种、data-shop、大写、Mini、独立打开带 utm）；打包页无头 Chrome 点按钮：?shop=/de-de → shop_click {product: pinglive-sonar, placement: panel, lang: en} 然后去 /de-de/products/pinglive-sonar；?shop=/en-us&lang=fr → /en-us/…；只 ?lang=fr → /fr/… | 需要：HQ 重打包测试链接；lab.accuphy.ca 等 Jason 在 HQ 说“动”；上线后网站 03 按交接单在各市场点一遍；第 3（market=us 默认 Mini）、第 4 项（德/荷/波/拉界面）没做`
> - `加载提速 B | 第 1–3 项做完：字体子集 woff2、logo SVG、缩略图外置，f755df1 + 本次提交，#180 | 4G 模拟（gzip、3 次中位数、对 9a222aa）：下载 1122→624 KB、页面到手 1.17→0.63 s、首页 1.47→0.90 s、第一帧 4.34→3.67 s；docs/2026-10-26-lab-load-time.md 第五节；湖面、冰钓、法文、内嵌版都过了，缩略图 11 张全出、无报错 | 需要：HQ 重打包四个链接（页面旁多了 pages/home/ 文件夹，整页上传时一起传）；拆冰钓代码（第 4 项）归冰钓聊天；私人预览 accuphy-lab.html 还是单文件`
> - 给冰钓聊天：index.jsx / AppHome.jsx / ShopButton.jsx / embed.js / i18n.js 已释放；冰钓页的步骤卡、提示、相机胶囊文字现在走 i18n.js 的 t()，以后改文字请改 i18n.js 的 en/fr 两条。

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- 🔧 (#171 built on the test page `#2026-10-26-sonar-pano-echo` / `lab=pano`, 8b6bb50; on the friends' link at `/pano/` for Jason's phone compare, HQ checked it loads and switches; waiting for Jason's verdict before it moves to the live lake) **Panoramic looks bad on the phone (Jason 2026-10-26 in the 冰钓 chat: 画面逻辑的根源问题).** Root
  cause found by 冰钓: Panoramic is still a plan-view photo of the 3D models (#7.13: top depth map, geometric shadows, #120
  ellipse fish) while Down/Forward are already sound pictures (#148 arcGrain, #153 fish). Plan A: redraw Panoramic with the
  Forward pipeline laid flat (test page first, phone compare, then live). Plan B: phone-only patch (soft shadows, filtered
  map, shorter start range) that keeps the circles and balls. `docs/2026-10-26-panoramic-rethink.md`, board
  `docs/2026-10-26-panoramic-refs.jpg`. Summer lake only (no Panoramic on the ice page).
- 🔧 (#153, on the local test page `#2026-10-24-sonar-fish-echo` — fish from their 3D bodies, smooth ping to ping; waiting for Jason's verdict) **Fish marks tremble (Jason 2026-10-24: 鱼还有不停的颤抖).** Measured at his spot (PLM Forward 90 ft, boat −12.3, 20.4, 45
  frames at 30 fps): every 1/8 s a mark gets new speckle, its outline swings 168–454 px (2–3×), brightness ±25 %, centre
  jumps up to 10 px — same on #128, #139 and #150, so it dates from #120 (per-ping speckle + ragged rim + `fl` flicker +
  tail wag + 0.2 s ghost). Proposal: blend ping to ping instead of jumping, calmer rim, smaller flicker. Waiting for Jason's go.
- ✅ (#154) **The far bottom vanished in Forward past 100–200 ft and turned into "一大群鱼" (Jason 2026-10-25).** A band along the real
  bottom now fills in from ~60 ft, softer and weaker with distance. ⬜ **Open for Jason:** at the phone start the bottom
  behind the island is deeper than the 25 ft AUTO depth (#41: AUTO follows the water under the boat) and leaves the screen
  at ~95 ft — keep (like the app) or let Forward AUTO keep the bottom ahead on screen?
- ✅ (#155) **The small wreck was too simple (Jason 2026-10-25).** A real workboat: decks at three levels, a wheelhouse with windows, rails, mast, gantry.
- ✅ (#156) **The lake surface looked odd (Jason 2026-10-25: 可能跟底部的纹理有关).** Wood-grain stripes on the lakebed removed; the water column
  tints the bottom (shallows clear, deep dark); a wind-sea surface with sky reflection.
- ✅ (#152, fixed: the rows' gaps are filled; holes 9.5 % → 2.3 % at the rocky spot) **Thick bottom bands turn into a net with holes since #148 (Jason 2026-10-24: 底部在某些区域很虚).** Deep or
  side-sloping bottom (his spots −5.4, −8.2 at 46 ft and 15, −2.2 at 30 ft with rocks): #128/#139 drew a solid band,
  #148's arc grain leaves dark holes between the arcs there; the thin shallow band is fine. The grain is the LiveScope
  chat's active work — who fixes it is Jason's call.
- ✅ AUTO depth on PL Forward: bottom kept at ~80 % of the screen in deep water; sound reaches the whole picture box; the 3D curtain = that box (decision #38)
- ✅ AUTO depth follows the depth readout under the boat, like the app, not the deepest bottom in the picture (decision #41)
- ✅ Shallow water no longer blows out: near-range gain on bottom and structure echoes (decision #42)
- ✅ Panoramic shows only what the 5°–25° beam covers; the curtain matches the picture box (decision #44)
- ✅ Panoramic background looks like sonar again: soft cross-beam speckle up to ~35 m, radial streaks only at long range, no weed clumps, soft shadows (decision #46)
- ✅ Faint Panoramic sidelobe near the boat (≈ 0.8 from 25°, gone by 60°), like the app's lake recordings
- ✅ Down View AUTO range: the range in use never leaves the bottom off screen; the phone shows AUTO when it is raised
- ⬜ Down / PLM views: the app also draws echoes out to the screen corners beyond the range (PL Down 12 m frame, `reference/app-study/pl-down-menu.jpg`); the engine still cuts at the range arc there. Apply the box rule + box-shaped curtain to those views after checking the 3D look with Jason
- ✅ Big fish bloom: bigger marks for big fish only (musky ×1.9, chinook ×1.6, bass ×1.1), range logic unchanged (decision #39)
- ⬜ Panoramic in dense bait: the 64-mark cap is reached at ~15 % of boat positions (120 ft), so the weakest dashes drop out; raise to 96 if phone fps allows
- ⬜ Deep water: the bottom band gets thick where the lake floor slopes sideways (the 20° slab is ≈ 11 m wide at 31 m). Physically right, but check against a deep app recording (all current app frames are ≈ 10 m)
- ✅ Panoramic rebuilt as a plan-view photograph; fish = analytic persistence streaks with shadows in all views (decision #36)
- ✅ Fish marks rebuilt from the beam's point spread (decision #120, `sonar-style.md` §7.19): needles along the arc far out, body and heading near, swim-bladder kernel, aspect swing ~17–20 dB, per-ping speckle and activity flicker, tail beat, faint 0.2 s ghost; Panoramic streaks along the arc (§7.13 corrected). Jig unchanged
- ⬜ #120 on a real phone: fps of the new fish shader on the Android baseline (`sonar-page-real-device-perf` memory) and a look on an iPhone; only checked in headless SwiftShader so far
- ⬜ #120 follow-ups if Jason wants more: per-species looks (walleye hump, musky torpedo, bait sparkle cloud with crisp herded edges), fish fading as they cross the slab is already physical (slab weight) but untested against a recording
- ⏸ Bake-off with another vendor's AI (Codex / Cursor / Gemini) on a clean copy of the Lab — plan archived in `docs/bakeoff-plan.md`, not started (Jason 2026-10-23: 先存档不做). Do nothing until he says go
- ✅ Sonar picture measured against LiveScope and the app; water-column specks; fish cores smoother (decision #129, `sonar-style.md` §7.20)
- ✅ Study LiveScope video directly — done 2026-10-23 on the Mac (11 recordings, 44 frames, `docs/livescope-study.md`). Still missing: no MEGA Live 2 / LVS62 / LVS32 recordings found (LiveScope chat, re-checked 10-31).
- ✅ Panoramic wreck: the 40 m cargo ship (decision #38) now shows hatches, masts and deck gear from above like the app's 35 m wreck. It lies at ~36 m; moving it shallower stays Jason's call
- ⬜ Small far fish still show a faint dot grid inside the blob: the 24 sampled thickness rows miss a 4-row-tall bait fish depending on where it sits → fix with a column-reduction pre-pass (per angle column: fish coverage + nearest fish depth over all 128 rows), then one fetch per tap
- ✅ Public UI trimmed to Device / View / Range; colour map, gain, contrast, noise, depth axis are `?dev` only (decision #34). No TVG, no tuning controls on the page
- ✅ Brightness/orange balance calibration: LUT-index histogram of the confirmed frames vs the engine (`__sonarHist`), default map = Moreland_Black_Body, uGamma 0.8 (§6.11)
- ⬜ Re-run the histogram check on a wreck-in-view scene (the wreck scene used had mostly bottom in the fan) and after any pulse/tail change
- ✅ Range vs depth-range behaviour measured on the app (§6.9) and mirrored: PL Forward has its own Depth slider (vertical scale only), near-field rays sized in metres, structure echoes ×0.8 (case-2 verdict)
- ✅ Contrast + Noise Reject controls (Tune row) mapped to the app's tone curve per Jason's tuning strategy (`sonar-style.md` §6.5); defaults gain 57 / contrast 40 / noise 30 after the confirmed ideal picture (decision #28)
- ✅ Side-by-side checks vs the confirmed frames — running loop, composites in `reference/engine-compare/`
- ✅ **Sonar screen rework** (2026-09-24, after the tablet study): screen box per view fills the display with independent axes (`screenLayout` in `SonarScreen.jsx`), dark-red noise floor with radial streaks (mottled for PLM Down), thick bottom band with tail + faint second echo, near-apex rays, PLM Forward apex top-left, PLM Down stretched to the screen corners, Combo two-panel with the grey diagonal. Root cause of the old "small fan in black" picture: the screen-box code had been dropped by mistake in commit 4952966 (phone restyle)
- ✅ Fish echoes v3 (photograph model §7, decision #32): true size in the sonar pass, silhouette ⊗ beam/pulse blur, solid lumpy soft-rimmed marks; verified vs the Down-view near-field recording with `?fishtest`
- ✅ Colour: `garmin_amber` measured from LVS34 footage is the default (decision #33); `accuphy_red` demoted
- ✅ Fish texture rounds 3–5 judged by Jason (solid core, rim bites, short marks, sharp structure)
- ⬜ School stacking (overlapping dashes brighten) — still open
- ⬜ More LVS34 study: near-field fish blobs in Garmin's Down mode, bottom-band fibre density, the dark-red haze rays (yt-dlp is installed: `~/Library/Python/3.13/bin/yt-dlp`)
- ✅ Small/far fish: full-brightness beam-width dashes (max tap), 128-row depth strip so bait fish are not dotted; head-on fish flicker ping to ping
- ⬜ Bottom band white tip a little too wide vs the app
- ✅ Surface clutter streak under the transducer (side views)
- ✅ Combo (PLM): two-panel layout — Down panel lower-left (R/3, stretched ×2), Forward upper-right, shared apex at x≈20 %, grey double diagonal to x≈0.8 at the bottom
- ✅ Forward View screen: apex ~20 % from the left, like the recordings
- ✅ App chrome on the phone inset (`SonarChrome.jsx`, 2026-09-24): italic rulers on three edges from the live screen box, live depth readout (water depth under the transducer), temp/voltage, wordmark + `1440p (QHD)` tag, range −/+, pause, gain −/+, back, ⋯, PL-Forward depth-range control, Combo variant
- ✅ App buttons on the phone are display-only (42 % opacity); a tap opens the sign-up gate, the picture freezes until sign-up (decision #38)
- ⬜ Klaviyo: Jason creates the list "Accuphy Lab sign-ups" (name per decision #43), picks single/double opt-in, sends the public key + list ID → paste into `signup.js` (`docs/signup-klaviyo-plan.md`)
- ⬜ Before public launch: decide on a quiet "No thanks, just exploring" link under the sign-up button (GDPR consent-wall risk, plan §4)
- ✅ App tone curve adopted (log compression + gain/dynamic-range window → LUT)
- ✅ All 11 app colour maps available on the phone screen (amber default); gain slider

## 3D lake (Phase 3 polish)
- ✅ Rocks rebuilt in code as Shield boulders, six shapes; the old dodecahedron shards are gone (decision #133, `rocks.js`)
- ✅ The drag cue is a thin reticle on the water round the boat with one plain caption, no glass pill (decision #132; Jason picked it from four mock-ups)
- ✅ `lakeMaterial.js`: the speckle and bark grooves ran after `base` was computed, so no surface texture ever showed; fixed (decision #136)
- ⬜ Rocks, if Jason wants more: per-instance colour (needs instanceColor in lakeMaterial), lichen/algae bands, a few split boulders
- 🔧 **Boat + fish plan (2026-10-03):** `docs/boat-fish-plan.md`. Boat decided (#83): a low-key bass boat; no raised
  bow, no Power-Poles; the trolling motor and transducer stay as they are. Fish decided (#85): all species stay, yellow
  perch and northern pike join in phase 3, display size per species (musky 2.2× (#89), the rest 2.6×). Four phases:
  - (1) ✅ **built (#86), waiting for Jason's look:** the bodies swim with a travelling wave on the GPU, the tail beat
    follows the speed, the body curves into quick turns, the wrong-axis "wag" is gone, lighter smelt (−13 % triangles).
    The files it took are free again. Still open: Jason picks the musky's size (2.6× / 2.2× / 1.9× side-by-side).
  - (2) ✅ **built (#88), waiting for Jason's look:** a low-key bass boat lofted in code (V hull, strakes, flat sheer,
    flared bow), new decks, consoles, seats and outboard. The trolling motor and transducer are unchanged; there is a
    gentle bob and a foam line when dragged (the V wake was removed in #91). The files it took are free again.
  - (3) ✅ **built (#90), waiting for Jason's look:**
    - eyes, spiny + soft dorsals, pelvic and adipose fins, see-through rayed fins, round spots;
    - walleye on its own body; new yellow perch (25) and northern pike (4); walleye 16; smelt 137.
    The files it took are free again.
  - (4) optional: world edge, depth light, caustics, weeds.
- ✅ **Middle of the lake: a gentle slope into the deep (#92), waiting for Jason's look.** #91 made the middle a 20–29 ft
  valley and removed the wake streaks; Jason found the middle too flat and shallow and marked the area that should ease
  into the deep ("相对缓慢得向深水过度"):
  - now ~30 ft by the shelf–island line, ~36 ft at the boat's start, 50–60 ft by the north edge of his area, the floor
    at ~78 ft; 10–20° slopes nearly everywhere; shelf, island (15 ft), deep floor and wrecks unchanged;
  - the sonar bottom re-tuned for the new depths (PingLive and the Mini), all views back in their old ranges;
  - still for Jason to judge from #91: the calmer Down picture over the island, Panoramic lit over most of the screen.
- ⬜ **Desktop: range on the phone + phone size (approved #84, plan B; the local phone-layout chat builds it):**
  `docs/desktop-phone-controls-plan.md`. The desktop counterpart of #78/#79:
  - the panel's Range row goes, and the app's own −/+ on the phone set the range;
  - the app control set scales 1.3× on desktop (range ring ≈ 16 → 23 px);
  - ✅ (#150, 2026-10-24) the phone frame is `min(42vw, 600px, 83.2vh)` on the lake and the ice page (≈ 74 % of a real
    16 Pro Max on a laptop, ≈ real size on a 24″ monitor); the two items above are still open.
- ⬜ Optional: the water's wave displacement is applied within the plane (`p.y` of the rotated plane), so the drawn
  surface is flat; only its shading suggests waves. A real vertical wave needs a finer grid near the camera
  (today 10 m cells). Found in #88; harmless as it is.
- ✅ Deep water 40 → 24 m, fish off the bottom, chasing / darting / bursting fish (decision #64)
- ✅ Down view fully AUTO on both devices; PL Down fills its box to the corners (decision #65)
- ✅ Bottom toned down to orange with a thin hot edge; lockup moved into the boat's reach (decision #66)
- ✅ Panoramic structure: bright near faces, dark shadows, no rock rings (decision #67)
- ⬜ Panoramic shadow edges are still grainy (per-pixel march offsets); smoother ones need a better method than the two tried in #67
- ✖ The wreck in ~10–12 m so it fills the phone like the tablet recording — Jason 2026-09-25: 不用 (it stays on the 24 m floor)
- ✅ PLM Down in deep water no longer burns white (~11 % white after decision #66)
- ✅ Bark striations on timber (procedural, in the lake shader)
- 🔧 Boat restyled to Ranger Z521R proportions (charcoal metal flake, red waterline stripe, rub rail, wraparound windshield, Power-Poles, jack plate) — next: metal-flake sparkle, decals
- ✅ Beam footprint rim on the bottom
- ✅ Wreck +30 % (≈10 m) with cabin/windows/mast after the app imaging
- ✅ PL Panoramic clips studied (`sonar-style.md` §3b); screen now opens upward from a bottom apex
- ✅ Panoramic screen rebuilt from the lake recordings (§7.12): even crimson field from the apex, soft mottle, darker-red shadows, tangential dashes
- ⬜ Panoramic colour: the app's lake recording reads pinker crimson than garmin_amber's brown-red — check which app map that recording used (likely 'red') and decide
- ⬜ PLM Live Panoramic (left apex, opens right) is not a mode in the lab yet — add if Jason wants it in the page
- ✅ Water: ripple rings spread from the boat while it moves (simple wake; the fluid-sim trick stays optional). They were
  never visible (#88); the V wake that replaced them was removed at Jason's request (#91)
- ✅ Fish rim glow inside the beam (bright edge)

## Content
- ✅ Second, ~20 m, more complete wreck on the deep slope up-and-right
- ✅ That wreck doubled to a 40 m cargo ship with holds, hatches, masts, derricks, crane, stern house, railings, lifeboats and debris (decision #38)
- ✅ Big wreck moved 20 m up the default view to the 40 m basin floor and drawn at 70 % (decision #44)
- ✅ Big wreck turned 35° counter-clockwise, debris with it (decision #49)
- ✅ "往上20米" for the big wreck confirmed as up the screen (Jason 2026-09-24)
- ✅ Bass / musky / salmon spread through the water column (bass 2–17 m, musky 5–13 m, salmon 4–33 m)
- ✅ No fish swims through timber, rocks, wrecks or the logo: swim loops routed at load (decision #39)
- ✅ Accuphy logo on the lakebed, standing in the boat's forward plane so Forward / Down image the whole mark (decision #39)
- ⬜ Option for Jason: a guide step or a "find the logo" button that parks the boat on the lockup's line (today: a link with `?boat=-14,-52.5` and range ≥ 140 ft, or drag the boat to the monument's west side; decisions #61, #66)
- ✅ The full ACCUPHY lockup on the lakebed (the resume point after Jason's pause): white letters + blue fan from the brand SVG, 22 m wide, on a stone plinth that lifts it clear of the bottom echo; Forward and Down show the whole word at the default 80 ft (decision #40)
- ⬜ Default camera on 16:10 screens: the word's right end is cut at the screen edge (fully visible on 16:9 and wider). Jason noted it ("哦"), no change asked; options if he wants one: pan the default camera ~3 m right, or shrink the word
- ✅ Salmon / lake trout also up-and-right in the deep water
- ✅ App playback study done on the real V10 tablet (emulator route stays blocked by GLES 3.2): all PL and PLM views captured, findings in `sonar-style.md` §6 + `app-chrome.md`
- ⬜ App study leftovers: every colour map on one frame, range stepping, imperial units (tablet route, cheap)

## Brand / UI
- ✅ Control panel + guide cards: Apple-style frosted glass (decision #37) — replaced the earlier near-black DJI-style panels
- ✅ Animated "Drag the boat" hint that follows the boat until the first drag
- ✅ Phone frame turned in 3D (perspective + rotateY/rotateX); the GL picture uses the same maths with per-vertex w, so it stays perspective-correct inside the display
- 🔧 Phone realism (Jason: keep improving): Pro Max proportions, bezel, titanium band, buttons, glass reflection, Dynamic Island, antenna lines — next: camera-side depth, screen-off reflections
- ✅ Control panel in Accuphy brand (white wordmark, Instrument Sans, Eurostile Heavy headline, brand blue #0d8fdb)
- ✅ Sonar screen inside an iPhone Pro Max frame (landscape, natural-titanium ring, dynamic island); the GL picture is drawn into the DOM display hole
- ✅ The sonar picture's own chrome — done (see Sonar screen section)

## Experience (the three-step guide)
- ✅ Three-step guide strip with presets — step 2 now lands on standing timber + bass (PL Forward 60 ft); copy is a first draft for Jason to edit
- ✅ Mobile portrait layout: phone above the control panel, guide strip hidden; fixed camera kept
- ⬜ Device side-view cutouts (or stylised silhouettes) — still owed by Jason

## Mobile + Meta ads readiness (real-device test 2026-09-24)
Jason is weighing Meta ads, which bring mostly phone traffic, for this page. The numbers come from a
production build of the decision #38 state in Chrome 153 on the V10 tablet (Unisoc T616 / Mali-G57 MP1,
the cheapest Android phone class). Phone size was emulated at 360×800.
- ⬜ **Phone smooth mode.** Measured fps: 10–13 at tablet size, 14–19 at phone size and 18–24 even at
  dpr 1 (Panoramic and Combo are the slowest). The main thread is only ~17 % busy, so the page is
  GPU-bound. Cut the fixed per-frame work (sonar strip passes, sonar shader, scene draws) until cheap
  phones reach 30 fps, and pick the quality from the measured frame time.
- ⬜ **First load.** A first visit downloads ~976 KB: JS 404 KB gzip, fonts 430 KB as TTF, logo PNG
  144 KB. The 3D appears at 2.8 s on 9 Mbps/60 ms and at 4.4 s on 1.6 Mbps/150 ms, with a ~1.8 s
  freeze while the scene builds. Fixes: WOFF2 subset fonts, SVG logo, a public build that ships only
  this page, and a poster + progress bar shown at once.
- ⬜ **Touch targets.** Panel buttons are 26 px tall and the range track is 4 px. The phone-inset app
  buttons (the sign-up trigger) are only 8–13 px, so the gate is almost unreachable by finger. Give
  them ~44 px hit areas and add one obvious sign-up button. Real-finger drag, taps and the slider
  all work, with no page scroll or zoom.
- ⬜ **360 px-wide phones.** The panel grows and overlaps the phone inset.
- ⬜ **Orientation.** Jason leans towards landscape on phone and tablet. Tablet landscape already works.
  Phone landscape (800×300) is broken: the panel and step cards cover the screen and hide the inset.
  A web page cannot force landscape (iOS Safari has no orientation lock, and Instagram's iPhone app
  does not rotate). Proposal, waiting on Jason: keep portrait fully working, add a compact phone
  landscape layout and an optional dismissible "turn for a bigger view" hint. No rotate wall.
- ⬜ **Before any US ad spend (decision #57):** walk the US store's checkout on a phone (view only, no
  payment) and find where US buyers drop off; US ads lead with the PingLive Mini.
- ⬜ **Before any ad spend:** public hosting; drop "← Lab" and the gallery from the public build;
  add a "Shop PingLive" button with UTM tags; add the Meta Pixel; wire Klaviyo (see above); remove
  the logo source files (.ai/.cdr/.zip/.DS_Store) from `public/`.
- To re-run the test: see the `sonar-page-real-device-perf` memory note (adb reverse + Chrome
  DevTools over adb).
- ⬜ **Users and market analysis (2026-09-24, proposals waiting on Jason):** `docs/users-and-market.md`
  (canonical, maintained copy: Google Drive `My Drive/Market Research/`).
  The real buyers are northern, portable-minded and value-driven (ice hole-hoppers, priced-out upgraders,
  LiveScope owners wanting a second unit, francophone and Chinese-speaking communities), not tournament
  bass pros. Proposals in its §7: lead with "live sonar on the phone you already own" (answers the
  pending "aha" question with A); a "How do you fish? Boat · Kayak · Ice" scene choice instead of the
  tournament bass boat (**decided #53/#56: Boat (an aluminium deep-V), Kayak, Ice; no gate on phones**; the seasonal default is a working assumption) (status-ladder study in Drive: no single vehicle carries the brand; the
  default follows the season: ice in winter, an aluminium deep-V in open water, the kayak never
  the default); target Canada before ice season, and the US only after its availability and
  checkout are fixed; the Lab as an onboarding tool (reading the picture) and a dealer demo; show
  multi-device sharing; UTM, Pixel and Klaviyo tags before any ad spend. Next data to get: the HelpScout
  queue (~4,200 conversations) and a 5-question owner survey.
- ⬜ **Market research round 1 + continuous learning (2026-09-25, decision #82, proposals waiting on
  Jason):** `docs/market/` (start with `report-2026-09.md`; the loop is in `README.md`). Questions for
  Jason, in this order:
  1. **US store:** decision #57 settles the product (US = PingLive Mini is fine for ads). Still open:
     US checkout completion is 4.8 % vs Canada 19 %, with duties added at checkout. The view-only phone
     walk-through (Mobile section, #57) comes first; may we then run one test checkout to a US address
     to see what is added (E1)?
  2. **Pre-ice priorities** (the season starts now): product-page first screen "no display to buy" +
     myth line (E15), checkout-abandon emails v2 (E4), ice campaign and kits (E5, E17), cold-weather
     guide (E19), reviews from past buyers (E3). Which ones go?
  3. **Continuous learning:** keep the monthly refresh + three seasonal reviews? Run them as a
     scheduled routine (a fresh session each time, results committed here and summarised in Drive)?
  4. Put round 1's Chinese summary into Drive `My Drive/Market Research/` next to round 0?
  Remind Jason of these when he is back on this project. Next research round: Chinese low-cost live
  sonar, rival display prices, Help Scout themes, the owner survey (search quota is 200 per session:
  run it fresh).
- ⬜ **Klaviyo: "Simulator Mode" → "Playback Mode" in the two Abandoned Cart emails (2026-09-25, waiting
  on Jason).** The connector cannot save flow emails (404), so Jason changes one word in each email in
  the Klaviyo editor (about 5 minutes); a chat then diffs both against the backups. Found on the way,
  his call: the flow's coupon email (#2) has not been sent since the 2026-04-14 edit (0 people since;
  its Yes/No paths look swapped, L25); the shared header's "Quick Setup Guide" link is a 404 (site
  audit); two blog posts still say "Simulator Mode". Steps and details: `docs/market/klaviyo-changes.md`.
  Remind Jason when he is back on this project.
- ⬜ **Phone layout + camera plan (2026-10-03, plan accepted, build on Jason's go):** `docs/mobile-phone-layout-plan.md`.
  Jason: "船应该更小一点…zoom out" and "手机能否保留边框 合理安排一下空间". Four phases:
  1. an aspect-aware camera, about 70 m of lake across on phones;
  2. the iPhone frame on top, near-flat, with view pills in the middle and the lake on the
     bottom ~65%;
  3. relative touch drag and a clamped hint;
  4. landscape real-device mode and quality tiers.
- ⬜ **Mobile plan: PLANNING ONLY, do not build until Jason says go** (decision #45: "我没说动不要动").
  `docs/mobile-marketing-plan.md`: no deadline (decision #47), so the plan optimises for the
  best mobile experience. The interactive experience is the core, shaped by the "Principles for
  mobile" (the phone is the sonar screen, portrait re-layout, screen up / water down, drag anywhere,
  hints not teleports, quality tiers, landscape = real device mode); Plan B's video story is the
  fallback for slow phones. Decided: main action = email for an offer (#45). Next question for
  Jason: the "aha" (what a visitor should feel first). Remind him when he is back on this project.

- ✅ **Embed: theme-mounted Lab (#142):** `mount(el)` entry, stable loader `embed/lab.js`, CORS/caching in `vercel.json`, events via `Shopify.analytics.publish`; handoff draft `docs/handoffs/2026-10-24-lab-theme-mount.md`
- ⬜ **Carry the #142 handoff to `accuphy-website/handoffs/`** (a chat on Jason's Mac); then the Vercel deploy (#102) and the theme-copy test
- ⬜ Phone-mode gaps left after #139: ice page Home-first + live gain/pause on phones, and the ice page held sideways (ice chat; the lake page's #141 mode is lake-only)
- ✅ **Phone landscape "real device mode" (#141, 2026-10-24):** a sideways phone is the app — Home with the frosted
  tiles, then the sonar full-screen with the app's controls and the lake as a top-right inset that taps to swap.
  Lake page only. Still open from Phase 4: quality tiers (dpr / 30 fps cap).
- ⬜ **iPad layout: on hold (#119).** iPads get the desktop controls today; Jason decides after the phone layout is final.

## Engineering
- ✅ Dev helper `?bigphone` (DEV only): the phone frame fills the viewport so the sonar picture can be inspected in screenshots
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device check done 2026-09-24 (budget GPU 10–24 fps, see "Mobile + Meta ads readiness")
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged
- ✅ **Old private preview link, superseded** (2026-09-25): https://claude.ai/artifact/4GdHHYZKTHgYyEzjV12RmW was built
  from main `6738310`, before the Safari fix (#73), so on an iPhone or iPad its sonar picture can be black. Friends and
  phones use the public test link (#72, #76): https://jasonzhu-ctrl.github.io/accuphy-lab-test/. Delete the old one
  when Jason agrees (a delete needs his confirmation).
- ✅ **Private preview updated** (2026-10-04, Jason: "给我链接先看一看"): https://claude.ai/artifact/RnCBYTexY5vcEqJy2hAsN7
  (version 6) now shows main `340e98d`, with fish phase 1 (#86), the new boat (#88), fish phase 3 (#90), no wake
  streaks (#91) and the middle sloping gently into the deep (#92). Only Jason can open it (he needs to be logged in
  to Claude). Tested before publishing: the share build has no gate, makes zero
  network requests, loads the fonts and shows no console errors on desktop or phone.
- ⬜ **Public test link still on the old build** (#81): https://jasonzhu-ctrl.github.io/accuphy-lab-test/. Rebuild it
  (skill `lab-test-link`) only when Jason says so.
- ⬜ **Who can see the code** (checked 2026-09-30, Jason: "这个别人看得到代码吗"):
  - **Visible to anyone:** the public test page and its repository `accuphy-lab-test` (public, 4 files).
    Anyone can save `index.html` from the page or download it from GitHub. It is one minified file.
    It includes the shader code as plain text (the sonar look), the three brand fonts and the white logo.
  - **Not exposed:** the source repository `accuphy-visual-lab` (private), with the docs and market
    data. The page carries no keys (the Klaviyo key is empty) and no source maps.
  - **Search engines:** `robots.txt` and `noindex` keep the page out of results. The GitHub repository
    itself is public.
  - **Open — font licence:** Eurostile Heavy is a commercial font and is now served publicly.
    Confirm that the licence covers web embedding. If it does not, use a web-licensed copy or subset
    before sharing more widely.
  - **Limits:** code that runs in a browser cannot be hidden; obfuscation only slows a reader down.

- ⬜ **BF 后：“去商店”按钮按市场路径跳（2026-10-26）。** 网站已在 /fr、/fr-benelux、/fr-fr、/fr-lu 的框网址上带 `lang=fr`（网站 #220）；Lab 在框里只读得到店铺主域，所以欧洲法语页也跳 /fr/products/…。办法：网站在框网址上加 `shop_prefix=/fr-fr` 之类，Lab 照着拼。11/2 只投加拿大，不急。

- ✖ **船头跟着拖的方向转（2026-10-26）：Jason 定“不做”。** 船头保持固定朝向，声纳波束也不转；别再提。

## Handed to the website project (decision #69) — tracked in `accuphy-website/docs/backlog.md`
- Lab page location (~~lab.accuphy.ca~~ 已定 .com（#102）: lab.accuphy.com, behind the store page) · lite section's Shopify test page · Klaviyo list,
  opt-in and keys · Meta Pixel, UTM, "Shop PingLive" button · US phone checkout walk (decision #57).
  The design work for each stays here; the Shopify side is theirs.
- ⬜ **Store page as the front door (decisions #133–#134, 2026-10-23, adopted):** `shop.accuphy.com/pages/lab` = header-less
  template + full-screen iframe of the Vercel-hosted Lab (#102 unchanged). Handoff: `accuphy-website/handoffs/2026-10-23-lab-store-page.md`.
  Lab side to do: embed events module (`ready`, `first_drag`, `view`, `found_sign`, `signup`, `shop_click` via `postMessage`),
  `100dvh`, Klaviyo keys, `window.top` shop links, `vercel.json` (`frame-ancestors`, `noindex`), Vercel deploy when the
  website project is ready. Study: `docs/shopify-embed-feasibility.md`.
  Website HQ 2026-10-23 (#204 there): Globo dropped; theme copy 189488890029; `pages/lab` built by 00, not published; Klaviyo public
  key XWcjZ5 filled in `signup.js`, list id pending; shop links = `/products/pinglive-sonar`, `/products/pinglive-mini` with the
  market prefix (CA none or `/fr`, US `/en-us`, AU `/en-au`) — for the future `shop_click` button.
  Website #208 (Jason, 2026-10-23 evening): the Klaviyo popup STAYS on /pages/lab (not excluded); trigger rules and the
  funnel are decided later; the "Accuphy Lab sign-ups" list is not created yet, and whether the Lab keeps its own sign-up
  card is decided then. `signup.js` keeps the public key with `listId: null` (sends nothing) until that decision.

## Lite section (planning only — decision #48)
- ⬜ **Do not build until Jason says go.** `docs/lite-section-plan.md`: the original side-view visualizer as a
  light web component `<accuphy-sonar>` for accuphy.ca sections — the fan is the screen (no phone inset),
  two controls, no three.js, ≤ 90 KB first visit, ≥ 50 fps target on the V10. Remind Jason of the go/no-go
  when he is back; when he says go, §8 of the plan is the build order (prototype → packaging → measure → Shopify test page)
- ⬜ **Look gate (decision #50):** premium + technical is a hard requirement (Jason: 视觉的高级感科技感非常非常重要). Plan §3b
  lists the light, beam-volume, parallax, bloom, motion and glass-UI rules; phones get the same look with fewer samples.
  Jason reviews the prototype's look against the LVS34 frames, Accuphy's animations and the 3D Lab before packaging
- ✅ Mood decided: dark cinematic water, the dusk palette of plan §3b (decision #51)
- ✅ Look references: Jason picked groups A + B and gave the "dark lakebed lit up" lamp concept (decision #54, `docs/look-references.md`)

## Ice scene (decision #94, 2026-10-16) — local only
- ✅ Snow cover: black ice (`glass`) chosen 2026-10-16 (#96); the snow-and-cutaway look stays as `?look=snow`
- ⬜ **Jason's look picks still open**: the black ice's realism (rebuilt from photographs in #96 — his verdict pending), time of day (dusk / day / night), ice views in jet or amber
- ⬜ Black ice next steps if he wants more: methane bubble stacks, a pressure ridge or two, skate/boot scuffs near the hole, a thin snow film that the wind moves
- ⬜ Camera tilt (or an intro move) so the sky dome, the afterglow and the night aurora are in frame; the dome is built but the ⅔-aerial camera never sees the horizon
- ⬜ Glass UI on bright scenes: on the `day` preset the frosted panel and cards lose contrast against white snow — a darker tint when the scene is bright
- ⬜ Footprints and sled tracks in the snow between the camp and the holes (a stamped trail texture)
- ⬜ Winter fish behaviour: walleye and perch should come in under the hole more often (the summer behaviours run unchanged); a jig mark on the flasher and in the 2D history
- ⬜ Forward and Combo through the ice: check the window shape and the picture against the app's Live Forward; the Mini's forward range from a hole
- ⬜ Phones: the ice page at 375×812 and landscape; the hint and the aim ring under a finger
- ⬜ sonar-qa for the ice views (dial brightness vs the app's Ice Fishing View, the history's speckle floor)
- ⬜ Publish as `/ice/` (`VITE_SCENE=ice`) + `docs/versions.md` — only when Jason says go
- ✅ Direction: the SECTION camera (B), Jason 2026-10-16 night (#101); the surface: black ice with thin wind-swept snow (#108)
- ⬜ Section view tuning (round 1 done in #102: lens, slab face, soil, marine snow, cards under the panel, camp): still open — the slab edge opening where a hole is near the wall, snow lying on the slab top, the water column's tint, camp details, phone fine-tuning; decide the fate of Top and Under the ice (keep as a switch, or drop)

## PLM Combo at long range (Jason 2026-10-23: Range 拉到很高的时候 画面只剩下顶部那一点点) — ✅ DONE as a softer option A (see decisions)
- Cause: the Combo Forward panel's depth axis is fixed at 0.7 × range (copied from the one app frame, 16 m range in 4 m of
  water, `SonarScreen.jsx screenLayout`, `index.jsx` Combo box). At 200 ft range in 36 ft of water the panel is 140 ft
  deep, so the bottom and everything on it sit in the top quarter, under the depth readout; the rest is black.
- The real app (2.0.0, `reference/app-study/2026-10-23/40-live-combo.jpg`) uses the same 0.7–0.75 × range proportion
  and has no range −/+ in its Combo bottom bar; only the Lab's desktop slider reaches 200 ft in Combo.
- **Option A (recommended):** the Forward panel's depth follows the water, like the single Live Forward view already does
  (decision of 2026-09-25): depth axis = min(0.7 × range, ~1.2 × the deepest water the beam crosses). Nothing changes at
  the default ranges; at long range the bottom and structure grow 2–3× taller. Mock-up checked at 60/100/150/200 ft.
- Option B: cap the range in Combo at ~100 ft (the slider stops there), keep the app's proportion.
- Option C: A + B together.

## Jason's four asks, 2026-10-23 evening ("有几个是我需要你持续优化 … 你可以一个一个做")
1. ✅ (#125) **PLM Combo, Forward part: the bottom-vs-range relationship** must read easily for a beginner ("初学者相对来说比较容易好接受").
2. ✅ (#128 first round; redone like-for-like against the vivo recording, see decisions) **Sonar engine: structure** — the picture of structure is still far from the real app's ("结构物的画面跟真实的声纳的画面差距还是比较远").
   Research against the app recordings first (`sonar-look-tuning` skill, `reference/`), then tune.
3. ✅ (#126) **Ice page: the tap area** is too limited — taps farther up the ice do not go through ("往冰面的上面再去点 它是过不太过去的").
   Re-evaluate which area is the most intuitive for a new user.
4. ✅ (#127) **Ice page: fish and the jig** — nearby fish should come to the jig naturally but quickly, and interact with it
   ("又自然又快 … 跟鱼饵能够有一些自然的互动").

## Jason's look round, 2026-10-24 (vs the app's bottom close-up)
- ✅ (#143) bright cores fading to orange rims; flat bottom edge with fine fibres
- ✅ (#144) bottom and structure at one brightness; thicker Forward / Mini bottoms; steel even
- ✅ (#145) solid targets hide the bottom (no see-through rocks); branches whole, no mosaic; wooden hull halfway back
- ✅ (#146) fibres inside hulls and rocks like the bottom close-up, opacity kept
- ✅ (#147) ragged fibrous outlines on every object ("边缘的纤维对了")
- ✅ (#148) the grain rule: every return is a short arc across the beam — bottom, insides and outlines ("这版纹理做得非常的好")
- ✅ (#149) big hulls get bright middles; the steel wreck no longer dark and even ("钢船这样对了")
- ⬜ From the LiveScope session's check (2026-10-24), not yet done: ping-to-ping life (app hull |ΔL|/L 0.46 vs Lab 0.17,
  - **Re-measured on main 835b6b5 (LiveScope chat, 10-31):** still true: ping-to-ping life (hull 0.46 vs 0.17), edge 0–2 in too bright (L 174 vs 268), Combo / phone Forward too white (14.3 % / 11.9 %, target 6–10 %), ice Forward far band breaks into fine curves. Partly: Down band ~22 % too thick, too few white specks (colour otherwise fixed). Void: the water-column specks (the #155 work boat sits in the old box; clean box shows both clean) and the Panoramic dotted columns (Panoramic redone in #171/#178). The hull dark-share / CoV numbers no longer compare (#155 wreck). Owner: 冰钓 (#176); acting on them is Jason's call.
  band 64 % vs 43 % class change); rim 0–2 in too bright (app L 174 vs 236); Down band ~25 % thicker than the app's and
  without its white points; Down water column lit 0.79 % vs 0.04 %; Combo / phone Forward white 10–15 % (target 6–10 %);
  the far ice Forward band frays into thin wavy threads; a dotted vertical bar in PL Panoramic at deep / lockup
- ✅ fps on a real phone after #145–#149: vivo fold (V2545A, Mali-G1-Ultra MC12, Chrome 152, unfolded, canvas 1067×876): a
  steady 60 fps in PL Forward / Down / Panoramic and Mini Forward / Down, no black or broken picture (2026-10-24)
- ⬜ The cheap-device baseline (V10 tablet, 10–24 fps before) after #145–#149: re-measure when the tablet is back
- ✅ On the unfolded fold (viewport 711×584) the drag hint sat on the panel's Range value: the hint now slides clear of
  anything marked `data-hint-avoid` (the panel, the step cards, the phone) — checked at 711×584, 1024×768, 1440×900,
  390×844 on the lake and the ice page, zero overlap (2026-10-24)
- ✅ At 711×584 (the unfolded fold) the boat sat under the glass panel: the view now shifts clear of it on mid screens (#150)

## UI rules for every screen and browser (research 2026-10-24, `docs/ui-screen-rules.md`) — waiting for Jason's go
- ⬜ Class C compact layout (folds, iPad portrait, small windows): collapsible panel, cards as a sheet, 44 px touch targets
- ⬜ WebGL context-loss recovery; `color-scheme: dark` against forced dark modes
- ⬜ Screen classes from the mount box (container queries / ResizeObserver), before the store mount (#142)
- ⬜ Height from innerHeight / visualViewport, bottom controls above the safe area; verify on a real iPhone (Safari, Instagram, iOS 26)
- ⬜ Class F scale-up (≥ 2200 px); low performance tier + loading poster (Phase 4)

## Handoff to the phone-chrome owner (SonarChrome.jsx): the app's "sonar working" icon (Jason 2026-10-23)
- ⬜ In the real app's Down views a small "sonar working" icon sits at the top centre of the picture, just under the 0 of the
  range ruler (partly hidden by it), whenever the sonar runs — Jason identified it on the 2.0.0 recording
  (`reference/app-study/2026-10-23-vivo/pl-down-d00.jpg`, region ②). The Lab's phone chrome has none. Shape: a small
  fan/arc glyph a few px wide, the colour-map's orange. Owner: the chat that owns SonarChrome.jsx.
