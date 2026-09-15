<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuYeuCauXuatSP extends Model
{
    use HasFactory;

    protected  = 'PhieuYeuCauXuatSP';
    protected  = 'maPhieuYCXSP';
    public  = false;
    protected  = 'string';
    public  = false;

    protected  = [
        'maPhieuYCXSP',
        'maPhieuNghiemThu',
        'maNhanVien',
        'ngayYeuCau',
        'trangThai',
        'ghiChu',
    ];

    public function nhanVien()
    {
        return ->belongsTo(NhanVien::class, 'maNhanVien', 'maNV');
    }
}