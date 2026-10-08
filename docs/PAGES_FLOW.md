# Parcours & design page par page — Nebula Command

Ordre **réel** d'arrivée sur les pages (tiré du code) + **tests fonctionnels** (liens,
boutons, redirections, états) + suivi **design/assets** pour la passe page par page.

**Légende statut design** (entre parenthèses dans les titres de page) : à faire · en cours · fait
Coche les tests `[x]` au fur et à mesure. Ce fichier complète `docs/SMOKE_TEST.md`
(qui reste la check-list exhaustive) — ici c'est l'ordre du parcours + le design.

---

## Carte du parcours

```
ANONYME
  /  (landing)
   ├─ "S'inscrire" ───────────────► /signup ──(POST /api/signup)──► écran "Vérifie ton email"
   │                                                                   │ (lien email)
   │                                                                   ▼
   │                                                            /verify-email/[token] ──► /login
   └─ "Se connecter" ─────────────► /login
                                      ├─ "Mot de passe oublié ?" ► /forgot-password ─(email)─► /reset-password/[token] ─► /login
                                      └─ (succès) ──────────────► /dashboard

CONNECTÉ (routes protégées par proxy.ts ; sinon → /login)
  /dashboard
   ├─ 1er login (onboardedAt = null) ─► redirige vers /avatar?from=/dashboard ─(POST /api/me/onboarded)─► /dashboard
   ├─ nav "Cursus" ──────────────────► /learn
   │                                     └─ clic cours ► /learn/[course] (carte) ► clic niveau ► /learn/[course]/[chapter] (mission)
   ├─ nav "Classement" ──────────────► /leaderboard
   ├─ nav "Pratique" ────────────────► (désactivé, pas encore de page)
   ├─ avatar (haut-droite) ──────────► /profil
   │                                     ├─ "Changer d'avatar" ► /avatar?from=/profil
   │                                     └─ "Déconnexion" / reset progression
   └─ "Reprendre la mission" ────────► /learn/[dernierCours]/[chapitre]
```

Routes protégées (redirigent vers `/login` si déconnecté) : `/dashboard`, `/learn`,
`/profil`, `/leaderboard`, `/avatar`. Pages d'auth (`/login`, `/signup`) : redirigent
vers `/dashboard` si **déjà** connecté.

---

# PARTIE 1 — Parcours anonyme

## 1. `/` — Landing (design : à faire)
Fichier : `app/page.tsx` · **Point d'entrée du site.**

**Assets / design à faire**
- [x] Logo en pixel art (`components/ui/PixelLogo.tsx`)
- [ ] Fond / planètes décoratives (pixel ou peint cohérent)
- [ ] Icônes des 3 cartes « features »

**Tests fonctionnels**
- [ ] La page charge sans flash, fond + logo + titre visibles
- [ ] Bouton **« Démarrer la mission »** → `/signup`
- [ ] Bouton **« J'ai déjà un compte »** → `/login`
- [ ] Nav haut : **« Se connecter »** → `/login`, **« S'inscrire »** → `/signup`
- [ ] Responsive 375px : nav ne chevauche pas le titre (corrigé), boutons accessibles
- [ ] Si **déjà connecté** et on tape `/` : la landing reste accessible (pas de redirect)

## 2. `/signup` — Inscription (design : à faire)
Fichier : `app/signup/page.tsx`

