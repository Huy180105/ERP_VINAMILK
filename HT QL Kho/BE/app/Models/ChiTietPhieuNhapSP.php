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
        'maSP',
        'maSanPham',
        'soLuong',
        'soLuongNhap',
        'ngaySanXuat',
        'hanSuDung',
        'ghiChu',
    ];

    protected $appends = ['maSanPham', 'maSP', 'soLuongNhap'];

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
        return $this->belongsTo(SanPham::class, 'maSP', 'maSanPham');
    }

    public function getMaSanPhamAttribute()
    {
        return $this->attributes['maSanPham'] ?? $this->attributes['maSP'] ?? $this->tonKho?->maSanPham;
    }

    public function getMaSPAttribute()
    {
        return $this->attributes['maSP'] ?? $this->attributes['maSanPham'] ?? $this->tonKho?->maSanPham;
    }

    public function getSoLuongNhapAttribute($value = null)
    {
        if (!empty($value) && $value > 0) {
            return $value;
        }
        return $this->attributes['soLuong'] ?? 0;
    }

    public function getSoLuongAttribute($value = null)
    {
        if (!empty($value) && $value > 0) {
            return $value;
        }
        return $this->attributes['soLuongNhap'] ?? 0;
    }
}
