<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TonKho extends Model
{
    use HasFactory;

    protected $table = 'TonKho';
    protected $primaryKey = 'maTonKho';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maTonKho',
        'tenTonKho',
        'maKho',
        'maSanPham',
        'maNVL',
        'ngaySanXuat',
        'hanSuDung',
        'soLuongNhap',
        'soLuongTonHienTai',
        'dungTichDonVi',
        'donViDoLuong',
        'soLuongDongGoi',
        'tongDungTichQuyDoi',
        'trangThaiHSD',
        'trangThaiChatLuong',
        'trangThai',
        'ghiChu',
        'maChiTietPhieuNhapSP',
    ];

    protected $appends = [
        'donViLoai',
        'tongDungTichTinhToan',
        'chuoiQuyDoi',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $qty = (float) ($model->soLuongTonHienTai ?? 0);
            $pack = (int) ($model->soLuongDongGoi ?? 1);
            $vol = (float) ($model->dungTichDonVi ?? 1);
            $model->tongDungTichQuyDoi = round($qty * $pack * $vol, 2);
        });
    }

    public function getDonViLoaiAttribute()
    {
        if ($this->sanPham) {
            return $this->sanPham->donViTinh ?? 'Thùng';
        }
        if ($this->nguyenVatLieu) {
            return $this->nguyenVatLieu->donVi ?? 'Đơn vị';
        }
        return 'Đơn vị';
    }

    public function getTongDungTichTinhToanAttribute()
    {
        $qty = (float) ($this->soLuongTonHienTai ?? 0);
        $pack = (int) ($this->soLuongDongGoi ?? 1);
        $vol = (float) ($this->dungTichDonVi ?? 1);
        return round($qty * $pack * $vol, 2);
    }

    public function getChuoiQuyDoiAttribute()
    {
        $qty = (float) ($this->soLuongTonHienTai ?? 0);
        $pack = (int) ($this->soLuongDongGoi ?? 1);
        $vol = (float) ($this->dungTichDonVi ?? 1);
        $unit = $this->donViDoLuong ?? 'ml';
        $donViBanDau = $this->donViLoai;
        $total = round($qty * $pack * $vol, 2);

        if ($pack > 1) {
            return "{$qty} {$donViBanDau} ({$pack} đơn vị x {$vol} {$unit}) = {$total} {$unit}";
        }
        return "{$qty} {$donViBanDau} (1 x {$vol} {$unit}) = {$total} {$unit}";
    }

    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'maSanPham', 'maSanPham');
    }

    public function nguyenVatLieu()
    {
        return $this->belongsTo(NguyenVatLieu::class, 'maNVL', 'maNVL');
    }

    public function kho()
    {
        return $this->belongsTo(Kho::class, 'maKho', 'maKho');
    }
}
