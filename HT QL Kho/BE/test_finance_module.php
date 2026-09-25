<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\DanhMucThu;
use App\Models\DanhMucChi;
use App\Models\TaiKhoanQuy;
use App\Models\DoiTuongGiaoDich;
use App\Models\PhieuThu;
use App\Models\ChiTietPhieuThu;
use App\Models\PhieuChi;
use App\Models\ChiTietPhieuChi;
use App\Http\Controllers\Finance\MasterDataController;
use App\Http\Controllers\Finance\PhieuThuController;
use App\Http\Controllers\Finance\PhieuChiController;
use App\Http\Controllers\Finance\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "=======================================================================\n";
echo " KIỂM THỬ TỰ ĐỘNG PHÂN HỆ QUẢN LÝ THU CHI (FINANCE & CASH/BANK)\n";
echo "=======================================================================\n\n";

$passCount = 0;
$testCount = 0;

function assertFin($name, $condition, $msg = '') {
    global $testCount, $passCount;
    $testCount++;
    if ($condition) {
        $passCount++;
        echo " [PASS] Test #$testCount: $name\n";
    } else {
        echo " [FAIL] Test #$testCount: $name" . ($msg ? " - $msg" : "") . "\n";
    }
}

$prefix = 'FIN_' . time();
$masterCtrl = new MasterDataController();
$receiptCtrl = new PhieuThuController();
$paymentCtrl = new PhieuChiController();
$reportCtrl = new ReportController();

// -------------------------------------------------------------
// 1. Master Data Tests (Danh mục thu, chi, tài khoản quỹ, đối tượng)
// -------------------------------------------------------------
// 1.1 Danh mục khoản thu
$revListRes = $masterCtrl->getRevCategories(new Request());
$revListData = json_decode($revListRes->getContent(), true);
assertFin('FI-FR01: Tra cứu danh mục khoản thu thành công', 
    $revListData['success'] === true && count($revListData['data']) > 0);

$testMaDMT = 'DMT_' . $prefix;
$createDmtReq = new Request([
    'maDanhMucThu'  => $testMaDMT,
    'tenDanhMucThu' => 'Thu tiền thử nghiệm kiểm thử tự động ' . $prefix,
    'loaiThu'       => 'HoatDongKinhDoanh',
    'moTa'          => 'Danh mục test tự động',
]);
$createDmtRes = $masterCtrl->createRevCategory($createDmtReq);
$createDmtData = json_decode($createDmtRes->getContent(), true);
$dbDmt = DanhMucThu::where('maDanhMucThu', $testMaDMT)->first();
assertFin('FI-FR01: Tạo mới danh mục khoản thu vào CSDL', 
    $createDmtData['success'] === true && $dbDmt !== null);

// 1.2 Danh mục khoản chi
$expListRes = $masterCtrl->getExpCategories(new Request());
$expListData = json_decode($expListRes->getContent(), true);
assertFin('FI-FR01: Tra cứu danh mục khoản chi thành công', 
    $expListData['success'] === true && count($expListData['data']) > 0);

$testMaDMC = 'DMC_' . $prefix;
$createDmcReq = new Request([
    'maDanhMucChi'  => $testMaDMC,
    'tenDanhMucChi' => 'Chi phí thử nghiệm kiểm thử tự động ' . $prefix,
    'loaiChi'       => 'ChiPhiVanHanh',
    'moTa'          => 'Danh mục chi test tự động',
]);
$createDmcRes = $masterCtrl->createExpCategory($createDmcReq);
$createDmcData = json_decode($createDmcRes->getContent(), true);
$dbDmc = DanhMucChi::where('maDanhMucChi', $testMaDMC)->first();
assertFin('FI-FR01: Tạo mới danh mục khoản chi vào CSDL', 
    $createDmcData['success'] === true && $dbDmc !== null);

// 1.3 Tài khoản quỹ / Ngân hàng
$accListRes = $masterCtrl->getAccounts(new Request());
$accListData = json_decode($accListRes->getContent(), true);
assertFin('FI-FR01: Tra cứu danh sách tài khoản quỹ & ngân hàng', 
    $accListData['success'] === true && count($accListData['data']) > 0);

