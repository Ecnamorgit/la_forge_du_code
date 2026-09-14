# Rapport d'audit de sécurité - La Forge du Code

Site audité : https://www.laforgeducode.fr (Vercel, région cdg1) · Date : 2026-09-12 · Commit audité : 48b1627

## Périmètre et méthode

- **Contrôles externes, passifs** : en-têtes HTTP, TLS, analyse passive OWASP ZAP (exploration de 3 minutes, sans attaque), Lighthouse, fichiers sensibles exposés (.env, .git, cartes de sources : tous refusés).
- **Relecture du code en lecture seule**, en deux passes : exécution du code des apprenants ; serveur, authentification, contrôle d'accès, données et secrets.
- **Dépendances** : `pnpm audit --prod`.
- **Hors périmètre** : test d'intrusion actif, attaque par force brute réelle, configuration des consoles Vercel et Supabase (non accessibles pendant l'audit).

Ce rapport est une auto-évaluation outillée : ce n'est ni une certification ni un audit officiel.

## Résultats des outils

| Outil | Résultat | Annexe |
|---|---|---|
| Mozilla Observatory | Note B+ (80/100), 11 tests sur 12 | annexes/observatory.json |
| Qualys SSL Labs | A+ / A, TLS 1.2 et 1.3, certificat valide jusqu'au 2026-12-07 | annexes/ssllabs.json |
| OWASP ZAP (baseline passive) | 0 échec, 58 réussis, 9 avertissements | annexes/zap-baseline.html |
| Lighthouse (accueil) | Performance 83, accessibilité 94, bonnes pratiques 100, SEO 100 | annexes/lighthouse.html |
| pnpm audit --prod | 97 avis : 5 critiques, 34 hauts, 50 moyens, 8 faibles | annexes/pnpm-audit.md |
| Relevé curl des en-têtes | CSP, HSTS preload, DENY, nosniff, cookies __Host- | annexes/en-tetes-http.txt |
| Relecture du code (2 passes) | Exécution du code apprenant ; serveur, authentification, accès, données | annexes/carte-des-routes.md |

## Réponses au questionnaire

## Q1 - Le code saisi par les apprenants est-il exécuté dans un environnement isolé, sans accès à la session ni aux données des autres utilisateurs ?

**Criticité** : critical · **Statut d'export** : ready · **Exigences** : OWASP-TOP10-2021-A03-INJECTION, OWASP-ASVS-V5-VALIDATION-SANITIZATION-SANDBOXING

