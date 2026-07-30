import type { Validator } from "@/data/courses/html/types";
import {
  stripLineComments,
  fail,
  pass,
  findBareCallBody,
  findNamedFunctionBody,
  matchClosing,
  statementEnd,
  findJsxTagAttrs,
  extractAttrValue,
} from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

/** Un `<X.Provider ...>` est-il present ? */
const providerRe = /<\s*[A-Za-z_$][\w$]*\s*\.\s*Provider\b/;

/** Meme motif, mais capture le nom (dote) de la balise pour la reperer. */
const providerTagNameRe = /<\s*([A-Za-z_$][\w$]*\s*\.\s*Provider)\b/;

/**
 * Extrait le contenu de l'attribut `value={...}` du premier `<X.Provider>` —
 * SCOPE a la balise du Provider elle-meme, via `findJsxTagAttrs` (qui isole
 * les attributs d'UNE balise en equilibrant `{ }`) puis `extractAttrValue`.
 *
 * Avant cette version, la recherche de `value={` portait sur TOUT le texte
 * apres le Provider : un Provider sans value suivi, plus loin, d'un
 * `<input value={x} />` quelconque (reliquat du chapitre 6, par exemple)
 * faisait passer cette fonction pour un Provider correctement alimente.
 *
 * `findJsxTagAttrs` attend un nom de balise litteral ; un nom dote comme
 * `ContexteFlotte.Provider` y est insere tel quel dans une regex, ou le `.`
 * agit comme "un caractere quelconque" plutot que le point litteral — sans
 * consequence ici puisqu'on lui passe le nom REELLEMENT trouve a cet endroit
 * du code (le seul caractere qui puisse s'y trouver EST ce point).
 *
 * Renvoie null s'il n'y a pas de Provider, ou pas d'attribut `value` sur SA
 * balise.
 */
function providerValueBody(code: string): string | null {
  const m = providerTagNameRe.exec(code);
  if (!m) return null;

  const tagName = m[1]!;
  const tag = findJsxTagAttrs(code, tagName, m.index);
  if (!tag) return null;

  return extractAttrValue(tag.body, "value");
}

/**
 * Nom de la fonction qui ENGLOBE la position `pos` dans `code` — le
 * composant ou hook dont le corps contient cet appel (ex: l'appel a
 * `useContext` ou le `dispatch(...)` qu'on veut verifier).
 *
 * Necessaire pour scoper une verification ("cette valeur est-elle affichee ?",
 * "dispatch est-il appele ICI ?") au bon composant plutot qu'a tout le
 * fichier : un fichier a plusieurs composants (un Provider ou un AUTRE
 * consommateur ailleurs) ne doit pas laisser le comportement d'un composant
 * en valider un autre.
 *
 * Cherche toutes les declarations `function nom(...) {` et
 * `const nom = (...) => {}` / `const nom = function (...) {}`, retient celles
 * dont le corps (accolades equilibrees via `matchClosing`) contient `pos`, et
 * renvoie la plus imbriquee (la plus petite plage) — au cas ou une fonction
 * en definirait une autre localement.
 */
function enclosingFunctionName(code: string, pos: number): string | null {
  const declRe =
    /(?:function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function\s*)?\([^)]*\)\s*(?:=>)?\s*\{)/g;
  let best: { name: string; start: number; end: number } | null = null;
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(code)) !== null) {
    const name = m[1] ?? m[2];
    if (!name) continue;
    const braceStart = m.index + m[0].length - 1;
    const braceEnd = matchClosing(code, braceStart);
    if (braceEnd === -1) continue;
    if (pos > braceStart && pos < braceEnd && (!best || braceEnd - braceStart < best.end - best.start)) {
      best = { name, start: braceStart, end: braceEnd };
    }
  }
  return best ? best.name : null;
}