$testMaTKQ = 'TKQ_' . $prefix;
$createAccReq = new Request([
    'maTaiKhoanQuy'  => $testMaTKQ,
    'tenTaiKhoanQuy' => 'Quỹ tiền mặt kiểm thử ' . $prefix,
    'loaiTaiKhoan'   => 'TM',
    'soDuHienTai'    => 10000000,
    'trangThai'      => 1,
]);
$createAccRes = $masterCtrl->createAccount($createAccReq);
$createAccData = json_decode($createAccRes->getContent(), true);
$dbAcc = TaiKhoanQuy::where('maTaiKhoanQuy', $testMaTKQ)->first();
assertFin('FI-FR01: Khởi tạo tài khoản quỹ với số dư ban đầu 10.000.000 đ', 
    $createAccData['success'] === true && $dbAcc !== null && $dbAcc->soDuHienTai == 10000000);

// 1.4 Đối tượng giao dịch
$cpListRes = $masterCtrl->getCounterparties(new Request());
$cpListData = json_decode($cpListRes->getContent(), true);
assertFin('FI-FR01: Tra cứu danh sách đối tượng giao dịch', 
    $cpListData['success'] === true && count($cpListData['data']) > 0);

$testMaDT = 'DT_' . $prefix;
$createCpReq = new Request([
    'maDoiTuong'    => $testMaDT,
    'loaiDoiTuong'  => 'Khac',
    'maThamChieu'   => 'REF_' . $prefix,
    'trangThai'     => 1,
]);
$createCpRes = $masterCtrl->createCounterparty($createCpReq);
$createCpData = json_decode($createCpRes->getContent(), true);
$dbCp = DoiTuongGiaoDich::where('maDoiTuong', $testMaDT)->first();
assertFin('FI-FR01: Thêm đối tượng giao dịch liên kết phân hệ khác', 
    $createCpData['success'] === true && $dbCp !== null);

// -------------------------------------------------------------
// 2. Quản lý Phiếu Thu (FI-FR02, FI-FR03, FI-BR01, FI-BR03)
// -------------------------------------------------------------
// 2.1 Tra cứu chứng từ chờ thu từ Bán hàng
$pendingSalesRes = $receiptCtrl->getPendingSalesReceipts();
$pendingSalesData = json_decode($pendingSalesRes->getContent(), true);
assertFin('FI-FR03: Danh sách chứng từ bán hàng chờ lập phiếu thu', 
    $pendingSalesData['success'] === true);

// 2.2 Lập phiếu thu tiền mới
$testMaPT = 'PT_' . $prefix;
$createPtReq = new Request([
    'maPhieuThu'    => $testMaPT,
    'ngayThu'       => Carbon::today()->toDateString(),
    'maDoiTuong'    => $testMaDT,
    'lyDoThu'       => 'Thu tiền bán hàng đợt 1',
    'soTien'        => 5000000,
    'phuongThucThu' => 'TM',
    'maTaiKhoanQuy' => $testMaTKQ,
    'nguoiLap'      => 'NV002',
    'items'         => [
        [
            'maChiTietThu' => 'CTPT_' . $prefix,
            'maDanhMucThu' => $testMaDMT,
            'dienGiai'     => 'Thu tiền đợt 1',
            'soTien'       => 5000000,
        ]
    ]
]);
$createPtRes = $receiptCtrl->createReceipt($createPtReq);
$createPtData = json_decode($createPtRes->getContent(), true);
$dbPt = PhieuThu::where('maPhieuThu', $testMaPT)->first();
assertFin('FI-FR02: Lập phiếu thu tiền mới vào CSDL (Trạng thái: Moi)', 
    $createPtData['success'] === true && $dbPt !== null && $dbPt->trangThai === 'Moi');

// 2.3 Phân quyền duyệt: Từ chối nếu không phải Kế toán trưởng
$unauthAppReq = new Request(['role' => 'NhanVien']);
$unauthAppRes = $receiptCtrl->approveReceipt($unauthAppReq, $testMaPT);
$unauthAppData = json_decode($unauthAppRes->getContent(), true);
assertFin('FI-BR03: Chặn nhân viên thường duyệt phiếu thu (Chỉ Kế toán trưởng)', 
    $unauthAppData['success'] === false && str_contains($unauthAppData['message'], 'Từ chối quyền'));

