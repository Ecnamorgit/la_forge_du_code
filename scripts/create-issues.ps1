<#
  Crée les milestones (M1 à M3), les labels et les 19 issues de la roadmap sur
  le dépôt GitHub, via l'API REST (sans dépendance à `gh`).

  Prérequis : un token GitHub classic avec le scope `repo`, ou fine-grained
  avec la permission « Issues: Read and write », défini dans la session :
    $env:GH_TOKEN = "ghp_xxx..."

  Utilisation :
    pwsh ./scripts/create-issues.ps1
    powershell -File scripts\create-issues.ps1

  Relançable sans dupliquer milestones et labels, mais les issues sont
  recréées à chaque exécution.
#>

$ErrorActionPreference = "Stop"

# Dépôt cible
$Owner = "Ecnamorgit"
$Repo  = "la_forge_du_code"

$token = $env:GH_TOKEN
if (-not $token) { $token = $env:GITHUB_TOKEN }
if (-not $token) {
  Write-Error "Aucun token. Définis `$env:GH_TOKEN = 'ghp_...'` puis relance."
  exit 1
}

$Headers = @{
  Authorization          = "Bearer $token"
  Accept                 = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}
$ApiBase = "https://api.github.com/repos/$Owner/$Repo"

function Invoke-GH {
  param([string]$Method, [string]$Url, [object]$Body)
  $json = if ($Body) { $Body | ConvertTo-Json -Depth 6 } else { $null }
  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -Body $json -ContentType "application/json"
}

# Milestones
$milestoneDefs = @(
  @{ title = "M1 - Blockers prod";        desc = "Deployable sans faille critique" },
  @{ title = "M2 - Fiabilite";            desc = "Tient en charge, observable" },
  @{ title = "M3 - Polish & conformite";  desc = "Qualite finale, RGPD, perf" }
)

$existingMilestones = Invoke-GH GET "$ApiBase/milestones?state=all&per_page=100"
$milestoneNumbers = @{}
foreach ($m in $milestoneDefs) {
  $found = $existingMilestones | Where-Object { $_.title -eq $m.title } | Select-Object -First 1
  if ($found) {
    $milestoneNumbers[$m.title] = $found.number
    Write-Output "Milestone existe deja: $($m.title) (#$($found.number))"
  } else {
    $created = Invoke-GH POST "$ApiBase/milestones" @{ title = $m.title; description = $m.desc }
    $milestoneNumbers[$m.title] = $created.number
    Write-Output "Milestone cree: $($m.title) (#$($created.number))"
  }
}

# Labels
$labelDefs = @(
  @{ name = "P0"; color = "b60205"; description = "Bloquant production" },
  @{ name = "P1"; color = "d93f0b"; description = "Fiabilite" },
  @{ name = "P2"; color = "fbca04"; description = "Polish" },
  @{ name = "securite";      color = "5319e7"; description = "Securite" },
  @{ name = "ci-build";      color = "0e8a16"; description = "CI / Build" },
  @{ name = "robustesse";    color = "1d76db"; description = "Robustesse" },
  @{ name = "deploiement";   color = "0052cc"; description = "Deploiement" },
  @{ name = "observabilite"; color = "006b75"; description = "Observabilite" },
  @{ name = "tests";         color = "c2e0c6"; description = "Tests" },
  @{ name = "conformite";    color = "bfdadc"; description = "Conformite / RGPD" },
  @{ name = "perf";          color = "fef2c0"; description = "Performance" },
  @{ name = "exploitation";  color = "d4c5f9"; description = "Exploitation" },
  @{ name = "ux";            color = "f9d0c4"; description = "UX" }
)
foreach ($l in $labelDefs) {
  try {
    Invoke-GH POST "$ApiBase/labels" @{ name = $l.name; color = $l.color; description = $l.description } | Out-Null
    Write-Output "Label cree: $($l.name)"
  } catch {
    Write-Output "Label existe deja (ou ignore): $($l.name)"
  }
}

