<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuXuatSP extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuXuatSP';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuXuatSP',
        'maTonKho',
        'soLuong',
        'ghiChu',
    ];

    public function tonKho()
    {
        return $this->belongsTo(TonKho::class, 'maTonKho', 'maTonKho');
    }
}
