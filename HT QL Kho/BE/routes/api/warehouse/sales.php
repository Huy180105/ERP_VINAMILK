<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Warehouse\SalesController;

/*
|--------------------------------------------------------------------------
| Module 6: Bán Hàng & Phân Phối (Sales & Distribution - Vinamilk ERP)
| Tuân thủ đặc tả kỹ thuật: SA-FR01 -> SA-FR06 & SA-BR01 -> SA-BR05
|--------------------------------------------------------------------------
*/

Route::prefix('warehouse/sales')->group(function () {
    // 1. Dashboard tổng quan
    Route::get('/dashboard', [SalesController::class, 'dashboard']);

    // 2. Kiểm tra tồn kho thời gian thực
    Route::get('/check-stock', [SalesController::class, 'checkStock']);

    // 3. Quản lý Đơn hàng (SA-FR02)
    Route::get('/orders', [SalesController::class, 'orders']);
    Route::get('/orders/{id}', [SalesController::class, 'orderDetail']);
    Route::post('/orders', [SalesController::class, 'createOrder']);
    Route::put('/orders/{id}', [SalesController::class, 'updateOrder']);
    Route::delete('/orders/{id}', [SalesController::class, 'deleteOrder']);
    Route::put('/orders/{id}/status', [SalesController::class, 'updateOrderStatus']);

    // 4. Quản lý Khách hàng / NPP (SA-FR01)
    Route::get('/customers', [SalesController::class, 'customers']);
    Route::get('/customers/{id}', [SalesController::class, 'customerDetail']);
    Route::post('/customers', [SalesController::class, 'storeCustomer']);
    Route::put('/customers/{id}', [SalesController::class, 'updateCustomer']);
    Route::delete('/customers/{id}', [SalesController::class, 'deleteCustomer']);

    // 5. Quản lý Giao hàng (SA-FR04)
    Route::get('/deliveries', [SalesController::class, 'deliveries']);
    Route::get('/deliveries/{id}', [SalesController::class, 'deliveryDetail']);
    Route::post('/deliveries', [SalesController::class, 'storeDelivery']);
    Route::put('/deliveries/{id}/status', [SalesController::class, 'updateDeliveryStatus']);

    // 6. Quản lý Hóa đơn & Thanh toán (SA-FR03)
    Route::get('/invoices', [SalesController::class, 'invoices']);
    Route::get('/invoices/{id}', [SalesController::class, 'invoiceDetail']);
    Route::post('/invoices', [SalesController::class, 'storeInvoice']);
    Route::post('/payments', [SalesController::class, 'recordPayment']);

    // 7. Quản lý Công nợ (SA-FR05)
    Route::get('/receivables', [SalesController::class, 'receivables']);
    Route::get('/receivables/{id}', [SalesController::class, 'receivableDetail']);

    // 8. Quản lý Bảng giá sản phẩm (SA-FR06)
    Route::get('/pricing', [SalesController::class, 'pricing']);
    Route::put('/pricing/{id}', [SalesController::class, 'updatePrice']);
});
