<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuChi extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuChi';
    protected $primaryKey = 'maChiTietChi';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maChiTietChi',
        'maPhieuChi',
        'maDanhMucChi',
        'dienGiai',
        'soTien',
    ];

    public function phieuChi()
    {
        return $this->belongsTo(PhieuChi::class, 'maPhieuChi', 'maPhieuChi');
    }

    public function danhMucChi()
    {
        return $this->belongsTo(DanhMucChi::class, 'maDanhMucChi', 'maDanhMucChi');
    }
}
