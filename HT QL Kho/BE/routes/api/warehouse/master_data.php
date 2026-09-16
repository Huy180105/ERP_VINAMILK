<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\MasterDataController;

/*
|--------------------------------------------------------------------------
| Module 1: Danh Mục (Master Data APIs)
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/master-data')->group(function () {
    // Nguyên Vật Liệu (CF-FR01 -> CF-FR04)
    Route::get('/materials', [MasterDataController::class, 'getMaterials']);
    Route::post('/materials', [MasterDataController::class, 'createMaterial']);
    Route::put('/materials/{id}', [MasterDataController::class, 'updateMaterial']);
    Route::delete('/materials/{id}', [MasterDataController::class, 'deleteMaterial']);
    Route::get('/material-types', [MasterDataController::class, 'getMaterialTypes']);

    // Sản Phẩm (CF-FR05)
    Route::get('/products', [MasterDataController::class, 'getProducts']);

    // Nhà Cung Cấp (CF-FR06 -> CF-FR09)
    Route::get('/suppliers', [MasterDataController::class, 'getSuppliers']);
    Route::post('/suppliers', [MasterDataController::class, 'createSupplier']);

    // Khách Hàng / Nhà Phân Phối (CF-FR10)
    Route::get('/customers', [MasterDataController::class, 'getCustomers']);

    // Nhân Viên / Thủ Kho
    Route::get('/staff', [MasterDataController::class, 'getStaff']);
});
