<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\DonHang;
use App\Models\ChiTietDonHang;
use App\Models\KhachHang;
use App\Models\SanPham;
use App\Models\TonKho;
use App\Models\GiaoHang;
use App\Models\HoaDon;
use App\Models\CongNo;
use App\Models\ThanhToan;
use App\Http\Controllers\Warehouse\SalesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "=======================================================================\n";
echo " KIỂM THỬ TỰ ĐỘNG PHÂN HỆ BÁN HÀNG & PHÂN PHỐI (SALES & DISTRIBUTION)\n";
echo "=======================================================================\n\n";

$passCount = 0;
$testCount = 0;

function assertSales($name, $condition, $msg = '') {
    global $testCount, $passCount;
    $testCount++;
    if ($condition) {
        $passCount++;
        echo " [PASS] Test #$testCount: $name\n";
    } else {
        echo " [FAIL] Test #$testCount: $name" . ($msg ? " - $msg" : "") . "\n";
    }
}

$salesCtrl = new SalesController();
$prefix = 'SA_' . time();

// -------------------------------------------------------------
// 1. Dashboard & Realtime Stock Check
// -------------------------------------------------------------
$dashRes = $salesCtrl->dashboard();
$dashData = json_decode($dashRes->getContent(), true);
assertSales('SA-FR01: Dashboard bán hàng tổng hợp doanh thu và đơn hàng', 
    $dashData['success'] === true && isset($dashData['data']['summary']['totalRevenue']));

$stockRes = $salesCtrl->checkStock();
$stockData = json_decode($stockRes->getContent(), true);
assertSales('SA-FR02: Kiểm tra tồn kho thời gian thực cho các sản phẩm', 
    $stockData['success'] === true && count($stockData['data']) > 0);

// -------------------------------------------------------------
// 2. Quản lý Khách Hàng (CRUD)
// -------------------------------------------------------------
$testMaKH = 'KH_' . $prefix;
$createCustReq = new Request([
    'maKhachHang'  => $testMaKH,
    'tenKhachHang' => 'Đại lý Vinamilk Test ' . $prefix,
    'soDienThoai'  => '0912' . substr(strval(time()), -6),
    'diaChi'       => '123 Đường Test, Quận 1, TP.HCM',
    'hanMucCongNo' => 50000000,
]);
$createCustRes = $salesCtrl->storeCustomer($createCustReq);
$createCustData = json_decode($createCustRes->getContent(), true);
assertSales('SA-FR01: Thêm khách hàng mới vào cơ sở dữ liệu', 
    $createCustData['success'] === true && $createCustData['data']['maKhachHang'] === $testMaKH);

// Tra cứu danh sách & chi tiết khách hàng
$custListRes = $salesCtrl->customers(new Request(['keyword' => $testMaKH]));
$custListData = json_decode($custListRes->getContent(), true);
assertSales('SA-FR01: Tra cứu danh sách khách hàng theo từ khóa', 
    $custListData['success'] === true && count($custListData['data']) === 1);

$custDetailRes = $salesCtrl->customerDetail($testMaKH);
$custDetailData = json_decode($custDetailRes->getContent(), true);
assertSales('SA-FR01: Lấy chi tiết khách hàng và hạn mức công nợ', 
    $custDetailData['success'] === true && $custDetailData['data']['hanMucCongNo'] == 50000000);

// Cập nhật thông tin khách hàng
$updateCustReq = new Request([
    'tenKhachHang' => 'Đại lý Vinamilk Test Updated',
    'soDienThoai'  => '0912999888',
    'diaChi'       => '456 Đường Mới, TP.HCM',
    'hanMucCongNo' => 70000000,
]);
$updateCustRes = $salesCtrl->updateCustomer($updateCustReq, $testMaKH);
$updateCustData = json_decode($updateCustRes->getContent(), true);
$dbCust = KhachHang::where('maKhachHang', $testMaKH)->first();
assertSales('SA-FR01: Cập nhật thông tin khách hàng trong DB thành công', 
    $updateCustData['success'] === true && $dbCust->hanMucCongNo == 70000000);

