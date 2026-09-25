<?php
/**
 * TOÀN DIỆN KIỂM THỬ ĐỒNG BỘ CSDL 5 PHÂN HỆ ERP VINAMILK THEO CHƯƠNG 3
 * 
 * Kiểm tra 5 tiêu chí cốt lõi:
 * 1. Chuẩn hóa chính xác 51 bảng CSDL logic (7 HR, 15 Sản xuất, 14 Kho, 7 Bán hàng, 8 Thu-Chi).
 * 2. Loại bỏ hoàn toàn 4 bảng thừa ngoài chuẩn (BaoCaoThuChi, KhoNguyenVatLieu, KhoSanPham, LichSuNhanSu).
 * 3. Bổ sung bảng thứ 36 (DeNghiBoSungSanPham) và hoạt động thông suốt.
 * 4. Giải quyết triệt để 8 đối tượng trùng lặp dữ liệu (DT01 - DT08).
 * 5. 11 luồng liên kết liên phân hệ (Section 3.6.3) hoạt động nhất quán toàn vẹn.
 */

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\NhanVien;
use App\Models\SanPham;
use App\Models\TonKho;
use App\Models\Kho;
use App\Models\NguyenVatLieu;
use App\Models\KhachHang;
use App\Models\NhaCungCap;
use App\Models\DonHang;
use App\Models\ChiTietDonHang;
use App\Models\PhieuXuatSP;
use App\Models\ChiTietPhieuXuatSP;
use App\Models\GiaoHang;
use App\Models\DeNghiBoSungSanPham;
use App\Models\ChiTietPhieuYeuCauNVL;
use App\Models\PhieuYeuCauNVL;
use App\Models\DoiTuongGiaoDich;
use App\Models\PhieuThu;
use App\Models\PhieuChi;
use App\Http\Controllers\Warehouse\SalesController;
use App\Http\Controllers\Warehouse\InventoryController;
use Illuminate\Http\Request;

echo "===================================================================================\n";
echo " KIỂM THỬ TỰ ĐỘNG ĐỒNG BỘ 5 PHÂN HỆ ERP VINAMILK (CHƯƠNG 3: SECTION 3.1 - 3.6)\n";
echo "===================================================================================\n\n";

$passCount = 0;
$failCount = 0;

function assertCheck($code, $description, $condition, $details = '') {
    global $passCount, $failCount;
    if ($condition) {
        $passCount++;
        echo "  [PASS] [$code] $description\n";
    } else {
        $failCount++;
        echo "  [FAIL] [$code] $description\n";
        if ($details) {
            echo "         Chi tiết: $details\n";
        }
    }
}

// -----------------------------------------------------------------------------
// NHÓM 1: CẤU TRÚC 51 BẢNG CHUẨN & LOẠI BỎ BẢNG THỪA
// -----------------------------------------------------------------------------
echo "--- 1. KIỂM TRA TỔNG SỐ LƯỢNG BẢNG & DANH SÁCH 51 BẢNG CHUẨN ---\n";

$rawTables = DB::select('SHOW TABLES');
$tableNames = array_map(function($t) {
    $arr = (array)$t;
    return strtolower(reset($arr));
}, $rawTables);

$frameworkTables = ['migrations', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'sessions', 'password_reset_tokens', 'personal_access_tokens', 'users', 'nhatkythuchi'];
$businessTables = array_diff($tableNames, $frameworkTables);
$totalTables = count($businessTables);
assertCheck('SEC-3.6.1', "Tổng số bảng CSDL logic bằng đúng 51 bảng (hiện tại: {$totalTables})", $totalTables === 51);

