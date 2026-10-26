# Lab 法文字表（X-6L-fr，手机网页端；2026-10-26 网站 HQ 核过，2026-10-26 搬进代码）

切换：只认 Lab 自己网址上的 `?lang=fr`（网站在 /fr/pages/lab 的框网址上加），默认英文。所有字在
`src/experiments/2026-09-23-sonar-lake-3d/i18n.js`。

核的规矩（网站决定 #198）：店铺线上已核过的法文照抄；手机框里照真 App 的法文（安装包 0615 dev 版，网站 HQ 解析）；
其余按 glossary 和大品牌用法。核对记录：`IT/accuphy-website/handoffs/2026-10-26-lab-fr-strings-review.md`。
PingLive、PingLive Mini、Down Scan（英文视图名）、CHIRP、AUTO、Map（App 法语版就显示英文）、数字和单位不翻；
文字里不写 pi / pieds，公制在前、英制放括号（glossary units-format）。

网站核出来英文也要改的 3 处（已改）：面板 “max 240 ft” 提示删掉（specs 是 230 ft，App 台阶到 240，两边不碰）；
冰钓面板 “39° × 18°” 文字改 39° × 20°（specs；引擎的 18° 不动）；冰钓步骤 3 的 “60 ft away” 去掉数字（没出处）。

