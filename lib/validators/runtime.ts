/**
 * Chapters whose validators judge an execution, not text: they
 * read `ctx.logs` or `ctx.sql`, produced by the browser sandbox, and
 * fail if called without a context.
 *
 * The list is kept chapter by chapter: chapters 11 and 12 of
 * `javascript` are static (fake API host). A new chapter is
 * static by default; if it depends on execution, the integrity test fails
 * until it is registered here.
 *
 * These chapters are excluded from the invariant "the start code never
 * validates its own step" (`parcours-integrite.test.ts`). The server cannot
 * revalidate them either without running the learner's code: their success
 * remains declared by the browser (`lib/step-proof.ts`).
 */
export const RUNTIME_CHAPTERS: ReadonlySet<string> = new Set<string>([
  // javascript 1 to 10: validated on `ctx.logs`.
  ...Array.from({ length: 10 }, (_, i) => `javascript/chapitre-${i + 1}`),
  // sql: validated on the result of a real query (`ctx.sql`).
  "sql/chapitre-1",
]);

export function isRuntimeChapter(course: string, chapter: string): boolean {
  return RUNTIME_CHAPTERS.has(`${course}/${chapter}`);
}
