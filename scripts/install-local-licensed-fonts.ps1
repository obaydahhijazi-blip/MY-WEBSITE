param(
    [Parameter(Mandatory=$true)][string]$SourceFolder
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$dest = Join-Path $root 'public\fonts'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
if (-not (Test-Path $SourceFolder)) { throw "Font folder was not found: $SourceFolder" }
$files = Get-ChildItem -Path $SourceFolder -File -Recurse
$outfitWeights = @('ExtraLight','ExtraBold','SemiBold','Regular','Medium','Light','Thin','Bold','Black')
foreach ($weight in $outfitWeights) {
  $candidate = $files | Where-Object { $_.Extension -ieq '.ttf' -and $_.BaseName -match ('^Outfit[- ]' + $weight + '(?:\b|\s|\()') } | Select-Object -First 1
  if ($null -ne $candidate) {
    Copy-Item -LiteralPath $candidate.FullName -Destination (Join-Path $dest "Outfit-$weight.ttf") -Force
    Write-Host "Installed Outfit $weight" -ForegroundColor Green
  } else { Write-Host "Not found: Outfit $weight" -ForegroundColor Yellow }
}
$koWeights = @{'ExtraLight'='200'; 'SemiBold'='600'; 'Regular'='400'; 'Medium'='500'; 'Light'='300'; 'Thin'='100'; 'Bold'='700'}
foreach ($weight in $koWeights.Keys) {
  $candidate = $files | Where-Object { $_.Extension -ieq '.otf' -and $_.BaseName -match ('^KO\s?Sans[- ]' + $weight + '(?:\b|\s|\()') } | Select-Object -First 1
  if ($null -ne $candidate) {
    Copy-Item -LiteralPath $candidate.FullName -Destination (Join-Path $dest ("KO-Sans-" + $koWeights[$weight] + ".otf")) -Force
    Write-Host "Installed KO Sans $weight" -ForegroundColor Green
  }
}
Write-Host "Fonts copied from your original licensed files. Restart the local site." -ForegroundColor Cyan
