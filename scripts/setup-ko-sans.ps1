# PowerShell — run locally on Windows (no font binaries are included in this ZIP).
# Example: powershell -ExecutionPolicy Bypass -File .\scripts\setup-ko-sans.ps1 -SourceFolder "C:\Users\YourName\Downloads\KOSans"
param(
  [Parameter(Mandatory=$true)] [string] $SourceFolder,
  [string] $ProjectRoot = "."
)
$weights = @{
  "Thin" = "100"
  "ExtraLight" = "200"
  "Light" = "300"
  "Regular" = "400"
  "Medium" = "500"
  "SemiBold" = "600"
  "Bold" = "700"
}
$dest = Join-Path $ProjectRoot "public\fonts"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($key in $weights.Keys) {
  $files = @(Get-ChildItem -LiteralPath $SourceFolder -File -Filter "KOSans-$key*.otf" -ErrorAction SilentlyContinue)
  if ($files.Count -ne 1) {
    Write-Error "Expected one KOSans-$key OTF in $SourceFolder, found $($files.Count)."; exit 1
  }
  $filename = "KO-Sans-$($weights[$key]).otf"
  Copy-Item -LiteralPath $files[0].FullName -Destination (Join-Path $dest $filename) -Force
  Write-Output "$($files[0].Name) -> public/fonts/$filename"
}
Write-Output "KO Sans files are now installed locally. Import styles/ko-sans.css in your Next.js root layout."
