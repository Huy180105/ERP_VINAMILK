<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuXuatNVL extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuXuatNVL';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuXuatNVL',
        'maTonKho',
        'soLuong',
        'ghiChu',
    ];

    public function tonKho()
    {
        return $this->belongsTo(TonKho::class, 'maTonKho', 'maTonKho');
    }
}
