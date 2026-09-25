<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CongDoan extends Model
{
    use HasFactory;

    protected $table = 'CongDoan';
    protected $primaryKey = 'maCongDoan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maCongDoan',
        'maLenh',
        'maNhanVien',
        'tenLenh', // Tên công đoạn
        'nhanCong',
        'ngayBatDau',
        'ngayKetThuc',
        'chiPhi',
        'thanhPham',
        'soLuongThanhPham',
        'khau',
        'trangThai',
    ];

    public function lenhSanXuat()
    {
        return $this->belongsTo(LenhSanXuat::class, 'maLenh', 'maLenh');
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNhanVien', 'maNV');
    }

    public function phieuYeuCauNVLs()
    {
        return $this->hasMany(PhieuYeuCauNVL::class, 'maCongDoan', 'maCongDoan');
    }

    public function phieuYeuCauBTPs()
    {
        return $this->hasMany(PhieuYeuCauBTP::class, 'maCongDoan', 'maCongDoan');
    }

    public function tienDoSanXuats()
    {
        return $this->hasMany(TienDoSanXuat::class, 'maCongDoan', 'maCongDoan');
    }
}