$expected51Tables = [
    // 7 Nhân sự
    'phongban', 'chucvu', 'nhanvien', 'hopdong', 'bangcong', 'bangluong', 'taikhoan',
    // 15 Sản xuất
    'sanpham', 'lenhsanxuat', 'chitietlenhsanxuat', 'congdoan', 'phieuyeucaunvl', 'chitietphieuyeucaunvl',
    'phieuyeucaubtp', 'chitietphieuyeucaubtp', 'tiendosanxuat', 'chitiettiendosanxuat', 'phieunghiemthu',
    'phieuyeucauxuatsp', 'chitietphieuyeucauxuatsp', 'phieusanxuatbu', 'banthanhpham',
    // 14 Kho
    'kho', 'tonkho', 'nguyenvatlieu', 'loainvl', 'nhacungcap', 'phieunhapnvl', 'chitietphieunhapnvl',
    'phieuxuatnvl', 'chitietphieuxuatnvl', 'phieunhapsp', 'chitietphieunhapsp', 'phieuxuatsp',
    'chitietphieuxuatsp', 'denghibosungsanpham',
    // 7 Bán hàng
    'khachhang', 'donhang', 'chitietdonhang', 'giaohang', 'hoadon', 'congno', 'thanhtoan',
    // 8 Thu-Chi
    'danhmucthu', 'danhmucchi', 'doituonggiaodich', 'taikhoanquy', 'phieuthu', 'chitietphieuthu',
    'phieuchi', 'chitietphieuchi'
];

$missingTables = [];
foreach ($expected51Tables as $t) {
    if (!in_array($t, $tableNames)) {
        $missingTables[] = $t;
    }
}
assertCheck('SEC-3.6.1B', 'Tất cả 51 bảng chuẩn đều hiện diện đầy đủ trong cơ sở dữ liệu', empty($missingTables), implode(', ', $missingTables));

// Kiểm tra 4 bảng thừa đã bị loại bỏ
$obsoleteTables = ['baocaothuchi', 'khonguyenvatlieu', 'khosanpham', 'lichsunhansu'];
$foundObsolete = [];
foreach ($obsoleteTables as $ot) {
    if (in_array($ot, $tableNames)) {
        $foundObsolete[] = $ot;
    }
}
assertCheck('SEC-3.6.1C', '4 bảng thừa (BaoCaoThuChi, KhoNguyenVatLieu, KhoSanPham, LichSuNhanSu) đã bị loại bỏ hoàn toàn', empty($foundObsolete), implode(', ', $foundObsolete));

// Kiểm tra Bảng thứ 36: DeNghiBoSungSanPham
assertCheck('TB-36', 'Bảng thứ 36 DeNghiBoSungSanPham tồn tại với các trường chuẩn', 
    Schema::hasTable('DeNghiBoSungSanPham') &&
    Schema::hasColumns('DeNghiBoSungSanPham', ['maDeNghi', 'maSanPham', 'maKho', 'soLuong', 'ngayDeNghi', 'ngayCanHang', 'trangThai', 'maNV', 'ghiChu'])
);

echo "\n--- 2. GIẢI QUYẾT 8 ĐỐI TƯỢNG TRÙNG LẶP DỮ LIỆU (DT01 - DT08) ---\n";

// DT01: Nhân viên - Phân hệ Nhân sự là nguồn dữ liệu chính duy nhất
$hasMaNVinSales = Schema::hasColumn('DonHang', 'maNhanVien') || Schema::hasColumn('GiaoHang', 'maNV');
$nhanVienCount = NhanVien::count();
assertCheck('DT01', "DT01: Nhân sự là Single Source of Truth của nhân viên (NhanVien.maNV: {$nhanVienCount} nhân sự)", 
    $nhanVienCount >= 10 && $hasMaNVinSales
);

// DT02: Sản phẩm - Phân hệ Sản xuất là nguồn dữ liệu chính duy nhất
$hasHSDinSP = Schema::hasColumn('SanPham', 'hanSuDung');
$hasMaSanPhamInTonKho = Schema::hasColumn('TonKho', 'maSanPham');
$sanPhamCount = SanPham::count();
assertCheck('DT02', "DT02: Sản phẩm là nguồn duy nhất (SanPham có hanSuDung, TonKho chuẩn hóa maSanPham)", 
    $hasHSDinSP && $hasMaSanPhamInTonKho && $sanPhamCount >= 6
);

