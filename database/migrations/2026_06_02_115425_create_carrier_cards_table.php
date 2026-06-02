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
        Schema::create('carrier_cards', function (Blueprint $table) {
            $table->id();
            $table->boolean('active')->default(1);
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('name')->nullable();
            $table->string('fileuploadCard')->nullable();
            $table->string('companyAddressStreet')->nullable();
            $table->string('companyAddressPostalCode')->nullable();
            $table->string('companyAddressPlace')->nullable();
            $table->string('companyAddressCountry')->nullable();
            $table->string('companyEmail')->nullable();
            $table->string('companyWebsite')->nullable();
            $table->string('buyTicketWebsite')->nullable();
            $table->string('companyMobile1')->nullable();
            $table->text('teaser')->nullable();
            $table->text('description')->nullable();
            $table->string('fb_shearer_link')->nullable();
            $table->string('slug', 100);
            $table->string('preferImage')->comment('Zdjęcie preferowany pracodawca')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carrier_cards');
    }
};
