<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NhatKyThuChi extends Model
{
    protected $table = 'NhatKyThuChi';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'loaiDoiTuong', 'maDoiTuong', 'hanhDong', 'trangThaiCu', 'trangThaiMoi',
        'maTaiKhoanQuy', 'soDuTruoc', 'soDuSau', 'nguoiThucHien', 'duLieu', 'thoiGian',
    ];

    protected $casts = [
        'duLieu' => 'array',
        'thoiGian' => 'datetime',
    ];

    public static function ghi(
        string $loaiDoiTuong,
        string $maDoiTuong,
        string $hanhDong,
        ?string $trangThaiCu,
        ?string $trangThaiMoi,
        ?string $maTaiKhoanQuy,
        ?float $soDuTruoc,
        ?float $soDuSau,
        ?string $nguoiThucHien,
        array $duLieu = [],
    ): self {
        return static::create(compact(
            'loaiDoiTuong', 'maDoiTuong', 'hanhDong', 'trangThaiCu', 'trangThaiMoi',
            'maTaiKhoanQuy', 'soDuTruoc', 'soDuSau', 'nguoiThucHien', 'duLieu',
        ) + ['thoiGian' => now()]);
    }
}
