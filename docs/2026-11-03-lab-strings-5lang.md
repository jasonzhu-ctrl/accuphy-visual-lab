# Lab Base 版 5 种语言对照表（`/` 页，#212；Lab 多语言窗口，2026-11-03）

只放 `/` 页用得到的字：PingLive 页，和切到 PingLive Mini 以后的字。键名就是
`src/experiments/2026-09-23-sonar-lake-3d/i18n.js` 里的键（来源：i18n.js @ e715574，每个键都在代码里查过用在哪）。

**状态：除了标“已核”的法语，全部是草稿，待核。** 草稿是机器翻的，只能当草稿用，要有人核过才能放进代码（#212）。
谁来核还在等 Jason 定：网站 11-03 回答，按 #238 网站不核 Lab 的字（Jason 要网站核，得在 Lab HQ 说一句）；
波兰语网站 #178 的做法是先内部对照 Prime Power 波兰语网店审、反译回英文，拉脱维亚语网站没有人也没有路子。
**先别开始核。** 核好的字由 HQ 交给 Base 放进 `i18n.js`。核的时候照这个顺序：线上已核原文（德语看 /de-de，荷兰语看
/nl-benelux，法语看 /fr）→ glossary.csv → 大品牌。
这份表本身不改任何代码。

## 怎么读

- **类别**：**翻** = 手机外面我们自己写的字，照店铺的说法，术语跟 `accuphy-website/docs/glossary.csv`（de、nl 列）走；
  **照 App** = 手机框里 App 自己的字。App 有这种语言就抄 App 原字；没有就留英文，跟客人买回去在 App 里看到的一样。
- **状态**：fr 标“已核”的出自网站已核记录（`accuphy-website/handoffs/2026-10-26-lab-fr-strings-review.md`、
  `2026-10-31-lab-191-fr-review.md`、决定 #198 的分享改版 6 句、#186 / #184 的“Partager”和“Ouverture de la boutique…”）。
  i18n.js 里标着 “FR draft” 的、或找不到核过记录的，fr 也算草稿。
- `{device}`、`{view}`、`{beam}`、`{name}`、`{store}`、`{keys}` 是程序代进去的词，不翻，位置可以挪。
  `{view}` 代进去的是 App 格子名（照 App），`{name}` 是 PingLive / PingLive Mini。
- **称呼（定了）**：德语用 Sie，荷兰语用 je，跟线上店铺一致（网站 11-03 数过线上 PingLive 页：/de-de 全是 Sie / Ihr，
  /nl-benelux 基本是 je）。波兰语用界面常见的第二人称命令式，拉脱维亚语用敬称复数（Velciet…），这两种跟着核的人定。
- App 有哪些语言（网站 11-03 重读安装包 0615 dev 版，唯一的安装包）：App 自己的字只有 de / fr / ja / pl / ru / zh，
  **没有 nl、lv**。所以 **de、pl 的“照 App”格子抄 App 原字（已填）；nl、lv 手机框里留英文**（网站同意）。
  Map 哪种语言都不翻。App 里没有 “FORWARD / DOWN” 这类小字，combo_fwd / combo_down 按“翻”处理。
  注意：这是 6 月的 dev 版，正式版 App 还没在平板上核过（网站 T-066）；App 的说法和店铺不一定一样
  （德语 App 的 Down View 叫 “Boden-Scan-Ansicht”，Chirp Sonar 德、波都叫“经典声纳”）。手机框里照 App，手机外面照店铺。
  出处：`accuphy-website/handoffs/2026-11-03-lab-multilang-questions.md` 的回答。

