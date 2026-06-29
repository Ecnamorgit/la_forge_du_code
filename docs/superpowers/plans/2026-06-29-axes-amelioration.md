# Plans d'amélioration — CodeForge / Nebula Command

> Rédigé le 2026-06-29. 6 chantiers issus de l'analyse produit (contenu pédagogique,
> narratif, game). Chaque plan est autonome : objectif, fichiers, étapes, tests,
> effort, risques, critères d'acceptation. À valider avant lancement.

## Vue d'ensemble & dépendances

| # | Chantier | Effort | Impact | Dépend de |
|---|---|---|---|---|
| 1 | Resserrer le catalogue (cursus complets vs « Aperçu ») | S | Crédibilité ⭐⭐⭐ | — |
| 2 | Scénariser les messages d'erreur (ton narratif) | S | Immersion ⭐⭐⭐ | — |
| 3 | Donner une voix aux personnages (briefing/hint/narrator) | S | Immersion ⭐⭐ | 2 (ton partagé) |
| 4 | Visualiseur de combat (montée en puissance EnemySprite) | M | Game ⭐⭐⭐ | — |
| 5 | Moteur SQL réel (sql.js / WASM) | M | Crédibilité ⭐⭐ | 1 |
| 6 | Carte de succès partageable + mission quotidienne | M | Acquisition/rétention ⭐⭐ | — |

Ordre recommandé : **1 → 2 → 3** (quick wins, faible risque) puis **4** (différenciateur),
puis **5** et **6** (features plus lourdes). 1, 2, 4 sont indépendants et parallélisables.

---

## Chantier 1 — Resserrer le catalogue

### Objectif
Arrêter de présenter 14 cursus au même niveau alors que 10 ne contiennent qu'un seul
chapitre. Mettre en avant les cursus complets et marquer les autres « Aperçu / Bientôt »
de façon honnête. Améliore la crédibilité produit et le discours de soutenance.

### État actuel
- Complets : `javascript` (12 ch), `css` (10), `html` (8), `react` (4).
- Vitrine (1 ch ≈ 4 étapes) : `typescript, git, sql, nodejs, tests, devops, mongodb, security, python, algo`.
- Source unique : `lib/courses-catalog.ts` (`COURSES_CATALOG`), profondeur via
  `getCourseChaptersCount()` → `lib/chapter-summaries.ts`.

### Décision à valider avant lancement
Seuil « complet ». Proposition : **≥ 4 chapitres = complet**. Donne 4 cursus complets
(html, css, js, react). Tout le reste passe en « Aperçu ». Alternative : abaisser à
≥ 3 ou traiter `git` comme complet (regex assumée). **À trancher au point de validation.**

### Étapes
1. Ajouter un champ `status: "complete" | "preview"` à `CourseInfo` dans
   [courses-catalog.ts](lib/courses-catalog.ts) (dérivable de `getCourseChaptersCount`
   pour éviter la double source de vérité — calculer plutôt que stocker en dur).
