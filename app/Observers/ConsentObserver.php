<?php

namespace App\Observers;

use App\Models\Consent;
use Illuminate\Support\Facades\Cache;

class ConsentObserver
{
    public function saved(Consent $consent): void
    {
        $this->clearCache($consent);
    }

    public function deleted(Consent $consent): void
    {
        $this->clearCache($consent);
    }

    private function clearCache(Consent $consent): void
    {
        Cache::forget('register_consents');
        Cache::forget("required_consents_{$consent->type}");
    }
}
