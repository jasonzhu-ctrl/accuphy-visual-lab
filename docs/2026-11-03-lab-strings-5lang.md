# Lab Base 版 5 种语言对照表（`/` 页，#212；Lab 多语言窗口，2026-11-03）

只放 `/` 页用得到的字：PingLive 页，和切到 PingLive Mini 以后的字。键名就是
`src/experiments/2026-09-23-sonar-lake-3d/i18n.js` 里的键（来源：i18n.js @ e715574，每个键都在代码里查过用在哪）。

**状态（11-03 核完）：Lab 自己核（#214，Jason 11-03）。** 能核的都标了 “Lab 已核”，每条写了依据。
拿不准的 3 条都定了（第七节：#220、#221），表里已经没有空格，只剩分享框两句等英文，**没有硬定**，表里写“拿不准”，给了几个备选。
教程四句说明（`tour_*_text`）的英文 Jason 11-03 定了用现在的（#215），已翻已核；分享框标题和下面那句（`share_title`、`share_line`）的英文还没定，照旧空着。
下一步：HQ 先给 Jason 看，再由 HQ 放进各版本（#233）：
- 放进“网站嵌入版”（`src/experiments/2026-11-03-sonar-lake-web/`，就是客人在店铺里看到的那份）；
- Base 也留一份；
- MKT 版等多语言搬过去时再放（#216）。

键名是照 Base @ e715574 查的；放进网站嵌入版前，请那边对一下键名有没有变。这份表本身不改任何代码。

## 怎么核的（#214）

- **法、德、荷**：按顺序对照。
  1. 先看店铺线上原文：/fr、/de-de、/nl-benelux 的首页、PingLive 和 PingLive Mini 产品页、按钮、菜单、页脚。
     11-03 抓的线上页面，还有线上主题的语言包（`accuphy-website/theme/locales/{fr,de,nl}.json`，比如 Close、Copy link、Link、QR）。
  2. 再看 `accuphy-website/docs/glossary.csv`。
  3. 最后看大品牌：Garmin ECHOMAP UHD2 6/7/9 sv 用户手册的 FR-FR / DE-DE / NL-NL 版
     （`www8.garmin.com/manuals/webhelp/GUID-900F784C-8371-433B-B263-67611C27A94C/…`，就是 glossary 引用的那本）。
     手册里有 LiveScope 的设置项：Gain、Range、Forward Range、Depth Range。
- **波兰语**：
  1. 先对照代理商 Prime Power 的波兰网店（accuphy.primepower.com.pl：首页、PingLive、PingLive Mini 两页，还有店里的波兰语目录 PDF）。
  2. 再看 Garmin 手册 PL-PL 版。
  3. 最后全部翻回英文对一遍（第六节）。
- **拉脱维亚语**：
  1. 先对照大品牌：Garmin 手册 LV-LV 版，还有 garmin.com/lv-LV（网页多数靠脚本加载，只读到“Pirkt”这类菜单字）。
  2. Deeper、Lowrance 没有拉脱维亚语页（11-03 试过，Deeper 返回 404，Lowrance 返回 403）。
  3. 最后全部翻回英文对一遍（第六节）。不找代理商。
- **依据的写法**：
  - 店de / 店nl / 店fr = 11-03 抓的线上店铺页；
  - 主题 = 线上主题语言包；
  - GL = glossary.csv；
  - G = Garmin 手册同语言版；
  - PP = Prime Power 波兰网店；
  - App = 网站 11-03 从 App 安装包读出的原字。
- **称呼**：德语 Sie，荷兰语 je（跟线上一致）。
  - 波兰语用第二人称命令式（Przeciągnij、Dotknij；Garmin PL、PP 都这样写）。
  - 拉脱维亚语用敬称复数（Velciet、Pieskarieties；Garmin LV 这样写）。
- **手机框里**：照 App。App 只有 de / fr / ja / pl / ru / zh，**没有 nl、lv**，所以这两种语言手机框里留英文（网站 11-03 同意）。
  - Map 哪种语言都不翻。
  - 这是 6 月 dev 版安装包，正式版 App 还没在平板上核过（网站 T-066）。
- `{device}`、`{view}`、`{beam}`、`{name}`、`{store}`、`{keys}` 是程序代进去的词，不翻。

**这次核出来、跟 glossary 对不上的**：德语店铺线上的视图名，跟 glossary 不一样。
- 线上用：Vorwärtsansicht、Abwärtsansicht（Mini 页 7 处、PingLive 页 1 处）、Panoramablick / Panoramaansicht、Kombi-Ansicht；
- glossary 写：Sicht nach vorne、Sicht nach unten、Panoramaansicht、Kombiansicht；
- 按顺序先照线上，表里用线上的。glossary 是网站的文件，要不要改，HQ 转网站。

