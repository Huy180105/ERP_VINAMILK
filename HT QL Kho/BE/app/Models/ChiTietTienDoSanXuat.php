<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietTienDoSanXuat extends Model
{
    use HasFactory;

    protected $table = 'ChiTietTienDoSanXuat';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'maTienDoSX',
        'maBTP',
        'soLuong',
        'trangThai',
    ];

    public function tienDoSanXuat()
    {
        return $this->belongsTo(TienDoSanXuat::class, 'maTienDoSX', 'maTienDoSX');
    }

    public function banThanhPham()
    {
        return $this->belongsTo(BanThanhPham::class, 'maBTP', 'maBTP');
    }
}