| 位置 | en | fr | 出处 |
|---|---|---|---|
| 面板 | Device | Appareil | 网站已核 |
| 面板 | View | Vue | 网站已核 |
| 面板（冰钓） | Camera | Caméra | 网站已核 |
| 面板 | Range | Portée | 网站已核（线上 FAQ “réglages de portée”） |
| 面板 | AUTO · follows the water | AUTO · suit la profondeur | 网站已核 |
| 面板 | max 240 ft | （删掉，en 也删） | 网站 A1 |
| 视图胶囊 | Down / Forward / Panoramic / Combo | Bas / Avant / Panoramique / Combinée | 网站 D（App 叫 Vue combinée） |
| 视图胶囊（冰钓） | Live Ice | Live Ice | 网站已核 |
| 相机胶囊（冰钓） | Top / Under the ice / Section | Dessus / Sous la glace / Coupe | 网站已核 |
| 面板说明 | PingLive · 135° × 20° beam. Drag the boat — whatever the beam touches lights up. | PingLive · faisceau de 135° × 20°. Faites glisser le bateau : tout ce que le faisceau touche s’allume. | 网站 D（线上首页 “Faites glisser le curseur”） |
| 面板说明（冰钓） | PingLive Mini · 39° × 20° beam, through the ice. Tap the ice to drill a new hole — … | PingLive Mini · faisceau de 39° × 20°, à travers la glace. Touchez la glace pour percer un nouveau trou : tout ce que le faisceau touche s’allume. | 网站 A2 + 已核 |
| 拖船提示 | Drag the boat to move it | Faites glisser le bateau pour le déplacer | 网站 D |
| 冰钓提示 | Tap the ice to drill a hole | Touchez la glace pour percer un trou | 网站已核 |
| 提示条（手机） | These are the app’s own controls — Home, range, gain and pause work. | Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent. | 网站已核 |
| 提示条（电脑） | These are the app’s own controls — use the panel to change the view. | Ce sont les commandes de l’application : changez de vue dans le panneau. | 网站已核 |
| 步骤卡 | Step | Étape | 网站已核 |
| 步骤 1 | This is the beam | Voici le faisceau | 网站已核 |
| 步骤 1 | A thin curtain of sound under the boat. Drag the boat — whatever the curtain touches lights up. | Un mince rideau d’ondes sonores sous le bateau. Faites glisser le bateau : tout ce que le rideau touche s’allume. | 网站 D |
| 步骤 2 | This is what your phone shows | Voici ce qu’affiche votre téléphone | 网站 D |
| 步骤 2 | The screen is that curtain, seen edge-on: bottom, timber, fish. Forward View aims it ahead of the boat. | L’écran, c’est ce rideau vu de profil : le fond, les arbres immergés, les poissons. La vue avant l’oriente devant le bateau. | 网站 D（timber → arbres immergés；线上写 Vue avant） |
| 步骤 3 | Which view, when | Quelle vue choisir, et quand | 网站 D |
| 步骤 3 | Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below. | La vue panoramique scanne de larges zones pour repérer poissons et structures ; la vue avant, pour lancer dessus ; la vue vers le bas, pour pêcher à la verticale. | 网站 D（线上 PingLive 页） |
| 步骤 3（只有 Mini 的版本） | Combo shows Down and Forward side by side; Forward to cast at fish ahead; Down to fish straight below. | La vue combinée montre le bas et l’avant côte à côte : la vue avant pour lancer sur les poissons devant vous, la vue vers le bas pour pêcher à la verticale. | 网站 D |
| 冰钓步骤 1 | The beam under the ice | Le faisceau sous la glace | 网站已核 |
| 冰钓步骤 1 | The PingLive Mini hangs in the hole and pings straight down. Tap the ice anywhere to drill a new hole — whatever the beam touches lights up. | Le PingLive Mini est suspendu dans le trou et émet droit vers le bas. Touchez la glace n’importe où pour percer un nouveau trou : tout ce que le faisceau touche s’allume. | 网站 D |
| 冰钓步骤 2 | Watch them come in | Regardez-les arriver | 网站已核 |
| 冰钓步骤 2 | The flasher is the dial: the bottom, your bait and every fish that rises, by depth around the ring. The panel beside it draws the same fish as marks. | Le flasheur, c’est le cadran : le fond, votre appât et chaque poisson qui monte s’affichent selon leur profondeur, tout autour de l’anneau. Le panneau à côté montre les mêmes poissons sous forme d’échos. | 网站 D（flasheur，Garmin 法语说明书） |
| 冰钓步骤 3 | Look ahead without drilling | Voir devant sans percer | 网站已核 |
| 冰钓步骤 3 | Forward View turns the beam sideways: fish and structure out ahead, under ice you never cut. | La vue avant tourne le faisceau sur le côté : poissons et structures plus loin devant, sous une glace que vous n’avez jamais percée. | 网站 A3（去掉 60 ft，en 也改） |
| 去商店按钮 | Shop PingLive / Shop PingLive Mini | Achetez le PingLive → / Achetez le PingLive Mini →（箭头是按钮图标） | 网站 D（线上按钮 Achetez maintenant） |
| App 首页格子（PingLive） | Panoramic View / Forward View / Down View | Vue panoramique / Vue avant / Vue inférieure | 网站 C（真 App：type_live_panoramic / type_live_forward / type_live_down） |
| App 首页格子（Mini） | Live Panoramic / Live Forward / Live Down / Live Combo / Down Scan / Chirp Sonar / Ice Fishing / Live Ice Fishing | Panoramique en direct / Avant en direct / Dessous en direct / Combinée en direct / Balayage vers le bas / Sondeur CHIRP / Pêche sur glace / Pêche sur glace en direct | 网站 C（真 App） |
| App 首页标签栏 | Setting / Home / Map | Paramètres / Accueil / Map | 网站 B（真 App；Map 没有法文） |
| App 首页弹窗 | Available with Accuphy PingLive Mini | Disponible avec le PingLive Mini | 网站 B |
| 手机框里的 App 字样 | AUTO、1440p (QHD)、ft、°C、V、% | 不翻 | 和 App 一样 |

没翻、也不该翻的：手机框里的 App 数字和单位；ACCUPHY LAB 的湖底字；Lab 自己的留邮箱卡片（线上关着，#139）。
网站 HQ 顺带把 flasher、submerged timber 和 App 的法文视图名记进了 glossary.csv。
