<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NguyenVatLieu extends Model
{
    use HasFactory;

    protected $table = 'NguyenVatLieu';
    protected $primaryKey = 'maNVL';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maNVL',
        'maLoaiNVL',
        'tenNVL',
        'donVi',
        'ghiChu',
    ];

    public function loaiNVL()
    {
        return $this->belongsTo(LoaiNVL::class, 'maLoaiNVL', 'maLoaiNVL');
    }

    public function tonKhos()
    {
        return $this->hasMany(TonKho::class, 'maNVL', 'maNVL');
    }
}
