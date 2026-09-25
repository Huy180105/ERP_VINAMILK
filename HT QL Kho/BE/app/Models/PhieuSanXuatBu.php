<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuSanXuatBu extends Model
{
    use HasFactory;

    protected $table = 'PhieuSanXuatBu';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maLenh',
        'maSanPham',
        'maPhieuNghiemThu',
        'soLuongKhongDat',
        'ghiChu',
    ];

    public function lenhSanXuat()
    {
        return $this->belongsTo(LenhSanXuat::class, 'maLenh', 'maLenh');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }

    public function phieuNghiemThu()
    {
        return $this->belongsTo(PhieuNghiemThu::class, 'maPhieuNghiemThu', 'maPhieuNghiemThu');
    }
}
