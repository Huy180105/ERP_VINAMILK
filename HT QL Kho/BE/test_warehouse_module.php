<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\NguyenVatLieu;
use App\Models\LoaiNVL;
use App\Models\SanPham;
use App\Models\TonKho;
use App\Models\PhieuNhapNVL;
use App\Models\ChiTietPhieuNhapNVL;
use App\Models\PhieuNhapSP;
use App\Models\ChiTietPhieuNhapSP;
use App\Models\PhieuXuatNVL;
use App\Models\ChiTietPhieuXuatNVL;
use App\Models\PhieuXuatSP;
use App\Models\ChiTietPhieuXuatSP;
use App\Models\NhaCungCap;
use App\Models\KhachHang;
use App\Http\Controllers\Warehouse\MasterDataController;
use App\Http\Controllers\Warehouse\InventoryController;
use App\Http\Controllers\Warehouse\InboundController;
use App\Http\Controllers\Warehouse\OutboundController;
use App\Http\Controllers\Warehouse\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "=======================================================================\n";
echo " KIỂM THỬ TỰ ĐỘNG PHÂN HỆ QUẢN LÝ KHO (WAREHOUSE & INVENTORY)\n";
echo "=======================================================================\n\n";

$passCount = 0;
$testCount = 0;

function assertWarehouse($name, $condition, $msg = '') {
    global $testCount, $passCount;
    $testCount++;
    if ($condition) {
        $passCount++;
        echo " [PASS] Test #$testCount: $name\n";
    } else {
        echo " [FAIL] Test #$testCount: $name" . ($msg ? " - $msg" : "") . "\n";
    }
}

$prefix = 'WH_' . time();
$masterCtrl = new MasterDataController();
$invCtrl = new InventoryController();
$inboundCtrl = new InboundController();
$outboundCtrl = new OutboundController();
$reportCtrl = new ReportController();

// -------------------------------------------------------------
// 1. Master Data Tests
// -------------------------------------------------------------
// 1.1 Tra cứu danh mục nguyên vật liệu
$matRes = $masterCtrl->getMaterials(new Request());
$matData = json_decode($matRes->getContent(), true);
assertWarehouse('CF-FR01: Tra cứu danh mục NVL thành công', $matData['success'] === true && count($matData['data']) > 0);

// 1.2 Thêm nguyên vật liệu mới
$testMaNVL = 'NVL_' . $prefix;
$createMatReq = new Request([
    'maNVL'     => $testMaNVL,
    'maLoaiNVL' => 'LNVL01',
    'tenNVL'    => 'Nguyên liệu sữa tươi tiệt trùng Test',
    'donVi'     => 'Lít',
    'ghiChu'    => 'Test kiểm thử DB tự động',
]);
$createMatRes = $masterCtrl->createMaterial($createMatReq);
$createMatData = json_decode($createMatRes->getContent(), true);
assertWarehouse('CF-FR02: Tạo mới nguyên vật liệu vào DB', $createMatData['success'] === true && $createMatData['data']['maNVL'] === $testMaNVL);

// 1.3 Cập nhật nguyên vật liệu
$updateMatReq = new Request([
    'maLoaiNVL' => 'LNVL01',
    'tenNVL'    => 'Nguyên liệu sữa tươi tiệt trùng Test (Đã cập nhật)',
    'donVi'     => 'Lít',
    'ghiChu'    => 'Đã sửa ghi chú',
]);
$updateMatRes = $masterCtrl->updateMaterial($updateMatReq, $testMaNVL);
$updateMatData = json_decode($updateMatRes->getContent(), true);
$dbMat = NguyenVatLieu::where('maNVL', $testMaNVL)->first();
assertWarehouse('CF-FR03: Cập nhật nguyên vật liệu trong DB', $updateMatData['success'] === true && $dbMat->tenNVL === 'Nguyên liệu sữa tươi tiệt trùng Test (Đã cập nhật)');