## 一、控制面板（电脑左边）

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 | 依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| device | 面板 | Device | Appareil | Gerät | Apparaat | Urządzenie | Ierīce | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Kompatible Geräte”；店nl “Compatibele apparaten”；PP “Kompatybilne urządzenia”；G-LV “ierīce” |
| view | 面板 | View | Vue | Ansicht | Weergave | Widok | Skats | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Anzeigeansichten”；店nl “Weergaveopties”；PP “Widok do przodu”；G-LV “sonāra skats” |
| range | 面板 | Range | Portée | Reichweite | Bereik | Zasięg | Diapazons | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Reichweite & Tiefe”“Maximale Reichweite”（G-DE 设置项写 Bereich，照店铺）；店nl “Bereik & diepte”、G-NL “Bereik:”；PP “Maksymalny zasięg”、G-PL “Zasięg:”；G-LV “Diapazons:” |
| auto_follows | 面板，Down 视图时 | AUTO · follows the water | AUTO · suit la profondeur | AUTO · folgt der Wassertiefe | AUTO · volgt de waterdiepte | AUTO · dopasowuje się do głębokości | AUTO · seko ūdens dziļumam | 翻（AUTO 不翻） | fr 网站已核；de nl pl lv Lab 已核 | 店de “Tiefe”；店nl “diepte”；G-PL “głębokość”；G-LV “dziļums”；G 的 Auto 范围说明是同一个意思（量程跟着水深变） |
| range_fwd | 面板，Mini 的 Combo | Forward range | Portée avant | Reichweite nach vorne | Voorwaarts bereik | Zasięg do przodu | Diapazons uz priekšu | 翻 | 全部 Lab 已核 | G-DE “Reichweite nach vorne:”；G-NL “Voorwaarts bereik:”；G-PL “Zasięg do przodu:”；G-LV “attāluma uz priekšu diapazons”（设置项叫 Priekšupgaita，太怪不用）；fr 照店fr “Vue avant” 的短写（G-FR “Portée vers l’avant”） |
| range_down | 面板，Mini 的 Combo | Down range | Portée de la profondeur | Tiefenbereich | Dieptebereik | Zakres głębokości | Dziļuma diapazons | 翻 | 全部 Lab 已核（Jason 11-03：照 Garmin，#221） | Garmin LiveScope 设置里跟 Forward Range 配对的 Depth Range：G-FR “Portée de la profondeur”、G-NL “Dieptebereik”、G-PL “Zakres głębokości”、G-LV “Dziļuma diapazons”；de：G-DE 这一项写 “Mögliche Reichweite”（不通顺），用 GL depth-range 和 G-DE 别处的 “Tiefenbereich”；nl 也跟 GL 一致 |
| mode_down | 视图胶囊；教程卡上的视图按钮 | Down | Bas | Abwärts | Omlaag | W dół | Uz leju | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Abwärtsansicht”；店nl “Omlaag”（“3 weergavemodi • Omlaag • Vooruit • Panoramisch”）；PP “Widok w dół”；G-LV “skats uz leju” |
| mode_forward | 同上 | Forward | Avant | Vorwärts | Vooruit | Do przodu | Uz priekšu | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Vorwärtsansicht”“Live vorwärts”；店nl “Vooruit”；PP “Widok do przodu”；G-LV “skats uz priekšu” |
| mode_panoramic | 同上 | Panoramic | Panoramique | Panorama | Panoramisch | Panoramiczny | Panorāma | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de 两种写法都以 Panorama 开头；店nl “Panoramisch”；PP “Widok panoramiczny”；lv：Garmin 没有这个视图，用普通词 panorāma |
| mode_combo | 同上（Mini） | Combo | Combinée | Kombi | Combo | Łączony | Kombinētais | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Kombi-Ansicht”、App “Live-Kombi”；店nl “Combo”；PP “Widok łączony”；G-LV “kombinētajos ekrānos”（lv 偏长，界面设计看宽度） |
| desc_lake | 面板下的一句 | {device} · {beam} beam. Drag the boat — whatever the beam touches lights up. | {device} · faisceau de {beam}. Faites glisser le bateau : tout ce que le faisceau touche s’allume. | {device} · {beam}-Kegel. Ziehen Sie das Boot – alles, was der Kegel erfasst, leuchtet auf. | {device} · {beam}-bundel. Versleep de boot – alles wat de bundel raakt, licht op. | {device} · wiązka {beam}. Przeciągnij łódź – wszystko, czego dotknie wiązka, podświetla się. | {device} · {beam} stars. Velciet laivu – viss, ko skar stars, izgaismojas. | 翻 | fr 网站已核；de nl pl lv Lab 已核 | de：GL beam=Kegel、G-DE “Kegel” 13 处（店de 首页规格写 “135°-Strahlwinkel”，是“波束角”，句子里用 Kegel）；店de “Ziehen Sie den Schieberegler”。nl：店nl “135°-bundel”“Versleep de schuifregelaar”。pl：PP “Szeroka wiązka 135°”、G-PL “przeciągnij”。lv：G-LV “stars / staru zona”“velciet”“izgaismojas” |
| shop | 面板的去商店按钮 | Shop {name} | Achetez le {name} | {name} kaufen | Koop de {name} | Kup {name} | Pirkt {name} | 翻（照店铺按钮） | fr 网站已核；de nl pl lv Lab 已核（Jason 11-03：“不用管能不能下单”，写“买”，#220） | fr 店fr “Achetez le PingLive Mini”；de 店de 首页 “Jetzt einkaufen” 的 kaufen；nl 店nl 首页 “Shop nu” 的意思，用本地动词 kopen；pl PP “Kup PingLive Mini”；lv garmin.com/lv-LV “Pirkt” |
| shop_opening | 点了去商店后 1 秒 | Opening the store… | Ouverture de la boutique… | Shop wird geöffnet… | Winkel wordt geopend… | Otwieranie sklepu… | Veikals tiek atvērts… | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 主题de “Lädt…” 的句式；店nl “Winkelwagen / Winkelpunten”；PP “Sklep internetowy”；lv 普通词 veikals |

## 二、湖上的提示

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 | 依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| hint_boat | 船上方的提示 | Drag the boat to move it | Faites glisser le bateau pour le déplacer | Ziehen Sie das Boot, um es zu bewegen | Versleep de boot om hem te verplaatsen | Przeciągnij łódź, aby ją przesunąć | Velciet laivu, lai to pārvietotu | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 店de “Ziehen Sie…”；店nl “Versleep…”（G-NL 写 Sleep，照店铺）；G-PL “Dotknij i przeciągnij”；G-LV “pieskarieties un velciet” |
| shore_edge | 船或点击碰到岸边 | Shoreline — the lake ends here | La rive : le lac s’arrête ici | Ufer – hier endet der See | Oever – hier eindigt het meer | Linia brzegowa – tu kończy się jezioro | Krasta līnija – šeit ezers beidzas | 翻 | 全部 Lab 已核 | G-PL “linia brzegowa”、G-LV “krasta līnija”（Garmin 的岸线）；de / nl / fr 的 Garmin 写 Küstenlinie / kustlijn / littoral（海岸），湖岸用普通词 Ufer / oever / rive；PP “jeziora”、G-LV “ezers” |
| toast_phone | 手机：点了 App 控件 | These are the app’s own controls — Home, range, gain and pause work. | Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent. | Das sind die Bedienelemente der App – Startseite, Reichweite, Verstärkung und Pause funktionieren. | Dit zijn de eigen knoppen van de app – Home, bereik, versterking en pauze werken. | To są przyciski samej aplikacji – działają: Strona główna, zasięg, wzmocnienie i wstrzymanie. | Šīs ir lietotnes pašas vadīklas – darbojas Home, diapazons, pastiprinājums un pauze. | 翻 | fr 网站已核；de nl pl lv Lab 已核 | “Home” = App 底栏原字（de Startseite、pl Strona główna；nl、lv 的 App 是英文）；Gain：G-DE “Verstärkung:”、G-NL “Versterking:”、PP “wzmocnienia”、G-LV “pastiprinājums”；Pause：G-NL “pauzeren”、G-PL “wstrzymanie”、G-LV “pauze” |
| toast_desktop | 电脑：点了 App 控件 | These are the app’s own controls — use the panel to change the view. | Ce sont les commandes de l’application : changez de vue dans le panneau. | Das sind die Bedienelemente der App – die Ansicht wechseln Sie im Bedienfeld. | Dit zijn de eigen knoppen van de app – wissel van weergave in het paneel. | To są przyciski samej aplikacji – widok zmienisz w panelu. | Šīs ir lietotnes pašas vadīklas – skatu mainiet panelī. | 翻 | fr 网站已核；de nl pl lv Lab 已核 | “view” 同 view 一行；G-PL “panel”、G-LV “panelī”；de Bedienfeld 是常用界面词（Garmin 没有对应句子） |
| gl_lost_title | 3D 停了的卡片 | The 3D view stopped | La vue 3D s’est arrêtée | Die 3D-Ansicht wurde angehalten | De 3D-weergave is gestopt | Widok 3D się zatrzymał | 3D skats apstājās | 翻 | 全部 Lab 已核 | view 的词同上；G-DE “Anhalten”；G-LV “apturēt / apstāties” |
| gl_lost_text | 同上 | Your browser freed the graphics memory. Tap to reload the lake. | Votre navigateur a libéré la mémoire graphique. Touchez pour recharger le lac. | Ihr Browser hat den Grafikspeicher freigegeben. Tippen Sie, um den See neu zu laden. | Je browser heeft het grafische geheugen vrijgegeven. Tik om het meer opnieuw te laden. | Przeglądarka zwolniła pamięć graficzną. Dotknij, aby ponownie wczytać jezioro. | Jūsu pārlūks atbrīvoja grafikas atmiņu. Pieskarieties, lai vēlreiz ielādētu ezeru. | 翻 | 全部 Lab 已核 | G-FR “Touchez”、G-FR “navigateur web”；G-DE “Tippen Sie”；G-NL “Tik”；G-PL “przeglądarce internetowej”“Dotknij”；G-LV “tīmekļa pārlūkā”“pieskarieties” |

