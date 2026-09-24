<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class FinanceDocumentLifecycleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('TaiKhoanQuy', function (Blueprint $table) {
            $table->string('maTaiKhoanQuy')->primary();
            $table->decimal('soDuHienTai', 18, 2);
            $table->boolean('trangThai');
        });
        Schema::create('PhieuThu', function (Blueprint $table) {
            $table->string('maPhieuThu')->primary();
            $table->string('maTaiKhoanQuy');
            $table->decimal('soTien', 18, 2);
            $table->string('trangThai');
            $table->string('lyDoThu')->nullable();
            $table->string('maThanhToan')->nullable();
            $table->string('maCongNo')->nullable();
            $table->string('nguoiDuyet')->nullable();
            $table->dateTime('ngayDuyet')->nullable();
        });
        Schema::create('PhieuChi', function (Blueprint $table) {
            $table->string('maPhieuChi')->primary();
            $table->string('maTaiKhoanQuy');
            $table->decimal('soTien', 18, 2);
            $table->string('trangThai');
            $table->string('lyDoChi')->nullable();
            $table->string('nguoiDuyet')->nullable();
            $table->dateTime('ngayDuyet')->nullable();
        });
        Schema::create('CongNo', function (Blueprint $table) {
            $table->string('maCongNo')->primary();
            $table->decimal('soTienNo', 18, 2);
            $table->decimal('soTienDaTra', 18, 2);
            $table->decimal('soTienConLai', 18, 2);
            $table->string('trangThai');
        });
        Schema::create('NhatKyThuChi', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('loaiDoiTuong');
            $table->string('maDoiTuong');
            $table->string('hanhDong');
            $table->string('trangThaiCu')->nullable();
            $table->string('trangThaiMoi')->nullable();
            $table->string('maTaiKhoanQuy')->nullable();
            $table->decimal('soDuTruoc', 18, 2)->nullable();
            $table->decimal('soDuSau', 18, 2)->nullable();
            $table->string('nguoiThucHien')->nullable();
            $table->json('duLieu')->nullable();
            $table->dateTime('thoiGian');
        });

        DB::table('TaiKhoanQuy')->insert(['maTaiKhoanQuy' => 'TK1', 'soDuHienTai' => 10000, 'trangThai' => 1]);
    }

    public function test_sales_receipt_approval_and_cancellation_restore_balance_without_counting_debt_twice(): void
    {
        DB::table('CongNo')->insert([
            'maCongNo' => 'CN1', 'soTienNo' => 10000, 'soTienDaTra' => 5000,
            'soTienConLai' => 5000, 'trangThai' => 'Còn nợ',
        ]);
        DB::table('PhieuThu')->insert([
            'maPhieuThu' => 'PT1', 'maTaiKhoanQuy' => 'TK1', 'soTien' => 1000,
            'trangThai' => 'Moi', 'maThanhToan' => 'TT1', 'maCongNo' => 'CN1',
        ]);

        $this->withHeader('X-User-Role', 'KeToanTruong')
            ->putJson('/api/finance/receipts/PT1/approve')->assertOk();
        $this->assertBalance(11000);
        $this->assertDebtPaid(5000);

        $this->putJson('/api/finance/receipts/PT1/cancel', ['lyDoHuy' => 'Kiểm thử'])->assertOk();
        $this->assertBalance(10000);
        $this->assertDebtPaid(5000);
        $this->assertDatabaseHas('PhieuThu', ['maPhieuThu' => 'PT1', 'trangThai' => 'Huy']);
        $this->assertSame(2, DB::table('NhatKyThuChi')->where('maDoiTuong', 'PT1')->count());
    }

    public function test_receipt_reconciliation_approves_only_once(): void
    {
        DB::table('PhieuThu')->insert([
            'maPhieuThu' => 'PT2', 'maTaiKhoanQuy' => 'TK1', 'soTien' => 1000, 'trangThai' => 'Moi',
        ]);

        $this->withHeader('X-User-Role', 'KeToanTruong')
            ->putJson('/api/finance/receipts/PT2/reconcile')->assertOk();
        $this->assertBalance(10000);
        $this->putJson('/api/finance/receipts/PT2/reconcile/complete')->assertOk();
        $this->assertBalance(11000);
        $this->putJson('/api/finance/receipts/PT2/reconcile')->assertStatus(400);
        $this->assertBalance(11000);
    }

    public function test_payment_approval_and_cancellation_restore_balance(): void
    {
        DB::table('PhieuChi')->insert([
            'maPhieuChi' => 'PC1', 'maTaiKhoanQuy' => 'TK1', 'soTien' => 1000, 'trangThai' => 'Moi',
        ]);

        $this->withHeader('X-User-Role', 'KeToanTruong')
            ->putJson('/api/finance/payments/PC1/approve')->assertOk();
        $this->assertBalance(9000);
        $this->putJson('/api/finance/payments/PC1/cancel', ['lyDoHuy' => 'Kiểm thử'])->assertOk();
        $this->assertBalance(10000);
        $this->assertDatabaseHas('PhieuChi', ['maPhieuChi' => 'PC1', 'trangThai' => 'Huy']);
        $this->assertSame(2, DB::table('NhatKyThuChi')->where('maDoiTuong', 'PC1')->count());
    }

    private function assertBalance(float $expected): void
    {
        $this->assertEquals($expected, (float) DB::table('TaiKhoanQuy')->where('maTaiKhoanQuy', 'TK1')->value('soDuHienTai'));
    }

    private function assertDebtPaid(float $expected): void
    {
        $this->assertEquals($expected, (float) DB::table('CongNo')->where('maCongNo', 'CN1')->value('soTienDaTra'));
    }
}
