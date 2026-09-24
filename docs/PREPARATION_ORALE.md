# Préparation orale — Titre professionnel DWWM (document personnel)

> Pour TOI uniquement. Ne le lis pas mot à mot le jour J : lis-le à voix haute plusieurs fois
> jusqu'à pouvoir dire chaque idée avec tes mots. Support : `docs/LaForgeDuCode_Soutenance_DWM.pptx` (39 slides, version du 15 septembre 2026, après l'audit de sécurité).
> Ce fichier n'est pas suivi par git ; il reste sur ton poste.

---

## 0. Le format exact de l'épreuve (REV2, juillet 2024) — soutenance le 16 octobre 2026

| Étape | Durée | Ce qui se passe |
|---|---|---|
| Questionnaire professionnel | 30 min | Écrit, tous les candidats ensemble, sans internet ni téléphone. Corrigé par le jury AVANT ta présentation. |
| **Présentation du projet** | **35 min** | Ton diaporama. Le jury a lu ton dossier de projet imprimé avant. |
| **Entretien technique** | **40 min** | Questions du jury sur ton dossier et ta présentation. C'est là que tout se joue. |
| Entretien final | 15 min | Vision du métier, motivations, échange sur le dossier professionnel. |

**Minutage cible : 36 min sur 39 slides** (fenêtre attendue : 35 à 40 min). Le temps de chaque slide est écrit en tête de ses notes orateur (⏱). Par partie :

| Partie | Slides | Temps | Point de contrôle (chrono en main) |
|---|---|---|---|
| 1 · Contexte | 1–8 | 5 min | à la slide 9, tu dois être à **5:00** |
| 2 · Front-end | 9–18 | 8 min | à la slide 19 : **13:00** |
| 3 · Back-end | 19–28 | 9 min | à la slide 29 : **22:00** |
| 4 · Jeu d'essai, démo, qualité | 29–33 | 7 min 30 | à la slide 34 : **29:30** |
| 5 · Veille | 34–36 | 4 min | à la slide 37 : **33:30** |
| 6 · Synthèse | 37–39 | 2 min | fin : **35:30** |

Les slides longues : bac à sable (18) 2 min, route /api/me/step (25) 1 min 30, jeu d'essai (29) 1 min 30, démo (31) 3 min, constats de l'audit (35) 1 min 30. Les séparateurs : 5 secondes, on ne s'arrête pas.

**Plan de repli si tu es en retard** (regarde le chrono aux points de contrôle) :
- En retard de 2 min à la slide 19 → passe la slide 7 (compétences : « tout est dans le tableau du dossier ») et la 15 en 20 s.
- En retard à la slide 29 → sur la 23 (script SQL) et la 26 (inscription), une phrase chacune, sans lire le code.
- En retard à la slide 34 → démo raccourcie : uniquement l'erreur puis le succès (1 min 30), pas le mobile.
- En retard à la slide 37 → synthèse en 30 s, perspectives en 15 s. Ne jamais sauter la veille (34–36) : le référentiel l'exige.
- En avance ? Ne rallonge rien : le jury préfère 35 min nettes et des questions.

**Ce que ce deck a de plus que la plupart** (à ne pas gâcher) : un audit de sécurité complet avec preuves, un jeu d'essai avant/après, un exemple de recherche en anglais. Le référentiel demande explicitement les trois.

---

## Règle d'or

- **Une idée par phrase.** Si tu bloques, reviens au concret : « dans La Forge du Code, ça sert à… ».
- Chaque techno : dis **à quoi elle sert** avant son nom.
- Tu as le droit de dire « je ne l'ai pas mis en place, mais je sais que ça existe ».
- Devant un extrait de code : ne le lis pas ligne à ligne. Dis **ce qu'il fait**, puis pointe **1 ou 2 lignes** clés.
- Devant une faille corrigée : dis d'abord **ce qu'un attaquant pouvait faire**, puis comment tu l'as prouvé, puis le correctif. Toujours dans cet ordre.

---

## PARTIE 1 — Contexte (slides 1 à 8) · ≈ 5 min

