<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyDetail extends Model
{
    protected $fillable = [
        'user_id',
        'firstName',
        'lastName',
        'phone',
        'invoiceName',
        'invoiceNip',
        'invoiceRegon',
        'invoiceAddressStreet',
        'invoiceAddressPostalCode',
        'invoiceAddressPlace',
        'invoiceAddressCountry',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
