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
  range_fwd: { en: 'Forward range', fr: 'Portée avant' }, // PLM Combo's two ranges (#189)
  range_down: { en: 'Down range', fr: 'Portée vers le bas' },
  combo_fwd: { en: 'FORWARD', fr: 'AVANT' }, // the small captions over the phone's two Combo range controls
  combo_down: { en: 'DOWN', fr: 'BAS' },
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
  shore_edge: { en: 'Shoreline — the lake ends here', fr: 'La rive : le lac s’arrête ici' }, // the line when the boat or a tap reaches the shore (#206; words from 对接 11-02). FR draft, for the website's review
  toast_phone: { en: 'These are the app’s own controls — Home, range, gain and pause work.', fr: 'Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent.' },
  toast_desktop: { en: 'These are the app’s own controls — use the panel to change the view.', fr: 'Ce sont les commandes de l’application : changez de vue dans le panneau.' },
  // the entry tour (Tour.jsx, Jason 2026-11-02; replaces the lake's s1–s3 step cards): placeholder English from the prototype,
  // the real words and the French come later with Jason and the website's review (French falls back to English until then)
  tour_drag_title: { en: 'Drag the boat' },
  tour_drag_text: { en: 'Whatever the beam touches shows up live in the Accuphy Sonar app.' },
  tour_fwd_title: { en: 'Tap Forward View' },
  tour_fwd_text: { en: 'The beam turns to look ahead of the boat — where you cast.' },
  tour_down_title: { en: 'Tap Down View' },
  tour_down_text: { en: 'The beam points straight under the boat — see what’s right below.' },
  tour_pano_title: { en: 'Tap Panoramic View' },
  tour_pano_text: { en: 'A wide sweep ahead of the boat — to find fish and structure.' },
  // the ice page's tour (2026-11-02, replaces its cards i1–i3): English placeholders from Base; every FR is a draft for the website's review
  tour_drill_title: { en: 'Tap the ice', fr: 'Touchez la glace' }, // FR draft, for the website's review
  tour_drill_text: { en: 'Drill a new hole where you tap — the PingLive Mini drops in and pings straight down.', fr: 'Percez un nouveau trou là où vous touchez : le PingLive Mini y descend et sonde droit vers le bas.' }, // FR draft, for the website's review
  tour_ice_fwd_text: { en: 'The beam turns sideways under the ice — fish out ahead, where you never drilled.', fr: 'Le faisceau se tourne sur le côté sous la glace : les poissons plus loin, là où vous n’avez pas percé.' }, // FR draft, for the website's review
  tour_ice_down_text: { en: 'The beam points straight down the hole — your bait and every fish that rises to it.', fr: 'Le faisceau pointe droit sous le trou : votre appât et chaque poisson qui monte vers lui.' }, // FR draft, for the website's review
  tour_tap: { en: 'Tap' },
  tour_skip: { en: 'Skip tour' },
  tour_replay: { en: 'Replay tour' },
  // the lost-WebGL card (in-app browsers)
  gl_lost_title: { en: 'The 3D view stopped', fr: 'La vue 3D s’est arrêtée' },
  gl_lost_text: { en: 'Your browser freed the graphics memory. Tap to reload the lake.', fr: 'Votre navigateur a libéré la mémoire graphique. Touchez pour recharger le lac.' },
  // "Send to a friend" (BF funnel item 1)
  share: { en: 'Send to a fishing buddy', fr: 'Partager' }, // EN Jason's pick 2026-10-30; FR goes through the website HQ // FR reviewed by the website HQ 2026-10-28 (#198): "Partager" everywhere, no longer sentence
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
  // the preview card (brief part 5): drafts until Jason picks them; French after the website's review, so no line in French yet
  share_title: { en: 'Show a buddy what’s under the boat', fr: 'Partager' },
  share_line: { en: 'Drag the boat. Watch the sonar light up.', fr: '' },
  get_app: { en: 'Get Accuphy Sonar App', fr: 'Télécharger l’application Accuphy Sonar' }, // the faint line over the desktop badges above the phone (A8 design 2026-11-01; HQ 11-02: no "the", App capitalised). FR draft, for the website's review
  // A8 (Jason 11-01; base version 11-02). Keys and FR drafts from 对接 (docs/2026-11-01-app-qr-plan.md "11-01 改"); every FR is a draft for the website's review
  app_qr_caption: { en: 'Scan to download Accuphy Sonar App', fr: 'Scannez pour télécharger l’application Accuphy Sonar' }, // under the store's QR code (desktop). FR draft, for the website's review
  app_qr_open: { en: 'Show the {store} QR code', fr: 'Afficher le code QR {store}' }, // the badge button's screen-reader label; {store} = App Store / Google Play, not translated. FR draft, for the website's review
  qr_label: { en: 'QR code', fr: 'code QR' }, // the screen-reader name of every QR picture. FR draft, for the website's review
  learn_more: { en: 'Learn More', fr: 'En savoir plus' }, // the phone's store button (was "Shop {name}"); the arrow is the button's icon. FR draft, for the website's review
  share_buddy_phone: { en: 'Share to a Fishing Buddy', fr: 'Partager' }, // the phone's share button (was "Share"); FR follows the website's #198 "Partager". FR draft, for the website's review
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
  not_available: { en: 'Not available in this simulation yet.', fr: 'Pas encore disponible dans cette simulation.' }, // FR reviewed 2026-10-31 (#191); only Live Panoramic on the ice page now
  // {view} is the tile's name (#191, Jason 2026-10-30)
  na_moving: { en: '{view} needs the boat moving slowly, so it isn’t available in this simulation yet.', fr: '{view} exige que le bateau avance lentement : cette vue n’est donc pas encore disponible dans cette simulation.' },
  // the subscribe card (#191). {view} is the tile's name. unlock_done: Klaviyo HQ's draft, Jason has not seen it; unlock_consent: Jason's own text (2026-11-03). FR reviewed by the website HQ 2026-10-31 ("la vue {view}", so any view name reads right), except unlock_done: still a draft
  unlock_title: { en: 'Unlock {view}', fr: 'Débloquer la vue {view}' },
  unlock_locked: { en: '{view}, locked: subscribe to unlock', fr: 'Vue {view} verrouillée : abonnez-vous pour la débloquer' },
  unlock_text: { en: 'Subscribe with your email first, and {view} opens right away.', fr: 'Abonnez-vous d’abord avec votre courriel : la vue {view} s’ouvre aussitôt.' },
  unlock_done: { en: 'You’re in. {view} is unlocked.', fr: 'C’est fait. {view} est débloquée.' },
  back_to_lake: { en: 'Back to the lake', fr: 'Retour au lac' },
  unlock_email: { en: 'Email', fr: 'Courriel' },
  unlock_cta: { en: 'Subscribe and unlock', fr: 'M’abonner et débloquer' },
  unlock_sending: { en: 'Subscribing…', fr: 'Abonnement en cours…' },
  unlock_consent: { en: 'By subscribing, you agree to receive marketing emails from Accuphy. Unsubscribe anytime.', fr: 'En vous abonnant, vous acceptez de recevoir des courriels marketing d’Accuphy. Désabonnement en tout temps.' }, // Jason confirmed EN + FR 2026-11-03 in the BF funnel chat (via Lab HQ)
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