## 三、入场教程（三站）

PingLive：拖船（Down）→ 点 Forward → 点 Panoramic；Mini：拖船（Combo）→ 点 Forward → 点 Down。
说明文字的英文 Jason 11-03 定了就用现在的（#215），标题照旧。冰钓的教程句子不做。

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 | 依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| tour_drag_title | 第 1 站标题 | Drag the boat | Faites glisser le bateau | Ziehen Sie das Boot | Versleep de boot | Przeciągnij łódź | Velciet laivu | 翻 | 全部 Lab 已核 | 同 hint_boat |
| tour_drag_text | 第 1 站说明 | Whatever the beam touches shows up live in the Accuphy Sonar app. | Tout ce que le faisceau touche apparaît en direct dans l’application Accuphy Sonar. | Alles, was der Kegel erfasst, erscheint live in der Accuphy Sonar-App. | Alles wat de bundel raakt, zie je live in de Accuphy Sonar-app. | Wszystko, czego dotknie wiązka, widać na żywo w aplikacji Accuphy Sonar. | Viss, ko skar stars, reāllaikā parādās lietotnē Accuphy Sonar. | 翻 | 全部 Lab 已核（英文 Jason 11-03 定，#215） | fr：已核 s2_text “en direct … dans l’application Accuphy Sonar”、desc_lake “tout ce que le faisceau touche”；de：desc_lake 的 Kegel、店de Mini 页 “mit der Accuphy Sonar-App”“Live-Bild”；nl：店nl “met de Accuphy Sonar-app”“live beelden”；pl：PP “Widok na żywo”“aplikacji Accuphy Sonar”；lv：G-LV “reāllaikā skatīt”、garmin.com/lv-LV “Aplūkojiet zemūdens pasauli reāllaikā” |
| tour_fwd_title | 第 2 站标题 | Tap Forward View | Touchez la vue avant | Tippen Sie auf „Vorwärtsansicht“ | Tik op Voorwaartse weergave | Dotknij widoku do przodu | Pieskarieties skatam uz priekšu | 翻 | 全部 Lab 已核 | 店fr “Vue avant”；店de “Vorwärtsansicht”（GL 写 Sicht nach vorne，照线上）；店nl “Voorwaartse weergave”、G-NL “Tik op”；PP “Widok do przodu”；G-LV “skats uz priekšu”“pieskarieties + 与格” |
| tour_fwd_text | 第 2 站说明 | The beam turns to look ahead of the boat — where you cast. | Le faisceau se tourne vers l’avant du bateau : là où vous lancez. | Der Kegel dreht sich und blickt vor das Boot – dorthin, wo Sie auswerfen. | De bundel draait naar voren, voor de boot – daar waar je werpt. | Wiązka obraca się i patrzy przed łódź – tam, gdzie zarzucasz. | Stars pagriežas uz priekšu, laivas priekšā – tur, kur metat ēsmu. | 翻 | 全部 Lab 已核（英文 Jason 11-03 定，#215） | fr：已核步骤 3 “la vue avant, pour lancer dessus”、已核步骤 2 “l’oriente devant le bateau”；de：店de “Frontansicht für verschiedene Angelszenarien”，auswerfen = 抛竿；nl：店nl “Kijk in realtime voor uw boot”，werpen = 抛竿；pl：PP “Obserwuj obszar przed łodzią”，zarzucać = 抛竿；lv：G-LV “laivas priekšā vai zem laivas”，抛竿 Garmin 没有，用常用的 mest ēsmu（抛饵） |
| tour_pano_title | PingLive 第 3 站标题 | Tap Panoramic View | Touchez la vue panoramique | Tippen Sie auf „Panoramablick“ | Tik op Panoramische weergave | Dotknij widoku panoramicznego | Pieskarieties panorāmas skatam | 翻 | 全部 Lab 已核（de：Jason 11-03 “你查一查定吧”，Lab 定 Panoramablick，#221） | 店fr “Vue panoramique”；店de PingLive 产品页 “Panoramablick”，App 格子也是 “Panoramablick”（店de 首页和 GL 写 Panoramaansicht，少数，不用）；店nl “Panoramische weergave”；PP “Widok panoramiczny” |
| tour_pano_text | PingLive 第 3 站说明 | A wide sweep ahead of the boat — to find fish and structure. | Un large balayage devant le bateau : pour repérer poissons et structures. | Ein breiter Scan vor dem Boot – um Fische und Strukturen zu erkennen. | Een brede scan voor de boot – om vissen en structuren te spotten. | Szerokie skanowanie przed łodzią – do odnajdywania ryb i struktur. | Plaša skenēšana laivas priekšā – lai atrastu zivis un struktūras. | 翻 | 全部 Lab 已核（英文 Jason 11-03 定，#215） | fr：已核步骤 3 “scanne de larges zones pour repérer poissons et structures”；de：店de “scannt große Bereiche, um Strukturen und Fische leicht zu erkennen”；nl：店nl “scan grote gebieden om gemakkelijk structuren en vissen te spotten”；pl：PP “skanowanie dużego obszaru i łatwiejsze odnajdywanie ryb”“podwodne struktury”；lv：G-LV “skenēšana”“struktūra un zivis” |
| tour_down_title | Mini 第 3 站标题 | Tap Down View | Touchez la vue vers le bas | Tippen Sie auf „Abwärtsansicht“ | Tik op Neerwaartse weergave | Dotknij widoku w dół | Pieskarieties skatam uz leju | 翻 | 全部 Lab 已核 | 店fr “Vue vers le bas”；店de “Abwärtsansicht”；店nl “Neerwaartse weergave”；PP “Widok w dół”；G-LV “skats uz leju” |
| tour_down_text | Mini 第 3 站说明 | The beam points straight under the boat — see what’s right below. | Le faisceau pointe droit sous le bateau : voyez ce qui se trouve juste en dessous. | Der Kegel zeigt direkt unter das Boot – Sie sehen, was genau darunter ist. | De bundel wijst recht onder de boot – zie wat er direct onder je zit. | Wiązka skierowana jest prosto pod łódź – zobacz, co jest tuż pod nią. | Stars vērsts taisni zem laivas – redziet, kas atrodas tieši apakšā. | 翻 | 全部 Lab 已核（英文 Jason 11-03 定，#215） | fr：已核 “pêcher à la verticale”、店fr “Vue vers le bas … sous votre bateau”；de：店de “die Aktivität unter Ihrem Boot … direkt unter einem Eisloch”；nl：店nl “direct onder uw vaartuig”“de activiteit onder je boot”；pl：PP “bezpośrednio pod łodzią”、G-PL “wiązką skierowaną w dół”；lv：G-LV “zem laivas” |
| tour_tap | 手指旁的小气泡 | Tap | Touchez | Tippen | Tik | Dotknij | Pieskarieties | 翻 | 全部 Lab 已核 | G-FR / G-DE / G-NL / G-PL / G-LV 的“点屏幕”都是这个词 |
| tour_skip | 右上角 | Skip tour | Passer la visite | Einführung überspringen | Rondleiding overslaan | Pomiń samouczek | Izlaist pamācību | 翻 | 全部 Lab 已核 | 主题fr “Passer au contenu”、主题de “Zum Inhalt springen” 的动词；“tour” 照 App 常见叫法：de Einführung、pl samouczek、lv pamācība（Garmin 没有入场教程） |
| tour_replay | 教程走完后右上角 | Replay tour | Revoir la visite | Einführung wiederholen | Rondleiding opnieuw bekijken | Powtórz samouczek | Atkārtot pamācību | 翻 | 全部 Lab 已核 | 同上 |

