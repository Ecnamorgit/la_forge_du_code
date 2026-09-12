/**
 * Chapitres dont les validateurs jugent une EXÉCUTION, pas un texte : ils
 * lisent `ctx.logs` ou `ctx.sql`, produits par le bac à sable du navigateur.
 * Appelés sans contexte, ils échouent pour absence de contexte.
 *
 * L'exclusion est nommée **chapitre par chapitre**, et non par cursus : les
 * chapitres 11 et 12 de `javascript` sont statiques (l'hôte d'API est fictif et
 * ne résout jamais dans le sandbox). Un chapitre ajouté demain est statique par
 * défaut ; s'il est runtime, le test d'intégrité échouera bruyamment et il
 * faudra l'inscrire ici — c'est le bon sens de la faute.
 *
 * Deux usages :
 * - le test d'intégrité (`parcours-integrite.test.ts`) les exclut de
 *   l'invariant « le code de départ ne valide jamais son étape » ;
 * - le serveur ne peut pas les revalider sans exécuter lui-même le code de
 *   l'apprenant, ce que l'architecture exclut : leur réussite reste déclarée
 *   par le navigateur (`lib/step-proof.ts`).
 */
export const RUNTIME_CHAPTERS: ReadonlySet<string> = new Set<string>([
  // javascript 1 à 10 : validés sur `ctx.logs`.
  ...Array.from({ length: 10 }, (_, i) => `javascript/chapitre-${i + 1}`),
  // sql : validé sur le résultat d'une vraie requête (`ctx.sql`).
  "sql/chapitre-1",
]);

export function isRuntimeChapter(course: string, chapter: string): boolean {
  return RUNTIME_CHAPTERS.has(`${course}/${chapter}`);
}
