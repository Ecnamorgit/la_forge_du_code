// Donnees de l'audit initial de securite de La Forge du Code (2026-09-12).
const SITE = "https://www.laforgeducode.fr";

const questions = [
  {
    id: "question_isolation_code",
    text: "Le code saisi par les apprenants est-il exécuté dans un environnement isolé, sans accès à la session ni aux données des autres utilisateurs ?",
    category: "vulnerability-management",
    criticality: "critical",
    mappedRequirements: ["OWASP-TOP10-2021-A03-INJECTION", "OWASP-ASVS-V5-VALIDATION-SANITIZATION-SANDBOXING"],
    suggestedAnswer: "Décrire où s'exécute le code, les attributs d'isolation et la vérification des messages échangés.",
    evidenceIds: ["evidence_sandbox_iframe", "evidence_pas_execution_serveur"],
    confidence: "high",
    answerText: "Oui. Tout le code des apprenants (JavaScript, HTML/CSS, React, SQL) s'exécute dans leur propre navigateur : iframes `sandbox=\"allow-scripts\"` sans `allow-same-origin` (origine opaque : aucun accès aux cookies, au localStorage ni à la page parente) et sql.js (WebAssembly) sur une base éphémère. Aucun code apprenant n'est transmis ni exécuté côté serveur (pas d'eval, de vm ni de child_process). Les échanges postMessage vérifient la source et l'origine.",
    answerReservation: "Une boucle infinie peut figer l'onglet de l'apprenant lui-même (EXE-02) : impact limité à son propre poste.",
    answerConfidence: "high",
    answerExportStatus: "ready",
  },
  {
    id: "question_integrite_progression",
    text: "La validation des exercices et l'attribution de l'XP, des badges et du classement sont-elles protégées contre la triche ?",
    category: "access-control",
    criticality: "high",
    mappedRequirements: ["OWASP-TOP10-2021-A04-INSECURE-DESIGN", "OWASP-ASVS-V11-BUSINESS-LOGIC"],
    suggestedAnswer: "Indiquer ce que le serveur vérifie avant d'accorder une étape, et les limites connues.",
    evidenceIds: ["evidence_route_progression"],
    confidence: "high",
    answerText: "Partiellement. La route de progression exige une session, valide ses entrées (zod), est idempotente (une étape ne rapporte qu'une fois) et plafonne l'XP. En revanche, la réussite est déclarée par le navigateur : le serveur ne reçoit pas le code et ne vérifie ni la réussite ni l'ordre des étapes, et la route n'a pas de limite de débit (EXE-01).",
    answerReservation: "Correctif planifié. Ne pas présenter le classement comme infalsifiable.",
    answerConfidence: "high",
    answerExportStatus: "reserved",
  },
  {
    id: "question_authentification",
    text: "Les mots de passe, les sessions et les jetons de vérification et de réinitialisation sont-ils gérés selon l'état de l'art ?",
    category: "access-control",
    criticality: "critical",
    mappedRequirements: ["OWASP-TOP10-2021-A07-AUTHENTICATION", "OWASP-ASVS-V2-AUTHENTICATION", "OWASP-ASVS-V3-SESSION"],
    suggestedAnswer: "Décrire le hachage, la gestion des jetons, les cookies et les limites connues.",
    evidenceIds: ["evidence_hachage_bcrypt", "evidence_jetons_hash", "evidence_cookies_session"],
    confidence: "high",
    answerText: "Oui pour l'essentiel. Mots de passe hachés avec bcrypt (coût 12) ; connexion refusée tant que l'e-mail n'est pas vérifié ; jetons de vérification et de réinitialisation de 32 octets aléatoires, stockés uniquement sous forme de hash SHA-256, à usage unique atomique, valables 24 h et 1 h ; réponses identiques sur « mot de passe oublié » ; cookies `__Host-` / `__Secure-`, HttpOnly, Secure, SameSite=Lax ; secret d'authentification obligatoire en production.",
    answerReservation: "Sessions JWT de 30 jours non révoquées après un changement de mot de passe (SRV-03) ; existence d'un compte détectable à l'inscription (SRV-05) ; pas de compteur d'échecs par compte (SRV-07).",
    answerConfidence: "high",
    answerExportStatus: "reserved",
  },
  {
    id: "question_controle_acces",
    text: "Chaque requête vérifie-t-elle que l'utilisateur n'accède qu'à ses propres données ?",
    category: "access-control",
    criticality: "critical",
    mappedRequirements: ["OWASP-TOP10-2021-A01-BROKEN-ACCESS-CONTROL", "OWASP-ASVS-V4-ACCESS-CONTROL"],
    suggestedAnswer: "Présenter la carte des routes et le contrôle appliqué à chacune.",
    evidenceIds: ["evidence_carte_routes"],
    confidence: "high",
    answerText: "Oui. Les 20 routes API ont été relues une à une. Toutes les routes `/api/me/*` et `/api/leaderboard` vérifient la session dans la route elle-même et n'agissent que sur l'identifiant de session, jamais sur un identifiant fourni par le client : pas d'IDOR possible. Pas de server action, pas de rôle administrateur exposé, pas d'affectation de masse (champs Prisma construits explicitement).",
    answerReservation: "La page d'un chapitre ne repose que sur le proxy (SRV-10) ; un contrôle dans la page est à ajouter.",
    answerConfidence: "high",
    answerExportStatus: "ready",
  },
  {
    id: "question_anti_abus",
    text: "Les points sensibles (connexion, inscription, envoi d'e-mails) sont-ils protégés contre la force brute et l'abus ?",
    category: "vulnerability-management",
    criticality: "high",
    mappedRequirements: ["OWASP-ASVS-V2.2-ANTI-AUTOMATION", "OWASP-TOP10-2021-A07-AUTHENTICATION"],
    suggestedAnswer: "Donner les limites appliquées et leur mode de stockage en production.",
    evidenceIds: ["evidence_limitation_debit"],
    confidence: "medium",
    answerText: "Des limites sont codées sur toutes les routes sensibles (connexion 10 / 5 min, inscription 5 / h, mot de passe oublié et renvoi d'e-mail 5 / 15 min, réinitialisation 10 / 15 min), avec une adresse IP lue de façon résistante à la falsification. Leur efficacité en production dépend de la présence d'Upstash Redis : sans lui, les compteurs vivent en mémoire, instance par instance, et sont contournables (SRV-01).",
    answerReservation: "Configuration Redis de production non vérifiée pendant l'audit (pas d'accès au projet Vercel).",
    answerConfidence: "medium",
    answerExportStatus: "reserved",
  },
  {
    id: "question_protections_web",
    text: "Le site applique-t-il les protections attendues côté transport et navigateur (HTTPS, en-têtes de sécurité, CSP) ?",
    category: "vulnerability-management",
    criticality: "high",
    mappedRequirements: ["OWASP-TOP10-2021-A05-MISCONFIGURATION", "OWASP-ASVS-V14-CONFIGURATION", "OWASP-ASVS-V9-COMMUNICATION"],
    suggestedAnswer: "Donner les résultats des scanners externes et les écarts relevés.",
    evidenceIds: ["evidence_entetes_config", "evidence_observatory", "evidence_ssllabs", "evidence_zap"],
    confidence: "high",
    answerText: "Oui. TLS 1.2 et 1.3 uniquement, notes SSL Labs A+ et A, certificat Let's Encrypt valide jusqu'au 2026-12-07, HSTS de 2 ans avec preload, redirection vers HTTPS. En-têtes : CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy. Mozilla Observatory : B+ (80/100, 11 tests réussis sur 12). OWASP ZAP (analyse passive) : aucun échec, 58 contrôles réussis, 9 avertissements mineurs.",
    answerReservation: "La CSP autorise 'unsafe-inline' et 'unsafe-eval' pour le bac à sable, ce qui affaiblit la défense contre les XSS (EXE-03) ; redirection ouverte sur /avatar?from= (SRV-06).",
    answerConfidence: "high",
    answerExportStatus: "ready",
  },
  {
    id: "question_dependances",
    text: "Les dépendances sont-elles à jour et exemptes de vulnérabilités connues exploitables ?",
    category: "vulnerability-management",
    criticality: "critical",
    mappedRequirements: ["OWASP-TOP10-2021-A06-VULNERABLE-COMPONENTS", "OWASP-ASVS-V14.2-DEPENDENCY"],
    suggestedAnswer: "Donner le résultat de pnpm audit et le plan de mise à jour.",
    evidenceIds: ["evidence_pnpm_audit"],
    confidence: "high",
    answerText: "Non à la date de l'audit. `pnpm audit --prod` remonte 97 avis (5 critiques, 34 hauts). Les plus importants concernent next 16.2.4 (contournements du proxy, SSRF, déni de service ; corrigés à partir de 16.2.11 et 16.3.3) et next-auth 5.0.0-beta.31 (2 avis critiques, corrigés en beta.32). Une partie des avis ne s'applique pas à l'hébergement Vercel (exécution de code sur serveur Windows) ou ne touche que des outils de build (Prisma CLI, plugin Sentry).",
    answerReservation: "Mise à jour de next et next-auth planifiée sous 7 jours.",
    answerConfidence: "high",
    answerExportStatus: "reserved",
  },
  {
    id: "question_donnees_secrets",
    text: "Les données personnelles et les secrets sont-ils protégés (exposition, stockage, RGPD) ?",
    category: "data-protection",
    criticality: "high",
    mappedRequirements: ["RGPD-ART-32", "OWASP-TOP10-2021-A02-CRYPTOGRAPHIC-FAILURES", "OWASP-ASVS-V8-DATA-PROTECTION"],
    suggestedAnswer: "Décrire la minimisation des réponses API, la gestion des secrets et les droits RGPD.",
    evidenceIds: ["evidence_secrets_git", "evidence_minimisation_donnees", "evidence_config_production"],
    confidence: "medium",
    answerText: "Aucun secret dans le dépôt ni dans l'historique git (.env ignoré, aucune variable NEXT_PUBLIC_). Les API ne renvoient ni e-mail, ni hash, ni jeton ; le classement n'expose que pseudo et scores. Export des données (RGPD) sans hash de mot de passe, suppression de compte disponible. Sentry sans données personnelles (ni sendDefaultPii ni replay). La base n'est interrogée que par Prisma, côté serveur.",
    answerReservation: "Aucune RLS n'est activée sur les tables Supabase : si l'API de données Supabase est active, la clé publique « anon » donnerait accès aux tables (SRV-04, à vérifier dans le tableau de bord Supabase).",
    answerConfidence: "medium",
    answerExportStatus: "reserved",
  },
  {
    id: "question_sauvegardes",
    text: "Les données sont-elles sauvegardées, et la restauration est-elle testée ?",
    category: "backup",
    criticality: "medium",
    mappedRequirements: ["RGPD-ART-32-1-C", "ISO27001-2022-A.8.13-BACKUP"],
    suggestedAnswer: "Décrire la sauvegarde, son chiffrement et la date du dernier test de restauration.",
    evidenceIds: ["evidence_sauvegarde"],
    confidence: "medium",
    answerText: "Une sauvegarde de la base est produite automatiquement par GitHub Actions et chiffrée en AES-256 avant de quitter le runner.",
    answerReservation: "Aucun test de restauration n'est documenté à ce jour.",
    answerConfidence: "medium",
    answerExportStatus: "reserved",
  },
  {
    id: "question_supervision",
    text: "Les erreurs et incidents sont-ils détectés et journalisés, et une faille peut-elle être signalée ?",
    category: "logging-monitoring",
    criticality: "medium",
    mappedRequirements: ["OWASP-TOP10-2021-A09-LOGGING-MONITORING", "OWASP-ASVS-V7-LOGGING"],
    suggestedAnswer: "Décrire les outils de supervision et le canal de signalement.",
    evidenceIds: ["evidence_sentry", "evidence_sonde_sante"],
    confidence: "medium",
    answerText: "Sentry côté serveur (erreurs de requêtes via onRequestError), journalisation structurée des événements de sécurité (par exemple le repli du limiteur de débit), sonde /api/health qui vérifie la base.",
    answerReservation: "Pas de fichier /.well-known/security.txt pour signaler une faille ; le jeton de vérification d'e-mail figure dans l'URL et peut être journalisé en cas d'erreur (SRV-11).",
    answerConfidence: "medium",
    answerExportStatus: "ready",
  },
];

