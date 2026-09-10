<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuXuatSP extends Model
{
    use HasFactory;

    protected $table = 'PhieuXuatSP';
    protected $primaryKey = 'maPhieuXuatSP';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuXuatSP',
        'maKhachHang',
        'maNVTao',
        'ngayXuat',
        'trangThai',
        'ghiChu',
        'maDonHang',
    ];

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuXuatSP::class, 'maPhieuXuatSP', 'maPhieuXuatSP');
    }

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'maKhachHang', 'maKhachHang');
    }
}
