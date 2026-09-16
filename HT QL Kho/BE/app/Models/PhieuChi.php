<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuChi extends Model
{
    use HasFactory;

    protected $table = 'PhieuChi';
    protected $primaryKey = 'maPhieuChi';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuChi',
        'ngayChi',
        'maDoiTuong',
        'lyDoChi',
        'soTien',
        'phuongThucChi',
        'maTaiKhoanQuy',
        'trangThai',
        'nguoiLap',
        'ngayLap',
        'nguoiDuyet',
        'ngayDuyet',
        'maPhieuNhapNVL',
        'maBangLuong',
    ];

    public function doiTuong()
    {
        return $this->belongsTo(DoiTuongGiaoDich::class, 'maDoiTuong', 'maDoiTuong');
    }

    public function taiKhoanQuy()
    {
        return $this->belongsTo(TaiKhoanQuy::class, 'maTaiKhoanQuy', 'maTaiKhoanQuy');
    }

    public function nhanVienLap()
    {
        return $this->belongsTo(NhanVien::class, 'nguoiLap', 'maNV');
    }

    public function nhanVienDuyet()
    {
        return $this->belongsTo(NhanVien::class, 'nguoiDuyet', 'maNV');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuChi::class, 'maPhieuChi', 'maPhieuChi');
    }

    public function phieuNhapNVL()
    {
        return $this->belongsTo(PhieuNhapNVL::class, 'maPhieuNhapNVL', 'maPhieuNhapNVL');
    }

    public function bangLuong()
    {
        return $this->belongsTo(BangLuong::class, 'maBangLuong', 'maBangLuong');
    }
}
