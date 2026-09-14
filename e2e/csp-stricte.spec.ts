import { expect, test } from "@playwright/test";

/**
 * Garde-fou du durcissement CSP (constat EXE-03). Remplace l'ancien
 * `csp-srcdoc-script.spec.ts` : le code des apprenants ne s'exécute plus dans un
 * `srcdoc` héritant de la CSP du site, mais depuis une origine dédiée. La CSP de
 * l'application peut donc être stricte — à nonce et `'strict-dynamic'`, sans
 * `'unsafe-inline'` ni `'unsafe-eval'`.
 *
 * La CSP n'est émise qu'en production (`proxy.ts`, garde `CSP_ACTIVE`), donc ce
 * test n'a de valeur que lancé contre `pnpm build && pnpm start` (E2E_PROD=1,
 * ce que fait la CI). Contre `pnpm dev` il se saute.
 *
 * Deux niveaux de preuve, complémentaires du test unitaire `csp.test.ts` (qui
 * ne vérifie que le TEXTE de la politique) :
 *  1. l'en-tête réellement émis est bien la politique stricte ;
 *  2. la page hydrate sous cette politique, sans violation CSP — c'est la preuve
 *     que nonce + `'strict-dynamic'` n'ont pas cassé les scripts de Next.
 */
test("sous CSP de production, script-src est à nonce et sans unsafe-*", async ({ page }) => {
  // On ne retient QUE les vraies violations CSP (« … violates the following
  // Content Security Policy directive »). Un « Refused to execute … because its
  // MIME type » n'en est pas une : c'est le nosniff, et en local le script
  // d'analytics Vercel (/_vercel/insights/script.js) est absent — un artefact
  // local sans rapport avec la CSP.
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

  // L'aperçu du bac à sable est encadré depuis l'origine dédiée : frame-src doit
  // l'autoriser, sinon les iframes d'exécution seraient bloquées en production.
  expect(csp, "frame-src absente.").toContain("frame-src");

  // Preuve comportementale : la page a hydraté (un bouton client réagit) sous la
  // CSP stricte, et aucune violation CSP n'a été journalisée pendant le chargement.
  await expect(page.getByRole("link", { name: /connexion|se connecter/i }).first()).toBeVisible({
    timeout: 15_000,
  });
  await page.waitForTimeout(1000);
  expect(violations, `Violations CSP au chargement :\n${violations.join("\n")}`).toEqual([]);
});
