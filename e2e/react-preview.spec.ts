import { expect, test, type Page } from "@playwright/test";

import { STORAGE_STATE } from "./global-setup";

/**
 * L'apercu React de bout en bout. L'iframe est a origine opaque : Playwright y
 * accede via `frameLocator`, qui opere au niveau du protocole et non via la
 * regle de meme origine — verifie empiriquement ici, ca fonctionne.
 *
 * Note sur les accents : les copies verifiees ci-dessous (« Déploie pour voir
 * ton composant », le titre d'iframe « Aperçu du composant React », « Erreur
 * à l'exécution », « Syntaxe refusée ») portent leurs diacritiques francais
 * dans l'app ; les regex/selecteurs ci-dessous les reproduisent tels quels
 * pour matcher reellement le DOM.
 *
 * Note sur la saisie : Monaco ferme automatiquement crochets/accolades/quotes
 * a la frappe. `page.keyboard.type` sur un code qui contient deja ses propres
 * fermetures produit donc un code DOUBLE-ferme (verifie empiriquement : une
 * accolade en trop, rejetee par Sucrase avec "Unexpected token"). On pose donc
 * la valeur directement sur le modele Monaco via `window.monaco`, expose
 * globalement par le loader AMD une fois l'editeur monte — ca contourne
 * l'auto-fermeture tout en declenchant le meme `onDidChangeModelContent` que
 * la frappe reelle, donc le meme `onChange` cote React.
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
 * Les tests de ce fichier s'executent en serie (fullyParallel: false) sur le
 * MEME utilisateur e2e, et la premiere etape validee avec succes fait
 * progresser sa sauvegarde serveur (`stepCompletion`, verifie directement via
 * `GET /api/me` pendant la mise au point de ce fichier) : une navigation
 * fraiche ulterieure vers `/learn/react/chapitre-7` reprend alors sur l'etape
 * suivante, pas la premiere. Tous les tests de ce fichier deploient
 * volontairement un composant nomme `Reacteur`, qui est le previewMount de
 * l'ETAPE 1 uniquement. On revient donc explicitement dessus par la
 * pagination cote client (« Précédent »), sans toucher a la base de donnees.
 *
 * Piege verifie empiriquement : `ChapterClient` affiche l'étape 1 par DEFAUT
 * (etat client avant hydratation) pendant les quelques centaines de ms que
 * met `GET /api/me` a repondre, puis bascule vers l'etape reellement reprise
 * une fois la reponse traitee. Lire le compteur trop tot y verrait donc "1/4"
 * pour la MAUVAISE raison (pas encore hydrate, plutot que reellement a
 * l'etape 1), et la fonction croirait a tort ne rien avoir a faire. On
 * attend explicitement la reponse de `GET /api/me` qui suit la navigation
 * avant de lire quoi que ce soit.
 */
async function allerAChapitre7EtRevenirEtape1(page: Page) {
  const hydratation = page
    .waitForResponse((r) => r.url().includes("/api/me") && r.request().method() === "GET", {
      timeout: 15_000,
    })
    .catch(() => null);
  await page.goto("/learn/react/chapitre-7");
  await hydratation;
  // Laisse React traiter la reponse et re-rendre avant de lire le DOM.
  await page.waitForTimeout(250);

  const precedent = page.getByRole("button", { name: /précédent/i });
  await expect(precedent).toBeVisible({ timeout: 15_000 });
  // Chapitre-7 a 4 etapes ; 3 clics suffisent dans tous les cas a revenir a
  // la premiere depuis la derniere.
  for (let i = 0; i < 3; i++) {
    if (await precedent.isDisabled()) break;
    await precedent.click();
  }
  await expect(precedent).toBeDisabled();
}

