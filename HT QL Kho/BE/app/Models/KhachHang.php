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

    public function donHangs()
    {
        return $this->hasMany(DonHang::class, 'maKhachHang', 'maKhachHang');
    }

    public function congNos()
    {
        return $this->hasMany(CongNo::class, 'maKhachHang', 'maKhachHang');
    }

    public function giaoHangs()
    {
        return $this->hasMany(GiaoHang::class, 'maKhachHang', 'maKhachHang');
    }
}
