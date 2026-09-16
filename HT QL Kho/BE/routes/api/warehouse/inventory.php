<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\InventoryController;

/*
|--------------------------------------------------------------------------
| Module 2: Quản Lý Tồn Kho & Vị Trí (Inventory & Lots APIs)
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/inventory')->group(function () {
    // Tra cứu & lọc tồn kho (CF-FR51, CF-FR52)
    Route::get('/', [InventoryController::class, 'getInventory']);

    // Thuật toán Gợi ý FEFO (First Expired, First Out) (CF-FR46)
    Route::get('/fefo-suggestions', [InventoryController::class, 'getFefoSuggestions']);

    // Cảnh báo lô hàng sắp hết hạn (CF-FR53, CF-FR54)
    Route::get('/alerts/near-expiry', [InventoryController::class, 'getNearExpiryAlerts']);

    // Cảnh báo tồn kho dưới mức tối thiểu (CF-FR55)
    Route::get('/alerts/low-stock', [InventoryController::class, 'getLowStockAlerts']);

    // Vị trí khu vực kho
    Route::get('/locations/products', [InventoryController::class, 'getProductLocations']);
    Route::get('/locations/materials', [InventoryController::class, 'getMaterialLocations']);
});
