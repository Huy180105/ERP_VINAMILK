<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $links = DB::table('HoaDon as hd')->join('GiaoHang as gh', 'gh.maGiaoHang', '=', 'hd.maGiaoHang')
            ->whereNull('hd.maDonHang')->select('hd.maHoaDon', 'gh.maDonHang', 'gh.maKhachHang')->get();
        foreach ($links as $link) {
            DB::table('HoaDon')->where('maHoaDon', $link->maHoaDon)->update([
                'maDonHang' => $link->maDonHang,
                'maKhachHang' => $link->maKhachHang,
            ]);
        }
    }

    public function down(): void
    {
        // Existing invoice links are valid business data and are intentionally retained.
    }
};
