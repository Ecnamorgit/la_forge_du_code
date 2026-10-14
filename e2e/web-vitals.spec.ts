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
const THRESHOLDS = {
  /** Largest Contentful Paint. */
  lcp: 2500,
  /** Cumulative Layout Shift. */
  cls: 0.1,
  /** Interaction to Next Paint. */
  inp: 200,
} as const;

interface Measurement {
  lcp: number;
  cls: number;
  fcp: number;
  interactionMax: number;
}

/**
 * Observateurs installés avant tout script de la page : LCP et FCP surviennent
 * pendant le chargement.
 */
const PROBE = `
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

async function measure(page: import("@playwright/test").Page, pagePath: string): Promise<Measurement> {
  await page.addInitScript(PROBE);
  await page.goto(pagePath, { waitUntil: "load" });

  // Le navigateur cesse d'enregistrer le LCP à la première interaction : sur
  // une page lente à peindre (Monaco), on laisse d'abord la page se poser.
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2000);

  const afterLoad = await page.evaluate(() => ({ ...window.__vitals }));

  // De vraies interactions, sans lesquelles INP n'a rien à measure.
  await page.mouse.move(200, 300);
  await page.mouse.click(200, 300);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1000);

  const afterInteraction = await page.evaluate(() => ({ ...window.__vitals }));

  return {
    // LCP, FCP et CLS sont ceux du chargement, avant toute interaction.
    lcp: afterLoad.lcp,
    fcp: afterLoad.fcp,
    cls: afterLoad.cls,
    interactionMax: afterInteraction.interactionMax,
  };
}

function report(page: string, r: Measurement): void {
  const verdict = (value: number, threshold: number) => (value <= threshold ? "OK  " : "HORS");
  const interaction =
    r.interactionMax > 0
      ? `${Math.round(r.interactionMax)} ms  ${verdict(r.interactionMax, THRESHOLDS.inp)} (seuil ${THRESHOLDS.inp})`
      : "NON MESUREE (aucune interaction n'a depasse 16 ms)";

  console.log(
    `\n${page}\n` +
      `  FCP ${Math.round(r.fcp)} ms\n` +
      `  LCP ${Math.round(r.lcp)} ms        ${verdict(r.lcp, THRESHOLDS.lcp)} (seuil ${THRESHOLDS.lcp})\n` +
      `  CLS ${r.cls.toFixed(4)}            ${verdict(r.cls, THRESHOLDS.cls)} (seuil ${THRESHOLDS.cls})\n` +
      `  Interaction la plus lente ${interaction}`
  );
}

function checkThresholds(pageName: string, r: Measurement): void {
  // Un LCP à zéro signifie que la sonde n'a rien capté.
  expect(r.lcp, `${pageName} — aucun LCP capte, la mesure ne prouve rien`).toBeGreaterThan(0);

  expect(r.lcp, `${pageName} — LCP`).toBeLessThanOrEqual(THRESHOLDS.lcp);
  expect(r.cls, `${pageName} — CLS`).toBeLessThanOrEqual(THRESHOLDS.cls);

  // Zéro signifie qu'aucune interaction n'a franchi le seuil de 16 ms de
  // l'observateur, et non une réponse instantanée.
  if (r.interactionMax > 0) {
    expect(r.interactionMax, `${pageName} — interaction la plus lente`).toBeLessThanOrEqual(
      THRESHOLDS.inp
    );
  }
}

test.describe("Core Web Vitals", () => {
  test("page d'accueil", async ({ page }) => {
    const r = await measure(page, "/");
    report("Accueil /", r);
    checkThresholds("Accueil", r);
  });

  test("page de lecon", async ({ page }) => {
    const r = await measure(page, "/learn/html/chapitre-1");
    report("Lecon /learn/html/chapitre-1", r);
    checkThresholds("Lecon", r);
  });

  test.describe("connecte", () => {
    test.use({ storageState: STORAGE_STATE });

    test("tableau de bord", async ({ page }) => {
      const r = await measure(page, "/dashboard");
      report("Tableau de bord /dashboard", r);
      checkThresholds("Tableau de bord", r);
    });
  });
});

declare global {
  interface Window {
    __vitals: Measurement;
  }
}