// -------------------------------------------------------------
// 3. Quản lý Đơn Đặt Hàng & Quy tắc tồn kho (SA-BR01)
// -------------------------------------------------------------
// 3.1 Test SA-BR01: Chặn đặt hàng nếu vượt quá số lượng tồn kho khả dụng
$testMaDH = 'DH_' . $prefix;
$failOrderReq = new Request([
    'maDonHang'   => 'DH_FAIL_' . $prefix,
    'maKhachHang' => $testMaKH,
    'items'       => [
        ['maSanPham' => 'SP001', 'soLuong' => 999999, 'donGia' => 320000]
    ]
]);
$failOrderRes = $salesCtrl->createOrder($failOrderReq);
$failOrderData = json_decode($failOrderRes->getContent(), true);
assertSales('SA-BR01: Chặn tạo đơn hàng khi số lượng đặt vượt quá tồn kho khả dụng', 
    $failOrderData['success'] === false && str_contains($failOrderData['message'], 'không đáp ứng đủ'));

// 3.2 Tạo đơn hàng hợp lệ (với số lượng 1 sản phẩm có sẵn trong kho)
$validOrderReq = new Request([
    'maDonHang'   => $testMaDH,
    'maKhachHang' => $testMaKH,
    'maNhanVien'  => 'NV001',
    'ngayMua'     => Carbon::today()->toDateString(),
    'trangThai'   => 'Chờ xác nhận',
    'items'       => [
        ['maSanPham' => 'SP001', 'soLuong' => 1, 'donGia' => 320000]
    ]
]);
$validOrderRes = $salesCtrl->createOrder($validOrderReq);
$validOrderData = json_decode($validOrderRes->getContent(), true);
assertSales('SA-FR02: Tạo đơn đặt hàng thành công vào DB (Trạng thái: Chờ xác nhận)', 
    $validOrderData['success'] === true && $validOrderData['data']['maDonHang'] === $testMaDH);

// 3.3 Tra cứu đơn hàng & chi tiết đơn hàng
$orderDetailRes = $salesCtrl->orderDetail($testMaDH);
$orderDetailData = json_decode($orderDetailRes->getContent(), true);
assertSales('SA-FR02: Xem chi tiết đơn hàng kèm các mặt hàng', 
    $orderDetailData['success'] === true && count($orderDetailData['data']['items']) === 1);

// 3.4 Cập nhật trạng thái đơn hàng (Xác nhận đơn hàng)
$statusReq = new Request(['trangThai' => 'Đã xác nhận']);
$statusRes = $salesCtrl->updateOrderStatus($statusReq, $testMaDH);
$statusData = json_decode($statusRes->getContent(), true);
$dbOrder = DonHang::where('maDonHang', $testMaDH)->first();
assertSales('SA-FR02: Cập nhật trạng thái đơn hàng sang "Đã xác nhận"', 
    $statusData['success'] === true && $dbOrder->trangThai === 'Đã xác nhận');

// -------------------------------------------------------------
// 4. Quản lý Giao Hàng (SA-FR04)
// -------------------------------------------------------------
$testMaGH = 'GH_' . $prefix;
$createDelivReq = new Request([
    'maGiaoHang' => $testMaGH,
    'maDonHang'  => $testMaDH,
    'diaChiGiao' => '123 Đường Test, Quận 1, TP.HCM',
    'ngayGiao'   => Carbon::today()->toDateString(),
    'trangThai'  => 'Đang giao',
]);
$createDelivRes = $salesCtrl->storeDelivery($createDelivReq);
$createDelivData = json_decode($createDelivRes->getContent(), true);
$dbDeliv = GiaoHang::where('maGiaoHang', $testMaGH)->first();
assertSales('SA-FR04: Lập phiếu giao hàng thành công (Trạng thái: Đang giao)', 
    $createDelivData['success'] === true && $dbDeliv !== null);

// Cập nhật trạng thái giao hàng sang "Đã giao"
$upDelivReq = new Request(['trangThai' => 'Đã giao']);
$upDelivRes = $salesCtrl->updateDeliveryStatus($upDelivReq, $testMaGH);
$upDelivData = json_decode($upDelivRes->getContent(), true);
$dbOrderAfterDeliv = DonHang::where('maDonHang', $testMaDH)->first();
assertSales('SA-FR04: Chuyển trạng thái giao hàng "Đã giao" tự động cập nhật đơn hàng "Đã giao"', 
    $upDelivData['success'] === true && $dbOrderAfterDeliv->trangThai === 'Đã giao');

