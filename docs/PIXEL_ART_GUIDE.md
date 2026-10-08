# Guide pixel art — Nebula Command

Gabarit prêt-à-dessiner pour produire les sprites manquants et remplacer les emojis.
Tout ce qui suit est tiré du code (sources de vérité citées). Respecte les tailles
et l'ordre des frames : le drop-in marchera sans retoucher le code.

> **État** (voir §6) : le câblage code est fait, et les planches `mission-icons`,
> `banner-icons` et `badges` sont livrées dans `public/sprites/` et activées dans
> `SPRITE_SHEETS_READY` (`lib/sprite-config.ts`). Pour une nouvelle planche : la
> dessiner, la déposer dans `public/sprites/`, puis passer le flag correspondant à
> `true`. Tant que le flag est `false`, le composant affiche l'emoji de repli.

---

## 1. Principes d'art direction (non négociables pour un rendu cohérent)

- **Résolution native fixe** par sheet (voir §3). On dessine *à cette taille*, jamais
  un gros rendu réduit après coup.
- **Palette imposée** : importe `docs/palette/nebula.hex` (Aseprite) ou
  `docs/palette/nebula.gpl` (GIMP/Krita/Libresprite). Dérive 2–3 valeurs
  (ombre / médium / lumière) **par teinte** à partir des couleurs de base.
- **Une source de lumière constante** sur tout le set (recommandé : haut-droite).
- **Pas d'anti-aliasing**, pas de dégradés lisses, pas de demi-pixels. Bords nets.
- **Cohérence d'épaisseur de contour** (1 px) sur toutes les icônes.
- **Scaling entier uniquement** à l'affichage (×1, ×2, ×3). Voir §5.

---

## 2. Outils & export

- **Aseprite** (payant) ou **Libresprite** / **Piskel** (gratuits). Krita possible.
- Mode **Indexed** + palette Nebula chargée → t'empêche de déraper hors palette.
- Export : **PNG**, fond **transparent**, **sans** samplers/AA, échelle **×1**.
- Une frame = une case de la grille, **lue de gauche→droite puis haut→bas**
  (frame 0 en haut-gauche). C'est l'ordre que lit `components/ui/Sprite.tsx`.
- Place les fichiers dans `public/sprites/` avec exactement les noms déclarés dans
  `lib/sprite-config.ts` : `mission-icons-v2.png`, `banner-icons.png`, `badges.png`.

---

## 3. Les 3 spritesheets — specs exactes

Contrat défini dans `lib/sprite-config.ts`.

### A) `mission-icons-v2.png` — icônes de cours
- **Frame 32×32**, **8 colonnes**, 4 lignes → canvas **256×128** (32 frames).
- **Ordre des frames = `COURSES_CATALOG`** (`lib/courses-catalog.ts`) :

| Frame | Cours | Frame | Cours |
|---|---|---|---|
| 0 | html | 7 | nodejs |
| 1 | css | 8 | tests |
| 2 | javascript | 9 | devops |
| 3 | react | 10 | mongodb |
| 4 | typescript | 11 | security |
| 5 | git | 12 | python |
| 6 | sql | 13 | algo |

Frames 14–31 = réserve (futurs cours). Remplace les emojis de `COURSES_CATALOG.icon`
et de chaque chapitre (`missionIcon`).

