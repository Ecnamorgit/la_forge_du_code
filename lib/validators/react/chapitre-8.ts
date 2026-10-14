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

/** Is a `<X.Provider ...>` present? */
const providerRe = /<\s*[A-Za-z_$][\w$]*\s*\.\s*Provider\b/;

/** Same pattern, capturing the tag's dotted name. */
const providerTagNameRe = /<\s*([A-Za-z_$][\w$]*\s*\.\s*Provider)\b/;

/**
 * Contents of the `value={...}` attribute of the first `<X.Provider>`, searched
 * for in that tag's attributes only: an `<input value={x} />` further down
 * must not count. Returns null without a Provider or without `value` on its tag.
 *
 * The dotted name (`ContexteFlotte.Provider`) is inserted as is into the regex
 * of `findJsxTagAttrs`, where `.` matches any character: harmless here,
 * since it is the very name found at that position.
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
 * Name of the function (component or hook) whose body contains position
 * `pos`, to restrict a check to the right component: in a file with
 * several components, one component's behavior must not validate another.
 *
 * Among the `function nom(...) {}`, `const nom = (...) => {}` and
 * `const nom = function (...) {}` declarations that contain `pos`, returns the
 * innermost one.
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

/** Names destructured from `useContext(...)`, or [] without destructuring. */
function contextDestructuredNames(code: string): string[] {
  const m = /(?:const|let|var)\s*\{([^}]*)\}\s*=\s*useContext\s*\(/.exec(code);
  if (!m) return [];
  return m[1]!
    .split(",")
    .map((s) => s.split(":")[0]!.trim())
    .filter(Boolean);
}

/** Name of the variable assigned from `useContext(...)`, or null. */
function contextVarName(code: string): string | null {
  const m = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useContext\s*\(/.exec(code);
  return m ? m[1]! : null;
}

/**
 * Counts a reducer's distinct action branches: `case 'x':` or
 * `action.type === 'x'`. `default` does not count as an action.
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
 * Does the reducer return something for an unknown action?
 *
 * With a `switch`, the text after `default:` (up to the next `case`) must
 * contain a `return`: `default: break;` is not enough. Without a `switch`, the
 * last `return` of the body must be followed only by `;`, closing braces
 * or an end-of-line comment, which `stripLineComments` does not
 * remove.
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
  // Step 1: create the context and broadcast it via a Provider.
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

  // Step 2: consume the context in a descendant, without a prop.
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

    // o2b: the value read must be displayed, via destructuring or via a
    // variable. The search is limited to the component that calls useContext: the
    // Provider's `{ amiral: 'Vesper' }` or another component's rendering must
    // not count.
    const compName = enclosingFunctionName(c, call.start);
    const scope = (compName !== null ? findNamedFunctionBody(c, compName) : null) ?? c;

    // Without removing the declaration, the destructuring's `{ amiral }`
    // would count as a JSX interpolation.
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

  // Step 3: a two-action reducer, wired up with useReducer.
  (code) => {
    const c = strip(code);

    const call = findBareCallBody(c, "useReducer");
    if (!call) {
      return fail(
        "Branche le reducteur : const [etat, dispatch] = useReducer(reducteur, { niveau: 0 });",
        "structure"
      );
    }

    // The reducer is resolved by its name (first argument of useReducer), not
    // by whichever switch comes first.
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

  // Step 4: broadcast etat and dispatch, and act from the consumer.
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

    // Only the consumer component counts: a `dispatch(` called elsewhere
    // (in App, where dispatch is in local scope) does not go through the context.
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