## 一、控制面板（电脑左边）

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| device | 面板 | Device | Appareil | Gerät | Apparaat | Urządzenie | Ierīce | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| view | 面板 | View | Vue | Ansicht | Weergave | Widok | Skats | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| range | 面板 | Range | Portée | Reichweite | Bereik | Zasięg | Diapazons | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| auto_follows | 面板，Down 视图时 | AUTO · follows the water | AUTO · suit la profondeur | AUTO · folgt der Wassertiefe | AUTO · volgt de waterdiepte | AUTO · dopasowuje się do głębokości | AUTO · seko ūdens dziļumam | 翻（AUTO 不翻） | fr 已核；de/nl/pl/lv 草稿，待核 |
| range_fwd | 面板，Mini 的 Combo | Forward range | Portée avant | Reichweite nach vorne | Bereik vooruit | Zasięg do przodu | Diapazons uz priekšu | 翻 | 全部草稿，待核（fr 没见核过记录） |
| range_down | 面板，Mini 的 Combo | Down range | Portée vers le bas | Reichweite nach unten | Bereik omlaag | Zasięg w dół | Diapazons uz leju | 翻 | 全部草稿，待核（备选 de Tiefenbereich、nl dieptebereik，glossary depth-range） |
| mode_down | 视图胶囊；教程卡上的视图按钮 | Down | Bas | Unten | Omlaag | W dół | Uz leju | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| mode_forward | 同上 | Forward | Avant | Vorne | Vooruit | Do przodu | Uz priekšu | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| mode_panoramic | 同上（PingLive；Mini 也有） | Panoramic | Panoramique | Panorama | Panorama | Panorama | Panorāma | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| mode_combo | 同上（Mini） | Combo | Combinée | Kombi | Combi | Łączony | Kombinētais | 翻 | fr 已核；de/nl/pl/lv 草稿，待核（lv 偏长，界面设计看宽度） |
| desc_lake | 面板下的一句 | {device} · {beam} beam. Drag the boat — whatever the beam touches lights up. | {device} · faisceau de {beam}. Faites glisser le bateau : tout ce que le faisceau touche s’allume. | {device} · {beam}-Kegel. Ziehen Sie das Boot – alles, was der Kegel erfasst, leuchtet auf. | {device} · bundel van {beam}. Sleep de boot – alles wat de bundel raakt, licht op. | {device} · wiązka {beam}. Przeciągnij łódź – wszystko, czego dotknie wiązka, podświetla się. | {device} · {beam} staru kūlis. Velciet laivu – viss, ko skar stars, izgaismojas. | 翻 | fr 已核；de/nl/pl/lv 草稿，待核（beam = Kegel / bundel，glossary） |
| shop | 面板的去商店按钮 | Shop {name} | Achetez le {name} | {name} kaufen | Koop de {name} | Kup {name} | Iegādāties {name} | 翻（照店铺按钮） | fr 已核；de/nl/pl/lv 草稿，待核（请网站照 /de-de、/nl-benelux 店铺自己的购买按钮写） |
| shop_opening | 点了去商店后 1 秒 | Opening the store… | Ouverture de la boutique… | Shop wird geöffnet… | Winkel wordt geopend… | Otwieranie sklepu… | Atver veikalu… | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |

## 二、湖上的提示

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| hint_boat | 船上方的提示 | Drag the boat to move it | Faites glisser le bateau pour le déplacer | Ziehen Sie das Boot, um es zu bewegen | Sleep de boot om hem te verplaatsen | Przeciągnij łódź, aby ją przesunąć | Velciet laivu, lai to pārvietotu | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| shore_edge | 船或点击碰到岸边 | Shoreline — the lake ends here | La rive : le lac s’arrête ici | Ufer – hier endet der See | Oever – hier eindigt het meer | Brzeg – tu kończy się jezioro | Krasts – šeit ezers beidzas | 翻 | 全部草稿，待核 |
| toast_phone | 手机：点了 App 控件 | These are the app’s own controls — Home, range, gain and pause work. | Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent. | Das sind die Bedienelemente der App – Startseite, Reichweite, Verstärkung und Pause funktionieren. | Dit zijn de eigen knoppen van de app – Home, bereik, versterking en pauze werken. | To są przyciski samej aplikacji – działają: Strona główna, zasięg, wzmocnienie i pauza. | Šīs ir lietotnes pašas vadīklas – darbojas Home, diapazons, pastiprinājums un pauze. | 翻 | fr 已核；de/nl/pl/lv 草稿，待核。“Home” 跟 App 底栏同一个字：de Startseite、pl Strona główna（App 原字），nl、lv 留 Home |
| toast_desktop | 电脑：点了 App 控件 | These are the app’s own controls — use the panel to change the view. | Ce sont les commandes de l’application : changez de vue dans le panneau. | Das sind die Bedienelemente der App – die Ansicht wechseln Sie im Bedienfeld. | Dit zijn de eigen knoppen van de app – wissel van weergave in het paneel. | To są przyciski samej aplikacji – widok zmienisz w panelu. | Šīs ir lietotnes pašas vadīklas – skatu mainiet panelī. | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| gl_lost_title | 3D 停了的卡片 | The 3D view stopped | La vue 3D s’est arrêtée | Die 3D-Ansicht wurde angehalten | De 3D-weergave is gestopt | Widok 3D się zatrzymał | 3D skats apstājās | 翻 | 全部草稿，待核（fr 没见核过记录） |
| gl_lost_text | 同上 | Your browser freed the graphics memory. Tap to reload the lake. | Votre navigateur a libéré la mémoire graphique. Touchez pour recharger le lac. | Ihr Browser hat den Grafikspeicher freigegeben. Tippen Sie, um den See neu zu laden. | Je browser heeft het grafische geheugen vrijgegeven. Tik om het meer opnieuw te laden. | Przeglądarka zwolniła pamięć graficzną. Dotknij, aby ponownie wczytać jezioro. | Jūsu pārlūks atbrīvoja grafikas atmiņu. Pieskarieties, lai vēlreiz ielādētu ezeru. | 翻 | 全部草稿，待核（fr 没见核过记录） |