### B) `banner-icons.png` — icônes de victoire (bannière de réussite)
- **Frame 48×48**, **4 colonnes**, 4 lignes → canvas **192×192** (16 frames).
- Set thématique (un archétype par type d'étape), à réutiliser entre chapitres :

| Frame | Archétype | Frame | Archétype |
|---|---|---|---|
| 0 | Signal / transmission | 8 | Réseau / satellite |
| 1 | Données / décodage | 9 | API / serveur |
| 2 | Fonction / engrenage | 10 | Sécurité / bouclier |
| 3 | Tableau / stockage | 11 | Déploiement / fusée |
| 4 | Objet / structure | 12 | Base de données |
| 5 | DOM / écran | 13 | Branche / versioning |
| 6 | Événement / étincelle | 14 | Test / validation |
| 7 | Async / horloge | 15 | Trophée (générique) |

### C) `badges.png` — badges de complétion
- **Frame 64×64**, **8 colonnes**, autant de lignes que nécessaire
  (ex. **8×6 = 512×384** pour 48 badges).
- **Ordre des frames = tableau `BADGES`** (`lib/badges-catalog.ts`, repris par
  `ALL_BADGES` dans `app/profil/page.tsx`) : frame `i` correspond à `BADGES[i]`
  (mêmes `id`/`label`). Les emojis de repli (`icon`) servent de référence visuelle
  pour chaque badge.
- Cette liste doit rester synchronisée avec `BADGE_BY_CHAPTER`
  (`lib/courses-meta.ts`), qui *débloque* réellement les badges. Ajouter un badge
  dans l'un impose de l'ajouter dans l'autre, puis de dessiner sa frame dans cet ordre.

---

## 4. Palette

Fichiers : `docs/palette/nebula.hex` et `docs/palette/nebula.gpl` (20 couleurs de base
dérivées de `app/globals.css`). Teintes clés : cyan `#00f0ff`, orange `#ff6b2c`,
vert `#00ff88`, rouge `#ff2d55`, bleu `#3d7eff`, fonds `#03060d → #0a1628`.
Construis tes ramps à partir de ça (ne pioche pas de couleurs hors palette).

---

## 5. Netteté & scaling

Une fois les sheets en **basse résolution native** (32/48/64), le rendu doit utiliser
un **multiple entier** : afficher une frame 32 px à 32 (×1) ou 64 (×2), jamais 40 ou 24.
- `components/ui/Sprite.tsx` arrondit l'agrandissement au multiple entier inférieur
  (snap), pour garder des pixels nets ; une réduction reste fractionnaire.
- Tailles d'affichage actuelles à connaître : badge profil **64**, badge écran de
  complétion **20** (forcément un peu mou — minimiser ce cas), bannière ~40–48.

---

## 6. Contrat de câblage (côté code)

| Sheet | Lu par | Frame résolue par | État |
|---|---|---|---|
| `mission-icons` | `components/ui/CourseIcon.tsx` (utilisé dans ExploreSection + carte `/learn`) | `getCourseIconFrame(slug)` (ordre `COURSES_CATALOG`) | câblé, activé (`SPRITE_SHEETS_READY.mission`) |
| `badges` | `app/profil/page.tsx` (par index) + `CompletionScreen` (via `badgeFrameById`) | index dans `lib/badges-catalog.ts` | câblé, activé (`SPRITE_SHEETS_READY.badges`) |
| `banner-icons` | `components/ui/QuestBanner.tsx` | `step.bannerFrame` | planche livrée ; aucune étape ne renseigne encore `bannerFrame`, la bannière affiche donc le logo (archétypes à attribuer) |

**Câblage réalisé :**
1. `lib/badges-catalog.ts` créé (48 badges aujourd'hui, synchronisé avec
   `BADGE_BY_CHAPTER`), `ALL_BADGES` de profil y pointe.
2. `mission-icons` branché via `CourseIcon` (fallback emoji intégré).
3. `CompletionScreen` reçoit la frame du badge gagné (`badgeFrameById`).
4. Scaling entier activé dans `Sprite.tsx` (snap au multiple ≥1).

**Pour activer une fois le PNG dessiné :** dépose le fichier dans `public/sprites/`
puis passe le flag à `true` dans `SPRITE_SHEETS_READY` (`lib/sprite-config.ts`).
Le fallback emoji reste en place tant que le flag est `false` → zéro régression.

---

## 7. Logo & planètes

- **Logo** (`components/ui/BrandLogo.tsx`) : fait. C'est un écusson pixel art de la
  flotte Coalition Nebula, dessiné en bitmaps dans `components/ui/PixelLogo.tsx`
  (24×26 pixels, palette Nebula, agrandi sans lissage). Il tourne comme une pièce,
  avec une poursuite spatiale en orbite ; il reste statique sous
  `prefers-reduced-motion`.
- **Planètes** (landing + cartes features + carte de cours) : aujourd'hui des rendus
  lisses (PNG/`.webp`/`.gif`) forcés en `pixelated` → crénelés. Deux options cohérentes :
  - **(a)** Refaire en vrai pixel art : planètes 64–96 px, éventuellement en strips de
    4 frames pour la rotation (la classe `sprite-planet` et la variable
    `--planet-frame-size` existent dans `app/globals.css`, mais aucun composant ne
    les utilise actuellement).
  - **(b)** Assumer un fond peint et **retirer `pixelated`** sur ces images.
  Ne pas mélanger les deux. Recommandé : (a) pour rester raccord avec les sprites.
- **Fonds** : un seul `space-background.png` (déjà assombri/désaturé via le filtre CSS).
  Si tu refais le fond, garde-le **sombre et peu saturé** pour que le contenu ressorte.

---

## 8. Checklist d'intégration

- [ ] Palette Nebula chargée dans l'éditeur, mode Indexed.
- [x] `mission-icons-v2.png` (256×128, 14 cours dans l'ordre) → `public/sprites/`.
- [x] `ALL_BADGES` figé + resynchronisé, puis `badges.png` (8 col) dans cet ordre.
- [x] `banner-icons.png` (192×192, 16 archétypes).
- [x] Logo refait en pixel art (`PixelLogo.tsx`).
- [ ] Planètes refaites (ou `pixelated` retiré des rasters lisses).
- [x] Câblage code (§6) + scaling entier `Sprite.tsx`.
- [ ] Test : `pnpm build && pnpm start`, vérifier dashboard / mission / profil →
      sprites nets, plus aucun emoji, fallback ok si un PNG manque.

---

## 9. Cinématique d'intro — `intro-cinematic.png`

Contrat défini dans `lib/sprite-config.ts` (`INTRO_CINEMATIC`).

> État actuel : `components/intro/IntroCinematic.tsx` ne lit pas cette planche mais
> une image par scène, `public/sprites/intro/scene-<id>.png` (scènes 0 à 4
> présentes), animée par `IntroSceneCanvas.tsx`.

- **Frame 320×180** (16:9), **5 colonnes**, 1 ligne → canvas **1600×180** (5 frames).
- **Ordre des frames = `INTRO_SCENES`** (`lib/intro.ts`) :

| Frame | Scène | Contenu visuel |
|---|---|---|
| 0 | logo | Un vaisseau se dessine sur un ciel étoilé |
| 1 | cadet | Avatar Cadet-Ingénieur + console holographique |
| 2 | orbit | Panneaux HTML/CSS/JS en orbite autour du vaisseau |
| 3 | planet | La console scelle un bloc → une planète se stabilise |
| 4 | invite | Invitation « Choisis ton premier cursus » (portail de cursus) |

- Palette Nebula (`docs/palette/nebula.hex`), pas d'anti-aliasing, contour 1 px,
  lumière haut-droite (cf. §1). Fond transparent **ou** peint sombre.
- La **narration reste du texte HTML** (déjà en place, lisible lecteur d'écran) :
  ne pas graver de texte dans les frames.

**Activation :** déposer `public/sprites/intro-cinematic.png`, puis passer
`SPRITE_SHEETS_READY.intro` à `true` (`lib/sprite-config.ts`). Le composant
bascule du placeholder au sprite sans autre changement de code.
