import { test, expect, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Steps 1 and 2 of JavaScript chapter 1, since HTML progress is observed
 * by other specs. Two steps, because the briefing's `reprise` order targets 1
 * or 2 steps depending on the day's draw (lib/quests.ts).
 */
const SOLUTIONS_JS_CH1 = [
  'console.log("Bonjour, station Nebula");',
  'let cadet = "Nova";\nconsole.log(cadet);',
];

interface DailyOrder {
  id: string;
  slot: string;
  label: string;
  progress: number;
  target: number;
  done: boolean;
}

interface ServerState {
  totalXp: number;
  completedSteps: Record<string, number[]>;
  briefing: { quests: DailyOrder[]; complete: boolean } | null;
  liaison: { streak: number; activeToday: boolean };
}

/** State as seen by the server, not read from the DOM. */
async function readState(page: Page): Promise<ServerState> {
  const res = await page.request.get("/api/me");
  expect(res.ok(), `GET /api/me a échoué : ${res.status()}`).toBeTruthy();
  return res.json();
}

/**
 * Sets the code directly on the Monaco model, which would otherwise close
 * quotes and parentheses a second time while typing. The React `onChange` is
 * fired just as for real input.
 */
async function setEditorCode(page: Page, code: string): Promise<void> {
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  const result = await page.evaluate((value) => {
    const monaco = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
    if (!monaco) return "no-monaco";
    // `ChapterWorkspace` is remounted on every step: `getModels()` may still
    // hold the previous model, hence the preference for the mounted editor.
    const editors = monaco.editor.getEditors();
    const model = editors.length ? editors[0].getModel() : (monaco.editor.getModels()[0] ?? null);
    if (!model) return "no-models";
    model.setValue(value);
    return "ok";
  }, code);
  expect(result, "impossible de poser le code sur le modèle Monaco").toBe("ok");
}

/**
 * Opens a chapter and brings the pagination back to its step 1.
 *
 * Useful when Playwright retries the test without replaying `globalSetup`:
 * already validated steps would make `ChapterClient` resume further on. It
 * shows step 1 until `GET /api/me` has responded, hence waiting for
 * that response before reading the buttons' state.
 */
async function openChapterAtStep1(page: Page, url: string): Promise<void> {
  const hydration = page
    .waitForResponse(
      (r) => r.url().includes("/api/me") && r.request().method() === "GET",
      { timeout: 15_000 }
    )
    .catch(() => null);
  await page.goto(url);
  await hydration;

  const previousButton = page.getByRole("button", { name: /précédent/i });
  await expect(previousButton).toBeVisible({ timeout: 30_000 });
  // The chapter has 4 steps: 3 clicks always lead back to the first one.
  for (let i = 0; i < 3; i++) {
    if (await previousButton.isDisabled()) break;
    await previousButton.click();
  }
  await expect(previousButton).toBeDisabled();
}

/** Escapes a string so it can be inserted verbatim into a RegExp. */
function escapeForRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * End-to-end walkthrough of the daily loop (CF-12), using the shared session
 * written by global-setup.
 */
test.describe("daily loop", () => {
  test.use({ storageState: STORAGE_STATE });

  test.beforeEach(async ({ page }) => {
    // E2E_USER is recreated without an avatar, and /dashboard shows the title
    // screen until an avatar is chosen: we set one through the API.
    const res = await page.request.post("/api/me/avatar", {
      data: { species: "humain", uniformColor: "cyan", role: "pilote" },
    });
    expect(res.ok(), `POST /api/me/avatar a échoué : ${res.status()}`).toBeTruthy();
  });

  test("the liaison banner and the briefing show up, and an order leads to a mission", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page.getByText(/jour.? de liaison/i)).toBeVisible();

    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    const missionLink = page.getByRole("link", { name: /mission/i }).first();
    await expect(missionLink).toBeVisible();
    await missionLink.click();
    await expect(page).toHaveURL(/\/learn\//);
  });

  test("the old \"Récupérer le bonus\" (claim bonus) button of the daily mission is gone", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /récupérer le bonus/i })).toHaveCount(0);
  });

  test("the armory shows locked items with their unlock condition", async ({ page }) => {
    await page.goto("/avatar");

    // An item not yet earned stays visible with its condition (UnlockShelf.tsx);
    // a new cadet always has at least one locked frame of this kind.
    await expect(
      page.getByText(/encore .* de liaison|encore .* ordre/i).first()
    ).toBeVisible();
  });

  /**
   * Briefing shown, steps validated, order completed, XP persisted. The final
   * state is read from the server (`GET /api/me`), the source of truth for XP,
   * then found again in the dashboard.
   */
  test("two validated steps complete a daily order, and the XP is persisted", async ({
    page,
  }) => {
    // Three navigations, one Monaco mount and two sandbox runs:
    // the default 30 s budget is too tight.
    test.slow();

    const before = await readState(page);
    const alreadyDone = new Set(before.completedSteps["javascript/chapitre-1"] ?? []);

    await page.goto("/dashboard");
    await expect(page.getByText(/ordre du jour|briefing complet/i)).toBeVisible();

    await openChapterAtStep1(page, "/learn/javascript/chapitre-1");

    for (const [step, code] of SOLUTIONS_JS_CH1.entries()) {
      // `ChapterClient` saves without awaiting (`void completeStep(...)`), and
      // only if the step was not already validated. So we only wait for the
      // request if it is going to be sent, otherwise the full timeout would elapse.
      const saved = alreadyDone.has(step)
        ? null
        : page
            .waitForResponse(
              (r) => r.url().includes("/api/me/step") && r.request().method() === "POST",
              { timeout: 20_000 }
            )
            .catch(() => null);

      await setEditorCode(page, code);
      await page.getByRole("button", { name: /DEPLOYER/ }).click();

      await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
      if (saved) await saved;
      const nextButton = page.getByRole("button", { name: /SYSTÈME SUIVANT/ });
      await expect(nextButton).toBeVisible({ timeout: 15_000 });
      await nextButton.click();
    }

    const after = await readState(page);

    expect(after.completedSteps["javascript/chapitre-1"]).toEqual(
      expect.arrayContaining([0, 1])
    );

    // An already validated step earns no XP: the strict comparison
    // assumes at least one of the two was new.
    expect(after.totalXp).toBeGreaterThan(0);
    if (alreadyDone.size < SOLUTIONS_JS_CH1.length) {
      expect(after.totalXp).toBeGreaterThan(before.totalXp);
    }

    // The liaison only counts real work, not visiting the dashboard.
    expect(after.liaison.activeToday).toBe(true);

    // The `reprise` order is always drawn, with a target of at most 2
    // (lib/quests.ts).
    const resumeQuest = after.briefing?.quests.find((q) => q.slot === "reprise");
    expect(resumeQuest, "le briefing doit toujours porter un ordre de reprise").toBeDefined();
    expect(resumeQuest!.progress).toBeGreaterThanOrEqual(resumeQuest!.target);
    expect(resumeQuest!.done).toBe(true);

    // `QuestLine` prefixes the completed order with a ✓; the label comes from the server.
    await page.goto("/dashboard");
    await expect(
      page.getByText(new RegExp(`✓\\s*${escapeForRegex(resumeQuest!.label)}`))
    ).toBeVisible();
  });
});