Oui. Tout le code des apprenants (JavaScript, HTML/CSS, React, SQL) s'exécute dans leur propre navigateur : iframes `sandbox="allow-scripts"` sans `allow-same-origin` (origine opaque : aucun accès aux cookies, au localStorage ni à la page parente) et sql.js (WebAssembly) sur une base éphémère. Aucun code apprenant n'est transmis ni exécuté côté serveur (pas d'eval, de vm ni de child_process). Les échanges postMessage vérifient la source et l'origine.

> Réserve : Une boucle infinie peut figer l'onglet de l'apprenant lui-même (EXE-02) : impact limité à son propre poste.

Preuves :
- **Bac à sable d'exécution JavaScript** (available, strong) - `48b1627:lib/sandbox/run-js.ts` - Isolation conforme : origine opaque, aucun accès à la session
- **Schéma d'entrée de la route de progression** (available, strong) - `48b1627:app/api/me/step/route.ts` - Conforme : pas d'exécution côté serveur

## Q2 - La validation des exercices et l'attribution de l'XP, des badges et du classement sont-elles protégées contre la triche ?

**Criticité** : high · **Statut d'export** : reserved · **Exigences** : OWASP-TOP10-2021-A04-INSECURE-DESIGN, OWASP-ASVS-V11-BUSINESS-LOGIC

Partiellement. La route de progression exige une session, valide ses entrées (zod), est idempotente (une étape ne rapporte qu'une fois) et plafonne l'XP. En revanche, la réussite est déclarée par le navigateur : le serveur ne reçoit pas le code et ne vérifie ni la réussite ni l'ordre des étapes, et la route n'a pas de limite de débit (EXE-01).

> Réserve : Correctif planifié. Ne pas présenter le classement comme infalsifiable.

Preuves :
- **Attribution des étapes et de l'XP** (available, medium) - `48b1627:lib/me-server.ts` - Contrôle partiel : aucune preuve de réussite exigée

## Q3 - Les mots de passe, les sessions et les jetons de vérification et de réinitialisation sont-ils gérés selon l'état de l'art ?

**Criticité** : critical · **Statut d'export** : reserved · **Exigences** : OWASP-TOP10-2021-A07-AUTHENTICATION, OWASP-ASVS-V2-AUTHENTICATION, OWASP-ASVS-V3-SESSION

Oui pour l'essentiel. Mots de passe hachés avec bcrypt (coût 12) ; connexion refusée tant que l'e-mail n'est pas vérifié ; jetons de vérification et de réinitialisation de 32 octets aléatoires, stockés uniquement sous forme de hash SHA-256, à usage unique atomique, valables 24 h et 1 h ; réponses identiques sur « mot de passe oublié » ; cookies `__Host-` / `__Secure-`, HttpOnly, Secure, SameSite=Lax ; secret d'authentification obligatoire en production.

> Réserve : Sessions JWT de 30 jours non révoquées après un changement de mot de passe (SRV-03) ; existence d'un compte détectable à l'inscription (SRV-05) ; pas de compteur d'échecs par compte (SRV-07).

Preuves :
- **Hachage des mots de passe** (available, strong) - `48b1627:app/api/signup/route.ts` - Conforme
- **Jetons de vérification et de réinitialisation** (available, strong) - `48b1627:lib/token-crypto.ts` - Conforme
- **Cookies de session relevés en production** (available, strong) - `annexes/en-tetes-http.txt` - Conforme

## Q4 - Chaque requête vérifie-t-elle que l'utilisateur n'accède qu'à ses propres données ?

**Criticité** : critical · **Statut d'export** : ready · **Exigences** : OWASP-TOP10-2021-A01-BROKEN-ACCESS-CONTROL, OWASP-ASVS-V4-ACCESS-CONTROL

Oui. Les 20 routes API ont été relues une à une. Toutes les routes `/api/me/*` et `/api/leaderboard` vérifient la session dans la route elle-même et n'agissent que sur l'identifiant de session, jamais sur un identifiant fourni par le client : pas d'IDOR possible. Pas de server action, pas de rôle administrateur exposé, pas d'affectation de masse (champs Prisma construits explicitement).

> Réserve : La page d'un chapitre ne repose que sur le proxy (SRV-10) ; un contrôle dans la page est à ajouter.

Preuves :
- **Carte des routes et contrôles d'accès** (available, strong) - `annexes/carte-des-routes.md` - Conforme : aucune IDOR relevée

## Q5 - Les points sensibles (connexion, inscription, envoi d'e-mails) sont-ils protégés contre la force brute et l'abus ?

**Criticité** : high · **Statut d'export** : reserved · **Exigences** : OWASP-ASVS-V2.2-ANTI-AUTOMATION, OWASP-TOP10-2021-A07-AUTHENTICATION

Des limites sont codées sur toutes les routes sensibles (connexion 10 / 5 min, inscription 5 / h, mot de passe oublié et renvoi d'e-mail 5 / 15 min, réinitialisation 10 / 15 min), avec une adresse IP lue de façon résistante à la falsification. Leur efficacité en production dépend de la présence d'Upstash Redis : sans lui, les compteurs vivent en mémoire, instance par instance, et sont contournables (SRV-01).

> Réserve : Configuration Redis de production non vérifiée pendant l'audit (pas d'accès au projet Vercel).

Preuves :
- **Limiteur de débit** (declared, medium) - `48b1627:lib/rate-limit.ts` - Implémenté ; backend Redis de production non confirmé

## Q6 - Le site applique-t-il les protections attendues côté transport et navigateur (HTTPS, en-têtes de sécurité, CSP) ?

**Criticité** : high · **Statut d'export** : ready · **Exigences** : OWASP-TOP10-2021-A05-MISCONFIGURATION, OWASP-ASVS-V14-CONFIGURATION, OWASP-ASVS-V9-COMMUNICATION

Oui. TLS 1.2 et 1.3 uniquement, notes SSL Labs A+ et A, certificat Let's Encrypt valide jusqu'au 2026-12-07, HSTS de 2 ans avec preload, redirection vers HTTPS. En-têtes : CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy. Mozilla Observatory : B+ (80/100, 11 tests réussis sur 12). OWASP ZAP (analyse passive) : aucun échec, 58 contrôles réussis, 9 avertissements mineurs.

> Réserve : La CSP autorise 'unsafe-inline' et 'unsafe-eval' pour le bac à sable, ce qui affaiblit la défense contre les XSS (EXE-03) ; redirection ouverte sur /avatar?from= (SRV-06).

Preuves :
- **Configuration des en-têtes de sécurité** (available, strong) - `48b1627:next.config.ts` - Conforme, CSP permissive (unsafe-inline, unsafe-eval)
- **Mozilla Observatory** (available, strong) - `annexes/observatory.json` - B+ (80/100)
- **Qualys SSL Labs** (available, strong) - `annexes/ssllabs.json` - A+ / A
- **OWASP ZAP (analyse passive)** (available, strong) - `annexes/zap-baseline.html` - 0 échec / 9 avertissements

## Q7 - Les dépendances sont-elles à jour et exemptes de vulnérabilités connues exploitables ?

**Criticité** : critical · **Statut d'export** : reserved · **Exigences** : OWASP-TOP10-2021-A06-VULNERABLE-COMPONENTS, OWASP-ASVS-V14.2-DEPENDENCY

Non à la date de l'audit. `pnpm audit --prod` remonte 97 avis (5 critiques, 34 hauts). Les plus importants concernent next 16.2.4 (contournements du proxy, SSRF, déni de service ; corrigés à partir de 16.2.11 et 16.3.3) et next-auth 5.0.0-beta.31 (2 avis critiques, corrigés en beta.32). Une partie des avis ne s'applique pas à l'hébergement Vercel (exécution de code sur serveur Windows) ou ne touche que des outils de build (Prisma CLI, plugin Sentry).

> Réserve : Mise à jour de next et next-auth planifiée sous 7 jours.

Preuves :
- **Audit des dépendances (pnpm audit --prod)** (available, strong) - `annexes/pnpm-audit.md` - Non conforme : mises à jour requises

## Q8 - Les données personnelles et les secrets sont-ils protégés (exposition, stockage, RGPD) ?

**Criticité** : high · **Statut d'export** : reserved · **Exigences** : RGPD-ART-32, OWASP-TOP10-2021-A02-CRYPTOGRAPHIC-FAILURES, OWASP-ASVS-V8-DATA-PROTECTION

Aucun secret dans le dépôt ni dans l'historique git (.env ignoré, aucune variable NEXT_PUBLIC_). Les API ne renvoient ni e-mail, ni hash, ni jeton ; le classement n'expose que pseudo et scores. Export des données (RGPD) sans hash de mot de passe, suppression de compte disponible. Sentry sans données personnelles (ni sendDefaultPii ni replay). La base n'est interrogée que par Prisma, côté serveur.

> Réserve : Aucune RLS n'est activée sur les tables Supabase : si l'API de données Supabase est active, la clé publique « anon » donnerait accès aux tables (SRV-04, à vérifier dans le tableau de bord Supabase).

Preuves :
- **Exclusion des secrets du dépôt** (available, strong) - `48b1627:.gitignore` - Conforme
- **Minimisation des données exposées** (available, strong) - `48b1627:app/api/leaderboard/route.ts` - Conforme
- **Garde-fous de configuration de production** (available, strong) - `48b1627:lib/env.ts` - Conforme, à compléter pour Upstash

## Q9 - Les données sont-elles sauvegardées, et la restauration est-elle testée ?

**Criticité** : medium · **Statut d'export** : reserved · **Exigences** : RGPD-ART-32-1-C, ISO27001-2022-A.8.13-BACKUP

Une sauvegarde de la base est produite automatiquement par GitHub Actions et chiffrée en AES-256 avant de quitter le runner.

> Réserve : Aucun test de restauration n'est documenté à ce jour.

Preuves :
- **Sauvegarde automatique chiffrée** (available, medium) - `48b1627:.github/workflows/backup.yml` - Sauvegarde en place ; restauration non testée

## Q10 - Les erreurs et incidents sont-ils détectés et journalisés, et une faille peut-elle être signalée ?

**Criticité** : medium · **Statut d'export** : ready · **Exigences** : OWASP-TOP10-2021-A09-LOGGING-MONITORING, OWASP-ASVS-V7-LOGGING

Sentry côté serveur (erreurs de requêtes via onRequestError), journalisation structurée des événements de sécurité (par exemple le repli du limiteur de débit), sonde /api/health qui vérifie la base.

> Réserve : Pas de fichier /.well-known/security.txt pour signaler une faille ; le jeton de vérification d'e-mail figure dans l'URL et peut être journalisé en cas d'erreur (SRV-11).

Preuves :
- **Supervision des erreurs (Sentry)** (available, medium) - `48b1627:instrumentation.ts` - En place
- **Sonde de disponibilité** (available, medium) - `48b1627:app/api/health/route.ts` - En place

## Constats détaillés

| ID | Gravité | Constat | Emplacement | Scénario | Correctif |
|---|---|---|---|---|---|
| DEP-01 | Haute | Dépendances vulnérables : next 16.2.4, next-auth 5.0.0-beta.31 | package.json:27-28 | Avis publics de contournement du proxy et d'auth en mode ouvert, exploitables sans compte selon la configuration. | Mettre à jour next (16.3.5) et next-auth (beta.32). |
| EXE-01 | Moyenne | Réussite d'étape accordée sans preuve côté serveur | lib/me-server.ts:282-292 | Un compte boucle sur POST /api/me/step et prend la tête du classement avec tous les badges. | Limite de débit, ordre des étapes, validation serveur des cas statiques. |
| SRV-01 | Moyenne (à confirmer) | Limitation de débit en mémoire si Upstash absent ou en panne | lib/rate-limit.ts:106-123 | Attaque répartie sur plusieurs instances serverless : force brute sur la connexion, envoi massif d'e-mails. | Upstash obligatoire en production, fail-closed sur les routes sensibles. |
| SRV-03 | Moyenne | Sessions JWT de 30 jours non révoquées | auth.config.ts:6 | Une session volée reste valide après la réinitialisation du mot de passe. | sessionVersion dans le jeton, maxAge réduit. |
| SRV-04 | Moyenne (à confirmer) | Aucune RLS sur les tables Supabase | prisma/migrations | Si l'API de données est active, la clé anon lit User et OneTimeToken. | ENABLE ROW LEVEL SECURITY ou API de données désactivée. |
| EXE-03 | Moyenne | CSP avec 'unsafe-inline' et 'unsafe-eval' | lib/security/csp.ts:50 | Une future faille XSS ne serait pas bloquée par la CSP. | Bac à sable sur un sous-domaine, CSP à nonce. |
| BCK-01 | Moyenne | Restauration des sauvegardes jamais testée | .github/workflows/backup.yml | Une sauvegarde inutilisable n'est découverte qu'au moment de l'incident. | Test de restauration documenté. |
| EXE-02 | Faible | Boucle infinie : onglet figé, délai inopérant | lib/sandbox/run-js.ts:74-82 | while(true){} ou CTE SQL récursive figent l'onglet de l'apprenant. | Web Worker + terminate(). |
| EXE-04 | Faible | Indices injectés via dangerouslySetInnerHTML | components/ui/HintBox.tsx:17-20 | Contenu rédigé par l'équipe aujourd'hui ; XSS stockée si les cours passent un jour en base. | Rendu texte ou markdown échappé. |
| SRV-05 | Faible | Énumération des comptes | app/api/signup/route.ts:59-69 | Tester si une adresse est inscrite avant un hameçonnage ciblé. | Message neutre, temps de réponse égalisé. |
| SRV-06 | Faible | Redirection ouverte sur /avatar?from= | app/avatar/page.tsx:41 | Lien piégé qui renvoie vers un site tiers après l'enregistrement de l'avatar. | Filtre de chemin relatif. |
| SRV-07 | Faible | Pas de compteur d'échecs par compte | auth.ts:47 | Force brute distribuée sur un compte précis. | Compteur par e-mail, contrôle HIBP. |
| SRV-09 | Faible | Pas de contrôle Origin ; suppression de compte sans réauthentification | app/api/me/route.ts:25-33 | Protection CSRF reposant sur SameSite=Lax uniquement. | Contrôle Origin, mot de passe avant suppression. |
| SRV-10 | Faible | Page chapitre protégée par le seul proxy | app/learn/[course]/[chapter]/page.tsx:12 | Contournement du proxy (avis next 16.2.4) : contenu servi sans session. | auth() dans la page. |
| SUP-01 | Faible | Pas de security.txt | public/.well-known/ | Un chercheur ne sait pas où signaler une faille. | Publier security.txt. |
| EXE-05 | Info | postMessage vers l'iframe React avec la cible "*" | components/lesson/ReactPreview.tsx:97 | Sans impact : seul le code de l'apprenant transite. | Vérifier event.origin === "null". |
| EXE-06 | Info | escapeHtml n'échappe pas les guillemets | lib/markdown.ts:3-8 | Sans impact aujourd'hui (attribut contraint par regex). | Échapper " et '. |
| SRV-11 | Info | Points divers | voir rapport | Incrément Redis non atomique ; next-auth en bêta ; jeton de vérification consommé par GET ; message d'erreur Resend renvoyé brut ; e-mail réel dans scripts/reset-password.ts (dépôt privé). | Corriger au fil de l'eau. |

Échéances et livrables : voir `plan-remediation-la-forge-du-code.csv`.

## Avertissements mineurs des outils (sans action immédiate)

- ZAP : directives de cache à revoir sur /login et /signup, contenu statique mis en cache (normal pour `/_next/static`), `Access-Control-Allow-Origin: *` sur les fichiers statiques (réglage par défaut de Vercel, sans donnée sensible), COEP et CORP absents, SRI absent (scripts servis par le même domaine).
- SSL Labs : l'une des deux adresses Vercel ne renvoyait pas HSTS au moment du scan.
- Lighthouse : 3 textes au contraste insuffisant (`text-nebula-text-secondary`, pied de page en 10 px) et un titre `h3` qui saute un niveau.

## Empreinte

Dossier BLACKPROOF : `bp_sha256_96a0444932b028acf57f2eb0309b40d365fc3bcfb8c576ad89026e380b2b963f`, vérifiable sur https://blackproof.fr/verify.
