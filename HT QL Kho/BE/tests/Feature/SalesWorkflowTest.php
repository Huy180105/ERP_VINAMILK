<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesWorkflowTest extends TestCase
{
    private const API = '/api/warehouse/sales';

    protected function setUp(): void
    {
        parent::setUp();
        // Independent in-memory database, never use or reset the user's ERP database.
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        DB::purge('sqlite');
        (require database_path('migrations/0001_01_01_000000_create_users_table.php'))->up();
        (require database_path('migrations/2026_09_09_162722_create_personal_access_tokens_table.php'))->up();
        $tables = [
            'NhanVien' => 'maNV VARCHAR(20) PRIMARY KEY, hoTen TEXT NOT NULL, maPhongBan VARCHAR(20), trangThai TEXT',
            'Kho' => 'maKho VARCHAR(20) PRIMARY KEY, tenKho TEXT NOT NULL',
            'KhachHang' => 'maKhachHang VARCHAR(20) PRIMARY KEY, tenKhachHang TEXT NOT NULL, soDienThoai TEXT, diaChi TEXT, hanMucCongNo DECIMAL(18,2) DEFAULT 0',
            'SanPham' => 'maSanPham VARCHAR(20) PRIMARY KEY, tenSanPham TEXT NOT NULL, donViTinh TEXT, donGia DECIMAL(15,2) DEFAULT 0, trangThai TEXT',
            'DonHang' => 'maDonHang VARCHAR(20) PRIMARY KEY, ngayMua DATETIME, tongTien DECIMAL(18,2), thanhTien DECIMAL(18,2), trangThai TEXT, maKhachHang VARCHAR(20), maNhanVien VARCHAR(20), FOREIGN KEY(maKhachHang) REFERENCES KhachHang(maKhachHang)',
            'ChiTietDonHang' => 'maDonHang VARCHAR(20), maSanPham VARCHAR(20), soLuong INTEGER, donGia DECIMAL(18,2), thanhTien DECIMAL(18,2), PRIMARY KEY(maDonHang,maSanPham), FOREIGN KEY(maDonHang) REFERENCES DonHang(maDonHang) ON DELETE CASCADE, FOREIGN KEY(maSanPham) REFERENCES SanPham(maSanPham)',
            'TonKho' => 'maTonKho VARCHAR(50) PRIMARY KEY, maSP VARCHAR(20), tenTonKho TEXT, ngaySanXuat DATE, hanSuDung DATE, soLuongTonHienTai INTEGER, trangThai TEXT',
            'PhieuXuatSP' => 'maPhieuXuatSP VARCHAR(20) PRIMARY KEY, maKhachHang VARCHAR(20), maNVTao VARCHAR(20), ngayXuat DATE, trangThai TEXT, ghiChu TEXT, maDonHang VARCHAR(20)',
            'ChiTietPhieuXuatSP' => 'maPhieuXuatSP VARCHAR(20), maTonKho VARCHAR(50), soLuong INTEGER, PRIMARY KEY(maPhieuXuatSP,maTonKho), FOREIGN KEY(maPhieuXuatSP) REFERENCES PhieuXuatSP(maPhieuXuatSP) ON DELETE CASCADE, FOREIGN KEY(maTonKho) REFERENCES TonKho(maTonKho)',
            'GiaoHang' => 'maGiaoHang VARCHAR(20) PRIMARY KEY, ngayGiao DATETIME, diaChiGiao TEXT, trangThai TEXT, maDonHang VARCHAR(20), maPhieuXuat VARCHAR(20), maKhachHang VARCHAR(20), maNhanVien VARCHAR(20), FOREIGN KEY(maPhieuXuat) REFERENCES PhieuXuatSP(maPhieuXuatSP)',
            'HoaDon' => 'maHoaDon VARCHAR(20) PRIMARY KEY, ngayLap DATETIME, tongTien DECIMAL(18,2), maGiaoHang VARCHAR(20), FOREIGN KEY(maGiaoHang) REFERENCES GiaoHang(maGiaoHang)',
            'CongNo' => 'maCongNo VARCHAR(20) PRIMARY KEY, soTienNo DECIMAL(18,2), soTienDaTra DECIMAL(18,2), soTienConLai DECIMAL(18,2), hanThanhToan DATE, trangThai TEXT, maHoaDon VARCHAR(20), maKhachHang VARCHAR(20), FOREIGN KEY(maHoaDon) REFERENCES HoaDon(maHoaDon)',
            'ThanhToan' => 'maThanhToan VARCHAR(20) PRIMARY KEY, maCongNo VARCHAR(20), ngayThanhToan DATETIME, phuongThuc TEXT, FOREIGN KEY(maCongNo) REFERENCES CongNo(maCongNo)',
        ];
        foreach ($tables as $name => $columns) {
            DB::statement("CREATE TABLE $name ($columns)");
        }
        (require database_path('migrations/2026_09_24_000001_extend_sales_workflow.php'))->up();
        (require database_path('migrations/2026_09_24_000002_link_invoice_to_order.php'))->up();
        DB::table('NhanVien')->insert([['maNV' => 'NV1', 'hoTen' => 'Quản lý', 'maPhongBan' => 'PB05', 'trangThai' => 'Đang làm việc'], ['maNV' => 'NV2', 'hoTen' => 'Nhân viên', 'maPhongBan' => 'PB05', 'trangThai' => 'Đang làm việc']]);
        DB::table('Kho')->insert([['maKho' => 'K1', 'tenKho' => 'Kho 1'], ['maKho' => 'K2', 'tenKho' => 'Kho 2']]);
        DB::table('KhachHang')->insert(['maKhachHang' => 'KH1', 'tenKhachHang' => 'Đại lý 1', 'diaChi' => 'Hà Nội', 'hanMucCongNo' => 10000, 'maNhanVienPhuTrach' => 'NV1']);
        DB::table('SanPham')->insert(['maSanPham' => 'SP1', 'tenSanPham' => 'Sữa tươi', 'donGia' => 100, 'trangThai' => 'Đang kinh doanh']);
        DB::table('TonKho')->insert(['maTonKho' => 'LOT1', 'maSP' => 'SP1', 'maKho' => 'K1', 'soLuongTonHienTai' => 10, 'hanSuDung' => today()->addMonth()->toDateString(), 'trangThai' => 'Còn hạn']);
        $user = new User(['name' => 'Quản lý', 'email' => 'manager@example.test', 'password' => 'test-password-long']);
        $user->sales_role = 'manager';
        $user->maNhanVien = 'NV1';
        $user->save();
        Sanctum::actingAs($user, ['sales']);
    }

    private function payload(int $quantity = 5): array
    {
        return ['maDonHang' => 'DH1', 'maKhachHang' => 'KH1', 'maKho' => 'K1', 'items' => [['maSanPham' => 'SP1', 'soLuong' => $quantity, 'donGia' => 1]]];
    }

    private function confirmOrder(): string
    {
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated();

        return DB::table('PhieuXuatSP')->value('maPhieuXuatSP');
    }

    private function delivery(): string
    {
        $dispatch = $this->confirmOrder();
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();

        return DB::table('GiaoHang')->where('maPhieuXuat', $dispatch)->value('maGiaoHang');
    }

    private function invoice(): string
    {
        $delivery = $this->delivery();
        $this->putJson(self::API."/deliveries/$delivery/status", ['trangThai' => 'Đang giao'])->assertOk();

        return DB::table('HoaDon')->value('maHoaDon');
    }

    public function test_five_order_decision_cases_in_word(): void
    {
        $data = $this->payload();
        unset($data['maKhachHang']);
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable()->assertJsonValidationErrors('maKhachHang');
        $data = $this->payload();
        $data['items'] = [];
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable()->assertJsonValidationErrors('items');
        $this->postJson(self::API.'/orders', $this->payload(-1))->assertUnprocessable();
        $this->postJson(self::API.'/orders', $this->payload(11))->assertUnprocessable();
        $this->assertDatabaseCount('DonHang', 0);
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated()->assertJsonPath('data.thanhTien', 500);
        $this->assertDatabaseHas('ChiTietDonHang', ['donGia' => 100, 'soLuong' => 5]);
    }

    public function test_duplicate_products_and_codes_are_rejected_without_partial_writes(): void
    {
        $data = $this->payload();
        $data['items'][] = $data['items'][0];
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        $this->assertDatabaseCount('DonHang', 0);
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated();
        $this->postJson(self::API.'/orders', $this->payload())->assertUnprocessable();
        $this->assertDatabaseCount('DonHang', 1);
    }

    public function test_stock_is_filtered_by_warehouse_expiry_and_reservations(): void
    {
        $data = $this->payload();
        $data['maKho'] = 'K2';
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        DB::table('TonKho')->update(['hanSuDung' => today()->subDay()->toDateString()]);
        $this->postJson(self::API.'/orders', $this->payload())->assertUnprocessable();
        DB::table('TonKho')->update(['hanSuDung' => today()->addDay()->toDateString()]);
        $this->confirmOrder();
        $data = $this->payload(6);
        $data['maDonHang'] = 'DH2';
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        $this->getJson(self::API.'/inventory')->assertOk()->assertJsonPath('data.0.khaDung', 5);
    }

    public function test_order_checks_stock_on_save_and_only_warehouse_confirms_it(): void
    {
        DB::table('TonKho')->update(['soLuongTonHienTai' => 2]);
        $this->postJson(self::API.'/orders', $this->payload())->assertUnprocessable()->assertJsonValidationErrors('business');
        $this->assertDatabaseCount('DonHang', 0);
        $this->assertDatabaseCount('PhieuXuatSP', 0);
        DB::table('TonKho')->update(['soLuongTonHienTai' => 10]);
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated()->assertJsonPath('data.trangThai', 'Chờ kho xác nhận');
        $this->putJson(self::API.'/orders/DH1/status', ['trangThai' => 'Đã giao hàng'])->assertUnprocessable();
        $this->putJson(self::API.'/orders/DH1/status', ['trangThai' => 'Đã xác nhận'])->assertUnprocessable();
        $this->assertDatabaseCount('PhieuXuatSP', 1);
        $this->assertDatabaseHas('DonHang', ['trangThai' => 'Chờ kho xác nhận']);
        $this->putJson(self::API.'/orders/missing/status', ['trangThai' => 'Đã hủy'])->assertNotFound();
    }

    public function test_edit_search_cancel_and_delete(): void
    {
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated();
        $this->putJson(self::API.'/orders/DH1', $this->payload(11))->assertUnprocessable();
        $this->assertDatabaseHas('ChiTietDonHang', ['soLuong' => 5]);
        $this->putJson(self::API.'/orders/DH1', $this->payload(3))->assertOk();
        $this->getJson(self::API.'/orders?keyword=KH1')->assertJsonCount(1, 'data');
        $this->getJson(self::API.'/orders?keyword=missing')->assertJsonCount(0, 'data');
        $this->putJson(self::API.'/orders/DH1/status', ['trangThai' => 'Đã hủy'])->assertOk();
        $this->getJson(self::API.'/inventory')->assertJsonPath('data.0.khaDung', 10);
        $this->deleteJson(self::API.'/orders/DH1')->assertOk();
        $this->assertDatabaseCount('DonHang', 0);
        $this->assertDatabaseCount('ChiTietDonHang', 0);
    }

    public function test_export_is_idempotent_and_prevents_exporting_more_than_ordered(): void
    {
        $dispatch = $this->confirmOrder();
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $this->assertDatabaseHas('TonKho', ['soLuongTonHienTai' => 5]);
        $this->assertDatabaseCount('GiaoHang', 1);
        $delivery = DB::table('GiaoHang')->value('maGiaoHang');
        $this->putJson(self::API."/deliveries/$delivery/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $this->assertDatabaseHas('DonHang', ['maDonHang' => 'DH1', 'trangThai' => 'Đang giao']);
        DB::table('PhieuXuatSP')->insert(['maPhieuXuatSP' => 'PX2', 'maDonHang' => 'DH1', 'trangThai' => 'Chờ duyệt']);
        DB::table('ChiTietPhieuXuatSP')->insert(['maPhieuXuatSP' => 'PX2', 'maTonKho' => 'LOT1', 'soLuong' => 1]);
        $this->putJson(self::API.'/dispatches/PX2/complete')->assertUnprocessable();
        $this->deleteJson(self::API.'/orders/DH1')->assertUnprocessable();
        $this->assertDatabaseHas('TonKho', ['soLuongTonHienTai' => 5]);
    }

    public function test_delivery_requires_completed_export_and_cannot_reuse_it(): void
    {
        $dispatch = $this->confirmOrder();
        $data = ['maDonHang' => 'DH1', 'maPhieuXuat' => $dispatch, 'maNhanVien' => 'NV2', 'diaChiGiao' => 'Hà Nội', 'ngayGiao' => today()->toDateString()];
        $this->postJson(self::API.'/deliveries', $data)->assertUnprocessable();
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $id = DB::table('GiaoHang')->where('maPhieuXuat', $dispatch)->value('maGiaoHang');
        $this->assertNotNull($id);
        $this->assertDatabaseHas('DonHang', ['maDonHang' => 'DH1', 'trangThai' => 'Đã xác nhận']);
        $this->postJson(self::API.'/deliveries', $data)->assertUnprocessable();
        $this->putJson(self::API."/deliveries/$id/status", ['trangThai' => 'Đã giao'])->assertUnprocessable();
        $this->putJson(self::API."/deliveries/$id/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->putJson(self::API."/deliveries/$id/status", ['trangThai' => 'Đã giao'])->assertOk();
        $this->assertDatabaseHas('DonHang', ['trangThai' => 'Đã giao hàng']);
    }

    public function test_delivery_driver_is_assigned_automatically_and_queue_advances(): void
    {
        DB::table('TonKho')->update(['soLuongTonHienTai' => 30]);
        $deliveries = [];
        foreach (['DH1', 'DH2', 'DH3'] as $orderId) {
            $payload = $this->payload(1);
            $payload['maDonHang'] = $orderId;
            $this->postJson(self::API.'/orders', $payload)->assertCreated();
            $dispatch = DB::table('PhieuXuatSP')->where('maDonHang', $orderId)->value('maPhieuXuatSP');
            $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
            $deliveries[] = DB::table('GiaoHang')->where('maDonHang', $orderId)->value('maGiaoHang');
        }
        $this->assertDatabaseHas('GiaoHang', ['maGiaoHang' => $deliveries[0], 'maNhanVien' => 'NV1', 'trangThai' => 'Chờ giao']);
        $this->assertDatabaseHas('GiaoHang', ['maGiaoHang' => $deliveries[1], 'maNhanVien' => 'NV2', 'trangThai' => 'Chờ giao']);
        $this->assertDatabaseHas('GiaoHang', ['maGiaoHang' => $deliveries[2], 'maNhanVien' => null, 'trangThai' => 'Chờ phân công']);
        $this->putJson(self::API."/deliveries/{$deliveries[0]}/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->putJson(self::API."/deliveries/{$deliveries[0]}/status", ['trangThai' => 'Đã giao'])->assertOk();
        $this->assertDatabaseHas('GiaoHang', ['maGiaoHang' => $deliveries[2], 'maNhanVien' => 'NV1', 'trangThai' => 'Chờ giao']);
        $this->putJson(self::API."/deliveries/{$deliveries[1]}/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->putJson(self::API."/deliveries/{$deliveries[1]}/status", ['trangThai' => 'Đã giao'])->assertOk();
        $this->putJson(self::API."/deliveries/{$deliveries[2]}/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->putJson(self::API."/deliveries/{$deliveries[2]}/status", ['trangThai' => 'Giao thất bại'])->assertOk();
        $this->assertDatabaseHas('GiaoHang', ['maGiaoHang' => $deliveries[2], 'maNhanVien' => 'NV2', 'trangThai' => 'Chờ giao']);
    }

    public function test_invoice_is_created_with_order_and_linked_after_warehouse_confirmation(): void
    {
        $dispatch = $this->confirmOrder();
        $invoice = DB::table('HoaDon')->value('maHoaDon');
        $this->assertNotNull($invoice);
        $this->assertDatabaseHas('HoaDon', ['maHoaDon' => $invoice, 'maDonHang' => 'DH1', 'maGiaoHang' => null, 'tongTien' => 500]);
        $this->assertDatabaseHas('CongNo', ['maHoaDon' => $invoice, 'soTienConLai' => 500]);
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $delivery = DB::table('GiaoHang')->value('maGiaoHang');
        $this->assertDatabaseHas('HoaDon', ['maHoaDon' => $invoice, 'maGiaoHang' => $delivery]);
        $this->postJson(self::API.'/invoices', ['maGiaoHang' => $delivery, 'hanThanhToan' => today()->addDay()->toDateString()])->assertUnprocessable();
        $this->getJson(self::API."/invoices/$invoice")->assertOk()->assertJsonCount(1, 'data.items');
    }

    public function test_partial_payment_pending_transfer_reconciliation_and_overpayment(): void
    {
        $this->invoice();
        $debt = DB::table('CongNo')->value('maCongNo');
        $cash = ['maThanhToan' => 'TT1', 'maCongNo' => $debt, 'soTien' => 200, 'phuongThuc' => 'Tiền mặt'];
        $this->postJson(self::API.'/payments', $cash)->assertCreated();
        $this->postJson(self::API.'/payments', $cash)->assertUnprocessable();
        $this->assertDatabaseHas('CongNo', ['soTienDaTra' => 200, 'soTienConLai' => 300]);
        $this->getJson(self::API.'/invoices')->assertJsonPath('data.0.trangThaiThanhToan', 'Thanh toán một phần');
        $wire = ['maThanhToan' => 'TT2', 'maCongNo' => $debt, 'soTien' => 300, 'phuongThuc' => 'Chuyển khoản', 'thamChieu' => 'BANK001'];
        $this->postJson(self::API.'/payments', $wire)->assertCreated();
        $this->assertDatabaseHas('CongNo', ['soTienConLai' => 300]);
        $cash['maThanhToan'] = 'TT3';
        $this->postJson(self::API.'/payments', $cash)->assertUnprocessable();
        $this->getJson(self::API.'/invoices')->assertJsonPath('data.0.trangThaiThanhToan', 'Chờ đối soát');
        $this->putJson(self::API.'/payments/TT2', ['trangThai' => 'Đã xác nhận'])->assertOk();
        $this->putJson(self::API.'/payments/TT2', ['trangThai' => 'Đã xác nhận'])->assertUnprocessable();
        $this->assertDatabaseHas('CongNo', ['soTienDaTra' => 500, 'soTienConLai' => 0]);
        $this->getJson(self::API.'/invoices')->assertJsonPath('data.0.trangThaiThanhToan', 'Đã thanh toán');
    }

    public function test_customer_deactivation_and_prices_preserve_history(): void
    {
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated();
        $this->putJson(self::API.'/prices/SP1', ['donGia' => 150])->assertOk();
        $this->putJson(self::API.'/orders/DH1', $this->payload(4))->assertOk();
        $this->assertDatabaseHas('ChiTietDonHang', ['donGia' => 100]);
        $this->deleteJson(self::API.'/prices/SP1')->assertOk();
        $data = $this->payload();
        $data['maDonHang'] = 'DH2';
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        $this->putJson(self::API.'/prices/SP1', ['donGia' => 150])->assertOk();
        $this->deleteJson(self::API.'/customers/KH1')->assertOk();
        $this->assertDatabaseHas('KhachHang', ['hoatDong' => 0]);
        $this->assertDatabaseCount('DonHang', 1);
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
    }

    public function test_staff_cannot_access_other_customers_or_manager_actions(): void
    {
        $this->postJson(self::API.'/orders', $this->payload())->assertCreated();
        $user = User::first();
        $user->sales_role = 'staff';
        $user->maNhanVien = 'NV2';
        $user->save();
        Sanctum::actingAs($user, ['sales']);
        $this->getJson(self::API.'/orders')->assertJsonCount(0, 'data');
        $this->getJson(self::API.'/customers')->assertJsonCount(0, 'data');
        $this->deleteJson(self::API.'/orders/DH1')->assertNotFound();
        $this->putJson(self::API.'/prices/SP1', ['donGia' => 1])->assertForbidden();
        $this->putJson(self::API.'/inventory/LOT1', ['maKho' => 'K2'])->assertForbidden();
    }

    public function test_dashboard_and_authentication(): void
    {
        $this->getJson(self::API.'/dashboard')->assertOk()->assertJsonPath('data.summary.orders', 0);
        auth()->forgetGuards();
        $this->getJson(self::API.'/orders')->assertOk();
        $this->postJson(self::API.'/login', ['email' => 'manager@example.test', 'password' => 'bad'])->assertUnprocessable();
        $this->postJson(self::API.'/login', ['email' => 'manager@example.test', 'password' => 'test-password-long'])->assertOk()->assertJsonStructure(['data' => ['token', 'user']]);
    }

    public function test_full_cash_payment_does_not_require_a_credit_limit(): void
    {
        $id = $this->delivery();
        DB::table('KhachHang')->update(['hanMucCongNo' => 0]);
        $debt = DB::table('CongNo')->value('maCongNo');
        $this->putJson(self::API."/deliveries/$id/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->postJson(self::API.'/payments', ['maThanhToan' => 'TTCASH', 'maCongNo' => $debt, 'soTien' => 500, 'phuongThuc' => 'Tiền mặt'])->assertCreated();
        $this->assertDatabaseHas('CongNo', ['soTienDaTra' => 500, 'soTienConLai' => 0]);
        $this->assertDatabaseHas('ThanhToan', ['soTien' => 500, 'trangThai' => 'Đã xác nhận']);
    }

    public function test_rejected_transfer_preserves_debt_and_releases_pending_amount(): void
    {
        $this->invoice();
        $id = DB::table('CongNo')->value('maCongNo');
        $data = ['maThanhToan' => 'TT1', 'maCongNo' => $id, 'soTien' => 500, 'phuongThuc' => 'Chuyển khoản', 'thamChieu' => 'BANK2'];
        $this->postJson(self::API.'/payments', $data)->assertCreated();
        $this->putJson(self::API.'/payments/TT1', ['trangThai' => 'Từ chối'])->assertOk();
        $this->assertDatabaseHas('CongNo', ['soTienConLai' => 500]);
        $data['maThanhToan'] = 'TT2';
        $data['phuongThuc'] = 'Tiền mặt';
        $this->postJson(self::API.'/payments', $data)->assertCreated();
        $this->assertDatabaseHas('CongNo', ['soTienConLai' => 0]);
    }

    public function test_staff_cannot_raise_credit_limit(): void
    {
        $delivery = $this->delivery();
        $user = User::first();
        $user->sales_role = 'staff';
        $user->save();
        Sanctum::actingAs($user, ['sales']);
        $this->putJson(self::API.'/customers/KH1', ['tenKhachHang' => 'Đại lý 1', 'diaChi' => 'Hà Nội', 'hanMucCongNo' => 99999])->assertForbidden();
        $this->assertDatabaseCount('HoaDon', 1);
    }

    public function test_fefo_allocation_and_unassigned_lots(): void
    {
        DB::table('TonKho')->insert(['maTonKho' => 'LOT2', 'maSP' => 'SP1', 'maKho' => 'K1', 'soLuongTonHienTai' => 2, 'hanSuDung' => today()->addDay()->toDateString(), 'trangThai' => 'Còn hạn']);
        $dispatch = $this->confirmOrder();
        $this->assertDatabaseHas('ChiTietPhieuXuatSP', ['maPhieuXuatSP' => $dispatch, 'maTonKho' => 'LOT2', 'soLuong' => 2]);
        $this->assertDatabaseHas('ChiTietPhieuXuatSP', ['maPhieuXuatSP' => $dispatch, 'maTonKho' => 'LOT1', 'soLuong' => 3]);
        $this->putJson(self::API.'/inventory/LOT1', ['maKho' => 'K2'])->assertUnprocessable();
        $this->putJson(self::API.'/orders/DH1/status', ['trangThai' => 'Đã hủy'])->assertOk();
        DB::table('TonKho')->update(['maKho' => null]);
        $data = $this->payload();
        $data['maDonHang'] = 'DH2';
        $this->postJson(self::API.'/orders', $data)->assertCreated()->assertJsonPath('data.maKho', 'K1');
        $this->putJson(self::API.'/inventory/LOT1', ['maKho' => 'K1'])->assertUnprocessable();
    }

    public function test_customer_crud_unique_code_and_overdue_status(): void
    {
        $data = ['tenKhachHang' => 'Đại lý mới', 'diaChi' => 'Đà Nẵng', 'hanMucCongNo' => 1000];
        $customerId = $this->postJson(self::API.'/customers', $data)->assertOk()->json('data.maKhachHang');
        $otherId = $this->postJson(self::API.'/customers', $data)->assertOk()->json('data.maKhachHang');
        $this->assertMatchesRegularExpression('/^KH[A-F0-9]{18}$/', $customerId);
        $this->assertNotSame($customerId, $otherId);
        $data['tenKhachHang'] = 'Đại lý cập nhật';
        $this->putJson(self::API."/customers/$customerId", $data)->assertOk();
        $this->getJson(self::API."/customers?keyword=$customerId")->assertJsonCount(1, 'data');
        $this->invoice();
        $id = DB::table('CongNo')->value('maCongNo');
        $this->putJson(self::API."/receivables/$id", ['hanThanhToan' => today()->subDay()->toDateString()])->assertOk();
        $this->getJson(self::API.'/receivables')->assertJsonPath('data.0.trangThai', 'Quá hạn');
    }

    public function test_new_customer_uses_authenticated_employee_and_ignores_client_identity(): void
    {
        $payload = ['maKhachHang' => 'CUSTOM', 'tenKhachHang' => 'Khách mới', 'diaChi' => 'Hà Nội', 'hanMucCongNo' => 0, 'maNhanVienPhuTrach' => 'NV2', 'hoatDong' => false];
        $token = User::first()->createToken('test-sales', ['sales'])->plainTextToken;
        auth()->forgetGuards();
        $response = $this->withToken($token)->postJson(self::API.'/customers', $payload)->assertOk()->assertJsonPath('data.maNhanVienPhuTrach', 'NV1');
        $id = $response->json('data.maKhachHang');
        $this->assertNotSame('CUSTOM', $id);
        $this->assertDatabaseHas('KhachHang', ['maKhachHang' => $id, 'hoatDong' => 1]);
        $this->deleteJson(self::API."/customers/$id")->assertOk();
        $this->putJson(self::API."/customers/$id", ['tenKhachHang' => 'Đã sửa', 'diaChi' => 'Hà Nội', 'hanMucCongNo' => 0, 'maNhanVienPhuTrach' => 'NV2'])->assertOk();
        $this->assertDatabaseHas('KhachHang', ['maKhachHang' => $id, 'maNhanVienPhuTrach' => 'NV1', 'hoatDong' => 0]);
    }

    public function test_new_customer_without_session_has_no_assigned_employee(): void
    {
        auth()->forgetGuards();
        $response = $this->postJson(self::API.'/customers', ['tenKhachHang' => 'Khách mới', 'diaChi' => 'Hà Nội', 'hanMucCongNo' => 0, 'maNhanVienPhuTrach' => 'NV1', 'hoatDong' => false])->assertOk()->assertJsonPath('data.maNhanVienPhuTrach', null);
        $this->assertDatabaseHas('KhachHang', ['maKhachHang' => $response->json('data.maKhachHang'), 'hoatDong' => 1]);
    }

    public function test_warehouse_dispatch_works_without_login_and_preserves_explicit_staff_restrictions(): void
    {
        $dispatch = $this->confirmOrder();
        $url = "/api/warehouse/outbound/products/$dispatch/complete";
        auth()->forgetGuards();
        $this->putJson($url)->assertOk();
        $user = User::first();
        $user->sales_role = 'staff'; $user->save(); Sanctum::actingAs($user, ['sales']);
        $this->putJson($url)->assertForbidden();
        $user->sales_role = 'manager'; $user->save(); Sanctum::actingAs($user, ['sales']);
        $this->putJson($url)->assertOk();
        $this->putJson($url)->assertOk();
        $this->assertDatabaseHas('TonKho', ['soLuongTonHienTai' => 5]);
    }

    public function test_sales_workflow_without_login_leaves_employee_empty(): void
    {
        auth()->forgetGuards();
        $this->getJson(self::API.'/dashboard')->assertOk();
        $data = $this->payload() + ['maNhanVien' => 'NV2'];
        unset($data['maKho']);
        $this->postJson(self::API.'/orders', $data)->assertCreated();
        $this->assertDatabaseHas('DonHang', ['maDonHang' => 'DH1', 'maNhanVien' => null, 'maKho' => 'K1']);
        $this->assertDatabaseHas('PhieuXuatSP', ['maDonHang' => 'DH1', 'maNVTao' => null]);
        $dispatch = DB::table('PhieuXuatSP')->value('maPhieuXuatSP');
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $delivery = DB::table('GiaoHang')->where('maPhieuXuat', $dispatch)->value('maGiaoHang');
        $this->assertDatabaseCount('HoaDon', 1);
        $debt = DB::table('CongNo')->value('maCongNo');
        $this->putJson(self::API."/deliveries/$delivery/status", ['trangThai' => 'Đang giao'])->assertOk();
        $this->postJson(self::API.'/payments', ['maThanhToan' => 'TTOPEN', 'maCongNo' => $debt, 'soTien' => 500, 'phuongThuc' => 'Tiền mặt'])->assertCreated();
        $this->assertDatabaseHas('ThanhToan', ['maThanhToan' => 'TTOPEN', 'nguoiGhiNhan' => null]);
        $this->assertDatabaseHas('CongNo', ['maCongNo' => $debt, 'soTienConLai' => 0]);
    }

    public function test_order_automatically_selects_stock_and_uses_session_employee(): void
    {
        DB::table('TonKho')->update(['soLuongTonHienTai' => 2]);
        DB::table('TonKho')->insert(['maTonKho' => 'LOT2', 'maSP' => 'SP1', 'maKho' => 'K2', 'soLuongTonHienTai' => 10, 'hanSuDung' => today()->addMonth()->toDateString(), 'trangThai' => 'Còn hạn']);
        $data = $this->payload() + ['maNhanVien' => 'NV2'];
        unset($data['maKho']);
        $this->postJson(self::API.'/orders', $data)->assertCreated()->assertJsonPath('data.maKho', 'K2')->assertJsonPath('data.maNhanVien', 'NV1');
        // A different manager editing the order must not take ownership of it.
        $user = User::first(); $user->maNhanVien = 'NV2'; $user->save(); Sanctum::actingAs($user, ['sales']);
        $this->putJson(self::API.'/orders/DH1', $data)->assertOk()->assertJsonPath('data.maNhanVien', 'NV1');
        $dispatch = DB::table('PhieuXuatSP')->value('maPhieuXuatSP');
        $this->assertDatabaseHas('ChiTietPhieuXuatSP', ['maPhieuXuatSP' => $dispatch, 'maTonKho' => 'LOT2', 'soLuong' => 5]);
        $this->putJson(self::API."/dispatches/$dispatch/complete")->assertOk();
        $this->assertDatabaseHas('TonKho', ['maTonKho' => 'LOT1', 'soLuongTonHienTai' => 2]);
    }

    public function test_auto_warehouse_does_not_combine_warehouses_or_use_ineligible_stock(): void
    {
        DB::table('TonKho')->update(['soLuongTonHienTai' => 3]);
        DB::table('TonKho')->insert(['maTonKho' => 'LOT2', 'maSP' => 'SP1', 'maKho' => 'K2', 'soLuongTonHienTai' => 3, 'hanSuDung' => today()->addMonth()->toDateString(), 'trangThai' => 'Còn hạn']);
        $data = $this->payload(); unset($data['maKho']);
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        DB::table('TonKho')->where('maTonKho', 'LOT2')->update(['soLuongTonHienTai' => 10, 'hanSuDung' => today()->subDay()->toDateString()]);
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        DB::table('TonKho')->where('maTonKho', 'LOT2')->update(['hanSuDung' => today()->addMonth()->toDateString()]);
        $this->postJson(self::API.'/orders', $data)->assertCreated();
        $data['maDonHang'] = 'DH2'; $data['items'][0]['soLuong'] = 6;
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        $this->assertDatabaseCount('DonHang', 1);
    }

    public function test_auto_warehouse_requires_one_warehouse_for_all_products(): void
    {
        DB::table('SanPham')->insert(['maSanPham' => 'SP2', 'tenSanPham' => 'Sữa hộp', 'donGia' => 100, 'trangThai' => 'Đang kinh doanh']);
        DB::table('TonKho')->insert(['maTonKho' => 'LOT2', 'maSP' => 'SP2', 'maKho' => 'K2', 'soLuongTonHienTai' => 10, 'hanSuDung' => today()->addMonth()->toDateString(), 'trangThai' => 'Còn hạn']);
        $data = $this->payload(); unset($data['maKho']);
        $data['items'][] = ['maSanPham' => 'SP2', 'soLuong' => 1];
        $this->postJson(self::API.'/orders', $data)->assertUnprocessable();
        DB::table('TonKho')->where('maTonKho', 'LOT2')->update(['maKho' => 'K1']);
        $this->postJson(self::API.'/orders', $data)->assertCreated()->assertJsonPath('data.maKho', 'K1');
    }
}
