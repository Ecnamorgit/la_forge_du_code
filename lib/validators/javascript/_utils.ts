/**
 * Helpers for the JS validators: static checks on the source code and
 * checks on the run (logs, error, last value).
 */

export function stripComments(code: string): string {
  // A keyword mentioned in a comment must not count.
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

export function hasKeyword(code: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(stripComments(code));
}

export function hasConsoleLog(code: string): boolean {
  return /\bconsole\s*\.\s*(?:log|info|warn|error|debug)\s*\(/.test(
    stripComments(code)
  );
}

/** True if a log line equals `text` (leading/trailing whitespace ignored). */
export function logsInclude(logs: string[], text: string): boolean {
  return logs.some((l) => l.trim() === text.trim());
}

/** True if a log line contains `substring`. */
export function logsContain(logs: string[], substring: string): boolean {
  return logs.some((l) => l.includes(substring));
}