/** Noms destructures depuis `useContext(...)`, ou [] si pas de destructuration. */
function contextDestructuredNames(code: string): string[] {
  const m = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*useContext\s*\(/.exec(code);
  if (!m) return [];
  return m[1]!
    .split(",")
    .map((s) => s.split(":")[0]!.trim())
    .filter(Boolean);
}

/** Nom de variable simple affectee depuis `useContext(...)`, ou null. */
function contextVarName(code: string): string | null {
  const m = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useContext\s*\(/.exec(code);
  return m ? m[1]! : null;
}

/**
 * Compte les branches d'action distinctes d'un reducteur : `case 'x':` ou
 * `action.type === 'x'`. Le cas `default` n'est pas compte comme une action.
 */
function countActionBranches(body: string): number {
  const cases = new Set<string>();
  const caseRe = /case\s*['"`]([^'"`]+)['"`]/g;
  let m: RegExpExecArray | null;
  while ((m = caseRe.exec(body)) !== null) cases.add(m[1]!);

  const cmpRe = /action\s*\.\s*type\s*===?\s*['"`]([^'"`]+)['"`]/g;
  while ((m = cmpRe.exec(body)) !== null) cases.add(m[1]!);

  return cases.size;
}

/**
 * Le reducteur a-t-il un repli qui RETOURNE reellement quelque chose pour
 * une action inconnue ?
 *
 * - Reducteur a `switch` : il faut un `default:` dont la branche — le texte
 *   entre `default:` et le `case` suivant (ou la fin du switch) — contient un
 *   `return`. `default: break;` est present textuellement mais ne retourne
 *   rien : rejete, contrairement a l'ancienne verification qui se contentait
 *   de chercher le MOT `default` n'importe ou dans le corps.
 * - Reducteur a base de `if` (pas de `switch`) : on exige que le DERNIER
 *   `return` du corps ne soit suivi que de delimiteurs fermants / `;` —
 *   c'est-a-dire qu'il termine effectivement la fonction. Contrairement a
 *   l'ancienne regex ancree `return\s+etat\s*;?\s*\}?\s*$`, ceci accepte
 *   `return { ...etat };` (qui contient des accolades qu'un `$` ne tolere
 *   pas) et un commentaire de fin de ligne apres le `;` (que
 *   `stripLineComments` ne retire pas, lui, ne retirant que les lignes
 *   ENTIEREMENT commentees).
 */
function hasFallbackReturn(reducerBody: string): boolean {
  if (/\bswitch\s*\(/.test(reducerBody)) {
    const defaultMatch = /\bdefault\s*:/.exec(reducerBody);
    if (!defaultMatch) return false;
    const afterDefault = reducerBody.slice(defaultMatch.index + defaultMatch[0].length);
    const nextCaseIdx = afterDefault.search(/\bcase\b/);
    const branch = nextCaseIdx === -1 ? afterDefault : afterDefault.slice(0, nextCaseIdx);
    return /\breturn\b/.test(branch);
  }

  const re = /\breturn\b/g;
  let lastIdx = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(reducerBody)) !== null) lastIdx = m.index;
  if (lastIdx === -1) return false;

  const exprStart = lastIdx + "return".length;
  const exprEnd = statementEnd(reducerBody, exprStart);
  const rest = reducerBody.slice(exprEnd).replace(/\/\/[^\n]*/g, "");
  return /^[;\s}]*$/.test(rest);
}

export const validators: Validator[] = [
  // Etape 1 : creer le contexte et le diffuser via un Provider.
  (code) => {
    const c = strip(code);

    if (!/\bcreateContext\s*\(/.test(c)) {
      return fail(
        "Cree le contexte au niveau du module : const ContexteFlotte = createContext(null);",
        "structure"
      );
    }

    if (!providerRe.test(c)) {
      return fail(
        "Englobe ton arbre dans le Provider du contexte : <ContexteFlotte.Provider>...</ContexteFlotte.Provider>.",
        "structure"
      );
    }

    if (providerValueBody(c) === null) {
      return fail(
        "Le Provider doit porter une value : <ContexteFlotte.Provider value={{ amiral: 'Vesper' }}>."
      );
    }

    return pass("Diffusion active.", ["o1a", "o1b"]);
  },

  // Etape 2 : consommer le contexte dans un descendant, sans prop.
  (code) => {
    const c = strip(code);

    const call = findBareCallBody(c, "useContext");
    if (!call) {
      return fail(
        "Lis le contexte dans le composant : const { amiral } = useContext(ContexteFlotte);",
        "structure"
      );
    }
    if (call.body.trim().length === 0) {
      return fail("Passe l'objet contexte a useContext, par exemple useContext(ContexteFlotte).");
    }

    // o2b : la valeur lue doit reellement etre affichee, sinon l'etape ne
    // demontre rien. On accepte la destructuration comme l'acces par variable.
    //
    // On scope cette verification au corps du COMPOSANT qui appelle
    // useContext, pas a tout le fichier : sans ca, un `{ amiral: 'Vesper' }`
    // porte par le Provider (qui contient litteralement `amiral`) ou l'objet
    // rendu par un AUTRE composant suffit a faire passer un composant dont la
    // valeur lue n'est jamais affichee.
    const compName = enclosingFunctionName(c, call.start);
    const scope = (compName !== null ? findNamedFunctionBody(c, compName) : null) ?? c;

    // On retire d'abord la ligne de declaration : sans ca, le motif `{ amiral }`
    // de la destructuration elle-meme compterait comme une interpolation JSX, et
    // un composant qui lit le contexte sans jamais l'afficher passerait.
    const withoutDecl = scope.replace(
      /(?:const|let|var)\s*(?:\{[^}]*\}|[A-Za-z_$][\w$]*)\s*=\s*useContext\s*\([^)]*\)\s*;?/g,
      ""
    );

    const names = contextDestructuredNames(scope);
    const varName = contextVarName(scope);

    const rendered =
      names.some((n) => new RegExp(`\\{\\s*${n}\\b`).test(withoutDecl)) ||
      (varName !== null && new RegExp(`\\{\\s*${varName}\\s*\\.`).test(withoutDecl));

    if (!rendered) {
      return fail(
        "Affiche la valeur lue dans le JSX, par exemple <div>Amiral : {amiral}</div>.",
        "logic"
      );
    }

    return pass("Signal recu.", ["o2a", "o2b"]);
  },

  // Etape 3 : un reducteur a deux actions, branche par useReducer.
  (code) => {
    const c = strip(code);

    const call = findBareCallBody(c, "useReducer");
    if (!call) {
      return fail(
        "Branche le reducteur : const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });",
        "structure"
      );
    }

    // On resout le reducteur par SON nom, celui passe en premier argument —
    // plutot que de chercher n'importe quel switch du fichier.
    const reducerName = call.body.split(",")[0]!.trim();
    const reducerBody = /^[A-Za-z_$][\w$]*$/.test(reducerName)
      ? findNamedFunctionBody(c, reducerName)
      : null;

    if (reducerBody === null) {
      return fail(
        "Declare une fonction reducteur(etat, action) et passe-la en premier argument de useReducer.",
        "structure"
      );
    }

    const branches = countActionBranches(reducerBody);
    if (branches < 2) {
      return fail(
        `Ton reducteur ne gere que ${branches} action. Ajoute les deux transitions demandees : monter et descendre.`,
        "logic"
      );
    }

    if (!hasFallbackReturn(reducerBody)) {
      return fail(
        "Ajoute un cas default qui retourne l'etat inchange, sinon une action inconnue effacerait ton etat.",
        "logic"
      );
    }

    if (!/\bdispatch\s*\(/.test(c)) {
      return fail(
        "Envoie une action depuis le composant : dispatch({ type: 'monter' })."
      );
    }

    return pass("Reducteur en ligne.", ["o3a", "o3b"]);
  },

  // Etape 4 : diffuser etat ET dispatch, et agir depuis le consommateur.
  (code) => {
    const c = strip(code);

    if (!findBareCallBody(c, "useReducer")) {
      return fail(
        "Garde useReducer au sommet : c'est lui qui tient l'etat a diffuser.",
        "structure"
      );
    }

    const value = providerValueBody(c);
    if (value === null) {
      return fail(
        "Diffuse l'etat via un Provider : <ContexteAlerte.Provider value={{ etat, dispatch }}>.",
        "structure"
      );
    }
    if (!/\betat\b/.test(value) || !/\bdispatch\b/.test(value)) {
      return fail(
        "La value du Provider doit transporter etat ET dispatch : value={{ etat, dispatch }}. Sans etat les descendants ne peuvent rien lire, sans dispatch ils ne peuvent rien modifier.",
        "logic"
      );
    }

    const call = findBareCallBody(c, "useContext");
    if (!call) {
      return fail(
        "Console doit lire le contexte : const { etat, dispatch } = useContext(ContexteAlerte);",
        "structure"
      );
    }

    // On scope la verification "dispatch est-il declenche ?" au COMPOSANT qui
    // consomme le contexte (celui qui appelle useContext), pas a tout le
    // fichier : un `dispatch(` appele depuis un AUTRE composant (par exemple
    // App, ou dispatch est deja en scope local sans passer par le contexte)
    // ne demontre rien sur le canal qu'on est en train de verifier.
    const consumerName = enclosingFunctionName(c, call.start);
    const consumerBody = (consumerName !== null ? findNamedFunctionBody(c, consumerName) : null) ?? c;

    if (!/\bdispatch\s*\(\s*\{/.test(consumerBody)) {
      return fail(
        "Declenche une transition depuis Console : onClick={() => dispatch({ type: 'monter' })}."
      );
    }

    return pass("Reseau complet.", ["o4a", "o4b"], true);
  },
];
