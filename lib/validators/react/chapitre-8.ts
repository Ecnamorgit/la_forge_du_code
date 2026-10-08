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

/** Un `<X.Provider ...>` est-il présent ? */
const providerRe = /<\s*[A-Za-z_$][\w$]*\s*\.\s*Provider\b/;

/** Même motif, en capturant le nom pointé de la balise. */
const providerTagNameRe = /<\s*([A-Za-z_$][\w$]*\s*\.\s*Provider)\b/;

/**
 * Contenu de l'attribut `value={...}` du premier `<X.Provider>`, cherché dans
 * les attributs de cette balise seulement : un `<input value={x} />` plus loin
 * ne doit pas compter. Renvoie null sans Provider ou sans `value` sur sa balise.
 *
 * Le nom pointé (`ContexteFlotte.Provider`) est inséré tel quel dans la regex
 * de `findJsxTagAttrs`, où `.` vaut n'importe quel caractère : sans effet ici,
 * puisque c'est le nom trouvé à cet endroit même.
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
 * Nom de la fonction (composant ou hook) dont le corps contient la position
 * `pos`, pour limiter une vérification au bon composant : dans un fichier à
 * plusieurs composants, le comportement de l'un ne doit pas en valider un autre.
 *
 * Parmi les déclarations `function nom(...) {}`, `const nom = (...) => {}` et
 * `const nom = function (...) {}` qui contiennent `pos`, renvoie la plus
 * imbriquée.
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

/** Noms déstructurés depuis `useContext(...)`, ou [] sans déstructuration. */
function contextDestructuredNames(code: string): string[] {
  const m = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*useContext\s*\(/.exec(code);
  if (!m) return [];
  return m[1]!
    .split(",")
    .map((s) => s.split(":")[0]!.trim())
    .filter(Boolean);
}

/** Nom de la variable affectée depuis `useContext(...)`, ou null. */
function contextVarName(code: string): string | null {
  const m = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useContext\s*\(/.exec(code);
  return m ? m[1]! : null;
}

/**
 * Compte les branches d'action distinctes d'un réducteur : `case 'x':` ou
 * `action.type === 'x'`. `default` ne compte pas comme une action.
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
 * Le réducteur retourne-t-il quelque chose pour une action inconnue ?
 *
 * Avec un `switch`, le texte qui suit `default:` (jusqu'au `case` suivant) doit
 * contenir un `return` : `default: break;` ne suffit pas. Sans `switch`, le
 * dernier `return` du corps ne doit être suivi que de `;`, d'accolades
 * fermantes ou d'un commentaire de fin de ligne, que `stripLineComments` ne
 * retire pas.
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
  // Étape 1 : créer le contexte et le diffuser via un Provider.
  (code) => {
    const c = strip(code);

    if (!/\bcreateContext\s*\(/.test(c)) {
      return fail(
        "Crée le contexte au niveau du module : const ContexteFlotte = createContext(null);",
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

  // Étape 2 : consommer le contexte dans un descendant, sans prop.
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
      return fail("Passe l'objet contexte à useContext, par exemple useContext(ContexteFlotte).");
    }

    // o2b : la valeur lue doit être affichée, par déstructuration ou via une
    // variable. La recherche se limite au composant qui appelle useContext : le
    // `{ amiral: 'Vesper' }` du Provider ou le rendu d'un autre composant ne
    // doivent pas compter.
    const compName = enclosingFunctionName(c, call.start);
    const scope = (compName !== null ? findNamedFunctionBody(c, compName) : null) ?? c;

    // Sans retirer la déclaration, le `{ amiral }` de la déstructuration
    // compterait comme une interpolation JSX.
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

    return pass("Signal reçu.", ["o2a", "o2b"]);
  },

  // Étape 3 : un réducteur à deux actions, branché par useReducer.
  (code) => {
    const c = strip(code);

    const call = findBareCallBody(c, "useReducer");
    if (!call) {
      return fail(
        "Branche le reducteur : const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });",
        "structure"
      );
    }

    // Le réducteur est résolu par son nom (premier argument de useReducer), pas
    // par le premier switch venu.
    const reducerName = call.body.split(",")[0]!.trim();
    const reducerBody = /^[A-Za-z_$][\w$]*$/.test(reducerName)
      ? findNamedFunctionBody(c, reducerName)
      : null;

    if (reducerBody === null) {
      return fail(
        "Déclare une fonction reducteur(etat, action) et passe-la en premier argument de useReducer.",
        "structure"
      );
    }

    const branches = countActionBranches(reducerBody);
    if (branches < 2) {
      return fail(
        `Ton reducteur ne gère que ${branches} action. Ajoute les deux transitions demandées : monter et descendre.`,
        "logic"
      );
    }

    if (!hasFallbackReturn(reducerBody)) {
      return fail(
        "Ajoute un cas default qui retourne l'état inchangé, sinon une action inconnue effacerait ton état.",
        "logic"
      );
    }

    if (!/\bdispatch\s*\(/.test(c)) {
      return fail(
        "Envoie une action depuis le composant : dispatch({ type: 'monter' })."
      );
    }

    return pass("Réducteur en ligne.", ["o3a", "o3b"]);
  },

  // Étape 4 : diffuser etat et dispatch, et agir depuis le consommateur.
  (code) => {
    const c = strip(code);

    if (!findBareCallBody(c, "useReducer")) {
      return fail(
        "Garde useReducer au sommet : c'est lui qui tient l'état à diffuser.",
        "structure"
      );
    }

    const value = providerValueBody(c);
    if (value === null) {
      return fail(
        "Diffuse l'état via un Provider : <ContexteAlerte.Provider value={{ etat, dispatch }}>.",
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

    // Seul le composant consommateur compte : un `dispatch(` appelé ailleurs
    // (dans App, où dispatch est en portée locale) ne passe pas par le contexte.
    const consumerName = enclosingFunctionName(c, call.start);
    const consumerBody = (consumerName !== null ? findNamedFunctionBody(c, consumerName) : null) ?? c;

    if (!/\bdispatch\s*\(\s*\{/.test(consumerBody)) {
      return fail(
        "Déclenche une transition depuis Console : onClick={() => dispatch({ type: 'monter' })}."
      );
    }

    return pass("Réseau complet.", ["o4a", "o4b"], true);
  },
];
