# Spec — Visualiseur de combat thématisé par cursus (tâche 5)

> Rédigé le 2026-07-13. Le visualiseur de combat est aujourd'hui identique pour
> tous les cursus (canon + laser + explosion). On le thématise pour que le geste
> de succès reflète le cursus, aligné sur la bible §3 réconciliée.
> Source : [analyse_coherence_modules.md](../../analyse_coherence_modules.md) (tâche 5).
> Décisions validées avec l'utilisateur (§2).

## 1. Objectif

Donner au **beat de succès** du [CombatVisualizer](../../../components/lesson/CombatVisualizer.tsx)
une identité par cursus : JS arme les tourelles (existant), HTML reconstruit la
structure, CSS lève un champ graphique. Différenciateur « game » à faible coût,
sans nouvel asset (CSS pur, esthétique 16-bit existante).

## 2. Décisions validées

- **Beat CSS** = champ d'énergie graphique (halo/dôme), cadré « la console graphique
  projette un champ » — cohérent avec la bible §3 réconciliée (« Console Graphique du Dock »).
- **Beat d'échec** = inchangé et **partagé** pour tous les cursus (contre-attaque ennemie + secousse).
- **Portée** : `html→repair`, `css→field`, `javascript→turret` ; tous les autres cursus
  (sql, react, typescript, aperçus) tombent sur `turret` par **défaut** — zéro régression ailleurs.

## 3. Architecture

### 3.1 Helper pur — `lib/combat-theme.ts` (+ `lib/combat-theme.test.ts`)
```ts
export type CombatTheme = "turret" | "repair" | "field";

/** Thème de combat d'un cursus. Défaut « turret » pour tout cursus non ciblé. */
export function combatThemeForCourse(course: string): CombatTheme {
  if (course === "html") return "repair";
  if (course === "css") return "field";
  return "turret"; // javascript + tout le reste
}
```
Note : le paramètre est le **slug de cursus** (`"html"`, `"css"`, `"javascript"`…),
pas le `language` du workspace (qui collapse HTML et CSS en `"html"`).

### 3.2 Câblage
- [ChapterClient.tsx](../../../app/learn/[course]/[chapter]/ChapterClient.tsx) connaît `course` :
  il calcule `combatThemeForCourse(course)` et le passe en prop `combatTheme` à `ChapterWorkspace`.
- [ChapterWorkspace.tsx](../../../components/lesson/ChapterWorkspace.tsx) accepte `combatTheme?: CombatTheme`
  (défaut `"turret"`) et le transmet à `<CombatVisualizer theme={combatTheme} … />`.

### 3.3 `CombatVisualizer` — beats de succès par thème
Ajouter un prop `theme: CombatTheme` (défaut `"turret"`). Le beat d'échec (`fly`)
reste identique. Le beat de succès (`explode`) branche selon `theme` :

| Thème | Beat de succès (CSS) | Ennemi |
|---|---|---|
| `turret` (JS) | **Inchangé** : émetteur charge + laser cyan (`animate-emitter-charge`, `animate-laser-fire`) | explose (`EnemySprite type="explode"`) |
| `repair` (HTML) | Un module de structure s'assemble à gauche + flash de soudure **vert** (nouveau `animate-combat-repair`) | explose |
| `field` (CSS) | Un dôme/halo d'énergie **cyan** se déploie autour de l'émetteur (nouveau `animate-combat-field`) | explose |

L'ennemi qui explose (`EnemySprite`) et le déclenchement par `trigger` restent communs.
Le composant reste `aria-hidden` et non bloquant.

### 3.4 CSS — `app/globals.css`
- Deux nouveaux keyframes + classes : `animate-combat-repair` (assemblage + flash vert,
  couleur `--green`) et `animate-combat-field` (dôme qui s'étend puis s'estompe, couleur `--cyan`).
- Les ajouter au bloc `prefers-reduced-motion` existant (celui qui neutralise déjà les
  animations de combat) pour qu'elles s'effondrent comme les autres.

## 4. Fichiers touchés

| Fichier | Nature |
|---|---|
| `lib/combat-theme.ts` (+ `.test.ts`) | nouveau — helper pur + type + tests |
| `components/lesson/CombatVisualizer.tsx` | prop `theme` + branches de succès |
| `components/lesson/ChapterWorkspace.tsx` | prop `combatTheme` transmis |
| `app/learn/[course]/[chapter]/ChapterClient.tsx` | calcule et passe `combatTheme` |
| `app/globals.css` | keyframes `repair`/`field` + reduced-motion |

## 5. Tests
- **Unitaire (Vitest)** : `combatThemeForCourse` — `html→repair`, `css→field`,
  `javascript→turret`, un cursus inconnu (`"sql"`, `"react"`) → `turret`.
- **Composant** : pas de test de rendu (client, Vitest node) → vérif `tsc`/`eslint`/`next build`.
- **Visuel (navigateur)** : sur un chapitre HTML, CSS et JS, déclencher un succès et vérifier
  que le beat correspond (soudure verte / dôme cyan / laser). Vérifier reduced-motion.

## 6. Critères d'acceptation
- [ ] Le beat de succès diffère visuellement entre HTML (repair), CSS (field) et JS (turret).
- [ ] Les cursus non ciblés gardent le beat `turret` (aucune régression).
- [ ] Le beat d'échec reste identique et partagé.
- [ ] `combatThemeForCourse` testé ; `tsc`/`lint`/tests verts ; `next build` OK.
- [ ] Les nouveaux beats s'effondrent sous `prefers-reduced-motion`.

## 7. Hors périmètre
Thématiser le beat d'échec ; nouveaux sprites/art ; beats pour les cursus aperçu.
Tâches 6 (arc méta) et 7 (docRefs) restent des specs distinctes.
