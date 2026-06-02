<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('langs', function (Blueprint $table) {
            $table->id();
            $table->string('lang');
            $table->string('slug');
            $table->timestamps();
        });

        Schema::create('lang_levels', function (Blueprint $table) {
            $table->id();
            $table->string('level');
            $table->string('slug');
            $table->timestamps();
        });

        Schema::create('lands', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('country_id')->nullable();
            $table->string('name');
            $table->string('slug');
            $table->boolean('polish')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lands');
        Schema::dropIfExists('lang_levels');
        Schema::dropIfExists('langs');
    }
};
