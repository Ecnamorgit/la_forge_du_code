# Réconcilier la bible §3 avec les cours — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réécrire la section §3 de la bible narrative pour qu'elle documente fidèlement les métaphores réellement employées par les cours HTML/CSS/JS livrés.

**Architecture:** Édition doc-only d'un seul fichier (`docs/conception_storytelling.md`), remplacement de la seule section §3 par une carte `concept → métaphore` complète et non-militarisée. Aucun code, aucun cours touché.

**Tech Stack:** Markdown.

## Global Constraints

- **Doc-only** : un seul fichier modifié (`docs/conception_storytelling.md`), **section §3 uniquement**. Le reste du document reste identique.
- **Aucun fichier de cours modifié** (`data/courses/**` intact).
- **Ton ingénierie** : le §3 ne doit plus contenir les termes militarisés bannis : `militaire`, `armement`, `Boucliers et Armement`, `tourelle`, `mines magnétiques`, `chasseurs d'attaque`.
- Couverture : une ligne par chapitre livré des 3 cursus complets — HTML 8, CSS 10, JS 12.
- Spec : [docs/superpowers/specs/2026-07-13-bible-mapping-design.md](../specs/2026-07-13-bible-mapping-design.md).

---

## Task 1: Réécrire la section §3 de la bible

**Files:**
- Modify: `docs/conception_storytelling.md` (section §3 uniquement, ~lignes 40-68)

**Interfaces:** aucune (documentation). Ne touche ni code ni cours.

- [ ] **Step 1 : Remplacer le bloc §3**

Dans `docs/conception_storytelling.md`, remplacer **exactement** ce bloc :

```md
## 🎮 3. Intégration Pédagogique du Storytelling

Chaque technologie enseignée correspond à une action militaire ou de survie sur la station :

### 📡 Cursus HTML : Reconstruction Structurelle
*   **Métaphore de jeu :** Réparer la structure physique des stations endommagées par les astéroïdes.
*   **Intégration narrative :**
    - `Header` = La passerelle de commandement de la station.
    - `Main` = Le réacteur central de survie.
    - `Footer` = La soute de stockage des ressources.
    - `a href` (liens) = Établir des ponts de transfert d'énergie entre deux stations.
    - `img` = Calibrer les caméras de surveillance externes pour identifier les menaces.

### 🎨 Cursus CSS : Boucliers et Armement
*   **Métaphore de jeu :** Allouer l'énergie de la station et camoufler la flotte.
*   **Intégration narrative :**
    - Sélecteurs de couleur (`hex`, `rgb`) = Ajuster la fréquence thermique des boucliers pour bloquer les lasers ennemis.
    - `Flexbox` = Aligner les chasseurs d'attaque dans les hangars pour un décollage immédiat.
    - `Grid` = Cartographier et quadriller la grille de défense orbitale avec des mines magnétiques.
    - `Transitions / Animations` = Programmer le cycle d'occultation optique (invisibilité) du vaisseau.

### ⚡ Cursus JavaScript : Automatisation des Systèmes
*   **Métaphore de jeu :** Programmer l'IA tactique et réparer les moteurs de vol.
*   **Intégration narrative :**
    - `Variables` = Enregistrer les coordonnées spatiales et l'état des boucliers (ex: `let shieldEnergy = 100`).
    - `Conditions (if/else)` = Programmer la tourelle de défense pour qu'elle tire uniquement sur les vaisseaux ennemis identifiés (ex: `if (vessel.isHostile) { fire(); }`).
    - `Boucles (for/while)` = Lancer des scans de détection répétés sur les secteurs adjacents.
    - `Events / Listeners` = Intercepter les signaux de détresse de la flotte et y répondre en temps réel.
```

par ce bloc :

