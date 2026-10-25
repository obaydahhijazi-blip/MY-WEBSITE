$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host 'OBAYDAH HIJAZI - LOCAL WEBSITE' -ForegroundColor Cyan
Write-Host '============================================='

if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Write-Host '[MISSING] Node.js is not installed.' -ForegroundColor Red
    Write-Host 'Install current Node.js LTS from: https://nodejs.org/en/download'
    Start-Process 'https://nodejs.org/en/download'
    exit 1
}
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Host '[MISSING] npm was not found. Reinstall Node.js LTS.' -ForegroundColor Red
    exit 1
}
$NodeVersionRaw = (& node.exe --version).Trim().TrimStart('v')
try { $NodeVersion = [version]$NodeVersionRaw } catch {
    Write-Host "Cannot determine Node.js version: $NodeVersionRaw" -ForegroundColor Red
    exit 1
}
if ($NodeVersion -lt [version]'20.9.0') {
    Write-Host "Node.js $NodeVersion is too old. Install version 22 or 24 LTS." -ForegroundColor Red
    Start-Process 'https://nodejs.org/en/download'
    exit 1
}
Write-Host "[OK] Node.js $NodeVersion"

$envFile = Join-Path $Root '.env.local'
if (-not (Test-Path -LiteralPath $envFile)) {
    @'
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=iz5tq94u
NEXT_PUBLIC_SANITY_DATASET=production
'@ | Set-Content -LiteralPath $envFile -Encoding ASCII
    Write-Host '[OK] Local environment file created.'
}

# Local font files are optional; KO Sans needs its original owner-licensed files.
if (-not (Test-Path -LiteralPath (Join-Path $Root 'public\fonts\KO-Sans-400.otf'))) {
    Write-Host '[NOTE] KO Sans binaries are not included. Read LOCAL_README_AR.txt to add your originals.' -ForegroundColor Yellow
}

if (-not (Test-Path -LiteralPath (Join-Path $Root 'node_modules\next\package.json'))) {
    Write-Host '[SETUP] Installing dependencies for the first launch. Internet is required.' -ForegroundColor Cyan
    if (Test-Path -LiteralPath (Join-Path $Root 'package-lock.json')) {
        & npm.cmd ci --no-audit --no-fund
    } else {
        & npm.cmd install --no-audit --no-fund
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[ERROR] npm installation failed. Check your connection and try again.' -ForegroundColor Red
        exit 1
    }
    Write-Host '[OK] Dependencies installed.' -ForegroundColor Green
} else {
    Write-Host '[OK] Dependencies already installed.'
}

$SiteUrl = 'http://localhost:3000'
$ServerIsReady = $false
$existing = $false
try {
    $check = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    $existing = $true
} catch { }
if ($existing) {
    Write-Host '[NOTE] A web server is already responding on port 3000.' -ForegroundColor Yellow
    Write-Host 'Verify it is the portfolio before editing or changing content.'
    Start-Process $SiteUrl
    exit 0
}

Write-Host '[START] Launching the development server in a new window...' -ForegroundColor Cyan
Write-Host 'Keep the new server window open while viewing your website.' -ForegroundColor Cyan
$server = Start-Process -FilePath $env:ComSpec -ArgumentList @('/k', 'npm run dev') -WorkingDirectory $Root -PassThru

for ($attempt = 0; $attempt -lt 75; $attempt++) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            $ServerIsReady = $true
            break
        }
    } catch { }
    if ($server.HasExited) { break }
}
if ($ServerIsReady) {
    Write-Host '[READY] Opening http://localhost:3000' -ForegroundColor Green
    Start-Process $SiteUrl
    Write-Host 'Admin: http://localhost:3000/admin'
    exit 0
}
Write-Host '[WARNING] The website did not respond yet. Check the server window for errors.' -ForegroundColor Yellow
Write-Host 'When the server is ready, open http://localhost:3000 in your browser.'
exit 1
