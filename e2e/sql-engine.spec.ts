import { test, expect } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * The SQL engine loads in the browser (audit EXE-07). The bundler picks
 * the "browser" variant of sql.js, which requests `sql-wasm-browser.wasm`; the
 * unit tests, under Node, use the default variant.
 */

test.use({ storageState: STORAGE_STATE });

test("the SQL course runs a query and validates the step", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/learn/sql/chapitre-1");
  const editor = page.locator(".monaco-editor").first();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(
    "CREATE TABLE pilotes (id INTEGER PRIMARY KEY, nom VARCHAR(50) NOT NULL, niveau INTEGER DEFAULT 1);\n" +
      "INSERT INTO pilotes (id, nom, niveau) VALUES (1, 'Lia', 5);"
  );
  await page.getByRole("button", { name: /DEPLOYER/ }).click();

  await test.step("the step is validated", async () => {
    await expect.soft(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
  });

  await test.step("no engine loading error", async () => {
    expect.soft(errors.filter((e) => /wasm/i.test(e))).toEqual([]);
  });
});
