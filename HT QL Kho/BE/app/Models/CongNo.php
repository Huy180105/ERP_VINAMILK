<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CongNo extends Model
{
    use HasFactory;

    protected $table = 'CongNo';
    protected $primaryKey = 'maCongNo';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maCongNo',
        'soTienNo',
        'soTienDaTra',
        'soTienConLai',
        'hanThanhToan',
        'trangThai',
        'maHoaDon',
        'maKhachHang',
    ];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'maKhachHang', 'maKhachHang');
    }

    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'maHoaDon', 'maHoaDon');
    }

    public function thanhToans()
    {
        return $this->hasMany(ThanhToan::class, 'maCongNo', 'maCongNo');
    }
}