## 四、分享、App 下载、Learn More

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 | 依据 |
|---|---|---|---|---|---|---|---|---|---|---|
| share | 电脑面板的分享按钮 | Send to a fishing buddy | Partager | Teilen | Delen | Udostępnij | Kopīgot | 翻 | fr 网站已核（#198）；de nl pl lv Lab 已核 | 照法语的做法用短词。主题de “Dieses Produkt teilen”；主题nl “Deel dit product”；PP “Udostępniaj obraz”；G-LV “kopīgošana” |
| share_buddy_phone | 手机底部的分享按钮 | Share to a Fishing Buddy | Partager | Teilen | Delen | Udostępnij | Kopīgot | 翻 | 全部 Lab 已核（fr 照 #198 “所有分享处都用 Partager”） | 同上 |
| share_title | 分享框标题 | （草稿）Show a buddy what’s under the boat | （现在显示 Partager） | — | — | — | — | 翻 | **等 Jason 定英文**；定之前可临时用上一行的短词 | — |
| share_line | 分享框预览图下一句 | （草稿）Drag the boat. Watch the sonar light up. | （空，不显示） | — | — | — | — | 翻 | **等 Jason 定英文**；定之前留空 | — |
| share_qr_caption | 电脑分享框二维码下 | Scan with your phone camera to open the Lab on your phone | Scannez avec l’appareil photo de votre téléphone pour ouvrir le Lab. | Mit der Smartphone-Kamera scannen, um das Lab auf dem Smartphone zu öffnen. | Scan met de camera van je smartphone om het Lab op je smartphone te openen. | Zeskanuj aparatem w telefonie, aby otworzyć Lab na telefonie. | Skenējiet ar tālruņa kameru, lai atvērtu Lab tālrunī. | 翻（Lab 不翻） | fr 网站已核；de nl pl lv Lab 已核 | GL tablet 一行（de/nl 用 Smartphone）、G-DE / G-NL “Smartphone”；主题de “scannen, um…”；主题nl “scan om…”；G-PL “kod QR możesz zeskanować”、PP “telefon”；G-LV “skenēt šo QR kodu”“tālrunis” |
| share_qr_caption_phone | 手机分享框二维码下 | Let a friend scan this with their phone camera | Un ami peut scanner ce code avec l’appareil photo de son téléphone. | Ein Freund kann diesen Code mit der Smartphone-Kamera scannen. | Laat een vriend deze code scannen met de smartphonecamera. | Znajomy może zeskanować ten kod aparatem w telefonie. | Draugs var skenēt šo kodu ar tālruņa kameru. | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 同上 |
| share_link_label | 链接框（读屏用） | Link | Lien | Link | Link | Link | Saite | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 主题de / 主题nl “Link”（share_url）；pl 通用 link；G-LV “saite / saiti” |
| share_copy | 复制按钮 | Copy link | Copier le lien | Link kopieren | Link kopiëren | Kopiuj link | Kopēt saiti | 翻 | 全部 Lab 已核 | 主题fr / 主题de / 主题nl 原字一模一样（copy_to_clipboard）；G-PL “Skopiuj”（按钮用未完成体 Kopiuj）；G-LV “kopēt” |
| share_copied_check | 复制后 | Copied ✓ | Copié ✓ | Kopiert ✓ | Gekopieerd ✓ | Skopiowano ✓ | Nokopēts ✓ | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 主题de “Link … kopiert”；主题nl “Link gekopieerd” |
| share_copy_hint | 链接框下 | Paste it into a message to a friend. | Collez-le dans un message à un ami. | Fügen Sie ihn in eine Nachricht an einen Freund ein. | Plak hem in een bericht aan een vriend. | Wklej go do wiadomości do znajomego. | Ielīmējiet to ziņā draugam. | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 通用词；称呼照上面的规矩 |
| share_press_copy | 复制被拦时 | Press {keys} to copy | Appuyez sur {keys} pour copier | Zum Kopieren {keys} drücken | Druk op {keys} om te kopiëren | Naciśnij {keys}, aby skopiować | Nospiediet {keys}, lai kopētu | 翻 | fr 网站已核；de nl pl lv Lab 已核 | PP “Naciśnij przycisk”；G-LV “nospiediet” |
| share_close | 分享框、App 二维码框的 ×（读屏用） | Close | Fermer | Schließen | Sluiten | Zamknij | Aizvērt | 翻 | fr 网站已核；de nl pl lv Lab 已核 | 主题de “Schließen”、主题nl “Sluiten”；G-PL “Zamknij”；G-LV “aizvērt” |
| qr_label | 每个二维码图（读屏用） | QR code | code QR | QR-Code | QR-code | kod QR | QR kods | 翻 | 全部 Lab 已核 | 主题fr “Code QR”、主题de “QR-Code”、主题nl “QR-code”；G-PL “kod QR”；G-LV “QR kodu” |
| get_app | 电脑手机上方徽章上的小字 | Get Accuphy Sonar App | Télécharger l’application Accuphy Sonar | Accuphy Sonar App herunterladen | Download de Accuphy Sonar-app | Pobierz aplikację Accuphy Sonar | Lejupielādējiet lietotni Accuphy Sonar | 翻（“Accuphy Sonar” 不翻） | 全部 Lab 已核 | **fr、de、nl 都是线上页脚的原字**（店fr / 店de / 店nl 页脚，一字不差；de 页脚没有连字符，照线上）；PP “Aplikacja Accuphy Sonar”、G-PL “Pobierz”；G-LV “lejupielādētu lietotni” |
| app_qr_caption | 电脑：商店二维码下 | Scan to download Accuphy Sonar App | Scannez pour télécharger l’application Accuphy Sonar | Scannen, um die Accuphy Sonar-App herunterzuladen | Scan om de Accuphy Sonar-app te downloaden | Zeskanuj, aby pobrać aplikację Accuphy Sonar | Skenējiet, lai lejupielādētu lietotni Accuphy Sonar | 翻 | 全部 Lab 已核 | 主题fr “scannez pour…”、主题de “scannen, um…”、主题nl “scan om…”；店de Mini 页 “Accuphy Sonar-App”；G-PL “zeskanować”；G-LV 原句 “lai lejupielādētu lietotni, varat skenēt šo QR kodu” |
| app_qr_open | 徽章按钮（读屏用） | Show the {store} QR code | Afficher le code QR {store} | QR-Code für {store} anzeigen | QR-code voor {store} tonen | Pokaż kod QR {store} | Rādīt {store} QR kodu | 翻（{store} 不翻） | 全部 Lab 已核 | QR 的写法同 qr_label；主题de “anzeigen” |
| learn_more | 手机上方的去商店按钮 | Learn More | En savoir plus | Mehr erfahren | Lees meer | Dowiedz się więcej | Uzzināt vairāk | 翻 | 全部 Lab 已核 | 主题fr “En savoir plus”、主题de “Mehr erfahren”、主题nl “Lees meer”（read_more，线上原字；比草稿的 Meer informatie 优先）；pl、lv 用通用说法（PP 和 Garmin 都没有这个按钮） |