### Slide 1 — Titre
« Bonjour, je m'appelle Joan. Je vous présente La Forge du Code, mon projet fil rouge réalisé pendant la formation : une plateforme web pour apprendre à coder **en codant**. L'apprenant écrit du code dans le navigateur, il est corrigé immédiatement et gagne de l'expérience dans un univers spatial. »

### Slide 2 — Qui suis-je ? (30 secondes)
« J'ai 35 ans. J'ai été ouvrier de production chez Michelin : des années de postes, de consignes et d'équipe. J'aimais comprendre comment la machine marchait, pas seulement la faire tourner. Puis le corps a dit stop : un accident du travail. Il a fallu repartir. Pourquoi ce métier ? J'ai toujours aimé l'informatique, j'ai toujours été à l'aise avec la technologie, sans en avoir fait mon métier. Après l'accident, j'ai fait un bilan de compétences, et le résultat pointait clairement vers le développement web et web mobile. J'ai suivi la formation DWWM à l'AFPA, à domicile et en autonomie complète : le formateur nous transmettait les fiches chaque jour, avec des points Teams. »
→ Ne t'attarde pas sur l'accident : une phrase, factuelle, puis on avance. Si une phrase de la slide ne sonne pas comme toi, change-la : c'est la seule slide où le jury doit entendre ta voix, pas la mienne.

### Slide 3 — Plan
15 secondes. « Ce plan suit le référentiel d'évaluation : contexte, front, back, sécurité et jeu d'essai, veille, synthèse. »

### Slide 4 — Expression des besoins
« Le problème : les supports sérieux pour apprendre le code ne manquent pas ; mais aujourd'hui, celui qui veut comprendre un langage doit pouvoir le faire sans avoir l'impression de travailler, dans un univers gamifié. Mes objectifs : coder dans le navigateur sans rien installer, validation immédiate avec aide ciblée, gamification, mobile et ordinateur, exécution sécurisée. Mes limites, assumées : 4 cursus complets sur 14, connexion e-mail uniquement, contenu dans le code plutôt qu'un back-office, une seule langue. »

### Slide 5 — Les contraintes du projet
« Quatre contraintes. Seul : pas de binôme, et un projet ambitieux, il a fallu apprendre sur le tas. Le temps : le projet s'est fait en parallèle de la formation. Zéro budget : tout en offre gratuite, le domaine à 5 euros. Et la contrainte qui a tout orienté : le site exécute du code tapé par des inconnus, donc la sécurité n'est pas une option. »

### Slide 6 — Environnement technique (CP1)
« Next.js 16 avec React 19 et TypeScript : un seul langage front et back. Tailwind, Monaco. Auth.js, PostgreSQL avec Prisma, Resend. Qualité : ESLint, Vitest, Playwright, GitHub Actions. Sur mon poste : VS Code, Node 22, pnpm, Git. Je lis la documentation en anglais. »
**Q : Docker ?** → « Pas de conteneur pour l'application ; la CI utilise un PostgreSQL conteneurisé pour les e2e. Un Dockerfile reproduirait l'environnement de prod à l'identique ; c'est une piste. »

### Slide 7 — Compétences
« Chaque compétence du référentiel, la réalisation qui la prouve, et la slide où je la montre. » 30 secondes, ne la lis pas.

### Slide 8 — Organisation & Git
« main pour la production, dev pour l'intégration, une branche par fonctionnalité. Commits conventionnels. La CI bloque la fusion si les tests échouent. L'audit de sécurité a suivi la même règle : une branche, 41 commits, une pull request. »

---

## PARTIE 2 — Front-end (slides 9 à 18) · ≈ 9 min

### Slide 10 — Charte & maquettage (CP2)
« Univers spatial rétro pixel-art, fond sombre, accents cyan et orange. Palette dans un fichier, injectée en variables CSS via Tailwind : une couleur se change à un seul endroit. Parcours des écrans défini avant le code, écrans clés maquettés mobile-first. Éco-conception : pas de vidéo, sprites légers, polices système. »
**Q : outil de maquettage ?** → TA réponse : ________.

### Slide 11 — Enchaînement des interfaces (CP2)
« Deux zones : le visiteur anonyme (accueil, essai sans compte sur trois chapitres HTML, inscription, connexion) et l'utilisateur connecté (tableau de bord, catalogue, chapitre, classement, profil). Sans session, le middleware redirige vers /login. »

