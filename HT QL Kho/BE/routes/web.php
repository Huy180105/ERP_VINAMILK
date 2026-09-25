<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'system' => 'Hệ Thống Quản Lý Kho Vinamilk ERP Backend API',
        'status' => 'Online',
        'version' => '1.0.0',
        'endpoints' => [
          'master_data' => 'http://127.0.0.1:8000/api/warehouse/master-data/materials',
          'inventory' => 'http://127.0.0.1:8000/api/warehouse/inventory',
          'fefo_suggestions' => 'http://127.0.0.1:8000/api/warehouse/inventory/fefo-suggestions',
          'inbound' => 'http://127.0.0.1:8000/api/warehouse/inbound/raw-materials',
          'outbound' => 'http://127.0.0.1:8000/api/warehouse/outbound/raw-materials',
          'reports' => 'http://127.0.0.1:8000/api/warehouse/reports/summary',
        ]
    ]);
});
