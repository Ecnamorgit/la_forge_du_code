import { expect, test } from "@playwright/test";

import { sandboxOriginFor } from "../lib/sandbox/sandbox-origin";

/**
 * The app's strict CSP (audit EXE-03): learners' code runs on a dedicated
 * origin, which allows a nonce-based script-src with
 * `'strict-dynamic'`, without `'unsafe-inline'` or `'unsafe-eval'`.
 *
 * The CSP is only sent in production (`proxy.ts`, `CSP_ACTIVE` guard): this
 * test skips itself against `pnpm dev` and only runs with E2E_PROD=1, as in CI.
 * Where `csp.test.ts` checks the policy text, this one checks the header
 * actually sent and that the page hydrates without violations.
 */
test("under the production CSP, script-src uses a nonce and no unsafe-*", async ({ page }) => {
  // Only real CSP violations count. A MIME type refusal comes from
  // nosniff: locally, the Vercel analytics script is missing.
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/content security policy/i.test(m.text())) violations.push(m.text());
  });

  const response = await page.goto("/");
  const csp = response?.headers()["content-security-policy"];

  test.skip(
    !csp,
    "No CSP: run this test against `pnpm build && pnpm start` (E2E_PROD=1), not `pnpm dev`."
  );

  const scriptSrc = csp!
    .split(";")
    .map((d) => d.trim())
    .find((d) => d === "script-src" || d.startsWith("script-src "));

  expect(scriptSrc, "The CSP has no script-src directive.").toBeDefined();
  expect(scriptSrc, "script-src must carry a nonce.").toMatch(/'nonce-[^']+'/);
  expect(scriptSrc, "script-src must carry 'strict-dynamic'.").toContain("'strict-dynamic'");
  expect(scriptSrc, "script-src must no longer carry 'unsafe-inline' (finding EXE-03).").not.toContain(
    "'unsafe-inline'"
  );
  expect(scriptSrc, "script-src must no longer carry 'unsafe-eval' (finding EXE-03).").not.toContain(
    "'unsafe-eval'"
  );

  // frame-src allows the sandbox origin, and only that one: both
  // origins are derived from the request, with no hard-coded list.
  const app = new URL(page.url()).origin;
  const sandboxOrigin = sandboxOriginFor(app);
  const frameSrc = csp!
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("frame-src "));
  expect(frameSrc, "frame-src must be exactly 'self' + the sandbox origin.").toBe(
    `frame-src 'self' ${sandboxOrigin}`
  );

  // Conversely, the sandbox only accepts being framed by the app.
  const doc = await page.request.get(`${sandboxOrigin}/bac-a-sable/html`);
  const sandboxCspHeader = doc.headers()["content-security-policy"] ?? "";
  const ancestors = sandboxCspHeader
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("frame-ancestors "));
  expect(ancestors, "the sandbox frame-ancestors must be exactly the app origin.").toBe(
    `frame-ancestors ${app}`
  );

  // The page hydrates under the strict CSP without logging any violation.
  await expect(page.getByRole("link", { name: /connexion|se connecter/i }).first()).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(1000);
  expect(violations, `CSP violations on load:\n${violations.join("\n")}`).toEqual([]);
});
