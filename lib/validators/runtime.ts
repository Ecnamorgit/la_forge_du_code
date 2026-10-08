/**
 * Chapitres dont les validateurs jugent une exécution, pas un texte : ils
 * lisent `ctx.logs` ou `ctx.sql`, produits par le bac à sable du navigateur, et
 * échouent si on les appelle sans contexte.
 *
 * La liste est tenue chapitre par chapitre : les chapitres 11 et 12 de
 * `javascript` sont statiques (hôte d'API fictif). Un nouveau chapitre est
 * statique par défaut ; s'il dépend de l'exécution, le test d'intégrité échoue
 * tant qu'il n'est pas inscrit ici.
 *
 * Ces chapitres sont exclus de l'invariant « le code de départ ne valide
 * jamais son étape » (`parcours-integrite.test.ts`). Le serveur ne peut pas
 * non plus les revalider sans exécuter le code de l'apprenant : leur réussite
 * reste déclarée par le navigateur (`lib/step-proof.ts`).
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
