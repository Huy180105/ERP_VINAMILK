<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HoaDon extends Model
{
    use HasFactory;

    protected $table = 'HoaDon';
    protected $primaryKey = 'maHoaDon';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maHoaDon',
        'ngayLap',
        'tongTien',
        'maGiaoHang',
        'maDonHang',
        'maKhachHang',
        'trangThaiThanhToan',
    ];

    public function congNos()
    {
        return $this->hasMany(CongNo::class, 'maHoaDon', 'maHoaDon');
    }

    public function donHang()
    {
        return $this->belongsTo(DonHang::class, 'maDonHang', 'maDonHang');
    }

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'maKhachHang', 'maKhachHang');
    }
}
