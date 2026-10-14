/**
 * Detects, before sending, loops that visibly never terminate.
 *
 * In Chromium, the preview's sandboxed iframe can share the parent's
 * thread: a synchronous loop then freezes the whole tab and no timeout set
 * on the parent side ever fires. So we refuse to send these forms rather
 * than trying to recover afterwards.
 *
 * This is a teaching safety net, not a security measure: it catches the
 * literal forms (`while (true)`, `for (;;)`) and is trivially bypassed
 * (`let x = true; while (x) {}`). Other loops are interrupted at
 * runtime by `loop-protect.ts` (audit EXE-02).
 */

const STRIP_STRINGS = /(['"`])(?:\\.|(?!\1)[^\\])*\1/g;
/**
 * Stripped too: a comment like `// avoid while (true)` must not cause
 * the deployment to be refused.
 */
const STRIP_COMMENTS = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

/** Always-true condition patterns, inside a loop. */
const PATTERNS: readonly { re: RegExp; snippet: string }[] = [
  { re: /\bwhile\s*\(\s*true\s*\)/, snippet: "while (true)" },
  { re: /\bwhile\s*\(\s*1\s*\)/, snippet: "while (1)" },
  { re: /\bwhile\s*\(\s*!\s*(?:0|false)\s*\)/, snippet: "while (!0)" },
  { re: /\bfor\s*\(\s*;\s*;\s*\)/, snippet: "for (;;)" },
  { re: /\bfor\s*\(\s*[^;]*;\s*true\s*;/, snippet: "for (… ; true ; …)" },
];

/**
 * Returns the detected literal snippet, or null. Strings are stripped
 * before analysis: `console.log("while (true)")` is not a loop.
 */
export function detectInfiniteLoop(code: string): string | null {
  const stripped = code.replace(STRIP_COMMENTS, " ").replace(STRIP_STRINGS, '""');
  for (const { re, snippet } of PATTERNS) {
    if (re.test(stripped)) return snippet;
  }
  return null;
}

/**
 * Message shown to the learner when a loop is refused. Worded as a risk
 * rather than a certainty: `while (true) { … break; }` is legitimate but
 * refused anyway, since the detector cannot read a `break`.
 */
export function infiniteLoopMessage(snippet: string): string {
  return (
    `Déploiement refusé : ${snippet} risque de ne jamais se terminer. ` +
    "Une boucle sans fin fige l'onglet entier, aperçu compris, et il faudrait " +
    "recharger la page — l'aperçu ne peut pas s'en remettre tout seul. " +
    "Donne-lui une condition d'arrêt visible, puis redéploie."
  );
}
