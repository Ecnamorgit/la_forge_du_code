# Analyse — Cohérence Game Design & Storytelling (modules HTML / CSS / JS)

> Rédigé le 2026-07-12. Audit de l'alignement narratif et ludique entre les trois
> cursus complets (HTML, CSS, JavaScript) et backlog priorisé pour les rendre cohérents.
> Fondé sur l'état réel du code, pas sur les intentions.

## 1. Inventaire de l'existant

### Couche narrative
- **Bible** ([conception_storytelling.md](conception_storytelling.md)) : univers Nebula Command ;
  3 personnages — **Kira Vesper** (briefings), **H.E.L.P.** (hints), **Le Spectre** (erreurs) ;
  scénarisation des erreurs en « rapports d'anomalie système ».
- **Cinématique d'accueil** (livrée) — [scenario_espace.md](scenario_espace.md), moteur sprite-sheet + placeholder.
- **Casting rendu partout** : le bandeau « Kira Vesper » coiffe chaque briefing
  ([ChapterClient.tsx](../app/learn/[course]/[chapter]/ChapterClient.tsx)), H.E.L.P. chaque hint
  ([HintBox.tsx](../components/ui/HintBox.tsx)), Le Spectre raille après 2 échecs
  ([ChapterWorkspace.tsx](../components/lesson/ChapterWorkspace.tsx), [narrative-feedback.ts](../lib/narrative-feedback.ts)).

### Mécaniques de jeu
- XP / niveaux / streak / badges de complétion ; mission quotidienne ; carte de succès partageable.
- Visualiseur de combat sur DÉPLOYER ([CombatVisualizer.tsx](../components/lesson/CombatVisualizer.tsx)) —
  **générique, identique pour tous les cursus**.
- Le Spectre (raillerie sur échec répété) — **universel**.

### Traitement par module

| | HTML (8 ch) | CSS (10 ch) | JS (12 ch) |
|---|---|---|---|
| Narrateur mis en voix | oui | oui | oui |
| Intro **Kira** en prose | non | non | oui |
| Adresse au joueur | « Ingénieur » | « cadet » | « Cadet » |
| Erreurs scénarisées (`tone`) | ch.1 seulement | aucune | 1 cas (boucle) |
| Panneau de référence (`docRefs`) | oui (8 ch) | non | non |
| Métaphore de cours | base lunaire | dock graphique | station / vaisseau |

## 2. Diagnostic — les 6 fractures de cohérence

1. **Identité du joueur incohérente.** HTML « Ingénieur », CSS « cadet », JS « Cadet ».
2. **Kira étiquetée mais pas incarnée hors JS.** Le bandeau « Kira Vesper » coiffe les
   briefings HTML/CSS, mais la prose est un narrateur neutre. La plaque ment sur ~18 chapitres.
3. **Scénarisation des erreurs = pilote fantôme.** `tone` n'est posé que sur
   [validators/html/chapitre-1.ts](../lib/validators/html/chapitre-1.ts). Tous les autres
   validateurs retombent sur le générique « BRECHE DETECTEE » → l'échec est plat sur ~95 % des étapes.
4. **La bible §3 contredit les cours.** La bible mappe `header` = passerelle, `flexbox` = hangar…
   mais les cours emploient d'autres métaphores (base lunaire, dock). Deux sources divergentes.
5. **Asymétrie pédagogique.** Le panneau de référence (`docRefs`) n'existe que pour HTML ;
   CSS et JS n'ont pas cet appui.
6. **Pas d'arc méta.** Aucune progression ne raconte la guerre contre le Null : le Spectre
   ne fait que railler, sans étapes-pièges ni « recul de la menace » visible.

## 3. Backlog priorisé (impact / effort)

| # | Tâche | Portée | Effort | Impact |
|---|---|---|---|---|
| 1 | **Unifier l'identité** → « Cadet » partout (corriger HTML « Ingénieur », CSS). | HTML+CSS | S | Cohérence : fort |
| 2 | **Généraliser la scénarisation d'erreur** : poser `tone` (`structure`/`syntax`/`logic`) sur les validateurs HTML/CSS/JS. | 3 cursus | M | Immersion : fort |
| 3 | **Incarner Kira + H.E.L.P. uniformément** : réplique Kira en tête de briefing + hints en voix H.E.L.P. sur HTML/CSS (pattern JS). | HTML+CSS | M | Immersion : moyen |
| 4 | **Réconcilier bible §3 ↔ cours** : trancher la métaphore par concept et l'appliquer. | Docs + cours | S/M | Cohérence : moyen |
| 5 | **Thématiser le combat par cursus** : HTML = réparer la structure, CSS = boucliers, JS = tourelles (bible §3). | 3 cursus | M | Game : moyen |
| 6 | **Arc méta** : barre « recul du Null » par cursus + étapes-pièges où Le Spectre injecte du code corrompu. | Transverse | L | Game : fort |
| 7 | **Parité référence** : étendre `docRefs` à CSS puis JS. | CSS+JS | L | Pédago : moyen |

**Ordre recommandé :** 1 → 2 → 3 (quick wins de cohérence, faible risque, généralisation
du travail déjà fait sur JS), puis 4, puis 5/6 (différenciateurs game), 7 en dernier.

Les tâches 1, 2, 3 sont la généralisation à HTML/CSS de ce qui existe déjà sur JS —
donc faible risque et fort effet « produit fini ».
