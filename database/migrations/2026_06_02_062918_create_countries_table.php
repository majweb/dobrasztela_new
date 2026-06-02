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
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('flag');
            $table->string('slug');
            $table->boolean('active')->default(1);
            $table->boolean('only_carriers')->default(0)->comment('Czy widoczne tylko w przewoznikacj');
            $table->boolean('both_type')->default(1)->comment('Czy widoczne 2 typy');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