**Tests fonctionnels**
- [ ] Champs : email, pseudo, mot de passe, **confirmation**
- [ ] Soumettre vide → erreurs natives (required)
- [ ] Email invalide → erreur
- [ ] Mot de passe < 8 → erreur ; sans chiffre OU sans lettre → erreur (règle lettre+chiffre)
- [ ] Mots de passe différents → « ne correspondent pas »
- [ ] Pseudo déjà pris → 409 « pseudo déjà pris » ; email déjà utilisé → 409
- [ ] Rate limit : 6 tentatives rapides → 429 (« trop de tentatives »)
- [ ] Succès → écran **« Compte créé / Vérifie ton email »** (avec l'email affiché)
- [ ] Lien **« Se connecter »** (bas) → `/login` ; **« Retour à l'accueil »** → `/`

## 3. `/verify-email/[token]` — Vérification email (design : à faire)
Fichier : `app/verify-email/[token]/page.tsx` · Arrivée : **lien dans l'email**.

**Tests fonctionnels**
- [ ] Token valide → message de succès → lien/redirection vers `/login`
- [ ] Token invalide / expiré / déjà utilisé → message d'erreur clair (pas un crash)
- [ ] Le lien email = `APP_URL` : vérifier que `APP_URL` pointe sur la bonne origine
      (sinon 404 — cf. `docs/DEPLOYMENT.md`)

## 4. `/login` — Connexion (design : à faire)
Fichier : `app/login/page.tsx`

**Tests fonctionnels**
- [ ] Champs email + mot de passe
- [ ] Mauvais identifiants → « Email ou mot de passe invalide » (message générique, anti-énumération)
- [ ] Email non vérifié → message dédié + bouton **« Renvoyer le lien »** (fonctionnel)
- [ ] Rate limit : ~10 tentatives → blocage temporaire
- [ ] Succès → `/dashboard` (ou `/avatar` si 1er login non onboardé)
- [ ] Cookie de session présent ; recharger → reste connecté
- [ ] Lien **« Mot de passe oublié ? »** → `/forgot-password`
- [ ] Lien **« S'inscrire »** → `/signup` ; **« Retour à l'accueil »** → `/`

## 5. `/forgot-password` — Mot de passe oublié (design : à faire)
Fichier : `app/forgot-password/page.tsx`

**Tests fonctionnels**
- [ ] Email inexistant → **même** message neutre (anti-énumération)
- [ ] Email existant → même message + email réellement envoyé
- [ ] Rate limit : 6 demandes → 429
- [ ] Lien retour → `/login`

## 6. `/reset-password/[token]` — Nouveau mot de passe (design : à faire)
Fichier : `app/reset-password/[token]/page.tsx` · Arrivée : **lien email**.

**Tests fonctionnels**
- [ ] Nouveau mdp + confirmation ; mismatch → erreur ; < 8 → erreur
- [ ] Token déjà utilisé / expiré → message d'erreur à la soumission (pas une 404)
- [ ] Succès → message + redirection `/login` (~2,5 s)
- [ ] Connexion avec le nouveau mdp fonctionne
- [ ] 404 au clic = `APP_URL`/port ne matche pas l'app en cours (cf. `docs/DEPLOYMENT.md`)

---

# PARTIE 2 — Parcours connecté

## 7. `/avatar` — Onboarding & avatar (design : à faire)
Fichier : `app/avatar/page.tsx` · Arrivée : **gate 1er login** (`/dashboard` → `/avatar?from=…`)
ou depuis le profil (« Changer d'avatar »).

**Assets / design à faire**
- [ ] Sprites/illustrations des **espèces**, **couleurs d'uniforme**, **rôles**
- [ ] Aperçu (preview) de l'avatar assemblé

**Tests fonctionnels**
- [ ] Sélection espèce / couleur / rôle → preview se met à jour
- [ ] Choix du pseudo : validation (2–16, lettres/chiffres/_/-) ; pseudo pris → erreur
- [ ] Bouton « Continuer/Valider » → POST `/api/me/avatar` (+ `/api/me/onboarded` au 1er passage)
- [ ] Redirige vers `?from` (`/dashboard` au 1er login, `/profil` sinon)
- [ ] Re-visiter `/avatar` après onboarding → accessible pour changer (pas de boucle)

## 8. `/dashboard` — Hub (design : à faire)
Fichier : `app/dashboard/page.tsx` (+ `app/DashboardNav.tsx`, `app/ExploreSection.tsx`)

**Assets / design à faire**
- [x] Icônes de cours (sprite `mission-icons-v2`, livré ; fallback emoji conservé)
- [ ] Carte « Reprendre la mission » / vignette du cours actif

**Tests fonctionnels**
- [ ] Déconnecté → redirige `/login`
- [ ] Affiche pseudo + avatar + stats (XP, niveau/rang, badges, streak)
- [ ] Carte **« Reprendre la mission »** → `/learn/[dernierCours]/[chapitre]` (ou CTA vers `/learn` si rien commencé)
- [ ] `ExploreSection` : chaque carte cours → `/learn/[course]`
- [ ] **Nav** (header) : logo → `/dashboard`, **Cursus** → `/learn`, **Classement** → `/leaderboard`,
      **Pratique** = désactivé (non cliquable), avatar → `/profil`, **Déconnexion** → `/`

## 9. `/learn` — Cursus (catalogue) (design : à faire)
Fichier : `app/learn/page.tsx`

**Assets / design à faire**
- [ ] Vignette/sprite par cours (3 « featured » en strips animés : html/css/js)
- [ ] État « verrouillé » vs « disponible »

**Tests fonctionnels**
- [ ] Les 14 cours listés (HTML, CSS, JS, React, TS, Git, SQL, Node, Tests, DevOps, MongoDB, Security, Python, Algo)
- [ ] Chaque carte → `/learn/[course]` ; nombre de chapitres correct
- [ ] Retour `/dashboard`

## 10. `/learn/[course]` — Carte du cours (design : à faire)
Fichier : `app/learn/[course]/page.tsx` (+ `LevelNode.tsx`)

**Assets / design à faire**
- [ ] Fond spatial du cours (actuellement générique `chapter-1-bg`)
- [ ] Sprites des **nœuds de niveau** (LevelNode) + lignes SVG entre niveaux

**Tests fonctionnels**
- [ ] La carte (nœuds) s'affiche, positions correctes
- [ ] Clic sur un niveau → `/learn/[course]/[chapter]`
- [ ] Niveaux non jouables (le cas échéant) grisés/non cliquables
- [ ] Bouton **Retour** → `/dashboard` (ou `/learn`)
- [ ] URL cours inexistant (`/learn/inconnu`) → **404** (`notFound()`)

## 11. `/learn/[course]/[chapter]` — Mission (cœur de l'app) (design : à faire)
Fichier : `app/learn/[course]/[chapter]/page.tsx` → `ChapterClient.tsx` (+ `ChapterWorkspace`, `QuestBanner`, `CompletionScreen`, `MonacoEditor`)

**Assets / design à faire**
- [x] Icône de mission (sprite `mission-icons-v2`, livré ; fallback emoji conservé)
- [ ] Icône de bannière victoire (`banner-icons` livré ; `bannerFrame` reste à renseigner dans les étapes, le logo s'affiche en attendant)
- [ ] Sprites VFX (ennemi/turret/particules) cohérents
- [ ] Fond de mission par cours

**Tests fonctionnels**
- [ ] Éditeur Monaco charge avec le `startCode` du step
- [ ] Briefing + objectifs + compteur de step (1/4) affichés
- [ ] Bouton **« Déployer »** exécute le code (console pour JS / aperçu iframe pour HTML-CSS)
- [ ] Validation : objectifs marqués réussis, bannière de succès (icône, XP)
- [ ] **« Étape suivante »** → step suivant ; dernière étape → `CompletionScreen`
- [ ] Code faux → message d'erreur clair, pas de crash
- [ ] Persistance : recharger → revient au bon step ; POST `/api/me/step` après succès
- [ ] Fin de chapitre : badge débloqué + visible dans le profil ; bouton **« Continuer »** → `/learn/[course]`
- [ ] URL chapitre inexistant → **404**
- [ ] Vérifier sous CSP de prod : Monaco charge, « Déployer » marche, aucune erreur CSP en console

## 12. `/leaderboard` — Classement (design : à faire)
Fichier : `app/leaderboard/page.tsx`

**Tests fonctionnels**
- [ ] Déconnecté → `/login`
- [ ] Top joueurs par XP : rang, pseudo, XP, badges, streak
- [ ] Ligne de l'utilisateur courant mise en évidence ; si hors top → rang réel affiché
- [ ] Aucune info sensible (pas d'email) ; GET `/api/leaderboard` 200

## 13. `/profil` — Profil & réglages (design : à faire)
Fichier : `app/profil/page.tsx`

**Assets / design à faire**
- [x] Sprites des **badges** (`badges.png`, 48 badges ; fallback emoji conservé)
- [ ] Grand avatar

**Tests fonctionnels**
- [ ] Déconnecté → `/login`
- [ ] Stats : XP, niveau/rang, badges débloqués (x/48), streak
- [ ] Progression par cursus (barres + état des chapitres)
- [ ] Grille **badges** (48) : débloqués en couleur, verrouillés grisés
- [ ] **Changer le pseudo** → PATCH `/api/me/username` ; pseudo pris → 409
- [ ] **« Changer d'avatar »** → `/avatar?from=/profil`
- [ ] **Toggle son** (préférence persistée)
- [ ] **Reset progression** → confirmation → POST `/api/me/reset` (XP/badges remis à 0)
- [ ] **Déconnexion** → `/`

---

# PARTIE 3 — Transverse

## Header `DashboardNav` (toutes les pages connectées) (design : à faire)
- [ ] Logo → `/dashboard`
- [ ] Cursus → `/learn` · Classement → `/leaderboard` · Pratique = désactivé
- [ ] Avatar → `/profil` · Déconnexion → `/`
- [ ] Pseudo/avatar affiché correctement (fallback initiale si pas d'avatar)

## Page 404 / not-found (design : fait)
Fichier : `app/not-found.tsx`, stylée dans le thème (« Secteur introuvable »).
- [ ] URL inexistante → page 404 stylée (pas la 404 brute de Next)
- [ ] Lien retour vers `/` ou `/dashboard`

## États globaux à vérifier
- [ ] Chargements (skeletons/spinners) cohérents entre pages
- [ ] Messages d'erreur réseau (API down) clairs, pas d'écran blanc
- [ ] Toutes les routes `/api/me/*` sans session → 401
- [ ] Cohérence visuelle (police pixel titres, fond apaisé, glow en accent)

---

## Ordre conseillé pour la passe design
1. `/` (vitrine — première impression)
2. `/login` + `/signup` (mêmes composants, fort impact)
3. `/dashboard` (hub vu en boucle)
4. `/learn` → `/learn/[course]` → `/learn/[course]/[chapter]` (le cœur)
5. `/profil` (badges) + `/avatar` (onboarding)
6. `/leaderboard`, puis pages secondaires (verify/forgot/reset) et la **404**
