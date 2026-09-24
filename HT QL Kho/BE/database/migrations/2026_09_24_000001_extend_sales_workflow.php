<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('sales_role', 20)->nullable();
            $table->string('maNhanVien', 20)->nullable();
        });
        Schema::table('KhachHang', function (Blueprint $table) {
            $table->boolean('hoatDong')->default(true);
            $table->string('maNhanVienPhuTrach', 20)->nullable()->index();
        });
        Schema::table('DonHang', fn (Blueprint $table) => $table->string('maKho', 20)->nullable()->index());
        // Legacy lots remain unassigned until their actual warehouse is recorded.
        Schema::table('TonKho', fn (Blueprint $table) => $table->string('maKho', 20)->nullable()->index());
        Schema::table('SanPham', fn (Blueprint $table) => $table->boolean('coGiaBan')->default(true));
        Schema::table('ThanhToan', function (Blueprint $table) {
            // NULL preserves the fact that older payment amounts were not recorded.
            $table->decimal('soTien', 18, 2)->nullable();
            $table->string('trangThai', 30)->default('Đã xác nhận');
            $table->string('thamChieu', 100)->nullable();
            $table->unsignedBigInteger('nguoiGhiNhan')->nullable();
        });
        Schema::table('CongNo', function (Blueprint $table) {
            $table->unsignedBigInteger('nguoiDuyetVuotHanMuc')->nullable();
            $table->string('lyDoDuyet', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('CongNo', fn (Blueprint $table) => $table->dropColumn(['nguoiDuyetVuotHanMuc', 'lyDoDuyet']));
        Schema::table('ThanhToan', fn (Blueprint $table) => $table->dropColumn(['soTien', 'trangThai', 'thamChieu', 'nguoiGhiNhan']));
        Schema::table('SanPham', fn (Blueprint $table) => $table->dropColumn('coGiaBan'));
        Schema::table('TonKho', fn (Blueprint $table) => $table->dropColumn('maKho'));
        Schema::table('DonHang', fn (Blueprint $table) => $table->dropColumn('maKho'));
        Schema::table('KhachHang', fn (Blueprint $table) => $table->dropColumn(['hoatDong', 'maNhanVienPhuTrach']));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['sales_role', 'maNhanVien']));
    }
};
