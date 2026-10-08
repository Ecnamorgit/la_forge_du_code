import { expect, test, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * Pose le code directement sur le modèle Monaco, qui fermerait sinon une
 * seconde fois crochets, accolades et guillemets à la frappe. Le `onChange`
 * React est déclenché comme pour une vraie saisie.
 *
 * L'iframe de l'aperçu est à origine opaque ; `frameLocator` y accède quand
 * même, car il passe par le protocole et non par la règle de même origine.
 */
async function definirCodeEditeur(page: Page, code: string) {
  await expect(page.locator(".monaco-editor").first()).toBeVisible({ timeout: 15_000 });
  const resultat = await page.evaluate((value) => {
    const monaco = (window as unknown as { monaco?: typeof import("monaco-editor") }).monaco;
    if (!monaco) return "no-monaco";
    const models = monaco.editor.getModels();
    if (!models.length) return "no-models";
    models[0].setValue(value);
    return "ok";
  }, code);
  if (resultat !== "ok") {
    throw new Error(`Impossible de definir le code de l'editeur Monaco : ${resultat}`);
  }
}

/**
 * Les tests partagent le même utilisateur et s'exécutent en série : dès qu'une
 * étape est validée, le chapitre 7 reprend à l'étape suivante. Or tous
 * déploient `Reacteur`, le composant monté par l'étape 1 : on y revient par la
 * pagination.
 *
 * `ChapterClient` affiche l'étape 1 tant que `GET /api/me` n'a pas répondu,
 * d'où l'attente de cette réponse avant de lire l'état des boutons.
 */
async function allerAChapitre7EtRevenirEtape1(page: Page) {
  const hydratation = page
    .waitForResponse((r) => r.url().includes("/api/me") && r.request().method() === "GET", {
      timeout: 15_000,
    })
    .catch(() => null);
  await page.goto("/learn/react/chapitre-7");
  await hydratation;
  // Laisse React traiter la réponse avant de lire le DOM.
  await page.waitForTimeout(250);

  const precedent = page.getByRole("button", { name: /précédent/i });
  await expect(precedent).toBeVisible({ timeout: 15_000 });
  // Le chapitre compte 4 étapes : 3 clics ramènent toujours à la première.
  for (let i = 0; i < 3; i++) {
    if (await precedent.isDisabled()) break;
    await precedent.click();
  }
  await expect(precedent).toBeDisabled();
}

test.describe("apercu React", () => {
  // Session partagée écrite par global-setup (limite de connexions par IP).
  test.use({ storageState: STORAGE_STATE });

  /**
   * L'aperçu est chargé par `src` depuis une origine dédiée, ce qui confine sa
   * CSP permissive et laisse une CSP stricte à l'application (audit EXE-03).
   * En local, cette origine est `127.0.0.1` quand l'app est sur `localhost`, et
   * inversement.
   */
  test("l'aperçu est chargé depuis une origine distincte de l'application", async ({ page }) => {
    await allerAChapitre7EtRevenirEtape1(page);

    const iframe = page.locator('iframe[title="Aperçu du composant React"]');
    await expect(iframe).toHaveCount(1);
    const src = await iframe.getAttribute("src");
    expect(src, "l'aperçu doit être chargé par src, plus par srcDoc").not.toBeNull();

    const origineApercu = new URL(src!).origin;
    const origineApp = new URL(page.url()).origin;
    expect(new URL(src!).pathname).toBe("/bac-a-sable");
    expect(
      origineApercu,
      `l'aperçu (${origineApercu}) doit être servi depuis une autre origine que l'app (${origineApp})`
    ).not.toBe(origineApp);
  });

  test("monte le composant et reagit au clic", async ({ page }) => {
    await allerAChapitre7EtRevenirEtape1(page);

    await expect(page.getByText(/Déploie pour voir ton composant/i)).toBeVisible();

    await definirCodeEditeur(
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

    const apercu = page.frameLocator('iframe[title="Aperçu du composant React"]');
    const bouton = apercu.getByRole("button", { name: /Poussee : 0/ });
    await expect(bouton).toBeVisible({ timeout: 15_000 });

    // Ce code valide aussi l'étape : la bannière de réussite apparaît ~500 ms
    // après le déploiement et son overlay intercepterait le clic suivant. On
    // la ferme par son fond (`onDimClick`), qui, contrairement au bouton
    // SUIVANT, n'avance pas l'étape et ne démonte donc pas l'aperçu.
    const fondBanniere = page.locator(".animate-overlay-in");
    await page.waitForTimeout(900);
    if (await fondBanniere.isVisible().catch(() => false)) {
      // La carte est centrée sur le fond : on clique dans un coin.
      await fondBanniere.click({ position: { x: 5, y: 5 } });
    }

    await bouton.click();
    await expect(apercu.getByRole("button", { name: /Poussee : 1/ })).toBeVisible();
  });

  /** L'exception remonte via la frontière d'erreur de l'iframe. */
  test("une exception levee pendant le rendu remonte au panneau", async ({ page }) => {
    await allerAChapitre7EtRevenirEtape1(page);

    await definirCodeEditeur(
      page,
      "function Reacteur() {\n" +
        "throw new Error('Reacteur en surchauffe');\n" +
        "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    await expect(page.getByText(/Erreur à l'exécution/i)).toBeVisible({ timeout: 15_000 });
    // Le message de l'apprenant arrive tel quel, pas un message générique.
    await expect(page.getByText(/Reacteur en surchauffe/)).toBeVisible();
  });

  test("le chapitre 4, exempte, n'affiche pas d'apercu", async ({ page }) => {
    await page.goto("/learn/react/chapitre-4");
    await expect(page.locator('iframe[title="Aperçu du composant React"]')).toHaveCount(0);
  });

  /**
   * Garde-fou statique de lib/sandbox/loop-guard.ts : une fois envoyée, la
   * boucle pourrait figer l'onglet entier. Un dépassement de délai ici signale
   * que le garde-fou a été contourné ou retiré.
   */
  test("une boucle infinie est refusee avant l'envoi, et le deploiement suivant marche", async ({
    page,
  }) => {
    await allerAChapitre7EtRevenirEtape1(page);

    await definirCodeEditeur(
      page,
      "function Reacteur() {\n" + "while (true) {}\n" + "return null;\n" + "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    // Correspondance exacte : le corps du message contient aussi « boucle sans fin ».
    await expect(page.getByText("Boucle sans fin", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/risque de ne jamais se terminer/i)).toBeVisible();

    // Si le code avait été envoyé, l'onglet figé empêcherait ce déploiement.
    await definirCodeEditeur(
      page,
      "function Reacteur() {\n" + "return <button>Systeme retabli</button>;\n" + "}"
    );
    await page.getByRole("button", { name: /deployer/i }).click();

    const apercu = page.frameLocator('iframe[title="Aperçu du composant React"]');
    await expect(apercu.getByRole("button", { name: /Systeme retabli/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  /**
   * Le bundle React est chargé depuis une autre origine que celle, opaque, de
   * l'iframe : une exception levée pendant un onClick peut n'exposer que
   * « Script error. ». Le gestionnaire lit donc le message de l'objet error,
   * 5e argument de window.onerror.
   */
  test("une exception non rattrapee dans un onClick remonte un vrai message", async ({
    page,
  }) => {
    await allerAChapitre7EtRevenirEtape1(page);

    await definirCodeEditeur(
      page,
      "function Reacteur() {\n" +
        "return <button onClick={() => { throw new Error('boom explicite'); }}>Declencher</button>;\n" +
        "}"
    );

    await page.getByRole("button", { name: /deployer/i }).click();

    const apercu = page.frameLocator('iframe[title="Aperçu du composant React"]');
    const bouton = apercu.getByRole("button", { name: /Declencher/i });
    await expect(bouton).toBeVisible({ timeout: 15_000 });
    await bouton.click();

    const panneauErreur = page.getByText(/Erreur à l'exécution/i);
    await expect(panneauErreur).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText(/^Script error\.$/)).toHaveCount(0);
    await expect(page.getByText(/boom explicite/i)).toBeVisible();
  });
});
