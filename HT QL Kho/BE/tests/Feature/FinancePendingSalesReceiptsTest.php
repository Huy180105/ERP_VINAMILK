<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class FinancePendingSalesReceiptsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('PhieuThu', function (Blueprint $table) {
            $table->string('maPhieuThu')->primary();
            $table->string('maThanhToan')->nullable();
            $table->string('trangThai');
        });
        Schema::create('ThanhToan', function (Blueprint $table) {
            $table->string('maThanhToan')->primary();
            $table->string('maCongNo');
            $table->dateTime('ngayThanhToan');
            $table->string('phuongThuc');
        });
        Schema::create('CongNo', function (Blueprint $table) {
            $table->string('maCongNo')->primary();
            $table->decimal('soTienDaTra', 18, 2);
            $table->string('maHoaDon');
            $table->string('maKhachHang');
        });
        Schema::create('KhachHang', function (Blueprint $table) {
            $table->string('maKhachHang')->primary();
            $table->string('tenKhachHang');
        });
        Schema::create('HoaDon', function (Blueprint $table) {
            $table->string('maHoaDon')->primary();
            $table->string('maGiaoHang');
        });
        Schema::create('GiaoHang', function (Blueprint $table) {
            $table->string('maGiaoHang')->primary();
            $table->string('maDonHang');
        });
    }

    public function test_pending_sales_receipt_uses_sales_schema_and_excludes_unpaid_debt(): void
    {
        DB::table('KhachHang')->insert(['maKhachHang' => 'KH1', 'tenKhachHang' => 'Khách thử']);
        DB::table('GiaoHang')->insert(['maGiaoHang' => 'GH1', 'maDonHang' => 'DH1']);
        DB::table('HoaDon')->insert(['maHoaDon' => 'HD1', 'maGiaoHang' => 'GH1']);
        DB::table('CongNo')->insert([
            ['maCongNo' => 'CN1', 'soTienDaTra' => 500000, 'maHoaDon' => 'HD1', 'maKhachHang' => 'KH1'],
            ['maCongNo' => 'CN2', 'soTienDaTra' => 0, 'maHoaDon' => 'HD1', 'maKhachHang' => 'KH1'],
        ]);
        DB::table('ThanhToan')->insert([
            ['maThanhToan' => 'TT1', 'maCongNo' => 'CN1', 'ngayThanhToan' => '2026-09-24 10:00:00', 'phuongThuc' => 'Chuyển khoản VCB'],
            ['maThanhToan' => 'TT2', 'maCongNo' => 'CN2', 'ngayThanhToan' => '2026-09-24 10:00:00', 'phuongThuc' => 'Tiền mặt'],
        ]);

        $this->getJson('/api/finance/receipts/pending-sales')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.maThanhToan', 'TT1')
            ->assertJsonPath('data.0.maCongNo', 'CN1')
            ->assertJsonPath('data.0.maHoaDon', 'HD1')
            ->assertJsonPath('data.0.maDonHang', 'DH1')
            ->assertJsonPath('data.0.maKhachHang', 'KH1')
            ->assertJsonPath('data.0.soTien', 500000)
            ->assertJsonPath('data.0.phuongThucThanhToan', 'Chuyển khoản');
    }

    public function test_approved_receipt_cannot_be_reconciled_again_and_credit_the_fund_twice(): void
    {
        DB::table('PhieuThu')->insert([
            'maPhieuThu' => 'PT-APPROVED',
            'maThanhToan' => null,
            'trangThai' => 'DaDuyet',
        ]);

        $this->withHeader('X-User-Role', 'KeToanTruong')
            ->putJson('/api/finance/receipts/PT-APPROVED/reconcile')
            ->assertStatus(400)
            ->assertJsonPath('success', false);
        $this->assertDatabaseHas('PhieuThu', ['maPhieuThu' => 'PT-APPROVED', 'trangThai' => 'DaDuyet']);
    }
}
