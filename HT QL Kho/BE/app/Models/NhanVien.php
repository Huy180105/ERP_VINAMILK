<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhanVien extends Model
{
    use HasFactory;

    protected $table = 'NhanVien';
    protected $primaryKey = 'maNV';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maNV',
        'hoTen',
        'soDienThoai',
        'email',
        'ngaySinh',
        'gioiTinh',
        'trinhDo',
        'maPhongBan',
        'maChucVu',
        'ngayVaoLam',
        'trangThai',
    ];

    public function phongBan()
    {
        return $this->belongsTo(PhongBan::class, 'maPhongBan', 'maPhongBan');
    }

    public function chucVu()
    {
        return $this->belongsTo(ChucVu::class, 'maChucVu', 'maChucVu');
    }

    public function hopDongs()
    {
        return $this->hasMany(HopDong::class, 'maNV', 'maNV');
    }

    public function hopDongHienTai()
    {
        return $this->hasOne(HopDong::class, 'maNV', 'maNV')
            ->where('trangThai', 'Hiệu lực')
            ->latest('ngayHieuLuc');
    }

    public function bangCongs()
    {
        return $this->hasMany(BangCong::class, 'maNV', 'maNV');
    }

    public function bangLuongs()
    {
        return $this->hasMany(BangLuong::class, 'maNV', 'maNV');
    }

    public function taiKhoan()
    {
        return $this->hasOne(TaiKhoan::class, 'maNV', 'maNV');
    }
}
