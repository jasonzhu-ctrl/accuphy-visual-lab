// The Lab's two languages (X-6L-fr, 2026-10-25; Jason 2026-10-17: 做法语版，魁北克也投). Only `?lang=fr` on the Lab's own
// URL switches to French — the store's French page puts it on the iframe address; nothing is read from the parent page
// or the browser. Default English. Terms follow accuphy-website/docs/glossary.csv (fr column); PingLive, PingLive Mini,
// Down Scan and CHIRP are never translated. Every string a visitor can see lives here; numbers and units stay as they are.
// Words the glossary does not have are listed for review in docs/2026-10-25-lab-fr-strings.md.
export const LANG = (() => { try { return new URLSearchParams(window.location.search).get('lang') === 'fr' ? 'fr' : 'en' } catch { return 'en' } })()

const S = {
  // control panel
  device: { en: 'Device', fr: 'Appareil' },
  view: { en: 'View', fr: 'Vue' },
  camera: { en: 'Camera', fr: 'Caméra' },
  range: { en: 'Range', fr: 'Portée' },
  depth: { en: 'Depth', fr: 'Profondeur' },
  auto_follows: { en: 'AUTO · follows the water', fr: 'AUTO · suit la profondeur' },
  max: { en: 'max', fr: 'max.' },
  cam_top: { en: 'Top', fr: 'Dessus' },
  cam_under: { en: 'Under the ice', fr: 'Sous la glace' },
  cam_section: { en: 'Section', fr: 'Coupe' },
  // the view pills (short forms of the glossary's view names)
  mode_down: { en: 'Down', fr: 'Bas' },
  mode_forward: { en: 'Forward', fr: 'Avant' },
  mode_panoramic: { en: 'Panoramic', fr: 'Panoramique' },
  mode_combo: { en: 'Combo', fr: 'Combo' },
  mode_liveice: { en: 'Live Ice', fr: 'Live Ice' },
  mode_ice: { en: 'Ice Fishing', fr: 'Pêche sur glace' },
  // the one-line description under the panel: "{device} · {beam} beam. Drag the boat — …"
  desc_lake: { en: '{device} · {beam} beam. Drag the boat — whatever the beam touches lights up.', fr: '{device} · faisceau de {beam}. Déplacez le bateau : tout ce que le faisceau touche s’allume.' },
  desc_ice: { en: '{device} · {beam} beam, through the ice. Tap the ice to drill a new hole — whatever the beam touches lights up.', fr: '{device} · faisceau de {beam}, à travers la glace. Touchez la glace pour percer un nouveau trou : tout ce que le faisceau touche s’allume.' },
  // cues and toasts
  hint_boat: { en: 'Drag the boat to move it', fr: 'Glissez le bateau pour le déplacer' },
  hint_ice: { en: 'Tap the ice to drill a hole', fr: 'Touchez la glace pour percer un trou' },
  toast_phone: { en: 'These are the app’s own controls — Home, range, gain and pause work.', fr: 'Ce sont les commandes de l’application : Accueil, portée, gain et pause fonctionnent.' },
  toast_desktop: { en: 'These are the app’s own controls — use the panel to change the view.', fr: 'Ce sont les commandes de l’application : changez de vue dans le panneau.' },
  // the step cards
  step: { en: 'Step', fr: 'Étape' },
  s1_title: { en: 'This is the beam', fr: 'Voici le faisceau' },
  s1_text: { en: 'A thin curtain of sound under the boat. Drag the boat — whatever the curtain touches lights up.', fr: 'Un mince rideau de son sous le bateau. Déplacez le bateau : tout ce que le rideau touche s’allume.' },
  s2_title: { en: 'This is what your phone shows', fr: 'Voici ce que montre votre téléphone' },
  s2_text: { en: 'The screen is that curtain, seen edge-on: bottom, timber, fish. Forward View aims it ahead of the boat.', fr: 'L’écran, c’est ce rideau vu de profil : le fond, les arbres, les poissons. La vue vers l’avant le pointe devant le bateau.' },
  s3_title: { en: 'Which view, when', fr: 'Quelle vue, et quand' },
  s3_text: { en: 'Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below.', fr: 'La vue panoramique balaie large pour trouver poissons et structures ; la vue vers l’avant pour lancer dessus ; la vue vers le bas pour pêcher à la verticale.' },
  s3_text_combo: { en: 'Combo shows Down and Forward side by side; Forward to cast at fish ahead; Down to fish straight below.', fr: 'La vue combinée montre le bas et l’avant côte à côte : l’avant pour lancer sur les poissons devant, le bas pour pêcher à la verticale.' },
  i1_title: { en: 'The beam under the ice', fr: 'Le faisceau sous la glace' },
  i1_text: { en: 'The PingLive Mini hangs in the hole and pings straight down. Tap the ice anywhere to drill a new hole — whatever the beam touches lights up.', fr: 'Le PingLive Mini pend dans le trou et émet droit vers le bas. Touchez la glace n’importe où pour percer un nouveau trou : tout ce que le faisceau touche s’allume.' },
  i2_title: { en: 'Watch them come in', fr: 'Regardez-les arriver' },
  i2_text: { en: 'The flasher is the dial: the bottom, your bait and every fish that rises, by depth around the ring. The panel beside it draws the same fish as marks.', fr: 'Le cadran, c’est le flasher : le fond, votre appât et chaque poisson qui monte, par profondeur autour de l’anneau. Le panneau à côté dessine les mêmes poissons en marques.' },
  i3_title: { en: 'Look ahead without drilling', fr: 'Voir devant sans percer' },
  i3_text: { en: 'Forward View turns the beam sideways: fish and structure 60 ft away, under ice you never cut.', fr: 'La vue vers l’avant tourne le faisceau sur le côté : poissons et structures à 60 pi, sous une glace que vous n’avez jamais percée.' },
  // the Shop button
  shop: { en: 'Shop {name}', fr: 'Magasiner {name}' },
  // the app's Home page inside the phone
  tile_panoramic: { en: 'Panoramic View', fr: 'Vue panoramique' },
  tile_forward: { en: 'Forward View', fr: 'Vue vers l’avant' },
  tile_down: { en: 'Down View', fr: 'Vue vers le bas' },
  tab_setting: { en: 'Setting', fr: 'Réglages' },
  tab_home: { en: 'Home', fr: 'Accueil' },
  tab_map: { en: 'Map', fr: 'Carte' },
  not_available: { en: 'Available with Accuphy PingLive Mini', fr: 'Offert avec le Accuphy PingLive Mini' },
}

export function t(key, vars) {
  let s = S[key]?.[LANG] ?? S[key]?.en ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
  return s
}
