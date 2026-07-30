/**
 * Transformation JSX -> JS, cote navigateur.
 *
 * Sucrase plutot que Babel standalone : il ne couvre que JSX, TypeScript et les
 * modules — exactement le besoin de ce cursus — pour environ un dixieme du
 * poids. Import dynamique pour qu'il n'entre pas dans le bundle initial de
 * l'app : seul un chapitre React le charge, et seulement au premier deploiement.
 *
 * Le transform JSX classique produit des appels `React.createElement`, ce qui
 * convient puisque l'iframe d'apercu expose `React` en global.
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
    // Sucrase leve sur une syntaxe invalide. On porte le message plutot que de
    // laisser l'exception traverser : l'appelant l'affiche a l'apprenant, c'est
    // un retour pedagogique, pas un incident.
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
