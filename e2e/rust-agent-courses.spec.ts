import { test, expect, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * The Rust and "Agent IA" courses, end to end.
 *
 * Rust is the only course analysed without any preview: the editor must load
 * Monaco's Rust mode and the output panel must not mount the HTML iframe.
 * "Agent IA" really runs the learner's agent in the JavaScript sandbox, so its
 * validation depends on the console output coming back from the iframe.
 */

test.use({ storageState: STORAGE_STATE });

/**
 * Replaces the editor's content through Monaco's model. Scripted keyboard
 * input is not reliable for multi-line JavaScript: auto-closing brackets and
 * auto-indent rewrite it (a stray `]` ends up after the code).
 */
async function replaceEditorContent(page: Page, code: string) {
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });
  await page.evaluate((value) => {
    const monaco = (
      window as unknown as {
        monaco: { editor: { getModels(): Array<{ setValue(v: string): void }> } };
      }
    ).monaco;
    monaco.editor.getModels()[0].setValue(value);
  }, code);
}

test("the catalog lists both courses as complete courses", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.getByRole("link", { name: /Rust/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Agent IA/ }).first()).toBeVisible();
});

test("the Rust course analyses the code without a preview and validates the step", async ({
  page,
}) => {
  await page.goto("/learn/rust/chapitre-1");
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 30_000 });

  await test.step("the workspace is in Rust mode", async () => {
    await expect(page.getByText("main.rs")).toBeVisible();
    await expect(page.getByText("Analyse de la forge")).toBeVisible();
    await expect(page.locator('iframe[title="Apercu"]')).toHaveCount(0);
  });

  await test.step("the untouched start code is refused", async () => {
    await page.getByRole("button", { name: /DEPLOYER/ }).click();
    await expect(page.getByText(/println!/).last()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("SYSTÈME EN LIGNE")).toHaveCount(0);
  });

  await test.step("the solution is accepted", async () => {
    await replaceEditorContent(page, 'fn main() {\n    println!("Forge en ligne");\n}');
    await page.getByRole("button", { name: /DEPLOYER/ }).click();
    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
  });
});

test("the Agent IA course runs the agent in the sandbox and validates on its output", async ({
  page,
}) => {
  await page.goto("/learn/agent-ia/chapitre-1");
  await replaceEditorContent(
    page,
    [
      "const messages = [",
      '  { role: "system", content: "Tu es ORBI, copilote de la station Nebula." },',
      '  { role: "user", content: "ORBI, tu me reçois ?" },',
      "];",
      "console.log(messages.length);",
      "for (const message of messages) {",
      "  console.log(message.role);",
      "}",
    ].join("\n")
  );
  await page.getByRole("button", { name: /DEPLOYER/ }).click();

  await test.step("the console shows what the code printed", async () => {
    await expect(page.getByText("Sortie console")).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: /^>\s*system$/ })).toBeVisible({
      timeout: 15_000,
    });
  });

  await test.step("the step is validated", async () => {
    await expect(page.getByText("SYSTÈME EN LIGNE")).toBeVisible({ timeout: 15_000 });
  });
});
