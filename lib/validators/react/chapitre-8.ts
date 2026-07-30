import type { Validator } from "@/data/courses/html/types";
import {
  stripLineComments,
  fail,
  pass,
  findBareCallBody,
  findNamedFunctionBody,
  matchClosing,
} from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

/** Un `<X.Provider ...>` est-il present ? */
const providerRe = /<\s*[A-Za-z_$][\w$]*\s*\.\s*Provider\b/;

/**
 * Extrait le contenu de l'attribut `value={...}` du premier `<X.Provider>`.
 *
 * On equilibre les accolades plutot que de couper au premier `}` : un
 * `value={{ etat, dispatch }}` en contient deux niveaux, et un `[^}]*`
 * s'arreterait au milieu en laissant croire que `dispatch` est absent.
 *
 * Renvoie null s'il n'y a pas de Provider, ou pas d'attribut `value`.
 */
function providerValueBody(code: string): string | null {
  const tagIdx = code.search(providerRe);
  if (tagIdx === -1) return null;

  const m = /value\s*=\s*\{/.exec(code.slice(tagIdx));
  if (!m) return null;

  const braceIdx = tagIdx + m.index + m[0].length - 1;
  const close = matchClosing(code, braceIdx);
  if (close === -1) return null;
  return code.slice(braceIdx + 1, close);
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
    // On retire d'abord la ligne de declaration : sans ca, le motif `{ amiral }`
    // de la destructuration elle-meme compterait comme une interpolation JSX, et
    // un composant qui lit le contexte sans jamais l'afficher passerait.
    const withoutDecl = c.replace(
      /(?:const|let|var)\s*(?:\{[^}]*\}|[A-Za-z_$][\w$]*)\s*=\s*useContext\s*\([^)]*\)\s*;?/g,
      ""
    );

    const names = contextDestructuredNames(c);
    const varName = contextVarName(c);

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

    if (!/\bdefault\s*:/.test(reducerBody) && !/return\s+etat\s*;?\s*\}?\s*$/.test(reducerBody)) {
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
    if (!/\bdispatch\b/.test(value)) {
      return fail(
        "La value du Provider doit transporter dispatch, sinon les descendants pourront lire l'etat sans jamais le modifier.",
        "logic"
      );
    }

    if (!findBareCallBody(c, "useContext")) {
      return fail(
        "Console doit lire le contexte : const { etat, dispatch } = useContext(ContexteAlerte);",
        "structure"
      );
    }

    if (!/\bdispatch\s*\(\s*\{/.test(c)) {
      return fail(
        "Declenche une transition depuis Console : onClick={() => dispatch({ type: 'monter' })}."
      );
    }

    return pass("Reseau complet.", ["o4a", "o4b"], true);
  },
];
