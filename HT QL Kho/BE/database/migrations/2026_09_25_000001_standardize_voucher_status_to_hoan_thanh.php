<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('PhieuNhapNVL')->whereIn('trangThai', ['Đã nhập kho', 'DaNhapKho'])->update(['trangThai' => 'Hoàn thành']);
        DB::table('PhieuNhapSP')->whereIn('trangThai', ['Thành công', 'ThanhCong', 'Đã nhập kho', 'DaNhapKho'])->update(['trangThai' => 'Hoàn thành']);
        DB::table('PhieuXuatNVL')->whereIn('trangThai', ['Đã xuất kho', 'DaXuatKho'])->update(['trangThai' => 'Hoàn thành']);
        DB::table('PhieuXuatSP')->whereIn('trangThai', ['Đã xuất kho', 'DaXuatKho'])->update(['trangThai' => 'Hoàn thành']);
        DB::table('PhieuYeuCauNVL')->whereIn('trangThai', ['Đã xuất kho', 'DaXuatKho'])->update(['trangThai' => 'Hoàn thành']);
        DB::table('PhieuYeuCauXuatSP')->whereIn('trangThai', ['Đã xuất kho', 'DaXuatKho', 'Đã nhập kho', 'DaNhapKho'])->update(['trangThai' => 'Hoàn thành']);
        DB::table('DeNghiBoSungSP')->whereIn('trangThai', ['DaDuyet', 'HoanThanh', 'Đã nhập kho', 'DaNhapKho'])->update(['trangThai' => 'Hoàn thành']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op for standardization migration
    }
};