const ev = (o) => ({
  sensitivity: "internal",
  status: "available",
  strength: "strong",
  recommendedFormat: "Extrait de code source",
  sourceSystem: "Dépôt Git (branche main)",
  owner: "Joan",
  coveredScope: "Application de production",
  ...o,
});

const evidence = [
  ev({ id: "evidence_sandbox_iframe", questionId: "question_isolation_code", templateId: "template_code_sandbox", title: "Bac à sable d'exécution JavaScript", category: "vulnerability-management",
    description: "Iframe sandbox=\"allow-scripts\" sans allow-same-origin (l.49), contrôle de event.source et event.origin (l.65-68), délai et destruction de l'iframe (l.53-82). Même isolation pour HTML/CSS (ChapterWorkspace.tsx:425) et React (ReactPreview.tsx:279).",
    linkedRequirements: ["OWASP-ASVS-V5-VALIDATION-SANITIZATION-SANDBOXING"], repoFile: "lib/sandbox/run-js.ts",
    controlResult: "Isolation conforme : origine opaque, aucun accès à la session" }),
  ev({ id: "evidence_pas_execution_serveur", questionId: "question_isolation_code", templateId: "template_api_input_schema", title: "Schéma d'entrée de la route de progression", category: "vulnerability-management",
    description: "La route ne reçoit que course, chapter et stepIndex (l.11-15) : aucun code apprenant n'arrive au serveur. Aucune occurrence d'eval, vm, child_process ou $queryRawUnsafe dans le dépôt.",
    linkedRequirements: ["OWASP-TOP10-2021-A03-INJECTION"], repoFile: "app/api/me/step/route.ts",
    controlResult: "Conforme : pas d'exécution côté serveur" }),
  ev({ id: "evidence_route_progression", questionId: "question_integrite_progression", templateId: "template_business_logic", title: "Attribution des étapes et de l'XP", category: "access-control",
    description: "completeStep ne vérifie que l'existence de l'étape (l.288-292) ; transaction idempotente (l.311-327) ; XP plafonnée (l.343-348).",
    strength: "medium", linkedRequirements: ["OWASP-ASVS-V11-BUSINESS-LOGIC"], repoFile: "lib/me-server.ts",
    controlResult: "Contrôle partiel : aucune preuve de réussite exigée" }),
  ev({ id: "evidence_hachage_bcrypt", questionId: "question_authentification", templateId: "template_password_hashing", title: "Hachage des mots de passe", category: "access-control",
    description: "bcrypt coût 12 à l'inscription (l.74) et à la réinitialisation (reset-password/route.ts:48) ; politique : 8 caractères, une lettre et un chiffre.",
    linkedRequirements: ["OWASP-ASVS-V2.4-CREDENTIAL-STORAGE"], repoFile: "app/api/signup/route.ts",
    controlResult: "Conforme" }),
  ev({ id: "evidence_jetons_hash", questionId: "question_authentification", templateId: "template_reset_tokens", title: "Jetons de vérification et de réinitialisation", category: "access-control",
    description: "32 octets de crypto.randomBytes (l.9-11), seul le hash SHA-256 est stocké (l.20-22) ; usage unique atomique et expiration dans lib/tokens.ts (l.8-11, 86-92).",
    linkedRequirements: ["OWASP-ASVS-V2.5-CREDENTIAL-RECOVERY"], repoFile: "lib/token-crypto.ts",
    controlResult: "Conforme" }),
  ev({ id: "evidence_cookies_session", questionId: "question_authentification", templateId: "template_session_cookies", title: "Cookies de session relevés en production", category: "access-control",
    description: "Relevé curl des en-têtes : cookies __Host-authjs.csrf-token et __Secure-authjs.callback-url en HttpOnly, Secure, SameSite=Lax (valeurs masquées).",
    recommendedFormat: "Relevé d'en-têtes HTTP", sourceSystem: "curl sur la production", sensitivity: "public", annexFile: "en-tetes-http.txt",
    linkedRequirements: ["OWASP-ASVS-V3.4-COOKIE-SESSION"], controlResult: "Conforme" }),
  ev({ id: "evidence_carte_routes", questionId: "question_controle_acces", templateId: "template_access_matrix", title: "Carte des routes et contrôles d'accès", category: "access-control",
    description: "Tableau des 20 routes API : méthode, authentification, contrôle de propriété, validation.",
    recommendedFormat: "Matrice des accès", sourceSystem: "Relecture du code", annexFile: "carte-des-routes.md",
    linkedRequirements: ["OWASP-ASVS-V4-ACCESS-CONTROL"], controlResult: "Conforme : aucune IDOR relevée" }),
  ev({ id: "evidence_limitation_debit", questionId: "question_anti_abus", templateId: "template_rate_limiting", title: "Limiteur de débit", category: "vulnerability-management",
    description: "Upstash Redis si configuré (l.72-85), sinon compteurs en mémoire ; repli en mémoire si Redis échoue (l.106-123) ; IP lue par la droite de X-Forwarded-For (l.125-156).",
    status: "declared", strength: "medium", linkedRequirements: ["OWASP-ASVS-V2.2-ANTI-AUTOMATION"], repoFile: "lib/rate-limit.ts",
    controlResult: "Implémenté ; backend Redis de production non confirmé" }),
  ev({ id: "evidence_entetes_config", questionId: "question_protections_web", templateId: "template_security_headers", title: "Configuration des en-têtes de sécurité", category: "vulnerability-management",
    description: "En-têtes nosniff, DENY, Referrer-Policy, Permissions-Policy, HSTS preload et CSP de production (l.7-21) ; poweredByHeader désactivé (l.31). Politique CSP dans lib/security/csp.ts, surveillée par un test unitaire.",
    linkedRequirements: ["OWASP-ASVS-V14.4-HTTP-HEADERS"], repoFile: "next.config.ts",
    controlResult: "Conforme, CSP permissive (unsafe-inline, unsafe-eval)" }),
  ev({ id: "evidence_observatory", questionId: "question_protections_web", templateId: "template_external_scan", title: "Mozilla Observatory", category: "vulnerability-management",
    description: "Note B+ (80/100). Tests non réussis : CSP avec unsafe-inline, SRI non implémenté (scripts servis depuis la même origine), CORP absent.",
    recommendedFormat: "Rapport JSON de l'outil", sourceSystem: "observatory-api.mdn.mozilla.net", sensitivity: "public", annexFile: "observatory.json",
    linkedRequirements: ["OWASP-ASVS-V14.4-HTTP-HEADERS"], controlResult: "B+ (80/100)" }),
  ev({ id: "evidence_ssllabs", questionId: "question_protections_web", templateId: "template_tls_scan", title: "Qualys SSL Labs", category: "vulnerability-management",
    description: "Deux adresses Vercel : A+ et A (HSTS absent sur la réponse de la seconde). TLS 1.2 et 1.3 seulement. Certificat Let's Encrypt valide jusqu'au 2026-12-07. Scan non publié.",
    recommendedFormat: "Rapport JSON de l'outil", sourceSystem: "api.ssllabs.com", sensitivity: "public", annexFile: "ssllabs.json",
    linkedRequirements: ["OWASP-ASVS-V9-COMMUNICATION"], controlResult: "A+ / A" }),
  ev({ id: "evidence_zap", questionId: "question_protections_web", templateId: "template_dast_passive", title: "OWASP ZAP (analyse passive)", category: "vulnerability-management",
    description: "zap-baseline.py sur la production, exploration de 3 minutes, sans attaque active : 0 échec, 58 contrôles réussis, 9 avertissements.",
    recommendedFormat: "Rapport HTML de l'outil", sourceSystem: "ghcr.io/zaproxy/zaproxy:stable", sensitivity: "public", annexFile: "zap-baseline.html",
    linkedRequirements: ["OWASP-TOP10-2021-A05-MISCONFIGURATION"], controlResult: "0 échec / 9 avertissements" }),
  ev({ id: "evidence_pnpm_audit", questionId: "question_dependances", templateId: "template_dependency_scan", title: "Audit des dépendances (pnpm audit --prod)", category: "vulnerability-management",
    description: "97 avis : 5 critiques, 34 hauts, 50 moyens, 8 faibles, regroupés par paquet avec la version corrigée.",
    recommendedFormat: "Sortie d'outil résumée", sourceSystem: "pnpm audit", annexFile: "pnpm-audit.md",
    linkedRequirements: ["OWASP-TOP10-2021-A06-VULNERABLE-COMPONENTS"], controlResult: "Non conforme : mises à jour requises" }),
  ev({ id: "evidence_secrets_git", questionId: "question_donnees_secrets", templateId: "template_secret_management", title: "Exclusion des secrets du dépôt", category: "data-protection",
    description: ".env* ignorés sauf .env.example (l.50-51) ; git log --all -- .env vide ; aucune variable NEXT_PUBLIC_ dans le code.",
    linkedRequirements: ["OWASP-ASVS-V6.4-SECRET-MANAGEMENT"], repoFile: ".gitignore",
    controlResult: "Conforme" }),
  ev({ id: "evidence_minimisation_donnees", questionId: "question_donnees_secrets", templateId: "template_data_minimisation", title: "Minimisation des données exposées", category: "data-protection",
    description: "Le classement ne renvoie que pseudo, XP, série et nombre de badges, aux seuls comptes vérifiés (l.23-36). getUserState et l'export RGPD n'incluent ni e-mail d'autrui, ni hash, ni jeton (lib/me-server.ts:161-190, 796-830).",
    linkedRequirements: ["RGPD-ART-5-1-C", "OWASP-ASVS-V8.3-SENSITIVE-DATA"], repoFile: "app/api/leaderboard/route.ts",
    controlResult: "Conforme" }),
  ev({ id: "evidence_config_production", questionId: "question_donnees_secrets", templateId: "template_prod_config_guard", title: "Garde-fous de configuration de production", category: "data-protection",
    description: "AUTH_SECRET obligatoire et valeur d'exemple refusée, APP_URL en https, contournement de test interdit en production (l.35-114). Upstash n'y est pas obligatoire (voir SRV-01).",
    linkedRequirements: ["OWASP-ASVS-V14.1-BUILD-DEPLOY"], repoFile: "lib/env.ts",
    controlResult: "Conforme, à compléter pour Upstash" }),
  ev({ id: "evidence_sauvegarde", questionId: "question_sauvegardes", templateId: "template_backup_job", title: "Sauvegarde automatique chiffrée", category: "backup",
    description: "Workflow GitHub Actions quotidien (cron 03:00, l.27-30) : pg_dump de la base puis chiffrement gpg --symmetric --cipher-algo AES256 avant dépôt en artefact (l.151-160).",
    strength: "medium", recommendedFormat: "Définition du workflow + note de test de restauration", sourceSystem: "GitHub Actions", repoFile: ".github/workflows/backup.yml",
    linkedRequirements: ["ISO27001-2022-A.8.13-BACKUP"], controlResult: "Sauvegarde en place ; restauration non testée" }),
  ev({ id: "evidence_sentry", questionId: "question_supervision", templateId: "template_error_monitoring", title: "Supervision des erreurs (Sentry)", category: "logging-monitoring",
    description: "Sentry initialisé côté serveur si SENTRY_DSN est défini (l.20-26), capture des erreurs de requête (onRequestError), sans données personnelles.",
    strength: "medium", linkedRequirements: ["OWASP-ASVS-V7-LOGGING"], repoFile: "instrumentation.ts",
    controlResult: "En place" }),
  ev({ id: "evidence_sonde_sante", questionId: "question_supervision", templateId: "template_health_check", title: "Sonde de disponibilité", category: "logging-monitoring",
    description: "GET /api/health exécute SELECT 1 et renvoie {status, db} ; relevé en production : {\"status\":\"ok\",\"db\":\"up\"}.",
    strength: "medium", linkedRequirements: ["OWASP-ASVS-V7-LOGGING"], repoFile: "app/api/health/route.ts",
    controlResult: "En place" }),
];

