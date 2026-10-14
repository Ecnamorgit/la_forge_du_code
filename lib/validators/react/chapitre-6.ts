import type { Validator } from "@/data/courses/html/types";
import {
  stripLineComments,
  fail,
  pass,
  findJsxTagAttrs,
  extractAttrValue,
  findBareCallBody,
  findNamedFunctionBody,
} from "../_static-utils";

const strip = (code: string) => stripLineComments(code, "//");

/**
 * Returns the code to inspect for a JSX handler prop (onChange, onSubmit...).
 * A bare identifier (`handleSubmit`) or an arrow that delegates to a name
 * (`(e) => handleSubmit(e)`) leads to the body of the named function; otherwise,
 * or if that name is not a function we can find (a setter such as `setNom`),
 * the value is returned as is.
 */
function resolveHandlerSource(code: string, attrValue: string): string {
  const identMatch = /^\s*([A-Za-z_$][\w$]*)\s*$/.exec(attrValue);
  const delegateMatch = identMatch
    ? null
    : /^\s*\([^)]*\)\s*=>\s*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*;?\s*$/.exec(attrValue);
  const name = identMatch ? identMatch[1] : delegateMatch ? delegateMatch[1] : null;
  if (!name) return attrValue;
  const fnBody = findNamedFunctionBody(code, name);
  return fnBody !== null ? fnBody : attrValue;
}

export const validators: Validator[] = [
  // Step 1: <input value={...} onChange={...}> whose handler calls a
  // setter (not just value= and onChange= present somewhere in the file).
  (code) => {
    const c = strip(code);
    const tag = findJsxTagAttrs(c, "input");
    if (!tag || !/\bvalue\s*=\s*\{/.test(tag.body)) {
      return fail(
        "Garde l'input contrôlé par React : value={nom} doit rester branché sur l'état."
      );
    }
    const onChangeValue = extractAttrValue(tag.body, "onChange");
    if (onChangeValue === null) {
      return fail(
        "Le Spectre a coupé l'écoute du clavier : ajoute onChange={(e) => setNom(e.target.value)} sur l'input."
      );
    }
    // onChange can also point to a named handler (`onChange={handleChange}`),
    // the form taught in step 2: follow that indirection before looking
    // for the setter call.
    const handlerSource = resolveHandlerSource(c, onChangeValue);
    if (!/\bset[A-Z]\w*\s*\(/.test(handlerSource)) {
      return fail(
        "Ton onChange existe mais ne met à jour aucun état : appelle le setter (ex: setNom(e.target.value)) à l'intérieur."
      );
    }
    return pass("Console de saisie restaurée.", ["o1a", "o1b"]);
  },

  // Step 2: object state updated with spread, with a computed key
  // ([name]: value) or both fields handled separately.
  //
  // Each setFormulaire(...) call is judged on its own: a single call without
  // spread loses data, even if another one is correct. Field coverage, on the
  // other hand, is read across all calls (nom and email can each have their
  // own handler).
  (code) => {
    const c = strip(code);
    if (!/useState\s*\(\s*\{/.test(c)) {
      return fail(
        "Regroupe nom et email dans un seul état objet : useState({ nom: '', email: '' })."
      );
    }
    let match = findBareCallBody(c, "setFormulaire");
    if (!match) {
      return fail(
        "Mets à jour l'état via le setter de l'objet (setFormulaire({ ...formulaire, ... }))."
      );
    }
    let hasBadCall = false;
    let hasComputedKey = false;
    const literalKeys = new Set<string>();
    while (match) {
      const spread = /\.\.\.\s*[A-Za-z_$][\w$]*/.test(match.body);
      if (!spread) {
        // This call overwrites the state, whatever the others do.
        hasBadCall = true;
      } else {
        if (/\[\s*[\w.]+\s*\]\s*:/.test(match.body)) hasComputedKey = true;
        for (const m of match.body.matchAll(/\b(nom|email)\s*:/g)) {
          literalKeys.add(m[1]);
        }
      }
      match = findBareCallBody(c, "setFormulaire", match.end);
    }
    if (hasBadCall) {
      return fail(
        "Mets à jour l'état par copie : setFormulaire({ ...formulaire, ... }), jamais en écrasant l'objet entier. Vérifie que TOUS tes appels à setFormulaire font le spread, pas seulement certains."
      );
    }
    if (!hasComputedKey && literalKeys.size < 2) {
      return fail(
        "Mets à jour le bon champ : une clé calculée ([e.target.name]: valeur), ou nom et email gérés séparément."
      );
    }
    return pass("État regroupé dans un seul objet.", ["o2a", "o2b"]);
  },

  // Step 3: onSubmit on the <form> (not onClick on the button), and the
  // designated handler must call e.preventDefault().
  (code) => {
    const c = strip(code);
    const formTag = findJsxTagAttrs(c, "form");
    if (!formTag || !/\bonSubmit\s*=\s*\{/.test(formTag.body)) {
      return fail(
        "Attache le gestionnaire de soumission sur le <form> lui-même (onSubmit={...}), pas sur le bouton."
      );
    }
    const onSubmitValue = extractAttrValue(formTag.body, "onSubmit") ?? "";
    // Follows a bare reference (onSubmit={handleSubmit}) as well as a delegating
    // arrow (onSubmit={(e) => handleSubmit(e)}): the preventDefault can live
    // in the named function.
    const handlerSource = resolveHandlerSource(c, onSubmitValue);
    if (!/\.preventDefault\s*\(\s*\)/.test(handlerSource)) {
      return fail(
        "Empêche le rechargement de la page : appelle e.preventDefault() dans le gestionnaire attaché à onSubmit."
      );
    }
    return pass("Transmission maîtrisée.", ["o3a", "o3b"]);
  },

  // Step 4: disabled must derive from the form state, not from a fixed
  // value.
  (code) => {
    const c = strip(code);
    const buttonTag = findJsxTagAttrs(c, "button");
    if (!buttonTag || !/\bdisabled\s*=\s*\{/.test(buttonTag.body)) {
      return fail("Ajoute un attribut disabled={...} sur le bouton d'envoi.");
    }
    const value = (extractAttrValue(buttonTag.body, "disabled") ?? "").trim();
    if (/^(true|false)$/.test(value)) {
      return fail(
        "disabled={false} (ou {true}) est figé : calcule la condition à partir de l'état, ex: disabled={!formulaire.nom || !formulaire.email}."
      );
    }
    if (!/\bformulaire\b/.test(value)) {
      return fail(
        "La condition de disabled doit dériver de l'état du formulaire (formulaire.nom, formulaire.email...), pas d'une valeur arbitraire."
      );
    }
    return pass("Console verrouillée tant que le formulaire est incomplet.", ["o4a", "o4b"], true);
  },
];
