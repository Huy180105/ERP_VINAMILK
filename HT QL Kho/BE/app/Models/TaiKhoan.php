<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaiKhoan extends Model
{
    use HasFactory;

    protected $table = 'TaiKhoan';
    protected $primaryKey = 'maTaiKhoan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maTaiKhoan',
        'maNV',
        'matKhau',
        'vaiTro',
        'trangThai',
        'phaiDoiMatKhau',
    ];

    protected $hidden = [
        'matKhau',
    ];

    protected $casts = [
        'phaiDoiMatKhau' => 'boolean',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }
}
