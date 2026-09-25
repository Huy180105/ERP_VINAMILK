<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('TonKho', function (Blueprint $table) {
            if (!Schema::hasColumn('TonKho', 'dungTichDonVi')) {
                $table->decimal('dungTichDonVi', 12, 2)->default(1.00)->after('soLuongTonHienTai')->comment('Dung tích/Khối lượng đơn vị nhỏ nhất (vd: 30ml, 180ml, 25kg)');
            }
            if (!Schema::hasColumn('TonKho', 'donViDoLuong')) {
                $table->string('donViDoLuong', 20)->default('ml')->after('dungTichDonVi')->comment('Đơn vị đo lường cơ sở (ml, L, g, kg)');
            }
            if (!Schema::hasColumn('TonKho', 'soLuongDongGoi')) {
                $table->integer('soLuongDongGoi')->default(1)->after('donViDoLuong')->comment('Số lượng đóng gói trong 1 đơn vị tồn kho (vd: 1 thùng = 10 hộp)');
            }
            if (!Schema::hasColumn('TonKho', 'tongDungTichQuyDoi')) {
                $table->decimal('tongDungTichQuyDoi', 15, 2)->default(0.00)->after('soLuongDongGoi')->comment('Tổng quy đổi = soLuongTonHienTai * soLuongDongGoi * dungTichDonVi');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('TonKho', function (Blueprint $table) {
            $table->dropColumn(['dungTichDonVi', 'donViDoLuong', 'soLuongDongGoi', 'tongDungTichQuyDoi']);
        });
    }
};
