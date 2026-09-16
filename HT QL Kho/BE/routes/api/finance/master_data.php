<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Finance\MasterDataController;

Route::prefix('finance/master-data')->group(function () {
    // Nguồn đối tượng từ các phân hệ khác (KhachHang, NhaCungCap, NhanVien)
    Route::get('/source-entities', [MasterDataController::class, 'getAvailableSourceEntities']);

    // 1. Danh mục khoản thu
    Route::get('/revenue-categories', [MasterDataController::class, 'getRevCategories']);
    Route::post('/revenue-categories', [MasterDataController::class, 'createRevCategory']);
    Route::put('/revenue-categories/{id}', [MasterDataController::class, 'updateRevCategory']);
    Route::delete('/revenue-categories/{id}', [MasterDataController::class, 'deleteRevCategory']);

    // 2. Danh mục khoản chi
    Route::get('/expense-categories', [MasterDataController::class, 'getExpCategories']);
    Route::post('/expense-categories', [MasterDataController::class, 'createExpCategory']);
    Route::put('/expense-categories/{id}', [MasterDataController::class, 'updateExpCategory']);
    Route::delete('/expense-categories/{id}', [MasterDataController::class, 'deleteExpCategory']);

    // 3. Đối tượng giao dịch (Ánh xạ mapping)
    Route::get('/counterparties', [MasterDataController::class, 'getCounterparties']);
    Route::post('/counterparties', [MasterDataController::class, 'createCounterparty']);
    Route::put('/counterparties/{id}', [MasterDataController::class, 'updateCounterparty']);
    Route::put('/counterparties/{id}/toggle-status', [MasterDataController::class, 'toggleStatusCounterparty']);
    Route::delete('/counterparties/{id}', [MasterDataController::class, 'deleteCounterparty']);

    // 4. Tài khoản quỹ / Ngân hàng
    Route::get('/accounts', [MasterDataController::class, 'getAccounts']);
    Route::post('/accounts', [MasterDataController::class, 'createAccount']);
    Route::put('/accounts/{id}', [MasterDataController::class, 'updateAccount']);
    Route::delete('/accounts/{id}', [MasterDataController::class, 'deleteAccount']);
});
