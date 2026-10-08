# Audit Complet des Assets Pixel Art — Nebula Command

Ce document recense de manière exhaustive, page par page, tous les assets graphiques rétro-futuristes en pixel art nécessaires pour remplacer intégralement les emojis et visuels temporaires du site.

---

## Direction Artistique Globale
- **Style** : Pixel Art rétro-futuriste (Inspiration 16-bit RPG / Console de commande spatiale).
- **Palette de Couleur** : Palette exclusive Nebula (Cyan `#00f0ff`, Orange `#ff6b2c`, Vert `#00ff88`, Violet `#b067ff`, Or `#ffc844`, Fonds sombres `#03060d` à `#0a1628`).
- **Règles d'export** : Format **PNG transparent**, sans anti-aliasing (bords nets), sans dégradés lisses. Une frame par case de grille pour les spritesheets (ordre gauche-droite, haut-bas).

---

## Analyse Page par Page des Assets à Créer

### 1. Page d'Accueil (`/` — Landing)
La vitrine doit immédiatement plonger le cadet dans l'ambiance spatiale.
*   **Logo Principal (`BrandLogo.tsx`)** :
    *   *Description* : Un emblème militaire de flotte spatiale pixel art, épuré et lisible.
    *   *État* : fait. Écusson de la flotte Coalition Nebula dessiné en bitmaps dans `components/ui/PixelLogo.tsx` (24×26 pixels, palette Nebula, agrandi sans lissage), rendu sur canvas et animé en rotation.
*   **Planètes Décoratives de Fond (3 planètes)** :
    *   *Description* : Remplacer les sphères lisses et floues actuelles par de véritables planètes dessinées pixel par pixel.
        *   `planet-gas.png` : Géante gazeuse cyan et bleue avec anneaux fins.
        *   `planet-dry.png` : Planète désertique orange avec de grands cratères.
        *   `planet-red.png` : Planète volcanique rouge/sombre craquelée de lave.
    *   *Dimensions* : `128×128px` à `192×192px`.
    *   *Format* : PNG transparent.
*   **Icônes des Cartes Features (3 icônes)** :
    *   *Description* : Actuellement, elles réutilisent les planètes. Créer trois symboles distincts :
        *   *Cursus structurés* : Une antenne satellite ou une console affichant un arbre de progression.
        *   *XP & badges* : Un insigne avec des étoiles brillantes.
        *   *Éditeur intégré* : Un terminal de commande affichant des balises de code `< >`.
    *   *Dimensions* : `64×64px`.
    *   *Format* : PNG transparent.

---

### 2. Page d'Onboarding & Personnalisation (`/avatar`)
Cette page sert à configurer le cadet avant son départ. Elle utilise actuellement des emojis.
*   **Portraits des Espèces (5 portraits)** :
    *   *Description* : Bustes détaillés pour chaque origine.
        *   *Humain* (`humain`) : Cadet classique en combinaison spatiale blanche et visière cyan.
        *   *Cyborg* (`cyborg`) : Visage mi-humain, mi-métallique avec une optique rouge brillante.
        *   *Synthétique* (`synthetique`) : Tête holographique ou noyau d'intelligence artificielle néon.
        *   *Hybride* (`hybride`) : Visage extraterrestre humanoïde à peau verte/bleue et marques bioluminescentes.
        *   *Origine inconnue* (`inconnue`) : Silhouette mystérieuse masquée sous une capuche spatiale ou ombre lumineuse.
    *   *Dimensions* : `64×64px` (affichés dans un médaillon circulaire).
    *   *Format* : PNG transparent.
*   **Symboles des Rôles (4 icônes)** :
    *   *Description* : Petites icônes de spécialisation.
        *   *Pilote* (`pilote`) : Joystick ou ailes de vol spatial.
        *   *Ingénieur* (`ingenieur`) : Clé anglaise pixelisée et boulons.
        *   *Tacticien* (`tacticien`) : Réticule de visée ou écran radar.
        *   *Explorateur* (`explorateur`) : Lunette astronomique ou télescope spatial.
    *   *Dimensions* : `24×24px` ou `32×32px`.
    *   *Format* : PNG transparent.

