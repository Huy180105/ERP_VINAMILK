# 🥛 Hệ Thống ERP Vinamilk (Vinamilk Enterprise Resource Planning)

Dự án Hệ thống Quản trị Doanh nghiệp (ERP) mô phỏng quy trình sản xuất, quản lý kho hàng và tài chính cho tập đoàn **Vinamilk**.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```plaintext
ERP_VINAMILK/
├── database_erp.sql          # Toàn bộ script CSDL (51 bảng: Kho, Bán hàng, Sản xuất, Nhân sự, Thu chi)
├── docker-compose.yml        # Cấu hình khởi chạy toàn bộ qua Docker (MySQL, BE, FE)
├── run_dev.bat               # File 1-Click tự động chạy cả BE & FE trên Windows
├── run_docker.bat            # File 1-Click khởi chạy bằng Docker Compose
├── README.md                 # Tài liệu hướng dẫn cài đặt và vận hành
└── HT QL Kho/
    ├── BE/                   # Backend RESTful API (Laravel 12 / PHP 8.2)
    │   ├── app/              # Controllers, Models, Middleware...
    │   ├── routes/api.php    # Định nghĩa toàn bộ API kho & tài chính
    │   ├── .env              # File cấu hình môi trường Backend
    │   └── Dockerfile        # Dockerfile cho Backend
    └── FE/                   # Frontend Web Application (React 19 / Vite 8 / Tailwind CSS)
        ├── src/              # Components, Pages, Services API
        ├── package.json      # Danh sách thư viện Frontend
        ├── Dockerfile        # Dockerfile đóng gói Frontend với Nginx
        └── nginx.conf        # Cấu hình reverse proxy cho Docker
```

---

## 🛠️ Yêu Cầu Môi Trường (Prerequisites)

Bạn có thể lựa chọn 1 trong 2 cách triển khai:

### Lựa chọn A: Chạy trực tiếp trên máy (Khuyên dùng - Nhẹ & Nhanh)
Cần có sẵn trên máy (Windows hoặc WSL/Ubuntu):
1. **PHP >= 8.2** (Khuyến nghị dùng XAMPP hoặc cài trực tiếp trên WSL).
   - Đảm bảo các extension sau đã bật trong `php.ini`: `pdo_mysql`, `mbstring`, `curl`, `fileinfo`, `zip`, `openssl`.
2. **Composer >= 2.x** (Trình quản lý gói cho PHP).
3. **Node.js >= 20.x** & **npm >= 10.x** (Môi trường chạy Frontend React Vite).
4. **MySQL >= 8.0** hoặc **MariaDB >= 10.5** (Đang lắng nghe ở port `3306`).

### Lựa chọn B: Chạy qua Docker (Không cần cài PHP/Node thủ công)
1. **Docker Desktop** (bật sẵn WSL 2 Backend).
2. **Docker Compose v2+**.

---

## 🚀 Hướng Dẫn Cài Đặt Từ Đầu (Setup Guide)

### 1. Cài đặt & Nạp Cơ sở Dữ liệu (Database)
1. Đảm bảo dịch vụ MySQL/MariaDB đang chạy trên cổng `3306`.
2. Tạo database và nhập dữ liệu từ file `database_erp.sql`:
   * **Cách nạp qua CMD/PowerShell:**
     ```bash
     mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quanly_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
     mysql -u root -p quanly_erp < database_erp.sql
     ```
   * **Hoặc import qua phpMyAdmin/Navicat/DBeaver:**
     - Tạo CSDL mới tên: `quanly_erp` (Collation: `utf8mb4_unicode_ci`).
     - Chọn tab **Import** -> Chọn file `database_erp.sql` ở thư mục gốc -> Bấm **Import**.

---

### 2. Cấu hình Backend (Laravel API)
1. Di chuyển vào thư mục Backend:
   ```bash
   cd "HT QL Kho/BE"
   ```
2. Cài đặt các gói thư viện PHP:
   ```bash
   composer install
   ```
3. Tạo file cấu hình môi trường `.env`:
   - Nếu chưa có file `.env`, copy từ `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Mở file `.env` và thiết lập thông số kết nối:
     ```env
     APP_NAME="Vinamilk ERP Warehouse"
     APP_ENV=local
     APP_KEY=base64:9oEw10B5CFA2P+K3aX8+Zz6R6u2S9M4h8J4K1L0P9Q8=
     APP_DEBUG=true
     APP_URL=http://localhost:8000

     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=quanly_erp
     DB_USERNAME=root
     DB_PASSWORD=root

     SESSION_DRIVER=file
     CACHE_STORE=file
     QUEUE_CONNECTION=sync
     ```
   - Các giá trị `DB_USERNAME` và `DB_PASSWORD` ở trên chỉ là ví dụ. Khi dùng MySQL trong WSL, hãy điền tài khoản có mật khẩu và quyền trên `quanly_erp` (máy đang dùng `erp_app`); tài khoản `root` trên Ubuntu thường đăng nhập bằng Unix socket.
4. Tạo mã khóa ứng dụng (nếu chưa có):
   ```bash
   php artisan key:generate
   ```

---

### 3. Cấu hình Frontend (React + Vite)
1. Di chuyển vào thư mục Frontend:
   ```bash
   cd "HT QL Kho/FE"
   ```
2. Cài đặt các gói thư viện Node.js:
   ```bash
   npm install
   ```

> 💡 **Lưu ý đặc biệt cho môi trường WSL / Linux**:  
> Nếu bạn chạy `npm run dev` trên WSL/Ubuntu mà gặp thông báo lỗi:  
> `Cannot find native binding ... Error: Cannot find module '@rolldown/binding-linux-x64-gnu'`  
> Hãy chạy lệnh sau trong WSL:
> ```bash
> npm install --save-optional @rolldown/binding-linux-x64-gnu@1.2.8
> ```

---

## 🏃 Hướng Dẫn Chạy Dự Án

### Cách 1: Chạy 1-Click trên Windows (Nhanh nhất)
Nhấp đúp chuột vào file:
👉 **`run_dev.bat`** tại thư mục gốc của dự án.
* Script kiểm tra Laravel trên Windows có đăng nhập được vào MySQL hay không.
* Tự động bật cửa sổ Backend (`http://127.0.0.1:8000`).
* Tự động bật cửa sổ Frontend (`http://localhost:5173`).
* Tự động mở trình duyệt web.

