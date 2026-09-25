<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('NhatKyThuChi', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('loaiDoiTuong', 30);
            $table->string('maDoiTuong', 50);
            $table->string('hanhDong', 50);
            $table->string('trangThaiCu', 30)->nullable();
            $table->string('trangThaiMoi', 30)->nullable();
            $table->string('maTaiKhoanQuy', 50)->nullable();
            $table->decimal('soDuTruoc', 18, 2)->nullable();
            $table->decimal('soDuSau', 18, 2)->nullable();
            $table->string('nguoiThucHien', 50)->nullable();
            $table->json('duLieu')->nullable();
            $table->timestamp('thoiGian')->useCurrent();
            $table->index(['loaiDoiTuong', 'maDoiTuong']);
            $table->index('maTaiKhoanQuy');
            $table->index('thoiGian');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('NhatKyThuChi');
    }
};