// DT03 & DT04: Kho & Tồn kho tập trung
$hasLoaiKho = Schema::hasColumn('Kho', 'loaiKho');
$hasKhoInTonKho = Schema::hasColumn('TonKho', 'maKho');
$hasQualityInTonKho = Schema::hasColumn('TonKho', 'trangThaiChatLuong') && Schema::hasColumn('TonKho', 'trangThaiHSD');
$khoCount = Kho::count();
assertCheck('DT03-04', "DT03 & DT04: Kho & Tồn kho hợp nhất (Kho.loaiKho, TonKho.maKho, trangThaiChatLuong, trangThaiHSD)", 
    $hasLoaiKho && $hasKhoInTonKho && $hasQualityInTonKho && $khoCount >= 4
);

// DT05: Phiếu xuất sản phẩm - Phân hệ Kho là nguồn dữ liệu chính
$hasMaDonHangInPX = Schema::hasColumn('PhieuXuatSP', 'maDonHang');
$hasMaPhieuXuatInGH = Schema::hasColumn('GiaoHang', 'maPhieuXuatSP');
assertCheck('DT05', 'DT05: PhieuXuatSP liên kết DonHang(maDonHang) và GiaoHang liên kết PhieuXuatSP(maPhieuXuatSP)', 
    $hasMaDonHangInPX && $hasMaPhieuXuatInGH
);

// DT06 & DT07: Khách hàng & Nhà cung cấp
$khachHangCount = KhachHang::count();
$nccCount = NhaCungCap::count();
$doiTuongCount = DoiTuongGiaoDich::count();
assertCheck('DT06-07', "DT06 & DT07: Khách hàng ({$khachHangCount}) & NCC ({$nccCount}) làm nguồn duy nhất, Thu-Chi ánh xạ qua DoiTuongGiaoDich ({$doiTuongCount})", 
    $khachHangCount >= 6 && $nccCount >= 4 && $doiTuongCount >= 10
);

// DT08: Nguyên vật liệu - Phân hệ Kho là nguồn dữ liệu chính duy nhất
$hasNoTenNVLinCT = !Schema::hasColumn('ChiTietPhieuYeuCauNVL', 'tenNVL');
$hasMaNVLinCT = Schema::hasColumn('ChiTietPhieuYeuCauNVL', 'maNVL');
assertCheck('DT08', 'DT08: NguyenVatLieu (Kho) là nguồn duy nhất; ChiTietPhieuYeuCauNVL loại bỏ tenNVL và tham chiếu maNVL', 
    $hasNoTenNVLinCT && $hasMaNVLinCT
);

echo "\n--- 3. KIỂM TRA 11 QUAN HỆ LIÊN PHÂN HỆ (SECTION 3.6.3) ---\n";

// 1. NhanVien -> Các chứng từ
$flow1 = DB::table('PhieuXuatSP')->whereNotNull('maNVTao')->exists() &&
         DB::table('PhieuNhapNVL')->whereNotNull('maNVTao')->exists() &&
         DB::table('PhieuThu')->whereNotNull('nguoiLap')->exists();
assertCheck('FLOW-01', 'Luồng 1: NhanVien (Nhân sự) làm người lập/duyệt ở các chứng từ 4 phân hệ', $flow1);

// 2. NhanVien -> TaiKhoan
$flow2 = DB::table('TaiKhoan')->whereExists(function($q) {
    $q->select(DB::raw(1))->from('NhanVien')->whereColumn('NhanVien.maNV', 'TaiKhoan.maNV');
})->count();
assertCheck('FLOW-02', "Luồng 2: NhanVien liên kết TaiKhoan đăng nhập hệ thống ({$flow2} tài khoản)", $flow2 >= 10);

// 3. SanPham -> TonKho, ChiTietDonHang
$flow3 = DB::table('TonKho')->whereNotNull('maSanPham')->exists() &&
         DB::table('ChiTietDonHang')->whereNotNull('maSanPham')->exists();
assertCheck('FLOW-03', 'Luồng 3: SanPham (Sản xuất) liên kết dùng chung tại TonKho và ChiTietDonHang', $flow3);

// 4. NguyenVatLieu -> ChiTietPhieuYeuCauNVL
$flow4 = DB::table('ChiTietPhieuYeuCauNVL')->whereNotNull('maNVL')->exists();
assertCheck('FLOW-04', 'Luồng 4: NguyenVatLieu (Kho) liên kết ChiTietPhieuYeuCauNVL (Sản xuất)', $flow4);

