import type { ValidationResult } from "@/data/courses/html/types";

/**
 * Shared helpers for STATIC validators — i.e. courses that don't execute in the
 * JS sandbox (git, sql, python, react, typescript, nodejs, ...). Validation is
 * performed by pattern-matching the source code the student typed.
 */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip WHOLE-LINE comments that begin with the given marker (e.g. "//", "#",
 * "--"). Inline/trailing comments are intentionally preserved so embedded URLs
 * such as `https://...` inside real code stay intact. This removes the French
 * instructional comments shipped in each step's `startCode` so they can never
 * trigger a false-positive match.
 */
export function stripLineComments(code: string, marker: string): string {
  const re = new RegExp(`^\\s*${escapeRegExp(marker)}.*$`, "gm");
  return code.replace(re, "");
}

/** Count how many times a pattern occurs in the code. */
export function countMatches(code: string, re: RegExp): number {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  return (code.match(new RegExp(re.source, flags)) ?? []).length;
}

export function fail(msg: string): ValidationResult {
  return { ok: false, msg };
}

export function pass(
  msg: string,
  objList: string[],
  final = false
): ValidationResult {
  return final ? { ok: true, msg, objList, final: true } : { ok: true, msg, objList };
}
