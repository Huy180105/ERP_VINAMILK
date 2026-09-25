<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\LenhSanXuat;
use App\Models\ChiTietLenhSanXuat;
use App\Models\CongDoan;
use App\Models\PhieuYeuCauNVL;
use App\Models\ChiTietPhieuYeuCauNVL;
use App\Models\BanThanhPham;
use App\Models\PhieuNghiemThu;
use App\Models\PhieuSanXuatBu;
use App\Models\PhieuYeuCauXuatSP;
use App\Models\ChiTietPhieuYeuCauXuatSP;
use App\Http\Controllers\Production\ProductionReportController;
use App\Http\Controllers\Production\ProductionOrderController;
use App\Http\Controllers\Production\ProductionStageController;
use App\Http\Controllers\Production\MaterialRequestController;
use App\Http\Controllers\Production\SemiFinishedGoodsController;
use App\Http\Controllers\Production\QualityControlController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "=======================================================================\n";
echo " KIỂM THỬ TỰ ĐỘNG PHÂN HỆ QUẢN LÝ SẢN XUẤT (PRODUCTION MANAGEMENT)\n";
echo "=======================================================================\n\n";

$passCount = 0;
$testCount = 0;

function assertProd($name, $condition, $msg = '') {
    global $testCount, $passCount;
    $testCount++;
    if ($condition) {
        $passCount++;
        echo " [PASS] Test #$testCount: $name\n";
    } else {
        echo " [FAIL] Test #$testCount: $name" . ($msg ? " - $msg" : "") . "\n";
    }
}

$prefix = 'PR_' . time();
$reportCtrl = new ProductionReportController();
$orderCtrl = new ProductionOrderController();
$stageCtrl = new ProductionStageController();
$matReqCtrl = new MaterialRequestController();
$btpCtrl = new SemiFinishedGoodsController();
$qcCtrl = new QualityControlController();

// -------------------------------------------------------------
// 1. Dashboard & Reports
// -------------------------------------------------------------
$dashRes = $reportCtrl->getDashboardSummary();
$dashData = json_decode($dashRes->getContent(), true);
assertProd('PR-FR32: Thống kê tổng quan Dashboard sản xuất', 
    $dashData['success'] === true && isset($dashData['data']['totalOrders']));

$volRes = $reportCtrl->getVolumeReport(new Request());
$volData = json_decode($volRes->getContent(), true);
assertProd('PR-FR33: Báo cáo sản lượng sản xuất theo phân loại', 
    $volData['success'] === true && count($volData['data']['byProduct']) > 0);

$effRes = $reportCtrl->getEfficiencyReport(new Request());
$effData = json_decode($effRes->getContent(), true);
assertProd('PR-FR34: Báo cáo hiệu suất vận hành dây chuyền', 
    $effData['success'] === true && isset($effData['data']['oeeMetrics']));

$qualRes = $reportCtrl->getQualityReport(new Request());
$qualData = json_decode($qualRes->getContent(), true);
assertProd('PR-FR36: Báo cáo chất lượng và phân tích nguyên nhân lỗi', 
    $qualData['success'] === true && isset($qualData['data']['defectRate']));

// -------------------------------------------------------------
// 2. Quản lý Lệnh Sản Xuất (PR-FR07, PR-FR08, PR-FR10, PR-FR12)
// -------------------------------------------------------------
$ordersRes = $orderCtrl->getOrders(new Request());
$ordersData = json_decode($ordersRes->getContent(), true);
assertProd('PR-FR07: Tra cứu danh sách lệnh sản xuất và tiến độ %', 
    $ordersData['success'] === true && count($ordersData['data']) > 0);

// 2.1 Tạo Lệnh Sản Xuất mới
$testMaLenh = 'LSX_' . $prefix;
$createOrderReq = new Request([
    'maLenh'      => $testMaLenh,
    'tenLenh'     => 'Kế hoạch sản xuất thử nghiệm tự động ' . $prefix,
    'maNhanVien'  => 'NV001',
    'ngayTaoLenh' => Carbon::today()->toDateString(),
    'items'       => [
        ['maSanPham' => 'SP001', 'soLuong' => 5000, 'ghiChu' => 'Tiệt trùng UHT']
    ]
]);
$createOrderRes = $orderCtrl->createOrder($createOrderReq);
$createOrderData = json_decode($createOrderRes->getContent(), true);
$dbOrder = LenhSanXuat::where('maLenh', $testMaLenh)->first();
assertProd('PR-FR07: Tạo Lệnh Sản Xuất mới vào CSDL (Trạng thái: Chờ duyệt)', 
    $createOrderData['success'] === true && $dbOrder !== null && $dbOrder->maLenh === $testMaLenh);

