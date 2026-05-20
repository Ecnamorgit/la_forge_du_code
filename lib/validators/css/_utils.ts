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

/** Check if a given selector exists and its body contains a property name. */
export function hasProperty(
  css: string,
  selector: string,
  property: string
): boolean {
  const body = ruleBody(css, selector);
  if (body === null) return false;
  const propRe = new RegExp(`\\b${property}\\s*:`, "i");
  return propRe.test(body);
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
  const propRe = new RegExp(
    `\\b${property}\\s*:\\s*([^;]+?)\\s*(?:;|$)`,
    "i"
  );
  const match = body.match(propRe);
  if (!match) return false;
  return valueRegex.test(match[1]);
}
