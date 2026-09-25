<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChucVu extends Model
{
    use HasFactory;

    protected $table = 'ChucVu';
    protected $primaryKey = 'maChucVu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maChucVu',
        'tenChucVu',
        'phuCap',
    ];

    protected $casts = [
        'phuCap' => 'float',
    ];

    public function nhanViens()
    {
        return $this->hasMany(NhanVien::class, 'maChucVu', 'maChucVu');
    }
}

