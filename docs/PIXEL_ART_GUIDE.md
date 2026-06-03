# Guide pixel art — Nebula Command

Gabarit prêt-à-dessiner pour produire les sprites manquants et **tuer les emojis**.
Tout ce qui suit est tiré du code (sources de vérité citées). Respecte les tailles
et l'ordre des frames : le drop-in marchera sans retoucher le code.

> ✅ **Le câblage code est fait** (voir §6) : `mission-icons` et `badges` sont branchés,
> avec **fallback emoji** tant que le PNG n'est pas là. Il te reste donc seulement à
> **(1)** dessiner et déposer les PNG dans `public/sprites/`, puis **(2)** passer le flag
> correspondant à `true` dans `SPRITE_SHEETS_READY` (`lib/sprite-config.ts`).
> `banner-icons` est volontairement laissé en emoji pour l'instant (mapping par archétype
> à décider).

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
- Place les fichiers dans `public/sprites/` avec **exactement** ces noms :
  `mission-icons.png`, `banner-icons.png`, `badges.png`.

---

## 3. Les 3 spritesheets — specs exactes

Contrat défini dans `lib/sprite-config.ts`.

### A) `mission-icons.png` — icônes de cours
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
(📡 🎨 ⚡ …) et de chaque chapitre (`missionIcon`).

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
- **Ordre des frames = tableau `ALL_BADGES`** (`app/profil/page.tsx`) : frame `i`
  correspond à `ALL_BADGES[i]` (mêmes `id`/`label`). Les emojis actuels (`icon`)
  servent de référence visuelle pour chaque badge.

> ⚠️ **À résoudre AVANT de dessiner les badges** : `ALL_BADGES` (profil) est
> **désynchronisé** de `BADGE_BY_CHAPTER` (`lib/courses-meta.ts`), qui est ce qui
> *débloque* réellement les badges. Des badges attribués n'existent pas dans
> `ALL_BADGES` (ex. `html-architect`, `html-signals`, `html-media`, css ch6–10,
> js ch6–12, react, et les 10 nouveaux cours). Il faut d'abord **figer la liste
> définitive** (≈ 44 badges) dans `ALL_BADGES`, puis dessiner dans cet ordre.
> Je peux resynchroniser `ALL_BADGES` à partir de `BADGE_BY_CHAPTER` pour toi.

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
- `components/ui/Sprite.tsx` fait actuellement un scaling **fractionnaire** (hérité de
  l'époque où les sprites étaient des gros rendus). Avec des sheets basse-déf, **je
  dois alors brancher le scaling entier** (snap au multiple inférieur) — ce qui était
  inutile avant le devient. À faire en même temps que le câblage.
- Tailles d'affichage actuelles à connaître : badge profil **64**, badge écran de
  complétion **20** (forcément un peu mou — minimiser ce cas), bannière ~40–48.

---

## 6. Contrat de câblage (ce que je fais, côté code)

| Sheet | Lu par | Frame résolue par | État |
|---|---|---|---|
| `mission-icons` | `components/ui/CourseIcon.tsx` (utilisé dans ExploreSection + carte `/learn`) | `getCourseIconFrame(slug)` (ordre `COURSES_CATALOG`) | ✅ câblé, gardé par `SPRITE_SHEETS_READY.mission` |
| `badges` | `app/profil/page.tsx` (par index) + `CompletionScreen` (via `badgeFrameById`) | index dans `lib/badges-catalog.ts` | ✅ câblé, gardé par `SPRITE_SHEETS_READY.badges` |
| `banner-icons` | `components/ui/QuestBanner.tsx` | `step.bannerFrame` | ⏸️ laissé en emoji (archétypes à décider) |

**Câblage réalisé :**
1. ✅ `lib/badges-catalog.ts` créé (44 badges, synchronisé avec `BADGE_BY_CHAPTER`),
   `ALL_BADGES` de profil y pointe désormais.
2. ✅ `mission-icons` branché via `CourseIcon` (fallback emoji intégré).
3. ✅ `CompletionScreen` reçoit la frame du badge gagné (`badgeFrameById`).
4. ✅ Scaling entier activé dans `Sprite.tsx` (snap au multiple ≥1).

**Pour activer une fois le PNG dessiné :** dépose le fichier dans `public/sprites/`
puis passe le flag à `true` dans `SPRITE_SHEETS_READY` (`lib/sprite-config.ts`).
Le fallback emoji reste en place tant que le flag est `false` → zéro régression.

---

## 7. Logo & planètes (remplacement de l'art IA)

- **Logo** (`components/ui/BrandLogo.tsx`) : actuellement un PNG IA
  (`Gemini_…921tq4….png`) animé en « pièce ». Cible : un **emblème pixel** ou vectoriel,
  ~64×64 natif, lisible en petit (favicon 32×32 et 16×16 dérivés). Garder l'animation
  de rotation est ok.
- **Planètes** (landing + cartes features + carte de cours) : aujourd'hui des rendus
  lisses (PNG/`.webp`/`.gif`) forcés en `pixelated` → crénelés. Deux options cohérentes :
  - **(a)** Refaire en vrai pixel art : planètes 64–96 px, éventuellement en strips de
    4 frames pour la rotation (le composant lit déjà des strips : voir
    `app/learn/page.tsx`, `--planet-frame-size` / `sprite-planet`).
  - **(b)** Assumer un fond peint et **retirer `pixelated`** sur ces images.
  Ne pas mélanger les deux. Recommandé : (a) pour rester raccord avec les sprites.
- **Fonds** : un seul `space-background.png` (déjà assombri/désaturé via le filtre CSS).
  Si tu refais le fond, garde-le **sombre et peu saturé** pour que le contenu ressorte.

---

## 8. Checklist d'intégration

- [ ] Palette Nebula chargée dans l'éditeur, mode Indexed.
- [ ] `mission-icons.png` (256×128, 14 cours dans l'ordre) → `public/sprites/`.
- [ ] `ALL_BADGES` figé + resynchronisé, puis `badges.png` (8 col) dans cet ordre.
- [ ] `banner-icons.png` (192×192, 16 archétypes).
- [ ] Logo + planètes refaits (ou `pixelated` retiré des rasters lisses).
- [ ] Câblage code (§6) + scaling entier `Sprite.tsx`.
- [ ] Test : `npm run build && npm start`, vérifier dashboard / mission / profil →
      sprites nets, **plus aucun emoji**, fallback ok si un PNG manque.

---

**Ce que je peux faire dès maintenant côté code (sans dessiner)** : resync `ALL_BADGES`,
brancher `mission-icons`, ajouter les `*Frame` dans les données, activer le scaling
entier — pour que tu n'aies plus qu'à déposer les PNG. Dis-moi si je lance ce câblage.
