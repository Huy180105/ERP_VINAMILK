<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuNhapNVL extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuNhapNVL';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuNhapNVL',
        'maTonKho',
        'soLuong',
        'donGia',
        'thanhTien',
        'ngaySanXuat',
        'hanSuDung',
        'ghiChu',
    ];

    public function tonKho()
    {
        return $this->belongsTo(TonKho::class, 'maTonKho', 'maTonKho');
    }
}
