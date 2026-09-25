<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Finance\PhieuChiController;

Route::prefix('finance/payments')->group(function () {
    // Chứng từ chờ chi từ Kho (PhieuNhapNVL) và Nhân sự (BangLuong)
    Route::get('/pending-purchases', [PhieuChiController::class, 'getPendingPurchasePayments']);
    Route::get('/pending-payrolls', [PhieuChiController::class, 'getPendingPayrollPayments']);

    Route::get('/', [PhieuChiController::class, 'getPayments']);
    Route::get('/{id}', [PhieuChiController::class, 'getPayment']);
    Route::post('/', [PhieuChiController::class, 'createPayment'])->middleware('finance.role:KeToanThanhToan,KeToanTruong,Admin');
    Route::put('/{id}', [PhieuChiController::class, 'updatePayment'])->middleware('finance.role:KeToanThanhToan,KeToanTruong,Admin');
    Route::put('/{id}/approve', [PhieuChiController::class, 'approvePayment'])->middleware('finance.role:KeToanTruong,Admin');
    Route::put('/{id}/cancel', [PhieuChiController::class, 'cancelPayment'])->middleware('finance.role:KeToanTruong,Admin');
    Route::put('/{id}/reconcile', [PhieuChiController::class, 'sendToReconcile'])->middleware('finance.role:KeToanTruong,Admin');
    Route::put('/{id}/reconcile/complete', [PhieuChiController::class, 'completeReconciliation'])->middleware('finance.role:KeToanTruong,Admin');
    Route::delete('/{id}', [PhieuChiController::class, 'deletePayment'])->middleware('finance.role:KeToanThanhToan,KeToanTruong,Admin');
});