## 五、手机里面：App 首页

nl、lv 的 App 没有这两种语言，留英文。de、pl 是 App 原字（网站 11-03 读安装包），Lab 对过键名，标 “Lab 已核（照 App）”。
注意 App 自己的说法：德语 Down View 叫 “Boden-Scan-Ansicht”，Chirp Sonar 德、波都叫“经典声纳”，波兰语 Ice Fishing 叫 “Podlodowe”。
这些都照 App 写，跟手机外面的店铺说法不一样，是对的。

| key | 位置 | en | fr | de | nl | pl | lv | 类别 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| tile_panoramic | PingLive 格子 | Panoramic View | Vue panoramique | Panoramablick | Panoramic View | Widok panoramiczny | Panoramic View | 照 App | fr 网站已核；de pl Lab 已核（照 App）；nl lv 留英文 |
| tile_forward | PingLive 格子 | Forward View | Vue avant | Vorwärtsansicht | Forward View | Widok przedni | Forward View | 照 App | 同上 |
| tile_down | PingLive 格子 | Down View | Vue inférieure | Boden-Scan-Ansicht | Down View | Widok skanowania dna | Down View | 照 App | 同上 |
| tile_live_panoramic | Mini 格子 | Live Panoramic | Panoramique en direct | Live-Panorama | Live Panoramic | Panorama Live | Live Panoramic | 照 App | 同上 |
| tile_live_forward | Mini 格子 | Live Forward | Avant en direct | Live-Voraus | Live Forward | W przód Live | Live Forward | 照 App | 同上 |
| tile_live_down | Mini 格子 | Live Down | Dessous en direct | Live-Unten | Live Down | W dół Live | Live Down | 照 App | 同上 |
| tile_live_combo | Mini 格子 | Live Combo | Combinée en direct | Live-Kombi | Live Combo | Combo Live | Live Combo | 照 App | 同上 |
| tile_downscan | Mini 格子（点了出 na_moving） | Down Scan | Balayage vers le bas | Boden-Scan | Down Scan | Skanowanie dna | Down Scan | 照 App | 同上 |
| tile_chirp | Mini 格子（点了出 na_moving） | Chirp Sonar | Sondeur CHIRP | Klassisches Sonar | Chirp Sonar | Klasyczny sonar | Chirp Sonar | 照 App | 同上 |
| tile_ice | Mini 格子（通往冰钓页） | Ice Fishing | Pêche sur glace | Eisangel | Ice Fishing | Podlodowe | Ice Fishing | 照 App | 同上 |
| tile_live_ice | Mini 格子（同上） | Live Ice Fishing | Pêche sur glace en direct | Live-Eisangeln | Live Ice Fishing | Podlodowe Live | Live Ice Fishing | 照 App | 同上 |
| tab_setting | 底栏 | Setting | Paramètres | Einstellungen | Setting | Ustawienia | Setting | 照 App | 同上 |
| tab_home | 底栏 | Home | Accueil | Startseite | Home | Strona główna | Home | 照 App | 同上 |
| tab_map | 底栏 | Map | Map | Map | Map | Map | Map | 照 App | Map 哪种语言都不翻 |
| combo_fwd | 手机里 Combo 两个量程上的小字 | FORWARD | AVANT | VORWÄRTS | VOORUIT | DO PRZODU | UZ PRIEKŠU | 翻（App 里没有这两个字） | 全部 Lab 已核：跟视图胶囊同一个词（mode_forward），大写 |
| combo_down | 同上 | DOWN | BAS | ABWÄRTS | OMLAAG | W DÓŁ | UZ LEJU | 同上 | 全部 Lab 已核：跟 mode_down 同一个词 |
| na_moving | 点 Down Scan / Chirp 后的提示 | {view} needs the boat moving slowly, so it isn’t available in this simulation yet. | {view} exige que le bateau avance lentement : cette vue n’est donc pas encore disponible dans cette simulation. | {view} braucht ein langsam fahrendes Boot und ist in dieser Simulation deshalb noch nicht verfügbar. | {view} vraagt om een langzaam varende boot en is daarom nog niet beschikbaar in deze simulatie. | Tryb {view} wymaga powoli płynącej łodzi, dlatego nie jest jeszcze dostępny w tej symulacji. | Skatam {view} vajadzīga lēni braucoša laiva, tāpēc šajā simulācijā tas vēl nav pieejams. | 翻（{view} 照 App） | fr 网站已核；de nl pl lv Lab 已核（pl “Tryb …” 照 PP “3 tryby obrazu”，免得跟 {view} 配阴阳性；lv 同理用 “Skatam …”） |