## 三、入场教程（三站）

PingLive 的三站：拖船（Down）→ 点 Forward → 点 Panoramic；Mini 的三站：拖船（Combo）→ 点 Forward → 点 Down。
标题的英文也是原型里来的；Jason 定说明文字时如果也改标题，这几行跟着重翻。

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| tour_drag_title | 第 1 站标题 | Drag the boat | Faites glisser le bateau | Ziehen Sie das Boot | Sleep de boot | Przeciągnij łódź | Velciet laivu | 翻 | 全部草稿，待核 |
| tour_drag_text | 第 1 站说明 | （占位）Whatever the beam touches shows up live in the Accuphy Sonar app. | — | — | — | — | — | 翻 | **等 Jason 定英文** |
| tour_fwd_title | 第 2 站标题 | Tap Forward View | Touchez la vue avant | Tippen Sie auf „Sicht nach vorne“ | Tik op Voorwaartse weergave | Dotknij widoku do przodu | Pieskarieties skatam uz priekšu | 翻 | 全部草稿，待核（glossary forward-view） |
| tour_fwd_text | 第 2 站说明 | （占位）The beam turns to look ahead of the boat — where you cast. | — | — | — | — | — | 翻 | **等 Jason 定英文** |
| tour_pano_title | PingLive 第 3 站标题 | Tap Panoramic View | Touchez la vue panoramique | Tippen Sie auf „Panoramaansicht“ | Tik op Panoramische weergave | Dotknij widoku panoramicznego | Pieskarieties panorāmas skatam | 翻 | 全部草稿，待核（glossary panoramic-view） |
| tour_pano_text | PingLive 第 3 站说明 | （占位）A wide sweep ahead of the boat — to find fish and structure. | — | — | — | — | — | 翻 | **等 Jason 定英文** |
| tour_down_title | Mini 第 3 站标题 | Tap Down View | Touchez la vue vers le bas | Tippen Sie auf „Sicht nach unten“ | Tik op Neerwaartse weergave | Dotknij widoku w dół | Pieskarieties skatam uz leju | 翻 | 全部草稿，待核（glossary down-view） |
| tour_down_text | Mini 第 3 站说明 | （占位）The beam points straight under the boat — see what’s right below. | — | — | — | — | — | 翻 | **等 Jason 定英文** |
| tour_tap | 手指旁的小气泡 | Tap | Touchez | Tippen | Tik | Dotknij | Pieskarieties | 翻 | 全部草稿，待核 |
| tour_skip | 右上角 | Skip tour | Passer la visite | Tour überspringen | Rondleiding overslaan | Pomiń przewodnik | Izlaist ceļvedi | 翻 | 全部草稿，待核 |
| tour_replay | 教程走完后右上角 | Replay tour | Revoir la visite | Tour wiederholen | Rondleiding opnieuw | Powtórz przewodnik | Atkārtot ceļvedi | 翻 | 全部草稿，待核 |

