// The Lab's two languages (X-6L-fr, 2026-10-25; Jason 2026-10-17: 做法语版，魁北克也投). Only `?lang=fr` on the Lab's own
// URL switches to French — the store's French page puts it on the iframe address; nothing is read from the parent page
// or the browser. Default English. Terms follow accuphy-website/docs/glossary.csv (fr column); PingLive, PingLive Mini,
// Down Scan and CHIRP are never translated. Every string a visitor can see lives here; numbers and units stay as they are.
// The French was reviewed by the website HQ on 2026-10-26 (accuphy-website/handoffs/2026-10-26-lab-fr-strings-review.md):
// store wording outside the phone (Vue avant, vue vers le bas, Faites glisser…), the real app's French inside the phone
// (Vue inférieure, Paramètres / Accueil / Map, Panoramique en direct…). Table: docs/2026-10-25-lab-fr-strings.md.
export const LANG = (() => { try { return new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en' } catch { return 'en' } })()

const S = {
  // control panel
  device: { en: 'Device', fr: 'Appareil' },
  view: { en: 'View', fr: 'Vue' },
  camera: { en: 'Camera', fr: 'Caméra' },
  range: { en: 'Range', fr: 'Portée' },
  depth: { en: 'Depth', fr: 'Profondeur' },
  auto_follows: { en: 'AUTO · follows the water', fr: 'AUTO · suit la profondeur' },
  cam_top: { en: 'Top', fr: 'Dessus' },
  cam_under: { en: 'Under the ice', fr: 'Sous la glace' },
  cam_section: { en: 'Section', fr: 'Coupe' },
  // the view pills (short forms of the glossary's view names)
  mode_down: { en: 'Down', fr: 'Bas' },
  mode_forward: { en: 'Forward', fr: 'Avant' },
  mode_panoramic: { en: 'Panoramic', fr: 'Panoramique' },
  mode_combo: { en: 'Combo', fr: 'Combinée' }, // the app's "Vue combinée"
  mode_liveice: { en: 'Live Ice', fr: 'Live Ice' },
  mode_ice: { en: 'Ice Fishing', fr: 'Pêche sur glace' },
  // the one-line description under the panel: "{device} · {beam} beam. Drag the boat — …"
  desc_lake: { en: '{device} · {beam} beam. Drag the boat — whatever the beam touches lights up.', fr: '{device} · faisceau de {beam}. Faites glisser le bateau : tout ce que le faisceau touche s’allume.' },
  desc_ice: { en: '{device} · {beam} beam, through the ice. Tap the ice to drill a new hole — whatever the beam touches lights up.', fr: '{device} · faisceau de {beam}, à travers la glace. Touchez la glace pour percer un nouveau trou : tout ce que le faisceau touche s’allume.' },
  // cues and toasts
  hint_boat: { en: 'Drag the boat to move it', fr: 'Faites glisser le bateau pour le déplacer' },
  hint_ice: { en: 'Tap the ice to drill a hole', fr: 'Touchez la glace pour percer un trou' },
  toast_phone: { en: 'These are the app’s own controls — Home, range, gain and pause work.', fr: 'Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent.' },
  toast_desktop: { en: 'These are the app’s own controls — use the panel to change the view.', fr: 'Ce sont les commandes de l’application : changez de vue dans le panneau.' },
  // the step cards
  step: { en: 'Step', fr: 'Étape' },
  s1_title: { en: 'This is the beam', fr: 'Voici le faisceau' },
  s1_text: { en: 'A thin curtain of sound under the boat. Drag the boat — whatever the curtain touches lights up.', fr: 'Un mince rideau d’ondes sonores sous le bateau. Faites glisser le bateau : tout ce que le rideau touche s’allume.' },
  s2_title: { en: 'This is what your phone shows', fr: 'Voici ce qu’affiche votre téléphone' },
  s2_text: { en: 'The screen is that curtain, seen edge-on: bottom, timber, fish. Forward View aims it ahead of the boat.', fr: 'L’écran, c’est ce rideau vu de profil : le fond, les arbres immergés, les poissons. La vue avant l’oriente devant le bateau.' },
  s3_title: { en: 'Which view, when', fr: 'Quelle vue choisir, et quand' },
  s3_text: { en: 'Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below.', fr: 'La vue panoramique scanne de larges zones pour repérer poissons et structures ; la vue avant, pour lancer dessus ; la vue vers le bas, pour pêcher à la verticale.' },
  s3_text_combo: { en: 'Combo shows Down and Forward side by side; Forward to cast at fish ahead; Down to fish straight below.', fr: 'La vue combinée montre le bas et l’avant côte à côte : la vue avant pour lancer sur les poissons devant vous, la vue vers le bas pour pêcher à la verticale.' },
  i1_title: { en: 'The beam under the ice', fr: 'Le faisceau sous la glace' },
  i1_text: { en: 'The PingLive Mini hangs in the hole and pings straight down. Tap the ice anywhere to drill a new hole — whatever the beam touches lights up.', fr: 'Le PingLive Mini est suspendu dans le trou et émet droit vers le bas. Touchez la glace n’importe où pour percer un nouveau trou : tout ce que le faisceau touche s’allume.' },
  i2_title: { en: 'Watch them come in', fr: 'Regardez-les arriver' },
  i2_text: { en: 'The flasher is the dial: the bottom, your bait and every fish that rises, by depth around the ring. The panel beside it draws the same fish as marks.', fr: 'Le flasheur, c’est le cadran : le fond, votre appât et chaque poisson qui monte s’affichent selon leur profondeur, tout autour de l’anneau. Le panneau à côté montre les mêmes poissons sous forme d’échos.' },
  i3_title: { en: 'Look ahead without drilling', fr: 'Voir devant sans percer' },
  i3_text: { en: 'Forward View turns the beam sideways: fish and structure out ahead, under ice you never cut.', fr: 'La vue avant tourne le faisceau sur le côté : poissons et structures plus loin devant, sous une glace que vous n’avez jamais percée.' },
  // the lost-WebGL card (in-app browsers)
  gl_lost_title: { en: 'The 3D view stopped', fr: 'La vue 3D s’est arrêtée' },
  gl_lost_text: { en: 'Your browser freed the graphics memory. Tap to reload the lake.', fr: 'Votre navigateur a libéré la mémoire graphique. Touchez pour recharger le lac.' },
  // "Send to a friend" (BF funnel item 1)
  share: { en: 'Send to a friend', fr: 'Partager' }, // FR reviewed by the website HQ 2026-10-28 (#198): "Partager" everywhere, no longer sentence
  share_text: { en: 'Try the Accuphy Lab — drag a boat and watch the live sonar light up.', fr: 'Essayez l’Accuphy Lab : déplacez un bateau et regardez le sondeur live s’allumer.' },
  share_sms: { en: 'Text message', fr: 'Message texte' },
  share_copy: { en: 'Copy link', fr: 'Copier le lien' },
  share_copied: { en: 'Link copied', fr: 'Lien copié' },
  share_qr_caption_phone: { en: 'Let a friend scan this with their phone camera', fr: 'Un ami peut scanner ce code avec l’appareil photo de son téléphone.' }, // phones (Jason 2026-10-29: 手机也用二维码和 copy); FR reviewed by the website HQ 2026-10-29 (#198)
  share_qr_caption: { en: 'Scan with your phone camera to open the Lab on your phone', fr: 'Scannez avec l’appareil photo de votre téléphone pour ouvrir le Lab.' }, // #188; FR reviewed by the website HQ 2026-10-29 (#198)
  share_link_label: { en: 'Link', fr: 'Lien' },
  share_copy_hint: { en: 'Paste it into a message to a friend.', fr: 'Collez-le dans un message à un ami.' }, // FR reviewed (#198)
  share_copied_check: { en: 'Copied ✓', fr: 'Copié ✓' }, // FR reviewed (#198)
  share_press_copy: { en: 'Press {keys} to copy', fr: 'Appuyez sur {keys} pour copier' }, // when neither clipboard path is allowed; FR reviewed (#198)
  share_close: { en: 'Close', fr: 'Fermer' },
  share_short: { en: 'Share', fr: 'Partager' }, // the phone dock beside the Shop pill: no room for the long label (FR passes, #198)
  get_app: { en: 'Get the Accuphy Sonar app', fr: 'Télécharger l’application Accuphy Sonar' }, // the caption over the store badges (Jason 2026-10-28; the badges themselves say "Download on the App Store" / "Get it on Google Play"). FR reviewed by the website HQ 2026-10-28 (#198): the infinitive, as the store's /fr footer
  // the Shop button
  shop: { en: 'Shop {name}', fr: 'Achetez le {name}' }, // after the store's own "Achetez maintenant →" (shop.accuphy.com/fr); the arrow is the button's icon
  shop_opening: { en: 'Opening the store…', fr: 'Ouverture de la boutique…' }, // shown for the 1 s before the page leaves (website #228). FR reviewed by the website HQ 2026-10-28 (#198)
  // the app's Home page inside the phone
  tile_panoramic: { en: 'Panoramic View', fr: 'Vue panoramique' },
  tile_forward: { en: 'Forward View', fr: 'Vue avant' },
  tile_down: { en: 'Down View', fr: 'Vue inférieure' },
  tile_live_panoramic: { en: 'Live Panoramic', fr: 'Panoramique en direct' },
  tile_live_forward: { en: 'Live Forward', fr: 'Avant en direct' },
  tile_live_down: { en: 'Live Down', fr: 'Dessous en direct' },
  tile_live_combo: { en: 'Live Combo', fr: 'Combinée en direct' },
  tile_downscan: { en: 'Down Scan', fr: 'Balayage vers le bas' },
  tile_chirp: { en: 'Chirp Sonar', fr: 'Sondeur CHIRP' },
  tile_ice: { en: 'Ice Fishing', fr: 'Pêche sur glace' },
  tile_live_ice: { en: 'Live Ice Fishing', fr: 'Pêche sur glace en direct' },
  tab_setting: { en: 'Setting', fr: 'Paramètres' },
  tab_home: { en: 'Home', fr: 'Accueil' },
  tab_map: { en: 'Map', fr: 'Map' },
  not_available: { en: 'Available with Accuphy PingLive Mini', fr: 'Disponible avec le PingLive Mini' },
}

export function t(key, vars) {
  let s = S[key]?.[LANG] ?? S[key]?.en ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
  return s
}
