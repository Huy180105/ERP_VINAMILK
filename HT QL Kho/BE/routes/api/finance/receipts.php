<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Finance\PhieuThuController;

Route::prefix('finance/receipts')->group(function () {
    // Chứng từ chờ thu từ Bán hàng (ThanhToan / CongNo)
    Route::get('/pending-sales', [PhieuThuController::class, 'getPendingSalesReceipts']);

    Route::get('/', [PhieuThuController::class, 'getReceipts']);
    Route::get('/{id}', [PhieuThuController::class, 'getReceipt']);
    Route::post('/', [PhieuThuController::class, 'createReceipt'])->middleware('finance.role:KeToanThanhToan,KeToanTruong,Admin');
    Route::put('/{id}', [PhieuThuController::class, 'updateReceipt'])->middleware('finance.role:KeToanThanhToan,KeToanTruong,Admin');
    Route::put('/{id}/approve', [PhieuThuController::class, 'approveReceipt'])->middleware('finance.role:KeToanTruong,Admin');
    Route::put('/{id}/cancel', [PhieuThuController::class, 'cancelReceipt'])->middleware('finance.role:KeToanTruong,Admin');
    Route::put('/{id}/reconcile', [PhieuThuController::class, 'sendToReconcile'])->middleware('finance.role:KeToanTruong,Admin');
    Route::put('/{id}/reconcile/complete', [PhieuThuController::class, 'completeReconciliation'])->middleware('finance.role:KeToanTruong,Admin');
    Route::delete('/{id}', [PhieuThuController::class, 'deleteReceipt'])->middleware('finance.role:KeToanThanhToan,KeToanTruong,Admin');
});