// 2.2 Xem chi tiết Lệnh Sản Xuất
$orderDetailRes = $orderCtrl->getOrderById($testMaLenh);
$orderDetailData = json_decode($orderDetailRes->getContent(), true);
assertProd('PR-FR08: Xem chi tiết lệnh sản xuất kèm danh sách sản phẩm', 
    $orderDetailData['success'] === true && count($orderDetailData['data']['chi_tiets']) === 1);

// 2.3 Phê duyệt Lệnh Sản Xuất
$appOrderRes = $orderCtrl->approveOrder(new Request(), $testMaLenh);
$appOrderData = json_decode($appOrderRes->getContent(), true);
$dbOrderApp = LenhSanXuat::where('maLenh', $testMaLenh)->first();
$createdStagesCount = CongDoan::where('maLenh', $testMaLenh)->count();
assertProd('PR-FR10: Phê duyệt Lệnh Sản Xuất kích hoạt 6 công đoạn tiêu chuẩn', 
    $appOrderData['success'] === true && $dbOrderApp->trangThai === 'Đang thực hiện' && $createdStagesCount === 6);

// -------------------------------------------------------------
// 3. Quy trình Công Đoạn (PR-FR18 -> PR-FR22)
// -------------------------------------------------------------
$stagesRes = $stageCtrl->getStages(new Request(['maLenh' => $testMaLenh]));
$stagesData = json_decode($stagesRes->getContent(), true);
assertProd('PR-FR18: Tra cứu danh sách công đoạn sản xuất của lệnh', 
    $stagesData['success'] === true && count($stagesData['data']) === 6);

// Lấy công đoạn đầu tiên được sinh tự động
$firstStage = CongDoan::where('maLenh', $testMaLenh)->orderBy('khau')->first();
$testMaCD = $firstStage->maCongDoan;

// 3.1 Bắt đầu thực hiện công đoạn
$startStageRes = $stageCtrl->startStage(new Request(), $testMaCD);
$startStageData = json_decode($startStageRes->getContent(), true);
$dbStage = CongDoan::where('maCongDoan', $testMaCD)->first();
assertProd('PR-FR20: Bắt đầu chạy công đoạn chuyển trạng thái "Đang thực hiện"', 
    $startStageData['success'] === true && $dbStage->trangThai === 'Đang thực hiện');

// 3.2 Ghi nhận sự cố kỹ thuật trong công đoạn
$incidentReq = new Request([
    'lyDoSuCo'          => 'Cảnh báo nhiệt độ bồn gia nhiệt vượt ngưỡng 145 độ C',
    'nhanCongDieuChinh' => 6,
]);
$incidentRes = $stageCtrl->recordIncident($incidentReq, $testMaCD);
$incidentData = json_decode($incidentRes->getContent(), true);
$dbStageInc = CongDoan::where('maCongDoan', $testMaCD)->first();
assertProd('PR-FR22: Ghi nhận sự cố tạm dừng công đoạn (Trạng thái: Tạm dừng (Sự cố))', 
    $incidentData['success'] === true && $dbStageInc->trangThai === 'Tạm dừng (Sự cố)');

// 3.3 Tiếp tục khôi phục công đoạn sau khắc phục
$resumeRes = $stageCtrl->resumeStage(new Request(), $testMaCD);
$resumeData = json_decode($resumeRes->getContent(), true);
$dbStageRes = CongDoan::where('maCongDoan', $testMaCD)->first();
assertProd('PR-FR20: Khôi phục công đoạn trở lại trạng thái "Đang thực hiện"', 
    $resumeData['success'] === true && $dbStageRes->trangThai === 'Đang thực hiện');

