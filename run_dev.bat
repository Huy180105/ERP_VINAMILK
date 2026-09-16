@echo off
chcp 65001 >nul
title ERP VINAMILK - Khoi Dong He Thong
echo ================================================================
echo          HE THONG ERP VINAMILK (KHO HANG & TAI CHINH)
echo ================================================================
echo.

echo [1/3] Kiem tra Database MySQL / MariaDB (Port 3306)...
powershell -Command "if (!(Test-NetConnection -ComputerName 127.0.0.1 -Port 3306 -InformationLevel Quiet)) { Write-Host '>> Port 3306 chua mo. Dang tu dong bat MariaDB qua WSL...' -ForegroundColor Yellow; wsl -d Ubuntu -u root -- service mysql start } else { Write-Host '>> MySQL/MariaDB dang hoat dong tot (Port 3306)!' -ForegroundColor Green }"

echo.
echo [2/3] Khoi dong Backend (Laravel API tren http://127.0.0.1:8000)...
start "ERP Backend (Laravel)" cmd /k "chcp 65001 >nul && cd /d \"%~dp0HT QL Kho\BE\" && echo Backend dang chay tai http://127.0.0.1:8000 && php artisan serve --host=127.0.0.1 --port=8000"

echo [3/3] Khoi dong Frontend (React Vite tren http://localhost:5173)...
start "ERP Frontend (React)" cmd /k "chcp 65001 >nul && cd /d \"%~dp0HT QL Kho\FE\" && echo Frontend dang chay tai http://localhost:5173 && npm run dev"

echo.
echo ================================================================
echo Da khoi dong ca Backend va Frontend thanh cong!
echo - Frontend URL: http://localhost:5173
echo - Backend API:  http://127.0.0.1:8000
echo ================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
