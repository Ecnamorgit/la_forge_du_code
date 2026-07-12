# Spec — Cinématique d'intro « Nebula Command »

> Rédigé le 2026-07-12. Chantier gamification. Design validé point par point avec
> l'utilisateur (placement, approche technique, son, plan art). À implémenter en TDD.

## 1. Objectif

Accueillir le visiteur par une **courte cinématique pixel-art** qui pose l'univers
Nebula Command avant le hero de l'accueil, façon intro de jeu vidéo rétro. Renforce
l'immersion (gamification) et la valeur d'acquisition (elle touche les visiteurs
anonymes, pas seulement les inscrits).

Le storyboard source existe déjà : [scenario_espace.md](../../scenario_espace.md)
§ « Plan-séquence Pixel Art – Accueil » (5 scènes, déjà réalignées Nebula Command).

## 2. Décisions validées

| Décision | Choix |
|---|---|
| Placement | Accueil `/`, **première visite** uniquement, **rejouable** |
| Skippable | Oui (bouton « Passer » + touche Échap) |
| Accessibilité | Respecte `prefers-reduced-motion` |
| Approche technique | **Sprite-sheet pixel-art**, avec **placeholder fonctionnel** immédiat |
| Son | **Toggle, coupé par défaut** |

## 3. Contrainte art (fondamentale)

Le pixel-art du projet est produit **hors code** (dessin Aseprite ou génération IA
image, PNG déposés dans `public/sprites/`). Il ne peut pas être généré depuis
l'implémentation. On applique donc le pattern existant (cf.
[PIXEL_ART_GUIDE.md](../../PIXEL_ART_GUIDE.md), flags `SPRITE_SHEETS_READY`) :

- **Livrable A (ce chantier, code) :** le moteur + un **placeholder qui tourne tout de
  suite** avec les assets existants + un **contrat de frames** documenté.
- **Livrable B (plus tard, art) :** dessiner les 5 scènes selon le contrat, déposer
  `public/sprites/intro-cinematic.png`, passer `SPRITE_SHEETS_READY.intro` à `true`.
  Aucune modification de code → bascule automatique en pixel-art.

## 4. Architecture

### 4.1 Composant moteur — `components/intro/IntroCinematic.tsx` (client)
- Overlay plein écran (`fixed`, z au-dessus du hero), monté sur l'accueil.
- Rend **une scène à la fois** depuis un modèle de scènes (§5), auto-défilement par
  timers (~4,5 s/scène, ~22 s total), transitions CSS (fade/slide) entre scènes.
- **Deux modes de rendu**, pilotés par `SPRITE_SHEETS_READY.intro` :
  - `false` (aujourd'hui) → **placeholder** : composition de chaque scène avec les
    assets existants (`BrandLogo`, planètes de `/public`, chips de code) + motion CSS
    (étoiles qui scintillent, panneaux qui orbitent).
  - `true` (après art) → `Sprite` lisant la frame de la scène depuis
    `intro-cinematic.png`, motion CSS conservée par-dessus.
- Contrôles : indicateur de progression (points), bouton **« Passer »**, **Échap**.
- **Son** : muet par défaut, toggle 🔊. Quand activé, joue des **cues SFX existants**
  ([lib/audio.ts](../../../lib/audio.ts) : `playDeployBip`, `playSystemOnline`…) à
  chaque transition de scène. ⚠️ Pas de piste musicale chiptune complète : ce serait
  un asset audio séparé (même logique que les frames — livrable ultérieur).

### 4.2 Logique pure — `lib/intro.ts` (+ `lib/intro.test.ts`)
Séparée du composant pour être testable :
- `shouldAutoPlayIntro(seen: boolean, reducedMotion: boolean): boolean` — n'auto-joue
  que si jamais vue **et** motion autorisée.
- `INTRO_SCENES` — le tableau de scènes (id, narration, clé visuelle).
- `INTRO_STORAGE_KEY = "nc_intro_seen"` et helpers de lecture/écriture (avec garde
  `try/catch` pour un `localStorage` indisponible).

### 4.3 Montage sur l'accueil — `app/page.tsx`
`page.tsx` est un Server Component. On ajoute :
- Un wrapper client `<IntroCinematicMount />` qui décide à l'affichage (lecture
  `localStorage` + `matchMedia('(prefers-reduced-motion)')`) s'il auto-joue.
