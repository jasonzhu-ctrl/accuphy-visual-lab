// Shared by the static share-build cover and the app's i18n table. Keep this
// module free of window/import.meta side effects so the Node builder can read it.
export const LOADING_COPY = {
  loading_heading: { en: 'Explore live sonar', fr: 'Explorez le sondeur live' },
  loading_lake_hint: { en: 'Choose a view, move the boat and follow the echoes.', fr: 'Choisissez une vue, déplacez le bateau et suivez les échos.' },
  loading_ice_hint: { en: 'Choose a view and follow the echoes under the ice.', fr: 'Choisissez une vue et suivez les échos sous la glace.' },
  loading_lake_status: { en: 'Loading the lake…', fr: 'Chargement du lac…' },
  loading_ice_status: { en: 'Loading the ice…', fr: 'Chargement de la scène de pêche sur glace…' },
  loading_no_script: { en: 'JavaScript is required for the interactive Lab. You are viewing its introduction.', fr: 'JavaScript est nécessaire pour utiliser le Lab interactif. Vous consultez sa présentation.' },
}
