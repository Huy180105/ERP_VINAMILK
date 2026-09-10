<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhoNguyenVatLieu extends Model
{
    use HasFactory;

    protected $table = 'KhoNguyenVatLieu';
    protected $primaryKey = 'maKhoNVL';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maKhoNVL',
        'maTonKho',
        'tinhTrangKhoNVL',
        'ghiChu',
    ];

    public function tonKho()
    {
        return $this->belongsTo(TonKho::class, 'maTonKho', 'maTonKho');
    }
}
