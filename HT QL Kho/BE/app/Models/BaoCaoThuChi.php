<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BaoCaoThuChi extends Model
{
    use HasFactory;

    protected $table = 'BaoCaoThuChi';
    protected $primaryKey = 'maBaoCao';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maBaoCao',
        'loaiBaoCao',
        'tuNgay',
        'denNgay',
        'ngayLap',
        'nguoiLap',
    ];

    public function nhanVien()
    {
        return $this->belongsTo(NhanVien::class, 'nguoiLap', 'maNV');
    }
}