## 四、分享、App 下载、Learn More

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| share | 电脑面板的分享按钮 | Send to a fishing buddy | Partager | Teilen | Delen | Udostępnij | Kopīgot | 翻 | fr 已核（#198：“Partager” 用在所有分享处）；de/nl/pl/lv 草稿，待核。照法语的做法用短词；要说出“钓友”的备选：An einen Angelkumpel senden / Stuur naar een vismaat / Wyślij znajomemu wędkarzowi / Nosūtīt makšķerēšanas draugam |
| share_buddy_phone | 手机底部的分享按钮 | Share to a Fishing Buddy | Partager | Teilen | Delen | Udostępnij | Kopīgot | 翻 | 全部草稿，待核（fr 在 i18n.js 标着草稿） |
| share_title | 分享框标题 | （草稿）Show a buddy what’s under the boat | （现在显示 Partager） | — | — | — | — | 翻 | **等 Jason 定英文**（10-31 网站单子写着等 Jason 从两句里选）；定之前可临时同法语，用上一行的短词 |
| share_line | 分享框预览图下一句 | （草稿）Drag the boat. Watch the sonar light up. | （空，不显示） | — | — | — | — | 翻 | **等 Jason 定英文**；定之前留空（不显示） |
| share_qr_caption | 电脑分享框二维码下 | Scan with your phone camera to open the Lab on your phone | Scannez avec l’appareil photo de votre téléphone pour ouvrir le Lab. | Mit der Smartphone-Kamera scannen, um das Lab auf dem Smartphone zu öffnen. | Scan met de camera van je smartphone om het Lab op je smartphone te openen. | Zeskanuj aparatem w telefonie, aby otworzyć Lab na telefonie. | Noskenējiet ar tālruņa kameru, lai atvērtu Lab tālrunī. | 翻（Lab 不翻） | fr 已核；de/nl/pl/lv 草稿，待核（de/nl 用 Smartphone，glossary tablet 一行） |
| share_qr_caption_phone | 手机分享框二维码下 | Let a friend scan this with their phone camera | Un ami peut scanner ce code avec l’appareil photo de son téléphone. | Ein Freund kann diesen Code mit der Smartphone-Kamera scannen. | Laat een vriend deze code scannen met de smartphonecamera. | Znajomy może zeskanować ten kod aparatem w telefonie. | Draugs var noskenēt šo kodu ar tālruņa kameru. | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| share_link_label | 链接框（读屏用） | Link | Lien | Link | Link | Link | Saite | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| share_copy | 复制按钮 | Copy link | Copier le lien | Link kopieren | Link kopiëren | Kopiuj link | Kopēt saiti | 翻 | 全部草稿，待核（fr 没见核过记录） |
| share_copied_check | 复制后 | Copied ✓ | Copié ✓ | Kopiert ✓ | Gekopieerd ✓ | Skopiowano ✓ | Nokopēts ✓ | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| share_copy_hint | 链接框下 | Paste it into a message to a friend. | Collez-le dans un message à un ami. | Fügen Sie ihn in eine Nachricht an einen Freund ein. | Plak hem in een bericht aan een vriend. | Wklej go do wiadomości do znajomego. | Ielīmējiet to ziņā draugam. | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| share_press_copy | 复制被拦时 | Press {keys} to copy | Appuyez sur {keys} pour copier | Zum Kopieren {keys} drücken | Druk op {keys} om te kopiëren | Naciśnij {keys}, aby skopiować | Nospiediet {keys}, lai kopētu | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| share_close | 分享框、App 二维码框的 ×（读屏用） | Close | Fermer | Schließen | Sluiten | Zamknij | Aizvērt | 翻 | fr 已核；de/nl/pl/lv 草稿，待核 |
| qr_label | 每个二维码图（读屏用） | QR code | code QR | QR-Code | QR-code | kod QR | QR kods | 翻 | 全部草稿，待核 |
| get_app | 电脑手机上方徽章上的小字 | Get Accuphy Sonar App | Télécharger l’application Accuphy Sonar | Accuphy Sonar-App herunterladen | Download de Accuphy Sonar-app | Pobierz aplikację Accuphy Sonar | Lejupielādējiet lietotni Accuphy Sonar | 翻（“Accuphy Sonar” 不翻） | 全部草稿，待核（de/nl 写法照 glossary accuphy-sonar-app：Sonar-App / Sonar-app） |
| app_qr_caption | 电脑：商店二维码下 | Scan to download Accuphy Sonar App | Scannez pour télécharger l’application Accuphy Sonar | Scannen, um die Accuphy Sonar-App herunterzuladen | Scan om de Accuphy Sonar-app te downloaden | Zeskanuj, aby pobrać aplikację Accuphy Sonar | Noskenējiet, lai lejupielādētu lietotni Accuphy Sonar | 翻 | 全部草稿，待核 |
| app_qr_open | 徽章按钮（读屏用） | Show the {store} QR code | Afficher le code QR {store} | QR-Code für {store} anzeigen | QR-code voor {store} tonen | Pokaż kod QR {store} | Rādīt {store} QR kodu | 翻（{store} = App Store / Google Play，不翻） | 全部草稿，待核 |
| learn_more | 手机上方的去商店按钮 | Learn More | En savoir plus | Mehr erfahren | Meer informatie | Dowiedz się więcej | Uzzināt vairāk | 翻 | 全部草稿，待核 |

