# Spec — Cohérence narrative des modules HTML / CSS / JS (lot 1-2-3)

> Rédigé le 2026-07-12. Généralise à HTML et CSS le traitement narratif déjà en
> place sur JavaScript, pour un rendu cohérent d'un cursus à l'autre.
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md).
> Décisions validées avec l'utilisateur (voir §2).

## 1. Objectif

Rendre les trois cursus complets (HTML 8 ch, CSS 10 ch, JS 12 ch) cohérents sur trois
axes : l'identité du joueur, la scénarisation des erreurs, et la voix des personnages.
Périmètre volontairement restreint aux tâches 1-2-3 du backlog (quick wins de cohérence,
faible risque). Les tâches 4-7 (métaphores, combat par cursus, arc méta, panneau de
référence) sont hors périmètre et feront l'objet de specs distinctes.

## 2. Décisions validées

| Tâche | Décision |
|---|---|
| 1 — Identité | Adresse au joueur = **« Cadet »** partout ; **garder** les libellés de badges/grades contenant « Ingénieur » (grade gagné, pas une adresse). |
| 2 — Erreurs | **Défaut de tonalité par langage** appliqué au centre + override par validateur conservé. Pas de réécriture des ~95 validateurs. |
| 3 — Kira | Réplique de Kira en tête du **premier briefing de chaque chapitre** HTML + CSS (parité avec JS). |

## 3. Tâche 1 — Identité unifiée « Cadet »

### Règle
Toute **adresse au joueur** dans les champs `narrator` / `hint` / `briefing.content`
utilise « Cadet ». On corrige :
- HTML : les narrateurs qui disent « Ingénieur » (ex. [html/chapitre-1.ts](../../../data/courses/html/chapitre-1.ts) :
  « Ingénieur, nous commençons… » → « Cadet, nous commençons… »).
- CSS : « cadet » minuscule → « Cadet » ([css/chapitre-1.ts](../../../data/courses/css/chapitre-1.ts)).

### Hors périmètre (on garde tel quel)
- Les `completionBadgeLabel` / grades comme « INGÉNIEUR SÉLÉNÉ », « INITIATEUR GRAPHIQUE » :
  ce sont des grades gagnés, cohérents avec la bible (« Cadet en Ingénierie »).
- Le mot « ingénieur » employé comme **métier** dans une explication (pas comme adresse).

### Livrable
Le plan d'implémentation énumérera les occurrences exactes (via grep) et l'édition de
chacune. Aucune logique, uniquement du contenu.

## 4. Tâche 2 — Scénarisation d'erreur généralisée

### Principe
Aujourd'hui `tone` n'est posé qu'à la main, par branche de validateur, et presque nulle
part → l'en-tête d'erreur retombe sur le générique « BRECHE DETECTEE » sur ~95 % des
étapes. On introduit un **défaut par langage**, résolu au centre, sans toucher les
validateurs (qui peuvent toujours surcharger via le champ optionnel `tone`).

### Le langage côté workspace
`ChapterWorkspace` connaît `language: "html" | "javascript" | "sql"`. **Le cursus CSS est
servi en `"html"`** (document HTML avec `<style>`), donc il hérite du défaut html — aucun
cas CSS séparé à gérer.

### Helper pur (testable) — `lib/narrative-feedback.ts`
```ts
const DEFAULT_TONE_BY_LANGUAGE: Record<"html" | "javascript" | "sql", ErrorTone | undefined> = {
  html: "structure",   // HTML + CSS : une erreur = décompression secteur
  javascript: undefined, // on garde l'inférence runtime ; sinon générique
  sql: undefined,        // générique pour l'instant
};

/**
 * Résout la tonalité d'un échec : priorité au tone du validateur, puis à
 * l'inférence depuis l'erreur JS runtime, puis au défaut du langage.
 */
export function resolveErrorTone(
  validatorTone: ErrorTone | undefined,
  jsError: string | null,
  language: "html" | "javascript" | "sql",
): ErrorTone | undefined {
  return validatorTone ?? inferToneFromError(jsError) ?? DEFAULT_TONE_BY_LANGUAGE[language];
}
```

