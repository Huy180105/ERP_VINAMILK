<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\InboundController;

/*
|--------------------------------------------------------------------------
| Module 3: Nhập Kho (Inbound Management APIs)
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/inbound')->group(function () {
    // Nhập kho NVL từ NCC (CF-FR11 -> CF-FR19)
    Route::get('/raw-materials', [InboundController::class, 'getRawMaterialReceipts']);
    Route::post('/raw-materials', [InboundController::class, 'createRawMaterialReceipt']);
    Route::put('/raw-materials/{id}/approve', [InboundController::class, 'approveRawMaterialReceipt']);
    Route::put('/raw-materials/{id}/complete', [InboundController::class, 'completeRawMaterialReceipt']);

    // Nhập kho Sản phẩm từ Xưởng sản xuất (CF-FR20 -> CF-FR29)
    Route::get('/products', [InboundController::class, 'getProductReceipts']);
    Route::put('/products/{id}/complete', [InboundController::class, 'completeProductReceipt']);
});