const debts = [
  { id: "debt_dependances_next_auth", kind: "missing", questionId: "question_dependances", evidenceId: "evidence_pnpm_audit", severity: "high", findingIds: ["DEP-01"],
    reason: "next 16.2.4 et next-auth 5.0.0-beta.31 portent des avis critiques et hauts (contournement du proxy, SSRF, déni de service, contrôle d'authentification qui échoue en mode ouvert).",
    recommendedAction: "Mettre à jour next vers 16.3.5 (ou au minimum 16.2.12), next-auth vers 5.0.0-beta.32 et @auth/prisma-adapter vers 2.11.3 ; relancer tests unitaires, e2e et pnpm audit.",
    deliverable: "annexes/pnpm-audit-apres-correctif.md", dueDate: "2026-09-19" },
  { id: "debt_limitation_debit_prod", kind: "declared", questionId: "question_anti_abus", evidenceId: "evidence_limitation_debit", severity: "medium", findingIds: ["SRV-01", "SRV-11"],
    reason: "Sans Upstash en production, les limites sont par instance serverless et contournables ; en cas de panne Redis le limiteur bascule en mémoire.",
    recommendedAction: "Vérifier les variables UPSTASH_REDIS_REST_* dans Vercel ; les rendre obligatoires en production dans lib/env.ts ; refuser (fail-closed) connexion, réinitialisation et e-mails si Redis est indisponible ; rendre l'incrément atomique (SET NX PX).",
    deliverable: "Capture des variables Vercel (noms seulement) + commit", dueDate: "2026-09-26" },
  { id: "debt_rls_supabase", kind: "missing", questionId: "question_donnees_secrets", evidenceId: "evidence_secrets_git", severity: "medium", findingIds: ["SRV-04"],
    reason: "Aucune table n'a la RLS activée : si l'API de données Supabase est exposée, la clé anon permet de lire les tables User et OneTimeToken.",
    recommendedAction: "Consulter le Security Advisor de Supabase ; ajouter une migration ALTER TABLE … ENABLE ROW LEVEL SECURITY sur toutes les tables (sans politique, Prisma n'est pas bloqué) ou désactiver l'API de données.",
    deliverable: "Capture du Security Advisor sans alerte + migration", dueDate: "2026-09-26" },
  { id: "debt_integrite_progression", kind: "missing", questionId: "question_integrite_progression", evidenceId: "evidence_route_progression", severity: "medium", findingIds: ["EXE-01"],
    reason: "Le serveur accorde étapes, XP, badges et place au classement sur simple déclaration du navigateur, sans limite de débit.",
    recommendedAction: "Limite de débit par utilisateur sur /api/me/step (ex. 60/min) ; exiger que l'étape précédente soit validée ; à terme, envoyer le code et rejouer côté serveur les validateurs statiques.",
    deliverable: "Commit + test e2e « triche refusée »", dueDate: "2026-10-03" },
  { id: "debt_revocation_sessions", kind: "missing", questionId: "question_authentification", evidenceId: "evidence_cookies_session", severity: "medium", findingIds: ["SRV-03"],
    reason: "Les sessions JWT durent 30 jours et restent valides après une réinitialisation de mot de passe.",
    recommendedAction: "Ajouter sessionVersion (ou passwordChangedAt) en base, l'inclure dans le jeton et le revérifier dans le callback jwt ; réduire maxAge à 7 jours.",
    deliverable: "Commit + test unitaire", dueDate: "2026-10-03" },
  { id: "debt_test_restauration", kind: "declared", questionId: "question_sauvegardes", evidenceId: "evidence_sauvegarde", severity: "medium", findingIds: ["BCK-01"],
    reason: "La sauvegarde existe mais aucune restauration n'a été testée ni documentée.",
    recommendedAction: "Restaurer la dernière sauvegarde dans un PostgreSQL local (docker) et consigner date, durée, volume et résultat.",
    deliverable: "note-test-restauration.md", dueDate: "2026-10-03" },
  { id: "debt_csp_stricte", kind: "missing", questionId: "question_protections_web", evidenceId: "evidence_entetes_config", severity: "medium", findingIds: ["EXE-03"],
    reason: "La CSP autorise 'unsafe-inline' et 'unsafe-eval' dans toute l'application pour faire fonctionner le bac à sable.",
    recommendedAction: "Servir le bac à sable depuis un sous-domaine dédié avec sa propre CSP (ticket CF-15), puis passer l'application à une CSP à nonce sans unsafe-eval.",
    deliverable: "Note Observatory A ou mieux", dueDate: "2026-10-31" },
  { id: "debt_redirection_ouverte", kind: "missing", questionId: "question_protections_web", evidenceId: "evidence_entetes_config", severity: "low", findingIds: ["SRV-06"],
    reason: "/avatar?from= redirige vers n'importe quelle URL après l'enregistrement.",
    recommendedAction: "Réutiliser le filtre de la page de connexion (chemin commençant par « / » et pas par « // »).",
    deliverable: "Commit + test unitaire", dueDate: "2026-09-26" },
  { id: "debt_garde_chapitre", kind: "missing", questionId: "question_controle_acces", evidenceId: "evidence_carte_routes", severity: "low", findingIds: ["SRV-10"],
    reason: "La page d'un chapitre n'appelle pas auth() et dépend du seul proxy, visé par plusieurs avis de contournement sur next 16.2.4.",
    recommendedAction: "Ajouter auth() puis redirect dans app/learn/[course]/[chapter]/page.tsx pour les chapitres hors essai.",
    deliverable: "Commit", dueDate: "2026-09-26" },
  { id: "debt_indices_html", kind: "missing", questionId: "question_isolation_code", evidenceId: "evidence_sandbox_iframe", severity: "low", findingIds: ["EXE-04", "EXE-06"],
    reason: "Les indices sont injectés en HTML brut (dangerouslySetInnerHTML) ; escapeHtml n'échappe pas les guillemets.",
    recommendedAction: "Rendre step.hint en texte ou via renderLessonMarkdown ; compléter escapeHtml.",
    deliverable: "Commit", dueDate: "2026-09-26" },
  { id: "debt_enumeration_comptes", kind: "missing", questionId: "question_authentification", evidenceId: "evidence_hachage_bcrypt", severity: "low", findingIds: ["SRV-05", "SRV-07"],
    reason: "L'inscription révèle qu'une adresse est déjà utilisée, les temps de réponse diffèrent, et aucun compteur d'échecs n'existe par compte.",
    recommendedAction: "Message neutre à l'inscription, comparaison bcrypt factice dans authorize, envoi des e-mails via after(), compteur d'échecs par e-mail.",
    deliverable: "Commit", dueDate: "2026-10-31" },
  { id: "debt_boucles_infinies", kind: "missing", questionId: "question_isolation_code", evidenceId: "evidence_sandbox_iframe", severity: "low", findingIds: ["EXE-02"],
    reason: "Une boucle infinie en JS, SQL ou HTML fige l'onglet : le délai de 3 s tourne dans le même thread.",
    recommendedAction: "Exécuter JS et SQL dans un Web Worker terminé à l'expiration du délai ; appliquer detecterBoucleInfinie au cursus JS.",
    deliverable: "Commit + test e2e", dueDate: "2026-10-31" },
  { id: "debt_csrf_suppression", kind: "missing", questionId: "question_protections_web", evidenceId: "evidence_entetes_config", severity: "low", findingIds: ["SRV-09"],
    reason: "Les routes POST et DELETE ne vérifient pas l'en-tête Origin ; la suppression de compte ne redemande pas le mot de passe.",
    recommendedAction: "Contrôle Origin commun à /api/me/* ; demander le mot de passe avant DELETE /api/me.",
    deliverable: "Commit", dueDate: "2026-10-31" },
  { id: "debt_signalement_failles", kind: "missing", questionId: "question_supervision", evidenceId: "evidence_sentry", severity: "low", findingIds: ["SUP-01", "SRV-11"],
    reason: "Pas de canal de signalement de faille ; le jeton de vérification est dans l'URL (journalisé en cas d'erreur, consommé par un simple GET).",
    recommendedAction: "Publier /.well-known/security.txt ; consommer le jeton de vérification sur un POST de confirmation.",
    deliverable: "public/.well-known/security.txt", dueDate: "2026-10-31" },
];

