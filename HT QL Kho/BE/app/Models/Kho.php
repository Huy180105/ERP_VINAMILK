<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kho extends Model
{
    use HasFactory;

    protected  = 'Kho';
    protected  = 'maKho';
    public  = false;
    protected  = 'string';
    public  = false;

    protected  = [
        'maKho',
        'tenKho',
        'diaChi',
    ];
}