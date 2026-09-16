<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\SalesController;

/*
|--------------------------------------------------------------------------
| Module 6: Bán Hàng (Sales & Distribution APIs)
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/sales')->group(function () {
    Route::get('/dashboard', [SalesController::class, 'dashboard']);
    Route::get('/orders', [SalesController::class, 'orders']);
    Route::post('/orders', [SalesController::class, 'createOrder']);
    Route::put('/orders/{id}', [SalesController::class, 'updateOrder']);
    Route::delete('/orders/{id}', [SalesController::class, 'deleteOrder']);
    Route::put('/orders/{id}/status', [SalesController::class, 'updateOrderStatus']);
    Route::get('/customers', [SalesController::class, 'customers']);
    Route::get('/deliveries', [SalesController::class, 'deliveries']);
    Route::get('/invoices', [SalesController::class, 'invoices']);
    Route::get('/receivables', [SalesController::class, 'receivables']);
});
