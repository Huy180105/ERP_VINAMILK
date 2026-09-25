<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('HopDong')) {
            Schema::table('HopDong', function (Blueprint $table) {
                if (!Schema::hasColumn('HopDong', 'ngayHetHan')) {
                    $table->date('ngayHetHan')->nullable()->after('ngayHieuLuc');
                }
                if (!Schema::hasColumn('HopDong', 'trangThai')) {
                    $table->string('trangThai', 30)->default('Hiệu lực')->after('mucLuongCoBan');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('HopDong')) {
            Schema::table('HopDong', function (Blueprint $table) {
                if (Schema::hasColumn('HopDong', 'trangThai')) {
                    $table->dropColumn('trangThai');
                }
                if (Schema::hasColumn('HopDong', 'ngayHetHan')) {
                    $table->dropColumn('ngayHetHan');
                }
            });
        }
    }
};
