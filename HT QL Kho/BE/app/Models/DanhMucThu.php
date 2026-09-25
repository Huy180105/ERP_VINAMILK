<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhMucThu extends Model
{
    use HasFactory;

    protected $table = 'DanhMucThu';
    protected $primaryKey = 'maDanhMucThu';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maDanhMucThu',
        'tenDanhMucThu',
        'moTa',
        'trangThai',
    ];

    public function chiTiets()
    {
        return $this->hasMany(ChiTietPhieuThu::class, 'maDanhMucThu', 'maDanhMucThu');
    }
}
