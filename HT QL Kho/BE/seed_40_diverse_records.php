<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Database\Seeders\DiverseDataSeeder;

echo "=======================================================================\n";
echo " TIẾN HÀNH NẠP BỔ SUNG 44 DỮ LIỆU ERP MỚI ĐA DẠNG (VINAMILK)\n";
echo "=======================================================================\n\n";

try {
    $seeder = new DiverseDataSeeder();
    $seeder->run();
    echo "\n>>> HOÀN THÀNH: ĐÃ NẠP BỔ SUNG THÀNH CÔNG 44 DỮ LIỆU ERP MỚI! <<<\n";
} catch (\Exception $e) {
    echo "[ERROR] Lỗi khi nạp dữ liệu: " . $e->getMessage() . "\n";
}
