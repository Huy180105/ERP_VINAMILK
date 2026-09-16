<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietDonHang extends Model
{
    use HasFactory;

    protected $table = 'ChiTietDonHang';
    public $timestamps = false;
    protected $primaryKey = ['maDonHang', 'maSanPham'];
    public $incrementing = false;

    protected $fillable = [
        'maDonHang',
        'maSanPham',
        'soLuong',
        'donGia',
        'thanhTien',
    ];

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'maDonHang', 'maDonHang');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }
}
