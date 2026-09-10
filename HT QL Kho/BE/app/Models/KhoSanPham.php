<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhoSanPham extends Model
{
    use HasFactory;

    protected $table = 'KhoSanPham';
    protected $primaryKey = 'maKhoSP';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maKhoSP',
        'maTonKho',
        'tinhTrangKhoSP',
        'ghiChu',
    ];

    public function tonKho()
    {
        return $this->belongsTo(TonKho::class, 'maTonKho', 'maTonKho');
    }
}
