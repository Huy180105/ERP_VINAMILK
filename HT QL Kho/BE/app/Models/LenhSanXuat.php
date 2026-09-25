<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LenhSanXuat extends Model
{
    use HasFactory;

    protected $table = 'LenhSanXuat';
    protected $primaryKey = 'maLenh';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maLenh',
        'maNhanVien',
        'tenLenh',
        'ngayTaoLenh',
        'trangThai',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNhanVien', 'maNV');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietLenhSanXuat::class, 'maLenh', 'maLenh');
    }

    public function congDoans()
    {
        return $this->hasMany(CongDoan::class, 'maLenh', 'maLenh')->orderBy('khau', 'asc');
    }

    public function phieuYeuCauNVLs()
    {
        return $this->hasMany(PhieuYeuCauNVL::class, 'maLenh', 'maLenh');
    }

    public function phieuYeuCauBTPs()
    {
        return $this->hasMany(PhieuYeuCauBTP::class, 'maLenh', 'maLenh');
    }

    public function phieuNghiemThus()
    {
        return $this->hasMany(PhieuNghiemThu::class, 'maLenh', 'maLenh');
    }

    public function phieuSanXuatBus()
    {
        return $this->hasMany(PhieuSanXuatBu::class, 'maLenh', 'maLenh');
    }
}