### Slides 12–13 — Captures web et mobile (CP3)
« Même composant, deux largeurs. Sur mobile, l'en-tête ne garde que le blason : le nom complet reste annoncé aux lecteurs d'écran par aria-label. Page de chapitre : deux colonnes sur ordinateur, trois onglets Leçon / Code / Sortie sur mobile. »

### Slide 14 — Code statique (CP3)
« Extrait réel de l'accueil. section, un seul h1. Classes Tailwind sans préfixe = mobile ; sm: à partir de 640 px, lg: à partir de 1024 px. flex-col → sm:flex-row : les boutons passent d'empilés à côte à côte. »

### Slide 15 — Accessibilité, SEO, RGPD, éco-conception (CP3)
« Accessibilité : contrastes, clavier, alt, labels, prefers-reduced-motion. Lighthouse me donne 94 en accessibilité, avec trois contrastes à corriger que l'audit a relevés. SEO : rendu serveur, sitemap et robots générés, métadonnées, Open Graph. RGPD : minimisation, hachage, suppression en cascade, export des données. Éco-conception : AVIF/WebP, éditeur chargé seulement où il sert. »

### Slide 16 — Code dynamique : Déployer (CP4)
« Quand l'apprenant clique Déployer : JavaScript → bac à sable, je récupère logs et erreur, je les passe au validateur. SQL → sql.js en WebAssembly dans le navigateur. HTML/CSS → le code est posté à la coquille d'aperçu et validé statiquement. Le résultat met à jour l'état React : l'interface se redessine seule. Depuis l'audit, en cas de succès j'envoie **aussi le code** au serveur, qui rejoue le validateur avant d'accorder l'étape. »
**Définition — React** : composants + état ; l'état change, l'affichage suit.

### Slide 17 — Validateur (CP4)
« Une fonction par étape : elle reçoit le code, rend un verdict et un message d'aide ciblé. Fonction pure : même entrée, même sortie, pas de base ni de réseau ; testable en isolation, 1 525 tests unitaires au total. »

### Slide 18 — Bac à sable (CP4) ⚠️ SUJET FORT — 2 min, apprends-le
« Exécuter du code écrit par un utilisateur, c'est dangereux : vol de cookie de session, XSS, boucle infinie. Trois couches.
Un : l'iframe a `sandbox="allow-scripts"` **sans** `allow-same-origin`. Le navigateur lui donne une **origine opaque** : pour lui, c'est un site étranger ; aucun accès aux cookies, au stockage ni au DOM de mon application. C'est le navigateur qui garantit l'isolation, pas mon code.
Deux : avant l'audit, le document d'exécution était un `srcdoc`. Or un srcdoc **hérite de la CSP du parent** : pour que le code de l'apprenant tourne, tout mon site devait autoriser `unsafe-inline` et `unsafe-eval`, ce qui désarmait la protection anti-XSS partout. Depuis l'audit, le document est servi depuis une **origine dédiée**, bac-a-sable.laforgeducode.fr, avec sa propre CSP permissive ; le site, lui, a une CSP stricte à nonce. Poignée de main : le document dit « prêt », puis je lui poste le code.
Trois : une boucle infinie figeait l'onglet malgré le timeout, parce que l'iframe partage le fil d'exécution de la page. J'instrumente les boucles avant l'envoi : une garde arrête après 3 secondes, l'onglet reste vivant.
Et le serveur n'exécute **jamais** le code de l'apprenant. »
**Q : pourquoi pas sur le serveur ?** → « Plus risqué et plus coûteux ; dans le navigateur, l'isolation est gratuite et garantie par le navigateur. »
**Définition — XSS** : script malveillant injecté dans une page. **CSP** : en-tête HTTP qui dit au navigateur quels scripts il a le droit d'exécuter.

---

## PARTIE 3 — Back-end (slides 19 à 28) · ≈ 9 min

### Slide 20 — Architecture
« Trois couches. Navigateur : pages React, éditeur, bac à sable sur l'origine dédiée. Serveur Next.js : middleware qui garde les routes et pose la CSP à nonce, routes API, Auth.js, bibliothèques serveur, Prisma. Données : PostgreSQL chez Supabase, Resend pour les e-mails. »

