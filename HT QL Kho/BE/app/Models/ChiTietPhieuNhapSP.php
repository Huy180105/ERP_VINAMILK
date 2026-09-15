<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuNhapSP extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuNhapSP';
    protected $primaryKey = 'maChiTietPhieuNhapSP';
    public $timestamps = false;

    protected $fillable = [
        'maChiTietPhieuNhapSP',
        'maPhieuNhapSP',
        'maSP',
        'soLuongNhap',
        'ngaySanXuat',
        'hanSuDung',
        'ghiChu',
    ];

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSP', 'maSanPham');
    }

    public function phieuNhapSP()
    {
        return $this->belongsTo(PhieuNhapSP::class, 'maPhieuNhapSP', 'maPhieuNhapSP');
    }
}
