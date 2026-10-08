# La Forge du Code — Smoke Test Manuel

Checklist exhaustive pour tester toutes les fonctionnalités du site et vérifier qu'aucune feature n'est cassée. À parcourir page par page, idéalement avant chaque release.

**Setup recommandé** :

- Naviguer en navigation privée pour partir d'un état propre
- Garder la console DevTools (F12) ouverte → onglet Console pour les erreurs JS, onglet Network pour les requêtes
- Tester sur Chrome et Firefox au minimum
- Tester en responsive : mobile (375px) + desktop (1440px+)

**Comment utiliser ce fichier** :

- Coche `[x]` au fur et à mesure
- Note les bugs trouvés dans la section "Bugs trouvés" en bas
- Date la passe en haut

**Dernière passe** : `____-__-__` par `____________`

---

## 0. Démarrage du serveur

- [x] `pnpm install` (à la racine du dépôt) → installe sans erreur
- [x] `pnpm dev` → serveur démarre sur `http://localhost:3000`
- [X] La console serveur ne montre aucune erreur rouge au démarrage
- [x] Base de données accessible (Prisma) → variable `DATABASE_URL` dans `.env`= 

- [x] Build de production : `pnpm build` → finit sans erreur pnpm build


- [x] Type check : `npx tsc --noEmit` → aucune erreur TypeScript

---

## 1. Page d'accueil (anonyme)

URL : `http://localhost:3000/`

- [X] La page se charge sans flash blanc
- [X] Le logo BrandLogo s'affiche
- [X] Le titre et le hero text sont lisibles
- [X] Les boutons "Se connecter" et "S'inscrire" sont visibles et cliquables
- [X] Le fond spatial / nebula s'affiche correctement
- [X] Aucune erreur dans la console DevTools
- [X] Responsive mobile : layout ne déborde pas, boutons accessibles sur le modele samsung s20 le texte " se connecté" passe sur 2 ligne car "nebula command" prend trop de place( gap entre le logo tournant et le texte a reduire un peux )
- [X] Clic sur "S'inscrire" → redirige vers `/signup`
- [x] Clic sur "Se connecter" → redirige vers `/login`

---

## 2. Inscription (`/signup`)

### 2.1 Validation du formulaire

- [X] Champs visibles : email, mot de passe, confirmation (si présente) pas de confirmation du mdp, on le rajoutera, ls mdp sont hashé mais avec l'I.A il est utile de reflechir a un renforcement 
- [x] Soumettre vide → messages d'erreur appropriés
- [x] Email invalide (`foo`) → erreur "email invalide"
- [x] Mot de passe trop court (`abc`) → erreur de longueur
- [] Mot de passe sans majuscule/chiffre (selon règles) → erreur appropriée
- [ ] Mots de passe différents (si confirmation) → erreur "mismatch"

### 2.2 Inscription réussie

- [x] Créer un compte avec un email valide (ex: `test+1@example.com`)
- [x] Le formulaire affiche un message de succès / redirige vers une page "Vérifiez votre email"
- [x] Network : POST `/api/signup` → 200 OK
- [x] Email de vérification reçu (vérifier Resend ou logs serveur en dev)
- [ negatif car localhost] Clic sur le lien de vérification → page `/verify-email/[token]` → message de succès
- [X] Tentative de re-créer le MÊME email → erreur "déjà utilisé"
- [ ] Lien "Renvoyer l'email" fonctionnel (route `/api/auth/resend-verification`)

### 2.3 Email non vérifié

- [x] Tenter de se connecter avant vérification → blocage ou message clair
- [X] Page `/api/auth/check-verification` retourne le bon statut

---

## 3. Connexion (`/login`)

- [x] Champs visibles : email + mot de passe
- [x] Soumettre vide → erreur
- [x] Mauvais mot de passe → erreur "credentials invalides" (pas de détail révélateur du type "email inconnu" vs "mauvais mdp")
- [x] Mauvais email → erreur identique (anti-énumération)
- [X] Bon couple email/mdp → redirige vers `/dashboard` (ou `/avatar` si onboarding pas fini) chargement d'une page qui disparait lors de la premiere connexion pour arrivé sur le /avatar au final, donc verifier 
- [X] Session cookie présent (NextAuth)
- [X] Recharger la page → reste connecté
- [x] Lien "Mot de passe oublié ?" → redirige vers `/forgot-password`
- [X] Lien "Créer un compte" → redirige vers `/signup`

---

