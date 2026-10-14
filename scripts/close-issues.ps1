<#
  Closes issues CF-1 to CF-19 (#2 to #20), delivered by PR #22: adds a
  reference comment, then closes each issue with the "completed" reason.
  Uses the GitHub REST API, with no dependency on `gh`.

  Prerequisites:
    $env:GH_TOKEN = "ghp_..."   # classic token with the `repo` scope

  Usage:
    powershell -ExecutionPolicy Bypass -File scripts\close-issues.ps1

  Can be rerun, but each run adds the comment again.
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

# Issues #2 to #20: CF-1 to CF-19.
$issueNumbers = 2..20

foreach ($n in $issueNumbers) {
  try {
    # Traceability comment.
    Invoke-GH POST "$ApiBase/issues/$n/comments" @{
      body = "Implémenté et mergé via #$PrNumber. CI verte (lint, typecheck, tests unitaires, build, e2e). Clôture."
    } | Out-Null

    Invoke-GH PATCH "$ApiBase/issues/$n" @{
      state        = "closed"
      state_reason = "completed"
    } | Out-Null

    Write-Output "Issue #$n fermée."
    Start-Sleep -Milliseconds 500  # limite de débit de l'API GitHub
  } catch {
    Write-Output "Issue #$n : erreur ($($_.Exception.Message))"
  }
}

Write-Output "`nTerminé."
