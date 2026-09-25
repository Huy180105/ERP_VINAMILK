<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HR\EmployeeController;
use App\Http\Controllers\HR\DepartmentPositionController;
use App\Http\Controllers\HR\ContractController;
use App\Http\Controllers\HR\TimesheetController;
use App\Http\Controllers\HR\PayrollController;
use App\Http\Controllers\HR\AccountController;
use App\Http\Controllers\HR\HRReportController;

/*
|--------------------------------------------------------------------------
| API Routes - Phân Hệ Quản Lý Nhân Sự & Tiền Lương (HRM & Payroll)
| Các chức năng HR-FR01 -> HR-FR24, Quy tắc HR-BR01 -> HR-BR12
|--------------------------------------------------------------------------
*/

Route::prefix('hr')->group(function () {
    // 0. Dashboard & Báo cáo thống kê
    Route::get('/dashboard', [HRReportController::class, 'getDashboardSummary']);
    Route::get('/reports/staff', [HRReportController::class, 'getStaffReport']);
    Route::get('/reports/payroll', [HRReportController::class, 'getPayrollFundReport']);

    // 1. Hồ sơ nhân viên (HR-FR01 -> HR-FR04)
    Route::get('/employees', [EmployeeController::class, 'getEmployees']);
    Route::get('/employees/{id}', [EmployeeController::class, 'getEmployeeDetail']);
    Route::post('/employees', [EmployeeController::class, 'createEmployee']);
    Route::put('/employees/{id}', [EmployeeController::class, 'updateEmployee']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'deleteEmployee']);

    // 2. Phòng ban & Chức vụ (HR-FR05 -> HR-FR08)
    Route::get('/departments', [DepartmentPositionController::class, 'getDepartments']);
    Route::get('/departments/{id}', [DepartmentPositionController::class, 'getDepartmentDetail']);
    Route::post('/departments', [DepartmentPositionController::class, 'createDepartment']);
    Route::put('/departments/{id}', [DepartmentPositionController::class, 'updateDepartment']);
    Route::delete('/departments/{id}', [DepartmentPositionController::class, 'deleteDepartment']);

    Route::get('/positions', [DepartmentPositionController::class, 'getPositions']);
    Route::get('/positions/{id}', [DepartmentPositionController::class, 'getPositionDetail']);
    Route::post('/positions', [DepartmentPositionController::class, 'createPosition']);
    Route::put('/positions/{id}', [DepartmentPositionController::class, 'updatePosition']);
    Route::delete('/positions/{id}', [DepartmentPositionController::class, 'deletePosition']);

    // 3. Hợp đồng lao động (HR-FR09 -> HR-FR12)
    Route::get('/contracts', [ContractController::class, 'getContracts']);
    Route::get('/contracts/{id}', [ContractController::class, 'getContractDetail']);
    Route::post('/contracts', [ContractController::class, 'createContract']);
    Route::put('/contracts/{id}', [ContractController::class, 'updateContract']);
    Route::delete('/contracts/{id}', [ContractController::class, 'deleteContract']);

    // 4. Chấm công & Phép / Tăng ca (HR-FR13 -> HR-FR16)
    Route::get('/timesheets', [TimesheetController::class, 'getTimesheets']);
    Route::post('/timesheets', [TimesheetController::class, 'recordTimesheet']);
    Route::put('/timesheets/{id}', [TimesheetController::class, 'updateTimesheet']);
    Route::post('/timesheets/lock', [TimesheetController::class, 'lockTimesheets']);

    // 5. Tính lương & Báo cáo chi trả (HR-FR17, HR-FR18, HR-FR20)
    Route::get('/payroll', [PayrollController::class, 'getPayrolls']);
    Route::post('/payroll/calculate', [PayrollController::class, 'calculateMonthlyPayroll']);
    Route::put('/payroll/{id}', [PayrollController::class, 'updatePayroll']);
    Route::post('/payroll/lock', [PayrollController::class, 'lockPayroll']);
    Route::post('/payroll/unlock', [PayrollController::class, 'unlockPayroll']);
    Route::get('/payroll/export', [PayrollController::class, 'exportPayroll']);

    // 6. Tài khoản & Phân quyền đăng nhập (HR-FR21 -> HR-FR24)
    Route::get('/accounts', [AccountController::class, 'getAccounts']);
    Route::post('/auth/login', [AccountController::class, 'login']);
    Route::post('/auth/change-password', [AccountController::class, 'changePassword']);
    Route::put('/accounts/{id}/toggle-lock', [AccountController::class, 'toggleLock']);
    Route::put('/accounts/{id}/assign-role', [AccountController::class, 'assignRole']);
});

