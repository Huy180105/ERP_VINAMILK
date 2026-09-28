@echo off
chcp 65001 >nul
title ERP VINAMILK - Khoi Dong He Thong
echo ================================================================
echo          HE THONG ERP VINAMILK (KHO HANG ^& TAI CHINH)
echo ================================================================
echo.

echo [1/3] Kiem tra Laravel ket noi MySQL tu Windows...
pushd "%~dp0HT QL Kho\BE"
php artisan db:show >nul
if errorlevel 1 (
    popd
    echo [LOI] Backend Windows khong ket noi duoc MySQL.
    echo Neu MySQL cua ban chay trong WSL, hay dung run_wsl.bat.
    pause
    exit /b 1
)
popd

echo.
echo [2/3] Khoi dong Backend (Laravel API tren http://127.0.0.1:8000)...
start "ERP Backend (Laravel)" /D "%~dp0HT QL Kho\BE" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"

echo [3/3] Khoi dong Frontend (React Vite tren http://localhost:5173)...
start "ERP Frontend (React)" /D "%~dp0HT QL Kho\FE" cmd /k "npm run dev"

echo.
echo ================================================================
echo Da khoi dong ca Backend va Frontend thanh cong!
echo - Frontend URL: http://localhost:5173
echo - Backend API:  http://127.0.0.1:8000
echo ================================================================
echo.
powershell -NoProfile -Command "Start-Sleep -Seconds 3"
start http://localhost:5173
