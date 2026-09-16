<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Finance\PhieuThuController;

Route::prefix('finance/receipts')->group(function () {
    // Chứng từ chờ thu từ Bán hàng (ThanhToan / CongNo)
    Route::get('/pending-sales', [PhieuThuController::class, 'getPendingSalesReceipts']);

    Route::get('/', [PhieuThuController::class, 'getReceipts']);
    Route::get('/{id}', [PhieuThuController::class, 'getReceipt']);
    Route::post('/', [PhieuThuController::class, 'createReceipt']);
    Route::put('/{id}/approve', [PhieuThuController::class, 'approveReceipt']);
    Route::put('/{id}/cancel', [PhieuThuController::class, 'cancelReceipt']);
    Route::put('/{id}/reconcile', [PhieuThuController::class, 'sendToReconcile']);
    Route::delete('/{id}', [PhieuThuController::class, 'deleteReceipt']);
});
