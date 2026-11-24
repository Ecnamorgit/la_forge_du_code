import type { ValidationResult, ValidatorContext } from "@/data/courses/html/types";
import { stripComments } from "../javascript/_utils";

/**
 * Helpers for the "agent-ia" validators. The learner's agent really runs in
 * the JavaScript sandbox, against a simulated model shipped in the start
 * code: validation reads the console output (`ctx.logs`), with a few source
 * checks so that a hard-coded `console.log` is not enough.
 */

export const ko = (msg: string, tone?: ValidationResult["tone"]): ValidationResult =>
  tone ? { ok: false, msg, tone } : { ok: false, msg };

export const ok = (msg: string, objList: string[], final = false): ValidationResult =>
  final ? { ok: true, msg, objList, final: true } : { ok: true, msg, objList };

/**
 * Common preamble: a context is required (these chapters are judged on a
 * run) and a runtime error fails the step. Returns the failure, or null.
 */
export function preflight(ctx: ValidatorContext | undefined): ValidationResult | null {
  if (!ctx) return ko("Exécution requise.");
  if (ctx.error) return ko(`Erreur d'exécution : ${ctx.error}`);
  return null;
}

/** True if a log line equals `text` (surrounding whitespace ignored). */
export const logged = (logs: string[], text: string): boolean =>
  logs.some((l) => l.trim() === text);

/** True if every line of `expected` appears in `logs`, in that order. */
export function loggedInOrder(logs: string[], expected: string[]): boolean {
  let from = 0;
  for (const text of expected) {
    const idx = logs.findIndex((l, i) => i >= from && l.trim() === text);
    if (idx === -1) return false;
    from = idx + 1;
  }
  return true;
}

/** Source without comments, so the start-code instructions never match. */
export const source = (code: string): string => stripComments(code);

/** True if `name` is declared as a function (declaration or arrow/const). */
export function declaresFunction(code: string, name: string): boolean {
  return new RegExp(
    `\\bfunction\\s+${name}\\s*\\(|\\b(?:const|let|var)\\s+${name}\\s*=\\s*(?:function\\b|\\(?[\\w\\s,]*\\)?\\s*=>)`
  ).test(code);
}

/** True if `name(` is called outside its own `function name(` declaration. */
export function calls(code: string, name: string): boolean {
  const withoutDeclaration = code.replace(new RegExp(`\\bfunction\\s+${name}\\s*\\(`, "g"), "");
  return new RegExp(`\\b${name}\\s*\\(`).test(withoutDeclaration);
}
