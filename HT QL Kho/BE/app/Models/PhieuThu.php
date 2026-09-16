<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhieuThu extends Model
{
    use HasFactory;

    protected $table = 'PhieuThu';
    protected $primaryKey = 'maPhieuThu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhieuThu',
        'ngayThu',
        'maDoiTuong',
        'lyDoThu',
        'soTien',
        'phuongThucThu',
        'maTaiKhoanQuy',
        'trangThai',
        'nguoiLap',
        'ngayLap',
        'nguoiDuyet',
        'ngayDuyet',
        'maThanhToan',
        'maCongNo',
        'maHoaDon',
    ];

    public function doiTuong()
    {
        return $this->belongsTo(DoiTuongGiaoDich::class, 'maDoiTuong', 'maDoiTuong');
    }

    public function taiKhoanQuy()
    {
        return $this->belongsTo(TaiKhoanQuy::class, 'maTaiKhoanQuy', 'maTaiKhoanQuy');
    }

    public function nhanVienLap()
    {
        return $this->belongsTo(NhanVien::class, 'nguoiLap', 'maNV');
    }

    public function nhanVienDuyet()
    {
        return $this->belongsTo(NhanVien::class, 'nguoiDuyet', 'maNV');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuThu::class, 'maPhieuThu', 'maPhieuThu');
    }

    public function thanhToan()
    {
        return $this->belongsTo(ThanhToan::class, 'maThanhToan', 'maThanhToan');
    }

    public function congNo()
    {
        return $this->belongsTo(CongNo::class, 'maCongNo', 'maCongNo');
    }

    public function hoaDon()
    {
        return $this->belongsTo(HoaDon::class, 'maHoaDon', 'maHoaDon');
    }
}