## 4. Mot de passe oublié (`/forgot-password`)

- [X] Champ email visible
- [X] Email inexistant → message neutre (anti-énumération) "si un compte existe, vous recevrez un email"
- [X] Email existant → même message neutre + email réel envoyé
- [X] Lien dans l'email → page `/reset-password/[token]` accessible
- [ ] Token invalide / expiré → message d'erreur clair
- [X] Token valide → formulaire pour nouveau mdp
- [X] Nouveau mot de passe trop court → erreur
- [X] Nouveau mdp OK → redirige vers `/login` + message succès
- [X] Tentative de réutilisation du MÊME token → refusé (one-shot)
- [X] Connexion avec le nouveau mdp fonctionne

---

## 5. Onboarding & Avatar (`/avatar`)

À tester après une première connexion (utilisateur fraîchement créé).

- [ ] Au premier login, redirection automatique vers `/avatar` (si pas encore onboarded)
- [ ] Sélection d'avatar fonctionne (preview)
- [ ] Choix du username : champ + validation (caractères autorisés, longueur)
- [ ] Username déjà pris → erreur claire
- [ ] Username valide + avatar sélectionné → bouton "Continuer" actif
- [ ] Soumettre → POST `/api/me/onboarded` 200 + redirige vers `/dashboard`
- [ ] Re-naviguer vers `/avatar` après onboarding → soit accessible pour changement, soit redirige vers dashboard

---

## 6. Dashboard (`/dashboard`)

- [ ] Page accessible uniquement si connecté (sinon redirect vers `/login`)
- [ ] Affichage du username + avatar
- [ ] Affichage de la liste des cours (les 14 tracks)
- [ ] Chaque cours affiche son titre, son icône, son progrès
- [ ] Clic sur un cours → redirige vers `/learn/[course]`

### 6.1 Vérification de tous les cours présents

Chacun doit être listé et cliquable :

- [ ] HTML
- [ ] CSS
- [ ] JavaScript
- [ ] React
- [ ] TypeScript
- [ ] Git
- [ ] SQL
- [ ] Node.js
- [ ] Tests
- [ ] DevOps
- [ ] MongoDB
- [ ] Security
- [ ] Python
- [ ] Algo

### 6.2 Stats utilisateur

- [ ] XP total affiché
- [ ] Niveau / rang affiché
- [ ] Nombre de badges débloqués affiché
- [ ] Streak / autres stats (si présentes)

---

## 7. Carte de cours (`/learn/[course]`)

Tester pour chaque cours (au moins HTML, JS, React, et un mono-chapitre comme git/).

- [ ] La carte (LevelNodes) s'affiche
- [ ] Le background spatial s'affiche
- [ ] Les sprites des cadets sont visibles aux bonnes positions
- [ ] Les lignes entre les niveaux (SVG) sont tracées
- [ ] Les niveaux "playables" (dans le registry) sont en couleur active
- [ ] Les niveaux non-playables (si présents) sont grisés / pointillés
- [ ] Clic sur un niveau → redirige vers `/learn/[course]/[chapter]`
- [ ] Bouton "Retour" → redirige vers `/dashboard`
- [ ] URL invalide (`/learn/quelquechose-qui-existe-pas`) → 404

### 7.1 Vérification spécifique aux nouveaux tracks

- [ ] `/learn/react` → 4 nœuds (ch1-4) bien positionnés
- [ ] `/learn/typescript` → 1 nœud placeholder (50/50)
- [ ] `/learn/git` → 1 nœud
- [ ] `/learn/sql` → 1 nœud
- [ ] `/learn/nodejs` → 1 nœud
- [ ] `/learn/tests` → 1 nœud
- [ ] `/learn/devops` → 1 nœud
- [ ] `/learn/mongodb` → 1 nœud
- [ ] `/learn/security` → 1 nœud
- [ ] `/learn/python` → 1 nœud
- [ ] `/learn/algo` → 1 nœud

---

## 8. Chapitre / Mission (`/learn/[course]/[chapter]`)

Le cœur de l'app. À tester en profondeur sur au moins 1 chapitre de chaque type.

### 8.1 Affichage initial

- [ ] La page se charge sans flash
- [ ] L'éditeur Monaco s'affiche avec le `startCode` du step 1
- [ ] Le narrator / briefing apparaît
- [ ] Les objectives sont listés
- [ ] Le compteur de step (1/4) est correct
- [ ] Le titre de la mission et l'icône s'affichent
- [ ] Le bouton "Lancer" / "Run" est visible

