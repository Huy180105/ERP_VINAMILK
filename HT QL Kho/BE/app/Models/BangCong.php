<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BangCong extends Model
{
    use HasFactory;

    protected $table = 'BangCong';
    protected $primaryKey = 'maBangCong';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maBangCong',
        'maNV',
        'thang',
        'soNgayCong',
        'soGioTangCa',
        'soNgayNghiPhep',
        'trangThai',
        'lyDoGiaiTrinh',
    ];

    protected $casts = [
        'soNgayCong' => 'integer',
        'soGioTangCa' => 'float',
        'soNgayNghiPhep' => 'integer',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }

    public function bangLuongs()
    {
        return $this->hasMany(BangLuong::class, 'maBangCong', 'maBangCong');
    }
}
