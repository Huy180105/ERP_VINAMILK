<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuYeuCauBTP extends Model
{
    use HasFactory;

    protected $table = 'PhieuYeuCauBTP';
    protected $primaryKey = 'maPhieuYCBTP';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuYCBTP',
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
        return $this->hasMany(ChiTietPhieuYeuCauBTP::class, 'maPhieuYCBTP', 'maPhieuYCBTP');
    }
}
