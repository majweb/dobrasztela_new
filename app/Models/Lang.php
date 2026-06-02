<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lang extends Model
{
    protected $guarded = [];

    public function scopeGetOne($query, $id)
    {
        return $query->where('id', $id)->first()->id;
    }
}
