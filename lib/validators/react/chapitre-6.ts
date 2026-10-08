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
 * Renvoie le code à inspecter pour une prop handler JSX (onChange, onSubmit...).
 * Un identifiant nu (`handleSubmit`) ou une flèche qui délègue à un nom
 * (`(e) => handleSubmit(e)`) mène au corps de la fonction nommée ; sinon, ou si
 * ce nom n'est pas une fonction trouvable (un setter comme `setNom`), la valeur
 * est renvoyée telle quelle.
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
  // Étape 1 : <input value={...} onChange={...}> dont le handler appelle un
  // setter (pas seulement value= et onChange= présents dans le fichier).
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
    // onChange peut aussi désigner un handler nommé (`onChange={handleChange}`),
    // la forme enseignée à l'étape 2 : on suit cette indirection avant de
    // chercher l'appel au setter.
    const handlerSource = resolveHandlerSource(c, onChangeValue);
    if (!/\bset[A-Z]\w*\s*\(/.test(handlerSource)) {
      return fail(
        "Ton onChange existe mais ne met à jour aucun état : appelle le setter (ex: setNom(e.target.value)) à l'intérieur."
      );
    }
    return pass("Console de saisie restaurée.", ["o1a", "o1b"]);
  },

  // Étape 2 : état objet mis à jour par spread, avec une clé calculée
  // ([name]: value) ou les deux champs gérés séparément.
  //
  // Chaque appel à setFormulaire(...) est jugé séparément : un seul appel sans
  // spread perd des données, même si un autre est correct. La couverture des
  // champs, elle, se lit sur l'ensemble des appels (nom et email peuvent avoir
  // chacun leur handler).
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
        // Cet appel écrase l'état, quels que soient les autres.
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

  // Étape 3 : onSubmit sur le <form> (pas onClick sur le bouton), et le
  // handler désigné doit appeler e.preventDefault().
  (code) => {
    const c = strip(code);
    const formTag = findJsxTagAttrs(c, "form");
    if (!formTag || !/\bonSubmit\s*=\s*\{/.test(formTag.body)) {
      return fail(
        "Attache le gestionnaire de soumission sur le <form> lui-même (onSubmit={...}), pas sur le bouton."
      );
    }
    const onSubmitValue = extractAttrValue(formTag.body, "onSubmit") ?? "";
    // Suit une référence nue (onSubmit={handleSubmit}) comme une flèche qui
    // délègue (onSubmit={(e) => handleSubmit(e)}) : le preventDefault peut vivre
    // dans la fonction nommée.
    const handlerSource = resolveHandlerSource(c, onSubmitValue);
    if (!/\.preventDefault\s*\(\s*\)/.test(handlerSource)) {
      return fail(
        "Empêche le rechargement de la page : appelle e.preventDefault() dans le gestionnaire attaché à onSubmit."
      );
    }
    return pass("Transmission maîtrisée.", ["o3a", "o3b"]);
  },

  // Étape 4 : disabled doit dériver de l'état du formulaire, pas d'une valeur
  // figée.
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