// Constats detailles (rapport).
const findings = [
  ["DEP-01", "Haute", "Dépendances vulnérables : next 16.2.4, next-auth 5.0.0-beta.31", "package.json:27-28", "Avis publics de contournement du proxy et d'auth en mode ouvert, exploitables sans compte selon la configuration.", "Mettre à jour next (16.3.5) et next-auth (beta.32)."],
  ["EXE-01", "Moyenne", "Réussite d'étape accordée sans preuve côté serveur", "lib/me-server.ts:282-292", "Un compte boucle sur POST /api/me/step et prend la tête du classement avec tous les badges.", "Limite de débit, ordre des étapes, validation serveur des cas statiques."],
  ["SRV-01", "Moyenne (à confirmer)", "Limitation de débit en mémoire si Upstash absent ou en panne", "lib/rate-limit.ts:106-123", "Attaque répartie sur plusieurs instances serverless : force brute sur la connexion, envoi massif d'e-mails.", "Upstash obligatoire en production, fail-closed sur les routes sensibles."],
  ["SRV-03", "Moyenne", "Sessions JWT de 30 jours non révoquées", "auth.config.ts:6", "Une session volée reste valide après la réinitialisation du mot de passe.", "sessionVersion dans le jeton, maxAge réduit."],
  ["SRV-04", "Moyenne (à confirmer)", "Aucune RLS sur les tables Supabase", "prisma/migrations", "Si l'API de données est active, la clé anon lit User et OneTimeToken.", "ENABLE ROW LEVEL SECURITY ou API de données désactivée."],
  ["EXE-03", "Moyenne", "CSP avec 'unsafe-inline' et 'unsafe-eval'", "lib/security/csp.ts:50", "Une future faille XSS ne serait pas bloquée par la CSP.", "Bac à sable sur un sous-domaine, CSP à nonce."],
  ["BCK-01", "Moyenne", "Restauration des sauvegardes jamais testée", ".github/workflows/backup.yml", "Une sauvegarde inutilisable n'est découverte qu'au moment de l'incident.", "Test de restauration documenté."],
  ["EXE-02", "Faible", "Boucle infinie : onglet figé, délai inopérant", "lib/sandbox/run-js.ts:74-82", "while(true){} ou CTE SQL récursive figent l'onglet de l'apprenant.", "Web Worker + terminate()."],
  ["EXE-04", "Faible", "Indices injectés via dangerouslySetInnerHTML", "components/ui/HintBox.tsx:17-20", "Contenu rédigé par l'équipe aujourd'hui ; XSS stockée si les cours passent un jour en base.", "Rendu texte ou markdown échappé."],
  ["SRV-05", "Faible", "Énumération des comptes", "app/api/signup/route.ts:59-69", "Tester si une adresse est inscrite avant un hameçonnage ciblé.", "Message neutre, temps de réponse égalisé."],
  ["SRV-06", "Faible", "Redirection ouverte sur /avatar?from=", "app/avatar/page.tsx:41", "Lien piégé qui renvoie vers un site tiers après l'enregistrement de l'avatar.", "Filtre de chemin relatif."],
  ["SRV-07", "Faible", "Pas de compteur d'échecs par compte", "auth.ts:47", "Force brute distribuée sur un compte précis.", "Compteur par e-mail, contrôle HIBP."],
  ["SRV-09", "Faible", "Pas de contrôle Origin ; suppression de compte sans réauthentification", "app/api/me/route.ts:25-33", "Protection CSRF reposant sur SameSite=Lax uniquement.", "Contrôle Origin, mot de passe avant suppression."],
  ["SRV-10", "Faible", "Page chapitre protégée par le seul proxy", "app/learn/[course]/[chapter]/page.tsx:12", "Contournement du proxy (avis next 16.2.4) : contenu servi sans session.", "auth() dans la page."],
  ["SUP-01", "Faible", "Pas de security.txt", "public/.well-known/", "Un chercheur ne sait pas où signaler une faille.", "Publier security.txt."],
  ["EXE-05", "Info", "postMessage vers l'iframe React avec la cible \"*\"", "components/lesson/ReactPreview.tsx:97", "Sans impact : seul le code de l'apprenant transite.", "Vérifier event.origin === \"null\"."],
  ["EXE-06", "Info", "escapeHtml n'échappe pas les guillemets", "lib/markdown.ts:3-8", "Sans impact aujourd'hui (attribut contraint par regex).", "Échapper \" et '."],
  ["SRV-11", "Info", "Points divers", "voir rapport", "Incrément Redis non atomique ; next-auth en bêta ; jeton de vérification consommé par GET ; message d'erreur Resend renvoyé brut ; e-mail réel dans scripts/reset-password.ts (dépôt privé).", "Corriger au fil de l'eau."],
];

