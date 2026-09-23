<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kho extends Model
{
    use HasFactory;

    protected $table = 'Kho';
    protected $primaryKey = 'maKho';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maKho',
        'tenKho',
        'loaiKho',
        'diaChi',
    ];

    public function tonKhos()
    {
        return $this->hasMany(TonKho::class, 'maKho', 'maKho');
    }
}