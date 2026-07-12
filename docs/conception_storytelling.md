# Conception Narrative & Storytelling — Nebula Command

Ce document définit la "Bible Narrative" de **Nebula Command**. Il détaille comment transformer l'apprentissage technique du code (HTML, CSS, JavaScript...) en une aventure de science-fiction immersive digne d'un jeu vidéo de rôle (RPG).

---

## 🌌 1. L'Univers et le Pitch (Le Lore)

### Le Contexte : La Coalition Nebula
Au 23ème siècle, l'humanité a essaimé dans la galaxie, établissant un réseau de stations orbitales reliées par la **Coalition Nebula**. Cette infrastructure galactique géante ne tient que grâce à un ensemble de technologies logicielles ancestrales et hautement standardisées : **les Protocoles Systèmes** (HTML pour la structure physique des stations, CSS pour la répartition de l'énergie et des boucliers, JavaScript pour l'automatisation des tourelles et des réacteurs).

### La Menace : L'Entité "Null" (Le Glitch)
Une entité cybernétique extraterrestre connue sous le nom de **Null** (ou *Le Glitch*) se propage à travers les réseaux, corrompant les lignes de code des stations. Une station dont le code est corrompu perd son oxygène, désactive ses boucliers et dérive dans le vide avant d'être capturée.

### Le Rôle du Joueur : Le Cadet en Ingénierie
L'apprenant commence en tant que **Cadet** fraîchement diplômé de l'Académie Militaire Spatiale. Armé de sa console de programmation (l'éditeur Monaco), il est envoyé sur le front. Sa mission : voyager de station en station, nettoyer le code corrompu, restaurer les systèmes de survie, et programmer les défenses automatiques pour repousser les vagues d'invasion du Null.

---

## 🎭 2. Les Personnages Clés (Dramatis Personae)

### 🤖 1. H.E.L.P. (Holographic Engineering Assistant Protocol)
*   **Rôle :** L'Holo-IA d'assistance système (la mascotte de la bulle de dialogue du Dashboard).
*   **Personnalité :** Légèrement ironique, analytique, dévouée au Cadet mais panique si le code lance une boucle infinie. Elle s'exprime avec un curseur de terminal clignotant.
*   **Exemple de réplique :**
    > `[H.E.L.P.] :` *"Cadet, les senseurs thermiques indiquent une hausse de température de 400%. Soit vous avez fait une boucle infinie en JS, soit le réacteur principal fusionne. Je vous conseille de corriger la condition de sortie au plus vite."*

### 👩‍✈️ 2. Ingénieure en Chef Kira Vesper
*   **Rôle :** Mentor et directrice des opérations de la Flotte. Elle donne les briefings de début de chapitre.
*   **Personnalité :** Pragmatique, endurcie par les combats, exigeante mais juste. Elle n'aime pas le code mal indenté.
*   **Exemple de réplique :**
    > `[Kira] :` *"Écoute-moi bien, Cadet. Le secteur Selene-4 est sous le feu ennemi. Si tu ne structures pas correctement cette page HTML avec des balises sémantiques, les robots de maintenance ne sauront pas où livrer les munitions. Au travail."*

### 👾 3. Le Spectre du Code (L'Antagoniste)
*   **Rôle :** L'intelligence malveillante derrière le Null. Il pirate la console Monaco de l'apprenant pour y injecter du code corrompu et le narguer.
*   **Personnalité :** Froid, cryptique, considère l'humanité comme une anomalie non compilée qui doit être effacée du système.

---

## 🎮 3. Intégration Pédagogique du Storytelling

Chaque technologie enseignée correspond à une action militaire ou de survie sur la station :

### 📡 Cursus HTML : Reconstruction Structurelle
*   **Métaphore de jeu :** Réparer la structure physique des stations endommagées par les astéroïdes.
*   **Intégration narrative :**
    - `Header` = La passerelle de commandement de la station.
    - `Main` = Le réacteur central de survie.
    - `Footer` = La soute de stockage des ressources.
    - `a href` (liens) = Établir des ponts de transfert d'énergie entre deux stations.
    - `img` = Calibrer les caméras de surveillance externes pour identifier les menaces.

### 🎨 Cursus CSS : Boucliers et Armement
*   **Métaphore de jeu :** Allouer l'énergie de la station et camoufler la flotte.
*   **Intégration narrative :**
    - Sélecteurs de couleur (`hex`, `rgb`) = Ajuster la fréquence thermique des boucliers pour bloquer les lasers ennemis.
    - `Flexbox` = Aligner les chasseurs d'attaque dans les hangars pour un décollage immédiat.
    - `Grid` = Cartographier et quadriller la grille de défense orbitale avec des mines magnétiques.
    - `Transitions / Animations` = Programmer le cycle d'occultation optique (invisibilité) du vaisseau.

### ⚡ Cursus JavaScript : Automatisation des Systèmes
*   **Métaphore de jeu :** Programmer l'IA tactique et réparer les moteurs de vol.
*   **Intégration narrative :**
    - `Variables` = Enregistrer les coordonnées spatiales et l'état des boucliers (ex: `let shieldEnergy = 100`).
    - `Conditions (if/else)` = Programmer la tourelle de défense pour qu'elle tire uniquement sur les vaisseaux ennemis identifiés (ex: `if (vessel.isHostile) { fire(); }`).
    - `Boucles (for/while)` = Lancer des scans de détection répétés sur les secteurs adjacents.
    - `Events / Listeners` = Intercepter les signaux de détresse de la flotte et y répondre en temps réel.

---

## 💬 4. Scénarisation des Retours d'Erreur (Feedback Loop)

Pour renforcer l'immersion, les erreurs de validation ne doivent pas simplement afficher des erreurs de compilateur froides, mais des rapports d'anomalie système :

*   **Erreur HTML (balise manquante) :**
    > `[ALERTE SYSTÈME]` : *Décompression détectée dans le secteur. La balise fermante `</main>` est manquante, ce qui empêche le bouclier principal de se sceller hermétiquement.*
*   **Erreur CSS (Flexbox mal aligné) :**
    > `[RAPPORT DE HANGAR]` : *Décollage avorté. L'alignement `justify-content` est incorrect. Les chasseurs se percutent dans le sas de lancement.*
*   **Erreur JS (Boucle infinie) :**
    > `[URGENCE CORE]` : *Surchauffe du réacteur quantique. La boucle s'exécute indéfiniment sans condition d'arrêt. Coupure de sécurité activée après 3 secondes.*
*   **Réussite d'étape :**
    > `[KIRA]` : *Bien joué Cadet. Le signal est clair, la liaison est rétablie. Prends tes 50 XP et prépare-toi pour la prochaine station.*