### Slide 21 — MCD (CP5)
« Merise. Utilisateur au centre ; il complète 0 à n étapes (StepCompletion), débloque 0 à n badges (UserBadge). Choix assumé : Cours, Chapitre, Étape, Badge ne sont pas en base mais dans le code, parce qu'un chapitre embarque son validateur, qui est du code : versionner les deux ensemble dans Git est plus sûr. »

### Slide 22 — MLD (CP5)
« Toutes les clés étrangères pointent vers User avec ON DELETE CASCADE : droit à l'effacement. UNIQUE composite (userId, course, chapter, stepIndex) : une étape validée une seule fois, garanti par la base. 13 migrations aujourd'hui, dont deux nées de l'audit : la version de session et la Row Level Security. »
**Q : la RLS, c'est quoi ?** → « Une règle PostgreSQL : sans politique explicite, aucune ligne n'est lisible par un rôle autre que le propriétaire. Supabase expose une API de données par défaut ; la RLS ferme cette porte, même si Prisma, propriétaire des tables, n'est pas gêné. »

### Slide 23 — Script SQL & Prisma (CP5)
« Le schéma Prisma est la source ; Prisma génère le SQL de migration, versionné, rejoué à l'identique. `onDelete: Cascade` devient `ON DELETE CASCADE`. En dev : `--create-only` pour relire le SQL ; en prod : `migrate deploy`. »

### Slide 24 — completeStep (CP6)
« Une transaction : tout ou rien. Idempotence d'abord (étape déjà faite = réponse normale) ; puis, depuis l'audit, l'**ordre** : l'étape n exige l'étape n-1, la même règle que la carte des chapitres, sinon 409 ; puis insertion, XP incrémenté atomiquement, badge si le chapitre est complet. Prisma paramètre tout : pas d'injection. »

### Slide 25 — Route POST /api/me/step (CP7) ⚠️ 2 min
« Avant l'audit, cette route vérifiait la session et la forme des données, puis accordait l'étape. Un script pouvait donc déclarer toutes les étapes et prendre la tête du classement : c'est le constat EXE-01, que j'ai prouvé par un test. Aujourd'hui, six contrôles. Zéro : même origine, contre la CSRF. Un : la session. Deux : 20 appels par minute et par compte, comptés avant même de lire le corps. Trois : Zod. Quatre, le cœur : la **preuve**. Le navigateur envoie le code, le serveur rejoue le même validateur ; 422 sinon. Cinq : le métier, qui vérifie l'ordre, 409. Le serveur reste la seule source de vérité de l'XP. »
**Q : et les étapes JavaScript ?** → « Leurs validateurs lisent la sortie de la console, produite dans le navigateur. Les rejouer demanderait d'exécuter le code sur le serveur, ce que j'exclus. Leur réussite reste déclarée, mais l'ordre et le débit s'appliquent. Risque résiduel documenté. »

### Slide 26 — Inscription (CP7)
« Rate-limit par IP avant tout calcul, Zod, bcrypt coût 12 — volontairement lent — jeton de vérification haché, 24 h, usage unique. Constat SRV-05 : la route répondait « e-mail déjà utilisé », donc on pouvait savoir qui a un compte. Aujourd'hui la réponse est identique à une inscription réussie ; le titulaire reçoit un e-mail « tu as déjà un compte », trois par jour au plus, et le hachage est calculé quand même pour que le temps de réponse ne trahisse rien. Le pseudo, lui, est public : dire qu'il est pris ne révèle rien. »

### Slide 27 — Sessions (CP7)
« Auth.js, e-mail + mot de passe, e-mail vérifié obligatoire. Session = JWT signé dans un cookie httpOnly, vérifié sans base par le middleware. Constat SRV-03 : un JWT volé restait valable 30 jours, même après réinitialisation du mot de passe. Correctif : chaque compte porte une `sessionVersion` ; le jeton l'emporte à la connexion ; la réinitialisation l'incrémente dans la même transaction que le nouveau hash ; à chaque appel serveur je compare, et je refuse si ça diverge. Durée réduite à 7 jours. Le contrôle vit côté Node, pas dans le middleware edge qui ne peut pas lire la base. »
**Définition — JWT** : jeton signé par le serveur, infalsifiable sans le secret ; httpOnly = illisible par JavaScript.

