import type { ChapterData } from "@/data/courses/html/types";

export const chapitre1: ChapterData = {
  slug: "chapitre-1",
  tag: "MISSION : ASSURANCE QUALITE",
  title: "TESTS &\nVITEST",
  subtitle: "Garantis que ton code ne casse pas, meme demain",
  totalXp: 280,
  completionBadge: "✅",
  completionBadgeLabel: "INGENIEUR QA",
  steps: [
    {
      startCode:
        "// Ecris ton premier test avec Vitest.\n// La fonction additionner existe deja.\n// Test : additionner(2, 3) doit valoir 5.\nimport { describe, it, expect } from 'vitest';\n\nexport function additionner(a, b) { return a + b; }\n\n// describe('additionner', () => { ... });\n",
      placeholder: "// describe('...', () => { it('...', () => { expect(...).toBe(...) }); });",
      narrator:
        "Un code sans tests est un code qui CASSERA. Pas peut-etre. Surement. Les tests automatises capturent les regressions avant tes utilisateurs. Vitest est le runner moderne de l'ecosysteme JS.",
      hint: "import { describe, it, expect } from 'vitest';\n\nexport function additionner(a, b) { return a + b; }\n\ndescribe('additionner', () => {\n  it('additionne deux nombres', () => {\n    expect(additionner(2, 3)).toBe(5);\n  });\n});",
      briefing: {
        title: "Vitest : describe, it, expect",
        content: `
### Installation
\`npm install -D vitest\`

Le \`-D\` (--save-dev) indique que c'est une dependance de developpement, pas livree en production.

### La structure d'un test
Trois fonctions globales fournies par Vitest :

- **describe(nom, fn)** -> groupe de tests sur un sujet
- **it(nom, fn)** ou **test(nom, fn)** -> un cas de test individuel
- **expect(valeur)** -> une assertion sur une valeur

\`describe('additionner', () => {\`
\`  it('additionne deux entiers', () => {\`
\`    expect(additionner(2, 3)).toBe(5);\`
\`  });\`
\`});\`

### La convention AAA
Chaque test suit trois etapes :
1. **Arrange** : prepare les donnees
2. **Act** : appelle la fonction testee
3. **Assert** : verifie le resultat

### Lancer les tests
\`npx vitest\` -> mode watch, relance a chaque sauvegarde
\`npx vitest run\` -> une seule passe (pour la CI)
\`npx vitest --ui\` -> interface web interactive

### Nommer ses tests
Un bon nom de test decrit le COMPORTEMENT attendu :
- BIEN : \`it('retourne 0 quand la liste est vide')\`
- MAL : \`it('test1')\`

**A retenir :** describe groupe, it teste un cas, expect verifie. Trois mots-cles, et tu couvres 90% des tests.
        `,
      },
      objectives: [
        { id: "o1a", label: "Utiliser describe et it" },
        { id: "o1b", label: "Verifier le resultat avec expect(...).toBe(...)" },
      ],
      missionIcon: "✅",
      missionTag: "PROTOCOLE 01",
      missionTtl: "PREMIER TEST",
      bannerIcon: "✅",
      bannerTtl: "TEST AU VERT",
      bannerSub: "Ta premiere assertion est passee. Le filet de securite se tisse.",
      bannerXp: "⚡ +65 XP",
    },
    {
      startCode:
        "// La fonction filtrerActifs renvoie les pilotes dont actif === true.\n// Ecris DEUX tests :\n//  1. avec un tableau vide -> retourne []\n//  2. avec un tableau mixte -> retourne uniquement les actifs\nimport { describe, it, expect } from 'vitest';\n\nexport function filtrerActifs(pilotes) {\n  return pilotes.filter(p => p.actif);\n}\n",
      placeholder: "// expect([]).toEqual([]); expect(filtrerActifs([...])).toEqual([...]);",
      narrator:
        "Un seul test ne suffit jamais. Couvre aussi les cas limites : tableau vide, valeurs null, donnees inattendues. C'est la qu'on attrape les vrais bugs. Decouvre les matchers Vitest.",
      hint: "import { describe, it, expect } from 'vitest';\n\nexport function filtrerActifs(pilotes) {\n  return pilotes.filter(p => p.actif);\n}\n\ndescribe('filtrerActifs', () => {\n  it('retourne un tableau vide si entree vide', () => {\n    expect(filtrerActifs([])).toEqual([]);\n  });\n\n  it('ne garde que les pilotes actifs', () => {\n    const pilotes = [\n      { nom: 'Lia', actif: true },\n      { nom: 'Max', actif: false },\n      { nom: 'Eva', actif: true },\n    ];\n    expect(filtrerActifs(pilotes)).toEqual([\n      { nom: 'Lia', actif: true },\n      { nom: 'Eva', actif: true },\n    ]);\n  });\n});",
      briefing: {
        title: "Les matchers et les cas limites",
        content: `
### toBe vs toEqual
- **toBe(x)** : compare par REFERENCE (\`===\`). Bon pour primitifs.
- **toEqual(x)** : compare en PROFONDEUR. Obligatoire pour objets et tableaux.

\`expect([1, 2]).toBe([1, 2]);  // ECHEC (deux tableaux differents en memoire)\`
\`expect([1, 2]).toEqual([1, 2]); // SUCCES\`

### Autres matchers utiles
- \`.toBeTruthy() / .toBeFalsy()\` -> valeurs truthy/falsy
- \`.toBeNull() / .toBeUndefined() / .toBeDefined()\`
- \`.toBeGreaterThan(n) / .toBeLessThan(n)\`
- \`.toContain(item)\` -> tableau contient l'element
- \`.toHaveLength(n)\` -> tableau/string de bonne longueur
- \`.toMatch(/regex/)\` -> string match une regex
- \`.toThrow()\` -> la fonction lance une erreur

### Tester les erreurs
\`expect(() => fonctionQuiThrow()).toThrow('message attendu');\`

Attention : il faut envelopper l'appel dans une fleche. Sinon l'erreur est levee avant que expect ne puisse l'attraper.

### Tester l'asynchrone
\`it('charge les donnees', async () => {\`
\`  const data = await charger();\`
\`  expect(data).toEqual({ ... });\`
\`});\`

Pour une Promise qui doit rejeter : \`await expect(charger()).rejects.toThrow();\`

### Les "cas limites" a tester systematiquement
- Entree vide ([], '', null, undefined)
- Cas "happy path" (entree normale)
- Cas erreur (entree invalide)
- Borne haute (gros nombres, longue string)

**A retenir :** toEqual pour les structures, toBe pour les primitifs. Toujours tester au moins 3 cas (vide / normal / erreur).
        `,
      },
      objectives: [
        { id: "o2a", label: "Ecrire un test pour le cas tableau vide" },
        { id: "o2b", label: "Utiliser toEqual pour comparer des tableaux d'objets" },
      ],
      missionIcon: "🧪",
      missionTag: "PROTOCOLE 02",
      missionTtl: "CAS LIMITES",
      bannerIcon: "🧪",
      bannerTtl: "ROBUSTESSE PROUVEE",
      bannerSub: "Tu couvres les cas normaux ET les cas limites.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Teste le composant React <Compteur />.\n// 1. Au rendu, le texte 'Score : 0' est visible.\n// 2. Apres un clic sur '+1', le texte devient 'Score : 1'.\n// Bibliotheque : @testing-library/react.\nimport { describe, it, expect } from 'vitest';\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport { useState } from 'react';\n\nfunction Compteur() {\n  const [c, setC] = useState(0);\n  return (\n    <div>\n      <span>Score : {c}</span>\n      <button onClick={() => setC(c + 1)}>+1</button>\n    </div>\n  );\n}\n",
      placeholder: "// render(<Compteur />); screen.getByText(...); fireEvent.click(...)",
      narrator:
        "Tester du JS pur c'est bien, tester l'interaction d'un utilisateur avec un composant React c'est mieux. Testing Library simule un vrai utilisateur — clics, recherche de texte, formulaires.",
      hint: "import { describe, it, expect } from 'vitest';\nimport { render, screen, fireEvent } from '@testing-library/react';\n\ndescribe('Compteur', () => {\n  it('affiche 0 au demarrage', () => {\n    render(<Compteur />);\n    expect(screen.getByText('Score : 0')).toBeDefined();\n  });\n\n  it('incremente au clic', () => {\n    render(<Compteur />);\n    fireEvent.click(screen.getByText('+1'));\n    expect(screen.getByText('Score : 1')).toBeDefined();\n  });\n});",
      briefing: {
        title: "Testing Library pour React",
        content: `
### Installation
\`npm install -D @testing-library/react @testing-library/jest-dom jsdom\`

Configure vitest avec \`environment: 'jsdom'\` dans \`vitest.config.ts\` pour simuler un DOM.

### Les trois outils essentiels
- **render(<Composant />)** : monte le composant dans un DOM virtuel
- **screen** : objet global pour chercher des elements
- **fireEvent** : simule des interactions (click, change, submit...)

### La philosophie Testing Library
"Teste comme un utilisateur, pas comme un developpeur."
- Cherche par TEXTE VISIBLE, pas par classe CSS ou id
- Simule des CLICS, pas des appels de fonctions internes
- Verifie ce que l'UTILISATEUR VOIT, pas l'etat interne du composant

### Les queries
- \`getByText('Score : 0')\` -> ECHOUE si non trouve
- \`queryByText(...)\` -> retourne null si non trouve (pour tester l'absence)
- \`findByText(...)\` -> async, attend que l'element apparaisse
- \`getByRole('button', { name: '+1' })\` -> recommande, base sur l'accessibilite
- \`getByLabelText('Email')\` -> pour les formulaires

### Tester l'absence
\`expect(screen.queryByText('Erreur')).toBeNull();\`

### userEvent vs fireEvent
**fireEvent** declenche un evenement brut. **userEvent** (de @testing-library/user-event) simule plus fidelement un vrai utilisateur (delai, focus, sequence d'evenements). Prefere \`userEvent\` en pratique.

\`import userEvent from '@testing-library/user-event';\`
\`await userEvent.click(screen.getByRole('button'));\`

**A retenir :** render + screen + fireEvent/userEvent. Cherche par ce que l'utilisateur voit, pas par l'implementation.
        `,
      },
      objectives: [
        { id: "o3a", label: "Rendre le composant et chercher du texte" },
        { id: "o3b", label: "Simuler un clic et verifier le nouveau texte" },
      ],
      missionIcon: "🧩",
      missionTag: "PROTOCOLE 03",
      missionTtl: "TESTS UI",
      bannerIcon: "🧩",
      bannerTtl: "INTERACTION VERIFIEE",
      bannerSub: "Tu testes l'experience reelle de tes utilisateurs.",
      bannerXp: "⚡ +70 XP",
    },
    {
      startCode:
        "// Test E2E avec Playwright.\n// Visite 'http://localhost:3000', clique sur le bouton 'Demarrer mission'.\n// Verifie que l'URL contient '/dashboard' apres le clic.\nimport { test, expect } from '@playwright/test';\n",
      placeholder: "// await page.goto(...); await page.click(...); await expect(page).toHaveURL(...);",
      narrator:
        "Vitest teste le code en isolation. Playwright teste TOUTE l'application dans un vrai navigateur, comme un utilisateur final. C'est le filet de securite ultime avant la mise en production.",
      hint: "import { test, expect } from '@playwright/test';\n\ntest('demarrer une mission', async ({ page }) => {\n  await page.goto('http://localhost:3000');\n  await page.click('text=Demarrer mission');\n  await expect(page).toHaveURL(/.*\\/dashboard/);\n});",
      briefing: {
        title: "Tests E2E avec Playwright",
        content: `
### Installation
\`npm init playwright@latest\` -> setup complet (config, premiers tests, scripts npm).

Playwright telecharge automatiquement Chromium, Firefox, WebKit. Tes tests tournent sur les trois.

### La pyramide des tests
1. **Unitaires** (Vitest) -> rapides, nombreux, isoles
2. **Integration** (Vitest + Testing Library) -> moyens, testent plusieurs unites ensemble
3. **End-to-End** (Playwright) -> lents, peu nombreux, mais VRAIS

Ratio classique : 70% unitaires / 20% integration / 10% E2E.

### Anatomie d'un test E2E
\`test('description', async ({ page }) => {\`
\`  await page.goto(url);\`
\`  await page.click('text=...');\`
\`  await page.fill('input[name=email]', 'a@b.c');\`
\`  await expect(page).toHaveURL(/.*\\/success/);\`
\`});\`

### Selectionner des elements
- **Par texte** : \`page.click('text=Demarrer')\`
- **Par role** : \`page.getByRole('button', { name: 'Connexion' })\` (recommande)
- **Par testid** : \`page.getByTestId('submit')\` (ajoute \`data-testid='submit'\` dans le JSX)
- **Par selecteur CSS** : \`page.click('.menu-item')\` (fragile, evite)

### Auto-wait magique
Playwright attend automatiquement que les elements soient visibles, cliquables, le DOM stable. Pas besoin de \`sleep()\` partout.

### Lancer les tests
\`npx playwright test\` -> tous les tests
\`npx playwright test --ui\` -> interface interactive (super pour debug)
\`npx playwright test --debug\` -> mode pas a pas

### En CI
Tu lances la dev server avant les tests. Playwright a un \`webServer\` config pour ca : il demarre ton app, attend qu'elle reponde, lance les tests, l'arrete.

### Quand ecrire un test E2E ?
Les "smoke tests" critiques :
- Login / signup
- Tunnel d'achat
- Action principale de l'app

PAS chaque petit detail. Trop d'E2E = pipeline CI de 30 minutes et tests fragiles.

**A retenir :** E2E pour les parcours critiques, pas pour tout. Selecteurs par role > texte > testid > CSS.
        `,
      },
      objectives: [
        { id: "o4a", label: "Visiter une URL avec page.goto" },
        { id: "o4b", label: "Cliquer et verifier l'URL avec toHaveURL" },
      ],
      missionIcon: "🎭",
      missionTag: "PROTOCOLE 04",
      missionTtl: "TESTS E2E",
      bannerIcon: "✅",
      bannerTtl: "PIPELINE COMPLET",
      bannerSub: "Unitaire, integration, E2E : ton code est protege a tous les niveaux.",
      bannerXp: "⚡ +75 XP",
    },
  ],
};