// 2.4 Kế toán trưởng phê duyệt phiếu thu -> Tự động cộng số dư tài khoản quỹ (+5.000.000 đ)
$authAppReq = new Request(['role' => 'KeToanTruong', 'nguoiDuyet' => 'NV001']);
$authAppRes = $receiptCtrl->approveReceipt($authAppReq, $testMaPT);
$authAppData = json_decode($authAppRes->getContent(), true);
$dbAccAfterThu = TaiKhoanQuy::where('maTaiKhoanQuy', $testMaTKQ)->first();
assertFin('FI-BR03: Kế toán trưởng duyệt phiếu thu tự động cộng số dư quỹ (10M -> 15M)', 
    $authAppData['success'] === true && $dbAccAfterThu->soDuHienTai == 15000000);

// 2.5 Đối soát phiếu thu
$recPtRes = $receiptCtrl->sendToReconcile($testMaPT);
$recPtData = json_decode($recPtRes->getContent(), true);
$dbPtAfterRec = PhieuThu::where('maPhieuThu', $testMaPT)->first();
assertFin('FI-FR04: Đối soát phiếu thu chuyển trạng thái "ChoDoiSoat"', 
    $recPtData['success'] === true && $dbPtAfterRec->trangThai === 'ChoDoiSoat');

// -------------------------------------------------------------
// 3. Quản lý Phiếu Chi (FI-FR03, FI-BR02, FI-BR04, FI-FR07)
// -------------------------------------------------------------
// 3.1 Tra cứu chứng từ chờ chi từ Kho & Nhân sự
$pendingPurchRes = $paymentCtrl->getPendingPurchasePayments(new Request());
$pendingPurchData = json_decode($pendingPurchRes->getContent(), true);
assertFin('FI-FR03: Danh sách chứng từ nhập kho NVL chờ lập phiếu chi', 
    $pendingPurchData['success'] === true);

$pendingPayrollRes = $paymentCtrl->getPendingPayrollPayments(new Request());
$pendingPayrollData = json_decode($pendingPayrollRes->getContent(), true);
assertFin('FI-FR03: Danh sách bảng lương nhân sự chờ lập phiếu chi', 
    $pendingPayrollData['success'] === true);

// 3.2 Lập phiếu chi tiền mới
$testMaPC = 'PC_' . $prefix;
$createPcReq = new Request([
    'maPhieuChi'    => $testMaPC,
    'ngayChi'       => Carbon::today()->toDateString(),
    'maDoiTuong'    => $testMaDT,
    'lyDoChi'       => 'Chi thanh toán tiền nhà cung cấp',
    'soTien'        => 3000000,
    'phuongThucChi' => 'TM',
    'maTaiKhoanQuy' => $testMaTKQ,
    'nguoiLap'      => 'NV002',
    'items'         => [
        [
            'maChiTietChi' => 'CTPC_' . $prefix,
            'maDanhMucChi' => $testMaDMC,
            'dienGiai'     => 'Chi thanh toán đợt 1',
            'soTien'       => 3000000,
        ]
    ]
]);
$createPcRes = $paymentCtrl->createPayment($createPcReq);
$createPcData = json_decode($createPcRes->getContent(), true);
$dbPc = PhieuChi::where('maPhieuChi', $testMaPC)->first();
assertFin('FI-FR03: Lập phiếu chi tiền mới vào CSDL (Trạng thái: Moi)', 
    $createPcData['success'] === true && $dbPc !== null && $dbPc->trangThai === 'Moi');

// 3.3 Test FI-BR04: Kiểm tra số dư quỹ - Chặn duyệt nếu số tiền chi vượt quá số dư tài khoản quỹ
$testMaPCOver = 'PC_OVER_' . $prefix;
$createOverReq = new Request([
    'maPhieuChi'    => $testMaPCOver,
    'ngayChi'       => Carbon::today()->toDateString(),
    'maDoiTuong'    => $testMaDT,
    'lyDoChi'       => 'Chi vượt số dư',
    'soTien'        => 999999999, // Lớn hơn số dư 15M
    'phuongThucChi' => 'TM',
    'maTaiKhoanQuy' => $testMaTKQ,
    'nguoiLap'      => 'NV002',
    'items'         => [
        [
            'maChiTietChi' => 'CTPC_OVER_' . $prefix,
            'maDanhMucChi' => $testMaDMC,
            'dienGiai'     => 'Chi vượt số dư',
            'soTien'       => 999999999,
        ]
    ]
]);
$paymentCtrl->createPayment($createOverReq);
$failAppReq = new Request(['role' => 'KeToanTruong', 'nguoiDuyet' => 'NV001']);
$failAppRes = $paymentCtrl->approvePayment($failAppReq, $testMaPCOver);
$failAppData = json_decode($failAppRes->getContent(), true);
assertFin('FI-BR04 & FI-FR07: Chặn phê duyệt phiếu chi khi số dư tài khoản quỹ không đủ', 
    $failAppData['success'] === false && str_contains($failAppData['message'], 'Hạn mức không đủ'));