### Slide 28 — Sécurité, grille OWASP
« Injection : Prisma + Zod + RLS. Authentification : bcrypt, verrou par compte, jetons uniques, sessions révocables. XSS : la CSP à nonce, sans unsafe-inline ni unsafe-eval, possible seulement depuis que le bac à sable est sur son sous-domaine. CSRF : contrôle Origin, mot de passe exigé pour supprimer le compte. Configuration : HSTS preload, DENY, nosniff, secrets validés au démarrage, security.txt. Supervision : Sentry, sauvegardes, dépendances à jour. »
**Définition — nonce** : valeur aléatoire unique par requête ; seuls les scripts qui la portent s'exécutent. `strict-dynamic` : un script de confiance peut en charger d'autres (Monaco).

---

## PARTIE 4 — Jeu d'essai, démo, qualité (slides 29 à 33) · ≈ 7 min

### Slide 29 — Jeu d'essai ⚠️ demandé par le référentiel, avec analyse des écarts
« Fonctionnalité la plus représentative : valider une étape, côté navigateur puis côté serveur. Mon jeu d'essai est un test Playwright : un compte dédié appelle l'API comme le ferait un script. Cinq cas. Nominal : 200 et 41 XP, avant comme après. Les quatre autres étaient **en écart avant l'audit** : étape sautée acceptée, étape sans solution acceptée, solution d'une autre étape acceptée, 25 appels d'affilée tous acceptés. Analyse : le serveur ne vérifiait que l'existence de l'étape. Correctif EXE-01 : preuve rejouée, ordre, débit. Après : 5 sur 5 conformes, et le test reste dans la CI. »

### Slide 30 — Analyse des écarts
« L'écart : avant l'audit, 4 cas sur 5 étaient acceptés à tort. La cause : la validation se faisait uniquement dans le navigateur ; le serveur vérifiait que l'étape existe, jamais qu'elle était réussie ni dans l'ordre. Le correctif : trois protections indépendantes — preuve rejouée, ordre, débit — et le test reste dans la CI. Le cas limite, que j'assume : les chapitres JavaScript et SQL sont jugés sur une exécution dans le navigateur ; les rejouer sur le serveur reviendrait à y exécuter le code des apprenants, ce que j'exclus. Leur réussite reste déclarée, avec l'ordre et le débit. C'est écrit dans la fiche EXE-01. »

### Slide 31 — Démonstration (3 min, répétée)
1. Accueil → « Essayer sans compte ».
2. Chapitre 1 HTML : leçon à gauche, éditeur à droite.
3. Taper `<html></html>` sans DOCTYPE → Déployer → l'aide ciblée.
4. Ajouter `<!DOCTYPE html>` → Déployer → +41 XP, niveau 2.
5. Sur ton téléphone : les onglets Leçon / Code / Sortie.
**Si le réseau lâche** : la vidéo de la slide (45 s, mêmes étapes), ou l'application en local (`pnpm dev`). Répète la démo la veille sur le réseau du centre si possible.

### Slide 32 — Tests & CI (CP8)
« 1 525 tests unitaires dans 114 fichiers. 22 scénarios end-to-end, dont 9 nés de l'audit : chacun a été commité **rouge** — il démontrait la faille — puis est passé **vert** avec le correctif, et reste dans la suite. CI : lint, typecheck, tests, build ; puis un PostgreSQL, les migrations, les e2e. Rouge = fusion bloquée. »

### Slide 33 — Déploiement documenté (CP8)
« Vercel région Paris, Supabase, Resend, domaine laforgeducode.fr. Secrets chez l'hébergeur, validés au démarrage. Constat INF-01, découvert pendant l'audit : les préversions Vercel — une par branche poussée — partageaient la base de production et y appliquaient les migrations. Le script `migrer-si-production.mjs` ne migre plus qu'en production, et fait échouer le build si la variable manque plutôt que de sauter en silence. Domaine d'envoi vérifié : DKIM, SPF, DMARC. Procédure complète dans docs/DEPLOYMENT.md. »

---

## PARTIE 5 — Veille (slides 34 à 36) · ≈ 4 min

