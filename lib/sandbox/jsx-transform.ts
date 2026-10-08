/**
 * Transformation JSX vers JS, côté navigateur.
 *
 * Sucrase plutôt que Babel standalone : il couvre JSX, TypeScript et les
 * modules, soit le besoin du cursus, pour environ un dixième du poids. Importé
 * dynamiquement pour rester hors du bundle initial : seul un chapitre React le
 * charge, au premier déploiement.
 *
 * Le transform JSX classique produit des `React.createElement`, `React` étant
 * global dans l'iframe d'aperçu.
 */

export type JsxTransformResult =
  | { ok: true; js: string }
  | { ok: false; error: string };

export async function transformJsx(code: string): Promise<JsxTransformResult> {
  try {
    const { transform } = await import("sucrase");
    const { code: js } = transform(code, {
      transforms: ["jsx"],
      jsxRuntime: "classic",
      production: true,
    });
    return { ok: true, js };
  } catch (err) {
    // Syntaxe invalide : le message est rendu à l'appelant, qui l'affiche à
    // l'apprenant.
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
