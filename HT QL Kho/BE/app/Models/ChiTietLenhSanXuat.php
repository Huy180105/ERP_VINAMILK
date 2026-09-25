<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietLenhSanXuat extends Model
{
    use HasFactory;

    protected $table = 'ChiTietLenhSanXuat';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maLenh',
        'maSanPham',
        'soLuong',
        'ghiChu',
    ];

    public function lenhSanXuat()
    {
        return $this->belongsTo(LenhSanXuat::class, 'maLenh', 'maLenh');
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }
}