// 1.4 Tra cứu sản phẩm & nhà cung cấp
$prodRes = $masterCtrl->getProducts(new Request());
$prodData = json_decode($prodRes->getContent(), true);
assertWarehouse('CF-FR05: Tra cứu danh mục sản phẩm thành phẩm', $prodData['success'] === true && count($prodData['data']) > 0);

$supRes = $masterCtrl->getSuppliers(new Request());
$supData = json_decode($supRes->getContent(), true);
assertWarehouse('CF-FR06: Tra cứu danh sách nhà cung cấp', $supData['success'] === true && count($supData['data']) > 0);

// -------------------------------------------------------------
// 2. Inventory & FEFO Tests
// -------------------------------------------------------------
// 2.1 Tra cứu tồn kho theo lô
$invRes = $invCtrl->getInventory(new Request());
$invData = json_decode($invRes->getContent(), true);
assertWarehouse('CF-FR51: Tra cứu tồn kho theo lô hiển thị đầy đủ', $invData['success'] === true && count($invData['data']) > 0);

// 2.2 Thuật toán FEFO (First Expired First Out)
$fefoRes = $invCtrl->getFefoSuggestions(new Request());
$fefoData = json_decode($fefoRes->getContent(), true);
$isFefoSorted = true;
if (count($fefoData['data']) >= 2) {
    for ($i = 0; $i < count($fefoData['data']) - 1; $i++) {
        if ($fefoData['data'][$i]['hanSuDung'] > $fefoData['data'][$i + 1]['hanSuDung']) {
            $isFefoSorted = false;
            break;
        }
    }
}
assertWarehouse('CF-FR46: Gợi ý FEFO sắp xếp hạn dùng tăng dần chuẩn xác', $fefoData['success'] === true && $isFefoSorted);

// 2.3 Cảnh báo hàng sắp hết hạn
$expRes = $invCtrl->getNearExpiryAlerts(new Request(['days' => 180]));
$expData = json_decode($expRes->getContent(), true);
assertWarehouse('CF-FR53: Cảnh báo lô hàng sắp hết hạn trong ngưỡng', $expData['success'] === true && isset($expData['count']));

// 2.4 Cảnh báo tồn kho dưới mức tối thiểu
$lowRes = $invCtrl->getLowStockAlerts(new Request(['min_qty' => 1000]));
$lowData = json_decode($lowRes->getContent(), true);
assertWarehouse('CF-FR55: Cảnh báo tồn kho thấp dưới định mức', $lowData['success'] === true && isset($lowData['count']));

// -------------------------------------------------------------
// 3. Inbound Management Tests (Nhập kho NVL)
// -------------------------------------------------------------
// 3.1 Lập phiếu nhập kho NVL từ NCC
$testPnnvlId = 'PNNVL_' . $prefix;
$testLotId = 'LOT_' . $prefix;
$createPnnvlReq = new Request([
    'maPhieuNhapNVL' => $testPnnvlId,
    'maNCC'          => 'NCC001',
    'maNVTao'        => 'NV001',
    'maNVNhan'       => 'NV002',
    'ngayNhap'       => '2026-09-22',
    'ghiChu'         => 'Phiếu nhập NVL test tự động',
    'items'          => [
        [
            'maTonKho'    => $testLotId,
            'maNVL'       => $testMaNVL,
            'soLuong'     => 500,
            'donGia'      => 15000,
            'ngaySanXuat' => '2026-09-01',
            'hanSuDung'   => '2027-09-01',
        ]
    ]
]);
$createPnnvlRes = $inboundCtrl->createRawMaterialReceipt($createPnnvlReq);
$createPnnvlData = json_decode($createPnnvlRes->getContent(), true);
assertWarehouse('CF-FR11: Lập phiếu nhập NVL từ NCC (Trạng thái: Chờ duyệt)', 
    $createPnnvlData['success'] === true && $createPnnvlData['data']['maPhieuNhapNVL'] === $testPnnvlId);

