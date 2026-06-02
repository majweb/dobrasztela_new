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
        'photo',
        'files',
        'experience',
        'driveLicense',
        'expectations',
        'otherpeople',
        'internet',
        'tv',
        'animals',
        'smoking',
        'agreement',
        'zus',
        'payment',
        'bonus',
        'daysoff',
        'time',
        'when',
        'drive',
    ];

    protected $casts = [
        'other' => 'array',
        'files' => 'array',
    ];
}
