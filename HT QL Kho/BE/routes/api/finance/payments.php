<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Finance\PhieuChiController;

Route::prefix('finance/payments')->group(function () {
    // Chứng từ chờ chi từ Kho (PhieuNhapNVL) và Nhân sự (BangLuong)
    Route::get('/pending-purchases', [PhieuChiController::class, 'getPendingPurchasePayments']);
    Route::get('/pending-payrolls', [PhieuChiController::class, 'getPendingPayrollPayments']);

    Route::get('/', [PhieuChiController::class, 'getPayments']);
    Route::get('/{id}', [PhieuChiController::class, 'getPayment']);
    Route::post('/', [PhieuChiController::class, 'createPayment']);
    Route::put('/{id}/approve', [PhieuChiController::class, 'approvePayment']);
    Route::put('/{id}/cancel', [PhieuChiController::class, 'cancelPayment']);
    Route::put('/{id}/reconcile', [PhieuChiController::class, 'sendToReconcile']);
    Route::delete('/{id}', [PhieuChiController::class, 'deletePayment']);
});
