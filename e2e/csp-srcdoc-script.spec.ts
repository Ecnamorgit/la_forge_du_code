import { expect, test } from "@playwright/test";

/**
 * Une iframe `srcdoc` a origine opaque peut-elle charger un script servi par
 * l'origine du parent, sous la CSP de production ?
 *
 * `next.config.ts` n'applique la CSP que si NODE_ENV=production, donc ce test
 * n'a de valeur que lance contre `pnpm build && pnpm start`. Contre le serveur
 * de developpement il passe toujours et ne prouve rien.
 *
 * C'est aussi un garde-fou permanent : si quelqu'un resserre `script-src` plus
 * tard, l'apercu React casse et ce test le dit.
 */
test("une iframe srcdoc charge un script de l'origine du parent", async ({ page }) => {
  const response = await page.goto("/");
  const csp = response?.headers()["content-security-policy"];

  // La CSP n'est emise qu'en production (next.config.ts, garde `isProd`). Sans
  // en-tete, ce test ne prouve rien : on le saute explicitement plutot que de
  // le laisser passer pour la mauvaise raison.
  test.skip(
    !csp,
    "CSP absente : lance ce test contre `pnpm build && pnpm start`, pas contre le serveur de developpement."
  );

  // Garde-fou supplementaire : si `script-src` disparaissait de la CSP (par
  // exemple une regression dans next.config.ts), le test suivant passerait
  // pour la mauvaise raison — n'importe quel script serait autorise. On
  // verifie donc explicitement que la directive est bien presente.
  expect(csp, "La CSP ne contient pas de directive script-src.").toContain("script-src");

  const recu = await page.evaluate(() => {
    return new Promise<string>((resolve) => {
      const timeout = setTimeout(() => resolve("timeout"), 4000);

      window.addEventListener("message", function onMessage(event) {
        const data = event.data as { type?: string };
        if (data?.type !== "probe:ok") return;
        clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        resolve("ok");
      });

      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.style.display = "none";
      // URL ABSOLUE : dans un document srcdoc la base est `about:srcdoc`,
      // une URL relative ne resout rien.
      iframe.srcdoc =
        `<!doctype html><html><body><script src="${window.location.origin}/react-runtime/probe.js"></script></body></html>`;
      document.body.appendChild(iframe);
    });
  });

  expect(
    recu,
    "Le script n'a pas pu se charger. Si ce test echoue sous CSP de production, " +
      "appliquer le repli documente dans la spec : inliner le runtime dans le srcdoc."
  ).toBe("ok");
});
