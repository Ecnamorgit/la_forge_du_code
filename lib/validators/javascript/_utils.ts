/**
 * Helpers for JS validators. Combine static checks on the source code with
 * dynamic checks on the execution context (logs / error / lastValue).
 */

export function stripComments(code: string): string {
  // Remove line and block comments to avoid false positives in keyword checks.
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

/** True if any captured log line equals `text` (after trim). */
export function logsInclude(logs: string[], text: string): boolean {
  return logs.some((l) => l.trim() === text.trim());
}

/** True if any captured log line contains `substring`. */
export function logsContain(logs: string[], substring: string): boolean {
  return logs.some((l) => l.includes(substring));
}
