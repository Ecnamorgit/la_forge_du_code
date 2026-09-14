import { parse } from "acorn";
import { simple } from "acorn-walk";

/**
 * Protection des boucles du code de l'apprenant (constat EXE-02 de l'audit de
 * sécurité du 2026-09-12).
 *
 * Le JavaScript de l'apprenant s'exécute dans une iframe `srcdoc` sandboxée
 * qui, dans Chromium, partage le fil d'exécution de la page : une boucle sans
 * fin fige l'onglet entier, et aucun délai posé par la page ne peut s'en
 * remettre (cf. loop-guard.ts). On ne peut pas non plus passer par un Web
 * Worker : plusieurs chapitres manipulent le DOM.
 *
 * On instrumente donc le code avant de l'exécuter, comme le font CodePen ou
 * JSBin : chaque corps de boucle commence par un appel à une garde. La garde
 * mesure la durée du traitement synchrone en cours ; au-delà du délai, elle
 * lève une erreur, et la boucle s'arrête au lieu de figer l'onglet.
 *
 * La durée est remise à zéro par une microtâche, qui ne s'exécute qu'une fois
 * le traitement synchrone terminé. Une boucle sans fin ne rend jamais la main,
 * donc la microtâche ne passe jamais et la garde finit par lever. Un rendu
 * React déclenché bien plus tard repart de zéro : il n'est pas interrompu à
 * tort.
 */

/** Délai au-delà duquel un traitement synchrone qui boucle est interrompu. */
export const DELAI_BOUCLE_MS = 3000;

const GARDE = "__gardeBoucle__";
const DEBUT = "__debutBoucle__";

export const MESSAGE_BOUCLE_INTERROMPUE =
  "Boucle interrompue après 3 s : elle ne s'arrête jamais. Vérifie sa condition d'arrêt.";

function prelude(delaiMs: number): string {
  return (
    `var ${DEBUT} = 0;` +
    `function ${GARDE}() {` +
    `var t = Date.now();` +
    `if (!${DEBUT}) { ${DEBUT} = t; Promise.resolve().then(function () { ${DEBUT} = 0; }); }` +
    `if (t - ${DEBUT} > ${delaiMs}) { throw new RangeError(${JSON.stringify(MESSAGE_BOUCLE_INTERROMPUE)}); }` +
    `}\n`
  );
}

interface Noeud {
  start: number;
  end: number;
  type: string;
}

interface Boucle extends Noeud {
  body: Noeud;
}

/**
 * Renvoie le code avec une garde au début de chaque corps de boucle, précédé
 * de la définition de la garde. Un code sans boucle est rendu tel quel. Un
 * code qui ne se lit pas (erreur de syntaxe) est rendu tel quel aussi :
 * l'exécution signalera l'erreur, et il n'y a pas de boucle à protéger.
 */
export function protegerBoucles(code: string, options: { delaiMs?: number } = {}): string {
  let arbre;
  try {
    arbre = parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
      allowReturnOutsideFunction: true,
    });
  } catch {
    return code;
  }

  const insertions: { position: number; texte: string }[] = [];
  const garder = (noeud: unknown) => {
    const { body } = noeud as Boucle;
    if (body.type === "BlockStatement") {
      insertions.push({ position: body.start + 1, texte: `${GARDE}();` });
    } else {
      // Corps sans accolades (`while (x) y();`) : on l'entoure d'un bloc.
      insertions.push({ position: body.start, texte: `{${GARDE}();` });
      insertions.push({ position: body.end, texte: "}" });
    }
  };
  simple(arbre, {
    WhileStatement: garder,
    DoWhileStatement: garder,
    ForStatement: garder,
    ForInStatement: garder,
    ForOfStatement: garder,
  });

  if (insertions.length === 0) return code;

  // De la fin vers le début : chaque insertion laisse intactes les positions
  // qui restent à traiter.
  insertions.sort((a, b) => b.position - a.position);
  let resultat = code;
  for (const { position, texte } of insertions) {
    resultat = resultat.slice(0, position) + texte + resultat.slice(position);
  }
  return prelude(options.delaiMs ?? DELAI_BOUCLE_MS) + resultat;
}

const SCRIPT_EN_LIGNE = /(<script\b(?![^>]*\bsrc\s*=)[^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
const TYPE_DECLARE = /\btype\s*=/i;
const TYPE_JAVASCRIPT = /\btype\s*=\s*["']?(?:text|application)\/javascript\b/i;

/**
 * Protège les scripts en ligne d'un document HTML (aperçu du cursus HTML).
 * Les scripts externes (`src`) et ceux d'un autre type (JSON, gabarits,
 * modules) sont laissés tels quels.
 */
export function protegerScriptsHtml(html: string, options: { delaiMs?: number } = {}): string {
  return html.replace(SCRIPT_EN_LIGNE, (tout, ouverture: string, contenu: string, fermeture: string) => {
    if (TYPE_DECLARE.test(ouverture) && !TYPE_JAVASCRIPT.test(ouverture)) return tout;
    return ouverture + protegerBoucles(contenu, options) + fermeture;
  });
}
