<?php

declare(strict_types=1);

use App\Http\Controllers\Finance\MasterDataController;
use App\Http\Controllers\Finance\PhieuChiController;
use App\Http\Controllers\Finance\PhieuThuController;
use App\Http\Controllers\Finance\ReportController;
use App\Http\Middleware\RequireFinanceRole;
use App\Models\DanhMucChi;
use App\Models\DanhMucThu;
use App\Models\DoiTuongGiaoDich;
use App\Models\PhieuChi;
use App\Models\PhieuThu;
use App\Models\TaiKhoanQuy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function financeAssert(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function financeJson($response): array
{
    return $response->getData(true);
}

function financeRequest(array $data = [], ?string $role = null): Request
{
    $request = Request::create('/api/finance/test', 'PUT', $data);
    if ($role !== null) {
        $request->headers->set('X-User-Role', $role);
    }
    return $request;
}

$suffix = strtoupper(bin2hex(random_bytes(4)));
$errors = [];

DB::beginTransaction();
try {
    $account = TaiKhoanQuy::create([
        'maTaiKhoanQuy' => "TKQ-DOC-{$suffix}",
        'tenTaiKhoanQuy' => 'Tai khoan kiem thu chi',
        'loaiTaiKhoan' => 'TM',
        'soDuHienTai' => 1000000,
        'trangThai' => 1,
    ]);
    $revenueCategory = DanhMucThu::create([
        'maDanhMucThu' => "DMT-DOC-{$suffix}",
        'tenDanhMucThu' => 'Danh muc thu kiem thu',
        'trangThai' => 1,
    ]);
    $expenseCategory = DanhMucChi::create([
        'maDanhMucChi' => "DMC-DOC-{$suffix}",
        'tenDanhMucChi' => 'Danh muc chi kiem thu',
        'trangThai' => 1,
    ]);
    $counterparty = DoiTuongGiaoDich::first();
    financeAssert($counterparty !== null, 'Can it nhat mot doi tuong giao dich de kiem thu.');

    $master = new MasterDataController();
    financeAssert(method_exists($master, 'updateCounterparty'), 'Thieu API sua doi tuong giao dich.');
    $unauthorizedMutation = app(RequireFinanceRole::class)->handle(
        financeRequest(),
        fn () => response()->json(['success' => true]),
        'KeToanTruong',
    );
    financeAssert($unauthorizedMutation->getStatusCode() === 403, 'Route thay doi du lieu phai tu choi khi thieu vai tro.');

    try {
        $invalidCounterparty = financeJson($master->createCounterparty(financeRequest([
            'maDoiTuong' => "DT-KHAC-{$suffix}",
            'maThamChieu' => "REF-{$suffix}",
            'loaiDoiTuong' => 'Khac',
        ])));
        financeAssert($invalidCounterparty['success'] === false, 'Khong duoc cho phep doi tuong loai Khac ngoai cac bang nguon KH/NCC/NV.');
    } catch (Illuminate\Validation\ValidationException) {
        // Validation rejection is the expected HTTP 422 behavior.
    }

    $receiptController = new PhieuThuController();
    $invalidReceipt = financeJson($receiptController->createReceipt(financeRequest([
        'maPhieuThu' => "PT-DOC-{$suffix}",
        'ngayThu' => now()->toDateString(),
        'maDoiTuong' => $counterparty->maDoiTuong,
        'soTien' => 200000,
        'phuongThucThu' => 'TM',
        'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'items' => [[
            'maChiTietThu' => "CTT-DOC-{$suffix}",
            'maDanhMucThu' => $revenueCategory->maDanhMucThu,
            'soTien' => 100000,
        ]],
    ])));
    financeAssert($invalidReceipt['success'] === false, 'Tong chi tiet phieu thu phai bang so tien phieu.');

    $invalidPayment = financeJson((new PhieuChiController())->createPayment(financeRequest([
        'maPhieuChi' => "PC-DOC-{$suffix}",
        'ngayChi' => now()->toDateString(),
        'maDoiTuong' => $counterparty->maDoiTuong,
        'soTien' => 200000,
        'phuongThucChi' => 'TM',
        'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'items' => [[
            'maChiTietChi' => "CTC-DOC-{$suffix}",
            'maDanhMucChi' => $expenseCategory->maDanhMucChi,
            'soTien' => 100000,
        ]],
    ])));
    financeAssert($invalidPayment['success'] === false, 'Tong chi tiet phieu chi phai bang so tien phieu.');

    $validReceipt = financeJson($receiptController->createReceipt(financeRequest([
        'maPhieuThu' => "PT-CRUD-{$suffix}", 'ngayThu' => now()->toDateString(),
        'maDoiTuong' => $counterparty->maDoiTuong, 'lyDoThu' => 'Kiem thu CRUD',
        'soTien' => 100000, 'phuongThucThu' => 'TM', 'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'items' => [['maChiTietThu' => "CTT-CRUD-{$suffix}", 'maDanhMucThu' => $revenueCategory->maDanhMucThu, 'soTien' => 100000]],
    ])));
    financeAssert($validReceipt['success'] === true, 'Phai tao duoc phieu thu hop le.');
    $updatedReceipt = financeJson($receiptController->updateReceipt(financeRequest([
        'ngayThu' => now()->toDateString(), 'maDoiTuong' => $counterparty->maDoiTuong, 'lyDoThu' => 'Da sua',
        'soTien' => 120000, 'phuongThucThu' => 'TM', 'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'items' => [['maChiTietThu' => "CTT-CRUD-{$suffix}", 'maDanhMucThu' => $revenueCategory->maDanhMucThu, 'soTien' => 120000]],
    ]), "PT-CRUD-{$suffix}"));
    financeAssert($updatedReceipt['success'] === true && (float) $updatedReceipt['data']['soTien'] === 120000.0, 'Phai sua duoc phieu thu Moi.');
    $approvedReceipt = financeJson($receiptController->approveReceipt(financeRequest([], 'KeToanTruong'), "PT-CRUD-{$suffix}"));
    financeAssert($approvedReceipt['success'] === true, 'Ke toan truong phai duyet duoc phieu thu Moi.');
    financeAssert(DB::table('NhatKyThuChi')->where('maDoiTuong', "PT-CRUD-{$suffix}")->where('hanhDong', 'PheDuyet')->exists(), 'Duyet phieu phai tao nhat ky kiem toan.');

    $paymentController = new PhieuChiController();
    $validPayment = financeJson($paymentController->createPayment(financeRequest([
        'maPhieuChi' => "PC-CRUD-{$suffix}", 'ngayChi' => now()->toDateString(),
        'maDoiTuong' => $counterparty->maDoiTuong, 'lyDoChi' => 'Kiem chi CRUD',
        'soTien' => 100000, 'phuongThucChi' => 'TM', 'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'items' => [['maChiTietChi' => "CTC-CRUD-{$suffix}", 'maDanhMucChi' => $expenseCategory->maDanhMucChi, 'soTien' => 100000]],
    ])));
    financeAssert($validPayment['success'] === true, 'Phai tao duoc phieu chi hop le.');
    $updatedPayment = financeJson($paymentController->updatePayment(financeRequest([
        'ngayChi' => now()->toDateString(), 'maDoiTuong' => $counterparty->maDoiTuong, 'lyDoChi' => 'Da sua',
        'soTien' => 90000, 'phuongThucChi' => 'TM', 'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'items' => [['maChiTietChi' => "CTC-CRUD-{$suffix}", 'maDanhMucChi' => $expenseCategory->maDanhMucChi, 'soTien' => 90000]],
    ]), "PC-CRUD-{$suffix}"));
    financeAssert($updatedPayment['success'] === true && (float) $updatedPayment['data']['soTien'] === 90000.0, 'Phai sua duoc phieu chi Moi.');
    $sentPayment = financeJson($paymentController->sendToReconcile(financeRequest([], 'KeToanTruong'), "PC-CRUD-{$suffix}"));
    financeAssert($sentPayment['success'] === true, 'Phai chuyen duoc phieu chi Moi sang ChoDoiSoat.');
    $paymentReport = financeJson((new ReportController())->getReconciliationReport(financeRequest()));
    financeAssert(in_array("PC-CRUD-{$suffix}", collect($paymentReport['data']['pendingReconciliation']['items'])->pluck('maPhieu')->all(), true), 'Bao cao doi soat phai hien phieu chi ChoDoiSoat.');
    $completedPayment = financeJson($paymentController->completeReconciliation(financeRequest([], 'KeToanTruong'), "PC-CRUD-{$suffix}"));
    financeAssert($completedPayment['success'] === true, 'Phai khop lenh va ghi so duoc phieu chi ChoDoiSoat.');
    financeAssert(DB::table('NhatKyThuChi')->where('maDoiTuong', "PC-CRUD-{$suffix}")->where('hanhDong', 'PheDuyet')->exists(), 'Khap lenh phieu chi phai tao nhat ky kiem toan.');

    $receiptToDelete = PhieuThu::create([
        'maPhieuThu' => "PT-DELETE-{$suffix}", 'ngayThu' => now()->toDateString(),
        'soTien' => 1, 'phuongThucThu' => 'TM', 'trangThai' => 'Moi', 'nguoiLap' => 'NV002', 'ngayLap' => now(),
    ]);
    financeAssert(financeJson($receiptController->deleteReceipt($receiptToDelete->maPhieuThu))['success'] === true, 'Phai xoa duoc phieu thu Moi.');
    $paymentToDelete = PhieuChi::create([
        'maPhieuChi' => "PC-DELETE-{$suffix}", 'ngayChi' => now()->toDateString(),
        'soTien' => 1, 'phuongThucChi' => 'TM', 'trangThai' => 'Moi', 'nguoiLap' => 'NV002', 'ngayLap' => now(),
    ]);
    financeAssert(financeJson($paymentController->deletePayment($paymentToDelete->maPhieuChi))['success'] === true, 'Phai xoa duoc phieu chi Moi.');

    $receipt = PhieuThu::create([
        'maPhieuThu' => "PT-AUTH-{$suffix}", 'ngayThu' => now()->toDateString(),
        'maDoiTuong' => $counterparty->maDoiTuong, 'soTien' => 100000,
        'phuongThucThu' => 'TM', 'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'trangThai' => 'Moi', 'nguoiLap' => 'NV002', 'ngayLap' => now(),
    ]);
    $deniedApproval = $receiptController->approveReceipt(financeRequest(), $receipt->maPhieuThu);
    financeAssert($deniedApproval->getStatusCode() === 403, 'Duyet phieu khong co vai tro phai bi tu choi.');

    $payment = PhieuChi::create([
        'maPhieuChi' => "PC-DS-{$suffix}", 'ngayChi' => now()->toDateString(),
        'maDoiTuong' => $counterparty->maDoiTuong, 'soTien' => 100000,
        'phuongThucChi' => 'CK', 'maTaiKhoanQuy' => $account->maTaiKhoanQuy,
        'trangThai' => 'ChoDoiSoat', 'nguoiLap' => 'NV002', 'ngayLap' => now(),
    ]);
    $reconciliation = financeJson((new ReportController())->getReconciliationReport(financeRequest()));
    $pendingCodes = collect($reconciliation['data']['pendingReconciliation']['items'])->pluck('maPhieu')->all();
    financeAssert(in_array($payment->maPhieuChi, $pendingCodes, true), 'Bao cao doi soat phai hien ca phieu chi ChoDoiSoat.');

    financeAssert(Schema::hasTable('NhatKyThuChi'), 'Thieu nhat ky kiem toan thay doi trang thai va so du.');
} catch (Throwable $exception) {
    $errors[] = $exception->getMessage();
} finally {
    DB::rollBack();
}

if ($errors !== []) {
    fwrite(STDERR, "FAILED: " . implode("\n", $errors) . PHP_EOL);
    exit(1);
}

echo "PASS: Finance document rules\n";
