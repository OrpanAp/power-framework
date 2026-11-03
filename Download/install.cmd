@echo off
setlocal
if "%~1"=="" (
  echo Usage: install.cmd ProjectName
  exit /b 1
)
set "PROJECT_NAME=%~1"
set "INSTALLER_URL=https://raw.githubusercontent.com/OrpanAp/power-framework/main/Download/install.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $name='%PROJECT_NAME%'; if ($name -notmatch '^[A-Za-z0-9._-]+$') { throw 'Use letters, numbers, dots, underscores, or hyphens in the project name.' }; & ([scriptblock]::Create((Invoke-RestMethod '%INSTALLER_URL%'))) $name"
if errorlevel 1 exit /b 1
endlocal
