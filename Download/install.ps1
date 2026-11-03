param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidatePattern('^[A-Za-z0-9._-]+$')]
    [string]$ProjectName
)
$ErrorActionPreference = 'Stop'
if (Test-Path -LiteralPath $ProjectName) {
    throw "Error: '$ProjectName' already exists."
}
$zipUrl = 'https://github.com/OrpanAp/power-2.0/archive/refs/heads/main.zip'
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString())
$zipPath = Join-Path $temp 'power.zip'
$extractPath = Join-Path $temp 'source'
try {
    New-Item -ItemType Directory -Path $temp | Out-Null
    Write-Host 'Downloading P.O.W.E.R. 2.0...' -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath
    $source = Get-ChildItem -LiteralPath $extractPath -Directory | Select-Object -First 1
    if (-not $source) { throw 'Could not locate the downloaded project files.' }
    New-Item -ItemType Directory -Path $ProjectName | Out-Null
    Copy-Item -Path (Join-Path $source.FullName '*') -Destination $ProjectName -Recurse -Force
    Write-Host "Created '$ProjectName'." -ForegroundColor Green
    Write-Host "Next steps:"
    Write-Host "  Set-Location $ProjectName"
    Write-Host "  Copy-Item .env.example .env"
    Write-Host "  node bin/power-cli.js serve"
}
finally {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
}