# Issues
$issues = @(
  @{ m="M1 - Blockers prod"; labels=@("P0","securite"); title="CF-1 - Hasher les tokens a usage unique en base"; body=@"
**P0 - Securite - Effort M**

`OneTimeToken.token` est stocke en clair (``lib/tokens.ts``). Un acces DB exposerait des liens de reset actifs.

### Taches
- Stocker ``sha256(token)`` ; n'envoyer le token brut que dans l'email.
- ``consumeToken`` recherche par hash du token recu.
- Migration Prisma (purge ou rehash des tokens existants).

### Acceptation
- [ ] Aucun token brut en base
- [ ] Verif email + reset password OK de bout en bout
- [ ] Test unitaire ``createToken``/``consumeToken`` (hash + single-use + expiry)
"@ },
  @{ m="M1 - Blockers prod"; labels=@("P0","securite"); title="CF-2 - Rate-limiter la route reset-password"; body=@"
**P0 - Securite - Effort S**

``app/api/auth/reset-password/route.ts`` n'a aucun throttle ; seule l'entropie du token protege.

### Taches
- Ajouter ``rateLimit('reset:`${ip}', { limit: 10, windowMs: 15min })`` + ``tooManyRequests``.

### Acceptation
- [ ] 11e tentative en 15 min -> ``429``
- [ ] Coherent avec les autres routes auth
"@ },
  @{ m="M1 - Blockers prod"; labels=@("P0","robustesse"); title="CF-3 - Valider les variables d'environnement au demarrage"; body=@"
**P0 - Robustesse - Effort M**

``DATABASE_URL``, ``AUTH_SECRET``, ``RESEND_API_KEY``, ``APP_URL`` sont lues a la volee ; une absence casse au runtime, pas au boot.

### Taches
- ``lib/env.ts`` avec schema Zod importe tot ; echec explicite en prod.
- Refuser le secret par defaut du ``.env.example``.

### Acceptation
- [ ] Demarrage prod sans ``AUTH_SECRET`` -> erreur claire immediate
- [ ] ``APP_URL`` valide https en prod
"@ },
  @{ m="M1 - Blockers prod"; labels=@("P0","ci-build"); title="CF-4 - Figer le lockfile en CI"; body=@"
**P0 - CI/Build - Effort S**

``.github/workflows/ci.yml`` utilise ``--no-frozen-lockfile`` (TODO documente). Builds non reproductibles.

### Taches
- Regenerer ``pnpm-lock.yaml`` en local, repasser CI en ``--frozen-lockfile``.

### Acceptation
- [ ] CI verte avec ``pnpm install --frozen-lockfile``
"@ },
  @{ m="M1 - Blockers prod"; labels=@("P0","ci-build"); title="CF-5 - Ajouter typecheck + build a la CI"; body=@"
**P0 - CI/Build - Effort S**

La CI lint + teste mais ne verifie ni ``tsc --noEmit`` ni ``next build``.

### Taches
- Etapes ``pnpm exec tsc --noEmit`` et ``pnpm build`` (+ ``prisma generate``).

### Acceptation
- [ ] CI echoue sur erreur TS ou build casse
"@ },
  @{ m="M1 - Blockers prod"; labels=@("P0","deploiement"); title="CF-6 - Pipeline de migration prod documente & teste"; body=@"
**P0 - Deploiement - Effort M**

``DIRECT_URL`` requis pour ``migrate deploy`` ; a valider sur la cible (Neon/Supabase).

### Taches
- Procedure ``prisma migrate deploy`` + ``prisma generate`` dans ``docs/DEPLOYMENT.md``.
- Verifier le client genere (``lib/generated/prisma``) en CI/CD.

### Acceptation
- [ ] Deploiement a blanc sur DB manageee reussit
- [ ] Runbook reproductible
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","securite"); title="CF-7 - Rate-limiter partage (Redis/Upstash) - conditionnel"; body=@"
**P1 - Securite/Scale - Effort L**

``lib/rate-limit.ts`` est en memoire ; inefficace en multi-instance/serverless.

### Decision requise
- Mono-instance (VPS) -> documenter la contrainte (S).
- Serverless/multi -> store partage (L).

### Acceptation
- [ ] Limite verifiee cross-instance **ou** contrainte mono-instance assumee et documentee
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","tests"); title="CF-8 - Test e2e du parcours critique"; body=@"
**P1 - Tests - Effort L**

Deja identifie dans ``PROD_HARDENING_AUDIT.md``. Aucun e2e aujourd'hui.

### Taches
- Playwright : signup -> verif (mock) -> login -> chapitre -> validation step -> XP persistee.

### Acceptation
- [ ] Parcours vert en CI sur DB de test ephemere
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","observabilite"); title="CF-9 - Logging structure + correlation"; body=@"
**P1 - Observabilite - Effort M**

Pas de logging applicatif ; les ``throw`` remontent bruts.

### Taches
- Logger leger (niveau, route, userId si dispo), sans PII/secret/mot de passe.

### Acceptation
- [ ] Erreurs serveur loggees avec contexte exploitable
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","observabilite"); title="CF-10 - Monitoring d'erreurs (Sentry ou equivalent)"; body=@"
**P1 - Observabilite - Effort M**

### Acceptation
- [ ] Une exception non geree remonte dans le dashboard avec stacktrace
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","ux"); title="CF-11 - Pages d'erreur globales + error boundary"; body=@"
**P1 - UX/Robustesse - Effort S**

Verifier presence de ``app/error.tsx``, ``app/not-found.tsx``, ``global-error.tsx``.

### Acceptation
- [ ] Crash runtime -> ecran propre, pas de stacktrace exposee
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","deploiement"); title="CF-12 - Healthcheck + readiness"; body=@"
**P1 - Deploiement - Effort S**

### Taches
- ``GET /api/health`` (ping DB leger) pour load-balancer/uptime.

### Acceptation
- [ ] ``200`` si DB joignable, ``503`` sinon
"@ },
  @{ m="M2 - Fiabilite"; labels=@("P1","securite"); title="CF-13 - Durcir le sandbox (revue + limites)"; body=@"
**P1 - Securite - Effort M**

``lib/sandbox/run-js.ts`` est deja bien isole. Renforcer :
- ``postMessage`` cible (origine au lieu de ``"*"``), limite de taille logs/sortie, garde memoire.

### Acceptation
- [ ] Sortie volumineuse bornee
- [ ] Cible ``postMessage`` resserree
"@ },
  @{ m="M3 - Polish & conformite"; labels=@("P1","conformite"); title="CF-14 - Conformite RGPD operationnelle"; body=@"
**P1 - Conformite - Effort L**

``docs/RGPD.md`` existe ; verifier l'implementation reelle.

### Taches
- Suppression de compte (droit a l'effacement), export des donnees, consentement.

### Acceptation
- [ ] Un utilisateur peut supprimer son compte (cascade verifiee)
- [ ] Export des donnees perso disponible
"@ },
  @{ m="M3 - Polish & conformite"; labels=@("P2","securite"); title="CF-15 - Durcir la CSP (retirer unsafe-inline/unsafe-eval)"; body=@"
**P2 - Securite - Effort L**

``next.config.ts`` prevoit deja ce durcissement par nonces.

### Acceptation
- [ ] CSP sans ``unsafe-inline`` cote script (nonces) sans casser Monaco/hydration
"@ },
  @{ m="M3 - Polish & conformite"; labels=@("P2","perf"); title="CF-16 - Auto-heberger Monaco (retirer la dependance CDN)"; body=@"
**P2 - Robustesse/Perf - Effort M**

Monaco charge depuis jsdelivr -> dependance externe + entrees CSP.

### Acceptation
- [ ] Editeur fonctionne sans le CDN ; entrees jsdelivr CSP supprimables
"@ },
  @{ m="M3 - Polish & conformite"; labels=@("P2","perf"); title="CF-17 - Budget perf & Core Web Vitals"; body=@"
**P2 - Perf - Effort M**

### Taches
- Audit Lighthouse (Three.js logo, images), lazy-load, verifier ``next/image``.

### Acceptation
- [ ] LCP/CLS/INP dans le vert sur dashboard et page de lecon
"@ },
  @{ m="M3 - Polish & conformite"; labels=@("P2","tests"); title="CF-18 - Elargir la couverture de tests des validateurs"; body=@"
**P2 - Tests - Effort L**

~70 validateurs, 3 fichiers de test. Coeur pedagogique sous-teste.

### Acceptation
- [ ] Chaque cursus a au moins un test de validateur (cas passant + echec)
"@ },
  @{ m="M3 - Polish & conformite"; labels=@("P1","exploitation"); title="CF-19 - Backups DB + plan de restauration"; body=@"
**P1 - Exploitation - Effort S**

### Acceptation
- [ ] Backups automatiques actives (manage) + restauration testee une fois
"@ }
)

Write-Output "`nCreation de $($issues.Count) issues..."
foreach ($iss in $issues) {
  $payload = @{
    title     = $iss.title
    body      = $iss.body
    labels    = $iss.labels
    milestone = $milestoneNumbers[$iss.m]
  }
  $created = Invoke-GH POST "$ApiBase/issues" $payload
  Write-Output "  #$($created.number) - $($iss.title)"
  Start-Sleep -Milliseconds 700  # limite de débit de l'API GitHub
}

Write-Output "`nTermine. Toutes les issues ont ete creees."
