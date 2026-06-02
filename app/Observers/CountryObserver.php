<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class CountryObserver
{
    public function saved(): void
    {
        Cache::forget('register_countries');
    }

    public function deleted(): void
    {
        Cache::forget('register_countries');
    }
}