## 六、波兰语、拉脱维亚语翻回英文（#178 的办法）

每条都翻回英文，跟原英文比。“=” 是意思一样；有差别的写在备注。手机框里的 App 原字（第五节）不在这里，那是 App 自己的字。

| key | en | pl | pl 翻回英文 | lv | lv 翻回英文 | 备注 |
|---|---|---|---|---|---|---|
| device | Device | Urządzenie | Device | Ierīce | Device | = |
| view | View | Widok | View | Skats | View | = |
| range | Range | Zasięg | Range | Diapazons | Range | = |
| auto_follows | AUTO · follows the water | AUTO · dopasowuje się do głębokości | AUTO · adjusts to the depth | AUTO · seko ūdens dziļumam | AUTO · follows the water depth | 意思一样（量程跟着水深走），pl 说“调到水深” |
| range_fwd | Forward range | Zasięg do przodu | Range forward | Diapazons uz priekšu | Range forward | = |
| range_down | Down range | Zakres głębokości | Depth range | Dziļuma diapazons | Depth range | 故意照 Garmin 写“深度量程”（#221）；Down 视图的量程就是深度 |
| mode_down / forward / panoramic / combo | Down / Forward / Panoramic / Combo | W dół / Do przodu / Panoramiczny / Łączony | Down / Forward / Panoramic / Combined | Uz leju / Uz priekšu / Panorāma / Kombinētais | Down / Forward / Panorama / Combined | = |
| desc_lake | {device} · {beam} beam. Drag the boat — whatever the beam touches lights up. | {device} · wiązka {beam}. Przeciągnij łódź – wszystko, czego dotknie wiązka, podświetla się. | {device} · {beam} beam. Drag the boat – everything the beam touches lights up. | {device} · {beam} stars. Velciet laivu – viss, ko skar stars, izgaismojas. | {device} · {beam} beam. Drag the boat – everything the beam touches lights up. | = |
| shop | Shop {name} | Kup {name} | Buy {name} | Pirkt {name} | Buy {name} | = |
| shop_opening | Opening the store… | Otwieranie sklepu… | Opening the store… | Veikals tiek atvērts… | The store is being opened… | = |
| hint_boat | Drag the boat to move it | Przeciągnij łódź, aby ją przesunąć | Drag the boat to move it | Velciet laivu, lai to pārvietotu | Drag the boat to move it | = |
| shore_edge | Shoreline — the lake ends here | Linia brzegowa – tu kończy się jezioro | Shoreline – the lake ends here | Krasta līnija – šeit ezers beidzas | Shoreline – the lake ends here | = |
| toast_phone | These are the app’s own controls — Home, range, gain and pause work. | To są przyciski samej aplikacji – działają: Strona główna, zasięg, wzmocnienie i wstrzymanie. | These are the app’s own buttons – working: Home page, range, gain and pause. | Šīs ir lietotnes pašas vadīklas – darbojas Home, diapazons, pastiprinājums un pauze. | These are the app’s own controls – Home, range, gain and pause work. | = （pl 的 Home 是 App 底栏原字 Strona główna） |
| toast_desktop | These are the app’s own controls — use the panel to change the view. | To są przyciski samej aplikacji – widok zmienisz w panelu. | These are the app’s own buttons – you change the view in the panel. | Šīs ir lietotnes pašas vadīklas – skatu mainiet panelī. | These are the app’s own controls – change the view in the panel. | = |
| gl_lost_title | The 3D view stopped | Widok 3D się zatrzymał | The 3D view stopped | 3D skats apstājās | The 3D view stopped | = |
| gl_lost_text | Your browser freed the graphics memory. Tap to reload the lake. | Przeglądarka zwolniła pamięć graficzną. Dotknij, aby ponownie wczytać jezioro. | The browser freed the graphics memory. Tap to load the lake again. | Jūsu pārlūks atbrīvoja grafikas atmiņu. Pieskarieties, lai vēlreiz ielādētu ezeru. | Your browser freed the graphics memory. Tap to load the lake again. | = |
| tour_drag_title | Drag the boat | Przeciągnij łódź | Drag the boat | Velciet laivu | Drag the boat | = |
| tour_fwd_title | Tap Forward View | Dotknij widoku do przodu | Tap the forward view | Pieskarieties skatam uz priekšu | Tap the forward view | = |
| tour_pano_title | Tap Panoramic View | Dotknij widoku panoramicznego | Tap the panoramic view | Pieskarieties panorāmas skatam | Tap the panorama view | = |
| tour_down_title | Tap Down View | Dotknij widoku w dół | Tap the down view | Pieskarieties skatam uz leju | Tap the down view | = |
| tour_drag_text | Whatever the beam touches shows up live in the Accuphy Sonar app. | Wszystko, czego dotknie wiązka, widać na żywo w aplikacji Accuphy Sonar. | Everything the beam touches is visible live in the Accuphy Sonar app. | Viss, ko skar stars, reāllaikā parādās lietotnē Accuphy Sonar. | Everything the beam touches appears in real time in the Accuphy Sonar app. | = |
| tour_fwd_text | The beam turns to look ahead of the boat — where you cast. | Wiązka obraca się i patrzy przed łódź – tam, gdzie zarzucasz. | The beam turns and looks ahead of the boat – where you cast. | Stars pagriežas uz priekšu, laivas priekšā – tur, kur metat ēsmu. | The beam turns forward, ahead of the boat – where you cast the bait. | = |
| tour_down_text | The beam points straight under the boat — see what’s right below. | Wiązka skierowana jest prosto pod łódź – zobacz, co jest tuż pod nią. | The beam is pointed straight under the boat – see what is right under it. | Stars vērsts taisni zem laivas – redziet, kas atrodas tieši apakšā. | The beam points straight under the boat – see what is right below. | = |
| tour_pano_text | A wide sweep ahead of the boat — to find fish and structure. | Szerokie skanowanie przed łodzią – do odnajdywania ryb i struktur. | A wide scan ahead of the boat – for finding fish and structures. | Plaša skenēšana laivas priekšā – lai atrastu zivis un struktūras. | A wide scan ahead of the boat – to find fish and structures. | = |
| tour_tap | Tap | Dotknij | Tap | Pieskarieties | Tap | = |
| tour_skip | Skip tour | Pomiń samouczek | Skip the tutorial | Izlaist pamācību | Skip the tutorial | 故意用“教程”，比“导览”好懂 |
| tour_replay | Replay tour | Powtórz samouczek | Repeat the tutorial | Atkārtot pamācību | Repeat the tutorial | 同上 |
| share / share_buddy_phone | Send to a fishing buddy / Share to a Fishing Buddy | Udostępnij | Share | Kopīgot | Share | 故意用短词，跟法语 #198 一样（按钮放得下） |
| share_qr_caption | Scan with your phone camera to open the Lab on your phone | Zeskanuj aparatem w telefonie, aby otworzyć Lab na telefonie. | Scan with the phone camera to open the Lab on the phone. | Skenējiet ar tālruņa kameru, lai atvērtu Lab tālrunī. | Scan with the phone camera to open the Lab on the phone. | = |
| share_qr_caption_phone | Let a friend scan this with their phone camera | Znajomy może zeskanować ten kod aparatem w telefonie. | A friend can scan this code with the phone camera. | Draugs var skenēt šo kodu ar tālruņa kameru. | A friend can scan this code with the phone camera. | = （跟法语已核的写法一样） |
| share_link_label | Link | Link | Link | Saite | Link | = |
| share_copy | Copy link | Kopiuj link | Copy link | Kopēt saiti | Copy link | = |
| share_copied_check | Copied ✓ | Skopiowano ✓ | Copied ✓ | Nokopēts ✓ | Copied ✓ | = |
| share_copy_hint | Paste it into a message to a friend. | Wklej go do wiadomości do znajomego. | Paste it into a message to a friend. | Ielīmējiet to ziņā draugam. | Paste it into a message to a friend. | = |
| share_press_copy | Press {keys} to copy | Naciśnij {keys}, aby skopiować | Press {keys} to copy | Nospiediet {keys}, lai kopētu | Press {keys} to copy | = |
| share_close | Close | Zamknij | Close | Aizvērt | Close | = |
| qr_label | QR code | kod QR | QR code | QR kods | QR code | = |
| get_app | Get Accuphy Sonar App | Pobierz aplikację Accuphy Sonar | Download the Accuphy Sonar app | Lejupielādējiet lietotni Accuphy Sonar | Download the Accuphy Sonar app | = （跟店铺 fr/de/nl 页脚一样说“下载”） |
| app_qr_caption | Scan to download Accuphy Sonar App | Zeskanuj, aby pobrać aplikację Accuphy Sonar | Scan to download the Accuphy Sonar app | Skenējiet, lai lejupielādētu lietotni Accuphy Sonar | Scan to download the Accuphy Sonar app | = |
| app_qr_open | Show the {store} QR code | Pokaż kod QR {store} | Show the {store} QR code | Rādīt {store} QR kodu | Show the {store} QR code | = |
| learn_more | Learn More | Dowiedz się więcej | Learn more | Uzzināt vairāk | Learn more | = |
| combo_fwd / combo_down | FORWARD / DOWN | DO PRZODU / W DÓŁ | FORWARD / DOWN | UZ PRIEKŠU / UZ LEJU | FORWARD / DOWN | = |
| na_moving | {view} needs the boat moving slowly, so it isn’t available in this simulation yet. | Tryb {view} wymaga powoli płynącej łodzi, dlatego nie jest jeszcze dostępny w tej symulacji. | The {view} mode needs a slowly moving boat, so it is not yet available in this simulation. | Skatam {view} vajadzīga lēni braucoša laiva, tāpēc šajā simulācijā tas vēl nav pieejams. | The {view} view needs a slowly moving boat, so it is not yet available in this simulation. | = |

