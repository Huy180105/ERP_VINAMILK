<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HopDong extends Model
{
    use HasFactory;

    protected $table = 'HopDong';
    protected $primaryKey = 'maHopDong';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maHopDong',
        'maNV',
        'loaiHopDong',
        'ngayHieuLuc',
        'ngayHetHan',
        'mucLuongCoBan',
        'trangThai',
    ];

    protected $casts = [
        'mucLuongCoBan' => 'float',
        'ngayHieuLuc' => 'date',
        'ngayHetHan' => 'date',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }

    public function bangLuongs()
    {
        return $this->hasMany(BangLuong::class, 'maHopDong', 'maHopDong');
    }
}

