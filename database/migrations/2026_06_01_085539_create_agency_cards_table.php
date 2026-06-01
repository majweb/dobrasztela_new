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
        Schema::create('agency_cards', function (Blueprint $table) {
            $table->id();
            $table->boolean('active')->default(1);
            $table->unsignedBigInteger('user_id');
            $table->string('name')->nullable();
            $table->string('slug')->nullable();
            $table->string('fileuploadCard')->nullable();
            $table->string('companyAddressStreet')->nullable();
            $table->string('companyAddressPostalCode')->nullable();
            $table->string('companyAddressPlace')->nullable();
            $table->string('companyAddressCountry')->nullable();
            $table->string('companyEmail')->nullable();
            $table->string('companyEmailApplication')->nullable();
            $table->string('companyWebsite')->nullable();
            $table->string('companyMobile1')->nullable();
            $table->string('companyMobile2')->nullable();
            $table->string('companyMobile3')->nullable();
            $table->string('companyPhone1')->nullable();
            $table->string('companyPhone2')->nullable();
            $table->string('companyPhone3')->nullable();
            $table->text('teaser')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agency_cards');
    }
};
