<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    protected $guarded = [];

    public function offert()
    {
        return $this->belongsTo(Offert::class);
    }

    public function lands()
    {
        return $this->hasMany(Land::class);
    }
}
