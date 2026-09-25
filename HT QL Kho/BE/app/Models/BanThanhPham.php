<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BanThanhPham extends Model
{
    use HasFactory;

    protected $table = 'BanThanhPham';
    protected $primaryKey = 'maBTP';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maBTP',
        'tenBTP',
        'maCongDoan',
        'soLuong',
        'donVi',
        'trangThai',
        'ghiChu',
    ];

    public function congDoan()
    {
        return $this->belongsTo(CongDoan::class, 'maCongDoan', 'maCongDoan');
    }
}