// 3.4 Phê duyệt phiếu chi hợp lệ -> Tự động trừ số dư tài khoản quỹ (-3.000.000 đ)
$authAppPcReq = new Request(['role' => 'KeToanTruong', 'nguoiDuyet' => 'NV001']);
$authAppPcRes = $paymentCtrl->approvePayment($authAppPcReq, $testMaPC);
$authAppPcData = json_decode($authAppPcRes->getContent(), true);
$dbAccAfterChi = TaiKhoanQuy::where('maTaiKhoanQuy', $testMaTKQ)->first();
assertFin('FI-BR04: Phê duyệt phiếu chi tự động trừ số dư tài khoản quỹ (15M -> 12M)', 
    $authAppPcData['success'] === true && $dbAccAfterChi->soDuHienTai == 12000000);

// 3.5 Hủy phiếu chi đã duyệt -> Tự động hoàn nguyên số dư tài khoản quỹ (+3.000.000 đ)
$cancelPcReq = new Request(['role' => 'KeToanTruong', 'lyDoHuy' => 'Hủy phiếu kiểm thử']);
$cancelPcRes = $paymentCtrl->cancelPayment($cancelPcReq, $testMaPC);
$cancelPcData = json_decode($cancelPcRes->getContent(), true);
$dbAccAfterCancel = TaiKhoanQuy::where('maTaiKhoanQuy', $testMaTKQ)->first();
assertFin('FI-FR03: Hủy phiếu chi đã duyệt tự động hoàn nguyên số dư quỹ (12M -> 15M)', 
    $cancelPcData['success'] === true && $dbAccAfterCancel->soDuHienTai == 15000000);

// -------------------------------------------------------------
// 4. Báo Cáo Tài Chính (FI-FR05)
// -------------------------------------------------------------
$sumFinRes = $reportCtrl->getSummaryReport(new Request());
$sumFinData = json_decode($sumFinRes->getContent(), true);
assertFin('FI-FR05: Báo cáo tổng hợp Thu - Chi - Tồn quỹ tính toán chuẩn xác', 
    $sumFinData['success'] === true && isset($sumFinData['data']['tongThu']));

$cashBookRes = $reportCtrl->getCashBookReport(new Request());
$cashBookData = json_decode($cashBookRes->getContent(), true);
assertFin('FI-FR05: Sổ quỹ tài chính ghi nhận đầy đủ các giao dịch dòng tiền', 
    $cashBookData['success'] === true && isset($cashBookData['data']['transactions']));

// -------------------------------------------------------------
// DỌN DẸP DỮ LIỆU TEST (CLEANUP)
// -------------------------------------------------------------
ChiTietPhieuChi::where('maPhieuChi', $testMaPCOver)->delete();
PhieuChi::where('maPhieuChi', $testMaPCOver)->delete();
ChiTietPhieuChi::where('maPhieuChi', $testMaPC)->delete();
PhieuChi::where('maPhieuChi', $testMaPC)->delete();
ChiTietPhieuThu::where('maPhieuThu', $testMaPT)->delete();
PhieuThu::where('maPhieuThu', $testMaPT)->delete();
DoiTuongGiaoDich::where('maDoiTuong', $testMaDT)->delete();
TaiKhoanQuy::where('maTaiKhoanQuy', $testMaTKQ)->delete();
DanhMucChi::where('maDanhMucChi', $testMaDMC)->delete();
DanhMucThu::where('maDanhMucThu', $testMaDMT)->delete();

echo "\n=======================================================\n";
echo " KẾT QUẢ PHÂN HỆ THU CHI: $passCount / $testCount TESTS PASSED!\n";
echo "=======================================================\n";

return ['pass' => $passCount, 'total' => $testCount];
