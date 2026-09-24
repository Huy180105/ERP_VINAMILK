<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class FinanceSourceEntitiesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('DoiTuongGiaoDich', function (Blueprint $table) {
            $table->string('maDoiTuong')->primary();
            $table->string('maThamChieu');
            $table->string('loaiDoiTuong');
            $table->boolean('trangThai');
        });

        Schema::create('KhachHang', function (Blueprint $table) {
            $table->string('maKhachHang')->primary();
            $table->string('tenKhachHang');
            $table->string('soDienThoai')->nullable();
            $table->string('diaChi')->nullable();
        });

        Schema::create('NhaCungCap', function (Blueprint $table) {
            $table->string('maNCC')->primary();
            $table->string('tenNCC');
            $table->string('soDienThoai')->nullable();
            $table->string('diaChi')->nullable();
            $table->string('maSoThue')->nullable();
            $table->string('email')->nullable();
        });

        Schema::create('NhanVien', function (Blueprint $table) {
            $table->string('maNV')->primary();
            $table->string('hoTen');
            $table->string('soDienThoai')->nullable();
            $table->string('email')->nullable();
        });
    }

    public function test_customer_sources_use_columns_that_exist_in_customer_table(): void
    {
        DB::table('KhachHang')->insert([
            'maKhachHang' => 'KH-TEST',
            'tenKhachHang' => 'Khách hàng thử',
            'soDienThoai' => '0123456789',
            'diaChi' => 'Hà Nội',
        ]);

        $this->getJson('/api/finance/master-data/source-entities?loaiDoiTuong=KH')
            ->assertOk()
            ->assertJsonStructure(['data' => [['maGoc', 'ten', 'maSoThue', 'email']]])
            ->assertJsonPath('data.0.maGoc', 'KH-TEST')
            ->assertJsonPath('data.0.ten', 'Khách hàng thử')
            ->assertJsonPath('data.0.maSoThue', null)
            ->assertJsonPath('data.0.email', null);
    }

    public function test_employee_sources_use_columns_that_exist_in_employee_table(): void
    {
        DB::table('NhanVien')->insert([
            'maNV' => 'NV-TEST',
            'hoTen' => 'Nhân viên thử',
            'soDienThoai' => '0123456789',
        ]);

        $this->getJson('/api/finance/master-data/source-entities?loaiDoiTuong=NV')
            ->assertOk()
            ->assertJsonStructure(['data' => [['maGoc', 'ten', 'diaChi']]])
            ->assertJsonPath('data.0.maGoc', 'NV-TEST')
            ->assertJsonPath('data.0.ten', 'Nhân viên thử')
            ->assertJsonPath('data.0.diaChi', null);
    }
}
