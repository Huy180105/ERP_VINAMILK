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
        'luongCoBan',
        'phuCap',
        'luongTangCa',
        'khauTru',
        'tongThucNhan',
        'trangThai',
        'nguoiSua',
        'lyDoSua',
    ];

    protected $casts = [
        'luongCoBan' => 'float',
        'phuCap' => 'float',
        'luongTangCa' => 'float',
        'khauTru' => 'float',
        'tongThucNhan' => 'float',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }

    public function bangCong()
    {
        return $this->belongsTo(BangCong::class, 'maBangCong', 'maBangCong');
    }

    public function hopDong()
    {
        return $this->belongsTo(HopDong::class, 'maHopDong', 'maHopDong');
    }

    public function phieuChis()
    {
        return $this->hasMany(PhieuChi::class, 'maBangLuong', 'maBangLuong');
    }
}
