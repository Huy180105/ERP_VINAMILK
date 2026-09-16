<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhachHang extends Model
{
    use HasFactory;

    protected $table = 'KhachHang';
    protected $primaryKey = 'maKhachHang';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maKhachHang',
        'tenKhachHang',
        'soDienThoai',
        'diaChi',
        'hanMucCongNo',
    ];
}
