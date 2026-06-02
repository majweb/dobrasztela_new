<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarrierCard extends Model
{
    protected $fillable = [
        'active',
        'user_id',
        'name',
        'slug',
        'fileuploadCard',
        'companyAddressStreet',
        'companyAddressPostalCode',
        'companyAddressPlace',
        'companyAddressCountry',
        'companyEmail',
        'companyWebsite',
        'buyTicketWebsite',
        'companyMobile1',
        'companyMobile',
        'teaser',
        'description',
        'fb_shearer_link',
        'preferImage',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
