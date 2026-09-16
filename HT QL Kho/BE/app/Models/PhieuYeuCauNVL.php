<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuYeuCauNVL extends Model
{
    use HasFactory;

    protected $table = 'PhieuYeuCauNVL';
    protected $primaryKey = 'maPhieuYCNVL';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuYCNVL',
        'maCongDoan',
        'maLenh',
        'maNhanVien',
        'ngayYeuCau',
        'trangThai',
        'ghiChu',
    ];

    public function lenhSanXuat()
    {
        return $this->belongsTo(LenhSanXuat::class, 'maLenh', 'maLenh');
    }

    public function congDoan()
    {
        return $this->belongsTo(CongDoan::class, 'maCongDoan', 'maCongDoan');
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNhanVien', 'maNV');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuYeuCauNVL::class, 'maPhieuYCNVL', 'maPhieuYCNVL');
    }
}
