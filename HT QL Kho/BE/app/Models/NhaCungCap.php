<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhaCungCap extends Model
{
    use HasFactory;

    protected $table = 'NhaCungCap';
    protected $primaryKey = 'maNCC';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maNCC',
        'tenNCC',
        'maSoThue',
        'diaChi',
        'soDienThoai',
        'email',
    ];

    public function phieuNhapNVLs()
    {
        return $this->hasMany(PhieuNhapNVL::class, 'maNCC', 'maNCC');
    }
}