### 8.2 Édition de code

- [ ] Taper dans Monaco → le code se met à jour
- [ ] Coloration syntaxique correcte (JS/HTML/CSS selon le cours)
- [ ] Autocomplétion fonctionne (si activée)
- [ ] Touches `Tab`, `Ctrl+Z`, `Ctrl+A` fonctionnent normalement
- [ ] Pas de lag sur des fichiers de 100+ lignes

### 8.3 Exécution & validation

Sur un chapitre JS (ex: `/learn/javascript/chapitre-1`) :

- [ ] Coller la solution du `hint`
- [ ] Cliquer "Lancer" → exécution sans erreur
- [ ] Les `console.log` apparaissent dans une zone de sortie
- [ ] Validation : les objectifs se cochent un par un
- [ ] Banner de succès s'affiche (icon, title, sub, XP)
- [ ] Bouton "Étape suivante" / "Continuer" apparaît
- [ ] Clic → step 2 chargé avec son `startCode`

### 8.4 Cas d'erreur dans le code

- [ ] Code avec erreur de syntaxe → message d'erreur affiché, pas de crash
- [ ] Code qui ne respecte pas les objectives → message "objective X manquant"
- [ ] Code qui throw une erreur runtime → message d'erreur clair

### 8.5 Persistance de progression

- [ ] Réussir le step 1, recharger la page → on revient au step où on en était
- [ ] Network : POST `/api/me/step` après chaque succès
- [ ] La progression apparait dans le dashboard

### 8.6 Fin de chapitre

- [ ] Compléter les 4 steps → écran de complétion final
- [ ] Le `completionBadge` est affiché et débloqué dans le profil
- [ ] L'XP total du chapitre (280) s'ajoute au profil
- [ ] Redirection ou bouton "Retour à la carte"
- [ ] Re-visiter la map → le niveau apparait comme complété

### 8.7 Tracks à syntaxe non-JS (Git, SQL, Docker)

Les chapitres `git/ch1`, `sql/ch1`, `devops/ch1` contiennent du shell/SQL/Dockerfile dans `startCode`/`hint`.

- [ ] L'éditeur affiche le code sans crasher
- [ ] Pas d'erreur de "parsing" même si ce n'est pas du JS
- [ ] La validation : actuellement les validators sont vides (`[]`) → vérifier le comportement attendu (auto-pass ? blocked ? message "à venir" ?)

---

## 9. Profil (`/profil`)

