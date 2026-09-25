<?php

/**
 * ==============================================================================
 * MASTER TEST SUITE RUNNER - VINAMILK ENTERPRISE RESOURCE PLANNING (ERP)
 * ==============================================================================
 * Kiểm thử toàn bộ tương tác Backend với Database cho tất cả 5 phân hệ:
 *   1. Quản lý Kho & Tồn kho (Warehouse & Inventory Management)
 *   2. Bán hàng & Phân phối (Sales & Distribution)
 *   3. Quản lý Sản xuất (Production Management)
 *   4. Quản lý Thu Chi & Tài chính (Finance & Cash/Bank)
 *   5. Quản lý Nhân sự & Tiền lương (HRM & Payroll)
 * ==============================================================================
 */

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$startTime = microtime(true);

echo "\n";
echo "╔════════════════════════════════════════════════════════════════════════════════════╗\n";
echo "║             VINAMILK ERP - KIỂM THỬ TOÀN BỘ TƯƠNG TÁC BACKEND & DATABASE           ║\n";
echo "╚════════════════════════════════════════════════════════════════════════════════════╝\n";

// 1. Kiểm tra kết nối CSDL
try {
    $dbName = DB::connection()->getDatabaseName();
    $tables = collect(DB::select('SHOW TABLES'))->pluck("Tables_in_{$dbName}")->values();
    $tableCount = $tables->count();
    echo "\n [DATABASE] Đã kết nối thành công tới CSDL MySQL: `{$dbName}` ({$tableCount} bảng)\n";
} catch (\Throwable $e) {
    echo "\n [ERROR] Không thể kết nối Database: " . $e->getMessage() . "\n";
    exit(1);
}

$modules = [
    [
        'id'   => 'WAREHOUSE',
        'name' => 'Phân Hệ Quản Lý Kho & Tồn Kho (Warehouse)',
        'file' => __DIR__ . '/test_warehouse_module.php',
    ],
    [
        'id'   => 'SALES',
        'name' => 'Phân Hệ Bán Hàng & Phân Phối (Sales & Distribution)',
        'file' => __DIR__ . '/test_sales_module.php',
    ],
    [
        'id'   => 'PRODUCTION',
        'name' => 'Phân Hệ Quản Lý Sản Xuất (Production Management)',
        'file' => __DIR__ . '/test_production_module.php',
    ],
    [
        'id'   => 'FINANCE',
        'name' => 'Phân Hệ Quản Lý Thu Chi (Finance & Cash/Bank)',
        'file' => __DIR__ . '/test_finance_module.php',
    ],
    [
        'id'   => 'HR',
        'name' => 'Phân Hệ Quản Lý Nhân Sự & Tiền Lương (HRM & Payroll)',
        'file' => __DIR__ . '/test_hr_module.php',
    ],
    [
        'id'   => 'ERP_SYNC',
        'name' => 'Kiểm Thử Đồng Bộ CSDL 5 Phân Hệ Theo Chương 3 (ERP Synchronization)',
        'file' => __DIR__ . '/test_erp_synchronization.php',
    ],
];

$results = [];
$totalAllPassed = 0;
$totalAllTests = 0;
$hasFailures = false;

foreach ($modules as $mod) {
    echo "\n" . str_repeat("-", 80) . "\n";
    echo " >>> ĐANG THỰC THI: " . strtoupper($mod['name']) . " <<<\n";
    echo str_repeat("-", 80) . "\n\n";

    $modStart = microtime(true);
    
    // Execute module test script as an isolated sub-process
    $cmd = 'php "' . $mod['file'] . '"';
    $output = [];
    $returnCode = 0;
    exec($cmd, $output, $returnCode);
    
    $elapsed = round(microtime(true) - $modStart, 2);
    $outText = implode("\n", $output);
    echo $outText . "\n";

    // Extract passed & total tests from output
    $passed = 0;
    $total = 0;
    if (preg_match('/(\d+)\s*\/\s*(\d+)\s*TESTS?\s*PASSED/i', $outText, $m)) {
        $passed = (int) $m[1];
        $total  = (int) $m[2];
    } else {
        // Count [PASS] / [FAIL] occurrences
        $passed = substr_count($outText, '[PASS]');
        $fails  = substr_count($outText, '[FAIL]');
        $total  = $passed + $fails;
    }

    if ($returnCode !== 0 || $passed < $total) {
        $hasFailures = true;
    }

    $totalAllPassed += $passed;
    $totalAllTests  += $total;

    $results[] = [
        'id'       => $mod['id'],
        'name'     => $mod['name'],
        'passed'   => $passed,
        'total'    => $total,
        'rate'     => $total > 0 ? round(($passed / $total) * 100, 1) : 0,
        'time'     => $elapsed,
        'status'   => ($returnCode === 0 && $passed === $total && $total > 0) ? 'PASSED' : 'FAILED',
    ];
}

$totalExecutionTime = round(microtime(true) - $startTime, 2);

// 2. Kiểm tra tính toàn vẹn CSDL sau kiểm thử
echo "\n" . str_repeat("=", 84) . "\n";
echo " TỔNG HỢP KẾT QUẢ KIỂM THỬ TOÀN BỘ PHÂN HỆ BACKEND & DATABASE (VINAMILK ERP)\n";
echo str_repeat("=", 84) . "\n";

printf(" %-40s | %-12s | %-10s | %-8s\n", "PHÂN HỆ NGHIỆP VỤ", "KẾT QUẢ", "TỶ LỆ", "THỜI GIAN");
echo str_repeat("-", 84) . "\n";

foreach ($results as $res) {
    $statusStr = $res['status'] === 'PASSED' ? "[✓] {$res['passed']}/{$res['total']} PASS" : "[✗] {$res['passed']}/{$res['total']} FAIL";
    printf(" %-40s | %-12s | %6.1f%%   | %5.2fs\n", 
        $res['name'], 
        $statusStr, 
        $res['rate'], 
        $res['time']
    );
}

echo str_repeat("=", 84) . "\n";
$overallRate = $totalAllTests > 0 ? round(($totalAllPassed / $totalAllTests) * 100, 1) : 0;
printf(" TỔNG CỘNG: %d / %d TESTS PASSED (%.1f%%) | THỜI GIAN THỰC THI: %.2f GIÂY\n", 
    $totalAllPassed, 
    $totalAllTests, 
    $overallRate, 
    $totalExecutionTime
);

if (!$hasFailures && $totalAllPassed === $totalAllTests) {
    echo " >>> ĐÁNH GIÁ: TOÀN BỘ TƯƠNG TÁC DATABASE VÀ BUSINESS RULES ĐẠT 100% YÊU CẦU! <<<\n";
    echo str_repeat("=", 84) . "\n\n";
    exit(0);
} else {
    echo " >>> ĐÁNH GIÁ: CÓ TEST CHƯA ĐẠT. VUI LÒNG KIỂM TRA LẠI CHI TIẾT BÊN TRÊN! <<<\n";
    echo str_repeat("=", 84) . "\n\n";
    exit(1);
}

