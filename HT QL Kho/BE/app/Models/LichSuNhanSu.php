<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LichSuNhanSu extends Model
{
    use HasFactory;

    protected $table = 'LichSuNhanSu';
    public $timestamps = false;

    protected $fillable = [
        'maNV',
        'loaiThayDoi',
        'noiDung',
        'nguoiThucHien',
        'ngayTao',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'maNV', 'maNV');
    }
}

