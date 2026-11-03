// The Lab's languages (X-6L-fr, 2026-10-25; Jason 2026-10-17: 做法语版，魁北克也投). Only `?lang=fr` on the Lab's own
// URL switches to French — the store's French page puts it on the iframe address; nothing is read from the parent page
// or the browser. Default English. Terms follow accuphy-website/docs/glossary.csv (fr column); PingLive, PingLive Mini,
// Down Scan and CHIRP are never translated. Every string a visitor can see lives here; numbers and units stay as they are.
// The French was reviewed by the website HQ on 2026-10-26 (accuphy-website/handoffs/2026-10-26-lab-fr-strings-review.md):
// store wording outside the phone (Vue avant, vue vers le bas, Faites glisser…), the real app's French inside the phone
// (Vue inférieure, Paramètres / Accueil / Map, Panoramique en direct…). Table: docs/2026-10-25-lab-fr-strings.md.
// Base multilingual (#212, Jason 11-03): `?lang=` also takes de / nl / pl / lv — the store's bridge sends the same six (website #228).
// Anything else is English, and a line with no text in that language falls back to English (t() below).
export const LANGS = ['en', 'fr', 'de', 'nl', 'pl', 'lv']
export const LANG = (() => { try { const l = (new URLSearchParams(window.location.search).get('lang') || '').trim().toLowerCase(); return LANGS.includes(l) ? l : 'en' } catch { return 'en' } })()
// Metres first for the European languages (#212); the visitor can still tap a value to switch. en and fr (Canada) stay in feet.
export const METRIC_FIRST = ['de', 'nl', 'pl', 'lv'].includes(LANG)
// the page says which language it is in, for screen readers and search (对接 11-03); index.html and the share build ship lang="en"
try { document.documentElement.lang = LANG } catch { /* no document: node tests */ }