- [ ] Page accessible uniquement si connecté
- [ ] Affichage du username
- [ ] Avatar affiché (selon le choix d'onboarding)
- [ ] Statistiques : XP, niveau, badges débloqués
- [ ] Liste des badges avec icônes
- [ ] Badges non débloqués affichés en grisé
- [ ] Changement de username (si UI présente) → POST `/api/me/username`
- [ ] Changement d'avatar (si UI présente) → POST `/api/me/avatar`
- [ ] Bouton de reset de progression (si présent) → POST `/api/me/reset` → confirmation demandée
- [ ] Bouton de déconnexion → retour à `/` ou `/login`

---

## 10. Leaderboard (`/leaderboard`)

- [ ] Page accessible si connecté
- [ ] Liste des top utilisateurs (par XP)
- [ ] Affichage : rang, username, avatar, XP
- [ ] Ligne de l'utilisateur courant mise en évidence
- [ ] Pagination ou scroll infini (si présent) fonctionnel
- [ ] Pas d'info sensible exposée (email, etc.)
- [ ] Network : GET `/api/leaderboard` 200 OK

---

## 11. Auth & sécurité

### 11.1 Protection des routes

Session déconnectée :

- [ ] `/dashboard` → redirige vers `/login`
- [ ] `/profil` → redirige vers `/login`
- [ ] `/leaderboard` → redirige vers `/login` (si protégé)
- [ ] `/learn/javascript/chapitre-1` → redirige ou affiche ?
- [ ] Toute route `/api/me/*` sans session → 401

### 11.2 Cookies & session

- [ ] Cookie de session présent après login (httpOnly, Secure si HTTPS)
- [ ] `SameSite=Lax` ou `Strict` (vérifier dans DevTools → Application → Cookies)
- [ ] Déconnexion supprime le cookie

### 11.3 Tentatives d'attaque

- [ ] XSS dans le username (`<script>alert(1)</script>`) → échappé partout où il est affiché
- [ ] XSS dans le code de l'éditeur → ne s'évade pas vers le DOM principal
- [ ] SQL injection dans login (`' OR '1'='1`) → bloqué (Prisma ORM le gère mais à vérifier)
- [ ] Brute force sur login : 10 tentatives rapides → rate limit ou captcha ?
- [ ] Headers de sécurité présents (CSP, X-Frame-Options, etc.) → utiliser https://securityheaders.com en local via tunnel ou helmet

---

## 12. Responsive & accessibilité

### 12.1 Mobile (375px)

- [ ] Page d'accueil lisible, boutons accessibles au pouce
- [ ] Login/signup utilisable au clavier mobile
- [ ] Dashboard liste les cours sans débordement
- [ ] Carte de cours scrollable / zoom OK
- [ ] Chapitre : l'éditeur Monaco est utilisable (peut nécessiter scroll horizontal)
- [ ] Aucun élément dépasse l'écran (pas de scrollbar horizontale)

### 12.2 Desktop (1440px+)

- [ ] Aucun élément étiré bizarrement (max-width raisonnable)
- [ ] Sidebar/menu (si présent) bien aligné

### 12.3 Accessibilité

- [ ] Navigation au `Tab` : ordre logique, focus visible
- [ ] Alt sur les images
- [ ] Contrastes suffisants (texte vs fond)
- [ ] Pas de seul indicateur "couleur" pour info importante
- [ ] Inputs avec `<label>` associés

---

## 13. Performance

- [ ] Build de prod (`pnpm build`) sans warning critique
- [ ] Bundle initial < 500 KB (Network → Disable cache → recharger → taille des JS)
- [ ] LCP < 2.5s sur mobile (Lighthouse)
- [ ] CLS < 0.1
- [ ] Pas de console.error/warn intempestifs en navigation normale
- [ ] Pas de requête API qui pend > 3s

---

## 14. Routes API smoke (avec un tool comme `curl` ou Thunder Client)

Avec un token de session valide :

- [ ] GET `/api/me` → 200, retourne le profil
- [ ] POST `/api/me/step` avec body valide → 200, met à jour la progression
- [ ] POST `/api/me/step` avec body invalide (mauvais slug) → 400
- [ ] PUT `/api/me/username` avec nouveau nom → 200
- [ ] PUT `/api/me/username` avec nom pris → 409
- [ ] POST `/api/me/avatar` avec id valide → 200
- [ ] POST `/api/me/reset` → 200, progression remise à 0
- [ ] GET `/api/leaderboard` → 200, liste classée

Sans session :

- [ ] Tous les endpoints `/api/me/*` → 401 Unauthorized

---

## 15. Cas limites & exotiques

- [ ] Naviguer rapidement entre 5 chapitres différents → pas de fuite mémoire (DevTools → Performance → mémoire stable)
- [ ] Ouvrir 2 onglets, progresser dans l'un, voir si l'autre se synchronise (ou pas)
- [ ] Désactiver JavaScript dans le navigateur → page d'accueil reste lisible (au minimum)
- [ ] Mode incognito vs normal → comportements identiques
- [ ] Connexion/déconnexion rapide x5 → pas d'état coincé
- [ ] Code de 1000 lignes dans Monaco → éditeur reste fluide
- [ ] Tester sans connexion réseau (après chargement) → quels messages d'erreur ?
- [ ] Backend down (kill `pnpm dev`) → l'app affiche une erreur claire, pas de blank screen

---

## Bugs trouvés

| #   | Page / Route | Description | Sévérité     | Repro |
| --- | ------------ | ----------- | ------------ | ----- |
| 1   |              |             | Bloquant / Majeur / Mineur |       |
| 2   |              |             |              |       |
| 3   |              |             |              |       |

**Légende sévérité** :

- **Bloquant** : impossible d'utiliser la feature
- **Majeur** : feature dégradée mais utilisable
- **Mineur** : visuel, typo, edge case rare

---

## Notes de la passe

```
(Ajoute ici tes observations libres : feeling général, idées d'amélioration UX, etc.)
```

---

## Comptes de test recommandés

Pour ne pas avoir à signup à chaque fois, garde quelques comptes de seed en local :

- `test1@codeforge.local` / `Test1234!` — fresh, pas onboarded
- `test2@codeforge.local` / `Test1234!` — onboarded, progression partielle
- `test3@codeforge.local` / `Test1234!` — onboarded, beaucoup d'XP (pour tester le leaderboard)

Tu peux les créer manuellement ou via un script de seed Prisma.
