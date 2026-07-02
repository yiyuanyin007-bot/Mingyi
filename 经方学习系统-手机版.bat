@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: Start local HTTP server on port 8101 for mobile version
start /min "JingFangServer-Mobile" python "%~dp0start_server.py" 8101

:: Wait for server startup
timeout /t 2 /nobreak >nul

:: Open mobile version in default browser
start "" "http://localhost:8101/app/mobile.html"
