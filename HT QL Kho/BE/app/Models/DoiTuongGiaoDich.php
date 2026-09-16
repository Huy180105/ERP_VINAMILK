<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoiTuongGiaoDich extends Model
{
    use HasFactory;

    protected $table = 'DoiTuongGiaoDich';
    protected $primaryKey = 'maDoiTuong';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maDoiTuong',
        'maThamChieu',
        'loaiDoiTuong',
        'trangThai',
    ];

    // Automatically append dynamic details from source entities
    protected $appends = [
        'tenDoiTuong',
        'soDienThoai',
        'diaChi',
        'email',
        'maSoThue'
    ];

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'maThamChieu', 'maKhachHang');
    }

    public function nhaCungCap()
    {
        return $this->belongsTo(NhaCungCap::class, 'maThamChieu', 'maNCC');
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maThamChieu', 'maNV');
    }

    public function phieuThus()
    {
        return $this->hasMany(PhieuThu::class, 'maDoiTuong', 'maDoiTuong');
    }

    public function phieuChis()
    {
        return $this->hasMany(PhieuChi::class, 'maDoiTuong', 'maDoiTuong');
    }

    // Dynamic Accessors (FI-BR05: Không lưu trùng lặp dữ liệu mô tả)
    public function getTenDoiTuongAttribute()
    {
        if ($this->loaiDoiTuong === 'KH') {
            return $this->khachHang?->tenKhachHang ?? $this->maThamChieu;
        } elseif ($this->loaiDoiTuong === 'NCC') {
            return $this->nhaCungCap?->tenNCC ?? $this->maThamChieu;
        } elseif ($this->loaiDoiTuong === 'NV') {
            return $this->nhanVien?->hoTen ?? $this->maThamChieu;
        }
        return $this->maThamChieu;
    }

    public function getSoDienThoaiAttribute()
    {
        if ($this->loaiDoiTuong === 'KH') {
            return $this->khachHang?->soDienThoai ?? null;
        } elseif ($this->loaiDoiTuong === 'NCC') {
            return $this->nhaCungCap?->soDienThoai ?? null;
        } elseif ($this->loaiDoiTuong === 'NV') {
            return $this->nhanVien?->soDienThoai ?? null;
        }
        return null;
    }

    public function getDiaChiAttribute()
    {
        if ($this->loaiDoiTuong === 'KH') {
            return $this->khachHang?->diaChi ?? null;
        } elseif ($this->loaiDoiTuong === 'NCC') {
            return $this->nhaCungCap?->diaChi ?? null;
        } elseif ($this->loaiDoiTuong === 'NV') {
            return $this->nhanVien?->diaChi ?? null;
        }
        return null;
    }

    public function getEmailAttribute()
    {
        if ($this->loaiDoiTuong === 'KH') {
            return $this->khachHang?->email ?? null;
        } elseif ($this->loaiDoiTuong === 'NCC') {
            return $this->nhaCungCap?->email ?? null;
        } elseif ($this->loaiDoiTuong === 'NV') {
            return $this->nhanVien?->email ?? null;
        }
        return null;
    }

    public function getMaSoThueAttribute()
    {
        if ($this->loaiDoiTuong === 'KH') {
            return $this->khachHang?->maSoThue ?? null;
        } elseif ($this->loaiDoiTuong === 'NCC') {
            return $this->nhaCungCap?->maSoThue ?? null;
        }
        return null;
    }
}
