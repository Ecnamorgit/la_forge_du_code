/**
 * Chapitres dont les etapes n'ont volontairement pas d'apercu, avec la raison.
 *
 * Cle : `<cursus>/<slug de chapitre>`. Le test d'integrite exige que toute
 * etape sans `previewMount` appartienne a un chapitre listee ici — c'est ce qui
 * distingue une exclusion assumee d'un oubli silencieux.
 */
export const PREVIEW_EXEMPT: Record<string, string> = {
  "react/chapitre-4":
    "Enseigne React Router : l'apercu exigerait react-router-dom dans le bundle " +
    "et un MemoryRouter autour du composant monte. Hors perimetre du runtime v1.",
};
