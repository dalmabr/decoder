# PowerShell Script to convert autorizador.csv to data.js
# Usage: .\convert-csv-to-js.ps1

$csvPath = "autorizador.csv"
$jsPath = "data.js"

Write-Host "Converting $csvPath to $jsPath..." -ForegroundColor Cyan

# Read CSV file
$csv = Import-Csv -Path $csvPath -Delimiter ';'

# Start building the JavaScript file
$jsContent = "// Auto-generated from autorizador.csv`n"
$jsContent += "// Last updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$jsContent += "const DATA = [`n"

# Convert each row to JavaScript object
foreach ($row in $csv) {
    $membro = ($row.membro -replace '"', '\"') -replace "'", "\'"
    $tipo = ($row.tipo -replace '"', '\"') -replace "'", "\'"
    $elemento = ($row.elemento -replace '"', '\"') -replace "'", "\'"
    $descricao = ($row.descricao -replace '"', '\"') -replace "'", "\'"
    $detalhe = ($row.detalhe -replace '"', '\"') -replace "'", "\'"
    
    $jsContent += "  {membro: '$membro', tipo: '$tipo', elemento: '$elemento', descricao: '$descricao', detalhe: '$detalhe'},`n"
}

# Close the array
$jsContent += "];`n"

# Write to file
[System.IO.File]::WriteAllText($jsPath, $jsContent)

$rowCount = $csv.Count
Write-Host "Successfully created $jsPath" -ForegroundColor Green
Write-Host "Total rows: $rowCount" -ForegroundColor Yellow
