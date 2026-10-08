/**
 * Inspection du CSS d'un bloc <style> par expressions régulières (pas un vrai
 * parseur CSS).
 */

/** Retire les commentaires CSS, qui pourraient sinon tromper les vérifications. */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function extractStyleContent(code: string): string | null {
  const match = code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  return match ? stripCssComments(match[1]) : null;
}

/** Corps de la première règle CSS du sélecteur donné, ou null. */
export function ruleBody(css: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(?:^|[\\s,}])${escaped}\\s*\\{([^}]*)\\}`,
    "i"
  );
  const match = css.match(re);
  return match ? match[1] : null;
}

/**
 * Motif d'un nom de propriété en début de déclaration. `\b` ne suffit pas :
 * dans `background-color`, le `-` est un non-mot, donc `\bcolor` y trouverait
 * `color`. Le lookbehind refuse un `-` ou un caractère de mot devant.
 */
function propertyRegex(property: string, suffix = ""): RegExp {
  return new RegExp(`(?<![-\\w])${property}\\s*:${suffix}`, "i");
}

/** Vrai si une règle `selector` existe et déclare `property`. */
export function hasProperty(
  css: string,
  selector: string,
  property: string
): boolean {
  const body = ruleBody(css, selector);
  if (body === null) return false;
  return propertyRegex(property).test(body);
}

/** Comme `hasProperty`, en testant aussi la valeur déclarée avec `valueRegex`. */
export function hasPropertyWithValue(
  css: string,
  selector: string,
  property: string,
  valueRegex: RegExp
): boolean {
  const body = ruleBody(css, selector);
  if (body === null) return false;
  const match = body.match(propertyRegex(property, `\\s*([^;]+?)\\s*(?:;|$)`));
  if (!match) return false;
  return valueRegex.test(match[1]);
}