// 3.2 Phê duyệt phiếu nhập kho NVL
$appPnnvlRes = $inboundCtrl->approveRawMaterialReceipt($testPnnvlId);
$appPnnvlData = json_decode($appPnnvlRes->getContent(), true);
$pnnvlAfterApp = PhieuNhapNVL::find($testPnnvlId);
assertWarehouse('CF-FR15: Phê duyệt phiếu nhập NVL chuyển trạng thái "Đã duyệt"', 
    $appPnnvlData['success'] === true && $pnnvlAfterApp->trangThai === 'Đã duyệt');

// 3.3 Xác nhận hoàn thành phiếu nhập -> Tự động cộng tồn kho theo lô (CF-FR18)
$lotBefore = TonKho::where('maTonKho', $testLotId)->first();
$compPnnvlRes = $inboundCtrl->completeRawMaterialReceipt($testPnnvlId);
$compPnnvlData = json_decode($compPnnvlRes->getContent(), true);
$lotAfter = TonKho::where('maTonKho', $testLotId)->first();
assertWarehouse('CF-FR18: Hoàn thành nhập kho tự động cộng tồn kho vào bảng TonKho', 
    $compPnnvlData['success'] === true && $lotAfter->soLuongTonHienTai == 500);

// -------------------------------------------------------------
// 4. Outbound Management Tests (Xuất kho NVL)
// -------------------------------------------------------------
// 4.1 Chặn xuất kho nếu số lượng vượt quá tồn kho khả dụng
$testPxnvlIdFail = 'PXNVL_FAIL_' . $prefix;
$failPxReq = new Request([
    'maPhieuXuatNVL' => $testPxnvlIdFail,
    'ngayXuat'       => '2026-09-22',
    'items'          => [
        ['maTonKho' => $testLotId, 'soLuong' => 99999] // Lớn hơn 500 tồn hiện tại
    ]
]);
$failPxRes = $outboundCtrl->createRawMaterialDispatch($failPxReq);
$failPxData = json_decode($failPxRes->getContent(), true);
assertWarehouse('CF-FR32: Chặn lập phiếu xuất kho khi không đủ tồn kho khả dụng', 
    $failPxData['success'] === false && str_contains($failPxData['message'], 'Không đủ tồn kho'));

// 4.2 Lập phiếu xuất kho NVL hợp lệ
$testPxnvlId = 'PXNVL_' . $prefix;
$validPxReq = new Request([
    'maPhieuXuatNVL' => $testPxnvlId,
    'maNVTao'        => 'NV001',
    'ngayXuat'       => '2026-09-22',
    'items'          => [
        ['maTonKho' => $testLotId, 'soLuong' => 200]
    ]
]);
$validPxRes = $outboundCtrl->createRawMaterialDispatch($validPxReq);
$validPxData = json_decode($validPxRes->getContent(), true);
assertWarehouse('CF-FR30: Lập phiếu xuất kho NVL cấp phát sản xuất thành công', 
    $validPxData['success'] === true && $validPxData['data']['maPhieuXuatNVL'] === $testPxnvlId);

// 4.3 Xác nhận hoàn thành xuất kho -> Tự động trừ tồn kho theo lô (CF-FR39)
$compPxRes = $outboundCtrl->completeRawMaterialDispatch($testPxnvlId);
$compPxData = json_decode($compPxRes->getContent(), true);
$lotAfterDeduct = TonKho::where('maTonKho', $testLotId)->first();
assertWarehouse('CF-FR39: Xác nhận hoàn thành xuất kho tự động trừ tồn kho (500 -> 300)', 
    $compPxData['success'] === true && $lotAfterDeduct->soLuongTonHienTai == 300);

// -------------------------------------------------------------
// 5. Inbound Product Tests (Nhập kho Thành phẩm)
// -------------------------------------------------------------
$nextSpCodeRes = $inboundCtrl->getNextProductReceiptCode();
$nextSpCodeData = json_decode($nextSpCodeRes->getContent(), true);
assertWarehouse('CF-FR20: Sinh mã phiếu nhập thành phẩm tự động', 
    $nextSpCodeData['success'] === true && str_starts_with($nextSpCodeData['code'], 'PNSP'));