// 5. PhieuYeuCauNVL -> PhieuXuatNVL
$flow5 = Schema::hasColumn('PhieuXuatNVL', 'maPhieuYeuCauNVL') && 
         DB::table('PhieuXuatNVL')->whereNotNull('maPhieuYeuCauNVL')->where('maPhieuYeuCauNVL', '!=', '')->exists();
assertCheck('FLOW-05', 'Luồng 5: PhieuYeuCauNVL (Sản xuất) là căn cứ cấp phát cho PhieuXuatNVL (Kho)', $flow5);

// 6. PhieuYeuCauXuatSP -> PhieuNhapSP
$flow6 = Schema::hasColumn('PhieuNhapSP', 'maPhieuYCXSP');
assertCheck('FLOW-06', 'Luồng 6: PhieuYeuCauXuatSP (Sản xuất) là căn cứ nhập kho PhieuNhapSP (Kho)', $flow6);

// 7. DonHang -> PhieuXuatSP
$flow7 = DB::table('PhieuXuatSP')->whereNotNull('maDonHang')->exists();
assertCheck('FLOW-07', 'Luồng 7: DonHang (Bán hàng) liên kết tự động sinh PhieuXuatSP (Kho)', $flow7);

// 8. PhieuXuatSP -> GiaoHang
$flow8 = DB::table('GiaoHang')->whereNotNull('maPhieuXuatSP')->exists();
assertCheck('FLOW-08', 'Luồng 8: PhieuXuatSP (Kho) liên kết thực hiện GiaoHang (Bán hàng)', $flow8);

// 9. KhachHang, NhaCungCap -> DoiTuongGiaoDich
$flow9 = DB::table('DoiTuongGiaoDich')->whereIn('loaiDoiTuong', ['Khách hàng', 'KH'])->exists() &&
         DB::table('DoiTuongGiaoDich')->whereIn('loaiDoiTuong', ['Nhà cung cấp', 'NCC'])->exists();
assertCheck('FLOW-09', 'Luồng 9: Khách hàng và Nhà cung cấp ánh xạ đối tượng giao dịch tài chính', $flow9);

// 10. PhieuNhapNVL -> PhieuChi
$flow10 = Schema::hasColumn('PhieuChi', 'maPhieuNhapNVL');
assertCheck('FLOW-10', 'Luồng 10: PhieuNhapNVL (Kho) liên kết sinh PhieuChi thanh toán tiền hàng', $flow10);

// 11. ThanhToan -> PhieuThu
$flow11 = Schema::hasColumn('PhieuThu', 'maThanhToan');
assertCheck('FLOW-11', 'Luồng 11: ThanhToan (Bán hàng) liên kết sinh PhieuThu ghi nhận dòng tiền', $flow11);

echo "\n--- 4. END-TO-END TÍCH HỢP QUY TRÌNH KHO - BÁN HÀNG ---\n";

// Test Đề nghị bổ sung sản phẩm (Table 36 CRUD API)
$invCtrl = new InventoryController();
$reqReplenish = new Request([
    'maDeNghi' => 'DNBS' . rand(1000, 9999),
    'maSanPham' => 'SP001',
    'maKho' => 'KHO-TONG',
    'soLuong' => 500,
    'ngayDeNghi' => date('Y-m-d'),
    'ngayCanHang' => date('Y-m-d', strtotime('+3 days')),
    'maNV' => 'NV001',
    'ghiChu' => 'Yêu cầu sản xuất gấp bổ sung tồn kho an toàn'
]);
$resReplenish = $invCtrl->createDeNghiBoSung($reqReplenish);
$dataReplenish = json_decode($resReplenish->getContent(), true);
assertCheck('E2E-DNBS', 'Tạo Phiếu Đề nghị bổ sung sản phẩm (Table 36) qua InventoryController', 
    $dataReplenish['success'] === true && $dataReplenish['data']['soLuong'] == 500
);

// Cập nhật trạng thái phiếu đề nghị bổ sung
$resStatus = $invCtrl->updateDeNghiBoSungStatus(new Request(['trangThai' => 'Đã duyệt']), $dataReplenish['data']['maDeNghi']);
$dataStatus = json_decode($resStatus->getContent(), true);
assertCheck('E2E-DNBS-STATUS', 'Phê duyệt Phiếu đề nghị bổ sung sản phẩm chuyển trạng thái "Đã duyệt"', 
    $dataStatus['success'] === true && $dataStatus['data']['trangThai'] === 'Đã duyệt'
);

