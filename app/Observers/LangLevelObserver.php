<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class LangLevelObserver
{
    public function saved(): void
    {
        Cache::forget('register_lang_levels');
    }

    public function deleted(): void
    {
        Cache::forget('register_lang_levels');
    }
}
