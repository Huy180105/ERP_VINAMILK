<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoaiNVL extends Model
{
    use HasFactory;

    protected $table = 'LoaiNVL';
    protected $primaryKey = 'maLoaiNVL';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maLoaiNVL',
        'tenLoaiNVL',
        'ghiChu',
    ];

    public function nguyenVatLieus()
    {
        return $this->hasMany(NguyenVatLieu::class, 'maLoaiNVL', 'maLoaiNVL');
    }
}