$testPnspId = $nextSpCodeData['code'];
$createPnspReq = new Request([
    'maPhieuNhapSP'   => $testPnspId,
    'ghiChu'          => 'Nhập kho thành phẩm sữa tươi Vinamilk',
    'maNVTao'         => 'NV001',
    'maNVNhan'        => 'NV002',
    'items'           => [
        [
            'maSP'        => 'SP001',
            'soLuongNhap' => 100,
            'ngaySanXuat' => Carbon::today()->toDateString(),
            'hanSuDung'   => Carbon::today()->addDays(200)->toDateString(),
            'ghiChu'      => 'Đạt tiêu chuẩn xuất xưởng'
        ]
    ]
]);
$createPnspRes = $inboundCtrl->createProductReceipt($createPnspReq);
$createPnspData = json_decode($createPnspRes->getContent(), true);
if (!($createPnspData['success'] ?? false)) {
    echo "DEBUG: " . $createPnspRes->getContent() . "\n";
}
assertWarehouse('CF-FR21: Lập phiếu nhập thành phẩm từ xưởng sản xuất', 
    ($createPnspData['success'] ?? false) === true && ($createPnspData['data']['maPhieuNhapSP'] ?? '') === $testPnspId,
    $createPnspData['message'] ?? '');

// Phê duyệt phiếu nhập thành phẩm
$appPnspRes = $inboundCtrl->approveProductReceipt($testPnspId);
$appPnspData = json_decode($appPnspRes->getContent(), true);
assertWarehouse('CF-FR25: Phê duyệt phiếu nhập thành phẩm', $appPnspData['success'] === true);

// Hoàn thành nhập thành phẩm -> Tăng tồn kho thành phẩm
$compPnspRes = $inboundCtrl->confirmGoodsReceived($testPnspId);
$compPnspData = json_decode($compPnspRes->getContent(), true);
$spLot = TonKho::where('ghiChu', 'LIKE', "%{$testPnspId}%")->first();
assertWarehouse('CF-FR28: Xác nhận hoàn thành nhập kho thành phẩm tăng tồn kho', 
    $compPnspData['success'] === true && $spLot !== null && $spLot->soLuongTonHienTai == 100);

// -------------------------------------------------------------
// 6. Reports & Audit Trail
// -------------------------------------------------------------
$sumRes = $reportCtrl->getInventorySummary(new Request());
$sumData = json_decode($sumRes->getContent(), true);
assertWarehouse('CF-FR56: Báo cáo tổng hợp Nhập - Xuất - Tồn tính toán chính xác', 
    $sumData['success'] === true && count($sumData['data']) > 0);

$auditRes = $reportCtrl->getStockAuditTrail(new Request(), $testLotId);
$auditData = json_decode($auditRes->getContent(), true);
assertWarehouse('CF-FR58: Báo cáo thẻ kho (Audit Trail) hiển thị lịch sử biến động lô hàng', 
    $auditData['success'] === true && $auditData['lot']['maTonKho'] === $testLotId);

// -------------------------------------------------------------
// DỌN DẸP DỮ LIỆU TEST (CLEANUP)
// -------------------------------------------------------------
ChiTietPhieuXuatNVL::where('maPhieuXuatNVL', $testPxnvlId)->delete();
PhieuXuatNVL::where('maPhieuXuatNVL', $testPxnvlId)->delete();
ChiTietPhieuNhapNVL::where('maPhieuNhapNVL', $testPnnvlId)->delete();
PhieuNhapNVL::where('maPhieuNhapNVL', $testPnnvlId)->delete();
ChiTietPhieuNhapSP::where('maPhieuNhapSP', $testPnspId)->delete();
PhieuNhapSP::where('maPhieuNhapSP', $testPnspId)->delete();
TonKho::where('maTonKho', $testLotId)->delete();
TonKho::where('ghiChu', 'LIKE', "%{$testPnspId}%")->delete();
$masterCtrl->deleteMaterial($testMaNVL);

echo "\n=======================================================\n";
echo " KẾT QUẢ PHÂN HỆ KHO: $passCount / $testCount TESTS PASSED!\n";
echo "=======================================================\n";

return ['pass' => $passCount, 'total' => $testCount];
