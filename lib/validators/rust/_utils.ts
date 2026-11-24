import { stripLineComments } from "../_static-utils";

/**
 * Helpers for the Rust validators. Rust is not executed in the browser: the
 * source is analysed by pattern matching, as in the other static courses.
 */

/** Removes full-line `//` comments, so start-code instructions never match. */
export const strip = (code: string): string => stripLineComments(code, "//");

/** True if the program still declares its entry point. */
export const hasMain = (code: string): boolean => /\bfn\s+main\s*\(\s*\)/.test(code);

/** True if a `println!` call is present (macro, with its `!`). */
export const hasPrintln = (code: string): boolean => /\bprintln!\s*\(/.test(code);

/** True if `println` is called like a function, without the macro `!`. */
export const hasPrintlnWithoutBang = (code: string): boolean =>
  /\bprintln\s*\(/.test(code);

/**
 * True if `name(` is called somewhere other than in its own `fn name(`
 * declaration, which contains the same text.
 */
export function isCalled(code: string, name: string): boolean {
  const withoutDeclaration = code.replace(new RegExp(`\\bfn\\s+${name}\\s*\\(`, "g"), "");
  return new RegExp(`\\b${name}\\s*\\(`).test(withoutDeclaration);
}

/** True if `.unwrap()` or `.expect(...)` is used to force a value out. */
export const forcesValue = (code: string): boolean =>
  /\.\s*(?:unwrap|expect)\s*\(/.test(code);
