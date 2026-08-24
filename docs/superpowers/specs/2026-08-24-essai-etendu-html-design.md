# Essai étendu « premiers niveaux HTML » — Design

**Date :** 2026-08-24
**Statut :** validé en brainstorming, en attente de relecture de la spec

## 1. Objectif

Donner au visiteur sans compte un vrai avant-goût du jeu : les trois premiers
chapitres du cursus HTML jouables avec l'expérience complète — carte du
cursus, cinématiques (intro + outros), XP, niveaux et level-up — puis une
conversion au moment où il est le plus investi.

**Décisions de brainstorming :**

- Périmètre : chapitres 1-3 de HTML + la carte `/learn/html`. Les chapitres
  4-8 restent derrière le mur d'authentification.
- Progression visible en essai : XP + niveaux + overlay de level-up. Badges,
  quêtes quotidiennes, classement, cosmétiques restent réservés au compte et
  apparaissent verrouillés (teasing).
- Cinématiques en essai : intro du cursus + outros des chapitres 1-3, en
  localStorage. La finale reste une récompense d'inscrit (chapitre 8
  verrouillé).
- Carte : la vraie page `/learn/[course]` rendue en mode dégradé pour les
  visiteurs (pas de page d'essai dédiée).
- Conversion : la carte de conversion passe de la fin du chapitre 1 à la fin
  du chapitre 3, après l'outro. Cliquer un chapitre verrouillé sur la carte
  mène à l'inscription.

## 2. Contexte existant

- [lib/public-routes.ts](../../../lib/public-routes.ts) : `TRIAL_COURSE = "html"`,
  `TRIAL_CHAPTER = "chapitre-1"`, `PUBLIC_TRIAL_ROUTES` en égalité exacte
  (jamais par préfixe — commentaire chapitre-10 à préserver), consommé par
  `proxy.ts` (mur d'auth) et `app/robots.ts`.
- [lib/trial-user.ts](../../../lib/trial-user.ts) : état localStorage
  `nc_trial_state` de forme `{ completedSteps: number[], xp: number }` — un
  seul chapitre, non indexé par chapitre.
- [lib/trial-import.ts](../../../lib/trial-import.ts) : filtre serveur
  paranoïaque des étapes importées à l'inscription (double protection :
  rejets en égalité stricte + reconstruction des valeurs en dur). À étendre,
  en préservant les deux protections.
- `app/api/me/trial-import/route.ts` : import à l'inscription (rate-limité).
- `app/learn/[course]/page.tsx` : page carte, server component ; l'auth est
  assurée par le middleware (`proxy.ts`), pas par la page — elle devra
  tolérer l'absence de session.
- `ChapterClient` : gardes `isTrial` existantes (bannière, pas de
  CompletionScreen, pas de cinématiques, retour → accueil, conversion en fin
  de chapitre via `showConversion = isTrial && chapterDone`).
- [lib/cinematics/use-cinematic-seen.ts](../../../lib/cinematics/use-cinematic-seen.ts) :
  hook `useCinematicSeen(course, enabled)` — `enabled=false` = aucun réseau,
  `loaded` reste false (donc jamais d'auto-play). À faire évoluer.
- [lib/grades.ts](../../../lib/grades.ts) : `levelFromXp` — réutilisé tel
  quel pour les niveaux en essai.

## 3. Routes et source de vérité du périmètre

Dans `lib/public-routes.ts` :

```ts
export const TRIAL_COURSE = "html";
/** Chapitres ouverts à l'essai, dans l'ordre. */
export const TRIAL_CHAPTERS: readonly string[] = [
  "chapitre-1",
  "chapitre-2",
  "chapitre-3",
];
/** Rétrocompat : dernier chapitre d'essai (fin de l'essai = conversion). */
export const TRIAL_LAST_CHAPTER = TRIAL_CHAPTERS[TRIAL_CHAPTERS.length - 1];

export const PUBLIC_TRIAL_ROUTES: readonly string[] = [
  `/learn/${TRIAL_COURSE}`,
  ...TRIAL_CHAPTERS.map((c) => `/learn/${TRIAL_COURSE}/${c}`),
];
```

- `TRIAL_CHAPTER` (singulier) disparaît ; tous ses consommateurs migrent vers
  `TRIAL_CHAPTERS`.
- `isPublicRoute` inchangé (égalité exacte). La carte `/learn/html` devient
  publique ; `/learn/html/chapitre-4` et suivants restent protégés.
- `TRIAL_CHAPTERS` est LA source de vérité : routes publiques, filtre
  d'import, verrous de la carte, bornes de l'état d'essai.

## 4. Carte du cursus en mode essai

`app/learn/[course]/page.tsx` (et ses composants) :

- Sans session ET cursus === `TRIAL_COURSE` : rendu de la carte en mode
  essai. Sans session sur un autre cursus : le middleware redirige déjà
  (aucun changement).
- En mode essai : progression des nœuds lue depuis l'état d'essai local
  (composant client), nœuds des chapitres hors `TRIAL_CHAPTERS` verrouillés
  avec libellé « 🔒 Inscription requise » et lien vers `/signup`, bandeau
  d'essai (`TrialBanner`) affiché, blocs liés au compte (badges, quêtes,
  classement, cosmétiques) rendus verrouillés/grisés avec une mention
  « Réservé aux Cadets inscrits ».
- Cinématiques sur la carte : `CourseCinematicsMount` monté aussi en essai,
  en mode localStorage (cf. §6) — intro auto-jouée à la première visite,
  « Revoir le briefing » fonctionnel, « Revoir la finale » jamais visible en
  essai (la finale ne peut pas avoir été vue).

## 5. État d'essai multi-chapitres

`lib/trial-user.ts` :

```ts
export interface TrialState {
  /** Index des étapes validées, par slug de chapitre d'essai. */
  chapters: Record<string, number[]>;
  xp: number;
}
```

- **Migration silencieuse** dans `parseTrialState` : l'ancienne forme
  `{ completedSteps, xp }` est reconnue et convertie en
  `{ chapters: { "chapitre-1": completedSteps }, xp }`. Jamais d'exception,
  jamais de perte de l'avancement d'un visiteur actuel.
- Les écritures ignorent tout chapitre hors `TRIAL_CHAPTERS` (borne).
- Niveaux : `levelFromXp` sur l'XP d'essai ; l'overlay de level-up
  (`LevelUpOverlay`) se déclenche en essai comme pour un inscrit — retirer la
  garde `isTrial` correspondante dans `ChapterClient` (uniquement celle du
  level-up ; les autres gardes listées en §7 évoluent comme décrit là-bas).

## 6. Cinématiques en essai (mode localStorage)

`lib/cinematics/use-cinematic-seen.ts` : le paramètre `enabled: boolean`
devient `mode: "server" | "local" | "off"` :

- `"server"` (défaut) : comportement actuel (GET/POST `/api/me/cinematic`).
- `"local"` : lecture/écriture d'un tableau d'ids JSON sous la clé
  localStorage `nc_cine_seen` ; `loaded` passe à true après lecture (storage
  indisponible → `loaded` reste false, donc pas d'auto-play — même politique
  qu'aujourd'hui) ; `mark` écrit localement, aucun réseau.
- `"off"` : l'actuel `enabled=false` (aucune lecture, aucun réseau, `loaded`
  false). Conservé pour les cursus non-essai en mode essai.
