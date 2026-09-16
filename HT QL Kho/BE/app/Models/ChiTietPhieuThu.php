<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuThu extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuThu';
    protected $primaryKey = 'maChiTietThu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maChiTietThu',
        'maPhieuThu',
        'maDanhMucThu',
        'dienGiai',
        'soTien',
    ];

    public function phieuThu()
    {
        return $this->belongsTo(PhieuThu::class, 'maPhieuThu', 'maPhieuThu');
    }

    public function danhMucThu()
    {
        return $this->belongsTo(DanhMucThu::class, 'maDanhMucThu', 'maDanhMucThu');
    }
}