// -------------------------------------------------------------
// 4. Yêu Cầu Cấp Phát NVL cho Sản Xuất (PR-FR13 -> PR-FR17)
// -------------------------------------------------------------
$testMaYCNVL = 'YCNVL_' . $prefix;
$createMatReq = new Request([
    'maPhieuYCNVL' => $testMaYCNVL,
    'maLenh'       => $testMaLenh,
    'maCongDoan'   => $testMaCD,
    'maNhanVien'   => 'NV001',
    'ngayYeuCau'   => Carbon::today()->toDateString(),
    'ghiChu'       => 'Cấp phát sữa tươi nguyên liệu',
    'items'        => [
        ['maNVL' => 'NVL001', 'soLuong' => 2000]
    ]
]);
$createMatRes = $matReqCtrl->createRequest($createMatReq);
$createMatData = json_decode($createMatRes->getContent(), true);
$dbMatReq = PhieuYeuCauNVL::where('maPhieuYCNVL', $testMaYCNVL)->first();
assertProd('PR-FR15: Lập phiếu yêu cầu cấp phát NVL cho lệnh sản xuất', 
    $createMatData['success'] === true && $dbMatReq !== null && $dbMatReq->maPhieuYCNVL === $testMaYCNVL);

// 4.1 Kiểm tra khả năng đáp ứng vật tư từ kho
$availRes = $matReqCtrl->checkAvailability(new Request(['maPhieuYCNVL' => $testMaYCNVL]));
$availData = json_decode($availRes->getContent(), true);
assertProd('PR-FR14: Kiểm tra tồn kho khả dụng đối chiếu với phiếu yêu cầu NVL', 
    $availData['success'] === true && count($availData['data']) > 0);

// -------------------------------------------------------------
// 5. Quản lý Bán Thành Phẩm (BTP) (PR-FR24 -> PR-FR27)
// -------------------------------------------------------------
$testMaBTP = 'BTP_' . $prefix;
$createBTPReq = new Request([
    'maBTP'      => $testMaBTP,
    'tenBTP'     => 'BTP Sữa tươi tiệt trùng Test ' . $prefix,
    'maCongDoan' => $testMaCD,
    'soLuong'    => 4900,
    'donVi'      => 'Lít',
    'trangThai'  => 'Đạt chuẩn',
    'ghiChu'     => 'Đạt chuẩn vi sinh phòng Lab',
]);
$createBTPRes = $btpCtrl->createBTP($createBTPReq);
$createBTPData = json_decode($createBTPRes->getContent(), true);
$dbBTP = BanThanhPham::where('maBTP', $testMaBTP)->first();
assertProd('PR-FR25: Ghi nhận Bán Thành Phẩm (BTP) hoàn thành công đoạn', 
    $createBTPData['success'] === true && $dbBTP !== null && $dbBTP->soLuong == 4900);

// -------------------------------------------------------------
// 6. Kiểm Tra Chất Lượng (QC) & Lệnh Sản Xuất Bù (PR-FR28 -> PR-FR31)
// -------------------------------------------------------------
// 6.1 Validation: Chặn khi Tổng Đạt + Không Đạt != Tổng Nghiệm Thu
$testMaQC = 'QC_' . $prefix;
$failQCReq = new Request([
    'maPhieuNghiemThu'   => $testMaQC . '_FAIL',
    'maLenh'             => $testMaLenh,
    'maCongDoan'         => $testMaCD,
    'tongSoLuongSanPham' => 5000,
    'tongSoLuongDat'     => 4800,
    'tongSoLuongKhongDat'=> 100, // Tổng 4900 != 5000
    'ngayNghiemThu'      => Carbon::today()->toDateString(),
]);
$failQCRes = $qcCtrl->createQCReport($failQCReq);
$failQCData = json_decode($failQCRes->getContent(), true);
assertProd('PR-BR10: Bắt buộc Tổng Đạt + Tổng Không Đạt = Tổng Số Lượng Nghiệm Thu', 
    $failQCData['success'] === false && str_contains($failQCData['message'], 'Tổng số lượng Đạt và Không đạt phải bằng'));