- Appelants : `CourseCinematicsMount` et `ChapterClient` choisissent
  `"local"` quand le visiteur est en essai sur `TRIAL_COURSE`, `"off"` en
  essai ailleurs, `"server"` connecté.
- La logique pure de (dé)sérialisation du tableau d'ids est extraite et
  testée (même patron que `parseTrialState`).

## 7. Parcours de chapitre et conversion

Dans `ChapterClient` :

- Les cinématiques d'outro jouent en essai pour les chapitres d'essai (la
  garde `!isTrial` du lecteur devient « connecté OU chapitre d'essai en mode
  local »).
- La carte de conversion (`TrialConversion`) ne s'affiche plus en fin de
  chaque chapitre : `showConversion = isTrial && chapterDone && chapter.slug === TRIAL_LAST_CHAPTER`.
  Fin des chapitres 1 et 2 en essai : l'outro joue, puis navigation vers le
  chapitre suivant (le lien « chapitre suivant » pointe vers la route
  publique suivante ; le CompletionScreen reste réservé aux connectés).
- Fin du chapitre 3 : outro (« activité du Spectre près de l'arsenal… »),
  puis la carte de conversion — le rebondissement du chapitre 4 est juste
  derrière le mur.
- Le lien retour en essai pointe vers `/learn/html` (la carte, désormais
  publique) au lieu de l'accueil.

## 8. Import à l'inscription

- `lib/trial-import.ts` : `filterTrialSteps` accepte les chapitres de
  `TRIAL_CHAPTERS` (Set), en conservant les deux protections existantes
  (rejets stricts + valeurs reconstruites en dur — le chapitre retenu est
  celui du Set, jamais la chaîne fournie). `MAX_STEPS` reste une borne
  globale.
- `app/api/me/trial-import/route.ts` : le corps accepte en plus
  `seenCinematics: string[]` (optionnel) ; côté serveur, seuls les ids
  légitimes d'essai sont retenus — construits en dur depuis `TRIAL_COURSE` et
  `TRIAL_CHAPTERS` (`html:intro`, `html:chapter:chapitre-1..3`) — puis
  enregistrés via `markCinematicView` (idempotent).
- Côté client, l'appel d'import envoie l'état multi-chapitres + les ids de
  `nc_cine_seen`, puis nettoie les deux clés localStorage (comportement de
  nettoyage actuel conservé).

## 9. Gestion d'erreur

- localStorage indisponible : essai jouable sans persistance (comportement
  actuel), cinématiques considérées vues (pas d'auto-play), conversion
  toujours proposée.
- État d'essai corrompu : `parseTrialState` renvoie l'état vide (inchangé).
- Import : entrées hors périmètre silencieusement ignorées (inchangé) ;
  `seenCinematics` invalide → ignoré, l'import des étapes n'échoue pas pour
  autant.

## 10. Sécurité

- Le mur d'auth ne s'ouvre que sur les routes exactes listées ; aucun match
  par préfixe.
- L'import ne peut créditer que ce que l'essai permet d'atteindre : chapitres
  du Set, ids de cinématiques reconstruits en dur. Un appel forgé ne peut ni
  valider le chapitre 4, ni marquer la finale comme vue.
- Aucune donnée d'essai n'est envoyée au serveur avant l'inscription.

## 11. Tests

- **Vitest** : migration `parseTrialState` (ancienne forme, forme neuve,
  corrompue), bornes `TRIAL_CHAPTERS` en écriture, `isPublicRoute` sur les
  nouvelles routes (carte publique, chapitre-4 protégé, pas de préfixe),
  `filterTrialSteps` multi-chapitres (rejets stricts conservés), filtre des
  `seenCinematics` côté serveur, (dé)sérialisation `nc_cine_seen`, mode
  `"local"` du hook (logique pure extraite).
- **E2E** : parcours d'essai — carte visible sans compte avec ch. 4-8
  verrouillés, intro jouée puis skippée, ch. 1 joué avec outro puis
  navigation ch. 2, accès direct `/learn/html/chapitre-4` → redirection
  login, conversion visible en fin de ch. 3 seulement ; non-régression du
  parcours connecté et de l'import à l'inscription.

## 12. Découpage indicatif

1. Routes + source de vérité `TRIAL_CHAPTERS` (public-routes + robots) — TDD.
2. État d'essai multi-chapitres + migration — TDD.
3. Hook cinématiques mode `"local"` + extraction logique pure — TDD.
4. Carte en mode essai (page + verrous + teasing + cinématiques).
5. ChapterClient : outros en essai, conversion fin ch. 3, navigation.
6. Import étendu (filtre + route + client) — TDD.
7. E2E.
