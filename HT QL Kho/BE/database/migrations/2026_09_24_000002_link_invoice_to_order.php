<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('HoaDon', function (Blueprint $table) {
            $table->string('maDonHang', 20)->nullable()->index();
            $table->string('maKhachHang', 20)->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('HoaDon', fn (Blueprint $table) => $table->dropColumn(['maDonHang', 'maKhachHang']));
    }
};
