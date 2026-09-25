<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    use HasFactory;

    protected $table = 'ThanhToan';
    protected $primaryKey = 'maThanhToan';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maThanhToan',
        'maCongNo',
        'ngayThanhToan',
        'phuongThuc',
    ];

    public function congNo()
    {
        return $this->belongsTo(CongNo::class, 'maCongNo', 'maCongNo');
    }

    public function phieuThu()
    {
        return $this->hasOne(PhieuThu::class, 'maThanhToan', 'maThanhToan');
    }
}
