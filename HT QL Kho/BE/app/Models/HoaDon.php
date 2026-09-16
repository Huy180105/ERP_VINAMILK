<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HoaDon extends Model
{
    use HasFactory;

    protected $table = 'HoaDon';
    protected $primaryKey = 'maHoaDon';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'maHoaDon',
        'ngayLap',
        'tongTien',
        'maGiaoHang',
    ];

    public function congNos()
    {
        return $this->hasMany(CongNo::class, 'maHoaDon', 'maHoaDon');
    }
}