### Slide 34 — L'audit : la démarche
« Un site où l'on tape et exécute du code est une cible, alors j'ai audité le mien, le 12 septembre. Quatre temps. Chercher : outils passifs sur la prod — Observatory, SSL Labs, ZAP, Lighthouse, pnpm audit — plus deux passes de relecture du code. Démontrer : pour chaque constat, un test qui échoue et prouve la faille, commité seul. Corriger : le correctif fait passer ce test. Re-mesurer : contre-audit avec les mêmes outils. Le dossier est au format BLACKPROOF, chaque preuve a son empreinte SHA-256. Les scores de départ étaient bons ; ce sont la relecture et les tests qui ont trouvé les vraies failles. Limite assumée : auto-évaluation, pas un test d'intrusion. »
→ Si le contre-audit est fait avant le 16 octobre : donne les nouveaux scores ici.

### Slide 35 — Les constats
Ne lis pas le tableau. Trois histoires :
- **EXE-01** (la triche) : déjà racontée au jeu d'essai, une phrase.
- **EXE-03** (la CSP) : « le plus gros chantier, six commits : impossible d'avoir une CSP stricte tant que le bac à sable était en srcdoc ; sous-domaine dédié, puis nonce. »
- **INF-01 et EXE-07**, découverts en cours d'audit : « les préversions migraient la base de production ; et le cursus SQL ne fonctionnait pas en production, le moteur WebAssembly ne se chargeait pas, aucun test ne le couvrait. C'est exactement ce qu'un audit doit trouver, et je le dis. »
- **BCK-01** reste ouvert : « la restauration des sauvegardes n'a jamais été testée ; c'est ma prochaine action. »

### Slide 36 — Exemple de recherche, en anglais
« Ma méthode : une question précise en anglais — « Can a srcdoc iframe have its own CSP? » — puis les sources par ordre de confiance : documentation officielle, un acteur reconnu comme l'OWASP, ensuite les blogs et Stack Overflow pour recouper ; et je vérifie la date, parce que la CSP et Next.js changent vite. Réponse : non, un srcdoc hérite de la CSP du parent ; il faut donc une autre origine. Ensuite la doc Next.js sur les nonces, que j'ai traduite : le proxy génère un nonce par requête, le passe dans l'en-tête, Next l'applique à ses scripts, et la page devient dynamique. Deux pièges rencontrés en appliquant : `Buffer` n'existe pas dans le runtime edge, j'utilise `btoa` ; et le cache de build peut servir l'ancienne CSP. »
→ Si le jury te demande de lire l'anglais à voix haute : lis les deux premières phrases de l'extrait, lentement.

---

## PARTIE 6 — Synthèse (slides 37 à 39) · ≈ 2 min

### Slide 37 — Satisfactions & difficultés
« Satisfactions : une application complète et en ligne, une chaîne qualité réelle, et un audit mené jusqu'au bout : avoir cherché mes propres failles, les avoir prouvées, puis corrigées. Difficultés : le bac à sable et la CSP, le plus long chantier ; les e-mails ; les migrations sur une base de production ; le périmètre ; et deux leçons d'humilité découvertes pendant l'audit. »

### Slides 38–39 — Perspectives, merci
« Compléter les cursus ; OAuth et double authentification ; contre-audit, restauration des sauvegardes testée, base de préversion séparée ; rejouer les étapes JavaScript côté serveur ; audit RGAA. » Puis les remerciements, en regardant les gens : Laurent, ton formateur ; l'AFPA ; Yohan pour ses relectures ; les premiers testeurs. « Merci, je suis prêt pour vos questions. »

---

## Entretien technique (40 min) — réponses prêtes

