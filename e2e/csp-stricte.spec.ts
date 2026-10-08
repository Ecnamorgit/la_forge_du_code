import { expect, test } from "@playwright/test";

import { sandboxOriginFor } from "../lib/sandbox/sandbox-origin";

/**
 * CSP stricte de l'application (audit EXE-03) : le code des apprenants
 * s'exécute sur une origine dédiée, ce qui permet un script-src à nonce et
 * `'strict-dynamic'`, sans `'unsafe-inline'` ni `'unsafe-eval'`.
 *
 * La CSP n'est émise qu'en production (`proxy.ts`, garde `CSP_ACTIVE`) : ce
 * test se saute contre `pnpm dev` et ne sert qu'avec E2E_PROD=1, comme en CI.
 * Là où `csp.test.ts` vérifie le texte de la politique, il vérifie l'en-tête
 * réellement émis et l'hydratation de la page sans violation.
 */
test("sous CSP de production, script-src est à nonce et sans unsafe-*", async ({ page }) => {
  // Seules les vraies violations CSP comptent. Un refus pour type MIME vient
  // de nosniff : en local, le script d'analytics Vercel est absent.
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/content security policy/i.test(m.text())) violations.push(m.text());
  });

  const response = await page.goto("/");
  const csp = response?.headers()["content-security-policy"];

  test.skip(
    !csp,
    "CSP absente : lance ce test contre `pnpm build && pnpm start` (E2E_PROD=1), pas `pnpm dev`."
  );

  const scriptSrc = csp!
    .split(";")
    .map((d) => d.trim())
    .find((d) => d === "script-src" || d.startsWith("script-src "));

  expect(scriptSrc, "La CSP ne contient pas de directive script-src.").toBeDefined();
  expect(scriptSrc, "script-src doit porter un nonce.").toMatch(/'nonce-[^']+'/);
  expect(scriptSrc, "script-src doit porter 'strict-dynamic'.").toContain("'strict-dynamic'");
  expect(scriptSrc, "script-src ne doit plus porter 'unsafe-inline' (constat EXE-03).").not.toContain(
    "'unsafe-inline'"
  );
  expect(scriptSrc, "script-src ne doit plus porter 'unsafe-eval' (constat EXE-03).").not.toContain(
    "'unsafe-eval'"
  );

  // frame-src autorise l'origine du bac à sable, et elle seule : les deux
  // origines sont dérivées de la requête, sans liste codée en dur.
  const app = new URL(page.url()).origin;
  const bacASable = sandboxOriginFor(app);
  const frameSrc = csp!
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("frame-src "));
  expect(frameSrc, "frame-src doit valoir exactement 'self' + l'origine du bac à sable.").toBe(
    `frame-src 'self' ${bacASable}`
  );

  // Réciproquement, le bac à sable n'accepte d'être encadré que par l'app.
  const doc = await page.request.get(`${bacASable}/bac-a-sable/html`);
  const cspBac = doc.headers()["content-security-policy"] ?? "";
  const ancetres = cspBac
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("frame-ancestors "));
  expect(ancetres, "frame-ancestors du bac à sable doit valoir exactement l'origine de l'app.").toBe(
    `frame-ancestors ${app}`
  );

  // La page hydrate sous la CSP stricte sans journaliser de violation.
  await expect(page.getByRole("link", { name: /connexion|se connecter/i }).first()).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(1000);
  expect(violations, `Violations CSP au chargement :\n${violations.join("\n")}`).toEqual([]);
});