const tools = [
  ["Mozilla Observatory", "Note B+ (80/100), 11 tests sur 12", "annexes/observatory.json"],
  ["Qualys SSL Labs", "A+ / A, TLS 1.2 et 1.3, certificat valide jusqu'au 2026-12-07", "annexes/ssllabs.json"],
  ["OWASP ZAP (baseline passive)", "0 échec, 58 réussis, 9 avertissements", "annexes/zap-baseline.html"],
  ["Lighthouse (accueil)", "Performance 83, accessibilité 94, bonnes pratiques 100, SEO 100", "annexes/lighthouse.html"],
  ["pnpm audit --prod", "97 avis : 5 critiques, 34 hauts, 50 moyens, 8 faibles", "annexes/pnpm-audit.md"],
  ["Relevé curl des en-têtes", "CSP, HSTS preload, DENY, nosniff, cookies __Host-", "annexes/en-tetes-http.txt"],
  ["Relecture du code (2 passes)", "Exécution du code apprenant ; serveur, authentification, accès, données", "annexes/carte-des-routes.md"],
];

const routeMapMd = `# Carte des routes API - La Forge du Code (2026-09-12)

Relevé en lecture seule du code de la branche main. \`proxy.ts\` exclut \`/api\` : chaque route fait son propre contrôle.

| Route | Méthode | Auth requise | Contrôle propriétaire / rôle | Validation |
|---|---|---|---|---|
| /api/auth/[...nextauth] | GET, POST | (next-auth) | - | zod dans authorize |
| /api/signup | POST | non | - | zod + 5/h/IP |
| /api/auth/forgot-password | POST | non | - | zod + 5/15 min/IP |
| /api/auth/reset-password | POST | jeton | le jeton désigne le compte | zod + 10/15 min/IP |
| /api/auth/resend-verification | POST | non | - | zod + 5/15 min/IP |
| /api/auth/check-verification | POST | non | - | zod + compteur partagé avec la connexion |
| /api/health | GET | non | - | aucune (SELECT 1) |
| /api/track | POST | non | - | liste blanche + 30/min/IP |
| /api/share/[badge] | GET | non | - | badge du catalogue, pseudo nettoyé |
| /api/leaderboard | GET | oui | lecture globale, pseudos seulement | - |
| /api/me | GET, DELETE | oui | id de session | - |
| /api/me/avatar | POST | oui | id de session + possession | zod + listes fixes |
| /api/me/cosmetics | POST | oui | id de session + possession | zod + catalogue |
| /api/me/step | POST | oui | id de session | zod + étape existante, **aucune preuve de réussite** |
| /api/me/trial-import | POST | oui | id de session | chapitres d'essai + 10/15 min/utilisateur |
| /api/me/username | PATCH | oui | id de session | zod + regex |
| /api/me/cinematic | GET, POST | oui | id de session | regex |
| /api/me/visit | POST | oui | id de session | longueur |
| /api/me/onboarded, /api/me/reset | POST | oui | id de session | pas de corps |
| /api/me/export | GET | oui | id de session | - |
`;