## 五、手机里面：App 首页

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| tile_panoramic | PingLive 格子 | Panoramic View | Vue panoramique | Panoramablick | Panoramic View | Widok panoramiczny | Panoramic View | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_forward | PingLive 格子 | Forward View | Vue avant | Vorwärtsansicht | Forward View | Widok przedni | Forward View | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_down | PingLive 格子 | Down View | Vue inférieure | Boden-Scan-Ansicht | Down View | Widok skanowania dna | Down View | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_live_panoramic | Mini 格子 | Live Panoramic | Panoramique en direct | Live-Panorama | Live Panoramic | Panorama Live | Live Panoramic | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_live_forward | Mini 格子 | Live Forward | Avant en direct | Live-Voraus | Live Forward | W przód Live | Live Forward | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_live_down | Mini 格子 | Live Down | Dessous en direct | Live-Unten | Live Down | W dół Live | Live Down | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_live_combo | Mini 格子 | Live Combo | Combinée en direct | Live-Kombi | Live Combo | Combo Live | Live Combo | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_downscan | Mini 格子（点了出 na_moving） | Down Scan | Balayage vers le bas | Boden-Scan | Down Scan | Skanowanie dna | Down Scan | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核。App 德语写 Boden-Scan，手机外面仍是 Down Scan |
| tile_chirp | Mini 格子（点了出 na_moving） | Chirp Sonar | Sondeur CHIRP | Klassisches Sonar | Chirp Sonar | Klasyczny sonar | Chirp Sonar | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核。App 德、波都写“经典声纳”，不是 CHIRP，照 App |
| tile_ice | Mini 格子（通往冰钓页，格子在 `/` 上看得到） | Ice Fishing | Pêche sur glace | Eisangel | Ice Fishing | Podlodowe | Ice Fishing | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tile_live_ice | Mini 格子（同上） | Live Ice Fishing | Pêche sur glace en direct | Live-Eisangeln | Live Ice Fishing | Podlodowe Live | Live Ice Fishing | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tab_setting | 底栏 | Setting | Paramètres | Einstellungen | Setting | Ustawienia | Setting | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tab_home | 底栏 | Home | Accueil | Startseite | Home | Strona główna | Home | 照 App | de/pl 照 App 原字（网站 11-03 读安装包）；nl/lv 留英文（App 没这两种语言，网站同意）；fr 已核 |
| tab_map | 底栏 | Map | Map | Map | Map | Map | Map | 照 App | Map 哪种语言都不翻（App 各语言都显示 Map） |
| combo_fwd | 手机里 Combo 两个量程上的小字 | FORWARD | AVANT | VORNE | VOORUIT | PRZÓD | PRIEKŠĀ | 翻（App 里没有这两个字，网站 11-03 查过） | 全部草稿，待核（fr 没见核过记录） |
| combo_down | 同上 | DOWN | BAS | UNTEN | OMLAAG | DÓŁ | LEJĀ | 同上 | 同上 |
| na_moving | 点 Down Scan / Chirp 后的提示 | {view} needs the boat moving slowly, so it isn’t available in this simulation yet. | {view} exige que le bateau avance lentement : cette vue n’est donc pas encore disponible dans cette simulation. | {view} braucht ein langsam fahrendes Boot und ist in dieser Simulation deshalb noch nicht verfügbar. | {view} vraagt om een langzaam varende boot en is daarom nog niet beschikbaar in deze simulatie. | Tryb {view} wymaga powoli płynącej łodzi, dlatego nie jest jeszcze dostępny w tej symulacji. | Skatam {view} vajadzīga lēni braucoša laiva, tāpēc šajā simulācijā tas vēl nav pieejams. | 翻（{view} 照 App） | fr 已核；de/nl/pl/lv 草稿，待核 |

