<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuYeuCauXuatSP extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuYeuCauXuatSP';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuYCXSP',
        'maSanPham',
        'soLuong',
        'ngaySanXuat',
        'hanSuDung',
        'ghiChu',
    ];

    public function phieuYeuCau()
    {
        return $this->belongsTo(PhieuYeuCauXuatSP::class, 'maPhieuYCXSP', 'maPhieuYCXSP');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }
}