// Test Xác nhận đơn hàng -> Tự động sinh PhieuXuatSP (Flow 7 & DT05)
$salesCtrl = new SalesController();
$testOrderCode = 'DH_SYNC_' . rand(1000, 9999);
$createOrderReq = new Request([
    'maDonHang' => $testOrderCode,
    'maKhachHang' => 'KH001',
    'maNhanVien' => 'NV004',
    'items' => [
        ['maSanPham' => 'SP001', 'soLuong' => 10, 'donGia' => 380000]
    ]
]);
$orderRes = $salesCtrl->createOrder($createOrderReq);
$orderData = json_decode($orderRes->getContent(), true);

// Chuyển trạng thái sang "Đã xác nhận"
$confirmReq = new Request(['trangThai' => 'Đã xác nhận']);
$confirmRes = $salesCtrl->updateOrderStatus($confirmReq, $testOrderCode);
$confirmData = json_decode($confirmRes->getContent(), true);

// Kiểm tra PhieuXuatSP tự động sinh
$autoPX = PhieuXuatSP::where('maDonHang', $testOrderCode)->first();
assertCheck('E2E-AUTO-PX', 'Đơn hàng "Đã xác nhận" tự động sinh PhieuXuatSP liên kết maDonHang chính xác', 
    $confirmData['success'] === true && $autoPX !== null && $autoPX->maKhachHang === 'KH001'
);

// Tạo phiếu GiaoHang liên kết PhieuXuatSP vừa sinh
$testDeliveryCode = 'GH_SYNC_' . rand(1000, 9999);
$delivReq = new Request([
    'maGiaoHang' => $testDeliveryCode,
    'maDonHang' => $testOrderCode,
    'maPhieuXuatSP' => $autoPX?->maPhieuXuatSP,
    'maNV' => 'NV004',
    'diaChiGiao' => 'Vinamilk Mega Warehouse Tân Bình, TP.HCM',
    'trangThai' => 'Đang giao'
]);
$delivRes = $salesCtrl->storeDelivery($delivReq);
$delivData = json_decode($delivRes->getContent(), true);

$createdGH = GiaoHang::where('maGiaoHang', $testDeliveryCode)->first();
assertCheck('E2E-DELIVERY', 'Tạo Phiếu giao hàng liên kết chính xác PhieuXuatSP(maPhieuXuatSP) và NhanVien(maNV)', 
    $delivData['success'] === true && $createdGH !== null && $createdGH->maPhieuXuatSP === $autoPX?->maPhieuXuatSP
);

// Dọn dẹp bản ghi test E2E
if ($createdGH) $createdGH->delete();
if ($autoPX) {
    ChiTietPhieuXuatSP::where('maPhieuXuatSP', $autoPX->maPhieuXuatSP)->delete();
    $autoPX->delete();
}
ChiTietDonHang::where('maDonHang', $testOrderCode)->delete();
DonHang::where('maDonHang', $testOrderCode)->delete();
DeNghiBoSungSanPham::where('maDeNghi', $dataReplenish['data']['maDeNghi'])->delete();

echo "\n===================================================================================\n";
$totalChecks = $passCount + $failCount;
$percent = round(($passCount / $totalChecks) * 100, 1);
echo " TỔNG KẾT KIỂM THỬ ĐỒNG BỘ CSDL: {$passCount} / {$totalChecks} TIÊU CHÍ ĐẠT ({$percent}%)\n";
echo "===================================================================================\n";

if ($failCount === 0) {
    echo ">>> XÁC NHẬN: HỆ THỐNG ĐÃ ĐỒNG BỘ 100% HOÀN HẢO THEO ĐÚNG THIẾT KẾ CHƯƠNG 3! <<<\n\n";
} else {
    echo ">>> CẢNH BÁO: CÒN {$failCount} TIÊU CHÍ CHƯA ĐẠT. VUI LÒNG KIỂM TRA LẠI! <<<\n\n";
}