2. Exposer un helper `getCourseStatus(slug)` (complete si count ≥ seuil).
3. UI catalogue (`app/learn/page.tsx` ou équivalent listant les cours) : badge
   « APERÇU » sur les cursus preview + tri (complets d'abord). Conserver l'accès,
   ne pas verrouiller (un chapitre reste jouable).
4. Page cursus preview : bandeau « Chapitre pilote — suite en cours de déploiement »
   pour cadrer l'attente.
5. README : remplacer « 14 cursus » par « 4 cursus complets + 10 aperçus » (honnêteté).

### Tests
- Unitaire : `getCourseStatus` renvoie le bon statut selon le count (Vitest).
- E2E (Playwright) : le badge « APERÇU » apparaît sur un cursus preview et pas sur html.

### Effort : S (½–1 j). Risque : faible (additif, pas de suppression de contenu).
### Critères d'acceptation
- [ ] Catalogue distingue visuellement complet vs aperçu.
- [ ] Aucun cursus n'est cassé/inaccessible.
- [ ] README aligné sur la réalité.

---

## Chantier 2 — Scénariser les messages d'erreur

### Objectif
L'immersion narrative s'arrête aujourd'hui aux messages de validation, qui sont plats
(`"Initialise le depot avec git init."`). Or l'échec est le moment le plus fréquent.
Transformer les `fail()` en « rapports d'anomalie système » conformes à la bible
narrative ([conception_storytelling.md](docs/conception_storytelling.md) §4).

### État actuel
- `fail(msg)` / `pass(msg, ...)` dans [_static-utils.ts](lib/validators/_static-utils.ts).
- Le validateur JS exécuté a aussi accès à `context.error` (vraie erreur runtime).
- Rendu : [ChapterWorkspace.tsx:210-219](components/lesson/ChapterWorkspace.tsx) affiche
  déjà `> BRECHE DETECTEE` + `feedback.msg`. Le cadre existe, c'est le `msg` qui est plat.

### Approche (la plus sûre, faible risque de régression)
Ne PAS réécrire les ~60 messages un par un. Plutôt :
1. Garder le `msg` technique existant (précis, pédagogique — il sert au debug élève).
2. Ajouter un **préfixe/cadre narratif par catégorie d'erreur** au niveau de l'affichage,
   pas du validateur. Le `BRECHE DETECTEE` actuel devient contextualisé :
   - balise/structure manquante → « Décompression secteur »
   - boucle infinie / timeout JS (détectable via `context.error`) → « Surchauffe réacteur »
   - syntaxe → « Signal brouillé »
3. Option enrichie : ajouter un champ optionnel `tone?: "structure" | "logic" | "syntax"`
   à `ValidationResult` pour que certains validateurs ciblent le bon flavor, avec
   fallback générique. Rétrocompatible (champ optionnel).

### Étapes
1. Définir un mapping `tone → en-tête narratif + icône` dans un nouveau
   `lib/narrative-feedback.ts` (testable en isolation).
2. Étendre `ValidationResult` avec `tone?` optionnel (types.ts).
3. Brancher dans ChapterWorkspace : l'en-tête `BRECHE DETECTEE` utilise le mapping.
4. Renseigner `tone` sur 2-3 validateurs pilotes (HTML structure, JS boucle) pour démo.
5. Idem côté succès : varier le `> SYSTEME EN LIGNE` (déjà bon, amélioration mineure).

### Tests
- Unitaire : mapping renvoie le bon en-tête pour chaque tone + fallback (Vitest).
- E2E : déclencher une erreur → l'en-tête narratif correspondant s'affiche.

### Effort : S (1 j). Risque : faible (champ optionnel, fallback systématique).
### Critères d'acceptation
- [ ] Les erreurs affichent un cadre narratif cohérent avec la bible.
- [ ] Les messages techniques restent lisibles pour debugger.
- [ ] Aucun validateur existant cassé (fallback).

---

## Chantier 3 — Donner une voix aux personnages

### Objectif
H.E.L.P., Kira Vesper et le Spectre sont définis dans la bible mais absents du parcours :
`narrator`/`hint`/`briefing` sont neutres. Attribuer une voix rend l'univers vivant à coût
quasi nul (présentation, pas nouveau contenu).

### Convention proposée (à valider)
- **Kira Vesper** (mentor exigeant) → `briefing` (le cours/théorie).
- **H.E.L.P.** (IA ironique) → `hint` (l'aide quand on bloque) + `narrator` d'intro.
- **Le Spectre** → réservé aux étapes-pièges / erreurs (lien avec chantier 2).

### État actuel
- Champs `narrator, hint, briefing` dans `Step` ([types.ts](data/courses/html/types.ts)).
- Affichés dans [ChapterClient.tsx](app/learn/[course]/[chapter]/ChapterClient.tsx),
  `HintBox.tsx`, `QuestBanner.tsx`.

### Étapes
1. Décider : voix **présentée au rendu** (avatar + nom devant le texte) plutôt que
   réécrire chaque champ → pas de migration de contenu massive.
2. Ajouter au rendu de `HintBox` un en-tête « H.E.L.P. » (avatar pixel + curseur clignotant).
3. Ajouter au rendu du briefing un en-tête « Ing. en chef Kira Vesper ».
4. (Optionnel) champ `speaker?` sur un sous-ensemble d'étapes pour surcharger la voix.
5. Sprites/avatars : réutiliser le pipeline pixel-art existant
   ([scripts/generate_spritesheets.py](scripts/generate_spritesheets.py), `lib/sprite-config.ts`).

### Tests
- E2E : l'en-tête « H.E.L.P. » est présent au-dessus d'un hint ; « Kira » sur un briefing.

### Effort : S (1 j). Risque : faible (cosmétique/présentation).
### Critères d'acceptation
- [ ] Hints, briefings et intros ont une voix attribuée et cohérente.
- [ ] Pas de réécriture massive du contenu existant.

---

## Chantier 4 — Visualiseur de combat (montée en puissance)

### Objectif
Transformer « valider un exercice » en « gagner un combat spatial », façon CodinGame.
Le différenciateur game majeur. **Important : ce n'est pas un départ de zéro** — un combat
minimal existe déjà.

### État actuel (à ne pas réinventer)
- [EnemySprite.tsx](components/ui/EnemySprite.tsx) gère déjà `fly`/`explode`/`none`.
- [ChapterWorkspace.tsx:138-148](components/lesson/ChapterWorkspace.tsx) : succès → explode,
  échec → fly, avec audio (`playSystemOnline`/`playBreach`) et VFX (`ParticleLayer`,
  `VFXBurst`, `SuccessFlash` existent dans `components/ui/`).
- Le doc [conception_visualiseur_combat.md](docs/conception_visualiseur_combat.md) signale
  un **bug de positionnement** : `backgroundPosition:"0px 0px"` en dur dans le style inline
  écrase l'animation X des steps CSS.

### Décision à valider : approche CSS steps() vs Canvas 2D
Recommandation : **commencer par CSS steps()** (léger, dans l'esthétique existante,
corrige le bug connu), puis évaluer le Canvas seulement si besoin d'interactivité poussée
(section 4 du doc : code de l'élève piloté frame par frame). Ne pas faire le Canvas d'emblée.

### Étapes (phase CSS)
1. Corriger le bug : retirer `backgroundPosition:"0px 0px"` inline, ne garder que
   `backgroundPositionY` ; laisser la classe `.sprite-enemy-anim` animer X via `steps()`.
2. Créer `components/lesson/CombatVisualizer.tsx` : un panneau (vaisseau joueur à gauche,
   ennemi à droite, barres bouclier/surchauffe) piloté par un `status:
   "idle"|"running"|"success"|"error"` + callback `onAnimationComplete`.
3. Séquencer : sur DÉPLOYER → `running` (charge réacteurs), puis selon résultat →
   `success` (laser cyan → fissure → explosion → saut supraluminique) ou `error`
   (contre-attaque drone → secousse écran → brèche). Réutiliser les VFX existants.
4. Brancher dans ChapterWorkspace : la modal `CompletionScreen` n'apparaît qu'après
   `onAnimationComplete` (succès), sinon le feedback erreur s'affiche après la secousse.
5. Respecter `prefers-reduced-motion` (raccourcir/désactiver l'anim) — a11y.

### Tests
- E2E : DÉPLOYER avec code correct → séquence succès → `CompletionScreen` après l'anim.
- E2E : code faux → séquence échec → `BRECHE DETECTEE`.
- Vérifier : pas de fuite de `requestAnimationFrame`/timer (cleanup au démontage).

### Effort : M (3–5 j). Risque : moyen (timing animations, perf, a11y).
### Critères d'acceptation
- [ ] Bug de positionnement corrigé.
- [ ] Séquence de combat distincte succès vs échec, fluide, sans fuite mémoire.
- [ ] `prefers-reduced-motion` respecté.
- [ ] La progression (XP/CompletionScreen) reste correcte et non bloquée par l'anim.

---

## Chantier 5 — Moteur SQL réel (sql.js / WASM)

### Objectif
SQL est le 2e cursus le plus utile en emploi mais validé par regex (l'élève ne voit aucun
résultat). Exécuter réellement les requêtes en navigateur avec
[sql.js](https://sql.js.org/) (SQLite compilé en WASM) → vrai feedback, vraies tables.

### État actuel
- `data/courses/sql/chapitre-1.ts` (1 ch) + `lib/validators/sql/` (regex via `_static-utils`).
- Le sandbox actuel n'exécute que JS ([lib/sandbox/run-js.ts](lib/sandbox/run-js.ts)).

### Étapes
1. POC isolé : charger sql.js (WASM self-hébergé — cohérent avec la décision CSP de retirer
   jsdelivr, cf. commit CF-15), créer une DB en mémoire, seed d'un schéma de démo
   (thème Nebula : `stations`, `cadets`, `missions`).
2. Créer `lib/sandbox/run-sql.ts` : exécute la requête élève, renvoie
   `{ columns, rows, error }`. Self-hébergement du `.wasm` dans `/public`.
3. Étendre `ChapterWorkspace` (ou variante) : `language: "sql"` → afficher un **tableau de
   résultats** (au lieu de la console JS / l'iframe HTML).
4. Étendre `ValidatorContext` pour SQL : passer `rows/columns` au validateur → valider sur
   le résultat réel, pas le texte.
5. Réécrire le validateur SQL ch.1 pour valider le résultat. Étendre le contenu (2-3 ch
   de plus tant qu'on y est → fait remonter SQL en « complet », lien chantier 1).
6. Vérifier la CSP (`next.config.ts`) autorise WASM (`'wasm-unsafe-eval'` si nécessaire).

### Tests
- Unitaire : `run-sql` exécute un SELECT et renvoie les bonnes lignes ; gère une requête
  invalide sans crash.
- E2E : requête correcte → tableau de résultats + succès.

### Effort : M (3–5 j). Risque : moyen (WASM, CSP, taille bundle ~1 Mo → lazy-load).
### Critères d'acceptation
- [ ] Les requêtes SQL s'exécutent réellement et affichent un tableau.
- [ ] Validation basée sur le résultat, plus uniquement regex.
- [ ] WASM self-hébergé, CSP conforme, chargé à la demande.

---

## Chantier 6 — Carte de succès partageable + mission quotidienne

### Objectif
Activer le growth loop décrit dans [strategie_acquisition.md](docs/strategie_acquisition.md)
(partage de badge → acquisition) et créer une raison de revenir (rétention), en exploitant
le streak et les badges déjà en place.

### État actuel
- Gamification existante : XP, niveaux, streak, badges (`lib/badges-catalog.ts`), avatar.
- Pas de partage social ni d'objectif quotidien.

### Sous-chantier A — Carte de succès (OG image dynamique)
1. Route `app/api/share/[badge]/route.tsx` avec `next/og` (`ImageResponse`) générant une
   carte pixel-art : avatar + grade + pseudo + badge.
2. Bouton « Partager » sur l'écran de complétion / page profil → URL avec meta OG
   (LinkedIn/Twitter affichent l'image). Texte pré-rempli + lien de parrainage (placeholder
   si le parrainage n'est pas encore implémenté).
3. RGPD : ne pas exposer d'email ; pseudo/avatar seulement. Vérifier
   [docs/RGPD.md](docs/RGPD.md).

### Sous-chantier B — Mission quotidienne
1. Modèle Prisma : `DailyMission` ou champ sur l'utilisateur (date + statut + récompense).
2. Logique : 1 mission/jour, bonus XP, entretient le streak existant.
3. UI dashboard : encart « Mission du jour » + état (à faire / fait).

### Tests
- L'image OG se génère sans erreur (snapshot/route test).
- Unitaire : logique de reset quotidien et anti-double-réclamation.
- E2E : encart mission du jour visible et réclamable une seule fois.

### Effort : M (3–5 j, A et B séparables). Risque : moyen (OG runtime, migration Prisma).
### Critères d'acceptation
- [ ] Carte de succès partageable avec preview OG correcte, sans données perso.
- [ ] Mission quotidienne réclamable 1×/jour, alimente le streak.

---

## Décisions validées (2026-06-29)
- Seuil cursus complet : **≥ 4 chapitres** (HTML, CSS, JS, React complets).
- Visualiseur de combat : **CSS steps() d'abord**.
- Lancement : **quick wins 1 + 2 + 3**.

## Statut d'exécution
- **Chantier 1 — FAIT** (branche `feat/quick-wins-pedago`). `getCourseStatus` +
  `COURSE_COMPLETE_MIN_CHAPTERS` ([courses-catalog.ts](lib/courses-catalog.ts) + test),
  badge « APERCU » et tri ([learn/page.tsx](app/learn/page.tsx)), bandeau chapitre pilote
  ([learn/[course]/page.tsx](app/learn/[course]/page.tsx)), README aligné.
- **Chantier 2 — FAIT.** [narrative-feedback.ts](lib/narrative-feedback.ts) (en-têtes par
  tonalité + inférence depuis l'erreur JS, testés), `tone?` sur `ValidationResult`
  ([types.ts](data/courses/html/types.ts)), branché dans
  [ChapterWorkspace.tsx](components/lesson/ChapterWorkspace.tsx), tonalités pilotes posées
  sur [validators/html/chapitre-1.ts](lib/validators/html/chapitre-1.ts).
- **Chantier 3 — FAIT.** Casting centralisé ([characters.ts](lib/characters.ts)) ;
  H.E.L.P. sur les hints ([HintBox.tsx](components/ui/HintBox.tsx), remplace « ARIA »),
  Kira Vesper sur les briefings ([ChapterClient.tsx](app/learn/[course]/[chapter]/ChapterClient.tsx)).
- Vérif : `tsc` OK, `lint` OK (1 warning préexistant hors périmètre), **187 tests unitaires verts**.
- **Chantier 4 — FAIT (approche CSS).** [CombatVisualizer.tsx](components/lesson/CombatVisualizer.tsx) :
  canon joueur + laser cyan + explosion ennemie sur succès ; balayage ennemi + secousse
  console sur échec. Bug de positionnement [EnemySprite.tsx](components/ui/EnemySprite.tsx)
  corrigé (Y seul). Keyframes + garde `prefers-reduced-motion` dans
  [globals.css](app/globals.css). Intégré non-bloquant dans
  [ChapterWorkspace.tsx](components/lesson/ChapterWorkspace.tsx).
  Vérif : `tsc` OK, `lint` OK, **187 tests**, **`next build` 0 erreur**. ⚠ Vérif visuelle
  in-app et e2e à faire sur l'environnement du dev (DB + auth requis ici indisponibles).
- Reste optionnel : généraliser les tonalités à plus de validateurs ; étendre les voix
  via sprites pixel-art ; assertions e2e dédiées ; gating optionnel de la bannière
  derrière la fin d'animation (section 1 du doc combat) ; passer au Canvas 2D si besoin
  d'interactivité (section 4 du doc combat).

## Prochaine étape
Valider chantier par chantier (notamment les 3 décisions ouvertes : seuil « complet » §1,
approche tone §2, CSS vs Canvas §4), puis lancer les chantiers retenus — idéalement en
TDD, un chantier = une branche.
