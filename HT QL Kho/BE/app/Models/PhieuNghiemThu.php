<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuNghiemThu extends Model
{
    use HasFactory;

    protected $table = 'PhieuNghiemThu';
    protected $primaryKey = 'maPhieuNghiemThu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuNghiemThu',
        'maCongDoan',
        'maLenh',
        'maNhanVien',
        'tongSoLuongSanPham',
        'tongSoLuongDat',
        'tongSoLuongKhongDat',
        'ngayNghiemThu',
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

    public function phieuSanXuatBus()
    {
        return $this->hasMany(PhieuSanXuatBu::class, 'maPhieuNghiemThu', 'maPhieuNghiemThu');
    }

    public function phieuYeuCauXuatSPs()
    {
        return $this->hasMany(PhieuYeuCauXuatSP::class, 'maPhieuNghiemThu', 'maPhieuNghiemThu');
    }
}
