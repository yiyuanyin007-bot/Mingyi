@echo off
chcp 65001 >nul
REM 生成每日学习建议
REM 用法：daily_review.bat 2026-06-14

set DATE=%1
if "%DATE%"=="" (
    echo 用法：daily_review.bat YYYY-MM-DD
    exit /b 1
)

python "%~dp0..\.agents\skills\text-to-cards\scripts\daily_review.py" --date %DATE%