const esc = (s) => String(s).replaceAll("|", "\\|");

const reportMd = (pack) => {
  const qs = pack.questions.map((q, i) => {
    const evs = pack.evidence.filter((e) => q.evidenceIds.includes(e.id));
    return `## Q${i + 1} - ${q.text}

**Criticité** : ${q.criticality} · **Statut d'export** : ${q.answerExportStatus} · **Exigences** : ${q.mappedRequirements.join(", ")}

${q.answerText}

${q.answerReservation ? `> Réserve : ${q.answerReservation}\n` : ""}
Preuves :
${evs.map((e) => `- **${e.title}** (${e.status}, ${e.strength}) - \`${e.referenceId}\` - ${e.controlResult}`).join("\n")}
`;
  }).join("\n");

  return `# Rapport d'audit de sécurité - La Forge du Code

Site audité : ${SITE} (Vercel, région cdg1) · Date : 2026-09-12 · Commit audité : 48b1627

## Périmètre et méthode

- **Contrôles externes, passifs** : en-têtes HTTP, TLS, analyse passive OWASP ZAP (exploration de 3 minutes, sans attaque), Lighthouse, fichiers sensibles exposés (.env, .git, cartes de sources : tous refusés).
- **Relecture du code en lecture seule**, en deux passes : exécution du code des apprenants ; serveur, authentification, contrôle d'accès, données et secrets.
- **Dépendances** : \`pnpm audit --prod\`.
- **Hors périmètre** : test d'intrusion actif, attaque par force brute réelle, configuration des consoles Vercel et Supabase (non accessibles pendant l'audit).

Ce rapport est une auto-évaluation outillée : ce n'est ni une certification ni un audit officiel.

## Résultats des outils

| Outil | Résultat | Annexe |
|---|---|---|
${tools.map((t) => `| ${t.map(esc).join(" | ")} |`).join("\n")}

## Réponses au questionnaire

${qs}
## Constats détaillés

| ID | Gravité | Constat | Emplacement | Scénario | Correctif |
|---|---|---|---|---|---|
${findings.map((f) => `| ${f.map(esc).join(" | ")} |`).join("\n")}

Échéances et livrables : voir \`plan-remediation-la-forge-du-code.csv\`.

## Avertissements mineurs des outils (sans action immédiate)

- ZAP : directives de cache à revoir sur /login et /signup, contenu statique mis en cache (normal pour \`/_next/static\`), \`Access-Control-Allow-Origin: *\` sur les fichiers statiques (réglage par défaut de Vercel, sans donnée sensible), COEP et CORP absents, SRI absent (scripts servis par le même domaine).
- SSL Labs : l'une des deux adresses Vercel ne renvoyait pas HSTS au moment du scan.
- Lighthouse : 3 textes au contraste insuffisant (\`text-nebula-text-secondary\`, pied de page en 10 px) et un titre \`h3\` qui saute un niveau.

## Empreinte

Dossier BLACKPROOF : \`${pack.fingerprint}\`, vérifiable sur https://blackproof.fr/verify.
`;
};

