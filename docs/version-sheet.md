# Accuphy Lab 版本总表（给 Jason 看的一页，HQ 维护）

Jason 2026-11-02：“你记住，或者搞一个 sheet 把各种版本做好管理。现在这个 PL 和 PLM 的是标准 base 版本，可以上线。”

每次版本有变化，HQ 都更新这一页。详细的提交记录在 `docs/versions.md`。

## 现在有哪几个版本

| 版本 | 是什么 | 代码版本 | 在哪里看 | 状态 |
|---|---|---|---|---|
| **标准 Base 版（PingLive + PingLive Mini）** | Jason 11-02 定的标准基础版，见下面的清单 | main 6b5a225（4c3fc61 + 关锁 #202） | lab.accuphy.ca `/`（PingLive，可切 Mini）、`/mini/`（只有 Mini）；测试链接同一版 | **11-02 已上线**（Jason：“Lock off, go live”） |
| 线上版 | 店铺页里嵌的、广告点进来看到的 | **6b5a225（11-02）** = 标准 Base 版 | lab.accuphy.ca、shop.accuphy.com/pages/lab | 已换成标准 Base 版，锁关闭 |
| 冰钓页 | 冰面，只有 Mini | 和 Base 同一份代码 | 测试链接 `/ice/` | 还是旧的三张步骤卡；入场教程（#203：点冰打洞 → Tap Forward View → Tap Down View）已做好；俯视机位跟随冰洞、边界统一 ±58 米（#204）；测试链接 86bf80e；湖岸（#206–#211，树按手机快慢自动调，夏天湖和冰钓页同一条，停在约 5 ft 深处，船头对岸处停远一点）已做；等 Jason 看、说“动” |
| 营销版 | 只有“锁视图”（订阅才能看 Combo 等，#191） | 现在混在 main 里，还没拆出来 | — | Base 版上线后再拆、再做 |

测试链接：https://jasonzhu-ctrl.github.io/accuphy-lab-test/

## 标准 Base 版里有什么（11-02 定）

- **湖和声纳：**
  - 夏天湖、鱼、声纳画面；
  - 鱼会游进波束，最低条数：Mini 3 条、Combo 每边 3 条、Mini 全景 4 条、PingLive 4 条、PingLive 全景 6 条；约 10 秒到位。
- **入场教程（取代右上角步骤卡）：**
  - Mini：拖船（Combo）→ Tap Forward View → Tap Down View；
  - PingLive：拖船（Down）→ Tap Forward View → Tap Panoramic View。顺序不改（Jason 11-02）。
  - 时间两页一样：拖满 4 秒直接进下一站；点完视图停 5 秒，期间可以拖船；
  - 看过一次不再自动弹，左下角有 Replay；
  - 手机进去自动开始。
- **面板：**
  - 新标题 “ACCUPHY | LAB”；
  - 视图格只有图标，选中的那格有小声纳；
  - 波束文字：线上现在是 Mini 39°×19°、Combo 78°×19°、PingLive 135°×20°；Jason 11-02 定去掉厚度，只写 39° / 78° / 135°（测试链接 6fe4b4b 已改，未上线）。
- **去商店和分享：**
  - 电脑：Shop 按钮、Send to a fishing buddy；
  - 手机：Learn More →、Share to a Fishing Buddy。
- **App 下载：**
  - 电脑：徽章在手机画面上方，点了出二维码；
  - 手机：不放徽章。
- **手机：** 船拖到屏幕边，画面会跟着走，湖的每个角落都能到。

## 改版本的规矩

- 基础版只由 “Lab 场景和声纳画面Base” 改；营销版（锁）等 Base 版上线后另开窗口做。
- 先改基础版，Jason 看过，再加营销层。
- 上线 lab.accuphy.ca 要 Jason 在 Lab HQ 说“动”。
- 每次上线或换测试链接，HQ 更新这一页和 `docs/versions.md`。

## 上线时定的（11-02，已处理）

1. **Combo 订阅锁（Jason 选了“Lock off, go live”，已关，#202，开关 VITE_COMBO_LOCK）：** 现在 main 里还带着营销版的锁（#191）。直接上线的话，Klaviyo 名单编号（W24Qdc）还没填，所有访客的 Combo 都会锁死、也解不开。
   - 要么上线时把锁关掉，就是纯 Base 版；
   - 要么先把锁需要的东西配齐。
2. **法文（还没做）：** 入场教程和新按钮的法文还没翻、还没经网站核。法文页上这些地方会显示英文。
