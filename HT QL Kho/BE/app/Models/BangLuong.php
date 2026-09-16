<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BangLuong extends Model
{
    use HasFactory;

    protected $table = 'BangLuong';
    protected $primaryKey = 'maBangLuong';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maBangLuong',
        'maNV',
        'maBangCong',
        'maHopDong',
        'thang',
        'thangNam',
        'tongThucNhan',
        'thucLanh',
        'trangThai',
    ];

    public function getThangNamAttribute()
    {
        return $this->attributes['thangNam'] ?? ($this->attributes['thang'] ?? null);
    }

    public function setThangNamAttribute($val)
    {
        $this->attributes['thangNam'] = $val;
        $this->attributes['thang'] = $val;
    }

    public function getThucLanhAttribute()
    {
        return $this->attributes['thucLanh'] ?? ($this->attributes['tongThucNhan'] ?? 0);
    }

    public function setThucLanhAttribute($val)
    {
        $this->attributes['thucLanh'] = $val;
        $this->attributes['tongThucNhan'] = $val;
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }

    public function phieuChis()
    {
        return $this->hasMany(PhieuChi::class, 'maBangLuong', 'maBangLuong');
    }
}
