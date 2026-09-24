<?php

use App\Http\Controllers\Warehouse\SalesAuthController;
use App\Http\Controllers\Warehouse\SalesController;
use App\Http\Middleware\SalesAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Module 6: Bán Hàng (Sales & Distribution APIs)
|--------------------------------------------------------------------------
*/

Route::post('warehouse/sales/login', [SalesAuthController::class, 'login'])->middleware('throttle:10,1');

Route::prefix('warehouse/sales')->middleware(SalesAccess::class)->group(function () {
    Route::get('/me', fn (Request $request) => response()->json(['data' => $request->user()]));
    Route::post('/logout', [SalesAuthController::class, 'logout']);
    Route::get('/options', [SalesController::class, 'options']);
    Route::get('/inventory', [SalesController::class, 'inventory']);
    Route::get('/check-stock', [SalesController::class, 'checkStock']);
    Route::put('/inventory/{id}', [SalesController::class, 'assignLot']);
    Route::get('/dashboard', [SalesController::class, 'dashboard']);
    Route::get('/orders', [SalesController::class, 'orders']);
    Route::get('/orders/{id}', [SalesController::class, 'orderDetail']);
    Route::post('/orders', [SalesController::class, 'createOrder']);
    Route::put('/orders/{id}', [SalesController::class, 'updateOrder']);
    Route::delete('/orders/{id}', [SalesController::class, 'deleteOrder']);
    Route::put('/orders/{id}/status', [SalesController::class, 'updateOrderStatus']);
    Route::get('/customers', [SalesController::class, 'customers']);
    Route::get('/customers/{id}', [SalesController::class, 'customerDetail']);
    Route::post('/customers', [SalesController::class, 'saveCustomer']);
    Route::put('/customers/{id}', [SalesController::class, 'saveCustomer']);
    Route::delete('/customers/{id}', [SalesController::class, 'deleteCustomer']);
    Route::put('/dispatches/{id}/complete', [SalesController::class, 'completeDispatch']);
    Route::get('/deliveries', [SalesController::class, 'deliveries']);
    Route::get('/deliveries/{id}', [SalesController::class, 'deliveryDetail']);
    Route::post('/deliveries', [SalesController::class, 'createDelivery']);
    Route::put('/deliveries/{id}/status', [SalesController::class, 'updateDeliveryStatus']);
    Route::get('/invoices', [SalesController::class, 'invoices']);
    Route::post('/invoices', [SalesController::class, 'createInvoice']);
    Route::get('/invoices/{id}', [SalesController::class, 'invoiceDetail']);
    Route::get('/receivables', [SalesController::class, 'receivables']);
    Route::get('/receivables/{id}', [SalesController::class, 'receivableDetail']);
    Route::put('/receivables/{id}', [SalesController::class, 'updateReceivable']);
    Route::get('/payments', [SalesController::class, 'payments']);
    Route::post('/payments', [SalesController::class, 'createPayment']);
    Route::put('/payments/{id}', [SalesController::class, 'reconcilePayment']);
    Route::get('/prices', [SalesController::class, 'prices']);
    Route::put('/prices/{id}', [SalesController::class, 'savePrice']);
    Route::delete('/prices/{id}', [SalesController::class, 'deletePrice']);
});
