/**
 * Inspects the CSS of a <style> block with regular expressions (not a real
 * CSS parser).
 */

/** Strips CSS comments, which could otherwise fool the checks. */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function extractStyleContent(code: string): string | null {
  const match = code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  return match ? stripCssComments(match[1]) : null;
}

/** Body of the first CSS rule for the given selector, or null. */
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
 * Pattern for a property name at the start of a declaration. `\b` is not enough:
 * in `background-color`, the `-` is a non-word character, so `\bcolor` would
 * match `color` there. The lookbehind rejects a preceding `-` or word character.
 */
function propertyRegex(property: string, suffix = ""): RegExp {
  return new RegExp(`(?<![-\\w])${property}\\s*:${suffix}`, "i");
}

/** True if a `selector` rule exists and declares `property`. */
export function hasProperty(
  css: string,
  selector: string,
  property: string
): boolean {
  const body = ruleBody(css, selector);
  if (body === null) return false;
  return propertyRegex(property).test(body);
}

/** Like `hasProperty`, but also tests the declared value against `valueRegex`. */
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
