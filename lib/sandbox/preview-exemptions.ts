/**
 * Chapters without a preview, with the reason for the exemption.
 *
 * Key: `<curriculum>/<chapter slug>`. `preview-mounts.test.ts` requires every
 * step without a `previewMount` to belong to a chapter listed here, to
 * tell an intentional exclusion apart from an oversight.
 */
export const PREVIEW_EXEMPT: Record<string, string> = {
  "react/chapitre-4":
    "Enseigne React Router : l'apercu exigerait react-router-dom dans le bundle " +
    "et un MemoryRouter autour du composant monte. Hors perimetre du runtime v1.",
};