// fr / de / nl / pl / lv of every key in the strings table come from docs/2026-11-03-lab-strings-5lang.md (aa64746, all reviewed:
// French by the website, the rest by Lab 多语言, #214) — Jason 11-03 via Lab HQ: “动，放进去” (#233: into the website-embed copy).
// The per-line "FR draft" notes below predate that table. Keys not in it (ice page, lock) keep their English / French as before.
const S = {
  // control panel
  device: { en: 'Device', fr: 'Appareil', de: 'Gerät', nl: 'Apparaat', pl: 'Urządzenie', lv: 'Ierīce' },
  view: { en: 'View', fr: 'Vue', de: 'Ansicht', nl: 'Weergave', pl: 'Widok', lv: 'Skats' },
  camera: { en: 'Camera', fr: 'Caméra' },
  range: { en: 'Range', fr: 'Portée', de: 'Reichweite', nl: 'Bereik', pl: 'Zasięg', lv: 'Diapazons' },
  depth: { en: 'Depth', fr: 'Profondeur' },
  auto_follows: { en: 'AUTO · follows the water', fr: 'AUTO · suit la profondeur', de: 'AUTO · folgt der Wassertiefe', nl: 'AUTO · volgt de waterdiepte', pl: 'AUTO · dopasowuje się do głębokości', lv: 'AUTO · seko ūdens dziļumam' },
  range_fwd: { en: 'Forward range', fr: 'Portée avant', de: 'Reichweite nach vorne', nl: 'Voorwaarts bereik', pl: 'Zasięg do przodu', lv: 'Diapazons uz priekšu' }, // PLM Combo's two ranges (#189)
  range_down: { en: 'Down range', fr: 'Portée de la profondeur', de: 'Tiefenbereich', nl: 'Dieptebereik', pl: 'Zakres głębokości', lv: 'Dziļuma diapazons' },
  combo_fwd: { en: 'FORWARD', fr: 'AVANT', de: 'VORWÄRTS', nl: 'VOORUIT', pl: 'DO PRZODU', lv: 'UZ PRIEKŠU' }, // the small captions over the phone's two Combo range controls
  combo_down: { en: 'DOWN', fr: 'BAS', de: 'ABWÄRTS', nl: 'OMLAAG', pl: 'W DÓŁ', lv: 'UZ LEJU' },
  cam_top: { en: 'Top', fr: 'Dessus' },
  cam_under: { en: 'Under the ice', fr: 'Sous la glace' },
  cam_section: { en: 'Section', fr: 'Coupe' },
  // the view pills (short forms of the glossary's view names)
  mode_down: { en: 'Down', fr: 'Bas', de: 'Abwärts', nl: 'Omlaag', pl: 'W dół', lv: 'Uz leju' },
  mode_forward: { en: 'Forward', fr: 'Avant', de: 'Vorwärts', nl: 'Vooruit', pl: 'Do przodu', lv: 'Uz priekšu' },
  mode_panoramic: { en: 'Panoramic', fr: 'Panoramique', de: 'Panorama', nl: 'Panoramisch', pl: 'Panoramiczny', lv: 'Panorāma' },
  mode_combo: { en: 'Combo', fr: 'Combinée', de: 'Kombi', nl: 'Combo', pl: 'Łączony', lv: 'Kombinētais' }, // the app's "Vue combinée"
  mode_liveice: { en: 'Live Ice', fr: 'Live Ice' },
  mode_ice: { en: 'Ice Fishing', fr: 'Pêche sur glace' },
  // the one-line description under the panel: "{device} · {beam} beam. Drag the boat — …"
  desc_lake: { en: '{device} · {beam} beam. Drag the boat — whatever the beam touches lights up.', fr: '{device} · faisceau de {beam}. Faites glisser le bateau : tout ce que le faisceau touche s’allume.', de: '{device} · {beam}-Kegel. Ziehen Sie das Boot – alles, was der Kegel erfasst, leuchtet auf.', nl: '{device} · {beam}-bundel. Versleep de boot – alles wat de bundel raakt, licht op.', pl: '{device} · wiązka {beam}. Przeciągnij łódź – wszystko, czego dotknie wiązka, podświetla się.', lv: '{device} · {beam} stars. Velciet laivu – viss, ko skar stars, izgaismojas.' },
  desc_ice: { en: '{device} · {beam} beam, through the ice. Tap the ice to drill a new hole — whatever the beam touches lights up.', fr: '{device} · faisceau de {beam}, à travers la glace. Touchez la glace pour percer un nouveau trou : tout ce que le faisceau touche s’allume.' },
  // cues and toasts
  hint_boat: { en: 'Drag the boat to move it', fr: 'Faites glisser le bateau pour le déplacer', de: 'Ziehen Sie das Boot, um es zu bewegen', nl: 'Versleep de boot om hem te verplaatsen', pl: 'Przeciągnij łódź, aby ją przesunąć', lv: 'Velciet laivu, lai to pārvietotu' },
  hint_ice: { en: 'Tap the ice to drill a hole', fr: 'Touchez la glace pour percer un trou' },
  shore_edge: { en: 'Shoreline — the lake ends here', fr: 'La rive : le lac s’arrête ici', de: 'Ufer – hier endet der See', nl: 'Oever – hier eindigt het meer', pl: 'Linia brzegowa – tu kończy się jezioro', lv: 'Krasta līnija – šeit ezers beidzas' }, // the line when the boat or a tap reaches the shore (#206; words from 对接 11-02). FR draft, for the website's review
  toast_phone: { en: 'These are the app’s own controls — Home, range, gain and pause work.', fr: 'Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent.', de: 'Das sind die Bedienelemente der App – Startseite, Reichweite, Verstärkung und Pause funktionieren.', nl: 'Dit zijn de eigen knoppen van de app – Home, bereik, versterking en pauze werken.', pl: 'To są przyciski samej aplikacji – działają: Strona główna, zasięg, wzmocnienie i wstrzymanie.', lv: 'Šīs ir lietotnes pašas vadīklas – darbojas Home, diapazons, pastiprinājums un pauze.' },
  toast_desktop: { en: 'These are the app’s own controls — use the panel to change the view.', fr: 'Ce sont les commandes de l’application : changez de vue dans le panneau.', de: 'Das sind die Bedienelemente der App – die Ansicht wechseln Sie im Bedienfeld.', nl: 'Dit zijn de eigen knoppen van de app – wissel van weergave in het paneel.', pl: 'To są przyciski samej aplikacji – widok zmienisz w panelu.', lv: 'Šīs ir lietotnes pašas vadīklas – skatu mainiet panelī.' },
  // the entry tour (Tour.jsx, Jason 2026-11-02; replaces the lake's s1–s3 step cards): placeholder English from the prototype,
  // the real words and the French come later with Jason and the website's review (French falls back to English until then)
  tour_drag_title: { en: 'Drag the boat', fr: 'Faites glisser le bateau', de: 'Ziehen Sie das Boot', nl: 'Versleep de boot', pl: 'Przeciągnij łódź', lv: 'Velciet laivu' },
  tour_drag_text: { en: 'Whatever the beam touches shows up live in the Accuphy Sonar app.', fr: 'Tout ce que le faisceau touche apparaît en direct dans l’application Accuphy Sonar.', de: 'Alles, was der Kegel erfasst, erscheint live in der Accuphy Sonar-App.', nl: 'Alles wat de bundel raakt, zie je live in de Accuphy Sonar-app.', pl: 'Wszystko, czego dotknie wiązka, widać na żywo w aplikacji Accuphy Sonar.', lv: 'Viss, ko skar stars, reāllaikā parādās lietotnē Accuphy Sonar.' },
  tour_fwd_title: { en: 'Tap Forward View', fr: 'Touchez la vue avant', de: 'Tippen Sie auf „Vorwärtsansicht“', nl: 'Tik op Voorwaartse weergave', pl: 'Dotknij widoku do przodu', lv: 'Pieskarieties skatam uz priekšu' },
  tour_fwd_text: { en: 'The beam turns to look ahead of the boat — where you cast.', fr: 'Le faisceau se tourne vers l’avant du bateau : là où vous lancez.', de: 'Der Kegel dreht sich und blickt vor das Boot – dorthin, wo Sie auswerfen.', nl: 'De bundel draait naar voren, voor de boot – daar waar je werpt.', pl: 'Wiązka obraca się i patrzy przed łódź – tam, gdzie zarzucasz.', lv: 'Stars pagriežas uz priekšu, laivas priekšā – tur, kur metat ēsmu.' },
  tour_down_title: { en: 'Tap Down View', fr: 'Touchez la vue vers le bas', de: 'Tippen Sie auf „Abwärtsansicht“', nl: 'Tik op Neerwaartse weergave', pl: 'Dotknij widoku w dół', lv: 'Pieskarieties skatam uz leju' },
  tour_down_text: { en: 'The beam points straight under the boat — see what’s right below.', fr: 'Le faisceau pointe droit sous le bateau : voyez ce qui se trouve juste en dessous.', de: 'Der Kegel zeigt direkt unter das Boot – Sie sehen, was genau darunter ist.', nl: 'De bundel wijst recht onder de boot – zie wat er direct onder je zit.', pl: 'Wiązka skierowana jest prosto pod łódź – zobacz, co jest tuż pod nią.', lv: 'Stars vērsts taisni zem laivas – redziet, kas atrodas tieši apakšā.' },
  tour_pano_title: { en: 'Tap Panoramic View', fr: 'Touchez la vue panoramique', de: 'Tippen Sie auf „Panoramablick“', nl: 'Tik op Panoramische weergave', pl: 'Dotknij widoku panoramicznego', lv: 'Pieskarieties panorāmas skatam' },
  tour_pano_text: { en: 'A wide sweep ahead of the boat — to find fish and structure.', fr: 'Un large balayage devant le bateau : pour repérer poissons et structures.', de: 'Ein breiter Scan vor dem Boot – um Fische und Strukturen zu erkennen.', nl: 'Een brede scan voor de boot – om vissen en structuren te spotten.', pl: 'Szerokie skanowanie przed łodzią – do odnajdywania ryb i struktur.', lv: 'Plaša skenēšana laivas priekšā – lai atrastu zivis un struktūras.' },
  // the ice page's tour (2026-11-02, replaces its cards i1–i3): English placeholders from Base; every FR is a draft for the website's review
  tour_drill_title: { en: 'Tap the ice', fr: 'Touchez la glace' }, // FR draft, for the website's review
  tour_drill_text: { en: 'Drill a new hole where you tap — the PingLive Mini drops in and pings straight down.', fr: 'Percez un nouveau trou là où vous touchez : le PingLive Mini y descend et sonde droit vers le bas.' }, // FR draft, for the website's review
  tour_ice_fwd_text: { en: 'The beam turns sideways under the ice — fish out ahead, where you never drilled.', fr: 'Le faisceau se tourne sur le côté sous la glace : les poissons plus loin, là où vous n’avez pas percé.' }, // FR draft, for the website's review
  tour_ice_down_text: { en: 'The beam points straight down the hole — your bait and every fish that rises to it.', fr: 'Le faisceau pointe droit sous le trou : votre appât et chaque poisson qui monte vers lui.' }, // FR draft, for the website's review
  tour_tap: { en: 'Tap', fr: 'Touchez', de: 'Tippen', nl: 'Tik', pl: 'Dotknij', lv: 'Pieskarieties' },
  tour_skip: { en: 'Skip tour', fr: 'Passer la visite', de: 'Einführung überspringen', nl: 'Rondleiding overslaan', pl: 'Pomiń samouczek', lv: 'Izlaist pamācību' },
  tour_replay: { en: 'Replay tour', fr: 'Revoir la visite', de: 'Einführung wiederholen', nl: 'Rondleiding opnieuw bekijken', pl: 'Powtórz samouczek', lv: 'Atkārtot pamācību' },
  // the lost-WebGL card (in-app browsers)
  gl_lost_title: { en: 'The 3D view stopped', fr: 'La vue 3D s’est arrêtée', de: 'Die 3D-Ansicht wurde angehalten', nl: 'De 3D-weergave is gestopt', pl: 'Widok 3D się zatrzymał', lv: '3D skats apstājās' },
  gl_lost_text: { en: 'Your browser freed the graphics memory. Tap to reload the lake.', fr: 'Votre navigateur a libéré la mémoire graphique. Touchez pour recharger le lac.', de: 'Ihr Browser hat den Grafikspeicher freigegeben. Tippen Sie, um den See neu zu laden.', nl: 'Je browser heeft het grafische geheugen vrijgegeven. Tik om het meer opnieuw te laden.', pl: 'Przeglądarka zwolniła pamięć graficzną. Dotknij, aby ponownie wczytać jezioro.', lv: 'Jūsu pārlūks atbrīvoja grafikas atmiņu. Pieskarieties, lai vēlreiz ielādētu ezeru.' },
  // "Send to a friend" (BF funnel item 1)
  share: { en: 'Send to a fishing buddy', fr: 'Partager', de: 'Teilen', nl: 'Delen', pl: 'Udostępnij', lv: 'Kopīgot' }, // EN Jason's pick 2026-10-30; FR goes through the website HQ // FR reviewed by the website HQ 2026-10-28 (#198): "Partager" everywhere, no longer sentence
  share_text: { en: 'Try the Accuphy Lab — drag a boat and watch the live sonar light up.', fr: 'Essayez l’Accuphy Lab : déplacez un bateau et regardez le sondeur live s’allumer.' },
  share_sms: { en: 'Text message', fr: 'Message texte' },
  share_copy: { en: 'Copy link', fr: 'Copier le lien', de: 'Link kopieren', nl: 'Link kopiëren', pl: 'Kopiuj link', lv: 'Kopēt saiti' },
  share_copied: { en: 'Link copied', fr: 'Lien copié' },
  share_qr_caption_phone: { en: 'Let a friend scan this with their phone camera', fr: 'Un ami peut scanner ce code avec l’appareil photo de son téléphone.', de: 'Ein Freund kann diesen Code mit der Smartphone-Kamera scannen.', nl: 'Laat een vriend deze code scannen met de smartphonecamera.', pl: 'Znajomy może zeskanować ten kod aparatem w telefonie.', lv: 'Draugs var skenēt šo kodu ar tālruņa kameru.' }, // phones (Jason 2026-10-29: 手机也用二维码和 copy); FR reviewed by the website HQ 2026-10-29 (#198)
  share_qr_caption: { en: 'Scan with your phone camera to open the Lab on your phone', fr: 'Scannez avec l’appareil photo de votre téléphone pour ouvrir le Lab.', de: 'Mit der Smartphone-Kamera scannen, um das Lab auf dem Smartphone zu öffnen.', nl: 'Scan met de camera van je smartphone om het Lab op je smartphone te openen.', pl: 'Zeskanuj aparatem w telefonie, aby otworzyć Lab na telefonie.', lv: 'Skenējiet ar tālruņa kameru, lai atvērtu Lab tālrunī.' }, // #188; FR reviewed by the website HQ 2026-10-29 (#198)
  share_link_label: { en: 'Link', fr: 'Lien', de: 'Link', nl: 'Link', pl: 'Link', lv: 'Saite' },
  share_copy_hint: { en: 'Paste it into a message to a friend.', fr: 'Collez-le dans un message à un ami.', de: 'Fügen Sie ihn in eine Nachricht an einen Freund ein.', nl: 'Plak hem in een bericht aan een vriend.', pl: 'Wklej go do wiadomości do znajomego.', lv: 'Ielīmējiet to ziņā draugam.' }, // FR reviewed (#198)
  share_copied_check: { en: 'Copied ✓', fr: 'Copié ✓', de: 'Kopiert ✓', nl: 'Gekopieerd ✓', pl: 'Skopiowano ✓', lv: 'Nokopēts ✓' }, // FR reviewed (#198)
  share_press_copy: { en: 'Press {keys} to copy', fr: 'Appuyez sur {keys} pour copier', de: 'Zum Kopieren {keys} drücken', nl: 'Druk op {keys} om te kopiëren', pl: 'Naciśnij {keys}, aby skopiować', lv: 'Nospiediet {keys}, lai kopētu' }, // when neither clipboard path is allowed; FR reviewed (#198)
  share_close: { en: 'Close', fr: 'Fermer', de: 'Schließen', nl: 'Sluiten', pl: 'Zamknij', lv: 'Aizvērt' },
  // the preview card (brief part 5): drafts until Jason picks them; French after the website's review, so no line in French yet
  share_title: { en: 'Show a buddy what’s under the boat', fr: 'Montrez à un ami ce qu’il y a sous le bateau', de: 'Zeigen Sie einem Angelfreund, was unter dem Boot ist', nl: 'Laat een vismaat zien wat er onder de boot zit', pl: 'Pokaż znajomemu, co jest pod łodzią', lv: 'Parādiet draugam, kas ir zem laivas' },
  share_line: { en: 'Drag the boat. Watch the sonar light up.', fr: 'Faites glisser le bateau. Regardez le sondeur s’allumer.', de: 'Ziehen Sie das Boot. Sehen Sie, wie das Echolot aufleuchtet.', nl: 'Versleep de boot. Kijk hoe de sonar oplicht.', pl: 'Przeciągnij łódź. Zobacz, jak sonar się podświetla.', lv: 'Velciet laivu. Vērojiet, kā sonārs izgaismojas.' },
  get_app: { en: 'Get Accuphy Sonar App', fr: 'Télécharger l’application Accuphy Sonar', de: 'Accuphy Sonar App herunterladen', nl: 'Download de Accuphy Sonar-app', pl: 'Pobierz aplikację Accuphy Sonar', lv: 'Lejupielādējiet lietotni Accuphy Sonar' }, // the faint line over the desktop badges above the phone (A8 design 2026-11-01; HQ 11-02: no "the", App capitalised). FR draft, for the website's review
  // A8 (Jason 11-01; base version 11-02). Keys and FR drafts from 对接 (docs/2026-11-01-app-qr-plan.md "11-01 改"); every FR is a draft for the website's review
  app_qr_caption: { en: 'Scan to download Accuphy Sonar App', fr: 'Scannez pour télécharger l’application Accuphy Sonar', de: 'Scannen, um die Accuphy Sonar-App herunterzuladen', nl: 'Scan om de Accuphy Sonar-app te downloaden', pl: 'Zeskanuj, aby pobrać aplikację Accuphy Sonar', lv: 'Skenējiet, lai lejupielādētu lietotni Accuphy Sonar' }, // under the store's QR code (desktop). FR draft, for the website's review
  app_qr_open: { en: 'Show the {store} QR code', fr: 'Afficher le code QR {store}', de: 'QR-Code für {store} anzeigen', nl: 'QR-code voor {store} tonen', pl: 'Pokaż kod QR {store}', lv: 'Rādīt {store} QR kodu' }, // the badge button's screen-reader label; {store} = App Store / Google Play, not translated. FR draft, for the website's review
  qr_label: { en: 'QR code', fr: 'code QR', de: 'QR-Code', nl: 'QR-code', pl: 'kod QR', lv: 'QR kods' }, // the screen-reader name of every QR picture. FR draft, for the website's review
  learn_more: { en: 'Learn More', fr: 'En savoir plus', de: 'Mehr erfahren', nl: 'Lees meer', pl: 'Dowiedz się więcej', lv: 'Uzzināt vairāk' }, // the phone's store button (was "Shop {name}"); the arrow is the button's icon. FR draft, for the website's review
  share_buddy_phone: { en: 'Share to a Fishing Buddy', fr: 'Partager', de: 'Teilen', nl: 'Delen', pl: 'Udostępnij', lv: 'Kopīgot' }, // the phone's share button (was "Share"); FR follows the website's #198 "Partager". FR draft, for the website's review
  // the Shop button
  shop: { en: 'Shop {name}', fr: 'Achetez le {name}', de: '{name} kaufen', nl: 'Koop de {name}', pl: 'Kup {name}', lv: 'Pirkt {name}' }, // after the store's own "Achetez maintenant →" (shop.accuphy.com/fr); the arrow is the button's icon
  shop_opening: { en: 'Opening the store…', fr: 'Ouverture de la boutique…', de: 'Shop wird geöffnet…', nl: 'Winkel wordt geopend…', pl: 'Otwieranie sklepu…', lv: 'Veikals tiek atvērts…' }, // shown for the 1 s before the page leaves (website #228). FR reviewed by the website HQ 2026-10-28 (#198)
  // the app's Home page inside the phone
  tile_panoramic: { en: 'Panoramic View', fr: 'Vue panoramique', de: 'Panoramablick', nl: 'Panoramic View', pl: 'Widok panoramiczny', lv: 'Panoramic View' },
  tile_forward: { en: 'Forward View', fr: 'Vue avant', de: 'Vorwärtsansicht', nl: 'Forward View', pl: 'Widok przedni', lv: 'Forward View' },
  tile_down: { en: 'Down View', fr: 'Vue inférieure', de: 'Boden-Scan-Ansicht', nl: 'Down View', pl: 'Widok skanowania dna', lv: 'Down View' },
  tile_live_panoramic: { en: 'Live Panoramic', fr: 'Panoramique en direct', de: 'Live-Panorama', nl: 'Live Panoramic', pl: 'Panorama Live', lv: 'Live Panoramic' },
  tile_live_forward: { en: 'Live Forward', fr: 'Avant en direct', de: 'Live-Voraus', nl: 'Live Forward', pl: 'W przód Live', lv: 'Live Forward' },
  tile_live_down: { en: 'Live Down', fr: 'Dessous en direct', de: 'Live-Unten', nl: 'Live Down', pl: 'W dół Live', lv: 'Live Down' },
  tile_live_combo: { en: 'Live Combo', fr: 'Combinée en direct', de: 'Live-Kombi', nl: 'Live Combo', pl: 'Combo Live', lv: 'Live Combo' },
  tile_downscan: { en: 'Down Scan', fr: 'Balayage vers le bas', de: 'Boden-Scan', nl: 'Down Scan', pl: 'Skanowanie dna', lv: 'Down Scan' },
  tile_chirp: { en: 'Chirp Sonar', fr: 'Sondeur CHIRP', de: 'Klassisches Sonar', nl: 'Chirp Sonar', pl: 'Klasyczny sonar', lv: 'Chirp Sonar' },
  tile_ice: { en: 'Ice Fishing', fr: 'Pêche sur glace', de: 'Eisangel', nl: 'Ice Fishing', pl: 'Podlodowe', lv: 'Ice Fishing' },
  tile_live_ice: { en: 'Live Ice Fishing', fr: 'Pêche sur glace en direct', de: 'Live-Eisangeln', nl: 'Live Ice Fishing', pl: 'Podlodowe Live', lv: 'Live Ice Fishing' },
  tab_setting: { en: 'Setting', fr: 'Paramètres', de: 'Einstellungen', nl: 'Setting', pl: 'Ustawienia', lv: 'Setting' },
  tab_home: { en: 'Home', fr: 'Accueil', de: 'Startseite', nl: 'Home', pl: 'Strona główna', lv: 'Home' },
  tab_map: { en: 'Map', fr: 'Map', de: 'Map', nl: 'Map', pl: 'Map', lv: 'Map' },
  not_available: { en: 'Not available in this simulation yet.', fr: 'Pas encore disponible dans cette simulation.' }, // FR reviewed 2026-10-31 (#191); only Live Panoramic on the ice page now
  // {view} is the tile's name (#191, Jason 2026-10-30)
  na_moving: { en: '{view} needs the boat moving slowly, so it isn’t available in this simulation yet.', fr: '{view} exige que le bateau avance lentement : cette vue n’est donc pas encore disponible dans cette simulation.', de: '{view} braucht ein langsam fahrendes Boot und ist in dieser Simulation deshalb noch nicht verfügbar.', nl: '{view} vraagt om een langzaam varende boot en is daarom nog niet beschikbaar in deze simulatie.', pl: 'Tryb {view} wymaga powoli płynącej łodzi, dlatego nie jest jeszcze dostępny w tej symulacji.', lv: 'Skatam {view} vajadzīga lēni braucoša laiva, tāpēc šajā simulācijā tas vēl nav pieejams.' },
  // the subscribe card (#191). {view} is the tile's name. unlock_consent, unlock_done: Klaviyo HQ's draft, Jason has not seen it. FR reviewed by the website HQ 2026-10-31 ("la vue {view}", so any view name reads right), except unlock_consent and unlock_done: still drafts
  unlock_title: { en: 'Unlock {view}', fr: 'Débloquer la vue {view}' },
  unlock_locked: { en: '{view}, locked: subscribe to unlock', fr: 'Vue {view} verrouillée : abonnez-vous pour la débloquer' },
  unlock_text: { en: 'Subscribe with your email first, and {view} opens right away.', fr: 'Abonnez-vous d’abord avec votre courriel : la vue {view} s’ouvre aussitôt.' },
  unlock_done: { en: 'You’re in. {view} is unlocked.', fr: 'C’est fait. {view} est débloquée.' },
  back_to_lake: { en: 'Back to the lake', fr: 'Retour au lac' },
  unlock_email: { en: 'Email', fr: 'Courriel' },
  unlock_cta: { en: 'Subscribe and unlock', fr: 'M’abonner et débloquer' },
  unlock_sending: { en: 'Subscribing…', fr: 'Abonnement en cours…' },
  unlock_consent: { en: 'By subscribing, you agree to receive marketing emails from Accuphy Trading Ltd. about sonar tips, products and offers. Unsubscribe anytime.', fr: 'En vous abonnant, vous acceptez de recevoir des courriels de marketing d’Accuphy Trading Ltd. sur des conseils sonar, des produits et des offres. Désabonnement possible à tout moment.' },
  unlock_privacy: { en: 'Privacy Policy', fr: 'Politique de confidentialité' },
  unlock_err_email: { en: 'Please enter a valid email address.', fr: 'Veuillez entrer une adresse courriel valide.' },
  unlock_err_send: { en: 'Something went wrong. Please try again.', fr: 'Une erreur est survenue. Veuillez réessayer.' },
  unlock_err_closed: { en: 'Subscribing isn’t open yet. Please try again later.', fr: 'L’abonnement n’est pas encore ouvert. Veuillez réessayer plus tard.' },
}

export function t(key, vars) {
  let s = S[key]?.[LANG] ?? S[key]?.en ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
  return s
}
