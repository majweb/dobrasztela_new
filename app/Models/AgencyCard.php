<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyCard extends Model
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
        'companyEmailApplication',
        'companyWebsite',
        'companyMobile1',
        'companyMobile2',
        'companyMobile3',
        'companyPhone1',
        'companyPhone2',
        'companyPhone3',
        'teaser',
        'description',
        'preferImage',
        'accepted',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