// -------------------------------------------------------------
// 5. Quản lý Hóa Đơn & Thanh Toán (SA-FR03, SA-FR05)
// -------------------------------------------------------------
$testMaHD = 'HD_' . $prefix;
$createInvReq = new Request([
    'maHoaDon'   => $testMaHD,
    'maGiaoHang' => $testMaGH,
    'tongTien'   => 320000,
    'ngayLap'    => Carbon::today()->toDateString(),
]);
$createInvRes = $salesCtrl->storeInvoice($createInvReq);
$createInvData = json_decode($createInvRes->getContent(), true);
$dbInv = HoaDon::where('maHoaDon', $testMaHD)->first();
assertSales('SA-FR03: Xuất hóa đơn bán hàng thành công', 
    $createInvData['success'] === true && $dbInv !== null && $dbInv->tongTien == 320000);

// Ghi nhận thanh toán một phần bằng hình thức Công nợ
$payReq = new Request([
    'maHoaDon'        => $testMaHD,
    'phuongThuc'      => 'Công nợ',
    'soTienThanhToan' => 120000, // Trả trước 120k, còn nợ 200k
    'hanThanhToan'    => Carbon::today()->addDays(30)->toDateString(),
]);
$payRes = $salesCtrl->recordPayment($payReq);
$payData = json_decode($payRes->getContent(), true);
$dbDebt = CongNo::where('maHoaDon', $testMaHD)->first();
assertSales('SA-FR05: Ghi nhận công nợ khi thanh toán một phần (Nợ 200.000 đ)', 
    $payData['success'] === true && $dbDebt !== null && $dbDebt->soTienConLai == 200000);

// Tra cứu danh sách công nợ & chi tiết công nợ
$debtListRes = $salesCtrl->receivables(new Request(['keyword' => $dbDebt->maCongNo]));
$debtListData = json_decode($debtListRes->getContent(), true);
assertSales('SA-FR05: Tra cứu hồ sơ công nợ theo mã công nợ', 
    $debtListData['success'] === true && count($debtListData['data']) === 1);

// -------------------------------------------------------------
// 6. Quản lý Bảng Giá Sản Phẩm (SA-FR06)
// -------------------------------------------------------------
$pricingRes = $salesCtrl->pricing(new Request());
$pricingData = json_decode($pricingRes->getContent(), true);
assertSales('SA-FR06: Tra cứu bảng giá sản phẩm hiện hành', 
    $pricingData['success'] === true && count($pricingData['data']) > 0);

$oldPrice = SanPham::where('maSanPham', 'SP001')->value('donGia');
$upPriceReq = new Request(['giaBan' => 335000]);
$upPriceRes = $salesCtrl->updatePrice($upPriceReq, 'SP001');
$upPriceData = json_decode($upPriceRes->getContent(), true);
$newPrice = SanPham::where('maSanPham', 'SP001')->value('donGia');
assertSales('SA-FR06: Điều chỉnh giá bán sản phẩm trong DB thành công', 
    $upPriceData['success'] === true && $newPrice == 335000);

// Khôi phục lại giá cũ
SanPham::where('maSanPham', 'SP001')->update(['donGia' => $oldPrice]);

// -------------------------------------------------------------
// DỌN DẸP DỮ LIỆU TEST (CLEANUP)
// -------------------------------------------------------------
ThanhToan::where('maCongNo', $dbDebt->maCongNo)->delete();
CongNo::where('maCongNo', $dbDebt->maCongNo)->delete();
HoaDon::where('maHoaDon', $testMaHD)->delete();
GiaoHang::where('maGiaoHang', $testMaGH)->delete();
ChiTietDonHang::where('maDonHang', $testMaDH)->delete();
DonHang::where('maDonHang', $testMaDH)->delete();
$salesCtrl->deleteCustomer($testMaKH);

echo "\n=======================================================\n";
echo " KẾT QUẢ PHÂN HỆ BÁN HÀNG: $passCount / $testCount TESTS PASSED!\n";
echo "=======================================================\n";

return ['pass' => $passCount, 'total' => $testCount];

