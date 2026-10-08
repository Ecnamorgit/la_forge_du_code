/**
 * Détection, avant envoi, des boucles qui ne se terminent visiblement jamais.
 *
 * Dans Chromium, l'iframe sandboxée de l'aperçu peut partager le fil
 * d'exécution du parent : une boucle synchrone fige alors l'onglet entier et
 * aucun délai posé côté parent ne se déclenche. On refuse donc d'envoyer ces
 * formes plutôt que d'essayer de récupérer après coup.
 *
 * C'est un filet pédagogique, pas une sécurité : il attrape les formes
 * littérales (`while (true)`, `for (;;)`) et se contourne trivialement
 * (`let x = true; while (x) {}`). Les autres boucles sont interrompues à
 * l'exécution par `loop-protect.ts` (audit EXE-02).
 */

const STRIP_STRINGS = /(['"`])(?:\\.|(?!\1)[^\\])*\1/g;
/**
 * Retirés aussi : un commentaire `// évite le while (true)` ne doit pas faire
 * refuser le déploiement.
 */
const STRIP_COMMENTS = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

/** Motifs de condition toujours vraie, dans une boucle. */
const MOTIFS: readonly { re: RegExp; forme: string }[] = [
  { re: /\bwhile\s*\(\s*true\s*\)/, forme: "while (true)" },
  { re: /\bwhile\s*\(\s*1\s*\)/, forme: "while (1)" },
  { re: /\bwhile\s*\(\s*!\s*(?:0|false)\s*\)/, forme: "while (!0)" },
  { re: /\bfor\s*\(\s*;\s*;\s*\)/, forme: "for (;;)" },
  { re: /\bfor\s*\(\s*[^;]*;\s*true\s*;/, forme: "for (… ; true ; …)" },
];

/**
 * Renvoie la forme littérale détectée, ou null. Les chaînes sont retirées
 * avant analyse : `console.log("while (true)")` n'est pas une boucle.
 */
export function detecterBoucleInfinie(code: string): string | null {
  const nettoye = code.replace(STRIP_COMMENTS, " ").replace(STRIP_STRINGS, '""');
  for (const { re, forme } of MOTIFS) {
    if (re.test(nettoye)) return forme;
  }
  return null;
}

/**
 * Message affiché à l'apprenant quand une boucle est refusée. Formulé au
 * conditionnel : `while (true) { … break; }` est légitime mais refusé quand
 * même, le détecteur ne sachant pas lire un `break`.
 */
export function messageBoucleInfinie(forme: string): string {
  return (
    `Déploiement refusé : ${forme} risque de ne jamais se terminer. ` +
    "Une boucle sans fin fige l'onglet entier, aperçu compris, et il faudrait " +
    "recharger la page — l'aperçu ne peut pas s'en remettre tout seul. " +
    "Donne-lui une condition d'arrêt visible, puis redéploie."
  );
}
