@echo off
setlocal

if "%~1"=="" (
  echo Usage: install.cmd ProjectName
  echo Example: install.cmd my-app
  exit /b 1
)

set "POWER_PROJECT_NAME=%~1"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $installer = Join-Path $env:TEMP ('power-framework-installer-' + [guid]::NewGuid().ToString('N') + '.ps1'); try { Invoke-WebRequest -UseBasicParsing -Uri 'https://raw.githubusercontent.com/OrpanAp/power-framework/main/Download/install.ps1' -OutFile $installer; & $installer -ProjectName $env:POWER_PROJECT_NAME } finally { Remove-Item -LiteralPath $installer -Force -ErrorAction SilentlyContinue }"

if errorlevel 1 (
  echo Installation failed.
  exit /b 1
)

endlocal