// 6.2 Lập biên bản QC có phế phẩm -> Tự động sinh PhieuSanXuatBu
$validQCReq = new Request([
    'maPhieuNghiemThu'   => $testMaQC,
    'maLenh'             => $testMaLenh,
    'maCongDoan'         => $testMaCD,
    'tongSoLuongSanPham' => 5000,
    'tongSoLuongDat'     => 4950,
    'tongSoLuongKhongDat'=> 50, // Có 50 hộp phế phẩm
    'ngayNghiemThu'      => Carbon::today()->toDateString(),
    'lyDoKhongDat'       => 'Hở mí ép bao bì tiệt trùng Tetra Pak',
]);
$validQCRes = $qcCtrl->createQCReport($validQCReq);
$validQCData = json_decode($validQCRes->getContent(), true);
$dbQC = PhieuNghiemThu::where('maPhieuNghiemThu', $testMaQC)->first();
$dbComp = PhieuSanXuatBu::where('maPhieuNghiemThu', $testMaQC)->first();
assertProd('PR-FR28 & PR-FR31: Lập biên bản QC và tự động sinh Phiếu Sản Xuất Bù khi có phế phẩm', 
    $validQCData['success'] === true && $dbQC !== null && $dbComp !== null && $dbComp->soLuongKhongDat == 50);

// 6.3 Bàn giao thành phẩm Đạt sang Phân hệ Kho (Lập PhieuYeuCauXuatSP)
$handoverReq = new Request([
    'maPhieuNghiemThu' => $testMaQC,
    'maNhanVien'       => 'NV001',
    'ngayYeuCau'       => Carbon::today()->toDateString(),
    'items'            => [
        ['maSanPham' => 'SP001', 'soLuong' => 4950, 'ghiChu' => 'Thành phẩm đạt chuẩn xuất kho']
    ]
]);
$handoverRes = $qcCtrl->handoverToWarehouse($handoverReq);
$handoverData = json_decode($handoverRes->getContent(), true);
$dbHandover = PhieuYeuCauXuatSP::where('maPhieuNghiemThu', $testMaQC)->first();
assertProd('PR-FR30: Bàn giao lô sản phẩm đạt chất lượng sang Phân hệ Kho lưu kho', 
    $handoverData['success'] === true && $dbHandover !== null);

// 6.4 Hoàn thành Lệnh Sản Xuất
$compOrderRes = $orderCtrl->completeOrder(new Request(), $testMaLenh);
$compOrderData = json_decode($compOrderRes->getContent(), true);
$dbOrderComp = LenhSanXuat::where('maLenh', $testMaLenh)->first();
assertProd('PR-FR12: Đóng lệnh sản xuất chuyển trạng thái "Hoàn thành"', 
    $compOrderData['success'] === true && $dbOrderComp->trangThai === 'Hoàn thành');

// -------------------------------------------------------------
// DỌN DẸP DỮ LIỆU TEST (CLEANUP)
// -------------------------------------------------------------
if ($dbHandover) {
    ChiTietPhieuYeuCauXuatSP::where('maPhieuYCXSP', $dbHandover->maPhieuYCXSP)->delete();
    $dbHandover->delete();
}
PhieuSanXuatBu::where('maPhieuNghiemThu', $testMaQC)->delete();
PhieuNghiemThu::where('maPhieuNghiemThu', $testMaQC)->delete();
BanThanhPham::where('maBTP', $testMaBTP)->delete();
$ycnvlList = PhieuYeuCauNVL::where('maLenh', $testMaLenh)->pluck('maPhieuYCNVL');
ChiTietPhieuYeuCauNVL::whereIn('maPhieuYCNVL', $ycnvlList)->delete();
PhieuYeuCauNVL::where('maLenh', $testMaLenh)->delete();
CongDoan::where('maLenh', $testMaLenh)->delete();
ChiTietLenhSanXuat::where('maLenh', $testMaLenh)->delete();
LenhSanXuat::where('maLenh', $testMaLenh)->delete();

echo "\n=======================================================\n";
echo " KẾT QUẢ PHÂN HỆ SẢN XUẤT: $passCount / $testCount TESTS PASSED!\n";
echo "=======================================================\n";

return ['pass' => $passCount, 'total' => $testCount];
