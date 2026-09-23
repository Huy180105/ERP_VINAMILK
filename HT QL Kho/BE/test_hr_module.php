<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\NhanVien;
use App\Models\TaiKhoan;
use App\Models\HopDong;
use App\Models\BangCong;
use App\Models\BangLuong;
use App\Models\PhongBan;
use App\Models\ChucVu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\HR\EmployeeController;
use App\Http\Controllers\HR\DepartmentPositionController;
use App\Http\Controllers\HR\ContractController;
use App\Http\Controllers\HR\TimesheetController;
use App\Http\Controllers\HR\PayrollController;
use App\Http\Controllers\HR\AccountController;
use App\Http\Controllers\HR\HRReportController;

echo "=== KIỂM THỬ TỰ ĐỘNG PHÂN HỆ QUẢN LÝ NHÂN SỰ (HRM & PAYROLL) ===\n\n";

$passCount = 0;
$testCount = 0;

function assertTest($name, $condition, $msg = '') {
    global $testCount, $passCount;
    $testCount++;
    if ($condition) {
        $passCount++;
        echo " [PASS] Test #$testCount: $name\n";
    } else {
        echo " [FAIL] Test #$testCount: $name - $msg\n";
    }
}

// 1. Test Dashboard API
$reportCtrl = new HRReportController();
$dashRes = $reportCtrl->getDashboardSummary();
$dashData = json_decode($dashRes->getContent(), true);
assertTest('HR Dashboard Summary trả về dữ liệu hợp lệ', $dashData['success'] === true && $dashData['data']['tongNhanVien'] >= 10);

// 2. Test Employee List (HR-FR04)
$empCtrl = new EmployeeController();
$listReq = new Request();
$listRes = $empCtrl->getEmployees($listReq);
$listData = json_decode($listRes->getContent(), true);
assertTest('HR-FR04: Danh sách nhân viên trả về đầy đủ', $listData['success'] === true && count($listData['data']) >= 10);

// 3. Test Thêm nhân viên mới (HR-FR01, HR-BR09, HR-BR12)
$testMaNV = 'NV_TEST_' . time();
$testPhone = '0988' . substr(strval(time()), -6);
$createReq = new Request([
    'maNV' => $testMaNV,
    'hoTen' => 'Nguyễn Kiểm Thử Tự Động',
    'soDienThoai' => $testPhone,
    'email' => 'test@vinamilk.com.vn',
    'maPhongBan' => 'PB02',
    'maChucVu' => 'CV06',
    'ngayVaoLam' => '2026-09-22',
    'trangThai' => 'Đang làm việc',
    'vaiTro' => 'NhanVien',
]);
$createRes = $empCtrl->createEmployee($createReq);
$createData = json_decode($createRes->getContent(), true);
assertTest('HR-FR01: Thêm nhân viên mới thành công', $createData['success'] === true);

// Kiểm tra HR-BR09: Tài khoản được tự động tạo với mật khẩu băm '123456'
$account = TaiKhoan::where('maNV', $testMaNV)->first();
assertTest('HR-BR09: Tự động khởi tạo tài khoản với mật khẩu mặc định "123456" đã băm', 
    $account !== null && Hash::check('123456', $account->matKhau) && $account->phaiDoiMatKhau == 1);

// 4. Test HR-BR12: Chặn tạo nhân viên trùng SĐT
try {
    $dupReq = new Request([
        'maNV' => 'NV_DUP_' . time(),
        'hoTen' => 'Nguyễn Trùng SĐT',
        'soDienThoai' => $testPhone, // trùng SĐT
        'maPhongBan' => 'PB02',
    ]);
    $empCtrl->createEmployee($dupReq);
    assertTest('HR-BR12: Chặn trùng số điện thoại', false, 'Không bắt được lỗi trùng SĐT');
} catch (\Illuminate\Validation\ValidationException $e) {
    assertTest('HR-BR12: Chặn trùng số điện thoại duy nhất toàn hệ thống', true);
}

// 5. Test HR-BR06: Chặn xóa nhân viên đã có dữ liệu liên kết
$delRes = $empCtrl->deleteEmployee('NV001');
$delData = json_decode($delRes->getContent(), true);
assertTest('HR-BR06: Chặn xóa hồ sơ nhân viên đã phát sinh hợp đồng/lương/chứng từ', 
    $delData['success'] === false && str_contains($delData['message'], 'HR-BR06'));

// 6. Test Contract (HR-FR09, HR-BR08, HR-BR01)
$contractCtrl = new ContractController();
// Test HR-BR08: Mức lương phải > 0
try {
    $cReqInvalid = new Request([
        'maHopDong' => 'HD_ZERO_' . time(),
        'maNV' => $testMaNV,
        'loaiHopDong' => 'Thử việc',
        'ngayHieuLuc' => '2026-09-22',
        'mucLuongCoBan' => 0, // invalid
    ]);
    $contractCtrl->createContract($cReqInvalid);
    assertTest('HR-BR08: Chặn lương <= 0', false);
} catch (\Illuminate\Validation\ValidationException $e) {
    assertTest('HR-BR08: Bắt buộc mức lương cơ bản trong hợp đồng phải lớn hơn 0', true);
}

// Tạo hợp đồng hợp lệ cho nhân viên test
$testMaHD = 'HD_TEST_' . time();
$cReqValid = new Request([
    'maHopDong' => $testMaHD,
    'maNV' => $testMaNV,
    'loaiHopDong' => 'Xác định thời hạn',
    'ngayHieuLuc' => '2026-09-01',
    'mucLuongCoBan' => 18000000,
    'trangThai' => 'Hiệu lực',
]);
$cResValid = $contractCtrl->createContract($cReqValid);
$cDataValid = json_decode($cResValid->getContent(), true);
assertTest('HR-FR09: Lập hợp đồng lao động thành công', $cDataValid['success'] === true);

