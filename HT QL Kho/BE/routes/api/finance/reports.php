<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Finance\ReportController;

Route::prefix('finance/reports')->group(function () {
    Route::get('/summary', [ReportController::class, 'getSummaryReport']);
    Route::get('/cash-book', [ReportController::class, 'getCashBookReport']);
    Route::get('/by-counterparty', [ReportController::class, 'getByCounterpartyReport']);
    Route::get('/reconciliation', [ReportController::class, 'getReconciliationReport']);
});
