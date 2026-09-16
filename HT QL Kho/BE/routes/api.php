<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Phân Hệ Hệ Thống Quản Lý Kho (Vinamilk ERP)
| Các routes đã được chia nhỏ thành từng file chuyên biệt bên dưới:
|--------------------------------------------------------------------------
*/

// 1. Danh mục (Master Data)
require __DIR__ . '/api/warehouse/master_data.php';

// 2. Quản lý Tồn kho & FEFO (Inventory)
require __DIR__ . '/api/warehouse/inventory.php';

// 3. Nhập kho NVL & Thành phẩm (Inbound)
require __DIR__ . '/api/warehouse/inbound.php';

// 4. Xuất kho NVL & Thành phẩm (Outbound)
require __DIR__ . '/api/warehouse/outbound.php';

// 5. Báo cáo & Thống kê Kho (Reports)
require __DIR__ . '/api/warehouse/reports.php';

// ============================================================================
// Phân Hệ 5: QUẢN LÝ THU CHI (FINANCE & CASH/BANK)
// ============================================================================
require __DIR__ . '/api/finance/master_data.php';
require __DIR__ . '/api/finance/receipts.php';
require __DIR__ . '/api/finance/payments.php';
require __DIR__ . '/api/finance/reports.php';

// ============================================================================
// Phân Hệ Quản Lý Sản Xuất (Production Management)
// ============================================================================
require __DIR__ . '/api/production.php';
