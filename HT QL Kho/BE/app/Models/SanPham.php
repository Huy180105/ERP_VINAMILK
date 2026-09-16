<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SanPham extends Model
{
    use HasFactory;

    protected $table = 'SanPham';
    protected $primaryKey = 'maSanPham';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maSanPham',
        'tenSanPham',
        'donViTinh',
        'donGia',
        'trangThai',
        'ghiChu',
    ];

    public function tonKhos()
    {
        return $this->hasMany(TonKho::class, 'maSP', 'maSanPham');
    }
}