## 六、永远不翻（原样）

PingLive、PingLive Mini、Accuphy Sonar（App 名；“app” 这个词按 glossary 用本地写法）、CHIRP、Down Scan（手机外面）、
App Store、Google Play、“ACCUPHY | LAB” 标题、AUTO、数字和单位、手机框里 App 的数字和单位（ft、°C、V、%）。

## 七、不在这张表里

- **冰钓专用**（这次不翻）：camera、cam_top、cam_under、cam_section、mode_liveice、mode_ice、desc_ice、hint_ice、
  tour_drill_title、tour_drill_text、tour_ice_fwd_text、tour_ice_down_text、not_available（现在只在冰钓页的 Live Panoramic 出现）。
- **锁（营销版）**：unlock_title、unlock_locked、unlock_text、unlock_done、unlock_email、unlock_cta、unlock_sending、
  unlock_consent、unlock_privacy、unlock_err_email、unlock_err_send、unlock_err_closed、back_to_lake。
- **代码里没用到**：depth、share_text、share_sms、share_copied（查过整个湖文件夹，没有地方调用）。要不要删由 Base 定。

## 八、表外的字（不在 i18n.js，交 Base 一起处理）

查代码时看到的，加语言时也要动，不然会剩英文或链接不对。只记下来，我不改：

- `AppBadges.jsx`：App Store / Google Play 徽章图只有 en、fr 两套（`badges/`）；de、nl、pl、lv 要用苹果、谷歌官方的本地版徽章。
  商店链接的语言参数（`?l=fr-CA`、`hl=fr_CA`）和徽章的 alt 字（“Download on the App Store”“Get it on Google Play”）也只认 fr。
- `embed.js` 第 36–37 行：自己又判断了一次 `?lang=fr`，去商店的路径只有 `/fr`。德、荷要接店铺的 `/de-de`、`/nl-benelux`
  （店铺框传 `shop=` 时应该已经对，要 Base 核）。
- 几个读屏字写死英文：`index.jsx` 的 “Show the lake”“Show the sonar full-screen”、`home/AppHome.jsx` 的 “Home”、
  量程按钮的 title “ft / m”、Down 视图时滑杆的 title “AUTO: follows the water depth”、`SonarChrome.jsx` 的 “App control — shown for reference”。
- 字体：波兰语（ą ć ę ł ń ó ś ź ż）、拉脱维亚语（ā č ē ģ ī ķ ļ ņ š ū ž）的字母要补进品牌字体（规划第二节第 2 条）。
  上表 pl、lv 列用到的字母都在这两组里。

## 记录

- 2026-11-03 Lab 多语言：建表。字来自 i18n.js @ e715574；法语“已核”对照网站 10-26、10-31 两张单子和 #198 / #186 / #184 的记录。
  其余全部是机器草稿，待核。
- 2026-11-03 Lab 多语言：照网站 11-03 的回答更新（HQ 转）：填 de、pl 的 App 原字（12 个首页格子 + 底栏），Map 不翻；
  combo_fwd / combo_down 改成“翻”；称呼定为德 Sie、荷 je；toast_phone 里的 “Home” 换成 App 底栏的字（de Startseite，
  pl Strona główna）。谁来核还在等 Jason，先不核。
