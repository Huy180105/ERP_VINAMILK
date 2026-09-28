@echo off
setlocal
chcp 65001 >nul
title ERP VINAMILK - MySQL tren WSL

rem Run Laravel in WSL so 127.0.0.1:3306 resolves to the WSL MySQL server.
wsl --status >nul 2>&1
if errorlevel 1 (
    echo [LOI] WSL chua san sang. Hay khoi dong Ubuntu va thu lai.
    pause
    exit /b 1
)

wsl -- service mysql status >nul 2>&1
if errorlevel 1 (
    echo Dang khoi dong MySQL trong WSL...
    wsl -u root -- service mysql start
    if errorlevel 1 (
        echo [LOI] Khong khoi dong duoc MySQL trong WSL.
        pause
        exit /b 1
    )
)

echo Kiem tra ket noi Laravel den MySQL trong WSL...
wsl --cd "%~dp0HT QL Kho\BE" -- php artisan db:show >nul
if errorlevel 1 (
    echo [LOI] Laravel khong ket noi duoc MySQL trong WSL.
    echo Kiem tra DB_HOST, DB_USERNAME, DB_PASSWORD trong HT QL Kho\BE\.env.
    pause
    exit /b 1
)

echo Khoi dong Backend trong WSL tai http://127.0.0.1:8000...
curl.exe --silent --fail --max-time 15 http://127.0.0.1:8000/api/warehouse/master-data/materials >nul 2>&1
if errorlevel 1 (
    start "ERP Backend (WSL Laravel)" /D "%~dp0HT QL Kho\BE" wsl.exe -- php artisan serve --host=127.0.0.1 --port=8000
) else (
    echo Backend da chay tren cong 8000.
)

echo Khoi dong Frontend tai http://localhost:5173...
curl.exe --silent --fail --max-time 3 http://127.0.0.1:5173/ >nul 2>&1
if errorlevel 1 (
    start "ERP Frontend (React)" /D "%~dp0HT QL Kho\FE" cmd /k "npm run dev"
) else (
    echo Frontend da chay tren cong 5173.
)

echo Da khoi dong. MySQL su dung server trong WSL.
powershell -NoProfile -Command "Start-Sleep -Seconds 3"
curl.exe --silent --fail --max-time 15 http://127.0.0.1:8000/api/warehouse/master-data/materials >nul 2>&1
if errorlevel 1 (
    echo [LOI] Backend khong phuc vu API tren cong 8000.
    pause
    exit /b 1
)
curl.exe --silent --fail --max-time 10 http://127.0.0.1:5173/ >nul 2>&1
if errorlevel 1 (
    echo [LOI] Frontend khong phuc vu trang tren cong 5173.
    pause
    exit /b 1
)
start http://localhost:5173
