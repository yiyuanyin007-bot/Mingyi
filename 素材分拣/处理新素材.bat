@echo off
chcp 65001 >nul
REM 素材分拣：把当前文件夹里的文件自动分类到项目对应位置

cd /d "%~dp0.."
python "scripts\sort_materials.py"

pause