```md
## 🎮 3. Intégration Pédagogique du Storytelling

Chaque technologie enseignée correspond à un **geste d'ingénierie ou de survie** sur la station. Cette section est la carte de vérité `concept → métaphore de jeu` : elle reflète ce que disent réellement les cursus livrés.

### 📡 Cursus HTML — Reconstruction du Dock d'Orbite
*   **Métaphore de jeu :** Ériger et réparer la structure du dock d'amarrage.

| Concept | Métaphore de jeu |
|---|---|
| `<!DOCTYPE>` / `<html>` | Poser les fondations et sceller l'enceinte de la base |
| `<a href>` | Ouvrir une passerelle de transmission (canal interne ou externe) |
| `<img>` | Brancher un capteur visuel / caméra de la soute |
| Listes `<ul>` / `<li>` | Dresser l'inventaire de la soute |
| Formulaires `<form>` / `<label>` / `<input>` | Enregistrer et cataloguer les cargaisons |
| `<header>` / `<main>` / `<footer>` + ARIA | Structurer les compartiments de la console (accessibles à tous) |
| Méta `lang` / `charset` / `viewport` | Régler la fréquence de l'en-tête de transmission |
| `<video>` | Connecter le retour vidéo de surveillance |

### 🎨 Cursus CSS — Console Graphique du Dock
*   **Métaphore de jeu :** Habiller et animer le dock via sa console graphique.

| Concept | Métaphore de jeu |
|---|---|
| Balise `<style>` | Brancher la console graphique du dock |
| Sélecteurs / classes / couleur | Cibler un module et régler la palette tactique |
| Box model (`width` / `height`) | Réserver le volume des modules pressurisés |
| Flexbox | Aligner les vaisseaux en formation dans le hangar |
| Grid | Tracer la carte tactique (cartographie stellaire) |
| `position` | Verrouiller l'ancrage orbital d'un module |
| Pseudo-classes (`:hover` / `:focus`) | Donner des signes de vie aux consoles réactives |
| Responsive (`max-width` / media queries) | Adapter l'affichage aux terminaux de l'équipage |
| Transitions / animations | Adoucir la dynamique visuelle du dock |
| Variables CSS | Centraliser la « peau de nébuleuse » (design réutilisable) |

### ⚡ Cursus JavaScript — Automatisation des Systèmes
*   **Métaphore de jeu :** Programmer et piloter les systèmes automatiques de la station.

| Concept | Métaphore de jeu |
|---|---|
| `console.log` / variables | Émettre le premier signal radio |
| Opérateurs & conditions | Calcul tactique et prise de décision |
| Fonctions | Encapsuler des modules de commande réutilisables |
| Tableaux & boucles | Tenir et parcourir l'inventaire tactique |
| Objets & méthodes | Structurer les registres (fiches de vaisseau) |
| `map` / `filter` / `reduce` | Traiter les données de la flotte en masse |
| DOM | Manipuler la console physique de la station |
| Événements | Tenir un poste de garde qui réagit aux signaux |
| Promises / async | Gérer les communications longue distance |
| `localStorage` | Graver la mémoire de bord persistante |
| `fetch` | Établir la liaison satellite avec le central |
| API REST / verbes HTTP | Respecter les protocoles de la flotte |
```

- [ ] **Step 2 : Vérifier qu'aucun terme militarisé banni ne subsiste dans §3**

Run: `npx rg -n "action militaire|Boucliers et Armement|tourelle|mines magnétiques|chasseurs d'attaque" docs/conception_storytelling.md; echo "exit=$?"`
Expected: aucune ligne trouvée (rg renvoie `exit=1` quand il n'y a aucun match — c'est le résultat attendu).

- [ ] **Step 3 : Vérifier la couverture (nombre de lignes de table par cursus)**

Run: `npx rg -n "^\| " docs/conception_storytelling.md | wc -l`
Expected: **33** lignes de contenu de table dans §3 = 8 (HTML) + 10 (CSS) + 12 (JS) + 3 en-têtes de séparation ne comptent pas ici car le motif `^\| ` matche aussi les lignes d'en-tête `| Concept | Métaphore de jeu |` (3) mais pas les séparateurs `|---|---|`. Donc total attendu = 30 lignes de données + 3 en-têtes = **33**. Si le nombre diffère, une ligne de chapitre manque ou est en trop.

- [ ] **Step 4 : Vérifier qu'aucun fichier de cours n'a bougé**

Run: `git status --short data/courses; echo "---"; git status --short docs/conception_storytelling.md`
Expected: rien sous `data/courses` ; seul `docs/conception_storytelling.md` est modifié (` M docs/conception_storytelling.md`).

- [ ] **Step 5 : Vérifier que le diff est limité à §3**

Run: `git diff docs/conception_storytelling.md | rg -n "^@@"`
Expected: un seul hunk (ou hunks contigus) couvrant la zone §3 ; les sections §1, §2, §4 n'apparaissent pas dans le diff.

- [ ] **Step 6 : Commit**

```bash
git add docs/conception_storytelling.md
git commit -m "docs(narrative): reconcilie la bible §3 avec les cours (carte concept->metaphore)"
```

---

## Self-Review

**Spec coverage :** carte `concept → métaphore` couvrant HTML 8 / CSS 10 / JS 12 (Step 1) ✔ ; ton ingénierie sans termes bannis (Step 1 + vérif Step 2) ✔ ; aucun cours modifié (Step 4) ✔ ; sous-titres HTML/CSS reformulés + intro « geste d'ingénierie ou de survie » (Step 1) ✔ ; diff limité à §3 (Step 5) ✔.

**Placeholders :** aucun ; le bloc de remplacement complet est fourni intégralement.

**Cohérence :** le bloc `old` reproduit le §3 actuel verbatim (à comparer à `docs/conception_storytelling.md` lignes ~40-68) ; le bloc `new` est autonome et correspond au contenu validé dans la spec.
