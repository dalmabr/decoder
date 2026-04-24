# ---------- CONFIGURE AQUI ----------
$jazzRoot = "https://gid.caixa:9443/ccm"   # << SEM /web e SEM espaço
$user = "f630638"
$pass = "Tarefa21"
$projArea = "_6xFtcAEREe2QiaA"            # ID do projeto
# ------------------------------------

# 1. Ignora certificado auto-assinado
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
# 2. Força TLS 1.2+ (ESSENCIAL para Jazz moderno)
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${user}:${pass}"))
$headers = @{
    "Authorization" = "Basic $base64"
    "Accept"        = "application/json"
    "User-Agent"    = "PowerShell-JazzScraper/1.0"
}

$all = @()
$start = 0
$page = 50

do {
    $url = "$jazzRoot/oslc/contexts/$projArea/workitems?`$oslc.select=dcterms:identifier,dcterms:title,dcterms:type,dcterms:status&`_startIndex=$start&`_pageSize=$page"
    try {
        $resp = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -TimeoutSec 60
    }
    catch {
        Write-Error $_.Exception.Message
        break
    }
    foreach ($wi in $resp.'oslc:results') {
        $all += [PSCustomObject]@{
            id     = $wi.'dcterms:identifier'
            title  = $wi.'dcterms:title'
            type   = $wi.'dcterms:type'
            status = $wi.'dcterms:status'
        }
    }
    $start += $page
} while ($resp.'oslc:next')

$all | ConvertTo-Json -Depth 3 | Out-File jazz_data.json -Encoding UTF8
Write-Host "Gravados $($all.Count) work items em jazz_data.json"