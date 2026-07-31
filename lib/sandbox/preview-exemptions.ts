/**
 * Chapitres dont les étapes n'ont volontairement pas d'aperçu, avec la raison.
 *
 * Clé : `<cursus>/<slug de chapitre>`. Le test d'intégrité exige que toute
 * étape sans `previewMount` appartienne à un chapitre listé ici — c'est ce qui
 * distingue une exclusion assumée d'un oubli silencieux.
 *
 * La valeur, elle, est un message destiné à être lu tel quel : elle reste sans
 * accents pour rester cohérente avec le reste des données de cours.
 */
export const PREVIEW_EXEMPT: Record<string, string> = {
  "react/chapitre-4":
    "Enseigne React Router : l'apercu exigerait react-router-dom dans le bundle " +
    "et un MemoryRouter autour du composant monte. Hors perimetre du runtime v1.",
};