### Branchement — `components/lesson/ChapterWorkspace.tsx`
La branche d'échec passe de :
```ts
tone: result.tone ?? inferToneFromError(jsError),
```
à :
```ts
tone: resolveErrorTone(result.tone, jsError, language),
```
`getErrorHeader(undefined)` renvoie déjà le générique, donc JS/SQL sans tone restent
sur « BRECHE DETECTEE » (comportement inchangé, zéro régression).

### Tests
Unitaire (Vitest) sur `resolveErrorTone` : priorité validateur > inférence > défaut ;
html→structure quand rien d'autre ; javascript→undefined (générique) quand pas d'inférence ;
une erreur de boucle JS → logic malgré le langage.

## 5. Tâche 3 — Kira incarnée sur HTML + CSS

### Règle
Prépendre une réplique de Kira (sa voix : pragmatique, exigeante, registre station) en
tête du `briefing.content` du **premier `step` de chaque chapitre**, format identique à JS :
```md
*« … »* — **Kira**

### <premier titre existant>
```
Portée : HTML chapitres 1-8, CSS chapitres 1-10 → **18 répliques bespoke**, chacune reliée
au concept du chapitre (ex. HTML ch1 = fondations/structure, CSS ch1 = premier style).

### Rendu (déjà en place, rien à faire)
Le bandeau « Kira Vesper » coiffe déjà tous les briefings ([ChapterClient.tsx](../../../app/learn/[course]/[chapter]/ChapterClient.tsx)) ;
H.E.L.P. coiffe déjà tous les hints ([HintBox.tsx](../../../components/ui/HintBox.tsx)).
La tâche est donc d'écrire la prose en voix, pas de câbler du rendu.

### Voix de Kira (guide)
Pragmatique, endurcie, exigeante mais juste ; registre station/systèmes ; tutoie le
« Cadet » ; 1 à 2 phrases ; pas de vocabulaire forgeron.

### Tests
Optionnel : test d'intégrité vérifiant que le premier briefing de chaque chapitre HTML/CSS
contient « Kira » (garde anti-régression). Sinon, vérification par build + revue.

## 6. Fichiers touchés

| Fichier | Tâche | Nature |
|---|---|---|
| `data/courses/html/chapitre-{1..8}.ts` | 1 + 3 | contenu (adresse + intro Kira) |
| `data/courses/css/chapitre-{1..10}.ts` | 1 + 3 | contenu (adresse + intro Kira) |
| `lib/narrative-feedback.ts` (+ `.test.ts`) | 2 | `resolveErrorTone` + tests |
| `components/lesson/ChapterWorkspace.tsx` | 2 | branche l'appel |

## 7. Critères d'acceptation

- [ ] Aucune adresse « Ingénieur » / « cadet » minuscule au joueur ne subsiste dans HTML/CSS ;
      les libellés de grade « Ingénieur … » sont conservés.
- [ ] Un échec HTML **ou** CSS affiche un en-tête narratif (`structure`) au lieu du générique.
- [ ] Une erreur de boucle JS reste `logic` ; un échec JS sans erreur runtime reste générique
      (pas de régression).
- [ ] Le premier briefing de chaque chapitre HTML (8) et CSS (10) porte une réplique de Kira
      cohérente avec le concept.
- [ ] `resolveErrorTone` est testé ; `tsc` / `lint` / tests verts ; `next build` OK.

## 8. Hors périmètre (specs ultérieures)

Tâches 4 (réconcilier bible §3 ↔ cours), 5 (combat thématisé par cursus), 6 (arc méta +
étapes-pièges du Spectre), 7 (panneau de référence CSS/JS).
