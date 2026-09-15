<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuNhapSP extends Model
{
    use HasFactory;

    protected $table = 'PhieuNhapSP';
    protected $primaryKey = 'maPhieuNhapSP';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuNhapSP',
        'maXuong',
        'maNVTao',
        'maNVNhan',
        'ngayNhap',
        'trangThai',
        'ghiChu',
        'maPhieuYCXSP',
    ];

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuNhapSP::class, 'maPhieuNhapSP', 'maPhieuNhapSP');
    }

    public function nhanVienTao()
    {
        return $this->belongsTo(NhanVien::class, 'maNVTao', 'maNV');
    }

    public function nhanVienNhan()
    {
        return $this->belongsTo(NhanVien::class, 'maNVNhan', 'maNV');
    }
}
