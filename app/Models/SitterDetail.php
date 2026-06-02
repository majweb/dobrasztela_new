<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SitterDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'firstName',
        'lastName',
        'phone',
        'de',
        'other',
        'region',
    ];

    protected $casts = [
        'other' => 'array',
    ];
}
