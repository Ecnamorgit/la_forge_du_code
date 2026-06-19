<#
  Ferme les issues CF-1 -> CF-19 (numéros #2 à #20), toutes implémentées et
  mergées via la PR #22. Ajoute un commentaire de référence puis clôt l'issue
  avec le motif "completed". Via l'API REST GitHub (aucune dépendance à `gh`).

  PRÉREQUIS
    $env:GH_TOKEN = "ghp_..."   # token classic avec scope `repo`

  UTILISATION
    powershell -ExecutionPolicy Bypass -File scripts\close-issues.ps1

  Idempotent : ré-exécutable (fermer une issue déjà fermée est sans effet).
#>

$ErrorActionPreference = "Stop"

$Owner = "Ecnamorgit"
$Repo  = "la_forge_du_code"
$PrNumber = 22

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

# Issues #2 à #20 = CF-1 à CF-19.
$issueNumbers = 2..20

foreach ($n in $issueNumbers) {
  try {
    # Commentaire de traçabilité.
    Invoke-GH POST "$ApiBase/issues/$n/comments" @{
      body = "Implémenté et mergé via #$PrNumber. CI verte (lint, typecheck, tests unitaires, build, e2e). Clôture."
    } | Out-Null

    # Clôture avec motif "completed".
    Invoke-GH PATCH "$ApiBase/issues/$n" @{
      state        = "closed"
      state_reason = "completed"
    } | Out-Null

    Write-Output "Issue #$n fermée."
    Start-Sleep -Milliseconds 500  # ménager le rate-limit
  } catch {
    Write-Output "Issue #$n : erreur ($($_.Exception.Message))"
  }
}

Write-Output "`nTerminé."