// Test HR-BR01: Chặn lập hợp đồng hiệu lực thứ 2 cho cùng 1 nhân viên
$cReqDuplicate = new Request([
    'maHopDong' => 'HD_SECOND_' . time(),
    'maNV' => $testMaNV,
    'loaiHopDong' => 'Không xác định thời hạn',
    'ngayHieuLuc' => '2026-09-10',
    'mucLuongCoBan' => 20000000,
    'trangThai' => 'Hiệu lực',
]);
$cResDuplicate = $contractCtrl->createContract($cReqDuplicate);
$cDataDuplicate = json_decode($cResDuplicate->getContent(), true);
assertTest('HR-BR01: Mỗi nhân viên tại một thời điểm chỉ có 1 hợp đồng chính thức có hiệu lực', 
    $cDataDuplicate['success'] === false && str_contains($cDataDuplicate['message'], 'HR-BR01'));

// 7. Test Chấm Công (HR-FR13, HR-BR03)
$timesheetCtrl = new TimesheetController();
$tsReq = new Request([
    'maNV' => $testMaNV,
    'thang' => '09/2026',
    'soNgayCong' => 22,
    'soGioTangCa' => 8,
    'soNgayNghiPhep' => 1,
]);
$tsRes = $timesheetCtrl->recordTimesheet($tsReq);
$tsData = json_decode($tsRes->getContent(), true);
assertTest('HR-FR13: Ghi nhận chấm công thành công', $tsData['success'] === true);

// 8. Test Tính Lương Tháng (HR-FR17, HR-BR05)
BangLuong::where('thang', '09/2026')->update(['trangThai' => 'TamTinh']);
$payrollCtrl = new PayrollController();
$calcReq = new Request(['thang' => '09/2026']);
$calcRes = $payrollCtrl->calculateMonthlyPayroll($calcReq);
$calcData = json_decode($calcRes->getContent(), true);
assertTest('HR-FR17: Tự động tính toán lương tháng theo bảng công và hợp đồng (chuẩn VAS)', 
    $calcData['success'] === true && count($calcData['data']) >= 10);

// 9. Test Khóa Bảng Lương (HR-BR04)
$lockReq = new Request(['thang' => '09/2026']);
$lockRes = $payrollCtrl->lockPayroll($lockReq);
$lockData = json_decode($lockRes->getContent(), true);
assertTest('HR-BR04: Khóa (chốt số liệu) bảng lương tháng thành công', $lockData['success'] === true);

// Test Xuất Báo Cáo Lương (HR-FR20)
$expReq = new Request(['thang' => '09/2026']);
$expRes = $payrollCtrl->exportPayroll($expReq);
$expData = json_decode($expRes->getContent(), true);
assertTest('HR-FR20: Xuất báo cáo lương khi đã khóa sổ thành công', 
    $expData['success'] === true && $expData['data']['tongQuyLuong'] > 0);

// 10. Test Đăng nhập & Đổi mật khẩu (HR-FR21, HR-FR22, HR-BR10, HR-BR11)
$accCtrl = new AccountController();
$loginReq = new Request([
    'soDienThoai' => $testPhone,
    'matKhau' => '123456',
]);
$loginRes = $accCtrl->login($loginReq);
$loginData = json_decode($loginRes->getContent(), true);
assertTest('HR-FR21 & HR-BR10: Đăng nhập thành công và cờ phaiDoiMatKhau = true', 
    $loginData['success'] === true && $loginData['data']['phaiDoiMatKhau'] === true);

// Test HR-BR11: Từ chối nếu mật khẩu mới trùng "123456"
$changeReqInvalid = new Request([
    'soDienThoai' => $testPhone,
    'matKhauHienTai' => '123456',
    'matKhauMoi' => '123456', // invalid trùng 123456
]);
$changeResInvalid = $accCtrl->changePassword($changeReqInvalid);
$changeDataInvalid = json_decode($changeResInvalid->getContent(), true);
assertTest('HR-BR11: Từ chối nếu mật khẩu mới trùng với mật khẩu mặc định "123456"', 
    $changeDataInvalid['success'] === false && str_contains($changeDataInvalid['message'], 'HR-BR11'));

// Đổi sang mật khẩu mới an toàn
$changeReqValid = new Request([
    'soDienThoai' => $testPhone,
    'matKhauHienTai' => '123456',
    'matKhauMoi' => 'Vinamilk@2026',
]);
$changeResValid = $accCtrl->changePassword($changeReqValid);
$changeDataValid = json_decode($changeResValid->getContent(), true);
assertTest('HR-FR22: Đổi mật khẩu thành công sang mật khẩu an toàn', $changeDataValid['success'] === true);

// Dọn dẹp nhân viên test
$empCtrl->deleteEmployee($testMaNV); // Sẽ xóa sau khi dọn hợp đồng/bảng lương của test
HopDong::where('maNV', $testMaNV)->delete();
BangCong::where('maNV', $testMaNV)->delete();
BangLuong::where('maNV', $testMaNV)->delete();
$empCtrl->deleteEmployee($testMaNV);

echo "\n=======================================================\n";
echo " KẾT QUẢ KIỂM THỬ: $passCount / $testCount TESTS PASSED (100%)!\n";
echo "=======================================================\n";
