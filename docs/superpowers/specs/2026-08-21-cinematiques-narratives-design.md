# Cinématiques narratives — Design

**Date :** 2026-08-21
**Statut :** validé en brainstorming, en attente de relecture de la spec

## 1. Objectif

Donner au parcours d'apprentissage la sensation de progression d'un jeu vidéo en
insérant des mini-cinématiques narratives aux moments clés de chaque cursus :

- **Intro de cursus** : briefing de mission (l'alerte, l'enjeu, « à nous de
  jouer ») à la première visite de la page du cursus.
- **Outro de chapitre** : courte scène narrative à la validation du dernier
  exercice d'un chapitre — l'histoire avance (secteur réparé, contre-attaque du
  Spectre, rebondissement à mi-parcours).
- **Finale de cursus** : grande cinématique de victoire à la validation du
  dernier chapitre, façon générique de fin de jeu vidéo (récap des systèmes
  restaurés, félicitations de Kira, teasing du cursus suivant).

**Hors périmètre (décisions de brainstorming) :**

- Pas de transition entre les exercices d'un même chapitre (fatigue, casse le
  flow).
- Pas de vidéos générées (Google Labs) : tout passe par le moteur de scènes,
  cohérent avec le pixel art du site. Le format de scène reste extensible si un
  jour une vraie vidéo est voulue pour une finale.

## 2. Contexte existant sur lequel on s'appuie

- [lib/intro.ts](../../../lib/intro.ts) : moteur de la cinématique d'intro du
  site — scènes `{ id, narration, visual }`, auto-défilement
  (`INTRO_SCENE_DURATION_MS = 4500`), persistance « vue une fois ». C'est le
  modèle que l'on généralise.
- [lib/characters.ts](../../../lib/characters.ts) et
  [docs/conception_storytelling.md](../../conception_storytelling.md) : les
  personnages (Kira Vesper, H.E.L.P., le Spectre) et la bible narrative.
- [lib/narrative-feedback.ts](../../../lib/narrative-feedback.ts) : le ton
  in-universe des feedbacks (à réutiliser tel quel, pas de doublon).
- `ChapterClient` ([app/learn/[course]/[chapter]/ChapterClient.tsx](../../../app/learn/%5Bcourse%5D/%5Bchapter%5D/ChapterClient.tsx)) :
  le flux de succès (`handleStepSuccess`, `isChapterComplete`) où se branche
  l'outro de chapitre.
- Prisma `StepCompletion` : modèle de la progression par utilisateur ; la
  persistance « cinématique vue » suit le même patron.

## 3. Modèle de données — `lib/cinematics/`

### 3.1 Types (logique pure, testable en node)

```ts
export type Speaker = "kira" | "help" | "spectre" | "system";
export type SceneFx = "none" | "alert" | "glitch" | "victory";

export interface CinematicScene {
  id: number;               // index stable dans la cinématique
  speaker: Speaker;         // portrait + couleur de dialogue
  narration: string;        // vrai texte, lisible par lecteur d'écran
  visual: string;           // variante visuelle (assets/placeholder existants)
  fx?: SceneFx;             // effet CSS thématique
}

export interface Cinematic {
  id: string;               // ex. "html:intro", "html:chapter:balises", "html:finale"
  scenes: CinematicScene[];
}

export interface CourseCinematics {
  courseIntro: Cinematic;
  chapterOutros: Record<string, Cinematic>; // clé = slug de chapitre
  courseFinale: Cinematic;
}
```

### 3.2 Contenu par cursus + repli générique

- Chaque cursus **peut** déclarer ses cinématiques dans
  `data/courses/<slug>/cinematics.ts` (même patron que le contenu de cours
  existant). Ajouter un arc = ajouter ce fichier, zéro changement de code.
- Un résolveur `getCinematic(course, moment)` dans `lib/cinematics/` renvoie la
  cinématique du cursus si elle existe, sinon une cinématique du **pool
  générique** (scènes de félicitations/briefing réutilisables, choisies de
  façon déterministe pour rester testables — même patron que
  `SPECTRE_TAUNTS`).
