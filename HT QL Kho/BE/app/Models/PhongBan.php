<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhongBan extends Model
{
    use HasFactory;

    protected $table = 'PhongBan';
    protected $primaryKey = 'maPhongBan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maPhongBan',
        'tenPhongBan',
    ];

    public function nhanViens()
    {
        return $this->hasMany(NhanVien::class, 'maPhongBan', 'maPhongBan');
    }
}