const summaryMd = (pack) => {
  const s = pack.summary;
  return `# Note de synthèse - Audit de sécurité La Forge du Code

## Décision

Le site est **défendable avec réserves**. Les fondations sont solides : code des apprenants isolé dans le navigateur, aucune IDOR, mots de passe et jetons gérés selon l'état de l'art, en-têtes et TLS au bon niveau. **Une action est urgente** : mettre à jour next et next-auth, qui portent des vulnérabilités publiques critiques et hautes.

## Résultats

- Questions analysées : ${s.questionCount}
- Preuves référencées : ${s.evidenceCount} (empreinte SHA-256 de chaque fichier)
- Corrections à mener : ${s.proofDebtCount} (${s.highDebtCount} haute, ${pack.debts.filter((d) => d.severity === "medium").length} moyennes, ${pack.debts.filter((d) => d.severity === "low").length} faibles)
- Complétude des réponses : ${s.responseCompletenessScore}
- Couverture des preuves : ${s.evidenceCoverageScore}
- Qualité des preuves : ${s.evidenceQualityFreshnessScore}
- Réponses prêtes sans réserve : ${s.exportReadinessScore}
- Indicateur de dette : ${s.proofDebtScore} (100 moins 12 par dette haute, 5 par moyenne, 2 par faible)

## Points défendables

- Exécution du code des apprenants isolée (iframes sandbox sans allow-same-origin), rien n'est exécuté sur le serveur.
- 20 routes API relues : chaque route vérifie la session et n'agit que sur le compte connecté.
- bcrypt coût 12, jetons aléatoires stockés hachés et à usage unique, e-mail vérifié obligatoire.
- SSL Labs A+ / A, Observatory B+, ZAP sans échec, aucun secret dans l'historique git.

## Points à corriger en priorité

1. Mettre à jour next et next-auth (sous 7 jours).
2. Confirmer Upstash Redis en production et passer le limiteur en fail-closed.
3. Vérifier la RLS et l'API de données dans Supabase.
4. Empêcher la triche sur la progression (limite de débit, ordre des étapes).

## Vérification

Le fichier \`proofpack-la-forge-du-code.json\` embarque son empreinte (\`${pack.fingerprint}\`). Il se vérifie sur https://blackproof.fr/verify, sans compte ni envoi au serveur. Les scores ci-dessus sont calculés par le script de génération de ce dossier et peuvent différer de la méthode interne de BLACKPROOF.
`;
};

export const data = {
  slug: "la-forge-du-code",
  date: "2026-09-12",
  // Commit de main audite : les empreintes des preuves de code sont calculees dessus.
  commit: "48b1627",
  caseInfo: {
    title: "La Forge du Code - Audit de sécurité du site",
    companyName: "La Forge du Code",
    clientName: "Jury du projet fil rouge",
    framework: "OWASP Top 10 2021 / ASVS 4.0 / RGPD art. 32",
  },
  questions,
  evidence,
  debts,
  routeMapMd,
  reportMd,
  summaryMd,
};