---

### MySQL chạy trong WSL/Ubuntu

Nhấp đúp **`run_wsl.bat`** ở thư mục gốc. Script khởi động MySQL và Laravel trong WSL, rồi mở React trên Windows nếu frontend chưa chạy. Nhờ đó `DB_HOST=127.0.0.1` trong `.env` trỏ đến MySQL của WSL. Nếu có MySQL khác trên Windows cùng dùng cổng 3306, hãy dùng script này thay vì `run_dev.bat`.

Trong `HT QL Kho/BE/.env`, dùng tài khoản MySQL có quyền trên database `quanly_erp`. Kiểm tra kết nối trước khi mở ứng dụng bằng:

```powershell
wsl --cd "HT QL Kho\BE" -- php artisan db:show
```

Sau khi import database lần đầu, chạy migration nhật ký Thu Chi trước khi duyệt hoặc hủy phiếu:

```powershell
wsl --cd "HT QL Kho\BE" -- php artisan migrate --path=database/migrations/2026_09_23_000000_create_nhat_ky_thu_chi_table.php --force
```

### Cách 2: Chạy thủ công bằng dòng lệnh

**Cửa sổ Terminal 1 - Chạy Backend:**
```bash
cd "HT QL Kho/BE"
php artisan serve --host=127.0.0.1 --port=8000
```
> API Backend sẵn sàng tại: `http://127.0.0.1:8000`

**Cửa sổ Terminal 2 - Chạy Frontend:**
```bash
cd "HT QL Kho/FE"
npm run dev
```
> Giao diện Web hiển thị tại: `http://localhost:5173`

---

### Cách 3: Chạy toàn bộ qua Docker Compose
Nếu máy đã mở **Docker Desktop**, bạn chỉ cần chạy:
```bash
docker compose up -d --build
```
*(Hoặc nhấp đúp file `run_docker.bat`)*

Hệ thống sẽ tự động tạo 3 containers:
* **Database (MySQL 8.0)**: Cổng `3306` (Tự động nạp sẵn `database_erp.sql`).
* **Backend API (Laravel)**: Cổng `8000`.
* **Frontend (Nginx + React)**: Cổng `3000` (`http://localhost:3000`).

---

## 🌐 Danh Mục Cổng & Địa Chỉ Dịch Vụ

| Dịch vụ | Chạy Local | Chạy Docker | Mô tả |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | `http://localhost:5173` | `http://localhost:3000` | Giao diện điều hành ERP Vinamilk |
| **Backend API** | `http://127.0.0.1:8000` | `http://localhost:8000` | RESTful API (Kho hàng & Thu chi) |
| **MySQL Server** | `127.0.0.1:3306` | `localhost:3306` | Database: `quanly_erp`, User: `root` |

---

## 🔧 Xử Lý Sự Cố Thường Gặp (Troubleshooting)

1. **Lỗi: `Table 'quanly_erp.sessions' doesn't exist`**
   - *Nguyên nhân*: Laravel đang để `SESSION_DRIVER=database` nhưng CSDL không dùng bảng session mặc định.
   - *Khắc phục*: Trong file `HT QL Kho/BE/.env`, chỉnh lại `SESSION_DRIVER=file` và `CACHE_STORE=file`.

2. **Lỗi: `Access denied for user ...`**
   - Kiểm tra tài khoản và mật khẩu trong `HT QL Kho/BE/.env`, rồi chạy `wsl --cd "HT QL Kho\BE" -- php artisan db:show` từ thư mục gốc để thử kết nối trong WSL.
   - Nếu lệnh trên thành công nhưng `run_dev.bat` vẫn báo lỗi, PHP trên Windows đang dùng MySQL của Windows. Chạy `run_wsl.bat` để Laravel dùng MySQL trong WSL.

3. **Port 8000 hoặc 5173 bị chiếm dụng (Address already in use)**
   - Đổi port Backend: `php artisan serve --port=8080`
   - Đổi port Frontend: `npm run dev -- --port 5174`



Bạn đang ở zsh trong WSL; run_wsl.bat là file chạy bằng Windows CMD. Từ thư mục gốc repo, chạy:
cmd.exe /c run_wsl.bat
Nếu muốn chạy hoàn toàn bằng terminal WSL, mở hai terminal:
# Terminal 1: MySQL và backend
sudo service mysql start
cd "HT QL Kho/BE"
php artisan db:show
php artisan serve --host=127.0.0.1 --port=8000
# Terminal 2: frontend (từ thư mục gốc repo)
cd "HT QL Kho/FE"
npm run dev
Sau đó mở http://localhost:5173.
