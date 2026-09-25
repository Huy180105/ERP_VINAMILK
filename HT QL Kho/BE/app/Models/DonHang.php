<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    use HasFactory;

    protected $table = 'DonHang';
    protected $primaryKey = 'maDonHang';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maDonHang',
        'ngayMua',
        'tongTien',
        'thanhTien',
        'trangThai',
        'maKhachHang',
        'maNhanVien',
    ];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'maKhachHang', 'maKhachHang');
    }

    public function chiTiet()
    {
        return $this->hasMany(ChiTietDonHang::class, 'maDonHang', 'maDonHang');
    }

    public function giaoHangs()
    {
        return $this->hasMany(GiaoHang::class, 'maDonHang', 'maDonHang');
    }
}
