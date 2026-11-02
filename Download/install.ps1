param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9._-]*$')]
    [string]$ProjectName
)

$ErrorActionPreference = 'Stop'

if (Test-Path -LiteralPath $ProjectName) {
    throw "Error: '$ProjectName' already exists. Choose another project name."
}

$archiveUrl = 'https://github.com/OrpanAp/power-2.0/archive/refs/heads/main.zip'
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString('N'))
$zipPath = Join-Path $temp 'power.zip'
$extractPath = Join-Path $temp 'source'
$stagingPath = Join-Path $temp 'project'

try {
    New-Item -ItemType Directory -Path $temp | Out-Null

    Write-Host 'Downloading P.O.W.E.R. 2.0...' -ForegroundColor Cyan
    Invoke-WebRequest -UseBasicParsing -Uri $archiveUrl -OutFile $zipPath

    if (-not (Test-Path -LiteralPath $zipPath) -or (Get-Item -LiteralPath $zipPath).Length -eq 0) {
        throw 'GitHub returned an empty archive.'
    }

    Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath
    $source = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1

    if (-not $source -or -not (Test-Path -LiteralPath (Join-Path $source.FullName 'package.json'))) {
        throw 'The downloaded archive does not contain the expected project files.'
    }

    New-Item -ItemType Directory -Path $stagingPath | Out-Null
    Copy-Item -Path (Join-Path $source.FullName '*') -Destination $stagingPath -Recurse -Force

    if (-not (Test-Path -LiteralPath (Join-Path $stagingPath 'bin/power-cli.js'))) {
        throw 'The downloaded project is missing bin/power-cli.js.'
    }

    if (Test-Path -LiteralPath $ProjectName) {
        throw "Error: '$ProjectName' appeared during installation; refusing to overwrite it."
    }

    Move-Item -LiteralPath $stagingPath -Destination $ProjectName

    Write-Host ""
    Write-Host "P.O.W.E.R. 2.0 project created successfully: $ProjectName" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  Set-Location $ProjectName"
    Write-Host "  Copy-Item .env.example .env"
    Write-Host "  node bin/power-cli.js serve"
    Write-Host ""
    Write-Host "Note: configure your database in .env before using database-backed features."
}
finally {
    if (Test-Path -LiteralPath $temp) {
        Remove-Item -LiteralPath $temp -Recurse -Force
    }
}
