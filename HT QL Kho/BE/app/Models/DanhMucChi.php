<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhMucChi extends Model
{
    use HasFactory;

    protected $table = 'DanhMucChi';
    protected $primaryKey = 'maDanhMucChi';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maDanhMucChi',
        'tenDanhMucChi',
        'moTa',
        'trangThai',
    ];

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuChi::class, 'maDanhMucChi', 'maDanhMucChi');
    }
}
