$folder = "C:\Users\ad\Downloads"

$csvPath = Get-ChildItem -Path $folder -Filter "Todos os items*.csv" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1 -ExpandProperty FullName

$jsPath  = "C:\Autorizador\decoder\decoder\data\gidUpd.js"

function Escape-JsString {
    param([string]$Value)
    if ($null -eq $Value) { return "" }
    $Value = $Value -replace '\\', '\\\\'
    $Value = $Value -replace "'", "\\'"
    $Value = $Value -replace '"', '\"'
    return $Value
}

function Normalize-Tipo {
    param([string]$Value)

    switch ($Value) {
        'Serviço Técnico Especializado' { 'Serviço'; break }
        'Implementar Serviço' { 'Implementação'; break }
        'Tarefa (Ágil)' { 'Tarefa'; break }
        'Requisição de Mudança' { 'RM'; break }
        'Atender Defeito' { 'Defeito'; break }
        'Em Homologação com o Gestor' { 'Homologação'; break }
        'Demanda de Manutenção de Sistemas' { 'DMS'; break }
        default { $Value }
    }
}

function Normalize-Status {
    param([string]$Value)

    switch ($Value) {
        'Em Andamento' { 'Andamento'; break }
        'Em Homologação com o Gestor' { 'Homologação'; break }
        'Em Validação' { 'Validação'; break }
        'Em Atendimento' { 'Atendimento'; break }
        'Não Implantada' { 'Não Impl.'; break }
        'Implantada Parcialmente' { 'Impla. Parc.'; break }
        'Implantação não verificada' { 'Impl. N Ver'; break }
        'Homologação Validada pelo Gestor' { 'Homolog. Vali'; break }
        default { $Value }
    }
}

function Only-Date {
    param([string]$Value)
    if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
    return ($Value.Trim('"') -split ' ')[0]
}

function Limit-Text {
    param(
        [string]$Value,
        [int]$MaxLength = 200
    )

    if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
    $Value = $Value.Trim('"')
    if ($Value.Length -le $MaxLength) { return $Value }
    return $Value.Substring(0, $MaxLength)
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
$js = "// Auto-generated from CSV`r`n"
$js += "// Last updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`r`n`r`n"
$js += "const dadosGidUpd = [`r`n"

foreach ($line in $lines | Select-Object -Skip 1) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    $cols = Parse-CsvLine $line
    if ($cols.Count -lt 7) { continue }

    $id         = $cols[0].Trim('"')
    $tipo       = $cols[1].Trim('"')
    $status     = $cols[2].Trim('"')
    $dataIni    = $cols[3].Trim('"')
    $prazoFinal = $cols[4].Trim('"')
    $dataMod    = $cols[5].Trim('"')
    $resumo     = $cols[6].Trim('"')

    $js += "  { id: '$id', tipo: '$tipo', status: '$status', dataIni: '$dataIni', prazoFinal: '$prazoFinal', dataMod: '$dataMod', resumo: '$resumo' },`r`n"
}

$js += "];`r`n"
Set-Content -Path $jsPath -Value $js -Encoding UTF8

Write-Host "Gerado: $jsPath" -ForegroundColor Green