$csvPath = "C:\Users\ad\Downloads\Todos os items(5).csv"
$jsonPath = "C:\Users\ad\Downloads\gid.json"

function Escape-JsonString {
    param([string]$Value)
    if ($null -eq $Value) { return "" }
    $Value = $Value -replace '\\', '\\\\'
    $Value = $Value -replace '"', '\"'
    $Value = $Value -replace "`r", '\r'
    $Value = $Value -replace "`n", '\n'
    return $Value
}

function Parse-CsvLine {
    param([string]$Line)

    $fields = @()
    $current = ""
    $inQuotes = $false

    for ($i = 0; $i -lt $Line.Length; $i++) {
        $ch = $Line[$i]

        if ($ch -eq '"') {
            if ($inQuotes -and $i + 1 -lt $Line.Length -and $Line[$i + 1] -eq '"') {
                $current += '"'
                $i++
            } else {
                $inQuotes = -not $inQuotes
            }
        }
        elseif ($ch -eq "`t" -and -not $inQuotes) {
            $fields += $current
            $current = ""
        }
        else {
            $current += $ch
        }
    }

    $fields += $current
    return $fields
}

$lines = Get-Content -Path $csvPath

$data = @()

foreach ($line in $lines | Select-Object -Skip 1) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $cols = Parse-CsvLine $line
    if ($cols.Count -lt 7) { continue }

    $obj = [ordered]@{
        id         = $cols[0].Trim('"')
        tipo       = $cols[1].Trim('"')
        status     = $cols[2].Trim('"')
        dataIni    = $cols[3].Trim('"')
        prazoFinal = $cols[4].Trim('"')
        dataMod    = $cols[5].Trim('"')
        resumo     = $cols[6].Trim('"')
    }

    $data += $obj
}

$json = $data | ConvertTo-Json -Depth 3
Set-Content -Path $jsonPath -Value $json -Encoding UTF8

Write-Host "Gerado: $jsonPath" -ForegroundColor Green
Write-Host "Linhas: $($data.Count)" -ForegroundColor Yellow