<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class LandObserver
{
    public function saved(): void
    {
        Cache::forget('register_lands');
    }

    public function deleted(): void
    {
        Cache::forget('register_lands');
    }
}
