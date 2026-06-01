<?php

use App\Actions\Fortify\CreateNewUser;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('register/validate-step-1', [CreateNewUser::class, 'validateStepOne'])
    ->name('register.validate-step-1');

require __DIR__.'/settings.php';
