<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeNghiBoSungSanPham extends Model
{
    use HasFactory;

    protected $table = 'DeNghiBoSungSanPham';
    protected $primaryKey = 'maDeNghi';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maDeNghi',
        'maSanPham',
        'maKho',
        'soLuong',
        'ngayDeNghi',
        'ngayCanHang',
        'trangThai',
        'maNV',
        'ghiChu',
    ];

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }

    public function kho()
    {
        return $this->belongsTo(Kho::class, 'maKho', 'maKho');
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }
}

