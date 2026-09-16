<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuYeuCauBTP extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuYeuCauBTP';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuYCBTP',
        'maBTP',
        'tenBTP',
        'soLuong',
    ];

    public function phieuYeuCau()
    {
        return $this->belongsTo(PhieuYeuCauBTP::class, 'maPhieuYCBTP', 'maPhieuYCBTP');
    }

    public function banThanhPham()
    {
        return $this->belongsTo(BanThanhPham::class, 'maBTP', 'maBTP');
    }
}
