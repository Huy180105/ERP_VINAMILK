@echo off
chcp 65001 >nul
title ERP VINAMILK - Docker Compose
echo ================================================================
echo           KHOI DONG ERP VINAMILK QUA DOCKER COMPOSE
echo ================================================================
echo.
echo Luu y: Hay dam bao Docker Desktop da duoc mo truoc khi chay!
echo.
cd /d "%~dp0"
docker compose up -d --build
if %errorlevel% neq 0 (
    echo.
    echo [LOI] Khong the build hoac khoi dong qua Docker.
    echo Vui long kiem tra Docker Desktop da chay chua.
    pause
    exit /b %errorlevel%
)

echo.
echo ================================================================
echo Docker containers da khoi dong thanh cong!
echo - Web App:   http://localhost:3000
echo - Backend:   http://localhost:8000
echo - Database:  localhost:3306
echo ================================================================
echo.
timeout /t 3 >nul
start http://localhost:3000