- Un contrôle **« ▶ Revoir l'intro »** discret dans le hero (toujours dispo) qui force
  la relecture.

### 4.4 Contrat de frames — `lib/sprite-config.ts` + doc
- Ajouter `INTRO_CINEMATIC: SpriteSheet` (`src: "/sprites/intro-cinematic.png"`,
  `frameWidth: 320`, `frameHeight: 180`, `columns: 5`) et `SPRITE_SHEETS_READY.intro`.
- Documenter le contrat (5 scènes, 320×180 pixel-art, palette Nebula, ordre = §5) en
  section dédiée de [PIXEL_ART_GUIDE.md](../../PIXEL_ART_GUIDE.md).

## 5. Contenu — les 5 scènes (Nebula Command)

| # | Narration (texte réel, lisible lecteur d'écran) | Placeholder (assets actuels) | Frame pixel-art (plus tard) |
|---|---|---|---|
| 1 | « Bienvenue à bord de Nebula Command » | `BrandLogo` en fade-in sur fond étoilé | vaisseau se dessine sur ciel étoilé |
| 2 | « Tu es Cadet-Ingénieur de la station » | avatar/chip cadet + chip « console » | avatar cadet + console holographique |
| 3 | « Chaque langage est une pièce maîtresse » | 3 chips HTML/CSS/JS en orbite CSS | panneaux qui orbitent le vaisseau |
| 4 | « La console scelle le code — une planète se stabilise » | planète `/public` qui apparaît (scale-in) | console scelle un bloc → planète |
| 5 | « Choisis ton premier cursus » | boutons → `/signup` et `/learn` | invitation + portail de cursus |

Scène 5 = sortie : « Passer » et la fin normale débouchent sur le hero (CTA existants).

## 6. Accessibilité

- `role="dialog"`, `aria-modal="true"`, focus piégé dans l'overlay, focus rendu au
  hero à la fermeture.
- **Échap** ferme ; bouton « Passer » explicite et atteignable au clavier.
- Narration = vrai texte (pas dans l'image) ; conteneur `aria-live="polite"`.
- `prefers-reduced-motion` : **pas d'auto-play** ; la relecture affiche les scènes en
  **stills** (avance au clic/timer, sans animation ni transition).

## 7. Tests

- **Unitaire (Vitest)** : `shouldAutoPlayIntro` (4 cas : vue/pas vue × motion/reduced),
  helpers `localStorage` robustes à l'absence, intégrité de `INTRO_SCENES` (5 scènes,
  narrations non vides).
- **E2E (Playwright)** sur l'accueil (public, pas d'auth) :
  - 1re visite → la cinématique apparaît ; « Passer » → hero visible, flag posé.
  - 2e visite (flag présent) → pas d'auto-play.
  - « Revoir l'intro » → relance la séquence.

## 8. Fichiers touchés

| Fichier | Nature |
|---|---|
| `components/intro/IntroCinematic.tsx` | nouveau — moteur + placeholder |
| `components/intro/IntroCinematicMount.tsx` | nouveau — wrapper client (auto-play) |
| `lib/intro.ts` / `lib/intro.test.ts` | nouveau — logique pure + tests |
| `app/page.tsx` | modif — montage + « Revoir l'intro » |
| `lib/sprite-config.ts` | modif — `INTRO_CINEMATIC` + flag `intro` |
| `app/globals.css` | modif — keyframes des scènes |
| `docs/PIXEL_ART_GUIDE.md` | modif — contrat de frames de la cinématique |

## 9. Hors périmètre (livrables ultérieurs)

- Le PNG `intro-cinematic.png` (art pixel — Livrable B).
- Une piste musicale chiptune (asset audio séparé).
- Frame-par-frame 2px : on part sur **5 stills + motion CSS**, pas 15+ frames animées.

## 10. Critères d'acceptation

- [ ] La cinématique se joue à la 1re visite de l'accueil, skippable (« Passer »/Échap).
- [ ] Rejouable via « Revoir l'intro » ; ne rejoue pas d'elle-même après avoir été vue.
- [ ] `prefers-reduced-motion` respecté (pas d'auto-play, stills en relecture).
- [ ] Fonctionne **dès maintenant** avec les assets existants (placeholder).
- [ ] Bascule en pixel-art sans toucher au code quand le PNG + flag arrivent.
- [ ] Son coupé par défaut, toggle fonctionnel.
- [ ] `tsc`/`lint`/tests verts, `next build` OK.
