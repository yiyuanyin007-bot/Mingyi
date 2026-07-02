@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: 端口冲突检测：若8100被占用，尝试8101
python -c "import sys,socket; p=8100; s=socket.socket(); r=s.connect_ex(('localhost',p)); s.close(); sys.exit(0 if r!=0 else 1)" >nul 2>&1
if errorlevel 1 (
    echo [经方系统] 端口8100被占用，尝试备用端口8101...
    start /min "JingFangServer" python "%~dp0start_server.py" 8101
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8101/app/index.html"
) else (
    start /min "JingFangServer" python "%~dp0start_server.py" 8100
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8100/app/index.html"
)