---

### 3. Tableau de Bord (`/dashboard`)
Le hub central de contrôle.
*   **Mascotte Holo-IA (Bulle de dialogue)** :
    *   *Description* : Portrait d'une IA d'assistance système qui accueille l'utilisateur avec son curseur de terminal clignotant.
    *   *Dimensions* : `64×64px`.
    *   *Format* : PNG transparent.
*   **Vignettes Thématiques de Cursus Actif (3 visuels)** :
    *   *Description* : Une image d'arrière-plan ou une console dédiée à afficher sur la carte "Reprendre la mission" selon le cours actif.
        *   *HTML* : Une vue en plan schématique de la structure de la station.
        *   *CSS* : Une console de gestion des boucliers thermiques et couleurs de coque.
        *   *JS* : Les réacteurs principaux en cours de démarrage avec des flux de plasma.
    *   *Dimensions* : `128×128px`.
    *   *Format* : PNG transparent.
*   **Mini-Icônes de Statistiques (4 icônes)** :
    *   *Description* :
        *   *XP* : Batterie énergétique verte brillante.
        *   *Niveau / Rang* : Insigne d'épaulette militaire galactique.
        *   *Streak (Série)* : Flamme de propulsion de fusée animée.
        *   *Badges* : Une vitrine ou un coffret à insignes.
    *   *Dimensions* : `16×16px`.
    *   *Format* : PNG transparent.

---

### 4. Catalogue des Cours (`/learn`)
*   **Spritesheet des Cours (`mission-icons-v2.png`)** :
    *   *Description* : Feuille unique regroupant les icônes de cours. Grille de 8 colonnes x 4 lignes.
    *   *Dimensions* : Canvas global de `256×128px` (frames individuelles de `32×32px`).
    *   *Ordre obligatoire des frames (0 à 13)* :
        0. `html` : Antenne parabolique spatiale.
        1. `css` : Palette de peinture holographique.
        2. `javascript` : Noyau énergétique instable.
        3. `react` : Schéma d'orbitale atomique.
        4. `typescript` : Bouclier de blindage renforcé.
        5. `git` : Croisement de chemins de navigation orbitale.
        6. `sql` : Conteneurs de données empilés dans la soute.
        7. `nodejs` : Console de commande système principale.
        8. `tests` : Terminal affichant un feu vert de validation.
        9. `devops` : Rampe de lancement de fusées de transport.
        10. `mongodb` : Cristal biologique vert stockant des données.
        11. `security` : Barrière laser anti-intrusion.
        12. `python` : Serpent mécanique enroulé autour d'un câble.
        13. `algo` : Matrice de processeur quantique.
    *   *Format* : PNG transparent.
    *   *État* : livrée (`public/sprites/mission-icons-v2.png`).

---

### 5. Carte du Cursus (`/learn/[course]`)
*   **Nœuds de Niveaux Spatiaux (5 designs de stations)** :
    *   *Description* : Au lieu de planètes génériques, dessiner des stations orbitales de complexité croissante (remplace `celestial-objects.png`).
        *   *Niveau 1* : Satellite de communication simple.
        *   *Niveau 2* : Station météo avec panneaux solaires.
        *   *Niveau 3* : Station de recherche scientifique avec dômes.
        *   *Niveau 4* : Plateforme militaire de défense équipée de tourelles.
        *   *Niveau 5 (Boss/Fin)* : Quartier général orbitale géant ou mégastructure.
    *   *Dimensions* : `64×64px` ou spritesheet `celestial-objects.png` de `704×512px` (frames de `704×512px` adaptées par scaling).
    *   *Format* : PNG transparent.

---

