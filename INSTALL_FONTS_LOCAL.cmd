@echo off
chcp 65001 >nul
echo Place your original Outfit TTF and KO Sans OTF files in one folder.
set /p FONT_SOURCE=Enter full folder path containing your fonts: 
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-local-licensed-fonts.ps1" -SourceFolder "%FONT_SOURCE%"
pause
