<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuYeuCauXuatSP extends Model
{
    use HasFactory;

    protected $table = 'PhieuYeuCauXuatSP';
    protected $primaryKey = 'maPhieuYCXSP';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuYCXSP',
        'maPhieuNghiemThu',
        'maNhanVien',
        'ngayYeuCau',
        'trangThai',
        'ghiChu',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNhanVien', 'maNV');
    }

    public function phieuNghiemThu()
    {
        return $this->belongsTo(PhieuNghiemThu::class, 'maPhieuNghiemThu', 'maPhieuNghiemThu');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuYeuCauXuatSP::class, 'maPhieuYCXSP', 'maPhieuYCXSP');
    }
}