### 6. Zone d'Exercice (`/learn/[course]/[chapter]`)
*   **Spritesheet des Bannières de Victoire (`banner-icons.png`)** :
    *   *Description* : Icônes d'archétype pour l'écran de complétion d'étape. Grille de 4 colonnes x 4 lignes.
    *   *Dimensions* : Canvas global de `192×192px` (frames individuelles de `48×48px`).
    *   *Détail des frames* :
        *   Frame 0 : *Signal / transmission* (antenne émettrice).
        *   Frame 1 : *Données / décodage* (puce avec lignes de code).
        *   Frame 2 : *Fonction / engrenage* (rouages mécaniques imbriqués).
        *   Frame 3 : *Tableau / stockage* (caisses empilées dans la soute).
        *   Frame 4 : *Objet / structure* (échafaudage de station).
        *   Frame 5 : *DOM / écran* (moniteur d'ordinateur de bord).
        *   Frame 6 : *Événement / étincelle* (décharge de plasma).
        *   Frame 7 : *Async / horloge* (sablier ou montre temporelle).
        *   Frame 8 : *Réseau / satellite* (satellites reliés par des ondes).
        *   Frame 9 : *API / serveur* (armoire de serveurs avec LEDs clignotantes).
        *   Frame 10 : *Sécurité / bouclier* (générateur de champ de force).
        *   Frame 11 : *Déploiement / fusée* (fusée au décollage).
        *   Frame 12 : *Base de données* (cylindre de stockage à liquide).
        *   Frame 13 : *Branche / versioning* (aiguillage de rails de train spatial).
        *   Frame 14 : *Test / validation* (visée laser ciblant une cible verte).
        *   Frame 15 : *Trophée* (coupe spatiale sertie de gemmes).
    *   *Format* : PNG transparent.
    *   *État* : livrée (`public/sprites/banner-icons.png`).
*   **Sprites de Combat Spatial (Combat Visualizer)** :
    *   *Description* : Sprites animés pour illustrer la progression du code par le combat spatial (utilisés dans `EnemySprite.tsx`).
        *   *Vaisseau du Cadet (Joueur)* : Chasseur spatial élégant orienté vers la droite, avec animation de propulseur.
        *   *Tourelle de Défense* : Tourelle au sol ou orbitale pivotante.
        *   *Drone Ennemi (Erreur de code)* : Drone d'attaque alien ou virus informatique modélisé en insecte volant.
        *   *Projectiles & Explosions* : Laser cyan, missile orange, et explosion en cercle de pixels.
    *   *Dimensions* : `64×48px` (vaisseaux), `16×16px` (lasers/explosions).
    *   *Format* : PNG transparent.

---

### 7. Classement (`/leaderboard`)
*   **Médailles de Podium (3 icônes)** :
    *   *Description* : Médailles spatiales rétro en Or, Argent et Bronze suspendues à un ruban tech bleu.
    *   *Dimensions* : `24×24px`.
    *   *Format* : PNG transparent.

---

### 8. Profil & Succès (`/profil`)
*   **Spritesheet des Badges (`badges.png`)** :
    *   *Description* : Grille contenant les 48 badges déblocables correspondant aux chapitres (`lib/badges-catalog.ts`). Grille de 8 colonnes x 6 lignes.
    *   *Dimensions* : Canvas global de `512×384px` (frames individuelles de `64×64px`).
    *   *Design des Badges* : Chaque badge doit refléter le nom de son chapitre de manière métaphorique (ex : *HTML Architect* = un casque d'ingénieur doré devant un plan de station, *CSS Stylist* = une nébuleuse multicolore contenue dans un bocal).
    *   *Format* : PNG transparent.
    *   *État* : livrée (`public/sprites/badges.png`).

---

## Synthèse et Spécifications des Spritesheets

| Nom du Fichier | Dimensions Canvas | Dimensions Frame | Nombre de Frames | Usage Principal |
| :--- | :--- | :--- | :--- | :--- |
| `mission-icons-v2.png` | `256 × 128 px` | `32 × 32 px` | 14 active (32 max) | Icônes de cours / chapitres |
| `banner-icons.png` | `192 × 192 px` | `48 × 48 px` | 16 | Icônes de réussite de quêtes |
| `badges.png` | `512 × 384 px` | `64 × 64 px` | 48 | Badges de profil débloqués |
| `enemy-sprites.png` | — | `64 × 48 px` | Multiples | Ennemis du visualiseur de combat |
| `celestial-objects.png` | `2816 × 1536 px` | `704 × 512 px` | Multiples | Nœuds de niveaux sur la carte |