- **Périmètre initial :** arc complet écrit pour le cursus **HTML** (le dock
  d'amarrage, le Null, Kira, H.E.L.P. — cf. bible), pool générique pour les 13
  autres cursus. Les arcs suivants s'ajoutent ensuite au rythme de l'écriture.

### 3.3 Contraintes d'écriture

- Outro de chapitre : **2-3 scènes max** (~10-15 s).
- Intro de cursus : 3-4 scènes.
- Finale : 5-7 scènes.
- Ton et personnages conformes à la bible (`docs/conception_storytelling.md`).

## 4. Le lecteur — `<CinematicPlayer>`

Composant client plein écran réutilisable, dérivé du lecteur d'intro existant :

- Auto-défilement (~4,5 s/scène, constante partagée avec l'intro), avance
  manuelle au clic/touche.
- Portrait et nom du `speaker`, texte affiché lettre par lettre (machine à
  écrire), effets CSS selon `fx` (alerte rouge, glitch Spectre, victoire).
- **Bouton « Passer » toujours visible** — non négociable.
- Accessibilité : narration en vrai texte, `prefers-reduced-motion` désactive
  machine à écrire et effets (affichage direct), focus géré (piégé dans
  l'overlay, restitué à la fermeture — réutiliser
  [lib/use-modal-overlay.ts](../../../lib/use-modal-overlay.ts) si applicable).
- `onComplete` / `onSkip` remontent au parent (les deux marquent la
  cinématique comme vue).

## 5. Déclenchement et persistance

| Moment | Déclencheur | Rejouable |
| --- | --- | --- |
| Intro de cursus | Première visite de `app/learn/[course]` (non vue) | Oui, bouton « Revoir le briefing » sur la page du cursus |
| Outro de chapitre | `handleStepSuccess` quand le chapitre devient complet ; la cinématique remplace l'écran de félicitations sec, puis propose « Chapitre suivant » | Non (une fois suffit) |
| Finale | Comme l'outro, quand le chapitre validé est le dernier du cursus (la finale remplace alors l'outro du dernier chapitre — on ne joue pas les deux) | Oui, depuis la page du cursus une fois le cursus terminé |

**Persistance :** côté serveur, liée au compte (contrairement à l'intro du site
en localStorage), pour survivre au changement de navigateur.

- Nouveau modèle Prisma minimal :

```prisma
model CinematicView {
  id          String   @id @default(cuid())
  userId      String
  cinematicId String   // ex. "html:intro"
  viewedAt    DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, cinematicId])
}
```

- ⚠️ **Migration :** `.env` pointe sur la base de production → `prisma migrate
  dev --create-only` puis relecture du SQL et `prisma migrate deploy` (jamais
  `migrate dev` seul).
- Visiteurs d'essai (non connectés) : repli localStorage, même patron que
  `INTRO_STORAGE_KEY`.
- Les outros de chapitre étant non rejouables et déclenchées par un événement
  (le passage à « chapitre complet ») plutôt que par une visite, leur cas
  « déjà vue » ne se présente qu'en cas de re-validation ; on enregistre quand
  même la vue pour garder une règle uniforme : **une cinématique enregistrée ne
  se rejoue jamais automatiquement**.

## 6. Gestion d'erreur

- Résolveur : cursus sans fichier de cinématiques → pool générique ; chapitre
  sans outro déclaré dans un cursus qui a un arc → pool générique (pas de
  crash, pas de trou).
- Écriture de `CinematicView` en échec (réseau) : la cinématique se joue quand
  même ; l'échec est silencieux côté joueur (au pire elle se rejouera).
- Storage indisponible (essai) : même politique que `hasSeenIntro()` — on
  considère la cinématique vue plutôt que de l'imposer à chaque navigation.

## 7. Tests

- **Vitest (logique pure)** : `lib/cinematics/*.test.ts` — résolution
  cursus/repli générique, choix déterministe dans le pool, calcul
  « dernier chapitre → finale et pas outro », règles de persistance.
- **E2E Playwright** : extension du parcours existant — l'intro du cursus se
  joue à la première visite, « Passer » fonctionne, elle ne rejoue pas à la
  visite suivante ; la validation d'un chapitre déclenche l'outro puis
  « Chapitre suivant ».
- Contenu HTML : test de structure (chaque chapitre du cursus HTML a une outro
  déclarée ou tombe volontairement sur le générique — pas de clé orpheline).

## 8. Découpage indicatif de l'implémentation

1. Types + résolveur + pool générique (`lib/cinematics/`) — TDD.
2. `<CinematicPlayer>` (réutilise les briques du lecteur d'intro).
3. Persistance (`CinematicView` + repli localStorage) et migration prudente.
4. Branchement : page cursus (intro + rejouer) puis `ChapterClient`
   (outro/finale).
5. Écriture de l'arc HTML complet.
6. E2E.
