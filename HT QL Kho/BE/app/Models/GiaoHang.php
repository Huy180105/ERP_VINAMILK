<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiaoHang extends Model
{
    use HasFactory;

    protected $table = 'GiaoHang';
    protected $primaryKey = 'maGiaoHang';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maGiaoHang',
        'ngayGiao',
        'diaChiGiao',
        'trangThai',
        'maDonHang',
        'maPhieuXuatSP',
        'maKhachHang',
        'maNV',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'maDonHang', 'maDonHang');
    }

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'maKhachHang', 'maKhachHang');
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }

    public function phieuXuat()
    {
        return $this->belongsTo(PhieuXuatSP::class, 'maPhieuXuatSP', 'maPhieuXuatSP');
    }

    public function phieuXuatSP()
    {
        return $this->belongsTo(PhieuXuatSP::class, 'maPhieuXuatSP', 'maPhieuXuatSP');
    }

    public function hoaDon()
    {
        return $this->hasOne(HoaDon::class, 'maGiaoHang', 'maGiaoHang');
    }
}
