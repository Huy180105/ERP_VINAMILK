<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\OutboundController;

/*
|--------------------------------------------------------------------------
| Module 4: Xuất Kho (Outbound Management APIs)
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/outbound')->group(function () {
    // Xuất kho NVL cấp phát cho Sản xuất (CF-FR30 -> CF-FR40)
    Route::get('/raw-materials/pending-requests', [OutboundController::class, 'getPendingMaterialRequests']);
    Route::get('/raw-materials', [OutboundController::class, 'getRawMaterialDispatches']);
    Route::post('/raw-materials', [OutboundController::class, 'createRawMaterialDispatch']);
    Route::put('/raw-materials/{id}/approve', [OutboundController::class, 'approveRawMaterialDispatch']);
    Route::put('/raw-materials/{id}/reject', [OutboundController::class, 'rejectRawMaterialDispatch']);
    Route::put('/raw-materials/{id}/complete', [OutboundController::class, 'completeRawMaterialDispatch']);

    // Xuất kho Sản phẩm giao cho Khách hàng/Đại lý (CF-FR41 -> CF-FR50)
    Route::get('/products', [OutboundController::class, 'getProductDispatches']);
    Route::put('/products/{id}/approve', [OutboundController::class, 'approveProductDispatch']);
    Route::put('/products/{id}/reject', [OutboundController::class, 'rejectProductDispatch']);
    Route::put('/products/{id}/complete', [OutboundController::class, 'completeProductDispatch']);
});
