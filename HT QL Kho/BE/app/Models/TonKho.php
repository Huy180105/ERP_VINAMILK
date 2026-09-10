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
        'maSP',
        'maNVL',
        'ngaySanXuat',
        'hanSuDung',
        'soLuongNhap',
        'soLuongTonHienTai',
        'trangThai',
        'ghiChu',
    ];

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSP', 'maSanPham');
    }

    public function nguyenVatLieu()
    {
        return $this->belongsTo(NguyenVatLieu::class, 'maNVL', 'maNVL');
    }

    public function khoSanPham()
    {
        return $this->hasOne(KhoSanPham::class, 'maTonKho', 'maTonKho');
    }

    public function khoNguyenVatLieu()
    {
        return $this->hasOne(KhoNguyenVatLieu::class, 'maTonKho', 'maTonKho');
    }
}
