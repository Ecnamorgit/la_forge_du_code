/**
 * Helpers to inspect CSS inside a <style>...</style> block.
 * Pragmatic regex-based — good enough for an initiation curriculum,
 * not a full parser.
 */

/** Strip /* ... *\/ comments so they can't be used to fool property checks. */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function extractStyleContent(code: string): string | null {
  const match = code.match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  return match ? stripCssComments(match[1]) : null;
}

/** Returns the body of a CSS rule for the given selector, or null. */
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
 * Regex matching a property name at the start of a declaration.
 *
 * `\b` is not enough: in `background-color`, the `-` before `color` is a
 * non-word character, so `\bcolor` matches inside it. A step asking for
 * `h1 { color }` would then accept `h1 { background-color: red }` — a wrong
 * answer marked correct. The lookbehind rejects a preceding `-` or word char.
 */
function propertyRegex(property: string, suffix = ""): RegExp {
  return new RegExp(`(?<![-\\w])${property}\\s*:${suffix}`, "i");
}

/** Check if a given selector exists and its body contains a property name. */
export function hasProperty(
  css: string,
  selector: string,
  property: string
): boolean {
  const body = ruleBody(css, selector);
  if (body === null) return false;
  return propertyRegex(property).test(body);
}

/** Property + value (any non-empty value). */
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
