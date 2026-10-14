import { parse } from "acorn";
import { simple } from "acorn-walk";

/**
 * Loop protection for the learner's code (audit EXE-02).
 *
 * In Chromium, the sandboxed iframe that runs this code can share the page's
 * thread: an infinite loop then freezes the whole tab, and no timeout set
 * by the page can recover from it. A Web Worker is not an
 * option: several chapters manipulate the DOM.
 *
 * So we instrument the code before running it, like CodePen or JSBin do:
 * every loop body starts with a call to a guard, which throws an
 * error when the current synchronous task exceeds the timeout.
 *
 * The elapsed time is reset by a microtask, which only runs once the
 * synchronous task has finished: an infinite loop therefore ends up throwing,
 * and a React render triggered later starts from zero.
 */

/** Timeout beyond which a looping synchronous task is interrupted. */
export const LOOP_TIMEOUT_MS = 3000;

const GUARD = "__gardeBoucle__";
const START = "__debutBoucle__";

export const LOOP_INTERRUPTED_MESSAGE =
  "Boucle interrompue après 3 s : elle ne s'arrête jamais. Vérifie sa condition d'arrêt.";

function prelude(timeoutMs: number): string {
  return (
    `var ${START} = 0;` +
    `function ${GUARD}() {` +
    `var t = Date.now();` +
    `if (!${START}) { ${START} = t; Promise.resolve().then(function () { ${START} = 0; }); }` +
    `if (t - ${START} > ${timeoutMs}) { throw new RangeError(${JSON.stringify(LOOP_INTERRUPTED_MESSAGE)}); }` +
    `}\n`
  );
}

interface AstNode {
  start: number;
  end: number;
  type: string;
}

interface LoopNode extends AstNode {
  body: AstNode;
}

/**
 * Returns the code with a guard at the start of every loop body, preceded
 * by the guard's definition. Code without loops is returned unchanged.
 * Unparsable code (syntax error) is returned unchanged too:
 * running it will report the error, and there is no loop to guard.
 */
export function guardLoops(code: string, options: { timeoutMs?: number } = {}): string {
  let ast;
  try {
    ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
      allowReturnOutsideFunction: true,
    });
  } catch {
    return code;
  }

  const insertions: { position: number; text: string }[] = [];
  const guardNode = (node: unknown) => {
    const { body } = node as LoopNode;
    if (body.type === "BlockStatement") {
      insertions.push({ position: body.start + 1, text: `${GUARD}();` });
    } else {
      // Body without braces (`while (x) y();`): wrap it in a block.
      insertions.push({ position: body.start, text: `{${GUARD}();` });
      insertions.push({ position: body.end, text: "}" });
    }
  };
  simple(ast, {
    WhileStatement: guardNode,
    DoWhileStatement: guardNode,
    ForStatement: guardNode,
    ForInStatement: guardNode,
    ForOfStatement: guardNode,
  });

  if (insertions.length === 0) return code;

  // From the end to the start: each insertion leaves the positions still
  // to be processed intact.
  insertions.sort((a, b) => b.position - a.position);
  let result = code;
  for (const { position, text } of insertions) {
    result = result.slice(0, position) + text + result.slice(position);
  }
  return prelude(options.timeoutMs ?? LOOP_TIMEOUT_MS) + result;
}

const INLINE_SCRIPT = /(<script\b(?![^>]*\bsrc\s*=)[^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
const TYPE_DECLARE = /\btype\s*=/i;
const TYPE_JAVASCRIPT = /\btype\s*=\s*["']?(?:text|application)\/javascript\b/i;

/**
 * Guards the inline scripts of an HTML document (HTML curriculum preview).
 * External scripts (`src`) and scripts of another type (JSON, templates,
 * modules) are left unchanged.
 */
export function guardHtmlScripts(html: string, options: { timeoutMs?: number } = {}): string {
  return html.replace(INLINE_SCRIPT, (match, openingTag: string, body: string, closingTag: string) => {
    if (TYPE_DECLARE.test(openingTag) && !TYPE_JAVASCRIPT.test(openingTag)) return match;
    return openingTag + guardLoops(body, options) + closingTag;
  });
}
