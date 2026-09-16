<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\ReportController;

/*
|--------------------------------------------------------------------------
| Module 5: Báo Cáo & Thống Kê Kho (Warehouse Reports APIs)
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/reports')->group(function () {
    // Báo cáo tổng hợp Nhập - Xuất - Tồn (CF-FR56 -> CF-FR58)
    Route::get('/summary', [ReportController::class, 'getInventorySummary']);

    // Báo cáo chi tiết lịch sử thẻ kho của từng lô hàng
    Route::get('/audit-trail/{maTonKho}', [ReportController::class, 'getStockAuditTrail']);
});
