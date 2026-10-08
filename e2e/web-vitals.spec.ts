import { expect, test } from "@playwright/test";
import { STORAGE_STATE } from "./global-setup";

/**
 * Mesure des Core Web Vitals (CF-17), à la demande seulement : ces chiffres
 * dépendent de la machine et feraient échouer la CI au hasard.
 *
 *   MESURE_VITALS=1 E2E_PROD=1 pnpm test:e2e --grep "Core Web Vitals"
 *
 * `E2E_PROD=1` est requis : en développement, le bundle n'est ni minifié ni
 * découpé comme en production. LCP et FCP ne sont enregistrés que pour une
 * page visible.
 */

test.skip(
  process.env.MESURE_VITALS !== "1",
  "Mesure sur demande — MESURE_VITALS=1 E2E_PROD=1 pnpm test:e2e --grep \"Core Web Vitals\""
);

/** Seuils « bon » de web.dev. */
const SEUILS = {
  /** Largest Contentful Paint. */
  lcp: 2500,
  /** Cumulative Layout Shift. */
  cls: 0.1,
  /** Interaction to Next Paint. */
  inp: 200,
} as const;

interface Releve {
  lcp: number;
  cls: number;
  fcp: number;
  interactionMax: number;
}

/**
 * Observateurs installés avant tout script de la page : LCP et FCP surviennent
 * pendant le chargement.
 */
const SONDE = `
  window.__vitals = { lcp: 0, cls: 0, fcp: 0, interactionMax: 0 };
  new PerformanceObserver((l) => {
    const e = l.getEntries();
    window.__vitals.lcp = e[e.length - 1].startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.name === "first-contentful-paint") window.__vitals.fcp = e.startTime;
    }
  }).observe({ type: "paint", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (!e.hadRecentInput) window.__vitals.cls += e.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  // INP se calcule sur de vraies interactions. On retient la plus lente, ce qui
  // est plus severe que le 98e centile qu'utilise la definition officielle.
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.interactionId && e.duration > window.__vitals.interactionMax) {
        window.__vitals.interactionMax = e.duration;
      }
    }
  }).observe({ type: "event", buffered: true, durationThreshold: 16 });
`;

async function mesurer(page: import("@playwright/test").Page, chemin: string): Promise<Releve> {
  await page.addInitScript(SONDE);
  await page.goto(chemin, { waitUntil: "load" });

  // Le navigateur cesse d'enregistrer le LCP à la première interaction : sur
  // une page lente à peindre (Monaco), on laisse d'abord la page se poser.
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2000);

  const apresChargement = await page.evaluate(() => ({ ...window.__vitals }));

  // De vraies interactions, sans lesquelles INP n'a rien à mesurer.
  await page.mouse.move(200, 300);
  await page.mouse.click(200, 300);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1000);

  const apresInteraction = await page.evaluate(() => ({ ...window.__vitals }));

  return {
    // LCP, FCP et CLS sont ceux du chargement, avant toute interaction.
    lcp: apresChargement.lcp,
    fcp: apresChargement.fcp,
    cls: apresChargement.cls,
    interactionMax: apresInteraction.interactionMax,
  };
}

function rapporter(page: string, r: Releve): void {
  const verdict = (valeur: number, seuil: number) => (valeur <= seuil ? "OK  " : "HORS");
  const interaction =
    r.interactionMax > 0
      ? `${Math.round(r.interactionMax)} ms  ${verdict(r.interactionMax, SEUILS.inp)} (seuil ${SEUILS.inp})`
      : "NON MESUREE (aucune interaction n'a depasse 16 ms)";

  console.log(
    `\n${page}\n` +
      `  FCP ${Math.round(r.fcp)} ms\n` +
      `  LCP ${Math.round(r.lcp)} ms        ${verdict(r.lcp, SEUILS.lcp)} (seuil ${SEUILS.lcp})\n` +
      `  CLS ${r.cls.toFixed(4)}            ${verdict(r.cls, SEUILS.cls)} (seuil ${SEUILS.cls})\n` +
      `  Interaction la plus lente ${interaction}`
  );
}

function verifier(nom: string, r: Releve): void {
  // Un LCP à zéro signifie que la sonde n'a rien capté.
  expect(r.lcp, `${nom} — aucun LCP capte, la mesure ne prouve rien`).toBeGreaterThan(0);

  expect(r.lcp, `${nom} — LCP`).toBeLessThanOrEqual(SEUILS.lcp);
  expect(r.cls, `${nom} — CLS`).toBeLessThanOrEqual(SEUILS.cls);

  // Zéro signifie qu'aucune interaction n'a franchi le seuil de 16 ms de
  // l'observateur, et non une réponse instantanée.
  if (r.interactionMax > 0) {
    expect(r.interactionMax, `${nom} — interaction la plus lente`).toBeLessThanOrEqual(
      SEUILS.inp
    );
  }
}

test.describe("Core Web Vitals", () => {
  test("page d'accueil", async ({ page }) => {
    const r = await mesurer(page, "/");
    rapporter("Accueil /", r);
    verifier("Accueil", r);
  });

  test("page de lecon", async ({ page }) => {
    const r = await mesurer(page, "/learn/html/chapitre-1");
    rapporter("Lecon /learn/html/chapitre-1", r);
    verifier("Lecon", r);
  });

  test.describe("connecte", () => {
    test.use({ storageState: STORAGE_STATE });

    test("tableau de bord", async ({ page }) => {
      const r = await mesurer(page, "/dashboard");
      rapporter("Tableau de bord /dashboard", r);
      verifier("Tableau de bord", r);
    });
  });
});

declare global {
  interface Window {
    __vitals: Releve;
  }
}
