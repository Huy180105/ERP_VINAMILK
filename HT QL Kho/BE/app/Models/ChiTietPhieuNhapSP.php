<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuNhapSP extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuNhapSP';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuNhapSP',
        'maTonKho',
        'soLuong',
        'ngaySanXuat',
        'hanSuDung',
        'ghiChu',
    ];

    public function tonKho()
    {
        return $this->belongsTo(TonKho::class, 'maTonKho', 'maTonKho');
    }

    public function phieuNhapSP()
    {
        return $this->belongsTo(PhieuNhapSP::class, 'maPhieuNhapSP', 'maPhieuNhapSP');
    }

    public function sanPham()
    {
        return $this->hasOneThrough(SanPham::class, TonKho::class, 'maTonKho', 'maSanPham', 'maTonKho', 'maSanPham');
    }

    public function getMaSanPhamAttribute()
    {
        return $this->tonKho?->maSanPham;
    }

    public function getMaSPAttribute()
    {
        return $this->tonKho?->maSanPham;
    }

    public function getSoLuongNhapAttribute()
    {
        return $this->soLuong;
    }
}
