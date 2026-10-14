import { parse } from "acorn";
import { simple } from "acorn-walk";

/**
 * Protection des boucles du code de l'apprenant (audit EXE-02).
 *
 * Dans Chromium, l'iframe sandboxée qui exécute ce code peut partager le fil
 * d'exécution de la page : une boucle sans fin fige alors l'onglet entier, et
 * aucun délai posé par la page ne s'en remet. Un Web Worker n'est pas une
 * option : plusieurs chapitres manipulent le DOM.
 *
 * On instrumente donc le code avant de l'exécuter, comme CodePen ou JSBin :
 * chaque corps de boucle commence par un appel à une garde, qui lève une
 * erreur quand le traitement synchrone en cours dépasse le délai.
 *
 * La durée est remise à zéro par une microtâche, qui ne passe qu'une fois le
 * traitement synchrone terminé : une boucle sans fin finit donc par lever, et
 * un rendu React déclenché plus tard repart de zéro.
 */

/** Délai au-delà duquel un traitement synchrone qui boucle est interrompu. */
export const LOOP_TIMEOUT_MS = 3000;

const GUARD = "__gardeBoucle__";
const START = "__debutBoucle__";

export const LOOP_INTERRUPTED_MESSAGE =
  "Boucle interrompue après 3 s : elle ne s'arrête jamais. Vérifie sa condition d'arrêt.";

function prelude(timeoutMs: number): string {
  return (
    `var ${START} = 0;` +
    `function ${GUARD}() {` +
    `var t = Date.now();` +
    `if (!${START}) { ${START} = t; Promise.resolve().then(function () { ${START} = 0; }); }` +
    `if (t - ${START} > ${timeoutMs}) { throw new RangeError(${JSON.stringify(LOOP_INTERRUPTED_MESSAGE)}); }` +
    `}\n`
  );
}

interface AstNode {
  start: number;
  end: number;
  type: string;
}

interface LoopNode extends AstNode {
  body: AstNode;
}

/**
 * Renvoie le code avec une garde au début de chaque corps de boucle, précédé
 * de la définition de la garde. Un code sans boucle est rendu tel quel. Un
 * code qui ne se lit pas (erreur de syntaxe) est rendu tel quel aussi :
 * l'exécution signalera l'erreur, et il n'y a pas de boucle à protéger.
 */
export function guardLoops(code: string, options: { timeoutMs?: number } = {}): string {
  let ast;
  try {
    ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
      allowReturnOutsideFunction: true,
    });
  } catch {
    return code;
  }

  const insertions: { position: number; text: string }[] = [];
  const guardNode = (node: unknown) => {
    const { body } = node as LoopNode;
    if (body.type === "BlockStatement") {
      insertions.push({ position: body.start + 1, text: `${GUARD}();` });
    } else {
      // Corps sans accolades (`while (x) y();`) : on l'entoure d'un bloc.
      insertions.push({ position: body.start, text: `{${GUARD}();` });
      insertions.push({ position: body.end, text: "}" });
    }
  };
  simple(ast, {
    WhileStatement: guardNode,
    DoWhileStatement: guardNode,
    ForStatement: guardNode,
    ForInStatement: guardNode,
    ForOfStatement: guardNode,
  });

  if (insertions.length === 0) return code;

  // De la fin vers le début : chaque insertion laisse intactes les positions
  // qui restent à traiter.
  insertions.sort((a, b) => b.position - a.position);
  let result = code;
  for (const { position, text } of insertions) {
    result = result.slice(0, position) + text + result.slice(position);
  }
  return prelude(options.timeoutMs ?? LOOP_TIMEOUT_MS) + result;
}

const INLINE_SCRIPT = /(<script\b(?![^>]*\bsrc\s*=)[^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
const TYPE_DECLARE = /\btype\s*=/i;
const TYPE_JAVASCRIPT = /\btype\s*=\s*["']?(?:text|application)\/javascript\b/i;

/**
 * Protège les scripts en ligne d'un document HTML (aperçu du cursus HTML).
 * Les scripts externes (`src`) et ceux d'un autre type (JSON, gabarits,
 * modules) sont laissés tels quels.
 */
export function guardHtmlScripts(html: string, options: { timeoutMs?: number } = {}): string {
  return html.replace(INLINE_SCRIPT, (match, openingTag: string, body: string, closingTag: string) => {
    if (TYPE_DECLARE.test(openingTag) && !TYPE_JAVASCRIPT.test(openingTag)) return match;
    return openingTag + guardLoops(body, options) + closingTag;
  });
}
