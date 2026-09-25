<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaiKhoanQuy extends Model
{
    use HasFactory;

    protected $table = 'TaiKhoanQuy';
    protected $primaryKey = 'maTaiKhoanQuy';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maTaiKhoanQuy',
        'tenTaiKhoanQuy',
        'loaiTaiKhoan',
        'soTaiKhoan',
        'nganHang',
        'soDuHienTai',
        'trangThai',
    ];

    public function phieuThus()
    {
        return $this->hasMany(PhieuThu::class, 'maTaiKhoanQuy', 'maTaiKhoanQuy');
    }

    public function phieuChis()
    {
        return $this->hasMany(PhieuChi::class, 'maTaiKhoanQuy', 'maTaiKhoanQuy');
    }
}
