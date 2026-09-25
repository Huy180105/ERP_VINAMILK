<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TonKho extends Model
{
    use HasFactory;

    protected $table = 'TonKho';
    protected $primaryKey = 'maTonKho';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maTonKho',
        'tenTonKho',
        'maKho',
        'maSanPham',
        'maNVL',
        'ngaySanXuat',
        'hanSuDung',
        'soLuongNhap',
        'soLuongTonHienTai',
        'trangThaiHSD',
        'trangThaiChatLuong',
        'trangThai',
        'ghiChu',
        'maChiTietPhieuNhapSP',
    ];

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }

    public function nguyenVatLieu()
    {
        return $this->belongsTo(NguyenVatLieu::class, 'maNVL', 'maNVL');
    }

    public function kho()
    {
        return $this->belongsTo(Kho::class, 'maKho', 'maKho');
    }
}