**« Front / back ? »** → Front : ce qui s'exécute dans le navigateur. Back : le serveur, les données, l'auth, le métier. Next.js fait les deux.
**« GET vs POST ? »** → GET lit, POST envoie pour créer ou modifier. GET ne change jamais l'état du serveur.
**« Pourquoi Next.js ? »** → Un projet, un langage, rendu serveur pour le SEO, déploiement simple ; efficace seul.
**« Mots de passe ? »** → Jamais en clair : bcrypt coût 12, à sens unique, volontairement lent.
**« Suppression de compte ? »** → Contrôle Origin + mot de passe exigé (SRV-09), puis ON DELETE CASCADE : tout part. Droit à l'effacement.
**« Tricher sur l'XP ? »** → Non : preuve rejouée, ordre, débit, UNIQUE en base ; c'était possible avant, prouvé par un test, corrigé.
**« Migration ? »** → SQL versionné qui fait évoluer le schéma ; rejoué dans l'ordre ; seule la production l'applique sur Vercel.
**« Middleware ? »** → Code exécuté avant chaque page : vérifie la session, redirige, et pose la CSP à nonce.
**« NoSQL ? »** → Pas de MongoDB ici, données relationnelles. Mais Redis (Upstash) pour le rate-limit partagé entre instances : une base clé-valeur NoSQL.
**« Un test d'intrusion ? »** → Non : ZAP en mode passif, sans attaque. Je sais la différence, et je le dis dans le dossier.
**« Pourquoi une origine dédiée plutôt que retirer unsafe-inline ? »** → Parce qu'un srcdoc hérite de la CSP du parent : tant que le bac à sable vivait dans la page, le site entier devait être permissif.
**« Quel est le risque résiduel ? »** → Les étapes jugées sur exécution (JavaScript, SQL) restent déclarées ; les sauvegardes n'ont pas été restaurées en test ; le contre-audit est à faire.
**« Combien de temps, comment organisé ? »** → TA réponse : ________.

---

## Glossaire minute

| Terme | En une phrase |
|---|---|
| TypeScript | JavaScript typé : erreurs détectées avant l'exécution |
| React | Composants + état ; l'état change → l'affichage suit |
| Next.js | Framework React full-stack : pages, routes API, rendu serveur, middleware (proxy.ts) |
| Tailwind | CSS en classes utilitaires ; préfixes sm:/lg: = responsive |
| ORM / Prisma | Traduit le code en SQL ; requêtes typées et paramétrées |
| Migration | SQL versionné qui fait évoluer le schéma |
| Transaction | Groupe d'opérations tout-ou-rien |
| RLS | Row Level Security : PostgreSQL filtre les lignes par rôle |
| bcrypt | Hachage lent des mots de passe |
| JWT | Cookie signé ; vérifiable sans base ; révocable ici par sessionVersion |
| XSS | Script injecté ; parades : échappement React, CSP à nonce, bac à sable |
| CSRF | Requête forgée depuis un autre site ; parade : contrôle Origin |
| Injection SQL | SQL glissé dans un champ ; parade : requêtes paramétrées |
| CSP / nonce / strict-dynamic | En-tête qui limite les scripts ; nonce = valeur unique par requête ; strict-dynamic = un script de confiance peut en charger d'autres |
| Origine opaque | Iframe sandbox sans allow-same-origin : zéro accès à l'app |
| Origine dédiée | bac-a-sable.laforgeducode.fr : sa CSP permissive n'est plus celle du site |
| Rate-limit | Limite de requêtes ; compteur Redis partagé entre instances |
| Zod | Validation de la forme des données reçues |
| Fonction pure | Même entrée → même sortie, sans effet de bord |
| CI | Lint + tests automatiques à chaque push ; bloque la fusion si rouge |
| Jeu d'essai | Entrées, attendu, obtenu, analyse des écarts — ici avant / après correctif |
| BLACKPROOF | Format de dossier d'audit avec empreinte SHA-256 de chaque preuve |
| OWASP Top 10 | Les 10 risques web majeurs |

---

## Plan d'entraînement (jusqu'au 16 octobre)

1. **Cette semaine** : lis ce document à voix haute, slides ouvertes. Remplis les blancs « ________ ».
2. **Semaine suivante** : présente sans le document, chronomètre : vise 33–35 min. Répète la démo trois fois.
3. **Début octobre** : fais-toi poser les questions de l'entretien technique. Fais le contre-audit et mets à jour la slide 34.
4. **Veille** : glossaire + les trois sujets forts (18, 25, 29-31). Teste www.laforgeducode.fr et bac-a-sable.laforgeducode.fr depuis le réseau du centre si tu peux.
5. **Le jour J** : dossier imprimé, dépôt GitHub ouvert, application en local prête, vidéo de secours dans le deck.