test.describe("apercu React", () => {
  // Session partagee ecrite par global-setup : `auth.ts` limite les connexions
  // a 10 par 5 minutes et par IP, et la suite depassait ce seuil quand chaque
  // spec se connectait pour son compte.
  test.use({ storageState: STORAGE_STATE });

  /**
   * Le point du constat EXE-03 : l'aperçu ne s'exécute plus dans un `srcdoc`
   * (qui hérite de la CSP du site), mais est chargé par `src` depuis une origine
   * DÉDIÉE. C'est ce qui permet à l'application de porter une CSP stricte tandis
   * que la CSP permissive reste confinée à cette seule origine. En local,
   * l'origine dédiée est `127.0.0.1` quand l'app est sur `localhost` (et
   * réciproquement) : même serveur, origine distincte.
   *
   * Ce test aurait été impossible tant que l'aperçu vivait dans un `srcdoc` :
   * un `srcdoc` n'a pas d'origine propre, il emprunte celle du parent.
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

    // Avant tout deploiement, l'apercu invite a deployer.
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

    // Ce code satisfait AUSSI le validateur statique de l'etape (comportement
    // volontaire : c'est le code correct de l'exercice), ce qui declenche ~500ms
    // apres le deploiement la banniere de reussite de l'etape — un
    // comportement de l'app sans rapport avec l'apercu React, mais dont
    // l'overlay plein ecran intercepterait sinon (course verifiee
    // empiriquement) le clic sur le bouton de l'iframe qui suit. On la ferme
    // par son fond (`onDimClick`), qui ne fait QUE fermer la banniere : contrai-
    // rement au bouton SUIVANT, il n'avance pas l'etape et ne demonte donc pas
    // cet aperçu.
    const fondBanniere = page.locator(".animate-overlay-in");
    await page.waitForTimeout(900);
    if (await fondBanniere.isVisible().catch(() => false)) {
      // La carte de la banniere est CENTREE sur l'ecran, par-dessus ce fond
      // plein ecran : cliquer au centre (comportement par defaut de Playwright)
      // atterrit donc sur la carte, pas le fond. On vise un coin, hors de la
      // carte (verifie empiriquement).
      await fondBanniere.click({ position: { x: 5, y: 5 } });
    }

    // Le point de tout le chantier : le composant est VIVANT.
    await bouton.click();
    await expect(apercu.getByRole("button", { name: /Poussee : 1/ })).toBeVisible();
  });

  /**
   * Une exception levee PENDANT le rendu doit remonter au panneau via la
   * frontiere d'erreur de l'iframe.
   *
   * Ce test visait au depart le message « Rendered fewer hooks than expected »
   * en placant un useState dans un if. Il ne le declenchait pas : avec une
   * condition constante (if (true)), le nombre de hooks ne change jamais d'un
   * rendu a l'autre, donc React n'a rien a signaler. C'est la regle qui est
   * enseignee au chapitre 7, pas une erreur que l'apercu peut provoquer sur un
   * montage unique. On verifie donc ce que la frontiere garantit reellement.
   */
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
    // Le message de l'apprenant doit arriver tel quel, pas un generique.
    await expect(page.getByText(/Reacteur en surchauffe/)).toBeVisible();
  });

  test("le chapitre 4, exempte, n'affiche pas d'apercu", async ({ page }) => {
    await page.goto("/learn/react/chapitre-4");
    await expect(page.locator('iframe[title="Aperçu du composant React"]')).toHaveCount(0);
  });

  /**
   * Une boucle infinie est REFUSEE AVANT l'envoi, pas rattrapee apres.
   *
   * La conception initiale prevoyait un chien de garde cote parent. Ce test
   * l'a dementi : une iframe srcdoc a origine opaque partage le thread
   * principal du parent dans Chromium, donc un while(true) a gele l'onglet
   * ENTIER pendant 58 secondes et le setTimeout du parent n'a jamais pu
   * s'executer. Aucune recuperation n'est possible une fois le code envoye,
   * d'ou le garde-fou statique (lib/sandbox/loop-guard.ts).
   *
   * Ce test est donc aussi la preuve que l'onglet ne gele plus : s'il repassait
   * en timeout de 60s, c'est que le garde-fou a ete contourne ou retire.
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

    // Titre du bandeau, cible en exact : le corps du message contient lui aussi
    // les mots « boucle sans fin », ce qui rendrait un match souple ambigu.
    await expect(page.getByText("Boucle sans fin", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/risque de ne jamais se terminer/i)).toBeVisible();

    // L'onglet doit etre rester vivant : si le code avait ete envoye, cette
    // interaction serait impossible.
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
   * Report carrie depuis la revue de la gestion d'erreurs de l'iframe : le
   * bundle React (react-runtime/runtime.js) est charge cross-origin par
   * rapport a l'origine opaque de l'iframe. Une exception non rattrapee
   * levee pendant qu'il est le script en cours d'execution (typiquement le
   * dispatch d'un onClick par React) peut voir son `message` remplace par la
   * chaine generique "Script error." sans aucun detail. Le handler a ete
   * elargi pour preferer le message de l'objet error transmis en 5e
   * argument de window.onerror. Si ce test echoue avec "Script error." pur,
   * c'est un vrai constat a remonter, pas une assertion a affaiblir.
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

    // Le constat a remonter si ca casse : un message generique et opaque,
    // sans aucun detail exploitable pour l'apprenant.
    await expect(page.getByText(/^Script error\.$/)).toHaveCount(0);
    await expect(page.getByText(/boom explicite/i)).toBeVisible();
  });
});
