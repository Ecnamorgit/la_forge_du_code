import { expect, test, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Sets the code directly on the Monaco model, which would otherwise close
 * brackets, braces and quotes a second time while typing. The React `onChange`
 * is fired just as for real input.
 *
 * The preview iframe has an opaque origin; `frameLocator` still reaches it,
 * because it goes through the protocol rather than the same-origin policy.
 */
async function setEditorCode(page: Page, code: string) {
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 15_000 });
  const result = await page.evaluate((value) => {
    const monaco = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
    if (!monaco) return "no-monaco";
    const models = monaco.editor.getModels();
    if (!models.length) return "no-models";
    models[0].setValue(value);
    return "ok";
  }, code);
  if (result !== "ok") {
    throw new Error(`Could not set the Monaco editor code: ${result}`);
  }
}

/**
 * The tests share the same user and run serially: as soon as a step is
 * validated, chapter 7 resumes at the next step. Yet they all deploy
 * `Reacteur`, the component mounted by step 1, so we go back to it through
 * the pagination.
 *
 * `ChapterClient` shows step 1 until `GET /api/me` has responded,
 * hence waiting for that response before reading the buttons' state.
 */
async function goToChapter7AndBackToStep1(page: Page) {
  const hydration = page
    .waitForResponse((r) => r.url().includes("/api/me") && r.request().method() === "GET", {
      timeout: 15_000,
    })
    .catch(() => null);
  await page.goto("/learn/react/chapitre-7");
  await hydration;
  // Let React process the response before reading the DOM.
  await page.waitForTimeout(250);

  const previousButton = page.getByRole("button", { name: /précédent/i });
  await expect(previousButton).toBeVisible({ timeout: 15_000 });
  // The chapter has 4 steps: 3 clicks always lead back to the first one.
  for (let i = 0; i < 3; i++) {
    if (await previousButton.isDisabled()) break;
    await previousButton.click();
  }
  await expect(previousButton).toBeDisabled();
}

test.describe("React preview", () => {
  // Shared session written by global-setup (per-IP login limit).
  test.use({ storageState: STORAGE_STATE });

  /**
   * The preview is loaded via `src` from a dedicated origin, which confines its
   * permissive CSP and leaves the app with a strict CSP (audit EXE-03).
   * Locally, this origin is `127.0.0.1` when the app is on `localhost`, and
   * vice versa.
   */
  test("the preview is loaded from an origin separate from the app", async ({ page }) => {
    await goToChapter7AndBackToStep1(page);

    const iframe = page.locator('iframe[title="Aperçu du composant React"]');
    await expect(iframe).toHaveCount(1);
    const src = await iframe.getAttribute("src");
    expect(src, "the preview must be loaded via src, no longer via srcDoc").not.toBeNull();

    const previewOrigin = new URL(src!).origin;
    const appOrigin = new URL(page.url()).origin;
    expect(new URL(src!).pathname).toBe("/bac-a-sable");
    expect(
      previewOrigin,
      `the preview (${previewOrigin}) must be served from an origin other than the app (${appOrigin})`
    ).not.toBe(appOrigin);
  });

  test("mounts the component and reacts to a click", async ({ page }) => {
    await goToChapter7AndBackToStep1(page);

    await expect(page.getByText(/Déploie pour voir ton composant/i)).toBeVisible();

    await setEditorCode(
      page,
      "function useCompteur() {\n" +
        "const [n, setN] = useState(0);\n" +
        "return { n, augmenter: () => setN(n + 1) };\n" +
        "}\n" +
        "function Reacteur() {\n" +
        "const { n, augmenter } = useCompteur();\n" +
        "return <button onClick={augmenter}>Poussee : {n}</button>;\n" +
        "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    const preview = page.frameLocator('iframe[title="Aperçu du composant React"]');
    const button = preview.getByRole("button", { name: /Poussee : 0/ });
    await expect(button).toBeVisible({ timeout: 15_000 });

    // This code also validates the step: the success banner appears ~500 ms
    // after deploying and its overlay would intercept the next click. We
    // close it via its backdrop (`onDimClick`), which, unlike the "SUIVANT"
    // (next) button, does not advance the step and so does not unmount the preview.
    const bannerBackdrop = page.locator(".animate-overlay-in");
    await page.waitForTimeout(900);
    if (await bannerBackdrop.isVisible().catch(() => false)) {
      // The card is centered on the backdrop: click in a corner.
      await bannerBackdrop.click({ position: { x: 5, y: 5 } });
    }

    await button.click();
    await expect(preview.getByRole("button", { name: /Poussee : 1/ })).toBeVisible();
  });

  /** The exception propagates through the iframe's error boundary. */
  test("an exception thrown during render is reported to the panel", async ({ page }) => {
    await goToChapter7AndBackToStep1(page);

    await setEditorCode(
      page,
      "function Reacteur() {\n" +
        "throw new Error('Reacteur en surchauffe');\n" +
        "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    await expect(page.getByText(/Erreur à l'exécution/i)).toBeVisible({ timeout: 15_000 });
    // The learner's message comes through as is, not a generic message.
    await expect(page.getByText(/Reacteur en surchauffe/)).toBeVisible();
  });

  test("chapter 4, which is exempt, shows no preview", async ({ page }) => {
    await page.goto("/learn/react/chapitre-4");
    await expect(page.locator('iframe[title="Aperçu du composant React"]')).toHaveCount(0);
  });

  /**
   * Static safeguard in lib/sandbox/loop-guard.ts: once sent, the
   * loop could freeze the whole tab. A timeout here signals
   * that the safeguard was bypassed or removed.
   */
  test("an infinite loop is rejected before sending, and the next deploy works", async ({
    page,
  }) => {
    await goToChapter7AndBackToStep1(page);

    await setEditorCode(
      page,
      "function Reacteur() {\n" + "while (true) {}\n" + "return null;\n" + "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    // Exact match: the message body also contains "boucle sans fin" (endless loop).
    await expect(page.getByText("Boucle sans fin", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/risque de ne jamais se terminer/i)).toBeVisible();

    // Had the code been sent, the frozen tab would prevent this deploy.
    await setEditorCode(
      page,
      "function Reacteur() {\n" + "return <button>Systeme retabli</button>;\n" + "}"
    );
    await page.getByRole("button", { name: /deployer/i }).click();

    const preview = page.frameLocator('iframe[title="Aperçu du composant React"]');
    await expect(preview.getByRole("button", { name: /Systeme retabli/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * The React bundle is loaded from an origin other than the iframe's opaque
   * one: an exception thrown during an onClick may only expose
   * "Script error.". So the handler reads the message from the error object,
   * the 5th argument of window.onerror.
   */
  test("an uncaught exception in an onClick reports a real message", async ({
    page,
  }) => {
    await goToChapter7AndBackToStep1(page);

    await setEditorCode(
      page,
      "function Reacteur() {\n" +
        "return <button onClick={() => { throw new Error('boom explicite'); }}>Declencher</button>;\n" +
        "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    const preview = page.frameLocator('iframe[title="Aperçu du composant React"]');
    const button = preview.getByRole("button", { name: /Declencher/i });
    await expect(button).toBeVisible({ timeout: 15_000 });
    await button.click();

    const errorPanel = page.getByText(/Erreur à l'exécution/i);
    await expect(errorPanel).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText(/^Script error\.$/)).toHaveCount(0);
    await expect(page.getByText(/boom explicite/i)).toBeVisible();
  });
});
