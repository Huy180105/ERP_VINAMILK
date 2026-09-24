<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Production\ProductionOrderController;
use App\Http\Controllers\Production\ProductionStageController;
use App\Http\Controllers\Production\MaterialRequestController;
use App\Http\Controllers\Production\SemiFinishedGoodsController;
use App\Http\Controllers\Production\QualityControlController;
use App\Http\Controllers\Production\ProductionReportController;

/*
|--------------------------------------------------------------------------
| Phân Hệ Quản Lý Sản Xuất (Production Management APIs) - Vinamilk ERP
|--------------------------------------------------------------------------
*/

Route::prefix('production')->group(function () {
    // 1. Dashboard & Reports (PR-FR32 -> PR-FR37)
    Route::get('/dashboard', [ProductionReportController::class, 'getDashboardSummary']);
    Route::get('/reports/volume', [ProductionReportController::class, 'getVolumeReport']);
    Route::get('/reports/efficiency', [ProductionReportController::class, 'getEfficiencyReport']);
    Route::get('/reports/quality', [ProductionReportController::class, 'getQualityReport']);

    // 2. Lệnh Sản Xuất (PR-FR07 -> PR-FR12)
    Route::get('/orders', [ProductionOrderController::class, 'getOrders']);
    Route::get('/orders/{id}', [ProductionOrderController::class, 'getOrderById']);
    Route::post('/orders', [ProductionOrderController::class, 'createOrder']);
    Route::put('/orders/{id}', [ProductionOrderController::class, 'updateOrder']);
    Route::delete('/orders/{id}', [ProductionOrderController::class, 'deleteOrder']);
    Route::put('/orders/{id}/approve', [ProductionOrderController::class, 'approveOrder']);
    Route::put('/orders/{id}/reject', [ProductionOrderController::class, 'rejectOrder']);
    Route::put('/orders/{id}/complete', [ProductionOrderController::class, 'completeOrder']);

    // 3. Quy Trình Công Đoạn (PR-FR18 -> PR-FR23)
    Route::get('/stages', [ProductionStageController::class, 'getStages']);
    Route::put('/stages/{id}/start', [ProductionStageController::class, 'startStage']);
    Route::put('/stages/{id}/complete', [ProductionStageController::class, 'completeStage']);
    Route::put('/stages/{id}/incident', [ProductionStageController::class, 'recordIncident']);
    Route::put('/stages/{id}/resume', [ProductionStageController::class, 'resumeStage']);
    Route::put('/stages/{id}/assign', [ProductionStageController::class, 'assignStaff']);

    // 4. Yêu Cầu & Tiêu Hao NVL (PR-FR13 -> PR-FR17)
    Route::get('/material-requests', [MaterialRequestController::class, 'getRequests']);
    Route::post('/material-requests', [MaterialRequestController::class, 'createRequest']);
    Route::get('/material-requests/availability', [MaterialRequestController::class, 'checkAvailability']);
    Route::put('/material-requests/{id}/status', [MaterialRequestController::class, 'updateStatus']);

    // 5. Bán Thành Phẩm & Tiến Độ (PR-FR24 -> PR-FR27, PR-FR32)
    Route::get('/semi-finished', [SemiFinishedGoodsController::class, 'getBTPList']);
    Route::post('/semi-finished', [SemiFinishedGoodsController::class, 'createBTP']);
    Route::get('/btp-transfers', [SemiFinishedGoodsController::class, 'getBTPTransferRequests']);
    Route::post('/btp-transfers', [SemiFinishedGoodsController::class, 'createBTPTransferRequest']);
    Route::get('/progress-logs', [SemiFinishedGoodsController::class, 'getProgressLogs']);

    // 6. Kiểm Tra Chất Lượng QC, Làm Bù & Bàn Giao (PR-FR28 -> PR-FR31)
    Route::get('/qc-reports', [QualityControlController::class, 'getQCReports']);
    Route::post('/qc-reports', [QualityControlController::class, 'createQCReport']);
    Route::get('/compensations', [QualityControlController::class, 'getCompensationOrders']);
    Route::get('/handovers', [QualityControlController::class, 'getHandovers']);
    Route::post('/handover-warehouse', [QualityControlController::class, 'handoverToWarehouse']);
});
