@echo off
setlocal
cd /d "%~dp0"
title Obaydah Portfolio - Local Launcher
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0RUN_LOCAL.ps1"
if errorlevel 1 (
 echo.
 echo The site could not start. Review the message above.
 pause
 exit /b 1
)
exit /b 0
