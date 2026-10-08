/**
 * Chapitres sans aperçu, avec la raison de l'exemption.
 *
 * Clé : `<cursus>/<slug de chapitre>`. `preview-mounts.test.ts` exige que toute
 * étape sans `previewMount` appartienne à un chapitre listé ici, pour
 * distinguer une exclusion voulue d'un oubli.
 */
export const PREVIEW_EXEMPT: Record<string, string> = {
  "react/chapitre-4":
    "Enseigne React Router : l'apercu exigerait react-router-dom dans le bundle " +
    "et un MemoryRouter autour du composant monte. Hors perimetre du runtime v1.",
};
