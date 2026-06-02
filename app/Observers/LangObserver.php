<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class LangObserver
{
    public function saved(): void
    {
        Cache::forget('register_langs');
    }

    public function deleted(): void
    {
        Cache::forget('register_langs');
    }
}