**风险说明**：
- 波兰语只对照了 Prime Power 网店和 Garmin，还没请 Prime Power 的人看过。按网站 #178 的办法，是 Jason 看过这份结果后，再定要不要请 Prime Power 复核。
- 拉脱维亚语只对照了 Garmin 的手册，没有人工复核，也没有母语者看过。

## 七、拿不准的（3 条都定了）

1. ~~range_down 照字面还是照 Garmin~~ → **照 Garmin**（Jason 11-03：“照 Garmin 吧”，#221），写“深度量程”：
   Portée de la profondeur / Tiefenbereich / Dieptebereik / Zakres głębokości / Dziļuma diapazons，已填进第一节。
   英文 “Down range” 不改（Lab 定，#222）：跟 “Forward range” 成对，也跟访客看到的视图名 “Down” 一致；App 的 Live Down 菜单里没有量程名字可照；译文的“深度量程”意思一样。
2. ~~德语 Panoramablick 还是 Panoramaansicht~~ → **Panoramablick**（Jason 11-03：“你查一查定吧，我也不懂”，Lab 定，#221）。
   理由：手机里 App 的格子就叫 Panoramablick，教程卡就在旁边，访客看到的是同一个字；店铺 PingLive 产品页也这么写。
   Panoramaansicht 只在店铺首页一行和 glossary 里。
3. ~~去商店按钮写“买”还是“看”~~ → **写“买”**（Jason 11-03：“不用管能不能下单，你就这么做就可以了”，#220）。
   de {name} kaufen、nl Koop de {name}、pl Kup {name}、lv Pirkt {name}；法语、英文不改。

## 八、永远不翻（原样）

