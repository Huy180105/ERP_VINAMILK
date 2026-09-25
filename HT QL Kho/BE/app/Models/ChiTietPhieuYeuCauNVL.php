<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietPhieuYeuCauNVL extends Model
{
    use HasFactory;

    protected $table = 'ChiTietPhieuYeuCauNVL';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maPhieuYCNVL',
        'maNVL',
        'soLuong',
    ];

    public function phieuYeuCau()
    {
        return $this->belongsTo(PhieuYeuCauNVL::class, 'maPhieuYCNVL', 'maPhieuYCNVL');
    }

    public function nguyenVatLieu()
    {
        return $this->belongsTo(NguyenVatLieu::class, 'maNVL', 'maNVL');
    }
}
