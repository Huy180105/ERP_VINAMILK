<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuNhapNVL extends Model
{
    use HasFactory;

    protected $table = 'PhieuNhapNVL';
    protected $primaryKey = 'maPhieuNhapNVL';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuNhapNVL',
        'maNCC',
        'maNVTao',
        'maNVNhan',
        'ngayNhap',
        'trangThai',
        'ghiChu',
    ];

    public function nhaCungCap()
    {
        return $this->belongsTo(NhaCungCap::class, 'maNCC', 'maNCC');
    }

    public function nhanVienTao()
    {
        return $this->belongsTo(NhanVien::class, 'maNVTao', 'maNV');
    }

    public function nhanVienNhan()
    {
        return $this->belongsTo(NhanVien::class, 'maNVNhan', 'maNV');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuNhapNVL::class, 'maPhieuNhapNVL', 'maPhieuNhapNVL');
    }
}