PingLive、PingLive Mini、Accuphy Sonar（App 名；“app” 这个词按 glossary 用本地写法）、CHIRP、Down Scan（手机外面）、
App Store、Google Play、“ACCUPHY | LAB” 标题、AUTO、数字和单位、手机框里 App 的数字和单位（ft、°C、V、%）。

## 九、不在这张表里

- **冰钓专用**（这次不翻）：camera、cam_top、cam_under、cam_section、mode_liveice、mode_ice、desc_ice、hint_ice、
  tour_drill_title、tour_drill_text、tour_ice_fwd_text、tour_ice_down_text、not_available（现在只在冰钓页的 Live Panoramic 出现）。
- **锁（营销版）**：unlock_title、unlock_locked、unlock_text、unlock_done、unlock_email、unlock_cta、unlock_sending、
  unlock_consent、unlock_privacy、unlock_err_email、unlock_err_send、unlock_err_closed、back_to_lake。
- **代码里没用到**：depth、share_text、share_sms、share_copied（查过整个湖文件夹，没有地方调用）。要不要删由 Base 定。

## 十、表外的字（不在 i18n.js，交 Base 一起处理）

查代码时看到的，加语言时也要动，不然会剩英文或链接不对。只记下来，我不改：

- `AppBadges.jsx`：App Store / Google Play 徽章图只有 en、fr 两套（`badges/`）；de、nl、pl、lv 要用苹果、谷歌官方的本地版徽章。
  商店链接的语言参数（`?l=fr-CA`、`hl=fr_CA`）和徽章的 alt 字（“Download on the App Store”“Get it on Google Play”）也只认 fr。
- `embed.js` 第 36–37 行：自己又判断了一次 `?lang=fr`，去商店的路径只有 `/fr`。德、荷要接店铺的 `/de-de`、`/nl-benelux`
  （店铺框传 `shop=` 时应该已经对，要 Base 核）。
- 几个读屏字写死英文：`index.jsx` 的 “Show the lake”“Show the sonar full-screen”、`home/AppHome.jsx` 的 “Home”、
  量程按钮的 title “ft / m”、Down 视图时滑杆的 title “AUTO: follows the water depth”、`SonarChrome.jsx` 的 “App control — shown for reference”。
- 字体：波兰语（ą ć ę ł ń ó ś ź ż）、拉脱维亚语（ā č ē ģ ī ķ ļ ņ š ū ž）的字母要补进品牌字体（规划第二节第 2 条）。
  上表 pl、lv 列用到的字母都在这两组里。

## 核完以后怎么检查（#217）

- 多语言是各市场店铺里各自的 Lab 页，不是在 Lab 里手动切语言。检查用 `docs/lab-links-sheet.md` 里的店铺链接，不只看 `?lang=`：
  - 法：/fr、/fr-fr、/fr-benelux；
  - 德：/de-de、/de-benelux；
  - 荷：/nl-benelux；
  - 波兰：主站 shop.accuphy.com/pages/lab?lang=pl（#218；网站给波兰市场加上波兰语以后，改看波兰市场页）；
  - 拉脱维亚：主站 shop.accuphy.com/pages/lab?lang=lv（#218）。
- 罗马尼亚 /ro-ro、巴拉圭 /es-py 照旧英文。每页都点一次“去商店”，看它去对店铺。

## 记录

- 2026-11-03 Lab 多语言：建表。字来自 i18n.js @ e715574；法语“已核”对照网站 10-26、10-31 两张单子和 #198 / #186 / #184 的记录。
  其余全部是机器草稿，待核。
- 2026-11-03 Lab 多语言：照网站 11-03 的回答更新（HQ 转）：填 de、pl 的 App 原字（12 个首页格子 + 底栏），Map 不翻；
  combo_fwd / combo_down 改成“翻”；称呼定为德 Sie、荷 je；toast_phone 里的 “Home” 换成 App 底栏的字（de Startseite，
  pl Strona główna）。谁来核还在等 Jason，先不核。
- 2026-11-03 Lab 多语言：按 #214 自己核完。法、德、荷：店铺线上原文（11-03 抓的 /fr、/de-de、/nl-benelux 首页和两个产品页，加线上主题语言包）
  → glossary → Garmin ECHOMAP UHD2 手册同语言版；波兰语：Prime Power 网店 + 目录 PDF + Garmin PL，再全部反译；
  拉脱维亚语：Garmin LV 手册 + garmin.com/lv-LV，再全部反译。拿不准 3 条（range_down、德语 Panoramic 名、德荷去商店按钮）。
  改动：nl Bereik vooruit → Voorwaarts bereik、Sleep → Versleep、Panorama → Panoramisch、Combi → Combo、Meer informatie → Lees meer、
  “bundel van {beam}” → “{beam}-bundel”；de 视图名改照线上（Vorwärts / Abwärts，不用 glossary 的 Sicht nach…）、Tour → Einführung、
  get_app 照页脚 “Accuphy Sonar App herunterladen”、combo 小字 VORWÄRTS / ABWÄRTS；pl Panorama → Panoramiczny、przewodnik →
  samouczek、pauza → wstrzymanie、PRZÓD / DÓŁ → DO PRZODU / W DÓŁ；lv “staru kūlis” → “stars”、Krasts → Krasta līnija、
  Noskenējiet → Skenējiet、ceļvedis → pamācība、Iegādāties → Pirkt。
- 2026-11-03 Lab 多语言：#215 教程四句说明（tour_drag_text、tour_fwd_text、tour_down_text、tour_pano_text）翻成 5 种并核过，
  依据同上（法语照已核的旧步骤卡句子，德、荷照店铺产品页的视图说明，波兰语照 PP），波兰语、拉脱维亚语翻回英文对过。
- 2026-11-03 Lab 多语言：#217 后重查去商店按钮：德、荷、波、拉的 Lab 落地店铺页都不能网上下单，shop 一行 pl、lv 也改成拿不准；
  法语 /fr-fr、/fr-benelux 和英文的同类问题记进第七节第 3 条；加了检查用的店铺链接。
- 2026-11-03 Lab 多语言：Jason 在本窗口定了去商店按钮写“买”（#220），填进 de / nl / pl / lv；拿不准剩 2 条。检查链接照 #218 改成主站。
- 2026-11-03 Lab 多语言：Jason 定 range_down 照 Garmin；德语 Panoramic 名他让 Lab 定，定 Panoramablick（#221）。拿不准清零。
- 2026-11-03 Lab 多语言：Jason：“你来定这些翻译 不确定就查一查”（#222）。英文 Down range 不改。
- 2026-11-03 Lab 多语言：照 #233 改了交付去处（HQ 放进网站嵌入版，Base 留一份，MKT 版之后）。
