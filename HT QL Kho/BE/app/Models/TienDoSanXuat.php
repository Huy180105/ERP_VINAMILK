<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TienDoSanXuat extends Model
{
    use HasFactory;

    protected $table = 'TienDoSanXuat';
    protected $primaryKey = 'maTienDoSX';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maTienDoSX',
        'maCongDoan',
        'maLenh',
        'maNhanVien',
        'ngaySX',
    ];

    public function lenhSanXuat()
    {
        return $this->belongsTo(LenhSanXuat::class, 'maLenh', 'maLenh');
    }

    public function congDoan()
    {
        return $this->belongsTo(CongDoan::class, 'maCongDoan', 'maCongDoan');
    }

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNhanVien', 'maNV');
    }

    public function chiTiets()
    {
        return $this->hasMany(ChiTietTienDoSanXuat::class, 'maTienDoSX', 'maTienDoSX');
    }
}
