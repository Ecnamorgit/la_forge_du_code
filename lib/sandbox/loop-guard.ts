/**
 * Détection, avant envoi, des boucles qui ne se terminent visiblement jamais.
 *
 * Pourquoi ce garde-fou existe, et pourquoi il est volontairement naïf.
 *
 * L'aperçu React montait à l'origine un chien de garde côté parent : on postait
 * le code, et si aucun accusé n'arrivait dans le délai imparti, on remplaçait
 * l'iframe. **Ça ne peut pas marcher.** Vérifié au navigateur le 2026-07-30 :
 * une iframe `srcdoc` à origine opaque partage le thread principal du parent
 * dans Chromium, donc une boucle synchrone dans le composant de l'apprenant gèle
 * l'onglet ENTIER — le `setTimeout` du parent ne s'exécute jamais. L'onglet est
 * resté figé 58 secondes avant d'être tué. Deux revues de code successives
 * avaient validé la logique du chien de garde ; seule l'exécution l'a démentie.
 *
 * On ne peut donc pas récupérer après coup : il faut refuser d'envoyer.
 *
 * Ce détecteur est un filet pédagogique, pas une sécurité. Il attrape les
 * formes littérales qu'un apprenant écrit par accident — `while (true)`,
 * `for (;;)` — et se contourne trivialement (`let x = true; while (x) {}`).
 * C'est assumé : le sandbox exécute déjà du code arbitraire, l'apprenant ne se
 * piège que lui-même, et un vrai correctif demanderait de servir l'aperçu
 * depuis une autre origine pour obtenir un processus séparé.
 */

const STRIP_STRINGS = /(['"`])(?:\\.|(?!\1)[^\\])*\1/g;

/** Motifs de condition toujours vraie, dans une boucle. */
const MOTIFS: readonly { re: RegExp; forme: string }[] = [
  { re: /\bwhile\s*\(\s*true\s*\)/, forme: "while (true)" },
  { re: /\bwhile\s*\(\s*1\s*\)/, forme: "while (1)" },
  { re: /\bwhile\s*\(\s*!\s*(?:0|false)\s*\)/, forme: "while (!0)" },
  { re: /\bfor\s*\(\s*;\s*;\s*\)/, forme: "for (;;)" },
  { re: /\bfor\s*\(\s*[^;]*;\s*true\s*;/, forme: "for (… ; true ; …)" },
];

/**
 * Renvoie la forme littérale détectée, ou null. Les chaînes de caractères sont
 * retirées avant analyse : un `console.log("while (true)")` n'est pas une
 * boucle, et refuser de déployer pour ça serait pire que le problème.
 */
export function detecterBoucleInfinie(code: string): string | null {
  const sansChaines = code.replace(STRIP_STRINGS, '""');
  for (const { re, forme } of MOTIFS) {
    if (re.test(sansChaines)) return forme;
  }
  return null;
}

/** Message affiché à l'apprenant quand une boucle est refusée. */
export function messageBoucleInfinie(forme: string): string {
  return (
    `Déploiement refusé : ${forme} ne se termine jamais. ` +
    "Une boucle infinie fige l'onglet entier, aperçu compris, et il faudrait " +
    "recharger la page. Donne-lui une condition d'arrêt, puis redéploie."
  );
}
