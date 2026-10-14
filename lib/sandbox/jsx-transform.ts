/**
 * JSX to JS transformation, in the browser.
 *
 * Sucrase rather than Babel standalone: it covers JSX, TypeScript and
 * modules, which is all the curriculum needs, for about a tenth of the size.
 * Imported dynamically to stay out of the initial bundle: only a React chapter
 * loads it, on the first deployment.
 *
 * The classic JSX transform emits `React.createElement` calls, since `React`
 * is a global in the preview iframe.
 */

export type JsxTransformResult =
  | { ok: true; js: string }
  | { ok: false; error: string };

export async function transformJsx(code: string): Promise<JsxTransformResult> {
  try {
    const { transform } = await import("sucrase");
    const { code: js } = transform(code, {
      transforms: ["jsx"],
      jsxRuntime: "classic",
      production: true,
    });
    return { ok: true, js };
  } catch (err) {
    // Invalid syntax: the message is returned to the caller, which shows it to
    // the learner.
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
